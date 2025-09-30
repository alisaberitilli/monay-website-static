/**
 * TypeScript Type Definitions for Compliance, KYC/KYB, Eligibility & Spend Controls
 * Core compliance features that integrate with Business Rules Framework
 */

import type { OrganizationType } from './businessRules'

// Re-export OrganizationType for convenience
export type { OrganizationType } from './businessRules'

// ============================================================================
// KYC/KYB Types
// ============================================================================

export type VerificationLevel = 'none' | 'basic' | 'enhanced' | 'full' | 'accredited'

export type VerificationStatus =
  | 'not-started'
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'suspended'

export type DocumentType =
  | 'passport'
  | 'drivers-license'
  | 'national-id'
  | 'bank-statement'
  | 'utility-bill'
  | 'tax-return'
  | 'incorporation'
  | 'business-license'
  | 'financial-statement'

export type KYCProvider = 'persona' | 'alloy' | 'onfido' | 'jumio' | 'sumsub'

// Individual KYC
export interface KYCProfile {
  userId: string;
  level: VerificationLevel;
  status: VerificationStatus;

  // Personal Information
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    ssn?: string; // encrypted
    taxId?: string; // encrypted
    nationality: string;
    residenceCountry: string;
  };

  // Documents
  documents: Array<{
    type: DocumentType;
    status: VerificationStatus;
    uploadedAt: Date;
    verifiedAt?: Date;
    expiresAt?: Date;
    provider?: KYCProvider;
    providerRef?: string;
  }>;

  // Verification Results
  verification: {
    identityScore?: number;
    addressVerified: boolean;
    sanctionsCheck: 'clear' | 'match' | 'potential-match';
    pepCheck: boolean; // Politically Exposed Person
    adverseMedia: boolean;

    // Risk Assessment
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'unacceptable';
    riskFactors?: string[];
  };

  // Compliance
  compliance: {
    amlStatus: 'clear' | 'review' | 'flagged';
    ofacCheck: boolean;
    euSanctions: boolean;
    unSanctions: boolean;
    lastChecked: Date;
    nextReview: Date;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
}

// Business KYB
export interface KYBProfile {
  organizationId: string;
  level: VerificationLevel;
  status: VerificationStatus;

  // Business Information
  business: {
    legalName: string;
    dba?: string; // Doing Business As
    type: 'corporation' | 'llc' | 'partnership' | 'sole-proprietor' | 'non-profit' | 'government';
    registrationNumber: string;
    taxId: string; // EIN
    incorporationDate: Date;
    incorporationCountry: string;
    incorporationState?: string;

    // Industry
    industryCode: string; // NAICS/SIC
    industryDescription: string;
    businessDescription: string;
  };

  // Ownership Structure
  ownership: {
    beneficialOwners: Array<{
      person: KYCProfile;
      ownershipPercentage: number;
      isController: boolean;
      title?: string;
    }>;
    controlStructure: 'direct' | 'indirect' | 'trust' | 'complex';
  };

  // Documents
  documents: Array<{
    type: DocumentType;
    status: VerificationStatus;
    uploadedAt: Date;
    verifiedAt?: Date;
    expiresAt?: Date;
  }>;

  // Financial Information
  financial: {
    annualRevenue?: number;
    monthlyVolume?: number;
    bankAccounts?: number;
    creditScore?: number;
    financialStatements?: boolean;
  };

  // Verification Results
  verification: {
    businessVerified: boolean;
    addressVerified: boolean;
    bankAccountVerified: boolean;

    // Risk Assessment
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'unacceptable';
    riskFactors?: string[];
  };

  // Compliance
  compliance: {
    amlStatus: 'clear' | 'review' | 'flagged';
    sanctionsCheck: 'clear' | 'match' | 'potential-match';
    licenseVerified?: boolean;
    regulatoryStatus?: string;
    lastChecked: Date;
    nextReview: Date;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
}

// ============================================================================
// Eligibility Framework
// ============================================================================

export type EligibilityType =
  | 'account-opening'
  | 'feature-access'
  | 'benefit-enrollment'
  | 'investment-product'
  | 'credit-line'
  | 'government-program'
  | 'grant-application'

export interface EligibilityRequirement {
  id: string;
  type: EligibilityType;
  name: string;
  description: string;

  // Requirements
  requirements: {
    // Identity Requirements
    verificationLevel?: VerificationLevel;
    ageMin?: number;
    ageMax?: number;
    residency?: string[];
    citizenship?: string[];

    // Financial Requirements
    minBalance?: number;
    minIncome?: number;
    creditScoreMin?: number;
    accountAge?: number; // days

    // Business Requirements (for KYB)
    businessType?: string[];
    industryRestrictions?: string[];
    minRevenue?: number;
    yearsInBusiness?: number;

    // Investment Requirements
    accreditedInvestor?: boolean;
    qualifiedPurchaser?: boolean;
    sophisticatedInvestor?: boolean;

    // Government Program Requirements
    incomeLimit?: number;
    householdSize?: number;
    disabilityStatus?: boolean;
    veteranStatus?: boolean;
    studentStatus?: boolean;

    // Custom Requirements
    customChecks?: Array<{
      field: string;
      operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains';
      value: any;
    }>;
  };

