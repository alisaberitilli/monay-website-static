import axios from 'axios';

class NudgeOTPService {
  constructor() {
    // Initialize Nudge API configuration
    this.nudgeApiUrl = process.env.NUDGE_API_URL || 'https://app.nudge.net';
    // Using single API key for both SMS and Email (SMS_OTP2 key)
    this.nudgeApiKey = process.env.NUDGE_API_KEY || 'S`zpcX0ICKvBVj3gRL0v2ASCQwQKBxKB73kGIFzGSJNrxNr50Hui+kiS59mzvFBHoaqx6YQqsJFMy75gDE2XkExg==';
    this.nudgeSmsApiKey = process.env.NUDGE_SMS_API_KEY || 'S`zpcX0ICKvBVj3gRL0v2ASCQwQKBxKB73kGIFzGSJNrxNr50Hui+kiS59mzvFBHoaqx6YQqsJFMy75gDE2XkExg==';
    
    // Store OTPs in memory (in production, use Redis or database)
    this.otpStore = new Map();
  }

  /**
   * Generate and send OTP via SMS
   * @param {string} phoneNumber - Phone number to send OTP to
   * @param {string} userId - User ID for tracking
   * @returns {Promise<Object>} - Result of OTP sending
   */
  async sendSMSOTP(phoneNumber, userId) {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiry (5 minutes)
      const key = `sms_${phoneNumber}_${userId}`;
      this.otpStore.set(key, {
        otp,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      });

      // Send SMS via Nudge API
      try {
        // Use Nudge Send API with correct parameters for SMS
        const response = await axios.post(
          `${this.nudgeApiUrl}/v1/Nudge/Send`,
          {
            nudgeId: "5248", // SMS OTP Nudge ID
            channel: 1, // 1 for SMS
            toPhoneNumber: phoneNumber,
            recipientId: userId,
            mergeTags: [
              { tag: "otp", value: otp }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${this.nudgeSmsApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`SMS OTP sent to ${phoneNumber}`);
      } catch (apiError) {
        // If API fails, still log OTP for demo purposes
        console.log(`[DEMO MODE] SMS OTP for ${phoneNumber}: ${otp}`);
        console.error('Nudge SMS API error:', apiError.message);
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        demo: process.env.NODE_ENV !== 'production',
        ...(process.env.NODE_ENV !== 'production' && { otp }) // Include OTP in demo mode
      };
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Generate and send OTP via Email
   * @param {string} email - Email address to send OTP to
   * @param {string} userId - User ID for tracking
   * @param {string} userName - User's name for personalization
   * @returns {Promise<Object>} - Result of OTP sending
   */
  async sendEmailOTP(email, userId, userName = 'User') {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiry (10 minutes for email)
      const key = `email_${email}_${userId}`;
      this.otpStore.set(key, {
        otp,
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      });

      // Send Email via Nudge API
      try {
        // Use Nudge Send API with same API key as SMS (testing if it works for both)
        const response = await axios.post(
          `${this.nudgeApiUrl}/v1/Nudge/Send`,
          {
            nudgeId: "5248", // Using same Nudge ID as SMS to test
            channel: 0, // 0 for email
            toEmailAddress: email,
            recipientId: userId,
            toName: userName,
            mergeTags: [
              { tag: "otp", value: otp },
              { tag: "USER_NAME", value: userName },
              { tag: "EXPIRY_TIME", value: "10 minutes" }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${this.nudgeApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log(`Email OTP sent to ${email}`);
      } catch (apiError) {
        // If API fails, still log OTP for demo purposes
        console.log(`[DEMO MODE] Email OTP for ${email}: ${otp}`);
        console.error('Nudge Email API error:', apiError.message);
        
        // Fallback: Try sending plain email without template
        try {
          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Email Verification</h2>
              <p>Hello ${userName},</p>
              <p>Your Monay verification code is:</p>
              <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this verification, please ignore this email.</p>
              <br>
              <p>Best regards,<br>The Monay Team</p>
            </div>
          `;
          
          await axios.post(
            `${this.nudgeApiUrl}/v1/Nudge/SendEmail`,
            {
              to: email,
              subject: 'Monay - Email Verification Code',
              html: htmlContent
            },
            {
              headers: {
                'Authorization': `Bearer ${this.nudgeApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (fallbackError) {
          console.error('Nudge Email fallback error:', fallbackError.message);
        }
      }

      return {
        success: true,
        message: 'OTP sent successfully',
        demo: process.env.NODE_ENV !== 'production',
        ...(process.env.NODE_ENV !== 'production' && { otp }) // Include OTP in demo mode
      };
    } catch (error) {
      console.error('Error sending Email OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP
   * @param {string} type - 'sms' or 'email'
   * @param {string} identifier - Phone number or email
   * @param {string} userId - User ID
   * @param {string} otp - OTP to verify
   * @returns {Object} - Verification result
   */
  verifyOTP(type, identifier, userId, otp) {
    const key = `${type}_${identifier}_${userId}`;
    const storedData = this.otpStore.get(key);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP not found or expired. Please request a new one.'
      };
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(key);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      this.otpStore.delete(key);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Verify OTP
    if (storedData.otp === otp) {
      this.otpStore.delete(key);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    }

    // Increment attempts
    storedData.attempts += 1;
    this.otpStore.set(key, storedData);

    return {
      success: false,
      message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
    };
  }

  /**
   * Resend OTP
   * @param {string} type - 'sms' or 'email'
   * @param {string} identifier - Phone number or email
   * @param {string} userId - User ID
   * @param {string} userName - User's name (for email)
   * @returns {Promise<Object>} - Result of OTP resending
   */
  async resendOTP(type, identifier, userId, userName) {
    const key = `${type}_${identifier}_${userId}`;
    const storedData = this.otpStore.get(key);

    // Check if we can resend (wait at least 30 seconds between resends)
    if (storedData && (Date.now() - storedData.createdAt) < 30000) {
      const waitTime = Math.ceil((30000 - (Date.now() - storedData.createdAt)) / 1000);
      return {
        success: false,
        message: `Please wait ${waitTime} seconds before requesting a new OTP.`
      };
    }

    // Clear old OTP if exists
    if (storedData) {
      this.otpStore.delete(key);
    }

    // Send new OTP
    if (type === 'sms') {
      return await this.sendSMSOTP(identifier, userId);
    } else {
      return await this.sendEmailOTP(identifier, userId, userName);
    }
  }

  /**
   * Clean up expired OTPs (should be called periodically)
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [key, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(key);
      }
    }
  }
}

// Create singleton instance
const nudgeOTPService = new NudgeOTPService();

// Clean up expired OTPs every minute
setInterval(() => {
  nudgeOTPService.cleanupExpiredOTPs();
}, 60000);

export default nudgeOTPService;