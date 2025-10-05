import { Router } from 'express';
import middlewares from '../middleware-app/index.js';
import BusinessRuleEngine from '../services/business-rule-engine/BusinessRuleEngine.js';
import loggers from '../services/logger.js';
const logger = loggers.logger || loggers;

const router = Router();
const { authMiddleware } = middlewares;

// Initialize Business Rule Engine
(async () => {
  try {
    await BusinessRuleEngine.initialize();
    if (logger && logger.info) {
      logger.info('Business Rule Engine initialized');
    } else {
      console.log('Business Rule Engine initialized');
    }
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Failed to initialize BRE', { error: error.message });
    } else {
      console.error('Failed to initialize BRE', { error: error.message });
    }
  }
})();

/**
 * @route POST /api/business-rules/evaluate
 * @description Evaluate invoice against business rules
 * @access Public
 */
router.post('/business-rules/evaluate', async (req, res) => {
  try {
    const { invoice } = req.body;

    if (!invoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice data is required'
      });
    }

    if (logger && logger.info) {
      logger.info('Evaluating invoice with BRE', { invoiceId: invoice.id });
    } else {
      console.log('Evaluating invoice with BRE', { invoiceId: invoice.id });
    }

    // Evaluate invoice using Business Rule Engine
    const evaluation = await BusinessRuleEngine.evaluateInvoice(invoice);

    // Return evaluation results
    res.json({
      success: true,
      ...evaluation
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('BRE evaluation failed', {
        error: error.message,
        invoice: req.body.invoice?.id
      });
    } else {
      console.error('BRE evaluation failed', {
        error: error.message,
        invoice: req.body.invoice?.id
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to evaluate invoice',
      message: error.message
    });
  }
});

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
  },

  // ENTERPRISE RULES
  {
    id: '4',
    name: 'Multi-Approval Required for Large Corporate Payments',
    description: 'Enterprise payments over $50,000 require dual authorization from authorized signers',
    category: 'SPEND_MANAGEMENT',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'amount', operator: 'greaterThan', value: 50000, logicOperator: 'AND' },
      { id: '2', field: 'userType', operator: 'equals', value: 'enterprise_finance' }
    ],
    actions: [
      { id: '1', type: 'requireApproval', parameters: { approvers: 2, role: 'enterprise_admin' } },
      { id: '2', type: 'notify', parameters: { level: 'finance', message: 'Dual authorization required' } }
    ],
    assignedUsers: 0,
    violations: 0,
    createdAt: '2025-01-15T09:00:00Z',
    lastModified: '2025-01-15T09:00:00Z'
  },
  {
    id: '5',
    name: 'Department Budget Limit Enforcement',
    description: 'Prevent transactions that exceed allocated department budget',
    category: 'SPEND_MANAGEMENT',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'departmentBudgetRemaining', operator: 'lessThan', value: 0, logicOperator: 'AND' },
      { id: '2', field: 'userType', operator: 'equals', value: 'enterprise_finance' }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Department budget exceeded - request budget increase' } },
      { id: '2', type: 'notify', parameters: { level: 'finance', message: 'Budget limit reached' } }
    ],
    assignedUsers: 0,
    violations: 5,
    createdAt: '2025-01-15T09:15:00Z',
    lastModified: '2025-01-20T14:30:00Z'
  },
  {
    id: '6',
    name: 'Vendor Whitelist Compliance',
    description: 'Only allow payments to pre-approved vendor list for procurement compliance',
    category: 'COMPLIANCE',
    priority: 'medium',
    isActive: true,
    conditions: [
      { id: '1', field: 'recipientVendorId', operator: 'notInList', value: 'approvedVendors', logicOperator: 'AND' },
      { id: '2', field: 'transactionType', operator: 'equals', value: 'vendor_payment' }
    ],
    actions: [
      { id: '1', type: 'requireApproval', parameters: { approvers: 1, role: 'enterprise_admin' } },
      { id: '2', type: 'notify', parameters: { level: 'procurement', message: 'Unapproved vendor payment attempt' } }
    ],
    assignedUsers: 0,
    violations: 8,
    createdAt: '2025-01-16T10:00:00Z',
    lastModified: '2025-01-25T11:20:00Z'
  },

  // GOVERNMENT RULES
  {
    id: '7',
    name: 'FAR Procurement Threshold Compliance',
    description: 'Federal Acquisition Regulation compliance for government procurement payments over $10,000',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'amount', operator: 'greaterThan', value: 10000, logicOperator: 'AND' },
      { id: '2', field: 'userType', operator: 'equals', value: 'government', logicOperator: 'AND' },
      { id: '3', field: 'contractNumber', operator: 'isEmpty', value: true }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Contract number required for FAR compliance' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'FAR procurement rule triggered' } }
    ],
    assignedUsers: 0,
    violations: 2,
    createdAt: '2025-01-15T08:30:00Z',
    lastModified: '2025-01-22T09:45:00Z'
  },
  {
    id: '8',
    name: 'Grant Fund Segregation',
    description: 'Ensure grant funds are only used for approved grant purposes and beneficiaries',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'fundingSource', operator: 'equals', value: 'grant', logicOperator: 'AND' },
      { id: '2', field: 'recipientGrantEligibility', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Recipient not eligible for grant funds' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Grant fund misuse attempt' } },
      { id: '3', type: 'audit', parameters: { level: 'high', category: 'grant_compliance' } }
    ],
    assignedUsers: 0,
    violations: 1,
    createdAt: '2025-01-15T08:45:00Z',
    lastModified: '2025-01-18T10:30:00Z'
  },
  {
    id: '9',
    name: 'Public Fund Transparency Reporting',
    description: 'All government transactions over $25,000 must include detailed transparency metadata',
    category: 'COMPLIANCE',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'amount', operator: 'greaterThan', value: 25000, logicOperator: 'AND' },
      { id: '2', field: 'userType', operator: 'equals', value: 'government', logicOperator: 'AND' },
      { id: '3', field: 'transparencyMetadata', operator: 'isEmpty', value: true }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Transparency reporting metadata required' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Missing transparency data' } }
    ],
    assignedUsers: 0,
    violations: 3,
    createdAt: '2025-01-15T09:00:00Z',
    lastModified: '2025-01-23T14:15:00Z'
  },

  // FINANCIAL INSTITUTION RULES
  {
    id: '10',
    name: 'OFAC Sanctions Screening',
    description: 'Screen all transactions against OFAC Specially Designated Nationals (SDN) list',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'recipientOFACMatch', operator: 'equals', value: true, logicOperator: 'OR' },
      { id: '2', field: 'senderOFACMatch', operator: 'equals', value: true }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'OFAC sanctions match - transaction prohibited' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'OFAC match detected' } },
      { id: '3', type: 'audit', parameters: { level: 'critical', category: 'sanctions_screening' } },
      { id: '4', type: 'freeze', parameters: { accounts: ['sender', 'recipient'], duration: 'indefinite' } }
    ],
    assignedUsers: 0,
    violations: 0,
    createdAt: '2025-01-14T08:00:00Z',
    lastModified: '2025-01-14T08:00:00Z'
  },
  {
    id: '11',
    name: 'Currency Transaction Report (CTR) Threshold',
    description: 'File CTR for cash transactions exceeding $10,000 per BSA requirements',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'amount', operator: 'greaterThan', value: 10000, logicOperator: 'AND' },
      { id: '2', field: 'paymentMethod', operator: 'equals', value: 'cash', logicOperator: 'AND' },
      { id: '3', field: 'cumulativeDailyAmount', operator: 'greaterThan', value: 10000 }
    ],
    actions: [
      { id: '1', type: 'fileCTR', parameters: { form: 'FinCEN-112', deadline: '15days' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'CTR filing required' } },
      { id: '3', type: 'audit', parameters: { level: 'high', category: 'BSA_reporting' } }
    ],
    assignedUsers: 0,
    violations: 0,
    createdAt: '2025-01-14T08:15:00Z',
    lastModified: '2025-01-14T08:15:00Z'
  },
  {
    id: '12',
    name: 'Suspicious Activity Report (SAR) Pattern Detection',
    description: 'Detect structuring and suspicious patterns requiring SAR filing',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'structuringPatternScore', operator: 'greaterThan', value: 75, logicOperator: 'OR' },
      { id: '2', field: 'rapidSuccessionTransactions', operator: 'greaterThan', value: 5, logicOperator: 'OR' },
      { id: '3', field: 'unusualTransactionPattern', operator: 'equals', value: true }
    ],
    actions: [
      { id: '1', type: 'review', parameters: { urgency: 'high', team: 'AML' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Potential SAR case detected' } },
      { id: '3', type: 'audit', parameters: { level: 'critical', category: 'suspicious_activity' } },
      { id: '4', type: 'fileSAR', parameters: { form: 'FinCEN-111', deadline: '30days', condition: 'after_review' } }
    ],
    assignedUsers: 0,
    violations: 7,
    createdAt: '2025-01-14T08:30:00Z',
    lastModified: '2025-01-28T16:20:00Z'
  },
  {
    id: '13',
    name: 'AML Velocity Monitoring',
    description: 'Monitor transaction velocity for money laundering indicators',
    category: 'COMPLIANCE',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'transactionsLast24Hours', operator: 'greaterThan', value: 20, logicOperator: 'OR' },
      { id: '2', field: 'totalVolumeLast24Hours', operator: 'greaterThan', value: 50000, logicOperator: 'OR' },
      { id: '3', field: 'differentRecipientsLast24Hours', operator: 'greaterThan', value: 10 }
    ],
    actions: [
      { id: '1', type: 'review', parameters: { urgency: 'medium', team: 'AML' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'High velocity activity detected' } },
      { id: '3', type: 'temporaryLimit', parameters: { duration: '24hours', maxAmount: 5000 } }
    ],
    assignedUsers: 0,
    violations: 12,
    createdAt: '2025-01-14T09:00:00Z',
    lastModified: '2025-01-29T10:45:00Z'
  },

  // HEALTHCARE RULES
  {
    id: '14',
    name: 'HIPAA Payment Data Protection',
    description: 'Ensure healthcare payments maintain PHI protection and audit trails',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'transactionType', operator: 'equals', value: 'healthcare_payment', logicOperator: 'AND' },
      { id: '2', field: 'PHIEncryption', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'HIPAA-compliant encryption required' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'HIPAA violation risk detected' } },
      { id: '3', type: 'audit', parameters: { level: 'critical', category: 'HIPAA_compliance' } }
    ],
    assignedUsers: 0,
    violations: 0,
    createdAt: '2025-01-15T10:00:00Z',
    lastModified: '2025-01-15T10:00:00Z'
  },
  {
    id: '15',
    name: 'Medical Billing Code Validation',
    description: 'Validate CPT/ICD-10 codes for medical billing payments',
    category: 'VALIDATION',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'transactionType', operator: 'equals', value: 'medical_billing', logicOperator: 'AND' },
      { id: '2', field: 'billingCodeValid', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Invalid CPT/ICD-10 billing code' } },
      { id: '2', type: 'notify', parameters: { level: 'billing', message: 'Billing code validation failed' } }
    ],
    assignedUsers: 0,
    violations: 15,
    createdAt: '2025-01-15T10:15:00Z',
    lastModified: '2025-01-27T13:30:00Z'
  },
  {
    id: '16',
    name: 'Insurance Pre-Authorization Check',
    description: 'Verify insurance pre-authorization before processing healthcare payments',
    category: 'VALIDATION',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'paymentSource', operator: 'equals', value: 'insurance', logicOperator: 'AND' },
      { id: '2', field: 'preAuthorizationStatus', operator: 'notEquals', value: 'approved' }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Insurance pre-authorization required' } },
      { id: '2', type: 'notify', parameters: { level: 'billing', message: 'Missing pre-authorization' } }
    ],
    assignedUsers: 0,
    violations: 22,
    createdAt: '2025-01-15T10:30:00Z',
    lastModified: '2025-01-29T15:20:00Z'
  },
  {
    id: '17',
    name: 'Medicare/Medicaid Compliance',
    description: 'Ensure Medicare/Medicaid payments comply with CMS regulations',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'paymentSource', operator: 'in', value: ['medicare', 'medicaid'], logicOperator: 'AND' },
      { id: '2', field: 'CMSComplianceVerified', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'review', parameters: { urgency: 'high', team: 'compliance' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'CMS compliance check required' } },
      { id: '3', type: 'audit', parameters: { level: 'high', category: 'CMS_compliance' } }
    ],
    assignedUsers: 0,
    violations: 4,
    createdAt: '2025-01-15T10:45:00Z',
    lastModified: '2025-01-24T11:10:00Z'
  },

  // EDUCATION RULES
  {
    id: '18',
    name: 'Title IV Fund Disbursement Compliance',
    description: 'Ensure Title IV federal student aid disbursements follow Department of Education regulations',
    category: 'COMPLIANCE',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'fundingSource', operator: 'equals', value: 'title_iv', logicOperator: 'AND' },
      { id: '2', field: 'studentEligibilityVerified', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Title IV eligibility verification required' } },
      { id: '2', type: 'notify', parameters: { level: 'compliance', message: 'Title IV compliance check failed' } },
      { id: '3', type: 'audit', parameters: { level: 'critical', category: 'title_iv_compliance' } }
    ],
    assignedUsers: 0,
    violations: 1,
    createdAt: '2025-01-16T08:00:00Z',
    lastModified: '2025-01-20T09:30:00Z'
  },
  {
    id: '19',
    name: 'Student Refund Policy Enforcement',
    description: 'Enforce institutional refund policy based on withdrawal date and enrollment period',
    category: 'POLICY',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'transactionType', operator: 'equals', value: 'student_refund', logicOperator: 'AND' },
      { id: '2', field: 'refundPercentageCalculated', operator: 'equals', value: false }
    ],
    actions: [
      { id: '1', type: 'calculateRefund', parameters: { policy: 'institutional', withdrawalDate: 'required' } },
      { id: '2', type: 'notify', parameters: { level: 'financial_aid', message: 'Refund calculation required' } }
    ],
    assignedUsers: 0,
    violations: 6,
    createdAt: '2025-01-16T08:15:00Z',
    lastModified: '2025-01-26T14:45:00Z'
  },
  {
    id: '20',
    name: 'Grant Spending Restriction Compliance',
    description: 'Restrict grant spending to approved categories and ensure proper documentation',
    category: 'COMPLIANCE',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'fundingSource', operator: 'contains', value: 'grant', logicOperator: 'AND' },
      { id: '2', field: 'expenseCategory', operator: 'notInList', value: 'approvedGrantCategories' }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Expense category not approved for grant funds' } },
      { id: '2', type: 'notify', parameters: { level: 'grants', message: 'Unapproved grant expense attempt' } },
      { id: '3', type: 'audit', parameters: { level: 'high', category: 'grant_spending' } }
    ],
    assignedUsers: 0,
    violations: 3,
    createdAt: '2025-01-16T08:30:00Z',
    lastModified: '2025-01-22T10:15:00Z'
  },
  {
    id: '21',
    name: 'Scholarship Disbursement Verification',
    description: 'Verify student enrollment status and academic standing before scholarship disbursement',
    category: 'VALIDATION',
    priority: 'high',
    isActive: true,
    conditions: [
      { id: '1', field: 'transactionType', operator: 'equals', value: 'scholarship', logicOperator: 'AND' },
      { id: '2', field: 'enrollmentStatus', operator: 'notEquals', value: 'active', logicOperator: 'OR' },
      { id: '3', field: 'academicStanding', operator: 'equals', value: 'unsatisfactory' }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Student eligibility requirements not met' } },
      { id: '2', type: 'notify', parameters: { level: 'financial_aid', message: 'Scholarship eligibility issue' } },
      { id: '3', type: 'review', parameters: { urgency: 'medium', team: 'financial_aid' } }
    ],
    assignedUsers: 0,
    violations: 5,
    createdAt: '2025-01-16T08:45:00Z',
    lastModified: '2025-01-25T16:20:00Z'
  },
  {
    id: '22',
    name: 'Financial Aid Over-Award Prevention',
    description: 'Prevent total financial aid from exceeding student cost of attendance',
    category: 'VALIDATION',
    priority: 'critical',
    isActive: true,
    conditions: [
      { id: '1', field: 'totalFinancialAid', operator: 'greaterThan', value: 'costOfAttendance', logicOperator: 'AND' },
      { id: '2', field: 'transactionType', operator: 'in', value: ['scholarship', 'grant', 'loan'] }
    ],
    actions: [
      { id: '1', type: 'block', parameters: { message: 'Total aid exceeds cost of attendance' } },
      { id: '2', type: 'notify', parameters: { level: 'financial_aid', message: 'Over-award detected' } },
      { id: '3', type: 'audit', parameters: { level: 'critical', category: 'financial_aid_compliance' } }
    ],
    assignedUsers: 0,
    violations: 2,
    createdAt: '2025-01-16T09:00:00Z',
    lastModified: '2025-01-21T13:40:00Z'
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