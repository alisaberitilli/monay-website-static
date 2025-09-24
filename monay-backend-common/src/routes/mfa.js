const express = require('express');
const router = express.Router();
const mfaService = require('../services/mfa');
const { authenticate } = require('../middleware/auth');
const { auditAction } = require('../middleware/audit');
const { AuditActions } = require('../services/audit-log');

/**
 * @route POST /api/mfa/setup
 * @desc Initialize MFA setup for user
 * @access Private
 */
router.post('/setup',
  authenticate,
  auditAction('MFA_SETUP_INITIATED'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const email = req.user.email;

      // Check if MFA is already enabled
      const status = await mfaService.getMFAStatus(userId);
      if (status?.enabled) {
        return res.status(400).json({
          success: false,
          error: 'MFA is already enabled for this account'
        });
      }

      // Generate secret and QR code
      const mfaData = await mfaService.generateSecret(userId, email);
      const qrCode = await mfaService.generateQRCode(mfaData.qrCode);

      // Store temporary secret in session
      req.session.mfaSetup = {
        secret: mfaData.secret,
        backupCodes: mfaData.backupCodes,
        timestamp: Date.now()
      };

      res.json({
        success: true,
        data: {
          qrCode,
          manual: mfaData.manual,
          backupCodes: mfaData.backupCodes
        }
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initialize MFA setup'
      });
    }
  }
);

/**
 * @route POST /api/mfa/verify-setup
 * @desc Verify MFA setup with initial token
 * @access Private
 */
router.post('/verify-setup',
  authenticate,
  async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      // Check session for setup data
      if (!req.session.mfaSetup) {
        return res.status(400).json({
          success: false,
          error: 'MFA setup session expired. Please restart setup.'
        });
      }

      // Verify setup hasn't expired (30 minutes)
      const setupAge = Date.now() - req.session.mfaSetup.timestamp;
      if (setupAge > 30 * 60 * 1000) {
        delete req.session.mfaSetup;
        return res.status(400).json({
          success: false,
          error: 'MFA setup expired. Please restart setup.'
        });
      }

      // Verify token
      const verified = mfaService.verifyTOTP(
        token,
        req.session.mfaSetup.secret,
        userId
      );

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code'
        });
      }

      // Enable MFA for user
      await mfaService.enableMFA(
        userId,
        req.session.mfaSetup.secret,
        req.session.mfaSetup.backupCodes
      );

      // Clear setup session
      delete req.session.mfaSetup;

      res.json({
        success: true,
        message: 'MFA has been successfully enabled'
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify MFA setup'
      });
    }
  }
);

/**
 * @route POST /api/mfa/verify
 * @desc Verify MFA token for authentication
 * @access Private
 */
router.post('/verify',
  authenticate,
  async (req, res) => {
    try {
      const { token, type = 'totp' } = req.body;
      const userId = req.user.id;

      // Check lockout status
      const lockoutStatus = await mfaService.checkLockout(userId);
      if (lockoutStatus.locked) {
        return res.status(429).json({
          success: false,
          error: 'Account temporarily locked due to too many failed attempts',
          remainingSeconds: lockoutStatus.remainingSeconds
        });
      }

      // Get user MFA secret
      const db = require('../models');
      const user = await db.User.findByPk(userId);
      
      if (!user.mfaEnabled || !user.mfaSecret) {
        return res.status(400).json({
          success: false,
          error: 'MFA is not enabled for this account'
        });
      }

      let verified = false;
      let updateData = {};

      if (type === 'totp') {
        // Verify TOTP token
        const encryptedSecret = JSON.parse(user.mfaSecret);
        const secret = mfaService.decryptSecret(encryptedSecret);
        verified = mfaService.verifyTOTP(token, secret, userId);
      } else if (type === 'backup') {
        // Verify backup code
        const backupCodes = JSON.parse(user.mfaBackupCodes || '[]');
        const result = mfaService.verifyBackupCode(token, backupCodes);
        verified = result.verified;
        
        if (verified) {
          // Update remaining backup codes
          updateData.mfaBackupCodes = JSON.stringify(result.remainingCodes);
        }
      }

      if (!verified) {
        // Handle failed attempt
        const lockoutResult = await mfaService.handleFailedAttempt(userId);
        
        return res.status(401).json({
          success: false,
          error: 'Invalid verification code',
          remainingAttempts: lockoutResult.remainingAttempts,
          locked: lockoutResult.locked
        });
      }

      // Reset failed attempts
      await mfaService.resetFailedAttempts(userId);

      // Update user if needed (e.g., backup codes)
      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }

      // Generate MFA verification token
      const mfaToken = require('jsonwebtoken').sign(
        { userId, mfaVerified: true },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      res.json({
        success: true,
        mfaToken,
        message: 'MFA verification successful'
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify MFA token'
      });
    }
  }
);

