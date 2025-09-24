/**
 * Withdrawal Routes
 * Consumer Wallet Phase 2 Day 8 Implementation
 */

import express from 'express';
import withdrawalService from '../services/withdrawal-service.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';
import Joi from 'joi';
import logger from '../services/enhanced-logger.js';

const router = express.Router();

// Validation schemas
const createBankWithdrawalSchema = Joi.object({
  body: Joi.object({
    bankAccountId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(10).max(10000).required(),
    method: Joi.string().valid('standard', 'same_day').default('standard'),
    description: Joi.string().max(255).optional()
  })
});

const createInstantPayoutSchema = Joi.object({
  body: Joi.object({
    cardTokenId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(10).max(2500).required(),
    description: Joi.string().max(255).optional()
  })
});

const createWireWithdrawalSchema = Joi.object({
  body: Joi.object({
    wireDetailsId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(100).max(100000).required(),
    reference: Joi.string().max(100).optional(),
    description: Joi.string().max(255).optional()
  })
});

const verifyWithdrawalSchema = Joi.object({
  params: Joi.object({
    withdrawalId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    verificationCode: Joi.string().pattern(/^[0-9]{6}$/).required()
  })
});

const withdrawalHistorySchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('pending', 'processing', 'sent', 'completed', 'failed', 'cancelled').optional(),
    type: Joi.string().valid('bank_ach', 'bank_wire', 'card_instant').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
});

/**
 * @route   POST /api/withdrawals/bank
 * @desc    Create bank withdrawal (ACH)
 * @access  Private
 */
router.post('/bank',
  authenticateToken,
  validate(createBankWithdrawalSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const withdrawalData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await withdrawalService.createBankWithdrawal(userId, withdrawalData);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/withdrawals/instant
 * @desc    Create instant payout to debit card
 * @access  Private
 */
router.post('/instant',
  authenticateToken,
  validate(createInstantPayoutSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const payoutData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await withdrawalService.createInstantPayout(userId, payoutData);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/withdrawals/wire
 * @desc    Create wire withdrawal
 * @access  Private
 */
router.post('/wire',
  authenticateToken,
  validate(createWireWithdrawalSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const wireData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    // Wire withdrawals use similar flow to ACH but with different limits
    const result = await withdrawalService.createBankWithdrawal(userId, {
      ...wireData,
      method: 'wire',
      type: 'bank_wire'
    });

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/withdrawals/:withdrawalId/verify
 * @desc    Verify withdrawal with code
 * @access  Private
 */
router.post('/:withdrawalId/verify',
  authenticateToken,
  validate(verifyWithdrawalSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { withdrawalId } = req.params;
    const { verificationCode } = req.body;

    const result = await withdrawalService.verifyWithdrawal(
      withdrawalId,
      userId,
      verificationCode
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/withdrawals/:withdrawalId/cancel
 * @desc    Cancel pending withdrawal
 * @access  Private
 */
router.post('/:withdrawalId/cancel',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    const result = await withdrawalService.cancelWithdrawal(
      withdrawalId,
      userId,
      reason || 'User requested cancellation'
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/withdrawals/history
 * @desc    Get withdrawal history
 * @access  Private
 */
router.get('/history',
  authenticateToken,
  validate(withdrawalHistorySchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const withdrawals = await withdrawalService.getWithdrawalHistory(userId, req.query);

    res.json({
      success: true,
      data: {
        withdrawals,
        count: withdrawals.length,
        hasMore: withdrawals.length === parseInt(req.query.limit || 50)
      }
    });
  })
);

/**
 * @route   GET /api/withdrawals/:withdrawalId
 * @desc    Get single withdrawal details
 * @access  Private
 */
router.get('/:withdrawalId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { withdrawalId } = req.params;

    const withdrawal = await db.sequelize.query(
      `SELECT * FROM withdrawals
       WHERE id = :withdrawalId AND user_id = :userId`,
      {
        replacements: { withdrawalId, userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!withdrawal || withdrawal.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Withdrawal not found'
        }
      });
    }

    res.json({
      success: true,
      data: withdrawal[0]
    });
  })
);

/**
 * @route   GET /api/withdrawals/limits
 * @desc    Get withdrawal limits
 * @access  Private
 */
router.get('/limits',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limits = await withdrawalService.getWithdrawalLimits(userId);

    res.json({
      success: true,
      data: limits
    });
  })
);

/**
 * @route   POST /api/withdrawals/calculate-fee
 * @desc    Calculate withdrawal fee
 * @access  Private
 */
router.post('/calculate-fee',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { amount, type, method } = req.body;

    if (!amount || !type || !method) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount, type, and method are required'
        }
      });
    }

    const fees = withdrawalService.calculateWithdrawalFees(amount, type, method);

    res.json({
      success: true,
      data: {
        amount,
        type,
        method,
        ...fees
      }
    });
  })
);

/**
 * @route   GET /api/withdrawals/methods
 * @desc    Get user's withdrawal methods
 * @access  Private
 */
