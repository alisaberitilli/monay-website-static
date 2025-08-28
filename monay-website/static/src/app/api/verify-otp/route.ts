import { NextRequest, NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store-api';

export async function POST(request: NextRequest) {
  try {
    const { email, mobileNumber, otp } = await request.json();

    // Check if this is an email or mobile verification request
    const isMobileRequest = mobileNumber && !email;
    const isEmailRequest = email && !mobileNumber;

    if (!isEmailRequest && !isMobileRequest) {
      return NextResponse.json(
        { error: 'Either email or mobile number is required' },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
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

    let identifier: string;

    if (isMobileRequest) {
      // Format mobile number to international format (same as send-otp)
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
      
      // Use formatted number for lookup
      identifier = formattedMobileNumber;
    } else {
      identifier = email;
    }

    // Validate OTP format (assuming 6-digit numeric)
    if (!/^\d{4,6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // Get stored OTP data
    const storedOtpData = await otpStore.get(identifier);
    
    // Debug logging
    console.log(`Verification attempt for ${identifier}`);
    console.log(`Stored OTP data:`, storedOtpData);
    console.log(`Current OTP store size: ${await otpStore.size()}`);

    if (!storedOtpData) {
      console.log(`No OTP found for ${identifier}`);
      return NextResponse.json(
        { error: `No OTP found for this ${isEmailRequest ? 'email' : 'mobile number'}. Please request a new OTP.` },
        { status: 400 }
      );
    }

    // Check if OTP has expired (10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    console.log(`OTP timestamp: ${storedOtpData.timestamp}, Current time: ${Date.now()}, Expired: ${storedOtpData.timestamp < tenMinutesAgo}`);
    
    if (storedOtpData.timestamp < tenMinutesAgo) {
      // Remove expired OTP
      await otpStore.delete(identifier);
      console.log(`OTP expired for ${identifier}`);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP code
    console.log(`Comparing OTP: "${otp}" with stored: "${storedOtpData.code}"`);
    if (storedOtpData.code !== otp) {
      console.log(`OTP mismatch for ${identifier}`);
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from storage (one-time use)
    await otpStore.delete(identifier);

    console.log(`OTP verified successfully for ${identifier}`);
    
    return NextResponse.json(
      { 
        success: true,
        message: 'OTP verified successfully',
        verified: true,
        [isEmailRequest ? 'email' : 'mobileNumber']: identifier,
        firstName: storedOtpData.firstName,
        type: storedOtpData.type
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}