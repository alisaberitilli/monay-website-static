/**
 * Virtual Card Routes
 * Consumer Wallet Phase 2 Day 10 Implementation
 */

import express from 'express';
import Stripe from 'stripe';
import virtualCardService from '../services/virtual-card-service.js';
import cardManagementService from '../services/card-management-service.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';
import Joi from 'joi';
import logger from '../services/enhanced-logger.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Validation schemas
const createCardSchema = Joi.object({
  body: Joi.object({
    cardName: Joi.string().max(100).optional(),
    cardTier: Joi.string().valid('standard', 'premium', 'metal').default('standard'),
    designTemplate: Joi.string().max(50).optional(),
    spendingLimits: Joi.object({
      daily: Joi.number().positive().max(50000).optional(),
      monthly: Joi.number().positive().max(250000).optional(),
      perTransaction: Joi.number().positive().max(25000).optional()
    }).optional()
  })
});

const updateSpendingLimitsSchema = Joi.object({
  params: Joi.object({
    cardId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    daily: Joi.number().positive().max(50000).optional(),
    monthly: Joi.number().positive().max(250000).optional(),
    perTransaction: Joi.number().positive().max(25000).optional()
  })
});

const updateSpendingControlsSchema = Joi.object({
  params: Joi.object({
    cardId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    blockedCategories: Joi.array().items(Joi.string()).optional(),
    allowedCategories: Joi.array().items(Joi.string()).optional(),
    internationalEnabled: Joi.boolean().optional(),
    allowedCountries: Joi.array().items(Joi.string().length(2)).optional(),
    blockedCountries: Joi.array().items(Joi.string().length(2)).optional(),
    atmEnabled: Joi.boolean().optional(),
    onlineEnabled: Joi.boolean().optional(),
    contactlessEnabled: Joi.boolean().optional(),
    allowedDays: Joi.array().items(Joi.number().min(0).max(6)).optional(),
    allowedHoursStart: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    allowedHoursEnd: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    maxTransactionsPerDay: Joi.number().positive().max(100).optional(),
    blockedMerchants: Joi.array().items(Joi.string()).optional()
  })
});

const setPinSchema = Joi.object({
  params: Joi.object({
    cardId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    pin: Joi.string().pattern(/^[0-9]{4}$/).required(),
    currentPin: Joi.string().pattern(/^[0-9]{4}$/).optional()
  })
});

const addToWalletSchema = Joi.object({
  params: Joi.object({
    cardId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    walletProvider: Joi.string().valid('apple', 'google', 'samsung').required(),
    deviceData: Joi.object({
      deviceId: Joi.string().required(),
      deviceName: Joi.string().optional(),
      deviceType: Joi.string().optional(),
      phoneNumber: Joi.string().optional()
    }).required()
  })
});

const transactionHistorySchema = Joi.object({
  params: Joi.object({
    cardId: Joi.string().uuid().required()
  }),
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
});

/**
 * @route   POST /api/virtual-cards
 * @desc    Create a new virtual card
 * @access  Private
 */