router.get('/methods',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const methods = await db.sequelize.query(
      `SELECT
        wm.id, wm.type, wm.nickname, wm.is_primary, wm.is_verified,
        wm.supports_ach, wm.supports_wire, wm.supports_instant,
        wm.verification_status, wm.last_used_at,
        CASE
          WHEN wm.type = 'bank_account' THEN ba.last_four
          WHEN wm.type = 'debit_card' THEN ct.card_last4
          ELSE NULL
        END as last_four,
        CASE
          WHEN wm.type = 'bank_account' THEN ba.bank_name
          WHEN wm.type = 'debit_card' THEN ct.card_brand
          ELSE NULL
        END as institution_name
      FROM withdrawal_methods wm
      LEFT JOIN bank_accounts ba ON wm.bank_account_id = ba.id
      LEFT JOIN card_tokens ct ON wm.card_token_id = ct.id
      WHERE wm.user_id = :userId AND wm.status = 'active'
      ORDER BY wm.is_primary DESC, wm.created_at DESC`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        methods,
        count: methods.length
      }
    });
  })
);

/**
 * @route   POST /api/withdrawals/methods/:methodId/set-primary
 * @desc    Set primary withdrawal method
 * @access  Private
 */
router.post('/methods/:methodId/set-primary',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { methodId } = req.params;

    // Remove primary flag from all methods
    await db.sequelize.query(
      `UPDATE withdrawal_methods
       SET is_primary = FALSE
       WHERE user_id = :userId`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Set new primary
    await db.sequelize.query(
      `UPDATE withdrawal_methods
       SET is_primary = TRUE
       WHERE id = :methodId AND user_id = :userId`,
      {
        replacements: { methodId, userId },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      data: { methodId, isPrimary: true }
    });
  })
);

/**
 * @route   GET /api/withdrawals/aml/status
 * @desc    Get AML check status for user
 * @access  Private
 */
router.get('/aml/status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get recent AML checks
    const amlChecks = await db.sequelize.query(
      `SELECT
        ac.check_type, ac.check_result, ac.risk_score,
        ac.requires_manual_review, ac.created_at
      FROM aml_checks ac
      WHERE ac.user_id = :userId
      ORDER BY ac.created_at DESC
      LIMIT 10`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Calculate cumulative amounts
    const cumulative = await db.sequelize.query(
      `SELECT
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN amount ELSE 0 END), 0) as daily_total,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN amount ELSE 0 END), 0) as weekly_total,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as monthly_total
      FROM withdrawals
      WHERE user_id = :userId
      AND status IN ('completed', 'processing', 'sent')`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        recentChecks: amlChecks,
        cumulativeAmounts: cumulative[0],
        thresholds: {
          singleTransaction: 5000,
          dailyCumulative: 10000,
          monthlyCumulative: 50000
        }
      }
    });
  })
);

/**
 * @route   POST /api/withdrawals/resend-verification
 * @desc    Resend verification code
 * @access  Private
 */
router.post('/:withdrawalId/resend-verification',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { withdrawalId } = req.params;

    // Get withdrawal
    const withdrawal = await db.sequelize.query(
      `SELECT * FROM withdrawals
       WHERE id = :withdrawalId AND user_id = :userId
       AND requires_verification = true`,
      {
        replacements: { withdrawalId, userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!withdrawal || withdrawal.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Withdrawal not found or does not require verification'
        }
      });
    }

    // Generate new code
    const verificationCode = withdrawalService.generateVerificationCode();

    // Update withdrawal
    await db.sequelize.query(
      `UPDATE withdrawals
       SET verification_code = :code,
           verification_expires_at = NOW() + INTERVAL '15 minutes'
       WHERE id = :withdrawalId`,
      {
        replacements: { code: verificationCode, withdrawalId },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Send new code
    await withdrawalService.sendVerificationCode(userId, verificationCode);

    res.json({
      success: true,
      data: {
        message: 'Verification code resent',
        expiresIn: 900 // 15 minutes in seconds
      }
    });
  })
);

/**
 * @route   POST /api/withdrawals/webhook/dwolla
 * @desc    Handle Dwolla webhooks for withdrawals
 * @access  Public (verified by signature)
 */
router.post('/webhook/dwolla',
  asyncHandler(async (req, res) => {
    const signature = req.headers['x-dwolla-signature'];
    const secret = process.env.DWOLLA_WEBHOOK_SECRET;

    // Verify webhook signature
    const isValid = dwollaPaymentService.verifyWebhookSignature(
      req.headers,
      req.body,
      secret
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Handle withdrawal-related events
    await withdrawalService.handleDwollaWebhook(req.body);

    res.status(200).json({ success: true });
  })
);

/**
 * @route   POST /api/withdrawals/webhook/stripe
 * @desc    Handle Stripe webhooks for instant payouts
 * @access  Public (verified by signature)
 */
router.post('/webhook/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.warn('Stripe webhook signature verification failed', {
        error: err.message
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Handle payout events
    await withdrawalService.handleStripeWebhook(event);

    res.json({ received: true });
  })
);

export default router;