  // Organization-specific
  organizationType?: OrganizationType;

  // Automation
  autoApprove: boolean;
  manualReviewRequired?: boolean;

  // Valid period
  validFrom?: Date;
  validUntil?: Date;
}

export interface EligibilityCheck {
  id: string;
  userId?: string;
  organizationId?: string;
  requirementId: string;

  // Check Results
  result: {
    eligible: boolean;
    score?: number; // 0-100
    missingRequirements?: string[];
    partiallyMet?: string[];

    // Detailed checks
    checks: Array<{
      requirement: string;
      met: boolean;
      value?: any;
      reason?: string;
    }>;
  };

  // Override capability
  override?: {
    overridden: boolean;
    reason?: string;
    authorizedBy?: string;
    authorizedAt?: Date;
    expiresAt?: Date;
  };

  // Timestamps
  checkedAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// Spend Controls
// ============================================================================

export type SpendControlType =
  | 'transaction-limit'
  | 'daily-limit'
  | 'weekly-limit'
  | 'monthly-limit'
  | 'merchant-category'
  | 'merchant-whitelist'
  | 'merchant-blacklist'
  | 'time-restriction'
  | 'geography-restriction'
  | 'channel-restriction'

export type SpendControlScope =
  | 'user'
  | 'card'
  | 'account'
  | 'department'
  | 'organization'

export interface SpendControl {
  id: string;
  name: string;
  description: string;
  type: SpendControlType;
  scope: SpendControlScope;

  // Who it applies to
  applies: {
    userId?: string;
    cardId?: string;
    accountId?: string;
    departmentId?: string;
    organizationId?: string;
    groupIds?: string[];
  };

  // Control Configuration
  config: {
    // Amount Limits
    limits?: {
      perTransaction?: number;
      daily?: number;
      weekly?: number;
      monthly?: number;
      annual?: number;
    };

    // Merchant Controls
    merchants?: {
      allowedCategories?: string[]; // MCC codes
      blockedCategories?: string[]; // MCC codes
      allowedMerchants?: string[];
      blockedMerchants?: string[];

      // Special categories
      allowAlcohol?: boolean;
      allowGambling?: boolean;
      allowAdultContent?: boolean;
      allowCrypto?: boolean;
    };

    // Time Controls
    timeRestrictions?: {
      allowedDays?: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>;
      allowedHours?: { start: string; end: string }; // "09:00"-"17:00"
      timezone?: string;

      // Special periods
      blackoutDates?: Date[];
      allowedDates?: Date[];
    };

    // Geography Controls
    geoRestrictions?: {
      allowedCountries?: string[];
      blockedCountries?: string[];
      allowedStates?: string[];
      blockedStates?: string[];
      allowedCities?: string[];
      maxDistanceFromHome?: number; // km
    };

    // Channel Controls
    channels?: {
      allowOnline?: boolean;
      allowInStore?: boolean;
      allowATM?: boolean;
      allowInternational?: boolean;
      allowContactless?: boolean;
      allowRecurring?: boolean;
    };

    // Advanced Controls
    velocity?: {
      maxTransactionsPerHour?: number;
      maxTransactionsPerDay?: number;
      minTimeBetweenTransactions?: number; // seconds
    };
  };

  // Approval Requirements
  approval?: {
    required: boolean;
    threshold?: number;
    approvers?: string[];
    autoApproveBelow?: number;
  };

  // Override Settings
  override?: {
    allowOverride: boolean;
    overrideRoles?: string[];
    overrideDuration?: number; // hours
    requireReason?: boolean;
  };

  // Status
  status: 'active' | 'inactive' | 'suspended';
  priority: number; // for conflict resolution

  // Timestamps
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
}

// ============================================================================
// Integrated Compliance Profile
// ============================================================================

export interface ComplianceProfile {
  entityId: string;
  entityType: 'individual' | 'business';
  organizationType?: OrganizationType;

  // KYC/KYB
  kyc?: KYCProfile;
  kyb?: KYBProfile;

  // Eligibility
  eligibility: {
    checks: EligibilityCheck[];
    features: Record<string, boolean>;
    limits: Record<string, number>;
    restrictions: string[];
  };

  // Spend Controls
  spendControls: SpendControl[];

  // Aggregated Risk
  risk: {
    overallScore: number; // 0-100
    level: 'low' | 'medium' | 'high' | 'unacceptable';
    factors: Array<{
      category: string;
      score: number;
      weight: number;
      details?: string;
    }>;
  };

