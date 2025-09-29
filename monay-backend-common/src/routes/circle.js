import { Router } from 'express';
import HttpStatus from 'http-status';
import circleService from '../services/circle.js';
import auth from '../middlewares/auth-middleware.js';
import businessRules from '../services/businessRuleEngine.js';

const router = Router();

// Create wallet for user/enterprise
router.post('/wallets', auth, async (req, res, next) => {
  try {
    const { type = 'enterprise' } = req.body;
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const wallet = await circleService.createWallet(userId, type, {
      createdBy: userId,
      organizationId: req.user?.organizationId
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: wallet,
      message: 'Circle wallet created successfully'
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to create wallet'
    });
  }
});

// Get wallet balance
router.get('/wallets/:walletId/balance', auth, async (req, res, next) => {
  try {
    const balance = await circleService.getBalance(req.params.walletId);

    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to get balance'
    });
  }
});

// Get user's wallet
router.get('/wallets/me', auth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const wallet = await circleService.getWalletByUserId(userId);

    if (!wallet) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Get balance
    const balance = await circleService.getBalance(wallet.walletId);

    res.json({
      success: true,
      data: {
        ...wallet,
        ...balance
      }
    });
  } catch (error) {
    console.error('Get user wallet error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to get wallet'
    });
  }
});

// Mint USDC (deposit USD -> receive USDC)
router.post('/mint', auth, async (req, res, next) => {
  try {
    const { amount, destinationAddress, sourceAccount } = req.body;
    const userId = req.user?.id || req.userId;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Apply business rules for minting
    const ruleContext = {
      operation: 'mint',
      amount,
      userId,
      userRole: req.user?.role,
      organizationId: req.user?.organizationId
    };

    const ruleValidation = await businessRules.evaluateRules('treasury', ruleContext);

    if (!ruleValidation.allowed) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: ruleValidation.reason || 'Operation not allowed by business rules',
        violations: ruleValidation.violations
      });
    }

    // Get user's wallet if no destination address provided
    let targetAddress = destinationAddress;
    if (!targetAddress) {
      const wallet = await circleService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'No wallet found for user'
        });
      }
      targetAddress = wallet.address;
    }

    const result = await circleService.mintUSDC(
      amount,
      targetAddress,
      sourceAccount,
      userId
    );

    res.json({
      success: true,
      data: result,
      message: `Minting ${amount} USDC initiated`
    });
  } catch (error) {
    console.error('Mint USDC error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to mint USDC'
    });
  }
});

// Burn USDC (send USDC -> receive USD)
router.post('/burn', auth, async (req, res, next) => {
  try {
    const { amount, sourceWalletId, destinationAccount } = req.body;
    const userId = req.user?.id || req.userId;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Apply business rules for burning
    const ruleContext = {
      operation: 'burn',
      amount,
      userId,
      userRole: req.user?.role,
      organizationId: req.user?.organizationId
    };

    const ruleValidation = await businessRules.evaluateRules('treasury', ruleContext);

    if (!ruleValidation.allowed) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: ruleValidation.reason || 'Operation not allowed by business rules',
        violations: ruleValidation.violations
      });
    }

    // Get user's wallet if no source wallet provided
    let walletId = sourceWalletId;
    if (!walletId) {
      const wallet = await circleService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'No wallet found for user'
        });
      }
      walletId = wallet.walletId;
    }

    // Check balance
    const balance = await circleService.getBalance(walletId);
    if (balance.usdcBalance < amount) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Insufficient USDC balance'
      });
    }

    const result = await circleService.burnUSDC(
      amount,
      walletId,
      destinationAccount,
      userId
    );

    res.json({
      success: true,
      data: result,
      message: `Burning ${amount} USDC initiated`
    });
  } catch (error) {
    console.error('Burn USDC error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to burn USDC'
    });
  }
});

// Transfer USDC
router.post('/transfer', auth, async (req, res, next) => {
  try {
    const { amount, fromWalletId, toAddress } = req.body;
    const userId = req.user?.id || req.userId;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    if (!toAddress) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Destination address required'
      });
    }

    // Apply business rules for transfer
    const ruleContext = {
      operation: 'transfer',
      amount,
      userId,
      userRole: req.user?.role,
      destinationAddress: toAddress,
      organizationId: req.user?.organizationId
    };

    const ruleValidation = await businessRules.evaluateRules('transaction', ruleContext);

    if (!ruleValidation.allowed) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: ruleValidation.reason || 'Transfer not allowed by business rules',
        violations: ruleValidation.violations
      });
    }

    // Get user's wallet if no source wallet provided
    let walletId = fromWalletId;
    if (!walletId) {
      const wallet = await circleService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'No wallet found for user'
        });
      }
      walletId = wallet.walletId;
    }

    // Check balance
    const balance = await circleService.getBalance(walletId);
    if (balance.usdcBalance < amount) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Insufficient USDC balance'
      });
    }

    const result = await circleService.transferUSDC(
      amount,
      walletId,
      toAddress,
      userId
    );

    res.json({
      success: true,
      data: result,
      message: `Transfer of ${amount} USDC initiated`
    });
  } catch (error) {
    console.error('Transfer USDC error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to transfer USDC'
    });
  }
});

// Link bank account
router.post('/bank-accounts', auth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const accountDetails = req.body;

    // Validate required fields
    if (!accountDetails.accountNumber || !accountDetails.routingNumber) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Account number and routing number are required'
      });
    }

    const result = await circleService.linkBankAccount(accountDetails, userId);

    res.json({
      success: true,
      data: result,
      message: 'Bank account linked successfully'
    });
  } catch (error) {
    console.error('Link bank account error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to link bank account'
    });
  }
});

// Get supported chains
router.get('/chains', async (req, res, next) => {
  try {
    const chains = await circleService.getSupportedChains();

    res.json({
      success: true,
      data: chains
    });
  } catch (error) {
    console.error('Get chains error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to get supported chains'
    });
  }
});

// Estimate fees
router.post('/fees/estimate', auth, async (req, res, next) => {
  try {
    const { operation, amount, chain = 'ETH' } = req.body;

    if (!operation || !amount) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'Operation and amount are required'
      });
    }

    const fees = await circleService.estimateFees(operation, amount, chain);

    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    console.error('Estimate fees error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to estimate fees'
    });
  }
});

// Webhook handler for Circle notifications
router.post('/webhooks', async (req, res, next) => {
  try {
    const signature = req.headers['circle-signature'];

    if (!signature) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Missing webhook signature'
      });
    }

    await circleService.handleWebhook(req.body, signature);

    res.status(HttpStatus.OK).json({
      success: true,
      received: true
    });
  } catch (error) {
    console.error('Webhook error:', error);

    // Always return 200 to Circle to avoid retries
    res.status(HttpStatus.OK).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId;
    const { limit = 20, offset = 0, type } = req.query;

    // This would query your database for Circle-related transactions
    const query = `
      SELECT * FROM transactions
      WHERE user_id = $1
      ${type ? "AND type = $4" : ""}
      AND (metadata->>'circle_payment_id' IS NOT NULL
        OR metadata->>'circle_transfer_id' IS NOT NULL
        OR metadata->>'circle_payout_id' IS NOT NULL)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const params = type ? [userId, limit, offset, type] : [userId, limit, offset];

    // Note: This assumes you have db available
    const result = { rows: [] }; // Placeholder for actual db query

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rows.length
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || 'Failed to get transactions'
    });
  }
});

export default router;