import { Router } from 'express';
import HttpStatus from 'http-status';
import nudgeOTPService from '../services/nudge-otp.js';
import models from '../models/index.js';
import utility from '../services/utility.js';
import middlewares from '../middlewares';

const { User } = models;

const router = Router();
const { authMiddleware } = middlewares;

// POST /api/verification/send-mobile-otp
router.post('/verification/send-mobile-otp', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.mobile) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No mobile number found for this user'
      });
    }
    
    if (user.isMobileVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Mobile number is already verified'
      });
    }
    
    // Send OTP
    const result = await nudgeOTPService.sendSMSOTP(user.mobile, userId);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      data: {
        mobile: user.mobile.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3'), // Mask number
        ...result
      }
    });
  } catch (error) {
    console.error('Error sending mobile OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// POST /api/verification/verify-mobile-otp
router.post('/verification/verify-mobile-otp', authMiddleware, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    
    if (!otp) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'OTP is required'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.mobile) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No mobile number found for this user'
      });
    }
    
    // Verify OTP
    const result = nudgeOTPService.verifyOTP('sms', user.mobile, userId, otp);
    
    if (result.success) {
      // Update user's mobile verification status
      await user.update({ isMobileVerified: true });
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Mobile number verified successfully',
        data: {
          isMobileVerified: true
        }
      });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error verifying mobile OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
});

// POST /api/verification/send-email-otp
router.post('/verification/send-email-otp', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No email address found for this user'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email address is already verified'
      });
    }
    
    // Send OTP
    const userName = `${user.firstName} ${user.lastName}`.trim() || 'User';
    const result = await nudgeOTPService.sendEmailOTP(user.email, userId, userName);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent successfully to your email address',
      data: {
        email: user.email.replace(/^(.{2}).*(@.*)$/, '$1***$2'), // Mask email
        ...result
      }
    });
  } catch (error) {
    console.error('Error sending email OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// POST /api/verification/verify-email-otp
router.post('/verification/verify-email-otp', authMiddleware, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;
    
    if (!otp) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'OTP is required'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No email address found for this user'
      });
    }
    
    // Verify OTP
    const result = nudgeOTPService.verifyOTP('email', user.email, userId, otp);
    
    if (result.success) {
      // Update user's email verification status
      await user.update({ isEmailVerified: true });
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Email address verified successfully',
        data: {
          isEmailVerified: true
        }
      });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
});

// POST /api/verification/resend-otp
router.post('/verification/resend-otp', authMiddleware, async (req, res, next) => {
  try {
    const { type } = req.body; // 'sms' or 'email'
    const userId = req.user.id;
    
    if (!type || !['sms', 'email'].includes(type)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid verification type. Must be "sms" or "email"'
      });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let result;
    if (type === 'sms') {
      if (!user.mobile) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No mobile number found for this user'
        });
      }
      result = await nudgeOTPService.resendOTP('sms', user.mobile, userId);
    } else {
      if (!user.email) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No email address found for this user'
        });
      }
      const userName = `${user.firstName} ${user.lastName}`.trim() || 'User';
      result = await nudgeOTPService.resendOTP('email', user.email, userId, userName);
    }
    
    if (result.success) {
      res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
        data: result
      });
    } else {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to resend OTP'
    });
  }
});

// POST /api/verification/send-otp-unauthenticated - For login/signup flow
router.post('/verification/send-otp-unauthenticated', async (req, res, next) => {
  try {
    const { identifier, type } = req.body; // identifier can be email or phone, type is 'sms' or 'email'
    
    if (!identifier || !type) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Identifier and type are required'
      });
    }
    
    // Find user by email or mobile
    let user;
    if (type === 'email') {
      user = await User.findOne({ where: { email: identifier } });
    } else {
      user = await User.findOne({ where: { mobile: identifier } });
    }
    
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Send OTP
    let result;
    if (type === 'sms') {
      result = await nudgeOTPService.sendSMSOTP(user.mobile, user.id);
    } else {
      const userName = `${user.firstName} ${user.lastName}`.trim() || 'User';
      result = await nudgeOTPService.sendEmailOTP(user.email, user.id, userName);
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        ...result,
        userId: user.id // Return userId for verification
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to send OTP'
    });
  }
});

// POST /api/verification/verify-otp-unauthenticated - For login/signup flow
router.post('/verification/verify-otp-unauthenticated', async (req, res, next) => {
  try {
    const { identifier, type, otp, userId } = req.body;
    
    if (!identifier || !type || !otp || !userId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Verify OTP
    const result = nudgeOTPService.verifyOTP(type, identifier, userId, otp);
    
    if (result.success) {
      // Update user's verification status
      const user = await User.findByPk(userId);
      if (user) {
        if (type === 'sms') {
          await user.update({ isMobileVerified: true });
        } else {
          await user.update({ isEmailVerified: true });
        }
      }
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Verification successful',
        data: {
          verified: true,
          type: type
        }
      });
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to verify OTP'
    });
  }
});

export default router;