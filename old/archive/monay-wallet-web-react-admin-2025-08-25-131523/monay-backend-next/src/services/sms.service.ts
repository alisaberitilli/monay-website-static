import twilio from 'twilio';

interface SMSOptions {
  to: string;
  message: string;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;
  
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not configured. SMS service will not work.');
    }
  }
  
  async sendSMS(options: SMSOptions): Promise<void> {
    try {
      if (!this.client) {
        console.error('Twilio client not initialized');
        return;
      }
      
      const message = await this.client.messages.create({
        body: options.message,
        from: this.fromNumber,
        to: options.to,
      });
      
      console.log(`SMS sent successfully. Message SID: ${message.sid}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS');
    }
  }
  
  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    const message = `Your Monay verification code is: ${otp}. This code will expire in 10 minutes.`;
    
    await this.sendSMS({
      to: phoneNumber,
      message,
    });
  }
  
  async sendTransactionAlert(
    phoneNumber: string,
    type: 'sent' | 'received',
    amount: number,
    balance: number
  ): Promise<void> {
    const message = type === 'sent'
      ? `You sent $${amount}. Your new balance is $${balance}.`
      : `You received $${amount}. Your new balance is $${balance}.`;
    
    await this.sendSMS({
      to: phoneNumber,
      message,
    });
  }
  
  async sendLoginAlert(phoneNumber: string, deviceInfo: string): Promise<void> {
    const message = `New login to your Monay account from ${deviceInfo}. If this wasn't you, please secure your account immediately.`;
    
    await this.sendSMS({
      to: phoneNumber,
      message,
    });
  }
  
  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<void> {
    const message = `Your Monay password reset code is: ${code}. Do not share this code with anyone.`;
    
    await this.sendSMS({
      to: phoneNumber,
      message,
    });
  }
  
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
      cleaned = countryCode.replace('+', '') + cleaned;
    }
    
    return '+' + cleaned;
  }
  
  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}

export const smsService = new SMSService();
export default smsService;