import { NextRequest, NextResponse } from 'next/server';
import { sendSMSOTP, sendEmailOTP } from '@/lib/sms-api';
import { otpStore } from '@/lib/otp-store-api';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Extract first name from email (fallback if no name provided)
function extractFirstNameFromEmail(email: string): string {
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1);
}

export async function POST(request: NextRequest) {
  try {
    const { email, mobileNumber, firstName, lastName } = await request.json();

    // Check if this is an email or mobile OTP request
    const isMobileRequest = mobileNumber && !email;
    const isEmailRequest = email && !mobileNumber;

    // Initialize formatted mobile number variable
    let formattedMobileForAPI: string | undefined;

    if (!isEmailRequest && !isMobileRequest) {
      return NextResponse.json(
        { error: 'Either email or mobile number is required' },
        { status: 400 }
      );
    }

    if (isEmailRequest) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    if (isMobileRequest) {
      // Format mobile number to international format
      let formattedMobileNumber = mobileNumber.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
      
      // Add +1 prefix if not present and number is 10 digits (US format)
      if (!formattedMobileNumber.startsWith('+') && formattedMobileNumber.length === 10) {
        formattedMobileNumber = `+1${formattedMobileNumber}`;
      }
      
      // Validate international format
      const mobileRegex = /^\+1\d{10}$/;
      if (!mobileRegex.test(formattedMobileNumber)) {
        return NextResponse.json(
          { error: 'Mobile number must be in US format (e.g., 3016821633 or +13016821633)' },
          { status: 400 }
        );
      }
      
      // Use formatted number for API calls
      formattedMobileForAPI = formattedMobileNumber;
    }

    const identifier = isEmailRequest ? email : formattedMobileForAPI!;
    
    // Clean up any existing OTP for this identifier before generating new one
    const existingOtp = await otpStore.get(identifier);
    if (existingOtp) {
      console.log(`Cleaning up existing OTP for ${identifier}`);
      await otpStore.delete(identifier);
    }

    // Generate new OTP code
    const otpCode = generateOTP();
    const recipientFirstName = firstName || (isEmailRequest ? extractFirstNameFromEmail(email) : 'User');
    const recipientLastName = lastName || '';
    const fullName = `${recipientFirstName} ${recipientLastName}`.trim();

    // Store OTP first (so it's available even if sending fails)
    try {
      await otpStore.set(identifier, {
        code: otpCode,
        timestamp: Date.now(),
        firstName: fullName,
        type: isEmailRequest ? 'email' : 'mobile'
      });
      console.log(`✅ OTP ${otpCode} stored successfully for ${identifier}`);
    } catch (storageError) {
      console.error('Failed to store OTP:', storageError);
      return NextResponse.json(
        { error: 'Failed to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Try to send OTP via backend API
    let sendResult;
    let sendSuccess = false;
    
    try {
      if (isEmailRequest) {
        sendResult = await sendEmailOTP(email, fullName, otpCode);
      } else {
        sendResult = await sendSMSOTP(formattedMobileForAPI!, fullName, otpCode);
      }
      sendSuccess = sendResult.success;
      console.log(`OTP send result for ${identifier}:`, sendResult);
    } catch (error) {
      console.error(`Failed to send OTP to ${identifier}:`, error);
      // Continue with demo mode
      sendSuccess = false;
    }

    // Log the OTP for debugging
    console.log(`
========================================
${isEmailRequest ? 'EMAIL' : 'SMS'} OTP GENERATED
========================================
Recipient: ${identifier}
Name: ${fullName}
OTP Code: ${otpCode}
Status: ${sendSuccess ? 'Sent via API' : 'Demo Mode (check console)'}
Valid for: 10 minutes
========================================
    `);

    // Build response
    const responseBody: Record<string, unknown> = {
      success: true,
      message: sendSuccess 
        ? `OTP sent successfully to ${identifier}`
        : `OTP generated successfully (demo mode - check console for code)`,
      [isEmailRequest ? 'email' : 'mobileNumber']: identifier,
      firstName: recipientFirstName,
      type: isEmailRequest ? 'email' : 'mobile'
    };

    // Always include OTP in development/demo mode for testing
    if (!sendSuccess || process.env.NODE_ENV === 'development') {
      responseBody.devOtp = otpCode;
      responseBody.demoMode = true;
    }

    return NextResponse.json(responseBody);

  } catch (error) {
    console.error('Error in send-otp route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}