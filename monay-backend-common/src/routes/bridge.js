import express from 'express';
import crossRailBridge from '../services/crossRailBridge.js';
import authMiddleware from '../middlewares/auth-middleware';
import { successResponse, errorResponse } from '../helpers';

const router = express.Router();

// Initiate EVM to Solana swap
router.post('/swap/evm-to-solana', authMiddleware, async (req, res) => {
  try {
    const { userPrivateKey, tokenAddress, amount, solanaRecipient } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userPrivateKey || !tokenAddress || !amount || !solanaRecipient) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }

    // Validate swap parameters
    crossRailBridge.validateSwapParams('base', 'solana', amount);

    const result = await crossRailBridge.initiateEVMToSolanaSwap({
      userPrivateKey,
      tokenAddress,
      amount,
      solanaRecipient,
      userId
    });

    return successResponse(req, res, result, 'Swap initiated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Initiate Solana to EVM swap
router.post('/swap/solana-to-evm', authMiddleware, async (req, res) => {
  try {
    const { userSecretKey, tokenMintAddress, amount, evmRecipient } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userSecretKey || !amount || !evmRecipient) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }

    // Validate swap parameters
    crossRailBridge.validateSwapParams('solana', 'base', amount);

    const result = await crossRailBridge.initiateSolanaToEVMSwap({
      userSecretKey,
      tokenMintAddress,
      amount,
      evmRecipient,
      userId
    });

    return successResponse(req, res, result, 'Swap initiated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get swap status
router.get('/swap/status/:swapId', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    
    const status = crossRailBridge.getSwapStatus(swapId);
    
    if (!status) {
      return errorResponse(req, res, 'Swap not found', 404);
    }

    return successResponse(req, res, status, 'Swap status retrieved');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get user swaps
router.get('/swaps/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const swaps = crossRailBridge.getUserSwaps(userId);
    
    return successResponse(req, res, swaps, 'User swaps retrieved');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Cancel swap (admin only)
router.post('/swap/cancel/:swapId', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    const { operatorKey } = req.body;
    
    // Check admin role
    if (!req.user?.roles?.includes('admin')) {
      return errorResponse(req, res, 'Unauthorized', 403);
    }

    const result = await crossRailBridge.cancelSwap(swapId, operatorKey);
    
    return successResponse(req, res, result, 'Swap cancelled successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get bridge statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = crossRailBridge.getBridgeStats();
    
    return successResponse(req, res, stats, 'Bridge statistics retrieved');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get bridge configuration
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const config = {
      supportedChains: ['base', 'solana'],
      minSwapAmount: 0.001,
      maxSwapAmount: 1000000,
      estimatedTime: {
        evmToSolana: '60 seconds',
        solanaToEvm: '60 seconds'
      },
      fees: {
        percentage: 0.1,
        minimum: 0.001
      },
      tokens: {
        base: {
          USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'
        },
        solana: {
          USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
        }
      }
    };
    
    return successResponse(req, res, config, 'Bridge configuration retrieved');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'operational',
      services: {
        evm: 'connected',
        solana: 'connected',
        bridge: 'active'
      },
      timestamp: new Date().toISOString()
    };
    
    return successResponse(req, res, health, 'Bridge is operational');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

export default router;