  // Compliance Status
  status: {
    compliant: boolean;
    issues: Array<{
      type: 'kyc' | 'aml' | 'sanctions' | 'eligibility' | 'spend-limit';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      requiredAction?: string;
      deadline?: Date;
    }>;
  };

  // Monitoring
  monitoring: {
    realTimeChecks: boolean;
    lastChecked: Date;
    nextReview: Date;
    alerts: Array<{
      id: string;
      type: string;
      message: string;
      severity: 'info' | 'warning' | 'error';
      timestamp: Date;
      acknowledged?: boolean;
    }>;
  };

  // Audit Trail
  auditLog: Array<{
    action: string;
    performedBy: string;
    timestamp: Date;
    details?: Record<string, any>;
    ipAddress?: string;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
  nextReviewDate?: Date;
}

// ============================================================================
// Organization-Specific Compliance
// ============================================================================

// Enterprise Spend Policy
export interface EnterpriseSpendPolicy {
  organizationId: string;

  // Department Budgets
  departmentBudgets: Array<{
    departmentId: string;
    departmentName: string;
    monthlyBudget: number;
    spent: number;
    remaining: number;
    controls: SpendControl[];
  }>;

  // Employee Cards
  employeeCards: Array<{
    employeeId: string;
    cardId: string;
    tier: 'basic' | 'standard' | 'premium' | 'executive';
    monthlyLimit: number;
    controls: SpendControl[];
  }>;

  // Vendor Management
  vendors: {
    approved: string[];
    blocked: string[];
    preferredPaymentTerms: Record<string, string>;
  };
}

// Government Compliance
export interface GovernmentCompliance {
  agencyId: string;

  // Budget Controls
  budgetControls: {
    fiscalYear: string;
    allocatedBudget: number;
    committedFunds: number;
    obligatedFunds: number;
    expendedFunds: number;
  };

  // Procurement Rules
  procurement: {
    microPurchaseThreshold: number;
    simplifiedAcquisitionThreshold: number;
    competitiveBidThreshold: number;
    soleSourceJustificationRequired: number;
  };

  // Grant Management
  grants: Array<{
    grantId: string;
    recipientEligibility: EligibilityRequirement;
    spendingRestrictions: SpendControl[];
    reportingRequirements: string[];
  }>;
}

// Capital Markets Compliance
export interface CapitalMarketsCompliance {
  institutionId: string;

  // Trading Limits
  tradingLimits: {
    dailyTradingLimit: number;
    positionLimits: Record<string, number>;
    concentrationLimits: Record<string, number>;

    // Risk Limits
    varLimit: number; // Value at Risk
    stressTestLimits: Record<string, number>;
  };

  // Investor Eligibility
  investorEligibility: {
    accreditedInvestorCheck: EligibilityRequirement;
    qualifiedPurchaserCheck: EligibilityRequirement;
    sophisticatedInvestorCheck: EligibilityRequirement;
  };

  // Regulatory Reporting
  regulatory: {
    mifidII: boolean;
    doddFrank: boolean;
    volcker: boolean;
    basel: 'III' | 'IV';
    reportingSchedule: Record<string, string>;
  };
}

// ============================================================================
// Compliance Rules Integration with Business Rules Framework
// ============================================================================

export interface ComplianceRule {
  id: string;
  type: 'kyc' | 'kyb' | 'eligibility' | 'spend-control';

  // Integration with Business Rules
  businessRuleId?: string;

  // Trigger Conditions
  triggers: Array<{
    event: string;
    conditions: Record<string, any>;
  }>;

  // Actions
  actions: Array<{
    type: 'block' | 'flag' | 'approve' | 'escalate' | 'notify';
    parameters?: Record<string, any>;
  }>;

  // Enforcement
  enforcement: {
    mode: 'strict' | 'flexible' | 'advisory';
    allowOverride: boolean;
    overrideRoles?: string[];
  };
}

// ============================================================================
// Real-time Compliance Monitoring
// ============================================================================

export interface ComplianceMonitor {
  entityId: string;

  // Real-time checks
  realTimeChecks: {
    kyc: boolean;
    aml: boolean;
    sanctions: boolean;
    spendLimits: boolean;
    velocity: boolean;
  };

  // Thresholds
  thresholds: {
    transactionLimit: number;
    velocityLimit: number;
    riskScoreLimit: number;
  };

  // Alerts
  alerts: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    status: 'new' | 'acknowledged' | 'resolved' | 'escalated';
    assignedTo?: string;
  }>;

  // Metrics
  metrics: {
    transactionsMonitored: number;
    alertsGenerated: number;
    falsePositives: number;
    truePositives: number;
    avgResponseTime: number; // minutes
  };
}