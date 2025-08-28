import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// POST /api/auth/2fa/setup - Generate 2FA secret and QR code
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Monay Wallet (${email})`,
      issuer: 'Monay',
      length: 32
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    
    // In production, save secret.base32 to database for user
    // For now, return it to client (in production, only save to DB)
    
    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntry: secret.base32
    });
    
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/2fa/verify - Verify TOTP code
export async function PUT(request: NextRequest) {
  try {
    const { userId, token, secret } = await request.json();
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps for clock drift
    });
    
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // In production, update user's 2FA status in database
    // Set mfa_enabled = true, store secret encrypted
    
    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully'
    });
    
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/2fa/disable - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const { userId, password, token } = await request.json();
    
    // In production:
    // 1. Verify user's password
    // 2. Verify current TOTP token
    // 3. Update database to disable 2FA
    
    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    });
    
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}

// PATCH /api/auth/2fa/backup-codes - Generate backup codes
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    // Generate 10 backup codes
    const backupCodes = Array.from({ length: 10 }, () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    });
    
    // In production, hash and store these codes in database
    
    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'Store these backup codes in a safe place'
    });
    
  } catch (error) {
    console.error('Backup codes error:', error);
    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    );
  }
}