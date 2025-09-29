import { Router } from 'express';
import OneQAManualService from '../services/oneqa-manual.js';
import OneQAAutomatedService from '../services/oneqa-automated.js';
import helpers from '../helpers/index.js';
import loggers from '../services/logger.js';

const router = Router();
const { successResponse, errorResponse } = helpers;
const logger = loggers.internalLogger || console;

/**
 * @route GET /oneqa/status
 * @desc Check OneQA integration status
 */
router.get('/oneqa/status', (req, res) => {
  return successResponse(req, res, {
    status: 'active',
    modes: ['automated', 'manual'],
    automated: {
      login: 'POST /oneqa/login',
      verifyOtp: 'POST /oneqa/verify-otp', 
      providers: 'GET /oneqa/providers',
      invoices: 'GET /oneqa/invoices',
      logout: 'POST /oneqa/logout'
    },
    manual: {
      initiate: 'POST /oneqa/manual/initiate-login',
      verify: 'POST /oneqa/manual/verify-otp',
      providers: 'GET /oneqa/manual/providers',
      import: 'POST /oneqa/manual/import-invoices'
    }
  }, 'OneQA service is active');
});

/**
 * @route POST /oneqa/initiate-login
 * @desc Open browser for manual login
 */
router.post('/oneqa/initiate-login', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    console.log('OneQA Manual: Opening browser for manual login');
    
    const result = await OneQAManualService.initiateManualLogin(mobileNumber);
    
    if (result.success) {
      return successResponse(req, res, {
        sessionId: result.sessionId,
        requiresOTP: result.requiresOTP
      }, result.message);
    } else {
      return errorResponse(req, res, result.message || 'Failed to open browser', 400);
    }
    
  } catch (error) {
    console.error('OneQA Manual login error:', error);
    return errorResponse(req, res, 'Failed to initiate login', 500);
  }
});

/**
 * @route POST /oneqa/verify-otp
 * @desc Check if user has manually logged in
 */
router.post('/oneqa/verify-otp', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    console.log('OneQA Manual: Checking if user has logged in manually');
    
    const result = await OneQAManualService.checkLoginStatus(sessionId);
    
    if (result.success) {
      return successResponse(req, res, {
        authToken: `token_${Date.now()}`
      }, result.message);
    } else {
      return errorResponse(req, res, result.message || 'Not logged in yet', 400);
    }
    
  } catch (error) {
    console.error('OneQA Manual verification error:', error);
    return errorResponse(req, res, 'Failed to verify login', 500);
  }
});

/**
 * @route GET /oneqa/providers
 * @desc Get service providers after manual login
 */
router.get('/oneqa/providers', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    console.log('OneQA Manual: Fetching providers for session:', sessionId);
    
    const result = await OneQAManualService.fetchServiceProviders(sessionId);
    
    if (result.success) {
      return successResponse(req, res, {
        providers: result.providers
      }, 'Providers fetched successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to fetch providers', 400);
    }
    
  } catch (error) {
    console.error('OneQA Manual providers error:', error);
    return errorResponse(req, res, 'Failed to fetch providers', 500);
  }
});

/**
 * @route POST /oneqa/import-invoices
 * @desc Import invoices from a provider
 */
router.post('/oneqa/import-invoices', async (req, res) => {
  try {
    const { sessionId, providerId } = req.body;
    
    if (!sessionId || !providerId) {
      return errorResponse(req, res, 'Session ID and Provider ID are required', 400);
    }
    
    console.log('OneQA Manual: Importing invoices for provider:', providerId);
    
    const result = await OneQAManualService.fetchProviderInvoices(sessionId, providerId);
    
    if (result.success) {
      return successResponse(req, res, {
        invoices: result.invoices,
        count: result.invoices.length
      }, 'Invoices imported successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to import invoices', 400);
    }
    
  } catch (error) {
    console.error('OneQA Manual import invoices error:', error);
    return errorResponse(req, res, 'Failed to import invoices', 500);
  }
});

/**
 * @route POST /oneqa/close-session
 * @desc Close browser session
 */
router.post('/oneqa/close-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      await OneQAManualService.closeSession(sessionId);
    }
    
    return successResponse(req, res, null, 'Session closed successfully');
    
  } catch (error) {
    console.error('OneQA Manual close session error:', error);
    return errorResponse(req, res, 'Failed to close session', 500);
  }
});

// ============================================
// AUTOMATED ENDPOINTS
// ============================================

/**
 * @route POST /oneqa/login
 * @desc Automated login with mobile number
 */
router.post('/oneqa/login', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return errorResponse(req, res, 'Mobile number is required', 400);
    }
    
    logger.info(`OneQA: Initiating automated login for ${mobileNumber}`);
    
    const result = await OneQAAutomatedService.automatedLogin(mobileNumber);
    
    if (result.success) {
      return successResponse(req, res, {
        sessionId: result.sessionId,
        requiresOTP: result.requiresOTP
      }, result.message);
    } else {
      return errorResponse(req, res, result.message || 'Login failed', 400);
    }
    
  } catch (error) {
    logger.error('OneQA login error:', error);
    return errorResponse(req, res, 'Failed to initiate login', 500);
  }
});

