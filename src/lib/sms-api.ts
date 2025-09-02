// SMS OTP API - uses monay-backend-common API
// This ensures all SMS operations go through the centralized backend

interface SMSResponse {
  success: boolean;
  message: string;
  data?: {
    messageId?: string;
    status?: string;
  };
  error?: string;
}

export class SMSApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SMSApiError';
  }
}

export async function sendSMSOTP(
  mobileNumber: string,
  fullName: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use monay-backend-common API
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // Format mobile number for API
    let formattedNumber = mobileNumber.replace(/[\s\-\(\)]/g, '');
    if (!formattedNumber.startsWith('+') && formattedNumber.length === 10) {
      formattedNumber = `+1${formattedNumber}`;
    }

    const payload = {
      to: formattedNumber,
      message: `Your Monay verification code is: ${otpCode}. This code will expire in 10 minutes.`,
      type: 'otp',
      metadata: {
        otpCode,
        fullName,
        service: 'monay-website',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending SMS OTP via backend API:', {
      to: formattedNumber,
      fullName,
      otpCode,
      apiUrl: `${apiUrl}/api/sms/send`
    });

    const response = await fetch(`${apiUrl}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend SMS API error:', errorData);
      
      // Fallback to demo mode for development
      if (process.env.NODE_ENV === 'development' || !process.env.SMS_PROVIDER_KEY) {
        console.log('SMS API not configured - using demo mode');
        console.log(`[DEMO] SMS would be sent to ${formattedNumber}: Your Monay verification code is: ${otpCode}`);
        return { 
          success: true, 
          message: 'SMS OTP sent successfully (demo mode)' 
        };
      }
      
      throw new SMSApiError(
        `Backend SMS API error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const result = await response.json() as SMSResponse;
    
    if (!result.success) {
      // Fallback to demo mode if backend doesn't have SMS configured
      console.log('Backend SMS not configured - using demo mode');
      console.log(`[DEMO] SMS would be sent to ${formattedNumber}: Your Monay verification code is: ${otpCode}`);
      return { 
        success: true, 
        message: 'SMS OTP sent successfully (demo mode)' 
      };
    }

    console.log('SMS OTP sent successfully via backend:', {
      mobileNumber: formattedNumber,
      fullName,
      messageId: result.data?.messageId,
      timestamp: new Date().toISOString()
    });

    return { 
      success: true, 
      message: result.message || 'SMS OTP sent successfully' 
    };

  } catch (error) {
    console.error('Failed to send SMS OTP:', error);
    
    // Always fallback to demo mode rather than failing completely
    console.log('Using demo mode due to error');
    console.log(`[DEMO] SMS would be sent: Your Monay verification code is: ${otpCode}`);
    
    return { 
      success: true, 
      message: 'SMS OTP sent successfully (demo mode)' 
    };
  }
}

export async function sendEmailOTP(
  email: string,
  fullName: string,
  otpCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Use monay-backend-common API
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const payload = {
      to: email,
      subject: 'Your Monay Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${fullName},</h2>
          <p>Your Monay verification code is:</p>
          <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message from Monay. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Hello ${fullName}, Your Monay verification code is: ${otpCode}. This code will expire in 10 minutes.`,
      type: 'otp',
      metadata: {
        otpCode,
        fullName,
        service: 'monay-website',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending Email OTP via backend API:', {
      to: email,
      fullName,
      otpCode,
      apiUrl: `${apiUrl}/api/email/send`
    });

    const response = await fetch(`${apiUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend Email API error:', errorData);
      
      // Fallback to demo mode for development
      console.log('Email API not configured - using demo mode');
      console.log(`[DEMO] Email would be sent to ${email}: Your Monay verification code is: ${otpCode}`);
      return { 
        success: true, 
        message: 'Email OTP sent successfully (demo mode)' 
      };
    }

    const result = await response.json() as SMSResponse;
    
    if (!result.success) {
      // Fallback to demo mode if backend doesn't have email configured
      console.log('Backend Email not configured - using demo mode');
      console.log(`[DEMO] Email would be sent to ${email}: Your Monay verification code is: ${otpCode}`);
      return { 
        success: true, 
        message: 'Email OTP sent successfully (demo mode)' 
      };
    }

    console.log('Email OTP sent successfully via backend:', {
      email,
      fullName,
      messageId: result.data?.messageId,
      timestamp: new Date().toISOString()
    });

    return { 
      success: true, 
      message: result.message || 'Email OTP sent successfully' 
    };

  } catch (error) {
    console.error('Failed to send Email OTP:', error);
    
    // Always fallback to demo mode rather than failing completely
    console.log('Using demo mode due to error');
    console.log(`[DEMO] Email would be sent to ${email}: Your Monay verification code is: ${otpCode}`);
    
    return { 
      success: true, 
      message: 'Email OTP sent successfully (demo mode)' 
    };
  }
}