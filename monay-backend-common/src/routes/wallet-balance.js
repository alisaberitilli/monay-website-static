/**
 * Wallet Balance API Routes
 * Real-time balance management and limits
 * Consumer Wallet Phase 1 Implementation
 */

import express from 'express';
import middlewares from '../middleware-app/index.js';
import walletBalanceService from '../services/wallet-balance-service.js';
import { body, param, validationResult } from 'express-validator';
import loggers from '../services/logger.js';

const router = express.Router();
const { authMiddleware } = middlewares;
const logger = loggers.infoLogger;

/**
 * Validation middleware
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

/**
 * GET /api/wallet/balance
 * Get real-time wallet balance with pending amounts
 */
router.get(
  '/wallet/balance',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const walletId = req.query.walletId || req.user.primary_wallet_id;

      if (!walletId) {
        return res.status(400).json({
          success: false,
          message: 'Wallet ID is required'
        });
      }

      const balance = await walletBalanceService.getWalletBalance(walletId, userId);

      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      logger.error('Error fetching wallet balance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch wallet balance'
      });
    }
  }
);

/**
 * GET /api/wallet/balance/:walletId
 * Get balance for specific wallet
 */
router.get(
  '/balance/:walletId',
  authMiddleware,
  param('walletId').isString().notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { walletId } = req.params;

      const balance = await walletBalanceService.getWalletBalance(walletId, userId);

      res.json({
        success: true,
        data: balance
      });
    } catch (error) {
      logger.error('Error fetching wallet balance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch wallet balance'
      });
    }
  }
);

/**
 * GET /api/wallet/limits
 * Get wallet transaction limits and current usage
 */
router.get(
  '/limits',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const walletId = req.query.walletId || req.user.primary_wallet_id;

      if (!walletId) {
        return res.status(400).json({
          success: false,
          message: 'Wallet ID is required'
        });
      }

      const limits = await walletBalanceService.getWalletLimits(walletId, userId);

      res.json({
        success: true,
        data: limits
      });
    } catch (error) {
      logger.error('Error fetching wallet limits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch wallet limits'
      });
    }
  }
);

/**
 * PUT /api/wallet/limits
 * Update wallet transaction limits (admin or premium users only)
 */
router.put(
  '/limits',
  authMiddleware,
  [
    body('walletId').optional().isString(),
    body('daily_spending_limit').optional().isFloat({ min: 0 }),
    body('daily_p2p_limit').optional().isFloat({ min: 0 }),
    body('daily_withdrawal_limit').optional().isFloat({ min: 0 }),
    body('monthly_spending_limit').optional().isFloat({ min: 0 }),
    body('monthly_p2p_limit').optional().isFloat({ min: 0 }),
    body('monthly_withdrawal_limit').optional().isFloat({ min: 0 }),
    body('per_transaction_limit').optional().isFloat({ min: 0 }),
    body('minimum_balance').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const walletId = req.body.walletId || req.user.primary_wallet_id;

      // Check if user has permission to update limits
      // TODO: Add role check for admin or premium users
      
      if (!walletId) {
        return res.status(400).json({
          success: false,
          message: 'Wallet ID is required'
        });
      }

      const updates = { ...req.body };
      delete updates.walletId; // Remove walletId from updates

      const updatedLimits = await walletBalanceService.updateWalletLimits(
        walletId,
        userId,
        updates
      );

      res.json({
        success: true,
        message: 'Wallet limits updated successfully',
        data: updatedLimits
      });
    } catch (error) {
      logger.error('Error updating wallet limits:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update wallet limits'
      });
    }
  }
);

/**
 * POST /api/wallet/validate-transaction
 * Validate a transaction against wallet limits
 */