/**
 * @route POST /api/mfa/disable
 * @desc Disable MFA for user account
 * @access Private
 */
router.post('/disable',
  authenticate,
  auditAction(AuditActions.MFA_DISABLED, {
    severity: 'WARNING',
    category: 'SECURITY'
  }),
  async (req, res) => {
    try {
      const { password, token } = req.body;
      const userId = req.user.id;

      // Verify password
      const db = require('../models');
      const user = await db.User.findByPk(userId);
      const bcrypt = require('bcryptjs');
      
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }

      // Verify MFA token before disabling
      const encryptedSecret = JSON.parse(user.mfaSecret);
      const secret = mfaService.decryptSecret(encryptedSecret);
      const verified = mfaService.verifyTOTP(token, secret, userId);

      if (!verified) {
        return res.status(401).json({
          success: false,
          error: 'Invalid MFA token'
        });
      }

      // Disable MFA
      await mfaService.disableMFA(userId);

      res.json({
        success: true,
        message: 'MFA has been disabled'
      });
    } catch (error) {
      console.error('Disable MFA error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to disable MFA'
      });
    }
  }
);

/**
 * @route GET /api/mfa/status
 * @desc Get MFA status for current user
 * @access Private
 */
router.get('/status',
  authenticate,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await mfaService.getMFAStatus(userId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get MFA status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get MFA status'
      });
    }
  }
);

/**
 * @route POST /api/mfa/backup-codes/regenerate
 * @desc Generate new backup codes
 * @access Private
 */
router.post('/backup-codes/regenerate',
  authenticate,
  auditAction('MFA_BACKUP_CODES_REGENERATED'),
  async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user.id;

      // Verify password
      const db = require('../models');
      const user = await db.User.findByPk(userId);
      const bcrypt = require('bcryptjs');
      
      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }

      // Generate new backup codes
      const newCodes = await mfaService.regenerateBackupCodes(userId);

      res.json({
        success: true,
        data: {
          backupCodes: newCodes
        }
      });
    } catch (error) {
      console.error('Regenerate backup codes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate backup codes'
      });
    }
  }
);

/**
 * @route POST /api/mfa/send-sms
 * @desc Send SMS OTP for verification
 * @access Private
 */
router.post('/send-sms',
  authenticate,
  auditAction('MFA_SMS_SENT'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const phoneNumber = req.user.phoneNumber;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'No phone number associated with account'
        });
      }

      // Generate OTP
      const otp = mfaService.generateSMSOTP();
      
      // Store OTP in session
      req.session.smsOTP = {
        code: otp,
        timestamp: Date.now(),
        attempts: 0
      };

      // Send SMS (integrate with SMS provider)
      // await smsService.send(phoneNumber, `Your Monay verification code is: ${otp}`);

      res.json({
        success: true,
        message: 'SMS code sent',
        maskedPhone: phoneNumber.replace(/.(?=.{4})/g, '*')
      });
    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send SMS code'
      });
    }
  }
);

/**
 * @route POST /api/mfa/verify-sms
 * @desc Verify SMS OTP
 * @access Private
 */
router.post('/verify-sms',
  authenticate,
  async (req, res) => {
    try {
      const { code } = req.body;
      const userId = req.user.id;

      if (!req.session.smsOTP) {
        return res.status(400).json({
          success: false,
          error: 'No SMS verification in progress'
        });
      }

      // Check attempts
      req.session.smsOTP.attempts++;
      if (req.session.smsOTP.attempts > 5) {
        delete req.session.smsOTP;
        return res.status(429).json({
          success: false,
          error: 'Too many failed attempts'
        });
      }

      // Verify OTP
      const result = mfaService.verifyOTP(
        code,
        req.session.smsOTP.code,
        req.session.smsOTP.timestamp
      );

      if (!result.verified) {
        return res.status(401).json({
          success: false,
          error: result.reason === 'expired' ? 'Code expired' : 'Invalid code',
          remainingAttempts: 5 - req.session.smsOTP.attempts
        });
      }

      // Clear OTP from session
      delete req.session.smsOTP;

      // Generate MFA verification token
      const mfaToken = require('jsonwebtoken').sign(
        { userId, mfaVerified: true, method: 'sms' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      res.json({
        success: true,
        mfaToken,
        message: 'SMS verification successful'
      });
    } catch (error) {
      console.error('Verify SMS error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify SMS code'
      });
    }
  }
);

/**
 * @route POST /api/mfa/check-requirement
 * @desc Check if MFA is required for an action
 * @access Private
 */
router.post('/check-requirement',
  authenticate,
  async (req, res) => {
    try {
      const { action } = req.body;
      const userId = req.user.id;

      const required = await mfaService.requiresMFA(userId, action);

      res.json({
        success: true,
        required,
        action
      });
    } catch (error) {
      console.error('Check MFA requirement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check MFA requirement'
      });
    }
  }
);

module.exports = router;