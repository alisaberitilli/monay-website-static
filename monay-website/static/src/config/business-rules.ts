/**
 * Business Rules Configuration
 * 
 * This file centralizes all business rules and constraints for the Monay Pilot Coin Program.
 * Update these values when business requirements change.
 */

export const BUSINESS_RULES = {
  // OTP Configuration
  OTP: {
    /** Length of OTP codes (business requirement for user experience) */
    LENGTH: 6,
    
    /** OTP expiry time in minutes (security requirement) */
    EXPIRY_MINUTES: 10,
    
    /** Maximum verification attempts per OTP (fraud prevention) */
    MAX_ATTEMPTS: 3,
    
    /** Cooldown period between resend requests in seconds (rate limiting) */
    RESEND_COOLDOWN_SECONDS: 60,
    
    /** Maximum OTPs stored in memory fallback (performance optimization) */
    MAX_FALLBACK_STORAGE: 100,
  },

  // Verification Configuration
  VERIFICATION: {
    /** Required verification types for pilot program access */
    REQUIRED_TYPES: ['email'] as const, // SMS is now optional
    
    /** Sequential order of verification steps */
    SEQUENCE: ['email', 'mobile'] as const,
    
    /** Whether verification can be done in parallel (currently sequential) */
    PARALLEL_ALLOWED: false,
    
    /** Whether SMS verification is required (currently optional) */
    SMS_REQUIRED: false,
  },

  // User ID Configuration
  USER_ID: {
    /** Length of generated user IDs (business identifier requirement) */
    LENGTH: 10,
    
    /** Prefix for user IDs (branding requirement) */
    PREFIX: 'MONAY',
    
    /** Whether to include timestamp in ID generation */
    INCLUDE_TIMESTAMP: false,
  },

  // Form Validation Rules
  VALIDATION: {
    /** Minimum length for names */
    MIN_NAME_LENGTH: 2,
    
    /** Maximum length for names */
    MAX_NAME_LENGTH: 100,
    
    /** Required fields for pilot program application */
    REQUIRED_FIELDS: ['email', 'firstName', 'lastName'] as const, // mobileNumber is now optional
    
    /** Optional fields that enhance application quality */
    OPTIONAL_FIELDS: [
      'mobileNumber',           // Now optional
      'companyName',
      'companyType', 
      'jobTitle',
      'industry',
      'useCase',
      'technicalRequirements',
      'expectedVolume',
      'timeline',
      'additionalNotes'
    ] as const,
  },

  // Phone Number Configuration
  PHONE: {
    /** Default country code for phone numbers */
    DEFAULT_COUNTRY_CODE: '+1',
    
    /** Whether to auto-format phone numbers */
    AUTO_FORMAT: true,
    
    /** Minimum length for valid phone numbers */
    MIN_LENGTH: 10,
    
    /** Maximum length for valid phone numbers */
    MAX_LENGTH: 15,
  },

  // Email Configuration
  EMAIL: {
    /** Allowed domains for pilot program (if restricted) */
    ALLOWED_DOMAINS: ['monay.com'], // Currently only monay.com allowed in Nudge trial
    
    /** Whether to validate email domain restrictions */
    VALIDATE_DOMAIN: true,
    
    /** Maximum length for email addresses */
    MAX_LENGTH: 255,
  },

  // Company Configuration
  COMPANY: {
    /** Available company types for pilot program */
    TYPES: [
      'startup',
      'enterprise', 
      'government',
      'nonprofit',
      'academic',
      'other'
    ] as const,
    
    /** Available industries for pilot program */
    INDUSTRIES: [
      'FinTech',
      'Healthcare',
      'E-commerce',
      'Manufacturing',
      'Real Estate',
      'Education',
      'Entertainment',
      'Other'
    ] as const,
  },

  // Technical Requirements
  TECHNICAL: {
    /** Available technical requirement options */
    REQUIREMENTS: [
      'API Integration',
      'Custom Development',
      'White Label Solution',
      'Consulting Services',
      'Training & Support',
      'Other'
    ] as const,
    
    /** Expected volume options */
    VOLUMES: [
      'Under 1K transactions/month',
      '1K-10K transactions/month',
      '10K-100K transactions/month',
      '100K+ transactions/month'
    ] as const,
    
    /** Timeline options */
    TIMELINES: [
      'Immediate (0-3 months)',
      'Short term (3-6 months)',
      'Medium term (6-12 months)',
      'Long term (12+ months)'
    ] as const,
  },

  // Performance & Security
  PERFORMANCE: {
    /** Maximum response time for OTP operations in milliseconds */
    MAX_OTP_RESPONSE_TIME: 500,
    
    /** Maximum response time for user data operations in milliseconds */
    MAX_USER_RESPONSE_TIME: 1000,
    
    /** Maximum page load time in milliseconds */
    MAX_PAGE_LOAD_TIME: 2000,
    
    /** Target system uptime percentage */
    TARGET_UPTIME: 99.9,
  },

  // Compliance & Regulatory
  COMPLIANCE: {
    /** Data retention period in days (regulatory requirement) */
    DATA_RETENTION_DAYS: 2555, // 7 years for financial records
    
    /** Whether to log all verification attempts (audit requirement) */
    LOG_VERIFICATION_ATTEMPTS: true,
    
    /** Whether to encrypt sensitive data at rest */
    ENCRYPT_DATA_AT_REST: true,
    
    /** Whether to require explicit user consent */
    REQUIRE_USER_CONSENT: true,
  },
} as const;

