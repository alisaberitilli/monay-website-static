import express from 'express';
import solanaService from '../services/solana';
import authMiddleware from '../middlewares/auth-middleware';
import { successResponse, errorResponse } from '../helpers';

const router = express.Router();

router.post('/generate-wallet', authMiddleware, async (req, res) => {
  try {
    const wallet = await solanaService.generateWallet();
    return successResponse(req, res, wallet, 'Solana wallet generated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.get('/balance/:address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await solanaService.getBalance(address);
    return successResponse(req, res, { address, balance }, 'Balance retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.get('/token-balance/:address/:mint', authMiddleware, async (req, res) => {
  try {
    const { address, mint } = req.params;
    const balance = await solanaService.getTokenBalance(address, mint);
    return successResponse(req, res, { address, mint, balance }, 'Token balance retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.post('/transfer-sol', authMiddleware, async (req, res) => {
  try {
    const { fromSecretKey, toAddress, amount } = req.body;
    
    if (!fromSecretKey || !toAddress || !amount) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await solanaService.transferSOL(fromSecretKey, toAddress, amount);
    return successResponse(req, res, result, 'SOL transferred successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.post('/transfer-token', authMiddleware, async (req, res) => {
  try {
    const { fromSecretKey, toAddress, tokenMintAddress, amount, decimals } = req.body;
    
    if (!fromSecretKey || !toAddress || !tokenMintAddress || !amount) {
      return errorResponse(req, res, 'Missing required parameters', 400);
    }
    
    const result = await solanaService.transferToken(
      fromSecretKey,
      toAddress,
      tokenMintAddress,
      amount,
      decimals
    );
    return successResponse(req, res, result, 'Token transferred successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.get('/transactions/:address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 10 } = req.query;
    const transactions = await solanaService.getTransactionHistory(address, parseInt(limit));
    return successResponse(req, res, transactions, 'Transaction history retrieved successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.post('/validate-address', authMiddleware, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return errorResponse(req, res, 'Address is required', 400);
    }
    
    const isValid = await solanaService.validateAddress(address);
    return successResponse(req, res, { address, isValid }, 'Address validation completed');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

router.get('/estimate-fee', authMiddleware, async (req, res) => {
  try {
    const fee = await solanaService.estimateTransactionFee();
    return successResponse(req, res, { fee, unit: 'SOL' }, 'Fee estimated successfully');
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
});

export default router;