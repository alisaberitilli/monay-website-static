/**
 * TypeScript Type Definitions for Financial Analytics & KPIs
 * Admin dashboard financial operations and profitability tracking
 */

// ============================================================================
// Subscription & Pricing Types
// ============================================================================

export type SubscriptionTier = 'starter' | 'growth' | 'enterprise' | 'custom'
export type BillingCycle = 'monthly' | 'annual' | 'custom'
export type OrganizationType = 'enterprise' | 'government' | 'financial' | 'healthcare' | 'education'

export interface SubscriptionPlan {
  id: string
  tier: SubscriptionTier
  name: string
  description: string

  // Pricing
  pricing: {
    base: number
    perUser: number
    perTransaction: number
    currency: string
    billingCycle: BillingCycle
    discount?: number
  }

  // Limits
  limits: {
    users: number
    monthlyTransactions: number
    monthlyVolume: number
    apiCalls: number
  }

  // Features
  features: string[]
  customFeatures?: string[]

  // Metadata
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationSubscription {
  id: string
  organizationId: string
  organizationName: string
  organizationType: OrganizationType

  // Subscription Details
  plan: SubscriptionPlan
  status: 'active' | 'suspended' | 'cancelled' | 'trial'
  startDate: Date
  endDate?: Date
  trialEndsAt?: Date

  // Usage
  usage: {
    activeUsers: number
    monthlyTransactions: number
    monthlyVolume: number
    apiCalls: number
  }

  // Costs
  costs: {
    baseCost: number
    userCost: number
    transactionCost: number
    overageCost: number
    totalMonthlyCost: number
    annualizedCost: number
  }

  // Billing
  billing: {
    lastBilledDate: Date
    nextBillingDate: Date
    paymentMethod: string
    invoices: string[]
  }
}

// ============================================================================
// KYC/KYB Cost Tracking
// ============================================================================

export type VerificationProvider = 'persona' | 'alloy' | 'onfido' | 'jumio' | 'sumsub'
export type VerificationType = 'kyc' | 'kyb'

export interface VerificationCost {
  id: string
  provider: VerificationProvider
  type: VerificationType

  // Cost Structure
  costs: {
    perVerification: number
    perDocument: number
    perCheck: number
    monthlyMinimum?: number
    currency: string
  }

  // Volume Discounts
  volumeDiscounts?: Array<{
    threshold: number
    discountPercent: number
  }>

  // Current Month
  currentMonth: {
    verifications: number
    totalCost: number
    averageCost: number
  }

  // Historical
  lastMonth: {
    verifications: number
    totalCost: number
    averageCost: number
  }
}

export interface VerificationAnalytics {
  // Overall Stats
  totalVerifications: number
  totalCost: number
  averageCostPerVerification: number

  // By Type
  byType: {
    kyc: {
      count: number
      cost: number
      successRate: number
    }
    kyb: {
      count: number
      cost: number
      successRate: number
    }
  }

  // By Provider
  byProvider: Record<VerificationProvider, {
    count: number
    cost: number
    successRate: number
    averageTime: number
  }>

  // By Organization
  topCostlyOrganizations: Array<{
    organizationId: string
    organizationName: string
    verifications: number
    totalCost: number
  }>
}

// ============================================================================
// Profitability & KPIs
// ============================================================================

export interface ProfitabilityMetrics {
  // Revenue
  revenue: {
    mrr: number // Monthly Recurring Revenue
    arr: number // Annual Recurring Revenue
    transactionRevenue: number
    interchangeRevenue: number
    totalRevenue: number
  }

  // Costs
  costs: {
    infrastructure: number
    paymentProcessing: number
    kycKybVerification: number
    cardIssuance: number
    bankingFees: number
    personnel: number
    marketing: number
    totalCosts: number
  }

  // Profitability
  profitability: {
    grossProfit: number
    grossMargin: number // Percentage
    operatingProfit: number
    operatingMargin: number
    netProfit: number
    netMargin: number
    ebitda: number
  }

  // Targets (Year-based)
  targets: {
    year1: {
      targetGrossMargin: 45
      actualGrossMargin: number
      variance: number
      onTrack: boolean
    }
    year2: {
      targetGrossMargin: 65
      actualGrossMargin: number
      variance: number
      onTrack: boolean
    }
    year3: {
      targetGrossMargin: 85
      actualGrossMargin: number
      variance: number
      onTrack: boolean
    }
  }
}

export interface UnitEconomics {
  // Per Organization
  perOrganization: {
    averageRevenue: number // ARPU
    averageCost: number
    averageProfit: number
    ltv: number // Lifetime Value
    cac: number // Customer Acquisition Cost
    ltvCacRatio: number
    paybackPeriod: number // months
  }

