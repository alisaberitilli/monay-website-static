import express from 'express';
import enterpriseRBACService from '../services/enterprise-rbac.js';
import authenticate from '../middlewares/auth-middleware.js';
// import { authorize } from '../middleware/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware/audit.js';  // TODO: Add audit logging

const router = express.Router();

/**
 * @route GET /api/enterprise-rbac/roles
 * @desc Get all enterprise roles
 * @access Private
 */
router.get('/roles',
  authenticate,
  async (req, res) => {
    try {
      const { industry, includeSystem = true } = req.query;

      let roles = enterpriseRBACService.getAllRoles(includeSystem === 'true');

      if (industry) {
        roles = enterpriseRBACService.getRolesByIndustry(industry);
      }

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get roles'
      });
    }
  }
);

/**
 * @route GET /api/enterprise-rbac/permissions
 * @desc Get all permissions
 * @access Private
 */
router.get('/permissions',
  authenticate,
  async (req, res) => {
    try {
      const { category } = req.query;

      let permissions;
      if (category) {
        permissions = enterpriseRBACService.getPermissionsByCategory(category);
      } else {
        permissions = enterpriseRBACService.getAllPermissions();
      }

      // Group permissions by category
      const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          permissions,
          grouped
        }
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get permissions'
      });
    }
  }
);

/**
 * @route POST /api/enterprise-rbac/roles
 * @desc Create a new enterprise role
 * @access Private (Enterprise Owner)
 */
router.post('/roles',
  authenticate,
  // authorize(['enterprise-owner', 'enterprise-cfo']),  // TODO: Add role-based authorization
  // auditAction('ENTERPRISE_ROLE_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const {
        name,
        description,
        permissions,
        industry,
        priority
      } = req.body;

      // Validate required fields
      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          error: 'Name and permissions are required'
        });
      }

      const role = await enterpriseRBACService.createIndustryRole({
        name,
        description,
        permissions,
        industry: industry || 'general',
        priority: priority || 50,
        tenantId: req.tenant?.id
      });

      res.status(201).json({
        success: true,
        data: role
      });
    } catch (error) {
      console.error('Create role error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create role'
      });
    }
  }
);

/**
 * @route POST /api/enterprise-rbac/users/:userId/roles
 * @desc Assign role to user
 * @access Private (Enterprise Owner)
 */
router.post('/users/:userId/roles',
  authenticate,
  // authorize(['enterprise-owner', 'enterprise-cfo']),  // TODO: Add role-based authorization
  // auditAction('ENTERPRISE_ROLE_ASSIGNED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({
          success: false,
          error: 'Role ID is required'
        });
      }

      await enterpriseRBACService.assignRole(userId, roleId);

      res.json({
        success: true,
        message: 'Role assigned successfully'
      });
    } catch (error) {
      console.error('Assign role error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to assign role'
      });
    }
  }
);

/**
 * @route POST /api/enterprise-rbac/users/:userId/industry
 * @desc Assign user to industry
 * @access Private (Enterprise Owner)
 */
router.post('/users/:userId/industry',
  authenticate,
  // authorize(['enterprise-owner', 'enterprise-cfo']),  // TODO: Add role-based authorization
  // auditAction('USER_INDUSTRY_ASSIGNED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { industry } = req.body;

      if (!industry) {
        return res.status(400).json({
          success: false,
          error: 'Industry is required'
        });
      }

      await enterpriseRBACService.assignUserToIndustry(userId, industry);

      res.json({
        success: true,
        message: 'Industry assigned successfully'
      });
    } catch (error) {
      console.error('Assign industry error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign industry'
      });
    }
  }
);

/**
 * @route GET /api/enterprise-rbac/users/:userId/roles
 * @desc Get user's roles
 * @access Private
 */
router.get('/users/:userId/roles',
  authenticate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const roles = enterpriseRBACService.getUserRoles(userId);

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Get user roles error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user roles'
      });
    }
  }
);

/**
 * @route GET /api/enterprise-rbac/users/:userId/permissions
 * @desc Get user's permissions
 * @access Private
 */
router.get('/users/:userId/permissions',
  authenticate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = enterpriseRBACService.getUserIndustryPermissions(userId);

      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Get user permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user permissions'
      });
    }
  }
);

