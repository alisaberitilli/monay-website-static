/**
 * TypeScript Type Definitions for Business Rules Framework (BRF)
 * Dynamic Programmable Money Rules by Organization Type
 */

// Organization Types
export type OrganizationType =
  | 'enterprise'
  | 'government'
  | 'financial-institution'
  | 'healthcare'
  | 'education';

// Rule Categories by Organization Type
export type EnterpriseRuleCategory =
  | 'payment-approval'
  | 'spending-limits'
  | 'vendor-management'
  | 'treasury-controls'
  | 'compliance-checks';

export type GovernmentRuleCategory =
  | 'budget-controls'
  | 'procurement-rules'
  | 'grant-management'
  | 'citizen-services'
  | 'regulatory-compliance';

export type FinancialRuleCategory =
  | 'trading-limits'
  | 'risk-management'
  | 'settlement-rules'
  | 'capital-requirements'
  | 'regulatory-reporting';

export type HealthcareRuleCategory =
  | 'hipaa-compliance'
  | 'billing-rules'
  | 'insurance-verification'
  | 'patient-privacy'
  | 'prescription-controls';

export type EducationRuleCategory =
  | 'tuition-management'
  | 'scholarship-rules'
  | 'grant-allocation'
  | 'student-verification'
  | 'financial-aid';

export type RuleCategory =
  | EnterpriseRuleCategory
  | GovernmentRuleCategory
  | FinancialRuleCategory
  | HealthcareRuleCategory
  | EducationRuleCategory;

// Rule Trigger Types
export type TriggerType =
  | 'transaction'
  | 'balance-change'
  | 'time-based'
  | 'threshold'
  | 'user-action'
  | 'external-event'
  | 'smart-contract';

// Rule Actions
export type ActionType =
  | 'approve'
  | 'reject'
  | 'hold'
  | 'notify'
  | 'escalate'
  | 'log'
  | 'execute-contract'
  | 'trigger-workflow';

// Rule Operators
export type Operator =
  | 'equals'
  | 'not-equals'
  | 'greater-than'
  | 'less-than'
  | 'greater-or-equal'
  | 'less-or-equal'
  | 'contains'
  | 'not-contains'
  | 'in'
  | 'not-in'
  | 'between'
  | 'regex';

// Rule Status
export type RuleStatus = 'active' | 'inactive' | 'testing' | 'archived';

// Rule Priority
export type RulePriority = 'critical' | 'high' | 'medium' | 'low';

// Condition Interface
export interface RuleCondition {
  id: string;
  field: string;
  operator: Operator;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

  // Nested conditions for complex logic
  and?: RuleCondition[];
  or?: RuleCondition[];
  not?: boolean;
}

// Action Interface
export interface RuleAction {
  id: string;
  type: ActionType;

  // Action-specific parameters
  parameters?: {
    // For notifications
    notificationChannels?: Array<'email' | 'sms' | 'push' | 'webhook'>;
    recipients?: string[];
    message?: string;

    // For smart contract execution
    contractAddress?: string;
    functionName?: string;
    functionParams?: any[];
    gasLimit?: bigint;

    // For workflow triggers
    workflowId?: string;
    workflowParams?: Record<string, any>;

    // For approvals
    approvalLevels?: number;
    approvers?: string[];
    timeoutHours?: number;
  };

  // Conditional actions
  conditions?: RuleCondition[];
}

// Main Business Rule Interface
export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  organizationType: OrganizationType;
  category: RuleCategory;

  // Rule Configuration
  config: {
    priority: RulePriority;
    status: RuleStatus;
    version: number;

    // Trigger Configuration
    triggers: Array<{
      type: TriggerType;
      parameters: Record<string, any>;
    }>;

    // Rule Logic
    conditions: RuleCondition[];
    actions: RuleAction[];

    // Execution Settings
    execution: {
      mode: 'sync' | 'async';
      timeout?: number; // seconds
      retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
      };
    };

    // Compliance & Audit
    compliance?: {
      regulations?: string[];
      auditLog: boolean;
      dataRetention?: number; // days
    };
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  lastExecutedAt?: Date;

  // Statistics
  stats?: {
    executionCount: number;
    successCount: number;
    failureCount: number;
    avgExecutionTime: number; // ms
    lastError?: string;
  };
}

// Rule Template for Quick Creation
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  organizationType: OrganizationType;
  category: RuleCategory;

  // Pre-configured rule settings
  template: Partial<BusinessRule['config']>;

  // Customizable parameters
  parameters: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
    required: boolean;
    defaultValue?: any;
    options?: Array<{ value: any; label: string }>;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }>;

  // Examples and use cases
  examples?: Array<{
    scenario: string;
    configuration: Record<string, any>;
    expectedBehavior: string;
  }>;

  tags?: string[];
  isPremium?: boolean;
}

