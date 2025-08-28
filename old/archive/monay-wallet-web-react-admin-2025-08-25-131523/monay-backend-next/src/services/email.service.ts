import nodemailer from 'nodemailer';
import { render } from 'ejs';
import path from 'path';
import fs from 'fs/promises';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;
      
      if (options.template && options.data) {
        const templatePath = path.join(process.cwd(), 'src', 'templates', `${options.template}.ejs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        html = render(templateContent, options.data);
      }
      
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@monay.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text: options.text,
        attachments: options.attachments,
      };
      
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
  
  async sendVerificationEmail(email: string, code: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Monay Account',
      template: 'email-verification',
      data: {
        firstName,
        verificationCode: code,
        appName: 'Monay',
        year: new Date().getFullYear(),
      },
    });
  }
  
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    
    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      data: {
        firstName,
        resetUrl,
        appName: 'Monay',
        year: new Date().getFullYear(),
      },
    });
  }
  
  async sendTransactionEmail(
    email: string,
    type: 'sent' | 'received',
    amount: number,
    currency: string,
    otherParty: string,
    transactionId: string
  ): Promise<void> {
    const subject = type === 'sent' 
      ? `Payment Sent - ${currency}${amount}`
      : `Payment Received - ${currency}${amount}`;
    
    await this.sendEmail({
      to: email,
      subject,
      template: 'transaction',
      data: {
        type,
        amount,
        currency,
        otherParty,
        transactionId,
        date: new Date().toLocaleString(),
        appName: 'Monay',
        year: new Date().getFullYear(),
      },
    });
  }
  
  async sendKYCStatusEmail(
    email: string,
    firstName: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const subject = status === 'approved' 
      ? 'KYC Verification Approved'
      : 'KYC Verification Update Required';
    
    await this.sendEmail({
      to: email,
      subject,
      template: `kyc-${status}`,
      data: {
        firstName,
        reason,
        appName: 'Monay',
        year: new Date().getFullYear(),
      },
    });
  }
}

export const emailService = new EmailService();
export default emailService;