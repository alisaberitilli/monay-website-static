import express from 'express';
const router = express.Router();
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import tenantIsolation from '../middleware/tenant-isolation.js';
import TenantManagementService from '../services/tenant-management.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';

// Initialize service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const tenantService = new TenantManagementService(pool);

// Apply authentication to all routes
router.use(authenticateToken);

// ================================================================
// TENANT MANAGEMENT ENDPOINTS
// ================================================================

/**
 * @route   GET /api/tenants
 * @desc    Get all tenants (admin only)
 * @access  Private/Admin
 */
router.get('/',
  validateRequest([
    query('type').optional().isIn(['individual', 'household_member', 'small_business', 'enterprise', 'holding_company']),
    query('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
    query('status').optional().isIn(['pending', 'active', 'suspended', 'terminated']),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
    query('offset').optional().isInt({ min: 0 }).default(0)
  ]),
  async (req, res) => {
    try {
      // Check admin permission
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin access required'
        });
      }

      const { type, billing_tier, status, limit, offset } = req.query;

      // Build query
      let queryStr = `
        SELECT
          t.*,
          COUNT(DISTINCT tm.user_id) as member_count,
          COUNT(DISTINCT gm.group_id) as group_count,
          COALESCE(bm.transaction_count, 0) as current_month_transactions
        FROM tenants t
        LEFT JOIN tenant_members tm ON t.id = tm.tenant_id AND tm.is_active = true
        LEFT JOIN group_members gm ON t.id = gm.tenant_id AND gm.is_active = true
        LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
          AND bm.period_start = date_trunc('month', CURRENT_DATE)
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (type) {
        paramCount++;
        queryStr += ` AND t.type = $${paramCount}`;
        params.push(type);
      }

      if (billing_tier) {
        paramCount++;
        queryStr += ` AND t.billing_tier = $${paramCount}`;
        params.push(billing_tier);
      }

      if (status) {
        paramCount++;
        queryStr += ` AND t.status = $${paramCount}`;
        params.push(status);
      }

      queryStr += ` GROUP BY t.id, bm.transaction_count`;
      queryStr += ` ORDER BY t.created_at DESC`;

      paramCount++;
      queryStr += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      queryStr += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(queryStr, params);

      res.json({
        tenants: result.rows,
        total: result.rowCount,
        limit,
        offset
      });

    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({
        error: 'Failed to fetch tenants',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/tenants/current
 * @desc    Get current tenant context
 * @access  Private
 */
router.get('/current',
  tenantIsolation.middleware(),
  async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(404).json({
          error: 'No tenant context found'
        });
      }

      const tenant = await tenantService.getTenant(req.tenant.id);

      res.json({
        tenant,
        context: {
          features: req.tenant.features,
          limits: req.tenant.limits,
          vault_context: req.tenant.vault_context
        }
      });

    } catch (error) {
      console.error('Error fetching current tenant:', error);
      res.status(500).json({
        error: 'Failed to fetch tenant',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/users/me/tenants
 * @desc    Get all tenants for current user
 * @access  Private
 */
router.get('/users/me/tenants',
  async (req, res) => {
    try {
      // Get all tenants where user is a member
      const query = `
        SELECT
          t.*,
          tm.role,
          tm.permissions,
          tm.joined_at
        FROM tenant_members tm
        JOIN tenants t ON tm.tenant_id = t.id
        WHERE tm.user_id = $1 AND tm.is_active = true
        ORDER BY
          CASE WHEN tm.role = 'owner' THEN 0
               WHEN tm.role = 'admin' THEN 1
               ELSE 2 END,
          tm.joined_at DESC
      `;

      const result = await pool.query(query, [req.user.id]);

      res.json({
        tenants: result.rows,
        total: result.rowCount,
        current_tenant_id: req.user.current_tenant_id
      });

    } catch (error) {
      console.error('Error fetching user tenants:', error);
      res.status(500).json({
        error: 'Failed to fetch user tenants',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/tenants/:id
 * @desc    Get tenant by ID
 * @access  Private
 */
router.get('/:id',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permission
      if (!req.user.isAdmin && req.user.tenant_id !== id) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const tenant = await tenantService.getTenant(id);

      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found'
        });
      }

      res.json(tenant);

    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({
        error: 'Failed to fetch tenant',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/tenants
 * @desc    Create new tenant
 * @access  Private/Admin
 */
router.post('/',
  validateRequest([
    body('name').notEmpty().trim(),
    body('type').isIn(['individual', 'household_member', 'small_business', 'enterprise', 'holding_company']),
    body('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
    body('metadata').optional().isObject()
  ]),
  async (req, res) => {
    try {
      // Check admin permission for non-individual tenants
      if (req.body.type !== 'individual' && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin access required for organization tenants'
        });
      }

      const tenant = await tenantService.createTenant(req.body);

      res.status(201).json({
        tenant,
        message: 'Tenant created successfully',
        api_key: tenant.vault_key // Only returned on creation
      });

    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({
        error: 'Failed to create tenant',
        message: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/tenants/:id
 * @desc    Update tenant
 * @access  Private
 */
router.put('/:id',
  validateRequest([
    param('id').isUUID(),
    body('name').optional().trim(),
    body('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
    body('status').optional().isIn(['active', 'suspended', 'terminated']),
    body('metadata').optional().isObject(),
    body('settings').optional().isObject()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permission
      if (!req.user.isAdmin && req.user.tenant_id !== id) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const tenant = await tenantService.updateTenant(id, req.body);

      res.json({
        tenant,
        message: 'Tenant updated successfully'
      });

    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({
        error: 'Failed to update tenant',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/tenants/:id/switch
 * @desc    Switch to different tenant context
 * @access  Private
 */
router.post('/:id/switch',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify user has access to this tenant
      const memberQuery = `
        SELECT * FROM tenant_members
        WHERE tenant_id = $1 AND user_id = $2 AND is_active = true
      `;

      const memberResult = await pool.query(memberQuery, [id, req.user.id]);

      if (memberResult.rows.length === 0 && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied to this tenant'
        });
      }

      // Update user's current tenant context
      const updateQuery = `
        UPDATE users
        SET current_tenant_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const userResult = await pool.query(updateQuery, [id, req.user.id]);

      // Generate new JWT with updated tenant context
      const token = jwt.sign(
        {
          user_id: req.user.id,
          tenant_id: id,
          email: userResult.rows[0].email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        tenant_id: id,
        message: 'Switched tenant context successfully'
      });

    } catch (error) {
      console.error('Error switching tenant:', error);
      res.status(500).json({
        error: 'Failed to switch tenant',
        message: error.message
      });
    }
  }
);