router.post('/',
  authenticateToken,
  validate(createCardSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await virtualCardService.createVirtualCard(userId, req.body);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/virtual-cards
 * @desc    Get user's virtual cards
 * @access  Private
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cards = await virtualCardService.getUserCards(userId);

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
 * @route   GET /api/virtual-cards/:cardId
 * @desc    Get card details
 * @access  Private
 */
router.get('/:cardId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { includeSensitive } = req.query;

    const card = await virtualCardService.getCardDetails(
      cardId,
      userId,
      includeSensitive === 'true'
    );

    res.json({
      success: true,
      data: card
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/freeze
 * @desc    Freeze a card
 * @access  Private
 */
router.post('/:cardId/freeze',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await virtualCardService.toggleCardFreeze(cardId, userId, true);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/unfreeze
 * @desc    Unfreeze a card
 * @access  Private
 */
router.post('/:cardId/unfreeze',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await virtualCardService.toggleCardFreeze(cardId, userId, false);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   PUT /api/virtual-cards/:cardId/spending-limits
 * @desc    Update spending limits
 * @access  Private
 */
router.put('/:cardId/spending-limits',
  authenticateToken,
  validate(updateSpendingLimitsSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await virtualCardService.updateSpendingLimits(
      cardId,
      userId,
      req.body
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   PUT /api/virtual-cards/:cardId/spending-controls
 * @desc    Update spending controls
 * @access  Private
 */
router.put('/:cardId/spending-controls',
  authenticateToken,
  validate(updateSpendingControlsSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await virtualCardService.updateSpendingControls(
      cardId,
      userId,
      req.body
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/virtual-cards/:cardId/spending-controls
 * @desc    Get spending controls
 * @access  Private
 */
router.get('/:cardId/spending-controls',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const controls = await cardManagementService.getSpendingControls(cardId, userId);

    res.json({
      success: true,
      data: controls
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/pin
 * @desc    Set or update card PIN
 * @access  Private
 */
router.post('/:cardId/pin',
  authenticateToken,
  validate(setPinSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await cardManagementService.setCardPin(
      cardId,
      userId,
      req.body.pin,
      req.body.currentPin
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/verify-pin
 * @desc    Verify card PIN
 * @access  Private
 */
router.post('/:cardId/verify-pin',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { pin } = req.body;

    const result = await cardManagementService.verifyCardPin(cardId, userId, pin);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/add-to-wallet
 * @desc    Add card to digital wallet
 * @access  Private
 */
router.post('/:cardId/add-to-wallet',
  authenticateToken,
  validate(addToWalletSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { walletProvider, deviceData } = req.body;

    let result;
    if (walletProvider === 'apple') {
      result = await virtualCardService.addToAppleWallet(cardId, userId, deviceData);
    } else if (walletProvider === 'google') {
      result = await virtualCardService.addToGoogleWallet(cardId, userId, deviceData);
    } else {
      throw new ValidationError('Unsupported wallet provider');
    }

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/virtual-cards/:cardId/transactions
 * @desc    Get card transactions
 * @access  Private
 */
router.get('/:cardId/transactions',
  authenticateToken,
  validate(transactionHistorySchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const transactions = await virtualCardService.getCardTransactions(
      cardId,
      userId,
      req.query
    );

    res.json({
      success: true,
      data: {
        transactions,
        count: transactions.length,
        hasMore: transactions.length === parseInt(req.query.limit || 50)
      }
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/replace
 * @desc    Replace a compromised card
 * @access  Private
 */
router.post('/:cardId/replace',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { reason } = req.body;

    const result = await cardManagementService.replaceCard(
      cardId,
      userId,
      reason || 'user_requested'
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   DELETE /api/virtual-cards/:cardId
 * @desc    Cancel/delete a card
 * @access  Private
 */
router.delete('/:cardId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const result = await cardManagementService.cancelCard(cardId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/virtual-cards/:cardId/authorization-holds
 * @desc    Get authorization holds
 * @access  Private
 */
router.get('/:cardId/authorization-holds',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;

    const holds = await cardManagementService.getAuthorizationHolds(cardId, userId);

    res.json({
      success: true,
      data: {
        holds,
        count: holds.length,
        totalHeld: holds.reduce((sum, hold) => sum + hold.amount, 0)
      }
    });
  })
);

/**
 * @route   GET /api/virtual-cards/:cardId/analytics
 * @desc    Get card usage analytics
 * @access  Private
 */
router.get('/:cardId/analytics',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { period = '30d' } = req.query;

    const analytics = await cardManagementService.getCardAnalytics(cardId, userId, period);

    res.json({
      success: true,
      data: analytics
    });
  })
);

/**
 * @route   GET /api/virtual-cards/design-templates
 * @desc    Get available card design templates
 * @access  Private
 */
router.get('/design-templates',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const templates = await db.sequelize.query(
      `SELECT id, name, description, category, is_premium, price
       FROM card_design_templates
       WHERE is_active = TRUE
       ORDER BY is_default DESC, category, name`,
      {
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    });
  })
);

/**
 * @route   PUT /api/virtual-cards/:cardId/design
 * @desc    Update card design
 * @access  Private
 */
router.put('/:cardId/design',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { designTemplateId, customColor } = req.body;

    const result = await cardManagementService.updateCardDesign(
      cardId,
      userId,
      designTemplateId,
      customColor
    );

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/virtual-cards/webhook/stripe
 * @desc    Handle Stripe Issuing webhooks
 * @access  Public (verified by signature)
 */
router.post('/webhook/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_ISSUING_WEBHOOK_SECRET;

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.warn('Stripe Issuing webhook signature verification failed', {
        error: err.message
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'issuing_authorization.request':
        // Real-time authorization
        const authResult = await virtualCardService.handleAuthorizationWebhook(
          event.data.object
        );

        // Stripe expects immediate response for authorization
        res.json(authResult);
        return;

      case 'issuing_authorization.created':
        await cardManagementService.handleAuthorizationCreated(event.data.object);
        break;

      case 'issuing_authorization.updated':
        await cardManagementService.handleAuthorizationUpdated(event.data.object);
        break;

      case 'issuing_transaction.created':
        await cardManagementService.handleTransactionCreated(event.data.object);
        break;

      case 'issuing_card.created':
        await cardManagementService.handleCardCreated(event.data.object);
        break;

      case 'issuing_card.updated':
        await cardManagementService.handleCardUpdated(event.data.object);
        break;

      default:
        logger.debug('Unhandled Stripe Issuing webhook event', {
          type: event.type
        });
    }

    res.json({ received: true });
  })
);

/**
 * @route   GET /api/virtual-cards/merchant-categories
 * @desc    Get list of merchant categories (MCCs)
 * @access  Private
 */
router.get('/merchant-categories',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const categories = cardManagementService.getMerchantCategories();

    res.json({
      success: true,
      data: categories
    });
  })
);

/**
 * @route   POST /api/virtual-cards/:cardId/report-fraud
 * @desc    Report fraudulent transaction
 * @access  Private
 */
router.post('/:cardId/report-fraud',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { cardId } = req.params;
    const { transactionId, description } = req.body;

    const result = await cardManagementService.reportFraud(
      cardId,
      userId,
      transactionId,
      description
    );

    res.json({
      success: true,
      data: result
    });
  })
);

export default router;