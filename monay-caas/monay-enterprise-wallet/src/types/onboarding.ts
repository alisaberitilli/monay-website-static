/**
 * TypeScript Type Definitions for Streamlined Onboarding
 * Frictionless setup for Enterprise and Consumer wallets
 */

import type { OrganizationType } from './businessRules'
import type { KYCProfile, KYBProfile, VerificationLevel } from './compliance'

// ============================================================================
// Onboarding Types
// ============================================================================

export type OnboardingType = 'enterprise' | 'consumer'

export type OnboardingStep =
  | 'welcome'
  | 'account-type'
  | 'organization'
  | 'user-profile'
  | 'verification'
  | 'banking'
  | 'cards'
  | 'subscription'
  | 'terms'
  | 'complete'

export type OnboardingStatus =
  | 'not-started'
  | 'in-progress'
  | 'pending-verification'
  | 'pending-approval'
  | 'completed'
  | 'abandoned'

// ============================================================================
// Enterprise Onboarding
// ============================================================================

export interface EnterpriseOnboarding {
  id: string
  type: 'enterprise'
  status: OnboardingStatus
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]

  // Organization Information
  organization: {
    name: string
    legalName?: string
    type: OrganizationType
    industry?: string
    industryCode?: string
    registrationNumber?: string
    taxId?: string
    website?: string

    // Address
    address: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }

    // Contact
    primaryContact: {
      firstName: string
      lastName: string
      email: string
      phone: string
      title?: string
    }
  }

  // KYB Verification
  kyb?: {
    status: 'pending' | 'in-review' | 'approved' | 'rejected'
    provider: 'persona' | 'alloy' | 'onfido'
    verificationId?: string
    documents: Array<{
      type: string
      status: string
      uploadedAt: Date
    }>
  }

  // Banking Information
  banking?: {
    accounts: Array<{
      id: string
      accountName: string
      accountNumber: string // encrypted
      routingNumber: string
      accountType: 'checking' | 'savings'
      isPrimary: boolean
      verified: boolean
    }>
  }

  // Cards
  cards?: {
    requested: boolean
    numberOfCards?: number
    cardTier?: 'standard' | 'premium' | 'enterprise'
    deliveryAddress?: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }
  }

  // Subscription
  subscription?: {
    plan: 'starter' | 'growth' | 'enterprise' | 'custom'
    billing: 'monthly' | 'annual'
    features: string[]
    pricing?: {
      amount: number
      currency: string
      discount?: number
    }
    paymentMethod?: {
      type: 'bank' | 'card'
      details: Record<string, any>
    }
  }

  // Terms & Compliance
  terms?: {
    termsAccepted: boolean
    termsVersion: string
    acceptedAt?: Date
    privacyAccepted: boolean
    amlAccepted: boolean
    additionalTerms?: string[]
  }

  // Metadata
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  abandonedAt?: Date
}

// ============================================================================
// Consumer Onboarding
// ============================================================================

export interface ConsumerOnboarding {
  id: string
  type: 'consumer'
  status: OnboardingStatus
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]

  // User Profile
  profile: {
    firstName: string
    lastName: string
    email: string
    emailVerified?: boolean
    phone: string
    phoneVerified?: boolean
    dateOfBirth?: Date

    // Address
    address?: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }

    // Preferences
    preferences?: {
      language: string
      currency: string
      timezone: string
      notifications: {
        email: boolean
        sms: boolean
        push: boolean
      }
    }
  }

  // KYC Verification
  kyc?: {
    level: VerificationLevel
    status: 'pending' | 'in-review' | 'approved' | 'rejected'
    provider: 'persona' | 'alloy' | 'onfido'
    verificationId?: string
    documents: Array<{
      type: string
      status: string
      uploadedAt: Date
    }>
  }

  // Banking Information
  banking?: {
    accounts: Array<{
      id: string
      bankName: string
      accountType: 'checking' | 'savings'
      last4: string
      verified: boolean
      isPrimary: boolean
    }>
    preferredMethod?: 'ach' | 'wire' | 'card'
  }

  // Cards
  cards?: {
    virtual?: {
      requested: boolean
      created?: boolean
      cardId?: string
    }
    physical?: {
      requested: boolean
      shipped?: boolean
      trackingNumber?: string
      deliveryAddress?: {
        street: string
        city: string
        state: string
        country: string
        postalCode: string
      }
    }
  }

  // Initial Funding
  funding?: {
    amount?: number
    currency: string
    method?: 'bank' | 'card' | 'crypto'
    completed: boolean
  }

  // Terms & Compliance
  terms?: {
    termsAccepted: boolean
    termsVersion: string
    acceptedAt?: Date
    privacyAccepted: boolean
    cardholderAgreement?: boolean
    electronicConsent?: boolean
  }

  // Security Setup
  security?: {
    pin?: string // encrypted
    biometrics?: {
      faceId?: boolean
      touchId?: boolean
      fingerprint?: boolean
    }
    twoFactor?: {
      enabled: boolean
      method?: 'sms' | 'authenticator' | 'email'
    }
  }

  // Metadata
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  abandonedAt?: Date
  referralCode?: string
}

