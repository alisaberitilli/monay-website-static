/**
 * TypeScript Type Definitions for Account Summary & Billing
 * Consumer and Enterprise Wallet billing and fee tracking
 */

// ============================================================================
// Fee Structure Types
// ============================================================================

export type FeeType =
  | 'transaction'
  | 'monthly'
  | 'atm_withdrawal'
  | 'international'
  | 'card_issuance'
  | 'overdraft'
  | 'wire_transfer'
  | 'ach_transfer'
  | 'instant_transfer'

export type TransactionType =
  | 'payment'
  | 'transfer'
  | 'withdrawal'
  | 'deposit'
  | 'card_purchase'
  | 'refund'
  | 'fee'
  | 'interest'

export interface Fee {
  id: string
  type: FeeType
  description: string
  amount: number
  currency: string
  date: Date
  transactionId?: string
  waived: boolean
  waivedReason?: string
}

export interface TransactionFee {
  base: number
  percentage: number
  minimum: number
  maximum: number
  currency: string
}

// ============================================================================
// Account Summary Types
// ============================================================================

export interface AccountBalance {
  available: number
  pending: number
  total: number
  currency: string
  lastUpdated: Date
}

export interface AccountLimits {
  daily: {
    withdrawal: number
    spending: number
    transfer: number
  }
  monthly: {
    withdrawal: number
    spending: number
    transfer: number
  }
  perTransaction: {
    withdrawal: number
    spending: number
    transfer: number
  }
}

export interface BillingCycle {
  startDate: Date
  endDate: Date
  dueDate: Date
  status: 'current' | 'past' | 'upcoming'
}

export interface AccountSummary {
  accountId: string
  accountType: 'consumer' | 'enterprise'
  accountStatus: 'active' | 'suspended' | 'closed'

  // Account Details
  accountNumber: string
  routingNumber: string
  createdAt: Date

  // Balances
  balance: AccountBalance
  creditLine?: number
  creditUsed?: number

  // Current Billing Cycle
  currentCycle: BillingCycle

  // Fees Summary
  fees: {
    currentMonth: number
    previousMonth: number
    yearToDate: number
    waived: number
    pending: number
  }

  // Transaction Summary
  transactions: {
    currentMonth: {
      count: number
      volume: number
      fees: number
    }
    previousMonth: {
      count: number
      volume: number
      fees: number
    }
  }

  // Limits
  limits: AccountLimits

  // Rewards/Cashback
  rewards?: {
    earned: number
    redeemed: number
    available: number
    expiringPoints: number
    expirationDate?: Date
  }
}

// ============================================================================
// Billing Statement Types
// ============================================================================

export interface BillingStatement {
  id: string
  accountId: string
  billingCycle: BillingCycle

  // Summary
  summary: {
    previousBalance: number
    payments: number
    credits: number
    purchases: number
    cashAdvances: number
    fees: number
    interest: number
    newBalance: number
    minimumPayment: number
    paymentDue: Date
  }

  // Transaction Details
  transactions: Transaction[]

  // Fee Details
  fees: Fee[]

  // Payment History
  paymentHistory: Payment[]

  // PDF/Download URL
  statementUrl?: string
  downloadedAt?: Date
}

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  currency: string
  date: Date
  status: 'pending' | 'completed' | 'failed' | 'reversed'

  // Merchant Details
  merchant?: {
    name: string
    category: string
    location: string
  }

  // Fees
  fee?: number
  feeType?: FeeType

  // Metadata
  referenceNumber: string
  notes?: string
  tags?: string[]
}

export interface Payment {
  id: string
  amount: number
  currency: string
  date: Date
  method: 'bank_transfer' | 'card' | 'check' | 'auto_pay'
  status: 'pending' | 'completed' | 'failed'
  confirmationNumber?: string
}

// ============================================================================
// Fee Schedule Types
// ============================================================================

export interface FeeSchedule {
  accountType: 'consumer' | 'enterprise'
  effectiveDate: Date

