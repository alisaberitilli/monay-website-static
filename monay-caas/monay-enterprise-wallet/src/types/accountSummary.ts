/**
 * TypeScript Type Definitions for Enterprise Account Summary & Billing
 * Organization-specific billing and fee tracking for Enterprise Wallet
 */

// ============================================================================
// Fee Structure Types
// ============================================================================

export type EnterpriseFeeType =
  | 'subscription_base'
  | 'per_user'
  | 'per_transaction'
  | 'kyc_verification'
  | 'kyb_verification'
  | 'token_issuance'
  | 'token_minting'
  | 'cross_rail_transfer'
  | 'api_usage'
  | 'overage'
  | 'custom_feature'

export type EnterpriseTransactionType =
  | 'token_mint'
  | 'token_burn'
  | 'cross_rail_swap'
  | 'treasury_transfer'
  | 'user_payment'
  | 'invoice_payment'
  | 'payroll'
  | 'vendor_payment'

export interface EnterpriseFee {
  id: string
  type: EnterpriseFeeType
  description: string
  amount: number
  currency: string
  date: Date
  transactionId?: string
  departmentId?: string
  userId?: string
  waived: boolean
  waivedReason?: string
}

// ============================================================================
// Organization Account Summary Types
// ============================================================================

export interface OrganizationBalance {
  treasury: {
    fiat: number
    stablecoin: number
    total: number
  }
  allocated: {
    departments: number
    users: number
    pending: number
  }
  available: number
  currency: string
  lastUpdated: Date
}

export interface OrganizationLimits {
  subscription: {
    users: number
    monthlyTransactions: number
    monthlyVolume: number
    apiCalls: number
  }
  usage: {
    users: number
    monthlyTransactions: number
    monthlyVolume: number
    apiCalls: number
  }
  percentUsed: {
    users: number
    transactions: number
    volume: number
    apiCalls: number
  }
}

export interface OrganizationBilling {
  billingCycle: {
    startDate: Date
    endDate: Date
    dueDate: Date
    status: 'current' | 'past' | 'upcoming'
  }
  currentCharges: {
    subscriptionBase: number
    userFees: number
    transactionFees: number
    verificationFees: number
    overageFees: number
    customFeatures: number
    total: number
  }
  previousMonth: {
    total: number
    paid: boolean
    paidDate?: Date
  }
  yearToDate: {
    totalBilled: number
    totalPaid: number
    outstanding: number
  }
}

export interface EnterpriseAccountSummary {
  // Organization Identity
  organizationId: string
  organizationName: string
  organizationType: 'enterprise' | 'government' | 'financial' | 'healthcare' | 'education'
  accountStatus: 'active' | 'suspended' | 'trial' | 'cancelled'

  // Subscription Details
  subscription: {
    plan: 'starter' | 'growth' | 'enterprise' | 'custom'
    planName: string
    startDate: Date
    renewalDate: Date
    pricing: {
      base: number
      perUser: number
      perTransaction: number
      discount?: number
    }
  }

  // Financial Overview
  balance: OrganizationBalance
  billing: OrganizationBilling
  limits: OrganizationLimits

  // Usage Statistics
  usage: {
    activeUsers: number
    totalTransactions: number
    transactionVolume: number
    apiCalls: number
    tokensIssued: number
    crossRailTransfers: number
  }

  // Department Breakdown
  departments: {
    id: string
    name: string
    users: number
    budget: number
    spent: number
    remaining: number
    transactions: number
  }[]

  // Invoice Management
  invoices: {
    current?: {
      id: string
      amount: number
      dueDate: Date
      status: 'draft' | 'sent' | 'paid' | 'overdue'
    }
    history: {
      id: string
      amount: number
      date: Date
      status: 'paid' | 'cancelled'
      downloadUrl?: string
    }[]
  }

  // Compliance Costs
  complianceCosts: {
    currentMonth: {
      kycCount: number
      kycCost: number
      kybCount: number
      kybCost: number
      totalCost: number
    }
    yearToDate: {
      kycCount: number
      kycCost: number
      kybCount: number
      kybCost: number
      totalCost: number
    }
  }
}

// ============================================================================
// Department & User Management Types
// ============================================================================

export interface DepartmentSummary {
  departmentId: string
  departmentName: string

  // Budget Management
  budget: {
    allocated: number
    spent: number
    remaining: number
    period: 'monthly' | 'quarterly' | 'annual'
  }

