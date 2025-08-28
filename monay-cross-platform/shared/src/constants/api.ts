// API Configuration based on your Android build variants
export const API_CONFIG = {
  DEV: {
    BASE_URL: 'https://monay.codiantdev.com/api/',
    TIMEOUT: 30000,
  },
  STAGING: {
    BASE_URL: 'https://monay-staging.codiantdev.com/api/',
    TIMEOUT: 30000,
  },
  CLIENT_STAGING: {
    BASE_URL: 'https://qa.monay.com/api/',
    TIMEOUT: 30000,
  },
  PRODUCTION: {
    BASE_URL: 'https://qa.monay.com/api/',
    TIMEOUT: 30000,
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User Profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update-profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPDATE_EMAIL: '/user/update-email',
    UPDATE_MOBILE: '/user/update-mobile',
    UPLOAD_AVATAR: '/user/upload-avatar',
  },
  
  // Wallet
  WALLET: {
    GET_WALLET: '/wallet',
    ADD_MONEY: '/wallet/add-money',
    WITHDRAW_MONEY: '/wallet/withdraw',
    GET_BALANCE: '/wallet/balance',
    SET_PIN: '/wallet/set-pin',
    VERIFY_PIN: '/wallet/verify-pin',
    CHANGE_PIN: '/wallet/change-pin',
  },
  
  // Transactions
  TRANSACTIONS: {
    GET_ALL: '/transactions',
    GET_DETAILS: '/transactions/:id',
    SEND_MONEY: '/transactions/send',
    REQUEST_MONEY: '/transactions/request',
    GET_PENDING_REQUESTS: '/transactions/pending-requests',
    APPROVE_REQUEST: '/transactions/approve-request',
    DECLINE_REQUEST: '/transactions/decline-request',
  },
  
  // Cards
  CARDS: {
    GET_ALL: '/cards',
    ADD_CARD: '/cards/add',
    UPDATE_CARD: '/cards/:id',
    DELETE_CARD: '/cards/:id',
    SET_DEFAULT: '/cards/:id/set-default',
  },
  
  // Bank Accounts
  BANK_ACCOUNTS: {
    GET_ALL: '/bank-accounts',
    ADD_ACCOUNT: '/bank-accounts/add',
    UPDATE_ACCOUNT: '/bank-accounts/:id',
    DELETE_ACCOUNT: '/bank-accounts/:id',
    VERIFY_ACCOUNT: '/bank-accounts/:id/verify',
  },
  
  // Contacts
  CONTACTS: {
    GET_ALL: '/contacts',
    SYNC_CONTACTS: '/contacts/sync',
    SEARCH_USERS: '/contacts/search',
    RECENT_CONTACTS: '/contacts/recent',
    BLOCK_CONTACT: '/contacts/:id/block',
    UNBLOCK_CONTACT: '/contacts/:id/unblock',
  },
  
  // KYC
  KYC: {
    GET_STATUS: '/kyc/status',
    UPLOAD_DOCUMENT: '/kyc/upload-document',
    SUBMIT_KYC: '/kyc/submit',
    GET_REQUIREMENTS: '/kyc/requirements',
  },
  
  // Secondary Users
  SECONDARY_USERS: {
    GET_ALL: '/secondary-users',
    CREATE_USER: '/secondary-users/create',
    UPDATE_USER: '/secondary-users/:id',
    DELETE_USER: '/secondary-users/:id',
    ACTIVATE_USER: '/secondary-users/:id/activate',
    DEACTIVATE_USER: '/secondary-users/:id/deactivate',
  },
  
  // Support
  SUPPORT: {
    GET_CATEGORIES: '/support/categories',
    CREATE_TICKET: '/support/tickets',
    GET_TICKETS: '/support/tickets',
    GET_FAQ: '/support/faq',
  },
  
  // Notifications
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    UPDATE_SETTINGS: '/notifications/settings',
  },
  
  // Utility
  UTILITY: {
    COUNTRY_CODES: '/utility/country-codes',
    BANKS: '/utility/banks',
    TERMS_CONDITIONS: '/utility/terms-conditions',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// App Constants
export const APP_CONSTANTS = {
  TOKEN_KEY: 'monay_auth_token',
  REFRESH_TOKEN_KEY: 'monay_refresh_token',
  USER_KEY: 'monay_user_data',
  
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PIN_LENGTH: 4,
  MAX_PIN_LENGTH: 6,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;