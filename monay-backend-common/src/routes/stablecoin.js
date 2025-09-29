/**
 * Stablecoin API Routes
 * Multi-provider support with Tempo (primary) and Circle (fallback)
 */

import express from 'express';
const router = express.Router();
import { StablecoinProviderFactory } from '../services/stablecoin-provider-factory.js';
import auth from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest';
import { body, query, param } from 'express-validator';

// Initialize provider factory
const providerFactory = StablecoinProviderFactory.getInstance();

/**
 * GET /api/stablecoin/providers
 * Get available providers and their status
 */
router.get('/providers', auth, async (req, res) => {
  try {
    const status = providerFactory.getHealthStatus();
    const comparison = providerFactory.getProviderComparison();

    res.json({
      success: true,
      providers: status,
      comparison,
      primary: process.env.PRIMARY_PROVIDER || 'tempo',
      fallback: process.env.FALLBACK_PROVIDER || 'circle'
    });
  } catch (error) {
    console.error('Error getting provider status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/stablecoin/wallet/create
 * Create a new stablecoin wallet
 */
router.post('/wallet/create',
  auth,
  body('provider').optional().isIn(['tempo', 'circle', 'auto']),
  body('metadata').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { provider: preferredProvider, metadata } = req.body;

      // Get provider based on routing logic
      const { provider, providerName } = await providerFactory.getProvider({
        preferredProvider: preferredProvider === 'auto' ? null : preferredProvider
      });

      // Create wallet
      const wallet = await provider.createWallet(userId, metadata);

      res.json({
        success: true,
        wallet,
        provider: providerName
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/mint
 * Mint stablecoins (convert fiat to stablecoin)
 */
router.post('/mint',
  auth,
  body('walletId').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').notEmpty().isIn(['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB']),
  body('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { walletId, amount, currency, provider: preferredProvider, metadata } = req.body;

      // Use provider factory's executeWithFallback for automatic failover
      const result = await providerFactory.executeWithFallback(
        'mintStablecoin',
        [walletId, amount, currency, metadata],
        { preferredProvider }
      );

      res.json({
        success: true,
        transaction: result
      });
    } catch (error) {
      console.error('Error minting stablecoin:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/burn
 * Burn stablecoins (convert stablecoin to fiat)
 */
router.post('/burn',
  auth,
  body('walletId').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').notEmpty(),
  body('destination').notEmpty(),
  body('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { walletId, amount, currency, destination, provider: preferredProvider, metadata } = req.body;

      const result = await providerFactory.executeWithFallback(
        'burnStablecoin',
        [walletId, amount, currency, destination, metadata],
        { preferredProvider }
      );

      res.json({
        success: true,
        transaction: result
      });
    } catch (error) {
      console.error('Error burning stablecoin:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/transfer
 * Transfer stablecoins between wallets
 */
router.post('/transfer',
  auth,
  body('fromWalletId').notEmpty(),
  body('toAddress').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').notEmpty(),
  body('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { fromWalletId, toAddress, amount, currency, provider: preferredProvider, metadata } = req.body;

      const result = await providerFactory.executeWithFallback(
        'transfer',
        [fromWalletId, toAddress, amount, currency, metadata],
        { preferredProvider }
      );

      res.json({
        success: true,
        transaction: result
      });
    } catch (error) {
      console.error('Error transferring stablecoin:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/batch-transfer
 * Batch transfer to multiple recipients (Tempo native feature)
 */
router.post('/batch-transfer',
  auth,
  body('fromWalletId').notEmpty(),
  body('transfers').isArray({ min: 1 }),
  body('transfers.*.toAddress').notEmpty(),
  body('transfers.*.amount').isFloat({ min: 0.01 }),
  body('transfers.*.currency').optional(),
  validateRequest,
  async (req, res) => {
    try {
      const { fromWalletId, transfers, metadata } = req.body;

      // Batch transfer is Tempo-specific, try Tempo first
      const { provider, providerName } = await providerFactory.getProvider({
        preferredProvider: 'tempo'
      });

      if (providerName === 'tempo' && provider.batchTransfer) {
        const result = await provider.batchTransfer(fromWalletId, transfers, metadata);
        res.json({
          success: true,
          transaction: result,
          provider: providerName
        });
      } else {
        // Fallback to individual transfers
        const results = [];
        for (const transfer of transfers) {
          const result = await providerFactory.executeWithFallback(
            'transfer',
            [fromWalletId, transfer.toAddress, transfer.amount, transfer.currency || 'USDC', metadata],
            {}
          );
          results.push(result);
        }

        res.json({
          success: true,
          transactions: results,
          provider: 'multiple',
          note: 'Batch transfer not available, processed individually'
        });
      }
    } catch (error) {
      console.error('Error in batch transfer:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/swap
 * Swap between stablecoins (Tempo native feature)
 */
router.post('/swap',
  auth,
  body('walletId').notEmpty(),
  body('fromCurrency').notEmpty(),
  body('toCurrency').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  validateRequest,
  async (req, res) => {
    try {
      const { walletId, fromCurrency, toCurrency, amount, metadata } = req.body;

      // Swap is Tempo-specific
      const { provider, providerName } = await providerFactory.getProvider({
        preferredProvider: 'tempo'
      });

      if (providerName === 'tempo' && provider.swapStablecoins) {
        const result = await provider.swapStablecoins(walletId, fromCurrency, toCurrency, amount, metadata);
        res.json({
          success: true,
          swap: result,
          provider: providerName
        });
      } else {
        res.status(400).json({
          error: 'Stablecoin swap not available with current provider',
          availableProvider: 'tempo',
          currentProvider: providerName
        });
      }
    } catch (error) {
      console.error('Error swapping stablecoins:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/stablecoin/balance/:address
 * Get stablecoin balances for an address
 */
router.get('/balance/:address',
  auth,
  param('address').notEmpty(),
  query('currency').optional(),
  query('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { address } = req.params;
      const { currency, provider: preferredProvider } = req.query;

      const { provider, providerName } = await providerFactory.getProvider({
        currency,
        preferredProvider
      });

      const balance = await provider.getBalance(address, currency);

      res.json({
        success: true,
        balance,
        provider: providerName
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/stablecoin/transactions/:walletId
 * Get transaction history
 */
router.get('/transactions/:walletId',
  auth,
  param('walletId').notEmpty(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { walletId } = req.params;
      const { limit = 100, provider: preferredProvider } = req.query;

      const { provider, providerName } = await providerFactory.getProvider({
        preferredProvider
      });

      const transactions = await provider.getTransactionHistory(walletId, parseInt(limit));

      res.json({
        success: true,
        transactions,
        provider: providerName
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/stablecoin/network-stats
 * Get network statistics
 */
router.get('/network-stats',
  auth,
  query('provider').optional().isIn(['tempo', 'circle', 'all']),
  validateRequest,
  async (req, res) => {
    try {
      const { provider: requestedProvider = 'all' } = req.query;

      if (requestedProvider === 'all') {
        const stats = {};

        // Get stats from all providers
        for (const [name, provider] of providerFactory.providers) {
          try {
            stats[name] = await provider.getNetworkStats();
          } catch (error) {
            stats[name] = { error: error.message };
          }
        }

        res.json({
          success: true,
          stats
        });
      } else {
        const { provider, providerName } = await providerFactory.getProvider({
          preferredProvider: requestedProvider
        });

        const stats = await provider.getNetworkStats();

        res.json({
          success: true,
          stats,
          provider: providerName
        });
      }
    } catch (error) {
      console.error('Error getting network stats:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/estimate-fee
 * Estimate transaction fees
 */
router.post('/estimate-fee',
  auth,
  body('operation').notEmpty().isIn(['mint', 'burn', 'transfer', 'swap', 'batch']),
  body('amount').isFloat({ min: 0.01 }),
  body('currency').notEmpty(),
  body('provider').optional().isIn(['tempo', 'circle', 'auto']),
  validateRequest,
  async (req, res) => {
    try {
      const { operation, amount, currency, provider: preferredProvider } = req.body;

      const { provider, providerName } = await providerFactory.getProvider({
        currency,
        operation,
        preferredProvider
      });

      // Get provider capabilities for fee estimation
      const capabilities = providerFactory.PROVIDER_CAPABILITIES[providerName];

      const estimatedFee = {
        provider: providerName,
        operation,
        amount,
        currency,
        baseFee: capabilities.avgFee,
        totalFee: capabilities.avgFee * (operation === 'batch' ? 10 : 1), // Assume 10 transfers for batch
        estimatedTime: capabilities.finality,
        tps: capabilities.maxTps
      };

      res.json({
        success: true,
        estimate: estimatedFee
      });
    } catch (error) {
      console.error('Error estimating fee:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/stablecoin/supported-currencies
 * Get supported currencies by provider
 */
router.get('/supported-currencies',
  query('provider').optional().isIn(['tempo', 'circle', 'all']),
  validateRequest,
  async (req, res) => {
    try {
      const { provider = 'all' } = req.query;

      const capabilities = providerFactory.PROVIDER_CAPABILITIES;

      if (provider === 'all') {
        const currencies = {};
        for (const [name, cap] of Object.entries(capabilities)) {
          currencies[name] = cap.currencies;
        }
        res.json({
          success: true,
          currencies
        });
      } else {
        res.json({
          success: true,
          currencies: capabilities[provider]?.currencies || []
        });
      }
    } catch (error) {
      console.error('Error getting supported currencies:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/stablecoin/route-transaction
 * Get optimal routing for a transaction
 */
router.post('/route-transaction',
  auth,
  body('currency').notEmpty(),
  body('amount').isFloat({ min: 0.01 }),
  body('operation').notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const { currency, amount, operation } = req.body;

      const route = await providerFactory.routeTransaction({
        currency,
        amount,
        operation
      });

      const capabilities = providerFactory.PROVIDER_CAPABILITIES[route.provider];

      res.json({
        success: true,
        route: {
          ...route,
          estimatedFee: capabilities.avgFee,
          estimatedTime: capabilities.finality,
          maxTps: capabilities.maxTps
        }
      });
    } catch (error) {
      console.error('Error routing transaction:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;