// Type exports for use in other files
export type VerificationType = typeof BUSINESS_RULES.VERIFICATION.REQUIRED_TYPES[number];
export type CompanyType = typeof BUSINESS_RULES.COMPANY.TYPES[number];
export type Industry = typeof BUSINESS_RULES.COMPANY.INDUSTRIES[number];
export type TechnicalRequirement = typeof BUSINESS_RULES.TECHNICAL.REQUIREMENTS[number];
export type Volume = typeof BUSINESS_RULES.TECHNICAL.VOLUMES[number];
export type Timeline = typeof BUSINESS_RULES.TECHNICAL.TIMELINES[number];

// Helper functions for business rule validation
export const BusinessRuleHelpers = {
  /**
   * Check if a verification type is required
   */
  isRequiredVerificationType: (type: string): type is VerificationType => {
    return BUSINESS_RULES.VERIFICATION.REQUIRED_TYPES.includes(type as VerificationType);
  },

  /**
   * Check if a company type is valid
   */
  isValidCompanyType: (type: string): type is CompanyType => {
    return BUSINESS_RULES.COMPANY.TYPES.includes(type as CompanyType);
  },

  /**
   * Check if an industry is valid
   */
  isValidIndustry: (industry: string): industry is Industry => {
    return BUSINESS_RULES.COMPANY.INDUSTRIES.includes(industry as Industry);
  },

  /**
   * Check if a technical requirement is valid
   */
  isValidTechnicalRequirement: (req: string): req is TechnicalRequirement => {
    return BUSINESS_RULES.TECHNICAL.REQUIREMENTS.includes(req as TechnicalRequirement);
  },

  /**
   * Check if a volume option is valid
   */
  isValidVolume: (volume: string): volume is Volume => {
    return BUSINESS_RULES.TECHNICAL.VOLUMES.includes(volume as Volume);
  },

  /**
   * Check if a timeline option is valid
   */
  isValidTimeline: (timeline: string): timeline is Timeline => {
    return BUSINESS_RULES.TECHNICAL.TIMELINES.includes(timeline as Timeline);
  },

  /**
   * Get OTP expiry time in milliseconds
   */
  getOtpExpiryMs: (): number => {
    return BUSINESS_RULES.OTP.EXPIRY_MINUTES * 60 * 1000;
  },

  /**
   * Get resend cooldown in milliseconds
   */
  getResendCooldownMs: (): number => {
    return BUSINESS_RULES.OTP.RESEND_COOLDOWN_SECONDS * 1000;
  },
};

export default BUSINESS_RULES;
