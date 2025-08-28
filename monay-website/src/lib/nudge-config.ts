export const NUDGE_CONFIG = {
  API_URL: 'https://app.nudge.net',
  // Do NOT store secrets here; read API key from environment on server only
  API_VERSION: '2021-06-01',
  ENDPOINTS: {
    CONTACTS: 'https://app.nudge.net/api/v1/contacts',
    COMPANIES: 'https://app.nudge.net/api/v1/companies',
    DEALS: 'https://app.nudge.net/api/v1/deals',
    // Real-time send endpoint per docs (host app.nudge.net, path /api/v1)
    SEND: 'https://app.nudge.net/api/v1/Nudge/Send'
  },
  SOURCES: {
    WEBSITE_SIGNUP: 'monay-website-signup',
    WEBSITE_CONTACT: 'monay-website-contact',
    WEBSITE_SCHEDULER: 'monay-website-scheduler',
    WEBSITE_PILOT: 'monay-website-pilot'
  },
  TAGS: {
    WEBSITE_SIGNUP: ['website-signup', 'new-user'],
    WEBSITE_CONTACT: ['website-contact', 'sales-inquiry'],
    WEBSITE_SCHEDULER: ['website-scheduler', 'meeting-request'],
    WEBSITE_PILOT: ['website-pilot', 'pilot-program']
  },
  TEMPLATES: {
    OTP: 'otp',
    SMS_OTP: 'sms-otp'
  },
  SMS_TEMPLATE_ID: 5248,
  EMAIL_TEMPLATE_ID: 5314
};

export type NudgeFormType = keyof typeof NUDGE_CONFIG.SOURCES;
export type NudgeSource = typeof NUDGE_CONFIG.SOURCES[NudgeFormType];
export type NudgeTags = typeof NUDGE_CONFIG.TAGS[NudgeFormType];
