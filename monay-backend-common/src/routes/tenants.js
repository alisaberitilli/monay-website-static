import express from 'express';
const router = express.Router();
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import authenticate from '../middleware-app/tenant-user-auth.js';
import tenantIsolation from '../middleware-app/tenant-middleware.js';
import TenantManagementService from '../services/tenant-management.js';
import { validateRequest } from '../middleware-app/validate-middleware.js';
import { body, param, query } from 'express-validator';
import emailService from '../services/email.js';

// Initialize service - use same database config as main app
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'alisaberi',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monay',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const tenantService = new TenantManagementService(pool);

// Apply authentication to all routes
router.use(authenticate);

// ================================================================
// TENANT MANAGEMENT ENDPOINTS
// ================================================================

/**
 * @route   GET /api/tenants
 * @desc    Get all tenants (admin only)
 * @access  Private/Admin
 */
router.get('/',
  query('type').optional().isIn(['individual', 'household_member', 'small_business', 'enterprise', 'holding_company']),
  query('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
  query('status').optional().isIn(['pending', 'active', 'suspended', 'terminated']),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  query('offset').optional().isInt({ min: 0 }).default(0),
  validateRequest,
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
          0 as group_count,
          0 as current_month_transactions
        FROM tenants t
        LEFT JOIN tenant_users tm ON t.id = tm.tenant_id AND tm.status = 'active'
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

      queryStr += ` GROUP BY t.id`;
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
  tenantIsolation.enforceTenantIsolation(),
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
      let query;
      let params;

      // Platform admins get access to ALL tenants (global access)
      if (req.user.isAdmin) {
        query = `
          SELECT
            t.*,
            'platform_admin' as role,
            '{}' as permissions,
            t.created_at as joined_at
          FROM tenants t
          ORDER BY t.created_at DESC
        `;
        params = [];
      } else {
        // Regular users only get tenants they're members of via tenant_users
        query = `
          SELECT
            t.*,
            tu.role,
            tu.permissions,
            tu.joined_at
          FROM tenant_users tu
          JOIN tenants t ON tu.tenant_id = t.id
          WHERE tu.user_id = $1 AND tu.status = 'active'
          ORDER BY
            CASE WHEN tu.role = 'owner' THEN 0
                 WHEN tu.role = 'admin' THEN 1
                 ELSE 2 END,
            tu.joined_at DESC
        `;
        params = [req.user.id];
      }

      const result = await pool.query(query, params);

      res.json({
        tenants: result.rows,
        total: result.rowCount,
        current_tenant_id: req.user.current_tenant_id,
        access_type: req.user.isAdmin ? 'global_admin' : 'member_access'
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
 * @route   POST /api/tenants
 * @desc    Create new tenant and automatically create admin user with provided email
 * @access  Private/Admin
 */
router.post('/',
  body('name').notEmpty().trim(),
  body('type').isIn(['individual', 'household_member', 'small_business', 'enterprise', 'holding_company']),
  body('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
  body('email').notEmpty().isEmail().withMessage('Valid email required for tenant admin user'),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      // Check admin permission for non-individual tenants
      if (req.body.type !== 'individual' && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin access required for organization tenants'
        });
      }

      // Create tenant first (this also creates the organization)
      const tenant = await tenantService.createTenant(req.body);
      const organization = tenant.organization;

      // Automatically create admin user with the provided email
      const bcrypt = await import('bcrypt');
      const defaultPassword = 'password123'; // Default password - user should change on first login
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      const createUserQuery = `
        INSERT INTO users (
          id, email, first_name, last_name, password_hash, mobile, phone,
          user_type, is_active, email_verified, mobile_verified, kyc_verified,
          primary_organization_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          primary_organization_id = $13,
          updated_at = NOW()
        RETURNING *
      `;

      const userEmail = req.body.email.toLowerCase();
      const userType = req.body.type === 'enterprise' ? 'enterprise' :
                       req.body.type === 'small_business' ? 'business' : 'individual';
      const firstName = req.body.name.split(' ')[0] || req.body.name;
      const lastName = req.body.name.split(' ').slice(1).join(' ') || 'Admin';
      const phoneNumber = req.body.metadata?.phone || '+15555555555'; // Default if not provided
      const userId = `${userType}-${tenant.id}`;

      let userResult;
      try {
        userResult = await pool.query(createUserQuery, [
          userId,
          userEmail,
          firstName,
          lastName,
          passwordHash,
          phoneNumber,  // mobile column
          phoneNumber,  // phone column
          userType,
          true,  // is_active
          true,  // email_verified
          false, // mobile_verified
          false, // kyc_verified - needs to be completed
          organization.id // Link to organization
        ]);

        console.log('User created successfully:', userResult.rows[0]);
      } catch (userError) {
        console.error('Error creating user:', userError);
        throw userError;
      }

      // Use the actual user ID from the database (in case email already existed and was updated)
      const actualUserId = userResult.rows[0].id;

      // For BUSINESS tenants (enterprise, small_business, holding_company):
      // Users are linked ONLY to organization, NOT to tenant_users
      // For INDIVIDUAL tenants: Users are linked directly to tenant via tenant_users

      if (req.body.type === 'individual' || req.body.type === 'household_member') {
        // Individual consumers: Add to tenant_users (direct tenant relationship)
        await tenantService.addTenantMember(tenant.id, actualUserId, 'owner');
      } else {
        // Business users: Add ONLY to organization (indirect tenant relationship via organization)
        const addOrgMemberQuery = `
          INSERT INTO organization_users (
            organization_id, user_id, role, permissions, invitation_status, is_primary, joined_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (organization_id, user_id) DO UPDATE SET
            role = $3,
            permissions = $4,
            invitation_status = $5,
            is_primary = $6,
            joined_at = NOW()
        `;

        try {
          console.log('Adding user to organization:', {
            organization_id: organization.id,
            user_id: actualUserId,
            role: 'admin'
          });

          await pool.query(addOrgMemberQuery, [
            organization.id,
            actualUserId,
            'admin',
            JSON.stringify(['*']), // Full permissions
            'active',  // invitation_status
            true       // is_primary (this is the primary admin)
          ]);

          console.log('User successfully added to organization');
        } catch (orgUserError) {
          console.error('Error adding user to organization:', orgUserError);
          console.error('Organization ID:', organization.id);
          console.error('User ID:', actualUserId);
          throw orgUserError;
        }
      }

      // Send welcome email with credentials
      try {
        const emailData = {
          to: userEmail,
          tenantName: req.body.name,
          tenantType: req.body.type,
          organizationName: organization.name,
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          password: defaultPassword,
          loginUrl: req.body.type === 'enterprise' || req.body.type === 'holding_company'
            ? 'http://localhost:3007/login'  // Enterprise Wallet
            : 'http://localhost:3003/login', // Consumer Wallet
          supportEmail: 'support@monay.com'
        };

        // Send email asynchronously (don't wait for it to complete)
        emailService.userSignup(emailData).catch(err => {
          console.error('Failed to send welcome email:', err);
          // Don't fail the request if email fails
        });
      } catch (emailError) {
        console.error('Email service error:', emailError);
        // Continue - email failure shouldn't break tenant creation
      }

      res.status(201).json({
        tenant,
        organization: {
          id: organization.id,
          name: organization.name,
          type: organization.type
        },
        user: {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          firstName: firstName,
          lastName: lastName,
          defaultPassword: defaultPassword, // Send default password in response (only on creation)
          message: 'Credentials have been sent to the email address provided'
        },
        message: 'Tenant, organization, and admin user created successfully',
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
  param('id').isUUID(),
  body('name').optional().trim(),
  body('billing_tier').optional().isIn(['free', 'small_business', 'enterprise', 'custom']),
  body('status').optional().isIn(['active', 'suspended', 'terminated']),
  body('metadata').optional().isObject(),
  body('settings').optional().isObject(),
  validateRequest,
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
  param('id').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify user has access to this tenant
      const memberQuery = `
        SELECT * FROM tenant_users
        WHERE tenant_id = $1 AND user_id = $2 AND status = 'active'
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
  param('id').isUUID(),
  validateRequest,
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
          tu.*,
          u.email,
          u.first_name,
          u.last_name,
          u.profile_picture_url
        FROM tenant_users tu
        JOIN users u ON tu.user_id = u.id
        WHERE tu.tenant_id = $1 AND tu.status = 'active'
        ORDER BY tu.created_at DESC
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
  param('id').isUUID(),
  body('user_id').isUUID(),
  body('role').isIn(['owner', 'admin', 'member', 'viewer', 'billing']),
  validateRequest,
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
  param('id').isUUID(),
  body('key_type').optional().isIn(['api_key', 'webhook_key', 'admin_key']),
  validateRequest,
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
  param('id').isUUID(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  validateRequest,
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
  param('id').isUUID(),
  validateRequest,
  tenantIsolation.enforceTenantIsolation(),
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

/**
 * @route   GET /api/tenants/:id
 * @desc    Get tenant by ID
 * @access  Private
 */
router.get('/:id',
  param('id').isUUID(),
  validateRequest,
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

// ================================================================
// HELPER FUNCTIONS
// ================================================================

async function checkTenantPermission(userId, tenantId, permission) {
  const query = `
    SELECT permissions FROM tenant_users
    WHERE user_id = $1 AND tenant_id = $2 AND status = 'active'
  `;

  const result = await pool.query(query, [userId, tenantId]);

  if (result.rows.length === 0) {
    return false;
  }

  const permissions = result.rows[0].permissions;
  return permissions.includes('*') || permissions.includes(permission);
}

export default router;