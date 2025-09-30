import express from 'express';
const router = express.Router();
import { Pool } from 'pg';
import { authenticateToken } from '../middleware-app/tenant-user-auth.js';
import tenantIsolation from '../middleware-core/tenant-isolation.js';
import GroupManagementService from '../services/group-management.js';
// Validation temporarily disabled - fix middleware imports later
// import { validateRequest } from '../middleware-app/validate-middleware.js';
// import { body, param, query } from 'express-validator';

// Initialize service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const groupService = new GroupManagementService(pool);

// Apply authentication and tenant isolation to all routes
router.use(authenticateToken);
router.use(tenantIsolation.middleware());

// ================================================================
// GROUP MANAGEMENT ENDPOINTS
// ================================================================

/**
 * @route   GET /api/groups/my-membership
 * @desc    Get current tenant's group membership
 * @access  Private
 */
router.get('/my-membership', async (req, res) => {
  try {
    // Find the current tenant's group membership
    const query = `
      SELECT
        g.id as group_id,
        g.group_name,
        g.group_type,
        gm.role as my_role,
        gm.ownership_percent as my_ownership,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND is_active = true) as member_count,
        (SELECT t.name FROM tenants t JOIN group_members gm2 ON t.id = gm2.tenant_id
         WHERE gm2.group_id = g.id AND gm2.role = 'primary' AND gm2.is_active = true) as primary_member_name
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.tenant_id = $1 AND gm.is_active = true AND g.status = 'active'
      ORDER BY g.created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [req.tenant.id]);

    if (result.rows.length === 0) {
      return res.json({
        membership: null,
        message: 'No active group membership found'
      });
    }

    const membership = result.rows[0];

    res.json({
      membership: {
        group_id: membership.group_id,
        group_name: membership.group_name,
        group_type: membership.group_type,
        my_role: membership.my_role,
        member_count: parseInt(membership.member_count),
        primary_member_name: membership.primary_member_name
      }
    });

  } catch (error) {
    console.error('Error fetching group membership:', error);
    res.status(500).json({
      error: 'Failed to fetch group membership',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/groups
 * @desc    Get all groups for current tenant
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
      const { type, status, limit, offset } = req.query;

      // Build query - show groups where current tenant is a member
      let queryStr = `
        SELECT DISTINCT
          g.*,
          gm.role as my_role,
          gm.ownership_percent as my_ownership,
          t.name as primary_tenant_name,
          COUNT(DISTINCT gm2.tenant_id) as member_count
        FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        LEFT JOIN tenants t ON g.primary_tenant_id = t.id
        LEFT JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.is_active = true
        WHERE gm.tenant_id = $1 AND gm.is_active = true
      `;

      const params = [req.tenant.id];
      let paramCount = 1;

      if (type) {
        paramCount++;
        queryStr += ` AND g.group_type = $${paramCount}`;
        params.push(type);
      }

      if (status) {
        paramCount++;
        queryStr += ` AND g.status = $${paramCount}`;
        params.push(status);
      }

      queryStr += ` GROUP BY g.id, gm.role, gm.ownership_percent, t.name`;
      queryStr += ` ORDER BY g.created_at DESC`;

      paramCount++;
      queryStr += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      queryStr += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(queryStr, params);

      res.json({
        groups: result.rows,
        total: result.rowCount,
        limit,
        offset
      });

    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({
        error: 'Failed to fetch groups',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/groups/:id
 * @desc    Get group details
 * @access  Private
 */
router.get('/:id',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if tenant is member of this group
      const memberCheck = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (memberCheck.rows.length === 0 && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied to this group'
        });
      }

      const group = await groupService.getGroup(id);

      if (!group) {
        return res.status(404).json({
          error: 'Group not found'
        });
      }

      res.json(group);

    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({
        error: 'Failed to fetch group',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/groups
 * @desc    Create new group
 * @access  Private
 */
router.post('/',
  validateRequest([
    body('group_name').notEmpty().trim(),
    body('group_type').isIn(['household', 'holding_company', 'small_business']),
    body('configuration').optional().isObject(),
    body('metadata').optional().isObject()
  ]),
  async (req, res) => {
    try {
      const groupData = {
        ...req.body,
        primary_tenant_id: req.tenant.id
      };

      const group = await groupService.createGroup(groupData);

      res.status(201).json({
        group,
        message: 'Group created successfully'
      });

    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        error: 'Failed to create group',
        message: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/groups/:id/configuration
 * @desc    Update group configuration
 * @access  Private (Primary/Admin only)
 */
router.put('/:id/configuration',
  validateRequest([
    param('id').isUUID(),
    body('configuration').isObject()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { configuration } = req.body;

      // Check permission - must be primary or admin
      const permCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (permCheck.rows.length === 0 ||
          !['primary', 'admin'].includes(permCheck.rows[0].role)) {
        return res.status(403).json({
          error: 'Only primary or admin can update configuration'
        });
      }

      const group = await groupService.updateGroupConfiguration(id, configuration);

      res.json({
        group,
        message: 'Configuration updated successfully'
      });

    } catch (error) {
      console.error('Error updating group configuration:', error);
      res.status(500).json({
        error: 'Failed to update configuration',
        message: error.message
      });
    }
  }
);

// ================================================================
// GROUP MEMBER ENDPOINTS
// ================================================================

/**
 * @route   GET /api/groups/:id/members
 * @desc    Get group members
 * @access  Private
 */
router.get('/:id/members',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if tenant is member of this group
      const memberCheck = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (memberCheck.rows.length === 0 && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied to this group'
        });
      }

      const query = `
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

      const result = await pool.query(query, [id]);

      res.json({
        members: result.rows,
        total: result.rowCount
      });

    } catch (error) {
      console.error('Error fetching group members:', error);
      res.status(500).json({
        error: 'Failed to fetch members',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add tenant to group
 * @access  Private (Primary/Admin only)
 */
router.post('/:id/members',
  validateRequest([
    param('id').isUUID(),
    body('tenant_id').isUUID(),
    body('role').optional().isIn(['member', 'admin', 'viewer']),
    body('ownership_percent').optional().isFloat({ min: 0, max: 100 })
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { tenant_id, role = 'member', ownership_percent = 0 } = req.body;

      // Check permission - must be primary or admin
      const permCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (permCheck.rows.length === 0 ||
          !['primary', 'admin'].includes(permCheck.rows[0].role)) {
        return res.status(403).json({
          error: 'Only primary or admin can add members'
        });
      }

      const member = await groupService.addTenantToGroup(
        id,
        tenant_id,
        role,
        ownership_percent
      );

      res.status(201).json({
        member,
        message: 'Member added successfully'
      });

    } catch (error) {
      console.error('Error adding group member:', error);
      res.status(500).json({
        error: 'Failed to add member',
        message: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/groups/:id/members/:tenantId
 * @desc    Remove tenant from group
 * @access  Private (Primary/Admin only, or self)
 */
router.delete('/:id/members/:tenantId',
  validateRequest([
    param('id').isUUID(),
    param('tenantId').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id, tenantId } = req.params;

      // Check permission
      const permCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      const isSelf = tenantId === req.tenant.id;
      const isAdminOrPrimary = permCheck.rows.length > 0 &&
        ['primary', 'admin'].includes(permCheck.rows[0].role);

      if (!isSelf && !isAdminOrPrimary && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      const success = await groupService.removeTenantFromGroup(id, tenantId);

      if (success) {
        res.json({
          message: 'Member removed successfully'
        });
      } else {
        res.status(400).json({
          error: 'Failed to remove member'
        });
      }

    } catch (error) {
      console.error('Error removing group member:', error);
      res.status(500).json({
        error: 'Failed to remove member',
        message: error.message
      });
    }
  }
);

// ================================================================
// GROUP BILLING ENDPOINTS
// ================================================================

/**
 * @route   GET /api/groups/:id/billing
 * @desc    Get group billing aggregation
 * @access  Private
 */
router.get('/:id/billing',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if tenant is member of this group
      const memberCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (memberCheck.rows.length === 0 && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied to billing information'
        });
      }

      // Only primary and admin can see full billing details
      const canSeeFullDetails = memberCheck.rows.length > 0 &&
        ['primary', 'admin'].includes(memberCheck.rows[0].role);

      const billing = await groupService.processGroupBilling(id);

      if (!canSeeFullDetails) {
        // Limited view for regular members
        delete billing.member_breakdown;
        delete billing.payment_details;
      }

      res.json(billing);

    } catch (error) {
      console.error('Error fetching group billing:', error);
      res.status(500).json({
        error: 'Failed to fetch billing',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/groups/:id/billing/process
 * @desc    Manually process group billing
 * @access  Private (Primary only)
 */
router.post('/:id/billing/process',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check permission - must be primary
      const permCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (permCheck.rows.length === 0 || permCheck.rows[0].role !== 'primary') {
        return res.status(403).json({
          error: 'Only primary can process billing'
        });
      }

      const billing = await groupService.processGroupBilling(id);

      res.json({
        billing,
        message: 'Group billing processed successfully'
      });

    } catch (error) {
      console.error('Error processing group billing:', error);
      res.status(500).json({
        error: 'Failed to process billing',
        message: error.message
      });
    }
  }
);

// ================================================================
// GROUP TREASURY ENDPOINTS
// ================================================================

/**
 * @route   GET /api/groups/:id/treasury
 * @desc    Get group treasury details
 * @access  Private
 */
router.get('/:id/treasury',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if tenant is member of this group
      const memberCheck = await pool.query(
        'SELECT role, permissions FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (memberCheck.rows.length === 0 && !req.user.isAdmin) {
        return res.status(403).json({
          error: 'Access denied to treasury'
        });
      }

      // Check if user has treasury view permission
      const member = memberCheck.rows[0];
      const canViewTreasury = member && (
        ['primary', 'admin'].includes(member.role) ||
        member.permissions.includes('treasury_view') ||
        member.permissions.includes('*')
      );

      if (!canViewTreasury) {
        return res.status(403).json({
          error: 'No permission to view treasury'
        });
      }

      const treasury = await groupService.getGroupTreasury(id);

      res.json(treasury);

    } catch (error) {
      console.error('Error fetching group treasury:', error);
      res.status(500).json({
        error: 'Failed to fetch treasury',
        message: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/groups/:id/treasury/allocations
 * @desc    Update treasury allocations
 * @access  Private (Primary only)
 */
router.put('/:id/treasury/allocations',
  validateRequest([
    param('id').isUUID(),
    body('allocations').isArray(),
    body('allocations.*.tenant_id').isUUID(),
    body('allocations.*.allocation_percent').isFloat({ min: 0, max: 100 })
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { allocations } = req.body;

      // Check permission - must be primary
      const permCheck = await pool.query(
        'SELECT role FROM group_members WHERE group_id = $1 AND tenant_id = $2 AND is_active = true',
        [id, req.tenant.id]
      );

      if (permCheck.rows.length === 0 || permCheck.rows[0].role !== 'primary') {
        return res.status(403).json({
          error: 'Only primary can update treasury allocations'
        });
      }

      const treasury = await groupService.updateTreasuryAllocations(id, allocations);

      res.json({
        treasury,
        message: 'Treasury allocations updated successfully'
      });

    } catch (error) {
      console.error('Error updating treasury allocations:', error);
      res.status(500).json({
        error: 'Failed to update allocations',
        message: error.message
      });
    }
  }
);

export default router;