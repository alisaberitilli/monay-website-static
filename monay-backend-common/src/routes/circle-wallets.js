import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import WalletOrchestratorService from '../services/wallet-orchestrator-service.js';
import CircleWalletService from '../services/circle-wallet-service.js';
import BridgeTransferService from '../services/bridge-transfer-service.js';
import { logger } from '../services/logger.js';

const router = Router();
const orchestrator = new WalletOrchestratorService();
const circleWalletService = new CircleWalletService();
const bridgeService = new BridgeTransferService();

/**
 * @route   POST /api/circle-wallets/initialize
 * @desc    Initialize dual wallet system for user
 * @access  Private
 */
router.post('/initialize', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await orchestrator.initializeUserWallets(userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to initialize wallets',
                error: result.error
            });
        }

        res.json({
            success: true,
            message: 'Wallets initialized successfully',
            data: result.data
        });
    } catch (error) {
        logger.error('Initialize wallets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/circle-wallets/balance
 * @desc    Get combined wallet balances
 * @access  Private
 */
router.get('/balance', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await orchestrator.getCombinedBalance(userId);

        res.json({
            success: true,
            data: balance
        });
    } catch (error) {
        logger.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get balance'
        });
    }
});

/**
 * @route   GET /api/circle-wallets/details
 * @desc    Get Circle wallet details
 * @access  Private
 */
router.get('/details', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await circleWalletService.getWalletDetails(userId);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        logger.error('Get wallet details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get wallet details'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/deposit
 * @desc    Deposit USDC from bank account
 * @access  Private
 */
router.post('/deposit', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, source_id, source_type = 'ach_bank_account' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const result = await circleWalletService.createDeposit(
            userId,
            amount,
            source_type,
            source_id
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Deposit initiated',
            data: result.data
        });
    } catch (error) {
        logger.error('Deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create deposit'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/withdraw
 * @desc    Withdraw USDC to bank account
 * @access  Private
 */
router.post('/withdraw', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, destination_id, destination_type = 'ach_bank_account' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const result = await circleWalletService.createWithdrawal(
            userId,
            amount,
            destination_type,
            destination_id
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Withdrawal initiated',
            data: result.data
        });
    } catch (error) {
        logger.error('Withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create withdrawal'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/transfer
 * @desc    Transfer USDC to another wallet
 * @access  Private
 */
router.post('/transfer', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, to_address, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!to_address) {
            return res.status(400).json({
                success: false,
                message: 'Recipient address required'
            });
        }

        const result = await circleWalletService.transferUSDC(
            userId,
            to_address,
            amount,
            description
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Transfer initiated',
            data: result.data
        });
    } catch (error) {
        logger.error('Transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create transfer'
        });
    }
});

/**
 * @route   GET /api/circle-wallets/transactions
 * @desc    Get Circle wallet transaction history
 * @access  Private
 */
router.get('/transactions', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const result = await circleWalletService.getTransactionHistory(
            userId,
            parseInt(limit),
            parseInt(offset)
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        logger.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transactions'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/bridge/to-circle
 * @desc    Bridge transfer from Monay to Circle wallet
 * @access  Private
 */
router.post('/bridge/to-circle', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const result = await bridgeService.bridgeMonayToCircle(userId, amount);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Bridge transfer completed',
            data: result.data
        });
    } catch (error) {
        logger.error('Bridge to Circle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bridge to Circle'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/bridge/to-monay
 * @desc    Bridge transfer from Circle to Monay wallet
 * @access  Private
 */
router.post('/bridge/to-monay', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const result = await bridgeService.bridgeCircleToMonay(userId, amount);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Bridge transfer completed',
            data: result.data
        });
    } catch (error) {
        logger.error('Bridge to Monay error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to bridge to Monay'
        });
    }
});

/**
 * @route   GET /api/circle-wallets/bridge/history
 * @desc    Get bridge transfer history
 * @access  Private
 */
router.get('/bridge/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50 } = req.query;

        const result = await bridgeService.getBridgeHistory(userId, parseInt(limit));

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        logger.error('Get bridge history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get bridge history'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/bridge/estimate
 * @desc    Estimate bridge transfer
 * @access  Private
 */
router.post('/bridge/estimate', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, direction } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        if (!['monay_to_circle', 'circle_to_monay'].includes(direction)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid direction'
            });
        }

        const result = await bridgeService.estimateBridge(userId, amount, direction);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        logger.error('Estimate bridge error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to estimate bridge'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/routing/optimize
 * @desc    Get optimal payment routing
 * @access  Private
 */
router.post('/routing/optimize', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, payment_type = 'payment', metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        const result = await orchestrator.getOptimalPaymentRoute(
            userId,
            amount,
            payment_type,
            metadata
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Routing optimization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to optimize routing'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/sync
 * @desc    Sync Circle wallet balance
 * @access  Private
 */
router.post('/sync', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await orchestrator.syncCircleWalletBalance(userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        res.json({
            success: true,
            message: 'Wallet synchronized',
            data: result.data
        });
    } catch (error) {
        logger.error('Sync wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync wallet'
        });
    }
});

/**
 * @route   POST /api/circle-wallets/webhook
 * @desc    Handle Circle webhook notifications
 * @access  Public (with signature verification)
 */
router.post('/webhook', async (req, res) => {
    try {
        // TODO: Add Circle webhook signature verification
        const webhookData = req.body;

        const result = await circleWalletService.processWebhook(webhookData);

        if (!result.success) {
            logger.error('Webhook processing failed:', result.error);
            return res.status(400).json({
                success: false,
                message: 'Webhook processing failed'
            });
        }

        res.json({
            success: true,
            message: 'Webhook processed'
        });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process webhook'
        });
    }
});

export default router;