/**
 * SMS Service for sending SMS via SMS Simulator in development
 * SMS Simulator runs on port 3030
 */

interface SMSOptions {
  to: string | string[]
  message: string
  from?: string
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
  previewUrl?: string
  sentTo?: string[]
}

class SMSService {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private smsSimulatorUrl = process.env.SMS_SIMULATOR_URL || 'http://localhost:3030'

  /**
   * Send an SMS via SMS Simulator in development or production SMS service
   */
  async sendSMS(options: SMSOptions): Promise<SMSResponse> {
    try {
      if (this.isDevelopment) {
        return await this.sendViaSMSSimulator(options)
      } else {
        // In production, use actual SMS service (Twilio, AWS SNS, etc.)
        return await this.sendViaProductionService(options)
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      }
    }
  }

  /**
   * Send SMS via SMS Simulator for development testing
   */
  private async sendViaSMSSimulator(options: SMSOptions): Promise<SMSResponse> {
    const { to, message, from = '+1-800-MONAY' } = options

    // Format recipients
    const recipients = Array.isArray(to) ? to : [to]

    // Clean phone numbers (remove any non-digit characters except +)
    const cleanRecipients = recipients.map(phone =>
      phone.replace(/[^\d+]/g, '')
    )

    // Create SMS payload for simulator
    const smsData = {
      from: from,
      to: cleanRecipients,
      body: message,
      timestamp: new Date().toISOString(),
      environment: 'development',
      service: 'Monay Enterprise Wallet'
    }

    console.log(`📱 Sending SMS to Simulator:`, {
      to: cleanRecipients,
      from,
      messageLength: message.length,
      simulatorUrl: this.smsSimulatorUrl
    })

    try {
      // Send to SMS Simulator API
      const response = await fetch(`${this.smsSimulatorUrl}/api/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData)
      })

      if (!response.ok) {
        // If simulator is not running, still return success in dev mode
        console.warn('SMS Simulator not available, logging SMS locally:', smsData)
        return {
          success: true,
          messageId: `sms-local-${Date.now()}`,
          previewUrl: this.smsSimulatorUrl,
          sentTo: cleanRecipients
        }
      }

      const result = await response.json()

      return {
        success: true,
        messageId: result.messageId || `sms-${Date.now()}`,
        previewUrl: this.smsSimulatorUrl,
        sentTo: cleanRecipients
      }
    } catch (error) {
      // If simulator is not running, log locally but don't fail
      console.log('📱 SMS Content (Simulator offline):', smsData)

      return {
        success: true,
        messageId: `sms-offline-${Date.now()}`,
        previewUrl: this.smsSimulatorUrl,
        sentTo: cleanRecipients
      }
    }
  }

  /**
   * Send SMS via production service
   */
  private async sendViaProductionService(options: SMSOptions): Promise<SMSResponse> {
    // This would integrate with Twilio, AWS SNS, or other production SMS service
    console.log('Production SMS sending not yet implemented')
    return {
      success: false,
      error: 'Production SMS service not configured'
    }
  }

  /**
   * Send MFA code via SMS
   */
  async sendMFACode(phoneNumber: string, code: string, organizationName?: string): Promise<SMSResponse> {
    const message = organizationName
      ? `Your Monay Enterprise verification code for ${organizationName} is: ${code}. Valid for 10 minutes. Do not share this code.`
      : `Your Monay verification code is: ${code}. Valid for 10 minutes. Do not share this code.`

    const response = await this.sendSMS({
      to: phoneNumber,
      message
    })

    // Log for development
    if (this.isDevelopment) {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                    SMS SENT (Dev Mode)                  ║
╠════════════════════════════════════════════════════════╣
║ To: ${phoneNumber.padEnd(45)}║
║ Code: ${code.padEnd(48)}║
║ Message: ${message.substring(0, 42)}...║
║ View at: ${this.smsSimulatorUrl.padEnd(42)}║
╚════════════════════════════════════════════════════════╝
      `)
    }

    return response
  }

  /**
   * Send organization welcome SMS
   */
  async sendOrganizationWelcome(phoneNumber: string, orgName: string, orgId: string): Promise<SMSResponse> {
    const message = `Welcome to Monay Enterprise, ${orgName}! Your Org ID is ${orgId}. Login at http://localhost:3007/auth/organization/login`

    return await this.sendSMS({
      to: phoneNumber,
      message
    })
  }

  /**
   * Send transaction alert SMS
   */
  async sendTransactionAlert(
    phoneNumber: string,
    amount: string,
    type: 'sent' | 'received',
    walletName: string
  ): Promise<SMSResponse> {
    const message = type === 'sent'
      ? `Monay Alert: ${amount} sent from ${walletName}. Check your dashboard for details.`
      : `Monay Alert: ${amount} received in ${walletName}. Check your dashboard for details.`

    return await this.sendSMS({
      to: phoneNumber,
      message
    })
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  /**
   * Validate phone number
   */
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  }
}

// Export singleton instance
export const smsService = new SMSService()

// Export types
export type { SMSOptions, SMSResponse }