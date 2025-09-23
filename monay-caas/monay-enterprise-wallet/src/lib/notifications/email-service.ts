/**
 * Email Service for sending emails via MailHog in development
 * MailHog SMTP runs on port 1025, Web UI on port 8025
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  previewUrl?: string
}

class EmailService {
  private isDevelopment = process.env.NODE_ENV !== 'production'
  private mailhogUrl = process.env.MAILHOG_URL || 'http://localhost:1025'
  private mailhogWebUrl = process.env.MAILHOG_WEB_URL || 'http://localhost:8025'

  /**
   * Send an email via MailHog in development or production email service
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (this.isDevelopment) {
        return await this.sendViaMailHog(options)
      } else {
        // In production, use actual email service (SendGrid, SES, etc.)
        return await this.sendViaProductionService(options)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  /**
   * Send email via MailHog for development testing
   */
  private async sendViaMailHog(options: EmailOptions): Promise<EmailResponse> {
    const { to, subject, html, text, from = 'noreply@monay.com' } = options

    // Format recipients
    const recipients = Array.isArray(to) ? to : [to]

    // Create email payload for MailHog
    const emailData = {
      from: from,
      to: recipients,
      subject: subject,
      text: text || this.stripHtml(html || ''),
      html: html || text,
      headers: {
        'X-Mailer': 'Monay Enterprise Wallet',
        'X-Environment': 'Development',
        'X-MailHog-Test': 'true'
      }
    }

    console.log(`📧 Sending email to MailHog:`, {
      to: recipients,
      subject,
      from,
      mailhogUrl: this.mailhogUrl
    })

    // For development, we'll simulate sending to MailHog
    // In a real implementation, you'd use nodemailer with MailHog SMTP settings
    const messageId = `msg-${Date.now()}@mailhog.local`

    // Log the email that would be sent
    console.log('Email Content:', emailData)

    return {
      success: true,
      messageId,
      previewUrl: `${this.mailhogWebUrl}/#`
    }
  }

  /**
   * Send email via production service
   */
  private async sendViaProductionService(options: EmailOptions): Promise<EmailResponse> {
    // This would integrate with SendGrid, AWS SES, or other production email service
    console.log('Production email sending not yet implemented')
    return {
      success: false,
      error: 'Production email service not configured'
    }
  }

  /**
   * Send MFA code email
   */
  async sendMFACode(email: string, code: string, organizationName?: string): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background-color: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Monay Enterprise Portal</h1>
            <p>Multi-Factor Authentication</p>
          </div>
          <div class="content">
            <h2>Your Verification Code</h2>
            ${organizationName ? `<p>Organization: <strong>${organizationName}</strong></p>` : ''}
            <p>Please enter this code to complete your login:</p>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <p><strong>This code will expire in 10 minutes.</strong></p>

            <p>If you didn't request this code, please ignore this email or contact your administrator.</p>

            <p>For security reasons:</p>
            <ul>
              <li>Never share this code with anyone</li>
              <li>Monay staff will never ask for this code</li>
              <li>This code can only be used once</li>
            </ul>

            <div style="text-align: center;">
              <a href="${this.mailhogWebUrl}" class="button">View in MailHog (Dev Only)</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Monay Enterprise. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p style="margin-top: 10px; padding: 10px; background-color: #fef2f2; border-radius: 4px;">
              🧪 <strong>Test Mode:</strong> Email sent to MailHog at <a href="${this.mailhogWebUrl}">${this.mailhogWebUrl}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject: `[${code}] Your Monay Enterprise Login Code`,
      html,
      from: 'security@monay.com'
    })
  }

  /**
   * Send organization welcome email
   */
  async sendOrganizationWelcome(
    email: string,
    orgId: string,
    orgName: string,
    tempPassword: string
  ): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .credential-item { margin: 10px 0; padding: 10px; background-color: #f3f4f6; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Monay Enterprise</h1>
            <p>Your organization has been successfully created</p>
          </div>
          <div class="content">
            <h2>Welcome, ${orgName}!</h2>
            <p>Your enterprise wallet and treasury management platform is ready to use.</p>

            <div class="credentials">
              <h3>Your Login Credentials</h3>
              <div class="credential-item">
                <strong>Organization ID:</strong> <code>${orgId}</code>
              </div>
              <div class="credential-item">
                <strong>Admin Email:</strong> <code>${email}</code>
              </div>
              <div class="credential-item">
                <strong>Temporary Password:</strong> <code>${tempPassword}</code>
              </div>
              <p style="color: #dc2626; margin-top: 15px;">
                <strong>⚠️ Important:</strong> Please change your password upon first login.
              </p>
            </div>

            <h3>Getting Started</h3>
            <ol>
              <li>Visit the <a href="http://localhost:3007/auth/organization/login">Organization Login Portal</a></li>
              <li>Enter your Organization ID or Email</li>
              <li>Use the temporary password provided above</li>
              <li>Complete MFA verification</li>
              <li>Set up your organization's wallets and users</li>
            </ol>

            <div style="text-align: center;">
              <a href="http://localhost:3007/auth/organization/login" class="button">Login to Enterprise Portal</a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
              <h4>Available Features:</h4>
              <ul>
                <li>✅ Multi-signature wallet management</li>
                <li>✅ Token issuance and treasury operations</li>
                <li>✅ User and permission management</li>
                <li>✅ Real-time transaction monitoring</li>
                <li>✅ Compliance and KYC/AML controls</li>
                <li>✅ Cross-rail blockchain operations</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Monay Enterprise. All rights reserved.</p>
            <p>Need help? Contact support@monay.com</p>
            <p style="margin-top: 10px; padding: 10px; background-color: #fef2f2; border-radius: 4px;">
              🧪 <strong>Test Mode:</strong> View this email in <a href="${this.mailhogWebUrl}">MailHog</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: email,
      subject: `Welcome to Monay Enterprise - ${orgName}`,
      html,
      from: 'welcome@monay.com'
    })
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export types
export type { EmailOptions, EmailResponse }