import { Router } from 'express';
import OneQAPlaywrightService from '../services/oneqa-playwright.js';
import helpers from '../helpers';
import loggers from '../services/logger.js';

const router = Router();
const { successResponse, errorResponse } = helpers;

/**
 * @route GET /oneqa/test
 * @desc Test endpoint
 */
router.get('/oneqa/test', (req, res) => {
  return successResponse(req, res, {
    status: 'active',
    mode: 'real',
    endpoints: ['/oneqa/initiate-login', '/oneqa/verify-otp', '/oneqa/providers', '/oneqa/import-invoices']
  }, 'OneQA real service is working');
});

/**
 * @route POST /oneqa/initiate-login
 * @desc Initiate real login with OneQA
 */
router.post('/oneqa/initiate-login', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return errorResponse(req, res, 'Mobile number is required', 400);
    }
    
    console.log('OneQA Real: Initiating login for:', mobileNumber);
    
    const result = await OneQAPlaywrightService.initiateLogin(mobileNumber);
    
    if (result.success) {
      return successResponse(req, res, {
        sessionId: result.sessionId,
        requiresOTP: result.requiresOTP
      }, result.message);
    } else {
      return errorResponse(req, res, result.message || 'Failed to initiate login', 400);
    }
    
  } catch (error) {
    console.error('OneQA Real login error:', error);
    return errorResponse(req, res, 'Failed to initiate login', 500);
  }
});

/**
 * @route POST /oneqa/verify-otp
 * @desc Verify real OTP from SMS
 */
router.post('/oneqa/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;
    
    if (!sessionId || !otp) {
      return errorResponse(req, res, 'Session ID and OTP are required', 400);
    }
    
    console.log('OneQA Real: Verifying OTP for session:', sessionId);
    
    const result = await OneQAPlaywrightService.verifyOTP(sessionId, otp);
    
    if (result.success) {
      return successResponse(req, res, {
        authToken: `token_${Date.now()}`
      }, result.message);
    } else {
      return errorResponse(req, res, result.message || 'Invalid OTP', 400);
    }
    
  } catch (error) {
    console.error('OneQA Real OTP verification error:', error);
    return errorResponse(req, res, 'Failed to verify OTP', 500);
  }
});

/**
 * @route GET /oneqa/providers
 * @desc Get real service providers from OneQA
 */
router.get('/oneqa/providers', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    console.log('OneQA Real: Fetching providers for session:', sessionId);
    
    const result = await OneQAPlaywrightService.fetchServiceProviders(sessionId);
    
    if (result.success) {
      return successResponse(req, res, {
        providers: result.providers
      }, 'Providers fetched successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to fetch providers', 400);
    }
    
  } catch (error) {
    console.error('OneQA Real providers error:', error);
    return errorResponse(req, res, 'Failed to fetch providers', 500);
  }
});

/**
 * @route POST /oneqa/import-invoices
 * @desc Import real invoices from OneQA provider
 */
router.post('/oneqa/import-invoices', async (req, res) => {
  try {
    const { sessionId, providerId } = req.body;
    
    if (!sessionId || !providerId) {
      return errorResponse(req, res, 'Session ID and Provider ID are required', 400);
    }
    
    console.log('OneQA Real: Importing invoices for provider:', providerId);
    
    const result = await OneQAPlaywrightService.fetchProviderInvoices(sessionId, providerId);
    
    if (result.success) {
      return successResponse(req, res, {
        invoices: result.invoices,
        count: result.invoices.length
      }, 'Invoices imported successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to import invoices', 400);
    }
    
  } catch (error) {
    console.error('OneQA Real import invoices error:', error);
    return errorResponse(req, res, 'Failed to import invoices', 500);
  }
});

/**
 * @route POST /oneqa/close-session
 * @desc Close OneQA browser session
 */
router.post('/oneqa/close-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      await OneQAPlaywrightService.closeSession(sessionId);
    }
    
    return successResponse(req, res, null, 'Session closed successfully');
    
  } catch (error) {
    console.error('OneQA Real close session error:', error);
    return errorResponse(req, res, 'Failed to close session', 500);
  }
});

export default router;