/**
 * Bank Account Management Routes
 * Consumer Wallet Phase 2 Day 6 Implementation
 */

import express from 'express';
import bankAccountService from '../services/bank-account-service.js';
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const linkBankAccountSchema = Joi.object({
  body: Joi.object({
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    routingNumber: Joi.string().length(9).required(),
    accountType: Joi.string().valid('checking', 'savings').default('checking'),
    bankName: Joi.string().optional(),
    verificationMethod: Joi.string().valid('instant', 'micro_deposits').default('micro_deposits')
  })
});

const createDepositSchema = Joi.object({
  body: Joi.object({
    bankAccountId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(1).max(10000).required(),
    instant: Joi.boolean().default(false),
    sameDayACH: Joi.boolean().default(false),
    metadata: Joi.object().optional()
  })
});

const verifyMicroDepositsSchema = Joi.object({
  params: Joi.object({
    bankAccountId: Joi.string().uuid().required()
  }),
  body: Joi.object({
    amount1: Joi.number().integer().min(1).max(10).required(),
    amount2: Joi.number().integer().min(1).max(10).required()
  })
});

const depositHistorySchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })
});

/**
 * @route   POST /api/bank-accounts/link
 * @desc    Link a new bank account
 * @access  Private
 */
router.post('/link',
  authenticateToken,
  validate(linkBankAccountSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await bankAccountService.linkBankAccount(userId, req.body);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/bank-accounts
 * @desc    Get user's bank accounts
 * @access  Private
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const accounts = await bankAccountService.getUserBankAccounts(userId);

    res.json({
      success: true,
      data: {
        accounts,
        count: accounts.length
      }
    });
  })
);

/**
 * @route   GET /api/bank-accounts/:bankAccountId
 * @desc    Get single bank account details
 * @access  Private
 */
router.get('/:bankAccountId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    const account = await bankAccountService.getBankAccount(bankAccountId, userId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Bank account not found'
        }
      });
    }

    res.json({
      success: true,
      data: account
    });
  })
);

/**
 * @route   POST /api/bank-accounts/:bankAccountId/verify
 * @desc    Verify micro deposits
 * @access  Private
 */
router.post('/:bankAccountId/verify',
  authenticateToken,
  validate(verifyMicroDepositsSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    const result = await bankAccountService.verifyMicroDeposits(
      bankAccountId,
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
 * @route   POST /api/bank-accounts/:bankAccountId/set-primary
 * @desc    Set bank account as primary
 * @access  Private
 */
router.post('/:bankAccountId/set-primary',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    const result = await bankAccountService.setPrimaryBankAccount(bankAccountId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   DELETE /api/bank-accounts/:bankAccountId
 * @desc    Remove bank account
 * @access  Private
 */
router.delete('/:bankAccountId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { bankAccountId } = req.params;

    const result = await bankAccountService.removeBankAccount(bankAccountId, userId);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   POST /api/bank-accounts/deposit
 * @desc    Create a deposit from bank account
 * @access  Private
 */
router.post('/deposit',
  authenticateToken,
  validate(createDepositSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await bankAccountService.createDeposit(userId, req.body);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * @route   GET /api/bank-accounts/deposits/history
 * @desc    Get deposit history
 * @access  Private
 */
router.get('/deposits/history',
  authenticateToken,
  validate(depositHistorySchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const deposits = await bankAccountService.getDepositHistory(userId, req.query);

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
 * @route   GET /api/bank-accounts/deposits/:depositId
 * @desc    Get single deposit details
 * @access  Private
 */
router.get('/deposits/:depositId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { depositId } = req.params;

    const deposit = await bankAccountService.getDepositDetails(depositId, userId);

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
 * @route   GET /api/bank-accounts/deposits/limits
 * @desc    Get deposit limits
 * @access  Private
 */
router.get('/deposits/limits',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limits = await bankAccountService.getDepositLimits(userId);

    res.json({
      success: true,
      data: limits
    });
  })
);

/**
 * @route   POST /api/bank-accounts/deposits/calculate-fee
 * @desc    Calculate deposit fee
 * @access  Private
 */
router.post('/deposits/calculate-fee',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { amount, type } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount and type are required'
        }
      });
    }

    const fee = bankAccountService.calculateDepositFee(amount, type);

    res.json({
      success: true,
      data: {
        amount,
        type,
        fee,
        netAmount: amount - fee
      }
    });
  })
);

/**
 * @route   POST /api/bank-accounts/webhook/dwolla
 * @desc    Handle Dwolla webhooks for deposits
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

    const { topic, resourceId, _links } = req.body;

    // Handle transfer events
    if (topic.includes('transfer')) {
      const transferId = resourceId;
      const status = topic.split('_').pop(); // Get status from topic

      await bankAccountService.processDepositWebhook(
        transferId,
        status,
        req.body
      );
    }

    res.status(200).json({ success: true });
  })
);

export default router;