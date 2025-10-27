import { NextRequest, NextResponse } from 'next/server';
import { NUDGE_CONFIG } from '@/lib/nudge-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, firstName, lastName } = body;

    // Validate required fields
    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: email and phone' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in session/database (for now, we'll return it in response for demo)
    // In production, store in Redis or database with expiration

    // Read API key from environment
    const apiKey = process.env.NUDGE_API_KEY;
    if (!apiKey) {
      throw new Error('NUDGE_API_KEY is not configured');
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'User';

    // Format phone number for Nudge (add country code if missing)
    let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits

    // Ensure proper country code formatting
    if (formattedPhone.length === 10) {
      // US number without country code, add 1
      formattedPhone = '1' + formattedPhone;
    } else if (formattedPhone.length === 11 && !formattedPhone.startsWith('1')) {
      // 11 digits but doesn't start with 1, likely has wrong prefix
      formattedPhone = '1' + formattedPhone.slice(1); // Replace first digit with 1
    }

    // Send OTP via Email using Nudge
    const emailPayload = {
      nudgeId: 5281, // OTP Email Template ID from Nudge docs (must be numeric)
      channel: 0, // Email channel
      toEmailAddress: email,
      recipientId: fullName,
      toName: fullName,
      mergeTags: [
        { tagName: "OTP", tagValue: otp },
        { tagName: "Full_Name", tagValue: fullName }
      ]
    };

    const emailResponse = await fetch(NUDGE_CONFIG.ENDPOINTS.SEND, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'X-API-Version': NUDGE_CONFIG.API_VERSION
      },
      body: JSON.stringify(emailPayload)
    });

    let emailSent = false;
    let smsSent = false;

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Nudge Email API error:', errorData);
      console.log('⚠️  Email sending failed - OTP will be shown on screen for demo');
    } else {
      emailSent = true;
      console.log('✅ Email sent successfully');
    }

    // Send OTP via SMS using Nudge (channel 1 = SMS)
    const smsPayload = {
      nudgeId: 5248, // SMS Template ID (must be numeric)
      channel: 1, // SMS channel (1 = SMS, not 2)
      toPhoneNumber: formattedPhone,
      recipientId: fullName,
      mergeTags: [
        { tagName: "otp", tagValue: otp },
        { tagName: "Full_Name", tagValue: fullName }
      ]
    };

    const smsResponse = await fetch(NUDGE_CONFIG.ENDPOINTS.SEND, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'X-API-Version': NUDGE_CONFIG.API_VERSION
      },
      body: JSON.stringify(smsPayload)
    });

    if (!smsResponse.ok) {
      const errorData = await smsResponse.text();
      console.error('Nudge SMS API error:', errorData);
      console.log('⚠️  SMS sending failed - OTP will be shown on screen for demo');
    } else {
      smsSent = true;
      console.log('✅ SMS sent successfully');
    }

    // Also save contact to Nudge CRM
    const contactPayload = {
      email: email,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: formattedPhone,
      source: 'payout-demo',
      tags: ['payout-demo', 'otp-verification'],
      customFields: {
        demoType: 'payout-flow',
        otpSent: true,
        timestamp: new Date().toISOString()
      }
    };

    await fetch(NUDGE_CONFIG.ENDPOINTS.CONTACTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'X-API-Version': NUDGE_CONFIG.API_VERSION
      },
      body: JSON.stringify(contactPayload)
    });

    console.log(`OTP sent to ${email} and ${phone}:`, {
      email,
      phone,
      otp, // In production, don't log OTP!
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: emailSent || smsSent
        ? 'OTP sent successfully'
        : 'OTP generated (email/SMS pending - showing on screen for demo)',
      otp: otp, // Showing for demo since Nudge integration needs API key verification
      emailSent,
      smsSent,
      demoMode: !emailSent && !smsSent // Flag to show OTP on screen
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      {
        error: 'Failed to send OTP',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
