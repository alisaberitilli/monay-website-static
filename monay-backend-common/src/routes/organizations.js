import express from 'express';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware-app/auth-middleware.js';
import { Logger } from '../services/logger.js';

const router = express.Router();
const { Pool } = pg;
const logger = new Logger({ logName: 'organizations', logFolder: 'organizations' });

// Create aliases for compatibility
const verifyToken = authenticateToken;
const verifyAdmin = (req, res, next) => {
  // Check if user has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Database pool
const pool = new Pool({
  user: process.env.DB_USER || 'alisaberi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'monay',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Get all organizations
router.get('/', verifyToken, async (req, res) => {
  try {
    const { wallet_type, status, parent_organization_id } = req.query;

    let query = `
      SELECT
        o.*,
        t.tenant_code,
        t.name as tenant_name,
        t.type as tenant_type,
        t.billing_tier as tenant_billing_tier,
        COUNT(DISTINCT ou.user_id) as user_count,
        COUNT(DISTINCT w.id) as wallet_count,
        COALESCE(SUM(tr.amount), 0) as total_volume
      FROM organizations o
      LEFT JOIN tenants t ON o.tenant_id = t.id
      LEFT JOIN organization_users ou ON o.id = ou.organization_id
      LEFT JOIN wallets w ON o.id = w.organization_id
      LEFT JOIN transactions tr ON w.id = tr.wallet_id AND tr.created_at > NOW() - INTERVAL '30 days'
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (wallet_type) {
      query += ` AND o.wallet_type = $${paramIndex++}`;
      params.push(wallet_type);
    }

    if (status) {
      query += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    if (parent_organization_id) {
      query += ` AND o.parent_organization_id = $${paramIndex++}`;
      params.push(parent_organization_id);
    }

    query += ` GROUP BY o.id, t.id ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    logger.logError('Get organizations error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single organization
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        o.*,
        tn.tenant_code,
        tn.name as tenant_name,
        tn.type as tenant_type,
        tn.billing_tier as tenant_billing_tier,
        COUNT(DISTINCT ou.user_id) as user_count,
        COUNT(DISTINCT w.id) as wallet_count,
        COALESCE(SUM(t.amount), 0) as total_volume,
        array_agg(DISTINCT ou.user_id) as user_ids
      FROM organizations o
      LEFT JOIN tenants tn ON o.tenant_id = tn.id
      LEFT JOIN organization_users ou ON o.id = ou.organization_id
      LEFT JOIN wallets w ON o.id = w.organization_id
      LEFT JOIN transactions t ON o.id = t.organization_id AND t.created_at > NOW() - INTERVAL '30 days'
      WHERE o.id = $1
      GROUP BY o.id, tn.id
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.logError('Get organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create organization
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      name,
      type,
      industry,
      description,
      email,
      phone,
      address,
      website,
      tax_id,
      wallet_type = 'enterprise',
      feature_tier = 'basic',
      parent_organization_id,
      organization_type,
      limits,
      tenant_id
    } = req.body;

    // Check if organization with same email exists
    const existingOrg = await pool.query(
      'SELECT id FROM organizations WHERE email = $1',
      [email]
    );

    if (existingOrg.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    // If tenant_id is 'auto', create a new tenant for this organization
    let actualTenantId = tenant_id;
    if (tenant_id === 'auto' || !tenant_id) {
      // Create a new tenant for this organization
      const tenantResult = await pool.query(`
        INSERT INTO tenants (
          tenant_code,
          name,
          type,
          isolation_level,
          billing_tier,
          status,
          metadata
        ) VALUES (
          $1, $2, $3, 'row', $4, 'active', $5
        ) RETURNING id
      `, [
        'TNT-' + Date.now().toString(36).toUpperCase(),
        name + ' Tenant',
        wallet_type === 'enterprise' ? 'enterprise' : 'small_business',
        feature_tier === 'premium' ? 'enterprise' : feature_tier === 'standard' ? 'professional' : 'free',
        JSON.stringify({ organization_name: name, created_from: 'org_creation' })
      ]);
      actualTenantId = tenantResult.rows[0].id;
    }

    // Generate org_id
    const orgType = wallet_type === 'enterprise' ? 'ENT' : 'SMB';
    const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const orgId = `ORG_${orgType}-${randomId}_${Date.now()}`;

    // Create organization
    const insertQuery = `
      INSERT INTO organizations (
        org_id, name, type, industry, description, email, phone, address_line1, website,
        tax_id, wallet_type, feature_tier, parent_organization_id,
        organization_type, status, kyc_status, compliance_score,
        consumer_limits, tenant_id, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        'pending', 'not_started', 75,
        $15, $16, NOW(), NOW()
      ) RETURNING *
    `;

    // Handle transaction limits from frontend
    const { daily_limit, monthly_limit, per_transaction_max } = req.body;

    const consumerLimits = {
      daily_transaction_limit: daily_limit || limits?.daily_transaction_limit || 10000,
      monthly_transaction_limit: monthly_limit || limits?.monthly_transaction_limit || 100000,
      max_cards: limits?.max_cards || 5,
      max_users: limits?.max_users || 10,
      per_transaction_max: per_transaction_max || limits?.per_transaction_max || 5000
    };

    const params = [
      orgId, name, type, industry, description, email, phone, address, website,
      tax_id, wallet_type, feature_tier, parent_organization_id,
      organization_type || 'standalone', JSON.stringify(consumerLimits),
      actualTenantId
    ];

    const result = await pool.query(insertQuery, params);
    const newOrg = result.rows[0];

    // Create organization_users entry to link the creating user as owner/admin
    const orgUserInsert = `
      INSERT INTO organization_users (
        organization_id, user_id, role, permissions, is_primary, invitation_status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const orgUserResult = await pool.query(orgUserInsert, [
      newOrg.id,
      req.user.id,
      'owner', // Set as owner role
      JSON.stringify({
        admin: true,
        manage_users: true,
        manage_wallets: true,
        view_analytics: true,
        manage_settings: true
      }),
      true, // is_primary
      'active'
    ]);

    // Create primary wallet for the organization
    const walletInsert = `
      INSERT INTO wallets (
        organization_id, wallet_name, wallet_type, blockchain,
        is_smart_wallet, kyc_status, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, wallet_address
    `;

    const walletResult = await pool.query(walletInsert, [
      newOrg.id,
      `${newOrg.name} Primary Wallet`,
      wallet_type === 'enterprise' ? 'enterprise' : 'consumer',
      'base', // Default blockchain
      true, // is_smart_wallet for organizations
      'not_started', // KYC will be done separately
      true // is_active
    ]);

    // Log the creation
    logger.logInfo('Organization created with dependencies', {
      orgId: newOrg.id,
      name: newOrg.name,
      type: newOrg.type,
      wallet_type: newOrg.wallet_type,
      createdBy: req.user.id,
      orgUserId: orgUserResult.rows[0].id,
      walletId: walletResult.rows[0].id
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully with wallet and user access',
      data: {
        ...newOrg,
        primary_wallet_id: walletResult.rows[0].id,
        created_by_user: req.user.id
      }
    });
  } catch (error) {
    logger.logError('Create organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update organization
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'type', 'industry', 'description', 'email', 'phone',
      'address', 'website', 'tax_id', 'status', 'feature_tier',
      'consumer_limits', 'compliance_settings'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`);
        params.push(field === 'consumer_limits' || field === 'compliance_settings'
          ? JSON.stringify(updates[field])
          : updates[field]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    params.push(id);
    updateFields.push(`updated_at = NOW()`);

    const updateQuery = `
      UPDATE organizations
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.logError('Update organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete/Suspend organization
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { hard_delete = false } = req.query;

    if (hard_delete === 'true') {
      // Hard delete (only for admins)
      await pool.query('DELETE FROM organizations WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Organization permanently deleted'
      });
    } else {
      // Soft delete (suspend)
      const result = await pool.query(
        `UPDATE organizations
         SET status = 'suspended', updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      res.json({
        success: true,
        message: 'Organization suspended',
        data: result.rows[0]
      });
    }
  } catch (error) {
    logger.logError('Delete organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get organization users
router.get('/:id/users', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        u.id, u.email, u.username, u.first_name, u.last_name,
        u.auth_level, u.is_active, u.is_verified, u.kyc_verified,
        ou.role, ou.permissions, ou.joined_at
      FROM users u
      JOIN organization_users ou ON u.id = ou.user_id
      WHERE ou.organization_id = $1
      ORDER BY ou.joined_at DESC
    `;

    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    logger.logError('Get organization users error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add user to organization
router.post('/:id/users', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'member', permissions = {} } = req.body;

    // Check if user is already in organization
    const existing = await pool.query(
      'SELECT id FROM organization_users WHERE organization_id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already belongs to this organization'
      });
    }

    // Add user to organization
    const insertQuery = `
      INSERT INTO organization_users (
        organization_id, user_id, role, permissions, joined_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      id, user_id, role, JSON.stringify(permissions)
    ]);

    res.status(201).json({
      success: true,
      message: 'User added to organization',
      data: result.rows[0]
    });
  } catch (error) {
    logger.logError('Add user to organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add user to organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove user from organization
router.delete('/:id/users/:userId', verifyToken, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const result = await pool.query(
      'DELETE FROM organization_users WHERE organization_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found in organization'
      });
    }

    res.json({
      success: true,
      message: 'User removed from organization'
    });
  } catch (error) {
    logger.logError('Remove user from organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove user from organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get organization children (for holding companies)
router.get('/:id/children', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM organizations
      WHERE parent_organization_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    logger.logError('Get organization children error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch child organizations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Upgrade organization from consumer to enterprise
router.post('/:id/upgrade', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { feature_tier = 'standard' } = req.body;

    const result = await pool.query(
      `UPDATE organizations
       SET wallet_type = 'enterprise',
           feature_tier = $1,
           upgraded_from_consumer = true,
           consumer_limits = NULL,
           updated_at = NOW()
       WHERE id = $2 AND wallet_type = 'consumer'
       RETURNING *`,
      [feature_tier, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found or already enterprise'
      });
    }

    logger.logInfo('Organization upgraded', {
      orgId: id,
      from: 'consumer',
      to: 'enterprise',
      feature_tier
    });

    res.json({
      success: true,
      message: 'Organization upgraded to enterprise',
      data: result.rows[0]
    });
  } catch (error) {
    logger.logError('Upgrade organization error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Organization self-registration (for public signup)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      type,
      industry,
      email,
      phone,
      admin_email,
      admin_password,
      wallet_type = 'consumer'
    } = req.body;

    // Begin transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if organization exists
      const existingOrg = await client.query(
        'SELECT id FROM organizations WHERE email = $1',
        [email]
      );

      if (existingOrg.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Organization already exists'
        });
      }

      // Create organization
      const orgResult = await client.query(
        `INSERT INTO organizations (
          name, type, industry, email, phone, wallet_type,
          feature_tier, status, kyc_status, compliance_score,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'basic', 'pending', 'not_started', 50,
          NOW(), NOW()
        ) RETURNING *`,
        [name, type, industry, email, phone, wallet_type]
      );

      const newOrg = orgResult.rows[0];

      // Create admin user
      const hashedPassword = await bcrypt.hash(admin_password, 10);

      const userResult = await client.query(
        `INSERT INTO users (
          email, username, password_hash, first_name, last_name,
          auth_level, is_active, is_verified, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'verified', true, false, NOW(), NOW()
        ) RETURNING id, email, username`,
        [admin_email, admin_email.split('@')[0], hashedPassword, 'Admin', name]
      );

      const adminUser = userResult.rows[0];

      // Link admin to organization
      await client.query(
        `INSERT INTO organization_users (
          organization_id, user_id, role, permissions, joined_at
        ) VALUES ($1, $2, 'admin', '{"full_access": true}', NOW())`,
        [newOrg.id, adminUser.id]
      );

      await client.query('COMMIT');

      // Generate JWT token for auto-login
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          username: adminUser.username,
          organization_id: newOrg.id
        },
        process.env.JWT_SECRET || 'monay-secret-key-2025',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Organization registered successfully',
        data: {
          organization: newOrg,
          user: adminUser,
          token
        }
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.logError('Organization registration error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register organization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;