// ============================================================================
// Onboarding Progress
// ============================================================================

export interface OnboardingProgress {
  userId: string
  organizationId?: string
  type: OnboardingType

  // Progress Tracking
  totalSteps: number
  completedSteps: number
  percentComplete: number
  estimatedTimeRemaining: number // minutes

  // Step Details
  steps: Array<{
    id: OnboardingStep
    label: string
    description?: string
    status: 'pending' | 'in-progress' | 'completed' | 'skipped'
    required: boolean
    startedAt?: Date
    completedAt?: Date
    errors?: string[]
  }>

  // Validation
  validation: {
    emailVerified: boolean
    phoneVerified: boolean
    identityVerified: boolean
    bankVerified: boolean
    addressVerified: boolean
  }

  // Analytics
  analytics: {
    source?: string
    campaign?: string
    device?: string
    browser?: string
    ip?: string
    location?: string
  }
}

// ============================================================================
// Onboarding Configuration
// ============================================================================

export interface OnboardingConfig {
  type: OnboardingType

  // Step Configuration
  steps: Array<{
    id: OnboardingStep
    enabled: boolean
    required: boolean
    order: number

    // Conditional Logic
    conditions?: Array<{
      field: string
      operator: 'equals' | 'not-equals' | 'contains'
      value: any
    }>

    // Validation Rules
    validation?: Array<{
      field: string
      rule: 'required' | 'email' | 'phone' | 'min' | 'max' | 'regex'
      value?: any
      message?: string
    }>
  }>

  // Features
  features: {
    skipOptionalSteps: boolean
    saveProgress: boolean
    allowBackNavigation: boolean
    showProgressBar: boolean
    autoSave: boolean
    sessionTimeout?: number // minutes
  }

  // Integrations
  integrations: {
    kycProvider?: 'persona' | 'alloy' | 'onfido'
    bankingProvider?: 'plaid' | 'mx' | 'yodlee'
    cardProvider?: 'marqeta' | 'galileo' | 'i2c'
  }

  // Branding
  branding?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
}

// ============================================================================
// Onboarding Actions
// ============================================================================

export interface OnboardingAction {
  type:
    | 'START_ONBOARDING'
    | 'NEXT_STEP'
    | 'PREVIOUS_STEP'
    | 'SKIP_STEP'
    | 'SAVE_PROGRESS'
    | 'VALIDATE_STEP'
    | 'SUBMIT_VERIFICATION'
    | 'COMPLETE_ONBOARDING'
    | 'ABANDON_ONBOARDING'

  payload?: {
    userId?: string
    organizationId?: string
    step?: OnboardingStep
    data?: Record<string, any>
    error?: string
  }

  timestamp: Date
}

// ============================================================================
// Onboarding Templates
// ============================================================================

export interface OnboardingTemplate {
  id: string
  name: string
  description: string
  type: OnboardingType
  organizationType?: OrganizationType

  // Pre-filled Data
  defaults?: {
    organization?: Partial<EnterpriseOnboarding['organization']>
    profile?: Partial<ConsumerOnboarding['profile']>
    subscription?: Partial<EnterpriseOnboarding['subscription']>
  }

  // Customization
  customization: {
    skipSteps?: OnboardingStep[]
    requiredSteps?: OnboardingStep[]
    customFields?: Array<{
      step: OnboardingStep
      field: string
      type: string
      label: string
      required: boolean
    }>
  }

  // Use Cases
  useCases?: string[]
  tags?: string[]
}

// ============================================================================
// Onboarding Helpers
// ============================================================================

export const ONBOARDING_STEPS: Record<OnboardingType, OnboardingStep[]> = {
  enterprise: [
    'welcome',
    'account-type',
    'organization',
    'verification',
    'banking',
    'cards',
    'subscription',
    'terms',
    'complete'
  ],
  consumer: [
    'welcome',
    'account-type',
    'user-profile',
    'verification',
    'banking',
    'cards',
    'terms',
    'complete'
  ]
}

export const STEP_LABELS: Record<OnboardingStep, string> = {
  'welcome': 'Welcome',
  'account-type': 'Account Type',
  'organization': 'Organization Setup',
  'user-profile': 'Your Profile',
  'verification': 'Identity Verification',
  'banking': 'Banking Information',
  'cards': 'Card Setup',
  'subscription': 'Choose Your Plan',
  'terms': 'Terms & Conditions',
  'complete': 'Setup Complete'
}

export const STEP_DESCRIPTIONS: Record<OnboardingStep, string> = {
  'welcome': 'Welcome to Monay! Let\'s get your account set up.',
  'account-type': 'Choose the type of account that best fits your needs.',
  'organization': 'Tell us about your organization.',
  'user-profile': 'Set up your personal profile.',
  'verification': 'Verify your identity for security and compliance.',
  'banking': 'Connect your bank account for easy funding.',
  'cards': 'Set up virtual or physical cards for spending.',
  'subscription': 'Choose the subscription plan that works for you.',
  'terms': 'Review and accept our terms of service.',
  'complete': 'Congratulations! Your account is ready to use.'
}