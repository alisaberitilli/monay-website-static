import { NUDGE_CONFIG } from './nudge-config';

export interface NudgeContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  country?: string;
  phone?: string;
  source: string;
  tags: string[];
  customFields?: Record<string, unknown>;
}

export interface NudgeApiResponse {
  success: boolean;
  message: string;
  nudgeId?: string;
  formType: string;
}

export class NudgeApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NudgeApiError';
  }
}

export async function submitToNudge(
  formType: string,
  data: Record<string, unknown>
): Promise<NudgeApiResponse> {
  try {
    const response = await fetch('/api/nudge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formType,
        data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new NudgeApiError(
        errorData.error || 'Failed to submit to Nudge',
        response.status,
        errorData.details
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof NudgeApiError) {
      throw error;
    }
    throw new NudgeApiError(
      'Network error occurred while submitting to Nudge',
      0,
      error
    );
  }
}

export function createNudgePayload(
  formType: string,
  data: Record<string, unknown>
): NudgeContactPayload {
  const basePayload = {
    email: data.email as string,
    source: NUDGE_CONFIG.SOURCES[formType as keyof typeof NUDGE_CONFIG.SOURCES] || formType,
    tags: NUDGE_CONFIG.TAGS[formType as keyof typeof NUDGE_CONFIG.TAGS] || [formType]
  };

  switch (formType) {
    case 'signup':
      return {
        ...basePayload,
        firstName: data.firstName as string | undefined,
        lastName: data.lastName as string | undefined,
        country: data.country as string | undefined,
        customFields: {
          password: data.password as string | undefined,
          confirmPassword: data.confirmPassword as string | undefined
        }
      };

    case 'contact-sales':
      return {
        ...basePayload,
        firstName: data.firstName as string | undefined,
        lastName: data.lastName as string | undefined,
        company: data.company as string | undefined,
        country: data.country as string | undefined,
        customFields: {
          message: (data.message as string | undefined) || 'Contact sales request'
        }
      };

    case 'schedule-meeting':
      return {
        ...basePayload,
        firstName: (data.name as string | undefined)?.split(' ')[0] || (data.name as string | undefined),
        lastName: (data.name as string | undefined)?.split(' ').slice(1).join(' ') || '',
        company: data.company as string | undefined,
        phone: data.phone as string | undefined,
        customFields: {
          meetingType: data.meetingType as string | undefined,
          meetingDate: data.date as string | undefined,
          meetingTime: data.time as string | undefined,
          notes: data.notes as string | undefined,
          organizer: data.organizer as string | undefined,
          subject: data.subject as string | undefined
        }
      };

    case 'pilot-program':
      return {
        ...basePayload,
        company: data.companyType as string | undefined,
        customFields: {
          companyType: data.companyType as string | undefined,
          tokenVolume: data.tokenVolume as string | undefined,
          technicalRequirements: (data.technicalRequirements as string[] | undefined)?.join(', ') || '',
          timeline: data.timeline as string | undefined,
          emailVerified: true
        }
      };

    default:
      return {
        ...basePayload,
        customFields: data
      };
  }
}

export function validateNudgeSubmission(data: Record<string, unknown>, requiredFields: string[]): string[] {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
}

export interface NudgeSendPayload {
  nudgeId: number;
  recipientId?: string;
  toEmailAddress?: string;
  toPhoneNumber?: string;
  toName?: string;
  channel: number;
  mergeTags?: Array<{
    tagName: string;
    tagValue: string;
  }>;
}

export async function sendNudgeOTP(
  email: string,
  fullName: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Read API key from environment (server-only)
    const apiKey = process.env.NUDGE_API_KEY;
    if (!apiKey) {
      throw new NudgeApiError('NUDGE_API_KEY is not configured', 500);
    }

    const payload: NudgeSendPayload = {
      // nudgeId must be numeric per docs
      nudgeId: 5314,
      recipientId: fullName, // Pass full name as recipientId
      toEmailAddress: email, // Use toEmailAddress for email
      toName: fullName, // Pass full name to toName
      channel: 0, // Use channel 0 for email as specified
      mergeTags: [
        {
          tagName: "OTP",
          tagValue: otpCode
        },
        {
          tagName: "Full_Name",
          tagValue: fullName
        }
      ]
    };

    console.log('Sending OTP to Nudge API:', {
      endpoint: NUDGE_CONFIG.ENDPOINTS.SEND,
      method: 'POST',
      payload: payload
    });

    // Helper to POST to a Nudge endpoint
    const postToNudge = async (endpoint: string) => {
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Docs show single Authorization header containing the API key
          'Authorization': apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    };

    // Try primary endpoint first
    let response = await postToNudge(NUDGE_CONFIG.ENDPOINTS.SEND);
    if (!response.ok) {
      const primaryErr = await response.text();
      console.error('Nudge Send API primary endpoint error:', primaryErr);

      // Fallback to legacy endpoint
      const legacyEndpoint = `${NUDGE_CONFIG.API_URL}/api/v1/nudges`;
      console.log('Retrying Nudge send via legacy endpoint:', legacyEndpoint);
      response = await postToNudge(legacyEndpoint);

      if (!response.ok) {
        const legacyErr = await response.text();
        console.error('Nudge Send API legacy endpoint error:', legacyErr);
        throw new NudgeApiError(
          `Nudge Send API error: ${response.status} ${response.statusText}`,
          response.status,
          legacyErr
        );
      }
    }

    await response.json().catch(() => undefined);
    console.log('OTP sent successfully via Nudge:', {
      email,
      fullName,
      nudgeId: otpCode,
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'OTP sent successfully via Nudge' };

  } catch (error) {
    console.error('Failed to send OTP via Nudge:', error);
    
    if (error instanceof NudgeApiError) {
      throw error;
    }
    
    throw new NudgeApiError(
      'Network error occurred while sending OTP via Nudge',
      0,
      error
    );
  }
}

export async function sendNudgeSMSOTP(
  mobileNumber: string,
  fullName: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use specific SMS API key from environment
    const apiKey = process.env.NUDGE_SMS_API_KEY;
    if (!apiKey) {
      throw new NudgeApiError('NUDGE_SMS_API_KEY is not configured', 500);
    }

    const payload: NudgeSendPayload = {
      // nudgeId must be numeric per docs - using SMS template ID
      nudgeId: 5248,
      recipientId: fullName, // Pass full name as recipientId
      toPhoneNumber: mobileNumber, // Use toPhoneNumber for SMS
      toName: fullName, // Pass full name to toName
      channel: 1, // Use channel 1 for SMS as specified
      mergeTags: [
        {
          tagName: "otp",
          tagValue: otpCode
        },
        {
          tagName: "Full_Name",
          tagValue: fullName
        }
      ]
    };

    console.log('Sending SMS OTP to Nudge API:', {
      endpoint: NUDGE_CONFIG.ENDPOINTS.SEND,
      method: 'POST',
      payload: payload,
      apiKeyType: 'SMS API Key'
    });

    // Helper to POST to a Nudge endpoint
    const postToNudge = async (endpoint: string) => {
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Docs show single Authorization header containing the API key
          'Authorization': apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    };

    // Try primary endpoint first
    let response = await postToNudge(NUDGE_CONFIG.ENDPOINTS.SEND);
    if (!response.ok) {
      const primaryErr = await response.text();
      console.error('Nudge Send API primary endpoint error:', primaryErr);

      // Fallback to legacy endpoint
      const legacyEndpoint = `${NUDGE_CONFIG.API_URL}/api/v1/nudges`;
      console.log('Retrying Nudge send via legacy endpoint:', legacyEndpoint);
      response = await postToNudge(legacyEndpoint);

      if (!response.ok) {
        const legacyErr = await response.text();
        console.error('Nudge Send API legacy endpoint error:', legacyErr);
        throw new NudgeApiError(
          `Nudge Send API error: ${response.status} ${response.statusText}`,
          response.status,
          legacyErr
        );
      }
    }

    await response.json().catch(() => undefined);
    console.log('SMS OTP sent successfully via Nudge:', {
      mobileNumber,
      fullName,
      nudgeId: otpCode,
      timestamp: new Date().toISOString()
    });

    return { success: true, message: 'SMS OTP sent successfully via Nudge' };

  } catch (error) {
    console.error('Failed to send SMS OTP via Nudge:', error);
    
    if (error instanceof NudgeApiError) {
      throw error;
    }
    
    throw new NudgeApiError(
      'Network error occurred while sending SMS OTP via Nudge',
      0,
      error
    );
  }
}
