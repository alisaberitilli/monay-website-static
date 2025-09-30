/**
 * Consumer Wallet API Routes
 * Tempo-powered consumer wallet endpoints with Circle fallback
 */

import express from 'express';
import { validationResult } from 'express-validator';
import ConsumerWalletService from '../services/consumer-wallet-service.js';
import authenticate from '../middleware-app/auth-middleware.js';
import { body, query, param } from 'express-validator';
import db from '../models/index.js';
// import logger from '../services/logger.js';  // Removed - using console

const router = express.Router();
const consumerService = ConsumerWalletService.getInstance();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// Onboarding & KYC
// ============================================

/**
 * @route   POST /api/consumer/onboard
 * @desc    Create consumer account with progressive KYC
 * @access  Public
 */
router.post('/onboard',
  [
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone(),
    body('kycLevel').optional().isInt({ min: 1, max: 3 }).default(1),
    body('referralCode').optional().isString()
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const result = await consumerService.createConsumerWallet(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Consumer wallet created successfully'
      });
    } catch (error) {
      console.error('Consumer onboarding failed:', error);
      next(error);
    }
  }
);

/**
 * @route   POST /api/consumer/kyc/upgrade
 * @desc    Upgrade KYC level for higher limits
 * @access  Private
 */
router.post('/kyc/upgrade',
  authenticate,
  [
    body('targetLevel').isInt({ min: 2, max: 3 }),
    body('documents').optional().isObject()
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { targetLevel, documents } = req.body;
      const userId = req.user.id;

      // Update KYC level
      await db.query(
        `UPDATE users
         SET consumer_kyc_level = $1,
             consumer_daily_limit = $2,
             consumer_monthly_limit = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          targetLevel,
          consumerService.getKYCLimits(targetLevel).daily,
          consumerService.getKYCLimits(targetLevel).monthly,
          userId
        ]
      );

      res.json({
        success: true,
        data: {
          kycLevel: targetLevel,
          limits: consumerService.getKYCLimits(targetLevel)
        },
        message: 'KYC level upgraded successfully'
      });
    } catch (error) {
      console.error('KYC upgrade failed:', error);
      next(error);
    }
  }
);

// ============================================
// Deposits (On-Ramp)
// ============================================

/**
 * @route   POST /api/consumer/deposit
 * @desc    Deposit funds using smart routing
 * @access  Private
 */
router.post('/deposit',
  authenticate,
  [
    body('amount').isFloat({ min: 1 }),
    body('method').isIn(['card', 'ach', 'wire', 'apple_pay', 'google_pay']),
    body('urgency').optional().isIn(['instant', 'standard']).default('standard')
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { amount, method, urgency } = req.body;
      const userId = req.user.id;

      const result = await consumerService.deposit(userId, amount, {
        method,
        urgency
      });

      res.json({
        success: true,
        data: result,
        message: `Deposit of $${amount} initiated via ${result.provider}`
      });
    } catch (error) {
      console.error('Deposit failed:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/consumer/deposit/methods
 * @desc    Get available deposit methods with fees
 * @access  Private
 */
router.get('/deposit/methods',
  authenticate,
  async (req, res, next) => {
    try {
      const methods = {
        instant: [
          { method: 'card', fee: '2.9%', limit: 5000, speed: 'Instant' },
          { method: 'apple_pay', fee: '2.9%', limit: 10000, speed: 'Instant' },
          { method: 'google_pay', fee: '2.9%', limit: 10000, speed: 'Instant' }
        ],
        standard: [
          { method: 'ach', fee: '0.5%', limit: 50000, speed: '3-5 days' },
          { method: 'wire', fee: '$15', limit: 250000, speed: 'Same day' }
        ]
      };

      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Withdrawals (Off-Ramp)
// ============================================

/**
 * @route   POST /api/consumer/withdraw
 * @desc    Withdraw funds to bank account
 * @access  Private
 */
router.post('/withdraw',
  authenticate,
  [
    body('amount').isFloat({ min: 1 }),
    body('destination').isObject(),
    body('speed').optional().isIn(['instant', 'standard']).default('instant')
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { amount, destination, speed } = req.body;
      const userId = req.user.id;

      const result = await consumerService.withdraw(userId, amount, destination, {
        speed
      });

      res.json({
        success: true,
        data: result,
        message: `Withdrawal of $${amount} initiated`
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
      next(error);
    }
  }
);

// ============================================
// Transfers (P2P)
// ============================================

/**
 * @route   POST /api/consumer/transfer
 * @desc    Send money to another user (Tempo-powered)
 * @access  Private
 */
router.post('/transfer',
  authenticate,
  [
    body('to').isString(),
    body('amount').isFloat({ min: 0.01 }),
    body('currency').optional().isIn(['USDC', 'USDT', 'PYUSD']).default('USDC'),
    body('memo').optional().isString().trim()
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { to, amount, currency, memo } = req.body;
      const userId = req.user.id;

      // Check daily limit
      const limitCheck = await db.query(
        'SELECT check_consumer_daily_limit($1, $2) as allowed',
        [userId, amount]
      );

      if (!limitCheck.rows[0].allowed) {
        return res.status(400).json({
          success: false,
          error: 'Daily transfer limit exceeded'
        });
      }

      const result = await consumerService.transfer(userId, to, amount, currency);

      res.json({
        success: true,
        data: {
          ...result,
          memo
        },
        message: `Transfer of ${amount} ${currency} sent successfully`
      });
    } catch (error) {
      console.error('Transfer failed:', error);
      next(error);
    }
  }
);

/**
 * @route   POST /api/consumer/batch-transfer
 * @desc    Send to multiple recipients (Tempo advantage)
 * @access  Private
 */
router.post('/batch-transfer',
  authenticate,
  [
    body('recipients').isArray({ min: 2, max: 100 }),
    body('recipients.*.address').isString(),
    body('recipients.*.amount').isFloat({ min: 0.01 }),
    body('recipients.*.currency').optional().default('USDC')
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { recipients } = req.body;
      const userId = req.user.id;

      const result = await consumerService.batchTransfer(userId, recipients);

      res.json({
        success: true,
        data: result,
        message: `Batch transfer to ${recipients.length} recipients completed`
      });
    } catch (error) {
      console.error('Batch transfer failed:', error);
      next(error);
    }
  }
);

// ============================================
// Portfolio & Balances
// ============================================

/**
 * @route   GET /api/consumer/portfolio
 * @desc    Get multi-stablecoin portfolio
 * @access  Private
 */
router.get('/portfolio',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const portfolio = await consumerService.getPortfolio(userId);

      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Portfolio fetch failed:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/consumer/balance
 * @desc    Get current balance
 * @access  Private
 */
router.get('/balance',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const balance = await consumerService.getBalance(userId);

      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      console.error('Balance fetch failed:', error);
      next(error);
    }
  }
);

// ============================================
// Stablecoin Operations
// ============================================

/**
 * @route   POST /api/consumer/swap
 * @desc    Instant swap between stablecoins (Tempo)
 * @access  Private
 */
router.post('/swap',
  authenticate,
  [
    body('from').isIn(['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB']),
    body('to').isIn(['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB']),
    body('amount').isFloat({ min: 0.01 })
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { from, to, amount } = req.body;
      const userId = req.user.id;

      if (from === to) {
        return res.status(400).json({
          success: false,
          error: 'Cannot swap same currency'
        });
      }

      const result = await consumerService.swapStablecoins(userId, from, to, amount);

      res.json({
        success: true,
        data: result,
        message: `Swapped ${amount} ${from} to ${result.outputAmount} ${to}`
      });
    } catch (error) {
      console.error('Swap failed:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/consumer/swap/rates
 * @desc    Get current swap rates
 * @access  Public
 */
router.get('/swap/rates',
  async (req, res, next) => {
    try {
      // In production, these would be real-time rates
      const rates = {
        'USDC-USDT': 0.9998,
        'USDC-PYUSD': 1.0001,
        'USDC-EURC': 1.0823,
        'USDC-USDB': 1.0000,
        'USDT-PYUSD': 1.0003,
        'USDT-EURC': 1.0825,
        fee: 0.0001,
        provider: 'tempo'
      };

      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Transaction History
// ============================================

/**
 * @route   GET /api/consumer/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/transactions',
  authenticate,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
    query('offset').optional().isInt({ min: 0 }).default(0),
    query('type').optional().isIn(['deposit', 'withdrawal', 'transfer', 'swap', 'batch_transfer'])
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { limit, offset, type } = req.query;

      let query = `
        SELECT * FROM transactions
        WHERE user_id = $1
      `;
      const params = [userId];

      if (type) {
        query += ` AND type = $2`;
        params.push(type);
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rowCount
        }
      });
    } catch (error) {
      console.error('Transaction fetch failed:', error);
      next(error);
    }
  }
);

// ============================================
// Settings & Preferences
// ============================================

/**
 * @route   GET /api/consumer/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await db.query(
        'SELECT * FROM consumer_preferences WHERE user_id = $1',
        [userId]
      );

      res.json({
        success: true,
        data: result.rows[0] || {}
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/consumer/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences',
  authenticate,
  [
    body('preferred_currency').optional().isIn(['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB']),
    body('auto_balance').optional().isBoolean(),
    body('smart_routing').optional().isBoolean(),
    body('instant_notifications').optional().isBoolean()
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(req.body)) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }

      if (updates.length > 0) {
        values.push(userId);
        await db.query(
          `UPDATE consumer_preferences
           SET ${updates.join(', ')}, updated_at = NOW()
           WHERE user_id = $${paramCount}`,
          values
        );
      }

      res.json({
        success: true,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Limits & Compliance
// ============================================

/**
 * @route   GET /api/consumer/limits
 * @desc    Get current limits and usage
 * @access  Private
 */
router.get('/limits',
  authenticate,
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get user limits
      const userResult = await db.query(
        `SELECT consumer_kyc_level, consumer_daily_limit, consumer_monthly_limit
         FROM users WHERE id = $1`,
        [userId]
      );

      // Get today's usage
      const dailyResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as daily_used
         FROM transactions
         WHERE user_id = $1
           AND created_at >= CURRENT_DATE
           AND type IN ('transfer', 'withdrawal')`,
        [userId]
      );

      // Get this month's usage
      const monthlyResult = await db.query(
        `SELECT COALESCE(SUM(amount), 0) as monthly_used
         FROM transactions
         WHERE user_id = $1
           AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
           AND type IN ('transfer', 'withdrawal')`,
        [userId]
      );

      const user = userResult.rows[0];
      const daily_used = parseFloat(dailyResult.rows[0].daily_used);
      const monthly_used = parseFloat(monthlyResult.rows[0].monthly_used);

      res.json({
        success: true,
        data: {
          kycLevel: user.consumer_kyc_level,
          daily: {
            limit: parseFloat(user.consumer_daily_limit),
            used: daily_used,
            remaining: parseFloat(user.consumer_daily_limit) - daily_used
          },
          monthly: {
            limit: parseFloat(user.consumer_monthly_limit),
            used: monthly_used,
            remaining: parseFloat(user.consumer_monthly_limit) - monthly_used
          }
        }
      });
    } catch (error) {
      console.error('Limits fetch failed:', error);
      next(error);
    }
  }
);

// ============================================
// Provider Status
// ============================================

/**
 * @route   GET /api/consumer/providers/status
 * @desc    Get status of all providers
 * @access  Private
 */
router.get('/providers/status',
  authenticate,
  async (req, res, next) => {
    try {
      const factory = consumerService.factory;

      const status = {
        tempo: {
          available: await factory.getProvider('tempo')?.isHealthy() || false,
          priority: 1,
          features: ['100k+ TPS', '$0.0001 fees', '<100ms settlement', 'Batch transfers']
        },
        circle: {
          available: await factory.getProvider('circle')?.isHealthy() || false,
          priority: 2,
          features: ['USDC focused', 'Proven reliability', 'Programmable wallets']
        },
        monay: {
          available: false, // Future
          priority: 0,
          features: ['Coming 2026', 'Zero fees', 'Proprietary blockchain']
        }
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;