import { Pool } from 'pg';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class GroupManagementService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Create a new group (household or holding company)
   * @param {Object} groupData - Group creation data
   * @returns {Object} Created group
   */
  async createGroup(groupData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate group code
      const groupCode = this.generateGroupCode(groupData.group_type);

      // Set default configuration based on group type
      const configuration = this.getDefaultConfiguration(groupData.group_type, groupData.configuration);

      // Create the group
      const createGroupQuery = `
        INSERT INTO groups (
          group_code,
          group_name,
          group_type,
          primary_tenant_id,
          metadata,
          configuration,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await client.query(createGroupQuery, [
        groupCode,
        groupData.group_name,
        groupData.group_type,
        groupData.primary_tenant_id,
        groupData.metadata || {},
        configuration,
        'active'
      ]);

      const group = result.rows[0];

      // Add primary tenant as first member with 'primary' role
      await this.addGroupMember(client, group.id, groupData.primary_tenant_id, 'primary', 100);

      // Initialize group treasury if enabled
      if (configuration.shared_treasury) {
        await this.initializeGroupTreasury(client, group.id);
      }

      // Initialize group billing if aggregated
      if (configuration.aggregate_billing) {
        await this.initializeGroupBilling(client, group.id);
      }

      await client.query('COMMIT');
      return group;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add a tenant to a group
   * @param {String} groupId - Group ID
   * @param {String} tenantId - Tenant ID to add
   * @param {String} role - Role in group (member, admin, primary)
   * @param {Number} ownershipPercent - Ownership percentage (for holding companies)
   * @returns {Object} Group member record
   */
  async addTenantToGroup(groupId, tenantId, role = 'member', ownershipPercent = 0) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify group exists and is active
      const groupQuery = `
        SELECT * FROM groups WHERE id = $1 AND status = 'active'
      `;
      const groupResult = await client.query(groupQuery, [groupId]);

      if (groupResult.rows.length === 0) {
        throw new Error('Group not found or inactive');
      }

      const group = groupResult.rows[0];

      // Check if tenant is already in a group of the same type
      const existingGroupQuery = `
        SELECT gm.*, g.group_type
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.tenant_id = $1 AND g.group_type = $2 AND gm.is_active = true
      `;
      const existingGroup = await client.query(existingGroupQuery, [tenantId, group.group_type]);

      if (existingGroup.rows.length > 0) {
        throw new Error(`Tenant already belongs to a ${group.group_type}`);
      }

      // Add tenant to group
      const result = await this.addGroupMember(client, groupId, tenantId, role, ownershipPercent);

      // Update tenant's billing configuration if this is a household
      if (group.group_type === 'household' && role !== 'primary') {
        await this.updateTenantBillingToGroup(client, tenantId, groupId);
      }

      await client.query('COMMIT');
      return result;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Remove a tenant from a group
   * @param {String} groupId - Group ID
   * @param {String} tenantId - Tenant ID to remove
   * @returns {Boolean} Success status
   */
  async removeTenantFromGroup(groupId, tenantId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if this is the primary tenant
      const groupQuery = `
        SELECT primary_tenant_id FROM groups WHERE id = $1
      `;
      const groupResult = await client.query(groupQuery, [groupId]);

      if (groupResult.rows.length > 0 && groupResult.rows[0].primary_tenant_id === tenantId) {
        throw new Error('Cannot remove primary tenant from group');
      }

      // Deactivate membership
      const removeQuery = `
        UPDATE group_members
        SET is_active = false,
            left_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE group_id = $1 AND tenant_id = $2 AND is_active = true
        RETURNING *
      `;

      const result = await client.query(removeQuery, [groupId, tenantId]);

      if (result.rows.length === 0) {
        throw new Error('Tenant not found in group');
      }

      // Reset tenant billing if needed
      await this.resetTenantBilling(client, tenantId);

      await client.query('COMMIT');
      return true;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get group with members and treasury
   * @param {String} groupId - Group ID or group code
   * @returns {Object} Group with full details
   */
  async getGroup(groupId) {
    // Get group details
    const groupQuery = `
      SELECT
        g.*,
        t.name as primary_tenant_name,
        COUNT(DISTINCT gm.tenant_id) as member_count,
        SUM(CASE WHEN gm.role = 'primary' THEN gm.ownership_percent ELSE 0 END) as primary_ownership
      FROM groups g
      LEFT JOIN tenants t ON g.primary_tenant_id = t.id
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.is_active = true
      WHERE g.id = $1::uuid OR g.group_code = $1
      GROUP BY g.id, t.name
    `;

    const groupResult = await this.pool.query(groupQuery, [groupId]);

    if (groupResult.rows.length === 0) {
      return null;
    }

    const group = groupResult.rows[0];

    // Get members
    const membersQuery = `
      SELECT
        gm.*,
        t.name as tenant_name,
        t.tenant_code,
        t.type as tenant_type,
        t.billing_tier
      FROM group_members gm
      JOIN tenants t ON gm.tenant_id = t.id
      WHERE gm.group_id = $1 AND gm.is_active = true
      ORDER BY gm.role = 'primary' DESC, gm.joined_at ASC
    `;

    const membersResult = await this.pool.query(membersQuery, [group.id]);

    // Get treasury if exists
    let treasury = null;
    if (group.configuration?.shared_treasury) {
      const treasuryQuery = `
        SELECT
          gt.*,
          COUNT(DISTINCT gta.id) as allocation_count
        FROM group_treasury gt
        LEFT JOIN group_treasury_allocations gta ON gt.id = gta.treasury_id
        WHERE gt.group_id = $1
        GROUP BY gt.id
      `;

      const treasuryResult = await this.pool.query(treasuryQuery, [group.id]);
      treasury = treasuryResult.rows[0] || null;
    }

    // Get billing summary
    const billingQuery = `
      SELECT
        SUM(bm.transaction_count) as total_transactions,
        SUM(bm.transaction_volume_cents) as total_volume_cents,
        SUM(bm.computation_units_used) as total_computation_units,
        MAX(bm.period_end) as current_period_end
      FROM billing_metrics bm
      JOIN group_members gm ON bm.tenant_id = gm.tenant_id
      WHERE gm.group_id = $1
        AND gm.is_active = true
        AND bm.period_start = date_trunc('month', CURRENT_DATE)
    `;

    const billingResult = await this.pool.query(billingQuery, [group.id]);

    return {
      ...group,
      members: membersResult.rows,
      treasury: treasury,
      billing_summary: billingResult.rows[0]
    };
  }

  /**
   * Update group configuration
   * @param {String} groupId - Group ID
   * @param {Object} updates - Configuration updates
   * @returns {Object} Updated group
   */
  async updateGroupConfiguration(groupId, updates) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get current configuration
      const currentQuery = `
        SELECT configuration FROM groups WHERE id = $1
      `;
      const currentResult = await client.query(currentQuery, [groupId]);

      if (currentResult.rows.length === 0) {
        throw new Error('Group not found');
      }

      const currentConfig = currentResult.rows[0].configuration;
      const newConfig = { ...currentConfig, ...updates };

      // Update configuration
      const updateQuery = `
        UPDATE groups
        SET configuration = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await client.query(updateQuery, [newConfig, groupId]);

      // Handle treasury changes
      if (updates.shared_treasury !== undefined) {
        if (updates.shared_treasury && !currentConfig.shared_treasury) {
          // Enable treasury
          await this.initializeGroupTreasury(client, groupId);
        } else if (!updates.shared_treasury && currentConfig.shared_treasury) {
          // Disable treasury (mark as inactive)
          await client.query(
            'UPDATE group_treasury SET is_active = false WHERE group_id = $1',
            [groupId]
          );
        }
      }

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
   * Process group billing aggregation
   * @param {String} groupId - Group ID
   * @returns {Object} Aggregated billing data
   */
  async processGroupBilling(groupId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get group configuration
      const groupQuery = `
        SELECT * FROM groups WHERE id = $1 AND status = 'active'
      `;
      const groupResult = await client.query(groupQuery, [groupId]);

      if (groupResult.rows.length === 0) {
        throw new Error('Group not found');
      }

      const group = groupResult.rows[0];
      const config = group.configuration;

      // Get all member billing for current period
      const billingQuery = `
        SELECT
          bm.*,
          gm.tenant_id,
          gm.role,
          t.billing_tier
        FROM billing_metrics bm
        JOIN group_members gm ON bm.tenant_id = gm.tenant_id
        JOIN tenants t ON gm.tenant_id = t.id
        WHERE gm.group_id = $1
          AND gm.is_active = true
          AND bm.period_start = date_trunc('month', CURRENT_DATE)
      `;

      const billingResult = await client.query(billingQuery, [groupId]);

      // Calculate aggregated costs
      let totalTransactions = 0;
      let totalVolume = 0;
      let totalComputationUnits = 0;
      let totalCost = 0;

      for (const member of billingResult.rows) {
        totalTransactions += member.transaction_count;
        totalVolume += member.transaction_volume_cents;
        totalComputationUnits += member.computation_units_used;
      }

      // Determine billing responsibility
      let billingTenantId = group.primary_tenant_id;

      if (config.billing_split && !config.primary_pays_all) {
        // Split billing among members (future implementation)
        // For now, primary still pays
      }

      // Create or update group billing record
      const groupBillingQuery = `
        INSERT INTO group_billing_aggregation (
          group_id,
          period_start,
          period_end,
          total_transaction_count,
          total_transaction_volume_cents,
          total_computation_units,
          billing_tenant_id,
          payment_method,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (group_id, period_start)
        DO UPDATE SET
          total_transaction_count = $4,
          total_transaction_volume_cents = $5,
          total_computation_units = $6,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const result = await client.query(groupBillingQuery, [
        groupId,
        periodStart,
        periodEnd,
        totalTransactions,
        totalVolume,
        totalComputationUnits,
        billingTenantId,
        'USDXM',
        'pending'
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
   * Manage group treasury allocations
   * @param {String} groupId - Group ID
   * @param {Array} allocations - Array of allocation objects
   * @returns {Object} Updated treasury
   */
  async updateTreasuryAllocations(groupId, allocations) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get treasury
      const treasuryQuery = `
        SELECT * FROM group_treasury
        WHERE group_id = $1 AND is_active = true
      `;
      const treasuryResult = await client.query(treasuryQuery, [groupId]);

      if (treasuryResult.rows.length === 0) {
        throw new Error('Active treasury not found for group');
      }

      const treasury = treasuryResult.rows[0];

      // Validate allocations sum to 100% or less
      const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation_percent, 0);
      if (totalAllocation > 100) {
        throw new Error('Total allocations exceed 100%');
      }

      // Clear existing allocations
      await client.query(
        'DELETE FROM group_treasury_allocations WHERE treasury_id = $1',
        [treasury.id]
      );

      // Insert new allocations
      for (const allocation of allocations) {
        const insertQuery = `
          INSERT INTO group_treasury_allocations (
            treasury_id,
            tenant_id,
            allocation_percent,
            allocation_rules,
            is_active
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(insertQuery, [
          treasury.id,
          allocation.tenant_id,
          allocation.allocation_percent,
          allocation.rules || {},
          true
        ]);
      }

      await client.query('COMMIT');

      // Return updated treasury with allocations
      return await this.getGroupTreasury(groupId);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get group treasury details
   * @param {String} groupId - Group ID
   * @returns {Object} Treasury with allocations
   */
  async getGroupTreasury(groupId) {
    const treasuryQuery = `
      SELECT
        gt.*,
        g.group_name,
        g.group_type
      FROM group_treasury gt
      JOIN groups g ON gt.group_id = g.id
      WHERE gt.group_id = $1 AND gt.is_active = true
    `;

    const treasuryResult = await this.pool.query(treasuryQuery, [groupId]);

    if (treasuryResult.rows.length === 0) {
      return null;
    }

    const treasury = treasuryResult.rows[0];

    // Get allocations
    const allocationsQuery = `
      SELECT
        gta.*,
        t.name as tenant_name,
        t.tenant_code
      FROM group_treasury_allocations gta
      JOIN tenants t ON gta.tenant_id = t.id
      WHERE gta.treasury_id = $1 AND gta.is_active = true
      ORDER BY gta.allocation_percent DESC
    `;

    const allocationsResult = await this.pool.query(allocationsQuery, [treasury.id]);

    return {
      ...treasury,
      allocations: allocationsResult.rows
    };
  }

  // Helper methods

  generateGroupCode(type) {
    const prefix = {
      household: 'HH',
      holding_company: 'HC',
      small_business: 'SB'
    }[type] || 'GRP';

    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }

  getDefaultConfiguration(type, overrides = {}) {
    const defaults = {
      household: {
        shared_treasury: false,
        aggregate_billing: true,
        primary_pays_all: true,
        billing_split: false,
        max_members: 10,
        require_primary_approval: true,
        allow_member_spending: false,
        spending_limits: {}
      },
      holding_company: {
        shared_treasury: true,
        aggregate_billing: false,
        primary_pays_all: false,
        subsidiaries_data_isolation: true,
        consolidated_reporting: true,
        intercompany_transfers: true,
        max_subsidiaries: 100,
        ownership_tracking: true
      },
      small_business: {
        shared_treasury: true,
        aggregate_billing: true,
        primary_pays_all: false,
        max_members: 25,
        department_budgets: true,
        approval_workflows: true,
        expense_categories: true
      }
    };

    return { ...(defaults[type] || {}), ...overrides };
  }

  async addGroupMember(client, groupId, tenantId, role, ownershipPercent) {
    const insertQuery = `
      INSERT INTO group_members (
        group_id,
        tenant_id,
        role,
        ownership_percent,
        permissions,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const permissions = this.getDefaultPermissions(role);

    const result = await client.query(insertQuery, [
      groupId,
      tenantId,
      role,
      ownershipPercent,
      permissions,
      true
    ]);

    return result.rows[0];
  }

  async initializeGroupTreasury(client, groupId) {
    const treasuryQuery = `
      INSERT INTO group_treasury (
        group_id,
        balance_cents,
        available_balance_cents,
        reserved_balance_cents,
        currency,
        is_active
      ) VALUES ($1, 0, 0, 0, 'USD', true)
      RETURNING *
    `;

    return await client.query(treasuryQuery, [groupId]);
  }

  async initializeGroupBilling(client, groupId) {
    const billingQuery = `
      INSERT INTO group_billing_aggregation (
        group_id,
        period_start,
        period_end,
        total_transaction_count,
        total_transaction_volume_cents,
        total_computation_units,
        billing_tenant_id,
        payment_method,
        status
      )
      SELECT
        $1,
        date_trunc('month', CURRENT_DATE),
        date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day',
        0, 0, 0,
        primary_tenant_id,
        'USDXM',
        'active'
      FROM groups WHERE id = $1
    `;

    return await client.query(billingQuery, [groupId]);
  }

  async updateTenantBillingToGroup(client, tenantId, groupId) {
    // Update tenant to indicate billing through group
    const updateQuery = `
      UPDATE tenants
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{billing_through_group}',
        to_jsonb($1::text)
      )
      WHERE id = $2
    `;

    return await client.query(updateQuery, [groupId, tenantId]);
  }

  async resetTenantBilling(client, tenantId) {
    const updateQuery = `
      UPDATE tenants
      SET metadata = metadata - 'billing_through_group'
      WHERE id = $1
    `;

    return await client.query(updateQuery, [tenantId]);
  }

  getDefaultPermissions(role) {
    const permissions = {
      primary: ['*'],
      admin: ['read', 'write', 'invite', 'treasury_view'],
      member: ['read', 'write'],
      viewer: ['read'],
      subsidiary: ['read', 'write', 'treasury_allocate']
    };
    return permissions[role] || ['read'];
  }
}

export default GroupManagementService;