router.post(
  '/validate-transaction',
  authMiddleware,
  [
    body('walletId').optional().isString(),
    body('amount').isFloat({ min: 0.01 }),
    body('transactionType').isIn(['p2p', 'withdrawal', 'spending', 'payment'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const walletId = req.body.walletId || req.user.primary_wallet_id;
      const { amount, transactionType } = req.body;

      if (!walletId) {
        return res.status(400).json({
          success: false,
          message: 'Wallet ID is required'
        });
      }

      const validation = await walletBalanceService.validateTransactionLimits(
        walletId,
        amount,
        transactionType
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('Error validating transaction:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to validate transaction'
      });
    }
  }
);

/**
 * GET /api/wallet/all-balances
 * Get all wallet balances for a user
 */
router.get(
  '/all-balances',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get all wallets for the user
      const db = req.app.get('db');
      const wallets = await db.Wallet.findAll({
        where: { user_id: userId },
        attributes: ['id', 'name', 'type']
      });

      // Get balance for each wallet
      const balances = await Promise.all(
        wallets.map(async (wallet) => {
          try {
            const balance = await walletBalanceService.getWalletBalance(
              wallet.id,
              userId
            );
            return {
              ...balance,
              walletName: wallet.name,
              walletType: wallet.type
            };
          } catch (error) {
            logger.error(`Error fetching balance for wallet ${wallet.id}:`, error);
            return {
              walletId: wallet.id,
              walletName: wallet.name,
              walletType: wallet.type,
              error: 'Failed to fetch balance'
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          wallets: balances,
          totalBalance: balances.reduce((sum, b) => {
            return sum + (b.totalBalance || 0);
          }, 0)
        }
      });
    } catch (error) {
      logger.error('Error fetching all wallet balances:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch wallet balances'
      });
    }
  }
);

/**
 * POST /api/wallet/refresh-balance
 * Force refresh balance from database (bypass cache)
 */
router.post(
  '/refresh-balance',
  authMiddleware,
  [
    body('walletId').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const walletId = req.body.walletId || req.user.primary_wallet_id;

      if (!walletId) {
        return res.status(400).json({
          success: false,
          message: 'Wallet ID is required'
        });
      }

      // Clear cache and get fresh balance
      const Redis = (await import('ioredis')).default;
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      });

      await redis.del(`balance:${walletId}`);
      redis.disconnect();

      const balance = await walletBalanceService.getWalletBalance(walletId, userId);

      res.json({
        success: true,
        message: 'Balance refreshed successfully',
        data: balance
      });
    } catch (error) {
      logger.error('Error refreshing balance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to refresh balance'
      });
    }
  }
);

/**
 * POST /api/user/wallet/pay
 * Process payment using wallet balance
 */
router.post(
  '/user/wallet/pay',
  authMiddleware,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().isString().withMessage('Currency must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('merchant').optional().isString().withMessage('Merchant must be a string'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        amount,
        currency = 'USD',
        description = 'Payment',
        category = 'payment',
        merchant = 'Unknown Merchant',
        metadata = {}
      } = req.body;

      // Get user's primary wallet
      const db = req.app.get('db');
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, is_primary: true },
        attributes: ['id', 'balance']
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Check if user has sufficient balance
      const currentBalance = await walletBalanceService.getWalletBalance(wallet.id, userId);
      if (currentBalance.availableBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }

      // Validate transaction against limits
      const validation = await walletBalanceService.validateTransactionLimits(
        wallet.id,
        amount,
        'payment'
      );

      if (!validation.allowed) {
        return res.status(400).json({
          success: false,
          message: validation.reason
        });
      }

      // Create transaction record
      const transactionId = `pay_${Date.now()}_${userId.substring(0, 8)}`;
      const transaction = await db.Transaction.create({
        id: transactionId,
        from_wallet_id: wallet.id,
        to_wallet_id: null, // External payment
        user_id: userId,
        amount: amount,
        currency: currency,
        transaction_type: 'payment',
        status: 'completed',
        description: description,
        category: category,
        merchant_name: merchant,
        metadata: metadata,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Update wallet balance
      await db.Wallet.update(
        {
          balance: db.sequelize.literal(`balance - ${amount}`),
          updated_at: new Date()
        },
        { where: { id: wallet.id } }
      );

      // Clear balance cache
      const Redis = (await import('ioredis')).default;
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      });
      await redis.del(`balance:${wallet.id}`);
      redis.disconnect();

      // Get updated balance
      const updatedBalance = await walletBalanceService.getWalletBalance(wallet.id, userId);

      res.json({
        success: true,
        transactionId: transaction.id,
        amount: amount,
        currency: currency,
        newBalance: updatedBalance.availableBalance,
        status: 'completed',
        message: 'Payment processed successfully'
      });

    } catch (error) {
      logger.error('Error processing wallet payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process payment'
      });
    }
  }
);

export default router;