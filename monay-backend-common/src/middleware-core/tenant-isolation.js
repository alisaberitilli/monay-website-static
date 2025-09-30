import { Pool } from 'pg';
import crypto from 'crypto';

// Initialize services
import TenantManagementService from '../services/tenant-management.js';
import BillingCalculationService from '../services/billing-calculation.js';

class TenantIsolationMiddleware {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.tenantService = new TenantManagementService(this.pool);
    this.billingService = new BillingCalculationService(this.pool);
  }

  /**
   * Main middleware function for tenant isolation
   */
  middleware() {
    return async (req, res, next) => {
      try {
        // Extract tenant context from various sources
        const tenantContext = await this.extractTenantContext(req);

        if (!tenantContext) {
          // For public endpoints or pre-auth endpoints
          if (this.isPublicEndpoint(req.path)) {
            return next();
          }

          return res.status(401).json({
            error: 'No tenant context found',
            message: 'Please provide valid authentication or API key'
          });
        }

        // Verify tenant is active
        const tenant = await this.tenantService.getTenant(tenantContext.tenant_id);

        if (!tenant) {
          return res.status(404).json({
            error: 'Tenant not found',
            message: 'The specified tenant does not exist'
          });
        }

        if (tenant.status !== 'active') {
          return res.status(403).json({
            error: 'Tenant inactive',
            message: `Tenant status: ${tenant.status}`
          });
        }

        // Set tenant context on request
        req.tenant = {
          id: tenant.id,
          code: tenant.tenant_code,
          name: tenant.name,
          type: tenant.type,
          billing_tier: tenant.billing_tier,
          isolation_level: tenant.isolation_level,
          features: await this.getTenantFeatures(tenant.id),
          limits: await this.getTenantLimits(tenant.id),
          vault_context: tenantContext.vault_context
        };

        // Set user context if available
        if (tenantContext.user_id) {
          req.user = {
            id: tenantContext.user_id,
            role: tenantContext.user_role,
            permissions: tenantContext.permissions
          };
        }

        // Track operation for billing
        if (this.isBillableOperation(req)) {
          await this.trackBillableOperation(req);
        }

        // Apply rate limiting based on tenant tier
        const rateLimitStatus = await this.checkRateLimit(req);
        if (!rateLimitStatus.allowed) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: rateLimitStatus.message,
            retry_after: rateLimitStatus.retry_after
          });
        }

        // Set database context for Row-Level Security
        await this.setDatabaseContext(req);

        // Continue to next middleware
        next();

      } catch (error) {
        console.error('Tenant isolation middleware error:', error);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to process tenant context'
        });
      }
    };
  }

  /**
   * Extract tenant context from request
   */
  async extractTenantContext(req) {
    // 1. Check for API Key in headers
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (apiKey && apiKey.startsWith('mk_')) {
      const tenant = await this.tenantService.verifyAPIKey(apiKey);
      if (tenant) {
        return {
          tenant_id: tenant.id,
          source: 'api_key',
          vault_context: await this.getVaultContext(tenant.id)
        };
      }
    }

    // 2. Check JWT token for user context
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const decoded = await this.verifyJWT(token);

      if (decoded && decoded.user_id) {
        // Get tenant from user
        const tenantInfo = await this.getTenantFromUser(decoded.user_id);
        if (tenantInfo) {
          return {
            tenant_id: tenantInfo.tenant_id,
            user_id: decoded.user_id,
            user_role: tenantInfo.role,
            permissions: tenantInfo.permissions,
            source: 'jwt',
            vault_context: await this.getVaultContext(tenantInfo.tenant_id)
          };
        }
      }
    }

    // 3. Check for tenant header (for internal services)
    if (req.headers['x-tenant-id'] && this.isInternalRequest(req)) {
      return {
        tenant_id: req.headers['x-tenant-id'],
        source: 'internal',
        vault_context: await this.getVaultContext(req.headers['x-tenant-id'])
      };
    }

    // 4. Check subdomain for tenant identification
    const subdomain = this.extractSubdomain(req);
    if (subdomain) {
      const tenant = await this.getTenantBySubdomain(subdomain);
      if (tenant) {
        return {
          tenant_id: tenant.id,
          source: 'subdomain',
          vault_context: await this.getVaultContext(tenant.id)
        };
      }
    }

    return null;
  }

  /**
   * Get vault context for cryptographic isolation
   */
  async getVaultContext(tenantId) {
    const query = `
      SELECT
        t.wallet_derivation_path,
        tk.key_value as vault_key,
        t.isolation_level
      FROM tenants t
      LEFT JOIN tenant_keys tk ON t.id = tk.tenant_id
        AND tk.key_type = 'vault_master'
        AND tk.is_active = true
      WHERE t.id = $1
    `;

    const result = await this.pool.query(query, [tenantId]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = result.rows[0];

    // Generate ephemeral session key
    const sessionKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    return {
      derivation_path: data.wallet_derivation_path,
      vault_key_encrypted: this.encryptVaultKey(data.vault_key, sessionKey, iv),
      session_key: sessionKey.toString('hex'),
      iv: iv.toString('hex'),
      isolation_level: data.isolation_level
    };
  }

  /**
   * Set database context for Row-Level Security
   */
  async setDatabaseContext(req) {
    if (!req.tenant || req.tenant.isolation_level === 'none') {
      return;
    }

    // Get a connection from the pool for this request
    const client = await this.pool.connect();

    try {
      // Set the tenant context for RLS
      await client.query('SET LOCAL app.current_tenant_id = $1', [req.tenant.id]);

      // For schema isolation, set search path
      if (req.tenant.isolation_level === 'schema') {
        const schemaName = `tenant_${req.tenant.code.toLowerCase()}`;
        await client.query('SET LOCAL search_path TO $1, public', [schemaName]);
      }

      // Store client for use in request handlers
      req.dbClient = client;

      // Ensure client is released after response
      const originalEnd = res.end;
      res.end = function(...args) {
        client.release();
        originalEnd.apply(res, args);
      };

    } catch (error) {
      client.release();
      throw error;
    }
  }

  /**
   * Track billable operations
   */
  async trackBillableOperation(req) {
    const operationType = this.getOperationType(req);

    if (!operationType) {
      return;
    }

    const metadata = {
      method: req.method,
      path: req.path,
      user_agent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date()
    };

    // Track async - don't block request
    this.billingService.trackOperation(req.tenant.id, operationType, metadata)
      .catch(error => {
        console.error('Failed to track billable operation:', error);
      });
  }

  /**
   * Check rate limits based on tenant tier
   */
  async checkRateLimit(req) {
    const limits = {
      free: { requests_per_minute: 60, requests_per_hour: 1000 },
      small_business: { requests_per_minute: 300, requests_per_hour: 10000 },
      enterprise: { requests_per_minute: 1000, requests_per_hour: 100000 }
    };

    const tierLimits = limits[req.tenant.billing_tier] || limits.free;
    const key = `rate_limit:${req.tenant.id}:${req.path}`;

    // Implementation would use Redis for rate limiting
    // This is a simplified version
    const currentMinute = Math.floor(Date.now() / 60000);
    const currentHour = Math.floor(Date.now() / 3600000);

    // Check minute limit
    const minuteCount = await this.getRateLimitCount(key + ':m:' + currentMinute);
    if (minuteCount >= tierLimits.requests_per_minute) {
      return {
        allowed: false,
        message: `Rate limit exceeded: ${tierLimits.requests_per_minute} requests per minute`,
        retry_after: 60 - (Date.now() / 1000) % 60
      };
    }

    // Check hour limit
    const hourCount = await this.getRateLimitCount(key + ':h:' + currentHour);
    if (hourCount >= tierLimits.requests_per_hour) {
      return {
        allowed: false,
        message: `Rate limit exceeded: ${tierLimits.requests_per_hour} requests per hour`,
        retry_after: 3600 - (Date.now() / 1000) % 3600
      };
    }

    // Increment counters
    await this.incrementRateLimitCount(key + ':m:' + currentMinute, 60);
    await this.incrementRateLimitCount(key + ':h:' + currentHour, 3600);

    return { allowed: true };
  }

  /**
   * Get tenant features based on billing tier
   */
  async getTenantFeatures(tenantId) {
    const query = `
      SELECT feature_name, feature_value, is_enabled
      FROM tenant_features
      WHERE tenant_id = $1 AND is_enabled = true
    `;

    const result = await this.pool.query(query, [tenantId]);

    const features = {};
    for (const row of result.rows) {
      features[row.feature_name] = row.feature_value === '-1' ? -1 : parseInt(row.feature_value) || row.feature_value;
    }

    return features;
  }

  /**
   * Get tenant usage limits
   */
  async getTenantLimits(tenantId) {
    const query = `
      SELECT
        t.billing_tier,
        btc.included_transactions,
        btc.included_computation_units,
        btc.included_api_calls,
        btc.max_storage_gb,
        bm.transaction_count as used_transactions,
        bm.computation_units_used as used_computation,
        bm.api_calls as used_api_calls,
        bm.storage_gb_used as used_storage
      FROM tenants t
      LEFT JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
      LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
        AND bm.period_start = date_trunc('month', CURRENT_DATE)
      WHERE t.id = $1
    `;

    const result = await this.pool.query(query, [tenantId]);

    if (result.rows.length === 0) {
      return null;
    }

    const data = result.rows[0];

    return {
      transactions: {
        limit: data.included_transactions,
        used: data.used_transactions || 0,
        remaining: Math.max(0, data.included_transactions - (data.used_transactions || 0))
      },
      computation_units: {
        limit: data.included_computation_units,
        used: data.used_computation || 0,
        remaining: Math.max(0, data.included_computation_units - (data.used_computation || 0))
      },
      api_calls: {
        limit: data.included_api_calls,
        used: data.used_api_calls || 0,
        remaining: Math.max(0, data.included_api_calls - (data.used_api_calls || 0))
      },
      storage_gb: {
        limit: data.max_storage_gb,
        used: data.used_storage || 0,
        remaining: Math.max(0, data.max_storage_gb - (data.used_storage || 0))
      }
    };
  }

  // Helper methods

  isPublicEndpoint(path) {
    const publicPaths = [
      '/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/public'
    ];

    return publicPaths.some(p => path.startsWith(p));
  }

  isBillableOperation(req) {
    // Define billable paths and methods
    const billablePaths = [
      { pattern: /^\/api\/transactions/, type: 'transaction' },
      { pattern: /^\/api\/invoices/, type: 'invoice' },
      { pattern: /^\/api\/smart-contracts/, type: 'smart_contract' },
      { pattern: /^\/api\/kyc/, type: 'kyc_verification' },
      { pattern: /^\/api\/cards/, type: 'card_operation' },
      { pattern: /^\/api\/cross-chain/, type: 'cross_chain' }
    ];

    for (const { pattern, type } of billablePaths) {
      if (pattern.test(req.path) && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return true;
      }
    }

    return false;
  }

  getOperationType(req) {
    const pathToOperation = {
      '/api/transactions': 'transaction',
      '/api/invoices/send': 'invoice_sent',
      '/api/withdrawals': 'withdrawal',
      '/api/deposits': 'deposit',
      '/api/cards/payment': 'card_payment',
      '/api/transfers/ach': 'ach_transfer',
      '/api/transfers/wire': 'wire_transfer',
      '/api/smart-contracts/deploy': 'smart_contract_deploy',
      '/api/smart-contracts/call': 'smart_contract_call',
      '/api/kyc/verify': 'kyc_verification'
    };

    for (const [path, operation] of Object.entries(pathToOperation)) {
      if (req.path.startsWith(path)) {
        return operation;
      }
    }

    return 'api_call'; // Default operation type
  }

  async getTenantFromUser(userId) {
    const query = `
      SELECT
        tm.tenant_id,
        tm.role,
        tm.permissions,
        t.type as tenant_type
      FROM tenant_users tm
      JOIN tenants t ON tm.tenant_id = t.id
      WHERE tm.user_id = $1
        AND tm.status = 'active'
        AND t.status = 'active'
      ORDER BY tm.created_at DESC
      LIMIT 1
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  async getTenantBySubdomain(subdomain) {
    const query = `
      SELECT * FROM tenants
      WHERE metadata->>'subdomain' = $1
        AND status = 'active'
    `;

    const result = await this.pool.query(query, [subdomain]);
    return result.rows[0] || null;
  }

  extractSubdomain(req) {
    const host = req.headers.host || '';
    const parts = host.split('.');

    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }

  isInternalRequest(req) {
    // Check if request is from internal services
    const internalKey = req.headers['x-internal-key'];
    return internalKey === process.env.INTERNAL_SERVICE_KEY;
  }

  async verifyJWT(token) {
    // Implementation would use proper JWT verification
    // This is a placeholder
    try {
      const jwt = await import('jsonwebtoken');
      return jwt.default.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  encryptVaultKey(vaultKey, sessionKey, iv) {
    // Encrypt vault key with session key for secure transmission
    const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv);
    let encrypted = cipher.update(vaultKey, 'hex', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return encrypted + ':' + authTag.toString('hex');
  }

  async getRateLimitCount(key) {
    // This would use Redis in production
    // Simplified in-memory version for now
    return 0;
  }

  async incrementRateLimitCount(key, ttl) {
    // This would use Redis INCR with EXPIRE in production
    return 1;
  }
}

// Export singleton instance
export default new TenantIsolationMiddleware();