// ================================================================
// TENANT MEMBER ENDPOINTS
// ================================================================

/**
 * @route   GET /api/tenants/:id/members
 * @desc    Get tenant members
 * @access  Private
 */
router.get('/:id/members',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permission
      if (!req.user.isAdmin && req.user.tenant_id !== id) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const query = `
        SELECT
          tm.*,
          u.email,
          u.first_name,
          u.last_name,
          u.profile_picture_url
        FROM tenant_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.tenant_id = $1 AND tm.is_active = true
        ORDER BY tm.created_at DESC
      `;

      const result = await pool.query(query, [id]);

      res.json({
        members: result.rows,
        total: result.rowCount
      });

    } catch (error) {
      console.error('Error fetching tenant members:', error);
      res.status(500).json({
        error: 'Failed to fetch members',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/tenants/:id/members
 * @desc    Add member to tenant
 * @access  Private
 */
router.post('/:id/members',
  validateRequest([
    param('id').isUUID(),
    body('user_id').isUUID(),
    body('role').isIn(['owner', 'admin', 'member', 'viewer', 'billing'])
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { user_id, role } = req.body;

      // Check permission
      const hasPermission = await checkTenantPermission(req.user.id, id, 'invite');
      if (!hasPermission && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions to add members'
        });
      }

      const member = await tenantService.addTenantMember(id, user_id, role);

      res.status(201).json({
        member,
        message: 'Member added successfully'
      });

    } catch (error) {
      console.error('Error adding tenant member:', error);
      res.status(500).json({
        error: 'Failed to add member',
        message: error.message
      });
    }
  }
);

// ================================================================
// TENANT API KEY ENDPOINTS
// ================================================================

/**
 * @route   POST /api/tenants/:id/api-keys
 * @desc    Generate API key for tenant
 * @access  Private
 */
router.post('/:id/api-keys',
  validateRequest([
    param('id').isUUID(),
    body('key_type').optional().isIn(['api_key', 'webhook_key', 'admin_key'])
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { key_type = 'api_key' } = req.body;

      // Check permission
      const hasPermission = await checkTenantPermission(req.user.id, id, 'admin');
      if (!hasPermission && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin permission required'
        });
      }

      const apiKey = await tenantService.generateAPIKey(id, key_type);

      res.json({
        id: apiKey.id,
        key_type: apiKey.key_type,
        api_key: apiKey.api_key, // Full key only shown once
        created_at: apiKey.created_at,
        message: 'API key generated successfully. Please save it securely.'
      });

    } catch (error) {
      console.error('Error generating API key:', error);
      res.status(500).json({
        error: 'Failed to generate API key',
        message: error.message
      });
    }
  }
);

// ================================================================
// TENANT METRICS ENDPOINTS
// ================================================================

/**
 * @route   GET /api/tenants/:id/metrics
 * @desc    Get tenant usage metrics
 * @access  Private
 */
router.get('/:id/metrics',
  validateRequest([
    param('id').isUUID(),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      // Check permission
      if (!req.user.isAdmin && req.user.tenant_id !== id) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const metrics = await tenantService.getTenantMetrics(
        id,
        start_date ? new Date(start_date) : null,
        end_date ? new Date(end_date) : null
      );

      res.json({
        metrics,
        tenant_id: id
      });

    } catch (error) {
      console.error('Error fetching tenant metrics:', error);
      res.status(500).json({
        error: 'Failed to fetch metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/tenants/:id/limits
 * @desc    Get tenant usage limits
 * @access  Private
 */
router.get('/:id/limits',
  validateRequest([
    param('id').isUUID()
  ]),
  tenantIsolation.middleware(),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permission
      if (req.tenant.id !== id && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      res.json({
        limits: req.tenant.limits,
        features: req.tenant.features
      });

    } catch (error) {
      console.error('Error fetching tenant limits:', error);
      res.status(500).json({
        error: 'Failed to fetch limits',
        message: error.message
      });
    }
  }
);

// ================================================================
// HELPER FUNCTIONS
// ================================================================

async function checkTenantPermission(userId, tenantId, permission) {
  const query = `
    SELECT permissions FROM tenant_members
    WHERE user_id = $1 AND tenant_id = $2 AND is_active = true
  `;

  const result = await pool.query(query, [userId, tenantId]);

  if (result.rows.length === 0) {
    return false;
  }

  const permissions = result.rows[0].permissions;
  return permissions.includes('*') || permissions.includes(permission);
}

export default router;