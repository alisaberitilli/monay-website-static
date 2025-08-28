export const NUDGE_CONFIG = {
  API_URL: 'https://app.nudge.net',
  API_VERSION: '2021-06-01',
  ENDPOINTS: {
    CONTACTS: 'https://app.nudge.net/api/v1/contacts',
    COMPANIES: 'https://app.nudge.net/api/v1/companies',
    DEALS: 'https://app.nudge.net/api/v1/deals',
    SEND: 'https://app.nudge.net/api/v1/Nudge/Send'
  },
  // Wallet-specific notification templates
  NOTIFICATION_TEMPLATES: {
    // Transaction notifications
    PAYMENT_SENT: 5315,
    PAYMENT_RECEIVED: 5316,
    PAYMENT_REQUEST: 5317,
    PAYMENT_REQUEST_ACCEPTED: 5318,
    PAYMENT_REQUEST_REJECTED: 5319,
    
    // Security notifications
    TWO_FA_ENABLED: 5320,
    TWO_FA_CODE: 5321,
    LOGIN_ALERT: 5322,
    PASSWORD_CHANGED: 5323,
    
    // Account notifications
    KYC_APPROVED: 5324,
    KYC_PENDING: 5325,
    ACCOUNT_UPGRADED: 5326,
    
    // SMS notifications
    SMS_OTP: 5248,
    SMS_PAYMENT_ALERT: 5249,
    SMS_SECURITY_ALERT: 5250
  },
  CHANNELS: {
    EMAIL: 0,
    SMS: 1,
    PUSH: 2,
    IN_APP: 3
  },
  SOURCES: {
    WALLET_APP: 'monay-wallet-app',
    PAYMENT_SYSTEM: 'monay-payment-system',
    SECURITY_SYSTEM: 'monay-security-system',
    ADMIN_SYSTEM: 'monay-admin-system'
  }
};

export type NotificationTemplate = keyof typeof NUDGE_CONFIG.NOTIFICATION_TEMPLATES;
export type NotificationChannel = keyof typeof NUDGE_CONFIG.CHANNELS;