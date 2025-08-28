import { Router } from 'express';
import middlewares from '../middlewares';

const router = Router();
const { authMiddleware } = middlewares;

// Mock business rules data (in production, this would come from database)
const mockBusinessRules = [
  {
    id: '1',
    name: 'Enhanced KYC Required for High-Value Transactions',
    description: 'Users must have enhanced KYC for transactions over $10,000',
    category: 'KYC_ELIGIBILITY',
    priority: 100,
    isActive: true,
    conditions: [
      { id: '1', field: 'transaction_amount', operator: 'greaterThan', value: 10000 },
      { id: '2', field: 'kyc_level', operator: 'lessThan', value: 'enhanced', logicOperator: 'AND' }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Enhanced KYC required for high-value transactions' } }
    ],
    assignedUsers: 247,
    violations: 12,
    createdAt: '2024-08-20T10:00:00Z',
    lastModified: '2024-08-23T15:30:00Z'
  },
  {
    id: '2',
    name: 'Daily Spend Limit for Basic Users',
    description: 'Basic tier users limited to $1,000 daily spending',
    category: 'SPEND_MANAGEMENT',
    priority: 90,
    isActive: true,
    conditions: [
      { id: '1', field: 'user_tier', operator: 'equals', value: 'basic' },
      { id: '2', field: 'daily_spent', operator: 'greaterThan', value: 1000, logicOperator: 'AND' }
    ],
    actions: [
      { id: '1', type: 'setLimit', parameters: { type: 'daily', amount: 1000 } }
    ],
    assignedUsers: 892,
    violations: 45,
    createdAt: '2024-08-15T09:00:00Z',
    lastModified: '2024-08-22T14:20:00Z'
  },
  {
    id: '3',
    name: 'Geographic Restriction - Sanctioned Countries',
    description: 'Block transactions from sanctioned jurisdictions',
    category: 'GEOGRAPHIC_RESTRICTIONS',
    priority: 200,
    isActive: true,
    conditions: [
      { id: '1', field: 'user_country', operator: 'in', value: ['IR', 'KP', 'SY'] }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Transactions not permitted from this jurisdiction' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Blocked transaction from sanctioned country' } }
    ],
    assignedUsers: 0,
    violations: 3,
    createdAt: '2024-08-10T08:00:00Z',
    lastModified: '2024-08-20T11:45:00Z'
  }
];

// Check business rules permissions
const checkBusinessRulesPermission = async (req, res, next) => {
  try {
    // Get user from auth middleware
    const userId = req.user.id;
    
    // Get user with role (this would normally be a database query)
    // For now, assume platform_admin has write access, compliance_officer has read access
    const user = req.user;
    const userRole = user.role || user.userRole || 'basic_consumer';
    
    // Check permissions based on role
    const hasReadPermission = ['platform_admin', 'compliance_officer'].includes(userRole);
    const hasWritePermission = ['platform_admin'].includes(userRole);
    
    // Store permissions in request
    req.permissions = {
      canRead: hasReadPermission,
      canWrite: hasWritePermission
    };
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking permissions',
      error: error.message
    });
  }
};

// GET /api/business-rules - Get all business rules
router.get('/business-rules', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canRead) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access business rules'
      });
    }

    // In production, filter based on query parameters
    const { category, isActive, search } = req.query;
    
    let filteredRules = [...mockBusinessRules];
    
    if (category && category !== 'all') {
      filteredRules = filteredRules.filter(rule => rule.category === category);
    }
    
    if (isActive !== undefined && isActive !== 'all') {
      filteredRules = filteredRules.filter(rule => rule.isActive === (isActive === 'true'));
    }
    
    if (search) {
      filteredRules = filteredRules.filter(rule => 
        rule.name.toLowerCase().includes(search.toLowerCase()) ||
        rule.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredRules,
      message: 'Business rules fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rules',
      error: error.message
    });
  }
});

// POST /api/business-rules - Create new business rule
router.post('/business-rules', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canWrite) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create business rules'
      });
    }

    const { name, description, category, priority, conditions, actions } = req.body;
    
    // Validation
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and category are required'
      });
    }

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one condition is required'
      });
    }

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one action is required'
      });
    }

    // Create new rule
    const newRule = {
      id: Date.now().toString(),
      name,
      description,
      category,
      priority: priority || 100,
      isActive: true,
      conditions: conditions.map((c, index) => ({
        ...c,
        id: `${Date.now()}_${index}`
      })),
      actions: actions.map((a, index) => ({
        ...a,
        id: `${Date.now()}_${index}`,
        parameters: a.parameters || {}
      })),
      assignedUsers: 0,
      violations: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: req.user.id
    };

    // In production, save to database
    mockBusinessRules.push(newRule);

    res.json({
      success: true,
      data: newRule,
      message: 'Business rule created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating business rule',
      error: error.message
    });
  }
});

// GET /api/business-rules/:id - Get specific business rule
router.get('/business-rules/:id', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canRead) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access business rules'
      });
    }

    const { id } = req.params;
    const rule = mockBusinessRules.find(r => r.id === id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    res.json({
      success: true,
      data: rule,
      message: 'Business rule fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business rule',
      error: error.message
    });
  }
});

// PATCH /api/business-rules/:id - Update business rule
router.patch('/business-rules/:id', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canWrite) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update business rules'
      });
    }

    const { id } = req.params;
    const ruleIndex = mockBusinessRules.findIndex(r => r.id === id);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Update rule
    const updatedRule = {
      ...mockBusinessRules[ruleIndex],
      ...req.body,
      lastModified: new Date().toISOString(),
      updatedBy: req.user.id
    };

    mockBusinessRules[ruleIndex] = updatedRule;

    res.json({
      success: true,
      data: updatedRule,
      message: 'Business rule updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business rule',
      error: error.message
    });
  }
});

// DELETE /api/business-rules/:id - Delete business rule
router.delete('/business-rules/:id', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canWrite) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete business rules'
      });
    }

    const { id } = req.params;
    const ruleIndex = mockBusinessRules.findIndex(r => r.id === id);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Remove rule
    mockBusinessRules.splice(ruleIndex, 1);

    res.json({
      success: true,
      data: null,
      message: 'Business rule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting business rule',
      error: error.message
    });
  }
});

// PATCH /api/business-rules/:id/toggle - Toggle business rule status
router.patch('/business-rules/:id/toggle', authMiddleware, checkBusinessRulesPermission, async (req, res) => {
  try {
    if (!req.permissions.canWrite) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to modify business rules'
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const ruleIndex = mockBusinessRules.findIndex(r => r.id === id);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Business rule not found'
      });
    }

    // Toggle rule
    mockBusinessRules[ruleIndex] = {
      ...mockBusinessRules[ruleIndex],
      isActive,
      lastModified: new Date().toISOString(),
      updatedBy: req.user.id
    };

    const message = isActive ? 'Business rule activated successfully' : 'Business rule deactivated successfully';
    
    res.json({
      success: true,
      data: mockBusinessRules[ruleIndex],
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling business rule',
      error: error.message
    });
  }
});

export default router;