/**
 * @route POST /oneqa/verify-otp
 * @desc Verify OTP and complete automated login
 */
router.post('/oneqa/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp, manual } = req.body;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    // Check if this is a manual session
    if (manual || sessionId.includes('manual')) {
      logger.info('OneQA: Checking manual login status');
      const result = await OneQAManualService.checkLoginStatus(sessionId);
      
      if (result.success) {
        return successResponse(req, res, {
          authToken: `token_${Date.now()}`,
          sessionId: sessionId
        }, result.message);
      } else {
        return errorResponse(req, res, result.message || 'Not logged in yet', 400);
      }
    } else {
      // Automated OTP verification
      if (!otp) {
        return errorResponse(req, res, 'OTP is required', 400);
      }
      
      logger.info(`OneQA: Verifying OTP for session ${sessionId}`);
      
      const result = await OneQAAutomatedService.verifyOTP(sessionId, otp);
      
      if (result.success) {
        return successResponse(req, res, {
          authToken: result.authToken,
          sessionId: sessionId
        }, result.message);
      } else {
        return errorResponse(req, res, result.message || 'OTP verification failed', 400);
      }
    }
    
  } catch (error) {
    logger.error('OneQA OTP verification error:', error);
    return errorResponse(req, res, 'Failed to verify OTP', 500);
  }
});

/**
 * @route GET /oneqa/providers
 * @desc Get all service providers (works with both manual and automated)
 */
router.get('/oneqa/providers', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    logger.info(`OneQA: Fetching providers for session ${sessionId}`);
    
    // Check if this is a manual or automated session
    const service = sessionId.includes('manual') ? OneQAManualService : OneQAAutomatedService;
    
    const result = await service.fetchServiceProviders(sessionId);
    
    if (result.success) {
      return successResponse(req, res, {
        providers: result.providers
      }, 'Providers fetched successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to fetch providers', 400);
    }
    
  } catch (error) {
    logger.error('OneQA fetch providers error:', error);
    return errorResponse(req, res, 'Failed to fetch providers', 500);
  }
});

/**
 * @route GET /oneqa/invoices
 * @desc Get all invoices from all providers
 */
router.get('/oneqa/invoices', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    logger.info(`OneQA: Fetching all invoices for session ${sessionId}`);
    
    const result = await OneQAAutomatedService.fetchAllInvoices(sessionId);
    
    if (result.success) {
      return successResponse(req, res, {
        invoices: result.invoices,
        summary: result.summary,
        invoicesByProvider: result.invoicesByProvider
      }, 'Invoices fetched successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to fetch invoices', 400);
    }
    
  } catch (error) {
    logger.error('OneQA fetch invoices error:', error);
    return errorResponse(req, res, 'Failed to fetch invoices', 500);
  }
});

/**
 * @route POST /oneqa/import-invoices
 * @desc Import invoices (compatible with frontend)
 */
router.post('/oneqa/import-invoices', async (req, res) => {
  try {
    const { sessionId, providerId } = req.body;
    
    if (!sessionId) {
      return errorResponse(req, res, 'Session ID is required', 400);
    }
    
    logger.info(`OneQA: Importing invoices for provider ${providerId || 'all'}`);
    
    let result;
    
    if (providerId) {
      // Fetch specific provider invoices
      result = await OneQAAutomatedService.fetchProviderInvoices(sessionId, providerId);
    } else {
      // Fetch all invoices
      result = await OneQAAutomatedService.fetchAllInvoices(sessionId);
    }
    
    if (result.success) {
      return successResponse(req, res, {
        invoices: result.invoices,
        count: result.invoices?.length || result.count,
        totalAmount: result.totalAmount || result.summary?.totalAmount
      }, 'Invoices imported successfully');
    } else {
      return errorResponse(req, res, result.message || 'Failed to import invoices', 400);
    }
    
  } catch (error) {
    logger.error('OneQA import invoices error:', error);
    return errorResponse(req, res, 'Failed to import invoices', 500);
  }
});

/**
 * @route POST /oneqa/logout
 * @desc Close session and cleanup
 */
router.post('/oneqa/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      // Close in both services to be safe
      if (sessionId.includes('manual')) {
        await OneQAManualService.closeSession(sessionId);
      } else {
        await OneQAAutomatedService.closeSession(sessionId);
      }
    }
    
    return successResponse(req, res, null, 'Logged out successfully');
    
  } catch (error) {
    logger.error('OneQA logout error:', error);
    return errorResponse(req, res, 'Failed to logout', 500);
  }
});

export default router;