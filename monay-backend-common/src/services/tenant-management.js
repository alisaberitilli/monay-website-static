import { Pool } from 'pg';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class TenantManagementService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Create a new tenant with vault isolation
   * @param {Object} tenantData - Tenant creation data
   * @returns {Object} Created tenant with keys
   */
  async createTenant(tenantData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate tenant code
      const tenantCode = this.generateTenantCode(tenantData.type);

      // Generate HD wallet derivation path
      const tenantIndex = Math.floor(Math.random() * 2147483647); // BIP-44 hardened key range
      const derivationPath = `m/44'/501'/${tenantIndex}'/0'/0`;

      // Generate vault encryption key
      const vaultKey = crypto.randomBytes(32).toString('hex');

      // Create the tenant
      const createTenantQuery = `
        INSERT INTO tenants (
          tenant_code,
          name,
          type,
          isolation_level,
          billing_tier,
          metadata,
          wallet_derivation_path,
          status,
          gross_margin_percent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const isolationLevel = this.determineIsolationLevel(tenantData.type);
      const billingTier = this.determineBillingTier(tenantData.type);
      const grossMargin = this.determineGrossMargin(billingTier);

      const result = await client.query(createTenantQuery, [
        tenantCode,
        tenantData.name,
        tenantData.type,
        isolationLevel,
        billingTier,
        tenantData.metadata || {},
        derivationPath,
        'active',
        grossMargin
      ]);

      const tenant = result.rows[0];

      // Store vault key in tenant_keys table
      const keyQuery = `
        INSERT INTO tenant_keys (
          tenant_id,
          key_type,
          key_value,
          key_metadata,
          is_active
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      await client.query(keyQuery, [
        tenant.id,
        'vault_master',
        vaultKey,
        { algorithm: 'AES-256-GCM', purpose: 'vault_encryption' },
        true
      ]);

      // Create initial features for the tenant
      await this.createDefaultFeatures(client, tenant.id, billingTier);

      // Initialize billing metrics
      await this.initializeBillingMetrics(client, tenant.id);

      await client.query('COMMIT');

      return {
        ...tenant,
        vault_key: vaultKey // Return only on creation, never store in plain text
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get tenant by ID or code
   * @param {String} identifier - Tenant ID (UUID) or tenant code
   * @returns {Object} Tenant data
   */
  async getTenant(identifier) {
    const query = `
      SELECT
        t.*,
        COUNT(DISTINCT tm.user_id) as member_count,
        MAX(tm.updated_at) as last_activity,
        COALESCE(bm.transaction_count, 0) as current_month_transactions,
        COALESCE(bm.transaction_volume_cents, 0) as current_month_volume_cents
      FROM tenants t
      LEFT JOIN tenant_members tm ON t.id = tm.tenant_id
      LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
        AND bm.period_start = date_trunc('month', CURRENT_DATE)
      WHERE t.id = $1::uuid OR t.tenant_code = $1
      GROUP BY t.id, bm.transaction_count, bm.transaction_volume_cents
    `;

    const result = await this.pool.query(query, [identifier]);
    return result.rows[0];
  }

  /**
   * Update tenant configuration
   * @param {String} tenantId - Tenant ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated tenant
   */
  async updateTenant(tenantId, updates) {
    const allowedFields = ['name', 'metadata', 'billing_tier', 'status', 'settings'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(tenantId);

    const query = `
      UPDATE tenants
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);

    // If billing tier changed, update features
    if (updates.billing_tier) {
      await this.updateTenantFeatures(tenantId, updates.billing_tier);
    }

    return result.rows[0];
  }

  /**
   * Add user to tenant
   * @param {String} tenantId - Tenant ID
   * @param {String} userId - User ID
   * @param {String} role - User role in tenant
   * @returns {Object} Tenant member record
   */
  async addTenantMember(tenantId, userId, role = 'member') {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user is already in another tenant (for non-individual types)
      const existingQuery = `
        SELECT tm.*, t.type
        FROM tenant_members tm
        JOIN tenants t ON tm.tenant_id = t.id
        WHERE tm.user_id = $1 AND tm.is_active = true
      `;

      const existing = await client.query(existingQuery, [userId]);

      if (existing.rows.length > 0) {
        const currentTenant = existing.rows[0];
        if (currentTenant.type !== 'individual') {
          throw new Error(`User already belongs to tenant: ${currentTenant.tenant_id}`);
        }
      }

      // Add user to tenant
      const insertQuery = `
        INSERT INTO tenant_members (
          tenant_id,
          user_id,
          role,
          permissions,
          is_active
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const permissions = this.getDefaultPermissions(role);

      const result = await client.query(insertQuery, [
        tenantId,
        userId,
        role,
        permissions,
        true
      ]);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate tenant-specific API keys
   * @param {String} tenantId - Tenant ID
   * @param {String} keyType - Type of API key
   * @returns {Object} Generated API key
   */
  async generateAPIKey(tenantId, keyType = 'api_key') {
    const apiKey = `mk_${keyType}_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const query = `
      INSERT INTO tenant_keys (
        tenant_id,
        key_type,
        key_value,
        key_metadata,
        is_active
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, key_type, created_at
    `;

    const result = await this.pool.query(query, [
      tenantId,
      keyType,
      hashedKey,
      {
        prefix: apiKey.substring(0, 10),
        last_four: apiKey.slice(-4)
      },
      true
    ]);

    return {
      ...result.rows[0],
      api_key: apiKey // Return full key only once
    };
  }

  /**
   * Verify tenant API key
   * @param {String} apiKey - API key to verify
   * @returns {Object} Tenant if valid, null otherwise
   */
  async verifyAPIKey(apiKey) {
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const query = `
      SELECT t.*, tk.key_type, tk.key_metadata
      FROM tenant_keys tk
      JOIN tenants t ON tk.tenant_id = t.id
      WHERE tk.key_value = $1
        AND tk.is_active = true
        AND t.status = 'active'
    `;

    const result = await this.pool.query(query, [hashedKey]);
    return result.rows[0] || null;
  }

  /**
   * Get tenant usage metrics
   * @param {String} tenantId - Tenant ID
   * @param {Date} startDate - Start date for metrics
   * @param {Date} endDate - End date for metrics
   * @returns {Object} Usage metrics
   */
  async getTenantMetrics(tenantId, startDate = null, endDate = null) {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    const query = `
      SELECT
        bm.*,
        btc.monthly_base_fee_cents,
        btc.included_transactions,
        btc.overage_transaction_price_cents,
        btc.included_computation_units,
        btc.overage_computation_price_cents
      FROM billing_metrics bm
      JOIN tenants t ON bm.tenant_id = t.id
      JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
      WHERE bm.tenant_id = $1
        AND bm.period_start >= $2
        AND bm.period_end <= $3
      ORDER BY bm.period_start DESC
    `;

    const result = await this.pool.query(query, [tenantId, start, end]);

    // Calculate costs
    const metrics = result.rows.map(row => {
      const transactionOverage = Math.max(0, row.transaction_count - row.included_transactions);
      const computationOverage = Math.max(0, row.computation_units_used - row.included_computation_units);

      const baseCost = row.monthly_base_fee_cents;
      const transactionCost = transactionOverage * row.overage_transaction_price_cents;
      const computationCost = computationOverage * row.overage_computation_price_cents;
      const totalCost = baseCost + transactionCost + computationCost;

      // Apply USDXM discount if applicable
      const finalCost = row.payment_method === 'USDXM' ? totalCost * 0.9 : totalCost;

      return {
        ...row,
        transaction_overage: transactionOverage,
        computation_overage: computationOverage,
        base_cost_cents: baseCost,
        transaction_cost_cents: transactionCost,
        computation_cost_cents: computationCost,
        total_cost_cents: totalCost,
        final_cost_cents: Math.round(finalCost)
      };
    });

    return metrics;
  }

  // Helper methods

  generateTenantCode(type) {
    const prefix = {
      individual: 'IND',
      household_member: 'HHM',
      small_business: 'SMB',
      enterprise: 'ENT',
      holding_company: 'HLD'
    }[type] || 'TNT';

    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }

  determineIsolationLevel(type) {
    switch(type) {
      case 'enterprise':
      case 'holding_company':
        return 'schema'; // Can upgrade to database if needed
      case 'small_business':
        return 'group';
      default:
        return 'row';
    }
  }

  determineBillingTier(type) {
    switch(type) {
      case 'enterprise':
        return 'enterprise';
      case 'holding_company':
        return 'enterprise';
      case 'small_business':
        return 'small_business';
      case 'household_member':
        return 'free'; // Billed through household primary
      default:
        return 'free';
    }
  }

  determineGrossMargin(tier) {
    const margins = {
      'free': 0,
      'small_business': 60,
      'enterprise': 80
    };
    return margins[tier] || 60;
  }

  getDefaultPermissions(role) {
    const permissions = {
      owner: ['*'],
      admin: ['read', 'write', 'delete', 'invite', 'billing'],
      member: ['read', 'write'],
      viewer: ['read'],
      billing: ['read', 'billing']
    };
    return permissions[role] || ['read'];
  }

  async createDefaultFeatures(client, tenantId, tier) {
    const features = {
      free: {
        max_users: 1,
        max_transactions_per_month: 100,
        api_access: false,
        custom_branding: false,
        priority_support: false
      },
      small_business: {
        max_users: 10,
        max_transactions_per_month: 5000,
        api_access: true,
        custom_branding: false,
        priority_support: false
      },
      enterprise: {
        max_users: -1, // unlimited
        max_transactions_per_month: -1,
        api_access: true,
        custom_branding: true,
        priority_support: true
      }
    };

    const tenantFeatures = features[tier] || features.free;

    for (const [feature, value] of Object.entries(tenantFeatures)) {
      await client.query(
        `INSERT INTO tenant_features (tenant_id, feature_name, feature_value, is_enabled)
         VALUES ($1, $2, $3, $4)`,
        [tenantId, feature, value.toString(), true]
      );
    }
  }

  async initializeBillingMetrics(client, tenantId) {
    const query = `
      INSERT INTO billing_metrics (
        tenant_id,
        period_start,
        period_end,
        transaction_count,
        transaction_volume_cents,
        computation_units_used,
        storage_gb_used,
        api_calls,
        payment_method
      ) VALUES ($1, $2, $3, 0, 0, 0, 0, 0, 'USDXM')
    `;

    const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    await client.query(query, [tenantId, periodStart, periodEnd]);
  }

  async updateTenantFeatures(tenantId, newTier) {
    // Implementation would update features based on new tier
    // This is a placeholder for the actual implementation
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete old features
      await client.query('DELETE FROM tenant_features WHERE tenant_id = $1', [tenantId]);

      // Create new features
      await this.createDefaultFeatures(client, tenantId, newTier);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default TenantManagementService;