// Organization-Specific Rule Sets
export interface EnterpriseRuleSet {
  organizationId: string;
  organizationType: 'enterprise';

  rules: {
    paymentApprovals: BusinessRule[];
    spendingLimits: BusinessRule[];
    vendorManagement: BusinessRule[];
    treasuryControls: BusinessRule[];
    complianceChecks: BusinessRule[];
  };

  // Enterprise-specific settings
  settings: {
    multiLevelApproval: boolean;
    departmentBudgets: boolean;
    vendorWhitelist: boolean;
    automaticReconciliation: boolean;
  };
}

export interface GovernmentRuleSet {
  organizationId: string;
  organizationType: 'government';

  rules: {
    budgetControls: BusinessRule[];
    procurementRules: BusinessRule[];
    grantManagement: BusinessRule[];
    citizenServices: BusinessRule[];
    regulatoryCompliance: BusinessRule[];
  };

  // Government-specific settings
  settings: {
    publicTransparency: boolean;
    federalCompliance: boolean;
    auditRequirements: 'quarterly' | 'annual';
    citizenPortalIntegration: boolean;
  };
}

export interface FinancialInstitutionRuleSet {
  organizationId: string;
  organizationType: 'financial-institution';

  rules: {
    tradingLimits: BusinessRule[];
    riskManagement: BusinessRule[];
    settlementRules: BusinessRule[];
    capitalRequirements: BusinessRule[];
    regulatoryReporting: BusinessRule[];
  };

  // Financial institution-specific settings
  settings: {
    baselCompliance: 'III' | 'IV';
    mifidReporting: boolean;
    doddFrankCompliance: boolean;
    realtimeRiskCalculation: boolean;
  };
}

// Rule Execution Context
export interface RuleExecutionContext {
  ruleId: string;
  executionId: string;
  organizationType: OrganizationType;

  // Input data that triggered the rule
  trigger: {
    type: TriggerType;
    timestamp: Date;
    source: string;
    data: Record<string, any>;
  };

  // Execution details
  execution: {
    startTime: Date;
    endTime?: Date;
    status: 'pending' | 'executing' | 'completed' | 'failed';

    // Condition evaluation results
    conditionResults: Array<{
      conditionId: string;
      result: boolean;
      evaluationTime: number; // ms
    }>;

    // Action execution results
    actionResults: Array<{
      actionId: string;
      status: 'success' | 'failure' | 'skipped';
      result?: any;
      error?: string;
      executionTime: number; // ms
    }>;
  };

  // Metadata
  metadata: {
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
    environment: 'production' | 'staging' | 'development';
  };
}

// Rule Analytics
export interface RuleAnalytics {
  ruleId: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'year';

  metrics: {
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;

    // Trigger analysis
    triggerDistribution: Record<TriggerType, number>;
    peakExecutionHours: number[];

    // Action analysis
    actionDistribution: Record<ActionType, number>;
    approvalRate?: number;
    rejectionRate?: number;

    // Impact metrics
    transactionsAffected: number;
    amountProcessed: bigint;
    usersImpacted: number;
  };

  // Trend data
  trends: Array<{
    timestamp: Date;
    executions: number;
    successRate: number;
    avgExecutionTime: number;
  }>;

  // Anomalies detected
  anomalies?: Array<{
    timestamp: Date;
    type: 'spike' | 'drop' | 'error-rate' | 'performance';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

// Rule Testing
export interface RuleTest {
  id: string;
  ruleId: string;
  name: string;
  description: string;

  // Test scenarios
  scenarios: Array<{
    name: string;
    input: Record<string, any>;
    expectedOutput: {
      shouldTrigger: boolean;
      actions?: ActionType[];
      result?: any;
    };
  }>;

  // Test execution
  execution?: {
    timestamp: Date;
    results: Array<{
      scenario: string;
      passed: boolean;
      actualOutput: any;
      executionTime: number;
      error?: string;
    }>;
    overallStatus: 'passed' | 'failed' | 'partial';
  };
}

// Smart Contract Integration
export interface SmartContractRule {
  ruleId: string;
  contractAddress: string;
  chainId: number;

  // Contract interaction
  functions: Array<{
    name: string;
    selector: string;
    inputs: Array<{
      name: string;
      type: string;
      indexed?: boolean;
    }>;
    outputs: Array<{
      name: string;
      type: string;
    }>;
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  }>;

  // Event listeners
  events: Array<{
    name: string;
    signature: string;
    inputs: Array<{
      name: string;
      type: string;
      indexed?: boolean;
    }>;
    createRule?: boolean;
  }>;

  // Gas management
  gasSettings: {
    maxGasPrice: bigint;
    priorityFee: bigint;
    gasLimit: bigint;
  };
}