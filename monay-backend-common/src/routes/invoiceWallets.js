/**
 * Invoice-First Wallet API Routes
 * Handles wallet generation, management, and lifecycle operations
 *
 * @module routes/invoiceWallets
 */

import express from 'express';
import invoiceWallet from '../services/invoice-wallet/index.js';
import crypto from 'crypto';
import cardRepository from '../repositories/card-repository.js';
const { walletFactory, ephemeralManager, aiModeSelector } = invoiceWallet;
import auditLogger from '../services/invoice-wallet/AuditLogger.js';
import blockchainIntegration from '../services/invoice-wallet/BlockchainIntegration.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import db from '../models/index.js';

// Use console for now since logger import is causing issues
const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.debug
};

const router = express.Router();

/**
 * POST /api/invoice-wallets/test-generate
 * Test endpoint for wallet generation (no auth)
 */
router.post('/test-generate', async (req, res) => {
  try {
    const { invoiceId, mode, ttl, features } = req.body;

    // Skip invoice validation for testing
    // const invoice = await db.Invoice.findByPk(invoiceId);
    // if (!invoice) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Invoice not found'
    //   });
    // }

    // For testing, return mock wallet data
    const mockWallet = {
      id: crypto.randomUUID(),
      invoiceId,
      mode: mode || 'ephemeral',
      baseAddress: '0x' + crypto.randomBytes(20).toString('hex'),
      solanaAddress: crypto.randomBytes(32).toString('base64').substring(0, 44),
      status: 'active',
      features: features || {},
      expiresAt: mode === 'ephemeral' ? new Date(Date.now() + (ttl || 86400) * 1000).toISOString() : null,
      ttl: ttl || 86400,
      quantumEnabled: true
    };

    // AUTO-CREATE VIRTUAL CARD for every wallet
    const autoCard = {
      id: 'card_' + crypto.randomUUID(),
      walletId: mockWallet.id,
      cardNumber: `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
      cardHolder: 'Wallet Default Card',
      cardType: 'virtual',
      status: 'active',
      spendingLimit: 10000, // Default, can be based on invoice amount
      linkedWallet: mockWallet.baseAddress,
      invoiceId: invoiceId,
      walletMode: mockWallet.mode,
      isAutoIssued: true,
      createdAt: new Date().toISOString()
    };

    console.log('Test wallet generated with auto-card', {
      walletId: mockWallet.id,
      cardId: autoCard.id,
      invoiceId,
      mode: mockWallet.mode
    });

    res.status(201).json({
      success: true,
      message: 'Test wallet generated successfully with auto-issued card',
      wallet: mockWallet,
      card: autoCard
    });
  } catch (error) {
    console.error('Failed to generate test wallet', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test wallet',
      error: error.message
    });
  }
});

/**
 * POST /api/invoice-wallets/generate
 * Generate a new Invoice-First wallet
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { invoiceId, mode, ttl, features } = req.body;

    // Validate invoice
    const invoice = await db.Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if wallet already exists
    const existingWallet = await db.InvoiceWallet.findOne({
      where: { invoice_id: invoiceId }
    });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet already exists for this invoice',
        wallet: existingWallet
      });
    }

    // Generate wallet
    const options = {
      mode,
      ttl,
      features,
      userId: req.user.id
    };

    const wallet = await walletFactory.generateWalletFromInvoice(invoice, options);

    // AUTO-CREATE VIRTUAL CARD for every wallet
    const cardData = {
      cardType: 'virtual',
      cardName: 'Invoice Wallet Card',
      cardHolder: req.user.name || 'Wallet Holder',
      userId: req.user.id,
      linkedWallet: wallet.baseAddress || wallet.id,
      walletId: wallet.id,
      invoiceId: invoiceId,
      spendingLimit: invoice.amount || 10000,
      walletMode: wallet.mode,
      status: 'active',
      isAutoIssued: true
    };

    // Create the card in database
    let autoCard = null;
    try {
      // Use imported cardRepository
      autoCard = await cardRepository.create(cardData);
      logger.info('Auto-card issued for wallet', {
        cardId: autoCard.id,
        walletId: wallet.id
      });
    } catch (cardError) {
      logger.error('Failed to auto-issue card', cardError);
      // Don't fail wallet creation if card fails
    }

    logger.info('Invoice-First wallet generated via API with auto-card', {
      walletId: wallet.id,
      cardId: autoCard?.id,
      invoiceId,
      mode: wallet.mode,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Invoice-First wallet generated successfully with auto-issued card',
      wallet: {
        id: wallet.id,
        mode: wallet.mode,
        baseAddress: wallet.base_address,
        solanaAddress: wallet.solana_address,
        status: wallet.status,
        features: wallet.features,
        expiresAt: wallet.expires_at,
        ttl: wallet.ttl_seconds
      },
      card: autoCard ? {
        id: autoCard.id,
        cardNumber: autoCard.cardNumber || `****-****-****-${autoCard.last4Digit}`,
        cardType: autoCard.cardType,
        status: autoCard.status,
        linkedWallet: autoCard.linkedWallet,
        isAutoIssued: true
      } : null
    });
  } catch (error) {
    logger.error('Failed to generate Invoice-First wallet', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate wallet',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/:id
 * Get wallet details by ID
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await db.InvoiceWallet.findByPk(id, {
      include: [
        {
          model: db.Invoice,
          as: 'invoice'
        },
        {
          model: db.WalletLifecycleEvent,
          as: 'events',
          order: [['timestamp', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Calculate remaining TTL for ephemeral wallets
    let remainingTTL = null;
    if (wallet.mode === 'ephemeral' && wallet.expires_at) {
      remainingTTL = Math.max(0, Math.floor((new Date(wallet.expires_at) - Date.now()) / 1000));
    }

    res.json({
      success: true,
      wallet: {
        ...wallet.toJSON(),
        remainingTTL
      }
    });
  } catch (error) {
    logger.error('Failed to fetch wallet', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
});

/**
 * POST /api/invoice-wallets/:id/transform
 * Transform ephemeral wallet to persistent
 */
router.post('/:id/transform', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transformedWallet = await walletFactory.transformToPersistent(id, {
      reason,
      userId: req.user.id
    });

    logger.info('Wallet transformed to persistent', {
      walletId: id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Wallet transformed to persistent successfully',
      wallet: transformedWallet
    });
  } catch (error) {
    logger.error('Failed to transform wallet', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transform wallet',
      error: error.message
    });
  }
});

/**
 * DELETE /api/invoice-wallets/:id/destroy
 * Manually destroy an ephemeral wallet
 */
router.delete('/:id/destroy', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify wallet exists and is ephemeral
    const wallet = await db.InvoiceWallet.findByPk(id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.mode !== 'ephemeral') {
      return res.status(400).json({
        success: false,
        message: 'Only ephemeral wallets can be destroyed'
      });
    }

    if (wallet.status === 'destroyed') {
      return res.status(400).json({
        success: false,
        message: 'Wallet is already destroyed'
      });
    }

    // Execute destruction
    await ephemeralManager.executeDestruction(id);

    logger.info('Wallet manually destroyed', {
      walletId: id,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Wallet destroyed successfully'
    });
  } catch (error) {
    logger.error('Failed to destroy wallet', error);
    res.status(500).json({
      success: false,
      message: 'Failed to destroy wallet',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/:id/status
 * Get wallet status and health
 */
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await db.InvoiceWallet.findByPk(id);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Check blockchain status
    const baseBalance = 0; // TODO: Integrate with EVM service
    const solanaBalance = 0; // TODO: Integrate with Solana service

    // Calculate health score
    let healthScore = 100;
    if (wallet.status === 'destroyed') healthScore = 0;
    else if (wallet.status === 'expired') healthScore = 25;
    else if (wallet.mode === 'ephemeral' && wallet.expires_at) {
      const remainingTime = new Date(wallet.expires_at) - Date.now();
      const totalTime = wallet.ttl_seconds * 1000;
      healthScore = Math.max(25, Math.min(100, (remainingTime / totalTime) * 100));
    }

    res.json({
      success: true,
      status: {
        walletId: id,
        mode: wallet.mode,
        status: wallet.status,
        health: healthScore,
        balances: {
          base: baseBalance,
          solana: solanaBalance
        },
        expiresAt: wallet.expires_at,
        remainingTTL: wallet.expires_at
          ? Math.max(0, Math.floor((new Date(wallet.expires_at) - Date.now()) / 1000))
          : null,
        features: wallet.features
      }
    });
  } catch (error) {
    logger.error('Failed to get wallet status', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet status',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/network-status
 * Get blockchain network connectivity status
 */
router.get('/network-status', async (req, res) => {
  try {
    const networkStatus = await blockchainIntegration.getNetworkStatus();

    res.json({
      success: true,
      message: 'Network status retrieved',
      status: networkStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get network status', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network status',
      error: error.message
    });
  }
});

/**
 * POST /api/invoice-wallets/:id/extend-ttl
 * Extend TTL for ephemeral wallet
 */
router.post('/:id/extend-ttl', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalSeconds } = req.body;

    if (!additionalSeconds || additionalSeconds < 3600) {
      return res.status(400).json({
        success: false,
        message: 'Additional time must be at least 1 hour (3600 seconds)'
      });
    }

    await ephemeralManager.extendTTL(id, additionalSeconds);

    logger.info('Wallet TTL extended', {
      walletId: id,
      additionalSeconds,
      userId: req.user.id
    });

    res.json({
      success: true,
      message: 'Wallet TTL extended successfully',
      additionalSeconds
    });
  } catch (error) {
    logger.error('Failed to extend wallet TTL', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend wallet TTL',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/invoice/:invoiceId
 * Get wallet by invoice ID
 */
router.get('/invoice/:invoiceId', authMiddleware, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const wallet = await db.InvoiceWallet.findOne({
      where: { invoice_id: invoiceId }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'No wallet found for this invoice'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    logger.error('Failed to fetch wallet by invoice', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
});

/**
 * POST /api/invoice-wallets/ai-recommendation
 * Get AI recommendation for wallet mode
 */
router.post('/ai-recommendation', authMiddleware, async (req, res) => {
  try {
    const { amount, customerProfile, transactionType, isRecurring, riskScore } = req.body;

    const recommendation = await aiModeSelector.determineMode({
      amount,
      customerProfile,
      transactionType,
      isRecurring,
      riskScore
    });

    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    logger.error('Failed to get AI recommendation', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI recommendation',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/:id/audit
 * Get wallet audit trail
 */
router.get('/:id/audit', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const audit = await ephemeralManager.auditDestruction(id);

    res.json({
      success: true,
      audit
    });
  } catch (error) {
    logger.error('Failed to get wallet audit', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet audit',
      error: error.message
    });
  }
});

/**
 * GET /api/invoice-wallets/stats
 * Get wallet statistics
 */
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    const stats = await db.InvoiceWallet.findAll({
      attributes: [
        'mode',
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['mode', 'status']
    });

    const totalWallets = await db.InvoiceWallet.count();
    const activeWallets = await db.InvoiceWallet.count({
      where: { status: 'active' }
    });
    const destroyedToday = await db.InvoiceWallet.count({
      where: {
        status: 'destroyed',
        destroyed_at: {
          [db.Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    res.json({
      success: true,
      stats: {
        total: totalWallets,
        active: activeWallets,
        destroyedToday,
        byMode: stats.reduce((acc, stat) => {
          const key = `${stat.mode}_${stat.status}`;
          acc[key] = stat.dataValues.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error('Failed to get wallet stats', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet stats',
      error: error.message
    });
  }
});

export default router;