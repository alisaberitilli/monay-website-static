import express from 'express';
import evmService from '../services/evm.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import { successResponse, errorResponse } from '../helpers/index.js';

const router = express.Router();

// Generate new EVM wallet
router.post('/generate-wallet', authMiddleware, async (req, res) => {
  try {
    const wallet = await evmService.generateWallet();
    return successResponse(req, res, wallet, 'EVM wallet generated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Import existing wallet
router.post('/import-wallet', authMiddleware, async (req, res) => {
  try {
    const { privateKeyOrMnemonic } = req.body;
    
    if (!privateKeyOrMnemonic) {
      return errorResponse(req, res, 'Private key or mnemonic is required', 400);
    }
    
    const wallet = await evmService.importWallet(privateKeyOrMnemonic);
    return successResponse(req, res, wallet, 'Wallet imported successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get balance (native or ERC20)
router.get('/balance/:address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const { tokenAddress } = req.query;
    
    const balance = await evmService.getBalance(address, tokenAddress);
    return successResponse(req, res, { address, balance, tokenAddress }, 'Balance retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Transfer tokens (native or ERC20)
router.post('/transfer', authMiddleware, async (req, res) => {
  try {
    const { privateKey, toAddress, amount, tokenAddress } = req.body;
    
    if (!privateKey || !toAddress || !amount) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await evmService.transfer(privateKey, toAddress, amount, tokenAddress);
    return successResponse(req, res, result, 'Transfer completed successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Deploy ERC3643 compliant token
router.post('/deploy-token', authMiddleware, async (req, res) => {
  try {
    const { privateKey, name, symbol, decimals, identityRegistry, compliance } = req.body;
    
    if (!privateKey || !name || !symbol) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await evmService.deployERC3643Token(
      privateKey,
      name,
      symbol,
      decimals || 18,
      identityRegistry || '0x0000000000000000000000000000000000000000',
      compliance || '0x0000000000000000000000000000000000000000'
    );
    
    return successResponse(req, res, result, 'Token deployed successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Create business rule on token
router.post('/business-rule', authMiddleware, async (req, res) => {
  try {
    const { privateKey, tokenAddress, ruleName, category, conditions, actions, priority } = req.body;
    
    if (!privateKey || !tokenAddress || !ruleName || !category) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await evmService.createBusinessRule(
      privateKey,
      tokenAddress,
      ruleName,
      category,
      conditions || {},
      actions || {},
      priority
    );
    
    return successResponse(req, res, result, 'Business rule created successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Set spend limits for user
router.post('/spend-limits', authMiddleware, async (req, res) => {
  try {
    const { privateKey, tokenAddress, userAddress, dailyLimit, monthlyLimit, transactionLimit } = req.body;
    
    if (!privateKey || !tokenAddress || !userAddress) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await evmService.setSpendLimits(
      privateKey,
      tokenAddress,
      userAddress,
      dailyLimit || 0,
      monthlyLimit || 0,
      transactionLimit || 0
    );
    
    return successResponse(req, res, result, 'Spend limits updated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Update KYC data for user
router.post('/kyc-data', authMiddleware, async (req, res) => {
  try {
    const { privateKey, tokenAddress, userAddress, kycLevel, isVerified, expiresAt, riskScore } = req.body;
    
    if (!privateKey || !tokenAddress || !userAddress) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await evmService.updateKYCData(
      privateKey,
      tokenAddress,
      userAddress,
      kycLevel || 0,
      isVerified || false,
      expiresAt,
      riskScore || 0
    );
    
    return successResponse(req, res, result, 'KYC data updated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get transaction history
router.get('/transactions/:address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 10 } = req.query;
    
    const transactions = await evmService.getTransactionHistory(address, parseInt(limit));
    return successResponse(req, res, transactions, 'Transaction history retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Estimate gas for transaction
router.post('/estimate-gas', authMiddleware, async (req, res) => {
  try {
    const { from, to, amount, tokenAddress } = req.body;
    
    if (!from || !to || !amount) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const gasEstimate = await evmService.estimateGas(from, to, amount, tokenAddress);
    return successResponse(req, res, gasEstimate, 'Gas estimated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Validate address
router.post('/validate-address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return errorResponse(req, res, 'Address is required', 400);
    }
    
    const isValid = await evmService.validateAddress(address);
    return successResponse(req, res, { address, isValid }, 'Address validation completed');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get network status
router.get('/network-status', authMiddleware, async (req, res) => {
  try {
    const status = await evmService.getNetworkStatus();
    return successResponse(req, res, status, 'Network status retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

// Get current block number
router.get('/block-number', authMiddleware, async (req, res) => {
  try {
    const blockNumber = await evmService.getBlockNumber();
    return successResponse(req, res, { blockNumber }, 'Block number retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

export default router;