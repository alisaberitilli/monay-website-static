import { NextRequest, NextResponse } from 'next/server'
import { notificationService } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, organizationName } = body

    // Generate a 6-digit MFA code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code in memory (in production, use Redis or database)
    // For now, we'll just log it
    console.log(`MFA Code generated: ${code} for ${email || phone}`)

    // Send MFA code via notification service
    const result = await notificationService.sendMFACode(
      { email, phone },
      code,
      organizationName
    )

    return NextResponse.json({
      success: result.success,
      code: process.env.NODE_ENV === 'development' ? code : undefined, // Only return code in dev
      message: 'MFA code sent successfully',
      devTools: notificationService.getDevToolUrls()
    })
  } catch (error) {
    console.error('Error sending MFA:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send MFA code' },
      { status: 500 }
    )
  }
}