  // Monthly Fees
  monthlyFees: {
    maintenance: number
    minimumBalance: number
    minimumBalanceThreshold: number
  }

  // Transaction Fees
  transactionFees: {
    domesticWire: TransactionFee
    internationalWire: TransactionFee
    achTransfer: TransactionFee
    instantTransfer: TransactionFee
    atmWithdrawal: {
      inNetwork: TransactionFee
      outOfNetwork: TransactionFee
      international: TransactionFee
    }
    cardTransaction: {
      domestic: TransactionFee
      international: TransactionFee
    }
  }

  // Other Fees
  otherFees: {
    overdraft: number
    insufficientFunds: number
    stopPayment: number
    cardReplacement: number
    rushDelivery: number
    accountClosure: number
  }

  // Fee Waivers
  waiverConditions: {
    monthlyFeeWaiver?: {
      condition: string
      threshold?: number
    }
    atmFeeWaiver?: {
      condition: string
      monthlyLimit?: number
    }
  }
}

// ============================================================================
// Consumer Wallet Specific
// ============================================================================

export interface ConsumerAccountSummary extends AccountSummary {
  // Subscription Tier
  subscriptionTier: 'basic' | 'premium' | 'platinum'
  subscriptionFee: number

  // Card Details
  cards: {
    virtual: CardDetails[]
    physical: CardDetails[]
  }

  // Savings Goals
  savingsGoals?: {
    name: string
    target: number
    current: number
    deadline: Date
    autoTransfer: boolean
  }[]

  // Bill Pay
  scheduledPayments?: {
    payee: string
    amount: number
    frequency: 'once' | 'weekly' | 'biweekly' | 'monthly'
    nextDate: Date
  }[]
}

export interface CardDetails {
  id: string
  last4: string
  type: 'virtual' | 'physical'
  brand: 'visa' | 'mastercard'
  status: 'active' | 'frozen' | 'cancelled'
  expiryDate: string
  spendLimit?: number
  currentSpend?: number
}

// ============================================================================
// Enterprise Wallet Specific
// ============================================================================

export interface EnterpriseAccountSummary extends AccountSummary {
  // Organization Details
  organizationId: string
  organizationName: string
  organizationType: 'enterprise' | 'government' | 'financial' | 'healthcare' | 'education'

  // Subscription Plan
  subscriptionPlan: {
    tier: 'starter' | 'growth' | 'enterprise' | 'custom'
    baseFee: number
    perUserFee: number
    perTransactionFee: number
  }

  // Multi-User Summary
  users: {
    total: number
    active: number
    suspended: number
    totalSpend: number
    averageSpend: number
  }

  // Department Breakdown
  departmentSpending?: {
    department: string
    budget: number
    spent: number
    remaining: number
    users: number
  }[]

  // Invoice Details
  invoices: {
    pending: number
    paid: number
    overdue: number
    totalDue: number
  }

  // Compliance Costs
  complianceCosts: {
    kycVerifications: number
    kybVerifications: number
    totalCost: number
  }
}

// ============================================================================
// Billing Preferences
// ============================================================================

export interface BillingPreferences {
  accountId: string

  // Payment Method
  paymentMethod: {
    type: 'bank_account' | 'card' | 'invoice'
    details: {
      last4: string
      bankName?: string
      cardBrand?: string
    }
    isDefault: boolean
  }[]

  // Auto Pay
  autoPay: {
    enabled: boolean
    amount: 'minimum' | 'full' | 'fixed'
    fixedAmount?: number
    dayOfMonth: number
  }

  // Notifications
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    statementReady: boolean
    paymentDue: boolean
    paymentProcessed: boolean
    lowBalance: boolean
    highSpending: boolean
  }

  // Statement Delivery
  statementDelivery: 'email' | 'mail' | 'both'
  statementEmail?: string

  // Tax Documents
  taxDocuments: {
    form1099: boolean
    yearEndSummary: boolean
  }
}