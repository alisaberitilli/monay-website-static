/**
 * Unified Notification Service
 * Handles both Email (via MailHog) and SMS (via SMS Simulator) in development
 */

import { emailService, type EmailResponse } from './email-service'
import { smsService, type SMSResponse } from './sms-service'

export interface NotificationOptions {
  email?: string
  phone?: string
  subject?: string
  message: string
  type?: 'mfa' | 'welcome' | 'alert' | 'general'
  organizationName?: string
  metadata?: Record<string, any>
}

export interface NotificationResponse {
  email?: EmailResponse
  sms?: SMSResponse
  success: boolean
  error?: string
}

class NotificationService {
  private isDevelopment = process.env.NODE_ENV !== 'production'

  /**
   * Send notification via email and/or SMS
   */
  async send(options: NotificationOptions): Promise<NotificationResponse> {
    const results: NotificationResponse = {
      success: true
    }

    // Send email if provided
    if (options.email) {
      results.email = await emailService.sendEmail({
        to: options.email,
        subject: options.subject || 'Monay Enterprise Notification',
        text: options.message
      })

      if (!results.email.success) {
        results.success = false
        results.error = results.email.error
      }
    }

    // Send SMS if provided
    if (options.phone) {
      results.sms = await smsService.sendSMS({
        to: options.phone,
        message: options.message
      })

      if (!results.sms.success) {
        results.success = false
        results.error = results.sms.error
      }
    }

    // Log notification in development
    if (this.isDevelopment) {
      this.logDevNotification(options, results)
    }

    return results
  }

  /**
   * Send MFA code via email and/or SMS
   */
  async sendMFACode(
    contact: { email?: string; phone?: string },
    code: string,
    organizationName?: string
  ): Promise<NotificationResponse> {
    const results: NotificationResponse = {
      success: true
    }

    if (contact.email) {
      results.email = await emailService.sendMFACode(contact.email, code, organizationName)
    }

    if (contact.phone) {
      results.sms = await smsService.sendMFACode(contact.phone, code, organizationName)
    }

    // Display test mode notification
    if (this.isDevelopment) {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   🔐 MFA CODE SENT (Test Mode)                 ║
╠════════════════════════════════════════════════════════════════╣
║ Code: ${code.padEnd(55)}║
║ Organization: ${(organizationName || 'N/A').padEnd(47)}║
║ Email: ${(contact.email || 'Not sent').padEnd(54)}║
║ Phone: ${(contact.phone || 'Not sent').padEnd(54)}║
╠════════════════════════════════════════════════════════════════╣
║ 📧 View emails at: http://localhost:8025/#                     ║
║ 📱 View SMS at: http://localhost:3030                         ║
╚════════════════════════════════════════════════════════════════╝
      `)
    }

    return results
  }

  /**
   * Send organization welcome notification
   */
  async sendOrganizationWelcome(
    contact: { email: string; phone?: string },
    orgId: string,
    orgName: string,
    tempPassword: string
  ): Promise<NotificationResponse> {
    const results: NotificationResponse = {
      success: true
    }

    // Always send email for welcome
    results.email = await emailService.sendOrganizationWelcome(
      contact.email,
      orgId,
      orgName,
      tempPassword
    )

    // Send SMS if phone provided
    if (contact.phone) {
      results.sms = await smsService.sendOrganizationWelcome(
        contact.phone,
        orgName,
        orgId
      )
    }

    // Display test mode notification
    if (this.isDevelopment) {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║              🎉 ORGANIZATION CREATED (Test Mode)               ║
╠════════════════════════════════════════════════════════════════╣
║ Org ID: ${orgId.padEnd(53)}║
║ Org Name: ${orgName.padEnd(51)}║
║ Email: ${contact.email.padEnd(54)}║
║ Password: ${tempPassword.padEnd(51)}║
╠════════════════════════════════════════════════════════════════╣
║ 📧 Welcome email sent to MailHog                              ║
║ 📱 SMS notification ${contact.phone ? 'sent' : 'not sent (no phone)'}${' '.repeat(contact.phone ? 35 : 20)}║
╠════════════════════════════════════════════════════════════════╣
║ View notifications:                                            ║
║ • Emails: http://localhost:8025/#                            ║
║ • SMS: http://localhost:3030                                 ║
╚════════════════════════════════════════════════════════════════╝
      `)
    }

    return results
  }

  /**
   * Log notification in development
   */
  private logDevNotification(options: NotificationOptions, results: NotificationResponse) {
    console.group('📬 Notification Sent (Development Mode)')
    console.log('Type:', options.type || 'general')
    console.log('Message:', options.message)

    if (results.email) {
      console.log('Email Status:', results.email.success ? '✅ Sent' : '❌ Failed')
      if (results.email.previewUrl) {
        console.log('Email Preview:', results.email.previewUrl)
      }
    }

    if (results.sms) {
      console.log('SMS Status:', results.sms.success ? '✅ Sent' : '❌ Failed')
      if (results.sms.previewUrl) {
        console.log('SMS Preview:', results.sms.previewUrl)
      }
    }

    console.groupEnd()
  }

  /**
   * Get development tool URLs
   */
  getDevToolUrls() {
    return {
      mailhog: 'http://localhost:8025/#',
      smsSimulator: 'http://localhost:3030',
      isDevelopment: this.isDevelopment
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()

// Re-export individual services for direct access if needed
export { emailService } from './email-service'
export { smsService } from './sms-service'

// Export types
export type {
  EmailOptions,
  EmailResponse
} from './email-service'

export type {
  SMSOptions,
  SMSResponse
} from './sms-service'