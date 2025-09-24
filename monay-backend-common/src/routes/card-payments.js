/**
 * Card Payment Routes
 * Consumer Wallet Phase 2 Day 7 Implementation
 */

import express from 'express';
import Stripe from 'stripe';
import cardPaymentService from '../services/card-payment-service.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';
import Joi from 'joi';
import logger from '../services/enhanced-logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation schemas
const addCardSchema = Joi.object({
  body: Joi.object({
    cardNumber: Joi.string().creditCard().required(),
    expMonth: Joi.number().integer().min(1).max(12).required(),
    expYear: Joi.number().integer().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).required(),
    cvc: Joi.string().pattern(/^[0-9]{3,4}$/).required(),
    cardholderName: Joi.string().min(2).max(100).required(),
    billingZip: Joi.string().pattern(/^[0-9]{5}(-[0-9]{4})?$/).required(),
    nickname: Joi.string().max(50).optional()
  })
});

const createDepositSchema = Joi.object({
  body: Joi.object({
    cardTokenId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(10).max(2500).required(),
    saveCard: Joi.boolean().default(false)
  })
});

const complete3DSSchema = Joi.object({
  params: Joi.object({
    depositId: Joi.string().uuid().required()
  })
});

const depositHistorySchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('pending', 'processing', 'succeeded', 'failed').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
});

/**
 * @route   POST /api/card-payments/cards
 * @desc    Add a new card
 * @access  Private
 */
router.post('/cards',
  authenticateToken,
  validate(addCardSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await cardPaymentService.addCard(userId, req.body);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/card-payments/cards
 * @desc    Get user's cards
 * @access  Private
 */
router.get('/cards',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cards = await cardPaymentService.getUserCards(userId);

    res.json({
      success: true,
      data: {
        cards,
        count: cards.length
      }
    });
  })
);

/**
 * @route   DELETE /api/card-payments/cards/:cardTokenId
 * @desc    Remove a card
 * @access  Private
 */
router.delete('/cards/:cardTokenId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardTokenId } = req.params;

    const result = await cardPaymentService.removeCard(cardTokenId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/card-payments/cards/:cardTokenId/set-primary
 * @desc    Set card as primary
 * @access  Private
 */
router.post('/cards/:cardTokenId/set-primary',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardTokenId } = req.params;

    const result = await cardPaymentService.setPrimaryCard(cardTokenId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/card-payments/deposit
 * @desc    Create card deposit (with 3DS if required)
 * @access  Private
 */
router.post('/deposit',
  authenticateToken,
  validate(createDepositSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const depositData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const result = await cardPaymentService.createCardDeposit(userId, depositData);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/card-payments/deposits/:depositId/complete-3ds
 * @desc    Complete 3D Secure authentication
 * @access  Private
 */
router.post('/deposits/:depositId/complete-3ds',
  authenticateToken,
  validate(complete3DSSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { depositId } = req.params;

    const result = await cardPaymentService.complete3DSAuthentication(depositId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/card-payments/deposits/history
 * @desc    Get deposit history
 * @access  Private
 */
router.get('/deposits/history',
  authenticateToken,
  validate(depositHistorySchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deposits = await cardPaymentService.getDepositHistory(userId, req.query);

    res.json({
      success: true,
      data: {
        deposits,
        count: deposits.length,
        hasMore: deposits.length === parseInt(req.query.limit || 50)
      }
    });
  })
);

/**
 * @route   GET /api/card-payments/deposits/:depositId
 * @desc    Get single deposit details
 * @access  Private
 */
router.get('/deposits/:depositId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { depositId } = req.params;

    const deposit = await cardPaymentService.getDepositDetails(depositId, userId);

    if (!deposit) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Deposit not found'
        }
      });
    }

    res.json({
      success: true,
      data: deposit
    });
  })
);

/**
 * @route   GET /api/card-payments/deposits/limits
 * @desc    Get deposit limits
 * @access  Private
 */
router.get('/deposits/limits',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limits = await cardPaymentService.getDepositLimits(userId);

    res.json({
      success: true,
      data: limits
    });
  })
);

/**
 * @route   POST /api/card-payments/deposits/calculate-fee
 * @desc    Calculate deposit fee
 * @access  Private
 */
router.post('/deposits/calculate-fee',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid amount is required'
        }
      });
    }

    const fees = cardPaymentService.calculateFees(amount);

    res.json({
      success: true,
      data: {
        amount,
        ...fees
      }
    });
  })
);

/**
 * @route   POST /api/card-payments/webhook/stripe
 * @desc    Handle Stripe webhooks
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

    // Handle the event
    await cardPaymentService.handleStripeWebhook(event);

    res.json({ received: true });
  })
);

/**
 * @route   POST /api/card-payments/setup-intent
 * @desc    Create setup intent for saving card without payment
 * @access  Private
 */
router.post('/setup-intent',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Ensure Stripe customer exists
    const stripeCustomerId = await cardPaymentService.ensureStripeCustomer(userId);

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: { userId }
    });

    res.json({
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      }
    });
  })
);

/**
 * @route   POST /api/card-payments/setup-intent/:setupIntentId/confirm
 * @desc    Confirm setup intent after client-side processing
 * @access  Private
 */
router.post('/setup-intent/:setupIntentId/confirm',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { setupIntentId } = req.params;
    const { paymentMethodId, nickname } = req.body;

    // Retrieve setup intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SETUP_FAILED',
          message: 'Card setup not completed'
        }
      });
    }

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save card token to database
    const result = await cardPaymentService.saveCardFromSetupIntent(
      userId,
      paymentMethod,
      nickname
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/card-payments/activity
 * @desc    Get card activity history
 * @access  Private
 */
router.get('/activity',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { limit = 50, offset = 0, cardTokenId } = req.query;

    let query = `
      SELECT
        ca.id, ca.action, ca.description, ca.created_at,
        ct.card_brand, ct.card_last4
      FROM card_activity ca
      JOIN card_tokens ct ON ca.card_token_id = ct.id
      WHERE ca.user_id = :userId
    `;

    const replacements = { userId, limit: parseInt(limit), offset: parseInt(offset) };

    if (cardTokenId) {
      query += ' AND ca.card_token_id = :cardTokenId';
      replacements.cardTokenId = cardTokenId;
    }

    query += ' ORDER BY ca.created_at DESC LIMIT :limit OFFSET :offset';

    const activities = await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        activities,
        count: activities.length
      }
    });
  })
);

/**
 * @route   POST /api/card-payments/fraud/report
 * @desc    Report suspected fraud
 * @access  Private
 */
router.post('/fraud/report',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { depositId, cardTokenId, reason, description } = req.body;

    // Log fraud report
    logger.logSecurity('FRAUD_REPORT', {
      userId,
      depositId,
      cardTokenId,
      reason,
      description
    });

    // TODO: Implement automated fraud response

    res.json({
      success: true,
      data: {
        reportId: `fraud_${Date.now()}`,
        status: 'reported',
        message: 'Fraud report received and will be investigated'
      }
    });
  })
);

export default router;