  // User Statistics
  users: {
    total: number
    active: number
    suspended: number
  }

  // Transaction Summary
  transactions: {
    count: number
    volume: number
    averageSize: number
    topCategories: {
      category: string
      count: number
      amount: number
    }[]
  }

  // Spend Controls
  spendControls: {
    dailyLimit: number
    monthlyLimit: number
    perTransactionLimit: number
    restrictedCategories: string[]
  }
}

export interface UserSpendSummary {
  userId: string
  userName: string
  email: string
  department: string

  // Spending Overview
  spending: {
    currentMonth: number
    previousMonth: number
    yearToDate: number
    averageMonthly: number
  }

  // Card Usage
  cards: {
    physical?: {
      last4: string
      currentSpend: number
      limit: number
    }
    virtual: {
      count: number
      totalSpend: number
    }[]
  }

  // Compliance Status
  compliance: {
    kycStatus: 'pending' | 'verified' | 'expired'
    kycDate?: Date
    spendLimits: {
      daily: number
      monthly: number
    }
  }
}

// ============================================================================
// Token & Treasury Management Types
// ============================================================================

export interface TokenSummary {
  tokenId: string
  tokenSymbol: string
  tokenName: string

  // Supply Metrics
  supply: {
    total: number
    circulating: number
    treasury: number
    burned: number
  }

  // Issuance History
  issuance: {
    totalMinted: number
    totalBurned: number
    lastMintDate?: Date
    lastBurnDate?: Date
  }

  // Cross-Rail Activity
  crossRail: {
    enterpriseToConsumer: {
      count: number
      volume: number
    }
    consumerToEnterprise: {
      count: number
      volume: number
    }
  }

  // Compliance
  compliance: {
    erc3643Compliant: boolean
    whitelistEnabled: boolean
    blacklistEnabled: boolean
    pausable: boolean
  }
}

// ============================================================================
// Invoice & Payment Types
// ============================================================================

export interface EnterpriseInvoice {
  id: string
  invoiceNumber: string

  // Billing Period
  period: {
    start: Date
    end: Date
  }

  // Line Items
  items: {
    description: string
    quantity: number
    unitPrice: number
    amount: number
    category: EnterpriseFeeType
  }[]

  // Summary
  summary: {
    subtotal: number
    discount: number
    tax: number
    total: number
  }

  // Payment
  payment: {
    dueDate: Date
    terms: 'net30' | 'net60' | 'immediate'
    method?: 'ach' | 'wire' | 'card' | 'crypto'
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    paidDate?: Date
    transactionId?: string
  }

  // Download
  pdfUrl?: string
  csvUrl?: string
}

// ============================================================================
// Billing Preferences Types
// ============================================================================

export interface EnterpriseBillingPreferences {
  organizationId: string

  // Payment Methods
  paymentMethods: {
    primary: {
      type: 'ach' | 'wire' | 'card' | 'crypto'
      details: {
        accountName?: string
        last4?: string
        bankName?: string
        walletAddress?: string
      }
    }
    backup?: {
      type: 'ach' | 'wire' | 'card' | 'crypto'
      details: {
        accountName?: string
        last4?: string
        bankName?: string
        walletAddress?: string
      }
    }
  }

  // Auto-Pay Settings
  autoPay: {
    enabled: boolean
    threshold?: number
    maxAmount?: number
  }

  // Invoice Settings
  invoiceSettings: {
    frequency: 'monthly' | 'quarterly' | 'annual'
    consolidate: boolean
    includeDetails: boolean
    format: 'pdf' | 'csv' | 'both'
  }

  // Notification Preferences
  notifications: {
    emails: string[]
    invoiceReady: boolean
    paymentDue: boolean
    paymentProcessed: boolean
    overageAlert: boolean
    usageAlert: {
      enabled: boolean
      thresholds: {
        users?: number
        transactions?: number
        volume?: number
      }
    }
  }

  // Spend Controls
  spendControls: {
    requireApproval: boolean
    approvalThreshold: number
    approvers: string[]
    departmentBudgets: boolean
  }
}

// ============================================================================
// Cost Optimization Recommendations
// ============================================================================

export interface CostOptimization {
  totalSavings: number
  recommendations: {
    id: string
    type: 'plan_upgrade' | 'volume_discount' | 'feature_removal' | 'usage_optimization'
    title: string
    description: string
    currentCost: number
    projectedCost: number
    savings: number
    effort: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
  }[]
}