/**
 * @route POST /api/enterprise-rbac/validate
 * @desc Validate an enterprise operation
 * @access Private
 */
router.post('/validate',
  authenticate,
  async (req, res) => {
    try {
      const {
        operation,
        amount,
        industry,
        metadata
      } = req.body;

      const validation = enterpriseRBACService.validateEnterpriseOperation({
        userId: req.user?.id,
        operation,
        amount,
        industry: industry || 'general',
        metadata: metadata || {}
      });

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Validate operation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate operation'
      });
    }
  }
);

/**
 * @route GET /api/enterprise-rbac/compliance/:industry
 * @desc Get industry compliance requirements
 * @access Private
 */
router.get('/compliance/:industry',
  authenticate,
  async (req, res) => {
    try {
      const { industry } = req.params;

      const requirements = enterpriseRBACService.getIndustryComplianceRequirements(industry);

      if (!requirements) {
        return res.status(404).json({
          success: false,
          error: 'Industry not found'
        });
      }

      res.json({
        success: true,
        data: requirements
      });
    } catch (error) {
      console.error('Get compliance requirements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get compliance requirements'
      });
    }
  }
);

/**
 * @route POST /api/enterprise-rbac/check-permission
 * @desc Check if user has specific permission
 * @access Private
 */
router.post('/check-permission',
  authenticate,
  async (req, res) => {
    try {
      const {
        userId,
        permission,
        resource
      } = req.body;

      const hasPermission = enterpriseRBACService.hasPermission(
        userId || req.user?.id,
        permission,
        resource
      );

      res.json({
        success: true,
        data: {
          hasPermission,
          userId: userId || req.user?.id,
          permission,
          resource
        }
      });
    } catch (error) {
      console.error('Check permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check permission'
      });
    }
  }
);

/**
 * @route GET /api/enterprise-rbac/industries
 * @desc Get list of supported industries
 * @access Public
 */
router.get('/industries',
  async (req, res) => {
    try {
      const industries = [
        {
          id: 'banking',
          name: 'Banking & Financial Services',
          description: 'Traditional banking, lending, and financial services',
          icon: '🏦'
        },
        {
          id: 'fintech',
          name: 'Fintech',
          description: 'Digital payments, cards, and financial technology',
          icon: '💳'
        },
        {
          id: 'healthcare',
          name: 'Healthcare',
          description: 'Healthcare payments, claims, and medical billing',
          icon: '🏥'
        },
        {
          id: 'realestate',
          name: 'Real Estate',
          description: 'Property transactions, escrow, and rent collection',
          icon: '🏢'
        },
        {
          id: 'supplychain',
          name: 'Supply Chain',
          description: 'Vendor payments, logistics, and inventory',
          icon: '📦'
        },
        {
          id: 'government',
          name: 'Government & Public Sector',
          description: 'Government disbursements, benefits, and public services',
          icon: '🏛️'
        },
        {
          id: 'manufacturing',
          name: 'Manufacturing',
          description: 'Procurement, production, and distribution',
          icon: '🏭'
        },
        {
          id: 'retail',
          name: 'Retail',
          description: 'Point of sale, inventory, and customer loyalty',
          icon: '🛍️'
        },
        {
          id: 'insurance',
          name: 'Insurance',
          description: 'Claims processing, underwriting, and risk management',
          icon: '🛡️'
        }
      ];

      res.json({
        success: true,
        data: industries
      });
    } catch (error) {
      console.error('Get industries error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get industries'
      });
    }
  }
);

/**
 * @route DELETE /api/enterprise-rbac/users/:userId/roles/:roleId
 * @desc Remove role from user
 * @access Private (Enterprise Owner)
 */
router.delete('/users/:userId/roles/:roleId',
  authenticate,
  // authorize(['enterprise-owner']),  // TODO: Add role-based authorization
  // auditAction('ENTERPRISE_ROLE_REMOVED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { userId, roleId } = req.params;

      await enterpriseRBACService.removeRole(userId, roleId);

      res.json({
        success: true,
        message: 'Role removed successfully'
      });
    } catch (error) {
      console.error('Remove role error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove role'
      });
    }
  }
);

export default router;