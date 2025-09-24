import crypto from 'crypto';
import { EventEmitter } from 'events';

class EnterpriseRBACService extends EventEmitter {
  constructor() {
    super();
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.industryPolicies = new Map();
    this.complianceRules = new Map();
    this.initializeEnterpriseRoles();
  }

  /**
   * Initialize enterprise and industry-specific roles
   */
  initializeEnterpriseRoles() {
    // Define enterprise permissions
    const permissions = [
      // Token Management
      { id: 'token:create', name: 'Create Token', category: 'Token Management' },
      { id: 'token:mint', name: 'Mint Tokens', category: 'Token Management' },
      { id: 'token:burn', name: 'Burn Tokens', category: 'Token Management' },
      { id: 'token:transfer', name: 'Transfer Tokens', category: 'Token Management' },
      { id: 'token:freeze', name: 'Freeze Token', category: 'Token Management' },
      { id: 'token:configure', name: 'Configure Token', category: 'Token Management' },

      // Treasury Operations
      { id: 'treasury:manage', name: 'Manage Treasury', category: 'Treasury' },
      { id: 'treasury:liquidity', name: 'Manage Liquidity', category: 'Treasury' },
      { id: 'treasury:swap', name: 'Cross-Rail Swap', category: 'Treasury' },
      { id: 'treasury:reconcile', name: 'Reconcile Treasury', category: 'Treasury' },
      { id: 'treasury:report', name: 'Treasury Reporting', category: 'Treasury' },

      // Multi-Signature
      { id: 'multisig:create', name: 'Create Multi-Sig Wallet', category: 'Multi-Signature' },
      { id: 'multisig:approve', name: 'Approve Multi-Sig Transaction', category: 'Multi-Signature' },
      { id: 'multisig:execute', name: 'Execute Multi-Sig Transaction', category: 'Multi-Signature' },
      { id: 'multisig:configure', name: 'Configure Signers', category: 'Multi-Signature' },

      // Enterprise Wallets
      { id: 'enterprise:wallet:create', name: 'Create Enterprise Wallet', category: 'Enterprise Wallet' },
      { id: 'enterprise:wallet:manage', name: 'Manage Enterprise Wallet', category: 'Enterprise Wallet' },
      { id: 'enterprise:wallet:delegate', name: 'Delegate Wallet Access', category: 'Enterprise Wallet' },
      { id: 'enterprise:wallet:audit', name: 'Audit Enterprise Wallets', category: 'Enterprise Wallet' },

      // Compliance & KYB
      { id: 'kyb:initiate', name: 'Initiate KYB', category: 'Compliance' },
      { id: 'kyb:verify', name: 'Verify Business', category: 'Compliance' },
      { id: 'kyb:approve', name: 'Approve KYB', category: 'Compliance' },
      { id: 'compliance:monitor', name: 'Monitor Compliance', category: 'Compliance' },
      { id: 'compliance:report', name: 'Generate Compliance Reports', category: 'Compliance' },
      { id: 'compliance:override', name: 'Override Compliance Rules', category: 'Compliance' },

      // Smart Contract Management
      { id: 'contract:deploy', name: 'Deploy Smart Contract', category: 'Smart Contract' },
      { id: 'contract:upgrade', name: 'Upgrade Smart Contract', category: 'Smart Contract' },
      { id: 'contract:pause', name: 'Pause Contract', category: 'Smart Contract' },
      { id: 'contract:audit', name: 'Audit Contract', category: 'Smart Contract' },

      // Cross-Rail Operations
      { id: 'crossrail:initiate', name: 'Initiate Cross-Rail Transfer', category: 'Cross-Rail' },
      { id: 'crossrail:approve', name: 'Approve Cross-Rail Transfer', category: 'Cross-Rail' },
      { id: 'crossrail:monitor', name: 'Monitor Cross-Rail Operations', category: 'Cross-Rail' },
      { id: 'crossrail:reconcile', name: 'Reconcile Cross-Rail', category: 'Cross-Rail' },

      // Business Rule Framework
      { id: 'brf:create', name: 'Create Business Rule', category: 'Business Rules' },
      { id: 'brf:modify', name: 'Modify Business Rule', category: 'Business Rules' },
      { id: 'brf:activate', name: 'Activate Business Rule', category: 'Business Rules' },
      { id: 'brf:override', name: 'Override Business Rule', category: 'Business Rules' },

      // Industry-Specific Permissions
      { id: 'banking:operations', name: 'Banking Operations', category: 'Banking' },
      { id: 'banking:lending', name: 'Lending Operations', category: 'Banking' },
      { id: 'banking:forex', name: 'Forex Operations', category: 'Banking' },

      { id: 'fintech:payments', name: 'Payment Processing', category: 'Fintech' },
      { id: 'fintech:cards', name: 'Card Issuance', category: 'Fintech' },
      { id: 'fintech:wallets', name: 'Wallet Management', category: 'Fintech' },

      { id: 'healthcare:claims', name: 'Claims Processing', category: 'Healthcare' },
      { id: 'healthcare:provider', name: 'Provider Management', category: 'Healthcare' },
      { id: 'healthcare:patient', name: 'Patient Records', category: 'Healthcare' },

      { id: 'realestate:escrow', name: 'Escrow Management', category: 'Real Estate' },
      { id: 'realestate:title', name: 'Title Management', category: 'Real Estate' },
      { id: 'realestate:rent', name: 'Rent Collection', category: 'Real Estate' },

      { id: 'supplychain:tracking', name: 'Supply Chain Tracking', category: 'Supply Chain' },
      { id: 'supplychain:vendor', name: 'Vendor Management', category: 'Supply Chain' },
      { id: 'supplychain:inventory', name: 'Inventory Management', category: 'Supply Chain' },

      { id: 'government:disbursement', name: 'Government Disbursements', category: 'Government' },
      { id: 'government:benefits', name: 'Benefits Management', category: 'Government' },
      { id: 'government:grants', name: 'Grants Management', category: 'Government' },

      { id: 'manufacturing:procurement', name: 'Procurement', category: 'Manufacturing' },
      { id: 'manufacturing:quality', name: 'Quality Control', category: 'Manufacturing' },
      { id: 'manufacturing:distribution', name: 'Distribution', category: 'Manufacturing' },

      { id: 'retail:pos', name: 'POS Management', category: 'Retail' },
      { id: 'retail:inventory', name: 'Inventory Management', category: 'Retail' },
      { id: 'retail:loyalty', name: 'Loyalty Programs', category: 'Retail' },

      { id: 'insurance:underwriting', name: 'Underwriting', category: 'Insurance' },
      { id: 'insurance:claims', name: 'Claims Management', category: 'Insurance' },
      { id: 'insurance:risk', name: 'Risk Assessment', category: 'Insurance' }
    ];

    // Store permissions
    permissions.forEach(perm => {
      this.permissions.set(perm.id, perm);
    });

    // Define enterprise and industry-specific roles
    const roles = [
      // Core Enterprise Roles
      {
        id: 'enterprise-owner',
        name: 'Enterprise Owner',
        description: 'Full control over enterprise token and operations',
        permissions: ['token:*', 'treasury:*', 'multisig:*', 'enterprise:*', 'contract:*', 'crossrail:*', 'brf:*'],
        industry: 'all',
        isSystem: true,
        priority: 100
      },
      {
        id: 'enterprise-cfo',
        name: 'Chief Financial Officer',
        description: 'Financial operations and treasury management',
        permissions: ['treasury:*', 'token:transfer', 'token:mint', 'token:burn', 'enterprise:wallet:*', 'compliance:report', 'crossrail:*'],
        industry: 'all',
        isSystem: true,
        priority: 95
      },
      {
        id: 'enterprise-treasurer',
        name: 'Enterprise Treasurer',
        description: 'Treasury and liquidity management',
        permissions: ['treasury:manage', 'treasury:liquidity', 'treasury:swap', 'treasury:report', 'token:transfer', 'crossrail:initiate', 'crossrail:monitor'],
        industry: 'all',
        isSystem: true,
        priority: 85
      },
      {
        id: 'enterprise-compliance',
        name: 'Enterprise Compliance Officer',
        description: 'Compliance and regulatory oversight',
        permissions: ['kyb:*', 'compliance:*', 'enterprise:wallet:audit', 'brf:create', 'brf:modify', 'contract:audit'],
        industry: 'all',
        isSystem: true,
        priority: 85
      },
      {
        id: 'enterprise-developer',
        name: 'Enterprise Developer',
        description: 'Smart contract and integration development',
        permissions: ['contract:deploy', 'contract:upgrade', 'contract:audit', 'brf:create', 'brf:modify'],
        industry: 'all',
        isSystem: true,
        priority: 75
      },

      // Banking Industry Roles
      {
        id: 'bank-manager',
        name: 'Bank Manager',
        description: 'Banking operations manager',
        permissions: ['banking:*', 'treasury:manage', 'compliance:monitor', 'kyb:verify'],
        industry: 'banking',
        isSystem: true,
        priority: 80
      },
      {
        id: 'loan-officer',
        name: 'Loan Officer',
        description: 'Lending and credit operations',
        permissions: ['banking:lending', 'kyb:initiate', 'compliance:monitor', 'token:transfer'],
        industry: 'banking',
        isSystem: true,
        priority: 70
      },
      {
        id: 'forex-trader',
        name: 'Forex Trader',
        description: 'Foreign exchange operations',
        permissions: ['banking:forex', 'treasury:swap', 'crossrail:*', 'token:transfer'],
        industry: 'banking',
        isSystem: true,
        priority: 70
      },

      // Fintech Industry Roles
      {
        id: 'payment-processor',
        name: 'Payment Processor',
        description: 'Payment processing operations',
        permissions: ['fintech:payments', 'token:transfer', 'crossrail:initiate', 'compliance:monitor'],
        industry: 'fintech',
        isSystem: true,
        priority: 75
      },
      {
        id: 'card-program-manager',
        name: 'Card Program Manager',
        description: 'Card issuance and management',
        permissions: ['fintech:cards', 'fintech:wallets', 'kyb:verify', 'compliance:monitor'],
        industry: 'fintech',
        isSystem: true,
        priority: 75
      },

      // Healthcare Industry Roles
      {
        id: 'healthcare-administrator',
        name: 'Healthcare Administrator',
        description: 'Healthcare payment administration',
        permissions: ['healthcare:*', 'compliance:monitor', 'token:transfer'],
        industry: 'healthcare',
        isSystem: true,
        priority: 80
      },
      {
        id: 'claims-processor',
        name: 'Claims Processor',
        description: 'Insurance claims processing',
        permissions: ['healthcare:claims', 'token:transfer', 'compliance:report'],
        industry: 'healthcare',
        isSystem: true,
        priority: 70
      },
      {
        id: 'provider-manager',
        name: 'Provider Network Manager',
        description: 'Healthcare provider management',
        permissions: ['healthcare:provider', 'kyb:verify', 'enterprise:wallet:manage'],
        industry: 'healthcare',
        isSystem: true,
        priority: 70
      },

      // Real Estate Industry Roles
      {
        id: 'escrow-agent',
        name: 'Escrow Agent',
        description: 'Real estate escrow management',
        permissions: ['realestate:escrow', 'token:transfer', 'multisig:*', 'compliance:monitor'],
        industry: 'realestate',
        isSystem: true,
        priority: 75
      },
      {
        id: 'property-manager',
        name: 'Property Manager',
        description: 'Property and rent management',
        permissions: ['realestate:rent', 'token:transfer', 'enterprise:wallet:manage'],
        industry: 'realestate',
        isSystem: true,
        priority: 70
      },

      // Supply Chain Industry Roles
      {
        id: 'supply-chain-manager',
        name: 'Supply Chain Manager',
        description: 'Supply chain operations management',
        permissions: ['supplychain:*', 'token:transfer', 'crossrail:*', 'brf:create'],
        industry: 'supplychain',
        isSystem: true,
        priority: 80
      },
      {
        id: 'vendor-manager',
        name: 'Vendor Manager',
        description: 'Vendor relationship management',
        permissions: ['supplychain:vendor', 'kyb:initiate', 'token:transfer', 'enterprise:wallet:manage'],
        industry: 'supplychain',
        isSystem: true,
        priority: 70
      },

      // Government/Public Sector Industry Roles
      {
        id: 'government-administrator',
        name: 'Government Administrator',
        description: 'Government payment administration',
        permissions: ['government:*', 'compliance:*', 'treasury:*', 'multisig:*'],
        industry: 'government',
        isSystem: true,
        priority: 85
      },
      {
        id: 'federal-program-director',
        name: 'Federal Program Director',
        description: 'Federal program management and oversight',
        permissions: ['government:*', 'treasury:*', 'compliance:*', 'brf:*', 'multisig:*'],
        industry: 'government',
        isSystem: true,
        priority: 90
      },
      {
        id: 'state-treasurer',
        name: 'State Treasurer',
        description: 'State-level treasury and financial operations',
        permissions: ['treasury:*', 'government:disbursement', 'government:grants', 'compliance:*', 'multisig:*'],
        industry: 'government',
        isSystem: true,
        priority: 85
      },
      {
        id: 'municipal-finance-officer',
        name: 'Municipal Finance Officer',
        description: 'City/local government financial operations',
        permissions: ['government:disbursement', 'treasury:manage', 'compliance:monitor', 'token:transfer'],
        industry: 'government',
        isSystem: true,
        priority: 75
      },
      {
        id: 'benefits-coordinator',
        name: 'Benefits Coordinator',
        description: 'Social benefits distribution management (SNAP, TANF, unemployment)',
        permissions: ['government:benefits', 'government:disbursement', 'token:transfer', 'compliance:monitor'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'emergency-response-coordinator',
        name: 'Emergency Response Coordinator',
        description: 'Emergency/disaster relief fund management',
        permissions: ['government:disbursement', 'token:transfer', 'treasury:liquidity', 'crossrail:initiate'],
        industry: 'government',
        isSystem: true,
        priority: 75
      },
      {
        id: 'grants-officer',
        name: 'Grants Officer',
        description: 'Grants management and disbursement',
        permissions: ['government:grants', 'token:transfer', 'compliance:report', 'multisig:approve'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'public-procurement-officer',
        name: 'Public Procurement Officer',
        description: 'Government procurement and vendor payment management',
        permissions: ['government:disbursement', 'kyb:verify', 'token:transfer', 'multisig:approve'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'tax-administrator',
        name: 'Tax Administrator',
        description: 'Tax collection and refund management',
        permissions: ['government:disbursement', 'treasury:manage', 'compliance:monitor', 'token:transfer'],
        industry: 'government',
        isSystem: true,
        priority: 75
      },
      {
        id: 'public-health-administrator',
        name: 'Public Health Administrator',
        description: 'Public health program payments and reimbursements',
        permissions: ['government:benefits', 'healthcare:*', 'token:transfer', 'compliance:monitor'],
        industry: 'government',
        isSystem: true,
        priority: 75
      },
      {
        id: 'education-finance-officer',
        name: 'Education Finance Officer',
        description: 'Education funding and grant disbursements',
        permissions: ['government:grants', 'government:disbursement', 'token:transfer', 'compliance:report'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'transportation-administrator',
        name: 'Transportation Administrator',
        description: 'Transportation and infrastructure payment management',
        permissions: ['government:disbursement', 'treasury:manage', 'token:transfer', 'multisig:approve'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'veterans-affairs-officer',
        name: 'Veterans Affairs Officer',
        description: 'Veterans benefits and services payment management',
        permissions: ['government:benefits', 'government:disbursement', 'healthcare:*', 'token:transfer'],
        industry: 'government',
        isSystem: true,
        priority: 70
      },
      {
        id: 'social-security-administrator',
        name: 'Social Security Administrator',
        description: 'Social security and pension disbursements',
        permissions: ['government:benefits', 'government:disbursement', 'compliance:*', 'token:transfer'],
        industry: 'government',
        isSystem: true,
        priority: 75
      },
      {
        id: 'public-auditor',
        name: 'Public Auditor',
        description: 'Government spending audit and oversight',
        permissions: ['compliance:*', 'enterprise:wallet:audit', 'treasury:report', 'contract:audit'],
        industry: 'government',
        isSystem: true,
        priority: 80
      },

      // Manufacturing Industry Roles
      {
        id: 'procurement-manager',
        name: 'Procurement Manager',
        description: 'Manufacturing procurement operations',
        permissions: ['manufacturing:procurement', 'supplychain:vendor', 'token:transfer', 'enterprise:wallet:manage'],
        industry: 'manufacturing',
        isSystem: true,
        priority: 75
      },
      {
        id: 'quality-controller',
        name: 'Quality Controller',
        description: 'Quality assurance and control',
        permissions: ['manufacturing:quality', 'compliance:monitor', 'brf:create'],
        industry: 'manufacturing',
        isSystem: true,
        priority: 70
      },

      // Retail Industry Roles
      {
        id: 'retail-manager',
        name: 'Retail Manager',
        description: 'Retail operations management',
        permissions: ['retail:*', 'token:transfer', 'fintech:payments', 'enterprise:wallet:manage'],
        industry: 'retail',
        isSystem: true,
        priority: 75
      },
      {
        id: 'pos-administrator',
        name: 'POS Administrator',
        description: 'Point of sale system management',
        permissions: ['retail:pos', 'fintech:payments', 'token:transfer'],
        industry: 'retail',
        isSystem: true,
        priority: 65
      },

      // Insurance Industry Roles
      {
        id: 'insurance-underwriter',
        name: 'Insurance Underwriter',
        description: 'Insurance underwriting and risk assessment',
        permissions: ['insurance:underwriting', 'insurance:risk', 'kyb:verify', 'compliance:monitor'],
        industry: 'insurance',
        isSystem: true,
        priority: 75
      },
      {
        id: 'insurance-claims-manager',
        name: 'Insurance Claims Manager',
        description: 'Insurance claims processing and management',
        permissions: ['insurance:claims', 'token:transfer', 'multisig:approve', 'compliance:report'],
        industry: 'insurance',
        isSystem: true,
        priority: 70
      }
    ];

    // Expand and store roles
    roles.forEach(role => {
      role.permissions = this.expandWildcardPermissions(role.permissions);
      this.roles.set(role.id, role);
    });

    // Initialize industry-specific compliance policies
    this.initializeIndustryPolicies();
  }

  /**
   * Initialize industry-specific compliance policies
   */
  initializeIndustryPolicies() {
    // Banking compliance policies
    this.industryPolicies.set('banking', {
      maxTransactionAmount: 10000000, // $10M
      requiresMultiSig: true,
      multiSigThreshold: 2,
      kycLevel: 'enhanced',
      amlMonitoring: 'real-time',
      requiredCompliance: ['BSA', 'AML', 'KYC', 'OFAC'],
      transactionLimits: {
        daily: 50000000,
        weekly: 200000000,
        monthly: 500000000
      }
    });

    // Healthcare compliance policies
    this.industryPolicies.set('healthcare', {
      maxTransactionAmount: 1000000,
      requiresMultiSig: true,
      multiSigThreshold: 2,
      requiredCompliance: ['HIPAA', 'HITECH', 'ACA'],
      dataPrivacy: 'strict',
      auditFrequency: 'quarterly',
      transactionLimits: {
        daily: 5000000,
        weekly: 20000000,
        monthly: 50000000
      }
    });

    // Government compliance policies
    this.industryPolicies.set('government', {
      maxTransactionAmount: 100000000,
      requiresMultiSig: true,
      multiSigThreshold: 3,
      requiredCompliance: ['FISMA', 'FedRAMP', 'NIST'],
      auditTrail: 'comprehensive',
      retentionPeriod: 7, // years
      transactionLimits: {
        daily: 500000000,
        weekly: 2000000000,
        monthly: 5000000000
      }
    });

    // Real Estate compliance policies
    this.industryPolicies.set('realestate', {
      maxTransactionAmount: 50000000,
      requiresMultiSig: true,
      multiSigThreshold: 2,
      requiredCompliance: ['RESPA', 'TRID', 'Fair Housing'],
      escrowRequired: true,
      titleVerification: true,
      transactionLimits: {
        daily: 100000000,
        weekly: 400000000,
        monthly: 1000000000
      }
    });

    // Fintech compliance policies
    this.industryPolicies.set('fintech', {
      maxTransactionAmount: 1000000,
      requiresMultiSig: false,
      kycLevel: 'standard',
      requiredCompliance: ['PCI-DSS', 'PSD2', 'EMV'],
      fraudMonitoring: 'real-time',
      transactionLimits: {
        daily: 10000000,
        weekly: 50000000,
        monthly: 150000000
      }
    });

    // Supply Chain compliance policies
    this.industryPolicies.set('supplychain', {
      maxTransactionAmount: 5000000,
      requiresMultiSig: true,
      multiSigThreshold: 2,
      requiredCompliance: ['ISO-28000', 'C-TPAT', 'ISPS'],
      trackingRequired: true,
      vendorVerification: true,
      transactionLimits: {
        daily: 25000000,
        weekly: 100000000,
        monthly: 300000000
      }
    });

    // Insurance compliance policies
    this.industryPolicies.set('insurance', {
      maxTransactionAmount: 10000000,
      requiresMultiSig: true,
      multiSigThreshold: 2,
      requiredCompliance: ['Solvency II', 'ORSA', 'NAIC'],
      reserveRequirements: true,
      actuarialReview: true,
      transactionLimits: {
        daily: 50000000,
        weekly: 200000000,
        monthly: 500000000
      }
    });

    // Manufacturing compliance policies
    this.industryPolicies.set('manufacturing', {
      maxTransactionAmount: 5000000,
      requiresMultiSig: false,
      requiredCompliance: ['ISO-9001', 'ISO-14001', 'OSHA'],
      qualityControl: true,
      traceability: true,
      transactionLimits: {
        daily: 20000000,
        weekly: 80000000,
        monthly: 200000000
      }
    });

    // Retail compliance policies
    this.industryPolicies.set('retail', {
      maxTransactionAmount: 500000,
      requiresMultiSig: false,
      requiredCompliance: ['PCI-DSS', 'GDPR', 'CCPA'],
      inventoryTracking: true,
      returnPolicy: true,
      transactionLimits: {
        daily: 5000000,
        weekly: 20000000,
        monthly: 60000000
      }
    });
  }

  /**
   * Expand wildcard permissions
   */
  expandWildcardPermissions(permissions) {
    const expanded = new Set();

    permissions.forEach(perm => {
      if (perm.includes('*')) {
        const prefix = perm.replace('*', '');
        this.permissions.forEach((_, key) => {
          if (key.startsWith(prefix)) {
            expanded.add(key);
          }
        });
      } else {
        expanded.add(perm);
      }
    });

    return Array.from(expanded);
  }

  /**
   * Get roles by industry
   */
  getRolesByIndustry(industry) {
    return Array.from(this.roles.values())
      .filter(role => role.industry === industry || role.industry === 'all');
  }

  /**
   * Check industry compliance
   */
  checkIndustryCompliance(industry, transaction) {
    const policy = this.industryPolicies.get(industry);
    if (!policy) return { compliant: true, reasons: [] };

    const reasons = [];

    // Check transaction amount
    if (transaction.amount > policy.maxTransactionAmount) {
      reasons.push(`Transaction exceeds maximum amount of ${policy.maxTransactionAmount}`);
    }

    // Check daily limit
    if (transaction.dailyTotal > policy.transactionLimits.daily) {
      reasons.push(`Daily transaction limit exceeded`);
    }

    // Check multi-sig requirement
    if (policy.requiresMultiSig && (!transaction.signatures || transaction.signatures.length < policy.multiSigThreshold)) {
      reasons.push(`Requires ${policy.multiSigThreshold} signatures`);
    }

    // Check required compliance
    if (policy.requiredCompliance) {
      const missingCompliance = policy.requiredCompliance.filter(
        req => !transaction.compliance || !transaction.compliance.includes(req)
      );
      if (missingCompliance.length > 0) {
        reasons.push(`Missing compliance: ${missingCompliance.join(', ')}`);
      }
    }

    return {
      compliant: reasons.length === 0,
      reasons
    };
  }

  /**
   * Create industry-specific role
   */
  async createIndustryRole({
    name,
    description,
    permissions,
    industry,
    priority = 50,
    tenantId
  }) {
    // Validate industry
    const validIndustries = ['banking', 'fintech', 'healthcare', 'realestate', 'supplychain',
                           'government', 'manufacturing', 'retail', 'insurance'];

    if (!validIndustries.includes(industry)) {
      throw new Error(`Invalid industry. Must be one of: ${validIndustries.join(', ')}`);
    }

    const roleId = crypto.randomUUID();

    const role = {
      id: roleId,
      name,
      description,
      permissions: this.expandWildcardPermissions(permissions),
      industry,
      isSystem: false,
      priority,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(roleId, role);
    this.emit('role:created', role);

    return role;
  }

  /**
   * Assign user to industry
   */
  async assignUserToIndustry(userId, industry) {
    if (!this.userIndustries) {
      this.userIndustries = new Map();
    }

    this.userIndustries.set(userId, industry);
    this.emit('user:industry:assigned', { userId, industry });

    return { success: true };
  }

  /**
   * Get user's industry-specific permissions
   */
  getUserIndustryPermissions(userId) {
    const industry = this.userIndustries?.get(userId) || 'general';
    const userRoles = this.getUserRoles(userId);
    const permissions = new Set();

    // Get permissions from roles that match user's industry
    userRoles.forEach(role => {
      if (role.industry === industry || role.industry === 'all') {
        role.permissions.forEach(perm => permissions.add(perm));
      }
    });

    return Array.from(permissions);
  }

  /**
   * Validate enterprise operation
   */
  validateEnterpriseOperation({
    userId,
    operation,
    amount,
    industry,
    metadata = {}
  }) {
    // Check user permissions
    const hasPermission = this.hasPermission(userId, operation);
    if (!hasPermission) {
      return {
        valid: false,
        reason: 'Insufficient permissions'
      };
    }

    // Check industry compliance
    const compliance = this.checkIndustryCompliance(industry, {
      amount,
      dailyTotal: metadata.dailyTotal || 0,
      signatures: metadata.signatures || [],
      compliance: metadata.compliance || []
    });

    if (!compliance.compliant) {
      return {
        valid: false,
        reason: compliance.reasons[0],
        details: compliance.reasons
      };
    }

    // Additional enterprise checks
    if (operation.startsWith('treasury:') && amount > 1000000) {
      if (!metadata.approvals || metadata.approvals.length < 2) {
        return {
          valid: false,
          reason: 'Large treasury operations require multiple approvals'
        };
      }
    }

    if (operation.startsWith('token:mint') || operation.startsWith('token:burn')) {
      if (!metadata.justification) {
        return {
          valid: false,
          reason: 'Token supply changes require justification'
        };
      }
    }

    return {
      valid: true
    };
  }

  /**
   * Get compliance requirements for industry
   */
  getIndustryComplianceRequirements(industry) {
    const policy = this.industryPolicies.get(industry);
    if (!policy) return null;

    return {
      industry,
      requirements: policy.requiredCompliance || [],
      limits: policy.transactionLimits,
      multiSig: {
        required: policy.requiresMultiSig,
        threshold: policy.multiSigThreshold
      },
      maxTransaction: policy.maxTransactionAmount,
      additionalChecks: Object.keys(policy).filter(
        key => !['maxTransactionAmount', 'requiresMultiSig', 'multiSigThreshold',
               'requiredCompliance', 'transactionLimits'].includes(key)
      ).reduce((acc, key) => {
        acc[key] = policy[key];
        return acc;
      }, {})
    };
  }

  /**
   * Inherit parent class methods
   */
  getUserRoles(userId) {
    const roleIds = this.userRoles.get(userId) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean);
  }

  async assignRole(userId, roleId) {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, []);
    }

    const userRoles = this.userRoles.get(userId);
    if (!userRoles.includes(roleId)) {
      userRoles.push(roleId);
    }

    this.emit('role:assigned', { userId, roleId });
    return { success: true };
  }

  hasPermission(userId, permission, resource = null) {
    const userRoles = this.getUserRoles(userId);
    if (userRoles.some(role => role.id === 'enterprise-owner')) {
      return true;
    }

    const userPermissions = this.getUserIndustryPermissions(userId);
    if (userPermissions.includes(permission)) {
      return true;
    }

    const [category, action] = permission.split(':');
    return userPermissions.includes(`${category}:*`);
  }

  getAllRoles(includeSystem = true) {
    const roles = Array.from(this.roles.values());
    if (!includeSystem) {
      return roles.filter(r => !r.isSystem);
    }
    return roles;
  }

  getAllPermissions() {
    return Array.from(this.permissions.values());
  }

  getPermissionsByCategory(category) {
    return Array.from(this.permissions.values())
      .filter(p => p.category === category);
  }
}

// Singleton instance
const enterpriseRBACService = new EnterpriseRBACService();

export default enterpriseRBACService;