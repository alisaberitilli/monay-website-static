// API Configuration for Monay Backend
export const API_CONFIG = {
  // Use relative URL to go through Next.js proxy (avoids CORS issues)
  BASE_URL: typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'),
  API_PREFIX: '/api',
  TIMEOUT: 10000, // 10 seconds
};

// API Endpoints mapping to monay-backend routes
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',  // Updated to use auth wrapper
    ADMIN_LOGIN: '/admin/login',
    SIGNUP: '/user/signup',  // User signup endpoint
    SIGNUP_CONSUMER: '/user/signup',  // Individual consumer registration - uses same endpoint
    SIGNUP_BUSINESS: '/user/signup',  // Small business registration - uses same endpoint
    SIGNUP_ENTERPRISE: '/user/signup',  // Enterprise user registration - uses same endpoint
    MERCHANT_SIGNUP: '/merchant/signup',
    LOGOUT: '/auth/logout',  // Updated to use auth wrapper
    SEND_OTP: '/send-otp',
    VERIFY_OTP: '/verify-otp',
    RESEND_OTP: '/resend/otp',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/account/change-password',
    ME: '/auth/me',  // Updated to use auth wrapper
  },

  // Verification
  VERIFICATION: {
    SEND_MOBILE_OTP: '/verification/send-mobile-otp',
    VERIFY_MOBILE_OTP: '/verification/verify-mobile-otp',
    SEND_EMAIL_OTP: '/verification/send-email-otp',
    VERIFY_EMAIL_OTP: '/verification/verify-email-otp',
    RESEND_OTP: '/verification/resend-otp',
    SEND_OTP_UNAUTHENTICATED: '/verification/send-otp-unauthenticated',
    VERIFY_OTP_UNAUTHENTICATED: '/verification/verify-otp-unauthenticated',
  },
  
  // User Management
  USER: {
    HOME: '/home',
    PROFILE: (userId: string) => `/user/profile/${userId}`,
    UPDATE_PROFILE: '/user/update-profile',
    MERCHANT_UPDATE_PROFILE: '/merchant/update-profile',
    CONTEXT: '/user/context',  // Get user's tenant context
    SWITCH_TENANT: '/user/switch-tenant',  // Switch between tenants
    KYC: '/user/kyc',
    CHANGE_PIN: '/user/change-pin',
    FORGOT_PIN: '/user/forgot-pin',
    VERIFY_PIN_OTP: '/user/verify-pin-otp',
    VERIFY_MPIN: '/user/verify-mpin',
    RESET_PIN: '/user/reset-pin',
    SET_PIN: '/user/set-pin',
    CHECK_PHONE: '/user/check/phone',
    CHECK_EMAIL: '/user/check/email',
    SEARCH: '/user/search',
    RECENT_PAYMENT_USERS: '/user/recent-payment-users',
    UPDATE_FIREBASE_TOKEN: '/user/update-firebase-token',
    WALLET_LIMIT: '/user/wallet-limit',
    AUTO_TOUP: '/user/auto-toup',
  },
  
  // Transactions
  TRANSACTION: {
    USER_LIST: '/user/transaction',
    ADMIN_LIST: '/admin/transaction',
    DETAIL: (id: string) => `/user/transaction/${id}`,
  },
  
  // Payment Requests
  PAYMENT_REQUEST: {
    CREATE: '/user/payment/request',
    PAY: '/user/payment/request/pay',
    DECLINE: '/payment/request/decline',
    MY_REQUESTS: '/user/my-request',
    USER_LIST: (type: string) => `/user/payment/request/${type}`,
    ADMIN_LIST: '/admin/payment/request',
  },
  
  // Notifications
  NOTIFICATION: {
    USER_LIST: '/user/notification',
    ADMIN_LIST: '/admin/notification',
    UPDATE_STATUS: '/notification/status',
    TEST: '/test-notification',
  },
  
  // Wallet & Payments
  WALLET: {
    BALANCE: '/wallet/balance',
    // Add more wallet endpoints as needed
  },
  
  // Cards
  CARD: {
    // Add card endpoints as needed
  },
  
  // Bank
  BANK: {
    // Add bank endpoints as needed
  },
  
  // Admin
  ADMIN: {
    USER_LIST: '/admin/user',
    USER_PROFILE: (userId: string) => `/admin/user-profile/${userId}`,
    CHANGE_USER_STATUS: (userId: string) => `/admin/user/${userId}/change-status`,
    CHANGE_KYC_STATUS: (userId: string) => `/admin/user/${userId}/kyc-status`,
  },
};

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
}

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Request configuration interface
export interface ApiRequestConfig {
  method: HttpMethod;
  endpoint: string;
  data?: any;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
  timeout?: number;
}

// Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: any;
}