  // Per User
  perUser: {
    averageRevenue: number
    averageCost: number
    averageProfit: number
    monthlyChurn: number
    annualChurn: number
  }

  // Per Transaction
  perTransaction: {
    averageRevenue: number
    averageCost: number
    averageProfit: number
    margin: number
  }
}

// ============================================================================
// Executive KPIs
// ============================================================================

export interface ExecutiveKPIs {
  // Growth Metrics
  growth: {
    revenueGrowth: {
      monthly: number
      quarterly: number
      yearly: number
    }
    userGrowth: {
      monthly: number
      quarterly: number
      yearly: number
    }
    organizationGrowth: {
      monthly: number
      quarterly: number
      yearly: number
    }
  }

  // Financial Health
  financial: {
    runway: number // months
    burnRate: number
    cashFlow: number
    workingCapital: number
  }

  // Customer Metrics
  customer: {
    totalOrganizations: number
    totalUsers: number
    activeOrganizations: number
    activeUsers: number
    nps: number // Net Promoter Score
    csat: number // Customer Satisfaction
    churnRate: number
    retentionRate: number
  }

  // Operational Metrics
  operational: {
    transactionVolume: number
    transactionCount: number
    averageTransactionSize: number
    systemUptime: number
    apiResponseTime: number
    errorRate: number
  }
}

// ============================================================================
// Cost Centers
// ============================================================================

export interface CostCenter {
  id: string
  name: string
  category: 'infrastructure' | 'partners' | 'operations' | 'personnel' | 'marketing'

  // Current Period
  current: {
    budget: number
    actual: number
    variance: number
    percentOfBudget: number
  }

  // Year to Date
  ytd: {
    budget: number
    actual: number
    variance: number
    percentOfBudget: number
  }

  // Breakdown
  breakdown: Array<{
    item: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
}

// ============================================================================
// Revenue Analytics
// ============================================================================

export interface RevenueAnalytics {
  // By Product Line
  byProduct: {
    subscriptions: number
    transactions: number
    interchange: number
    apiUsage: number
    customFeatures: number
  }

  // By Organization Type
  byOrgType: Record<OrganizationType, {
    revenue: number
    percentage: number
    growth: number
  }>

  // By Geography
  byGeography: Array<{
    region: string
    revenue: number
    percentage: number
    growth: number
  }>

  // By Cohort
  byCohort: Array<{
    cohort: string // e.g., "2024-Q1"
    organizations: number
    revenue: number
    retention: number
    ltv: number
  }>
}

// ============================================================================
// Financial Forecasting
// ============================================================================

export interface FinancialForecast {
  period: string // e.g., "2025-Q1"

  // Projected Revenue
  projectedRevenue: {
    conservative: number
    expected: number
    optimistic: number
  }

  // Projected Costs
  projectedCosts: {
    conservative: number
    expected: number
    optimistic: number
  }

  // Projected Profitability
  projectedProfitability: {
    grossMargin: number
    operatingMargin: number
    netMargin: number
  }

  // Key Assumptions
  assumptions: {
    newOrganizations: number
    churnRate: number
    averageRevenue: number
    costGrowth: number
  }
}

// ============================================================================
// Dashboard Summary
// ============================================================================

export interface FinancialDashboard {
  // Current Period
  period: {
    start: Date
    end: Date
    label: string // e.g., "October 2025"
  }

  // Key Metrics
  metrics: {
    mrr: number
    grossMargin: number
    customerCount: number
    averageRevenue: number
  }

  // Performance vs Targets
  performance: {
    revenueVsTarget: number // percentage
    profitVsTarget: number // percentage
    growthVsTarget: number // percentage
  }

  // Alerts
  alerts: Array<{
    type: 'warning' | 'error' | 'info' | 'success'
    message: string
    metric: string
    value: number
    threshold: number
  }>

  // Quick Stats
  quickStats: {
    todayRevenue: number
    todayCosts: number
    todayProfit: number
    todayTransactions: number
    todayNewUsers: number
    todayNewOrgs: number
  }
}