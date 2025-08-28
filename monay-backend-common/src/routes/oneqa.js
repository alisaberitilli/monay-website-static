import { Router } from 'express';
import OneQAService from '../services/oneqa-service';
import middlewares from '../middlewares';
import helpers from '../helpers';
import { logger } from '../services/logger';

const router = Router();
const { authMiddleware } = middlewares;
const { successResponse, errorResponse } = helpers;

/**
 * @route GET /api/oneqa/test
 * @desc Test OneQA endpoint
 * @access Public
 */
router.get('/test', async (req, res) => {
  return successResponse(res, 'OneQA service is working', {
    status: 'active',
    endpoints: ['/initiate-login', '/verify-otp', '/providers', '/import-invoices']
  });
});

/**
 * @route POST /api/oneqa/initiate-login
 * @desc Initiate OneQA login with mobile number
 * @access Private
 */
router.post('/initiate-login', authMiddleware, async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return errorResponse(res, 'Mobile number is required', 400);
    }
    
    const result = await OneQAService.initiateLogin(mobileNumber);
    
    if (result.success) {
      return successResponse(res, result.message, {
        sessionId: result.sessionId,
        requiresOTP: result.requiresOTP
      });
    } else {
      return errorResponse(res, result.message || 'Failed to initiate login', 400);
    }
  } catch (error) {
    logger.error('Error in OneQA initiate login:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

/**
 * @route POST /api/oneqa/verify-otp
 * @desc Verify OTP for OneQA authentication
 * @access Private
 */
router.post('/verify-otp', authMiddleware, async (req, res) => {
  try {
    const { sessionId, otp } = req.body;
    
    if (!sessionId || !otp) {
      return errorResponse(res, 'Session ID and OTP are required', 400);
    }
    
    const result = await OneQAService.verifyOTP(sessionId, otp);
    
    if (result.success) {
      return successResponse(res, result.message, {
        authToken: result.authToken
      });
    } else {
      return errorResponse(res, result.message || 'OTP verification failed', 400);
    }
  } catch (error) {
    logger.error('Error in OneQA OTP verification:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

/**
 * @route GET /api/oneqa/providers
 * @desc Get available service providers
 * @access Private
 */
router.get('/providers', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return errorResponse(res, 'Session ID is required', 400);
    }
    
    const result = await OneQAService.fetchServiceProviders(sessionId);
    
    if (result.success) {
      return successResponse(res, 'Providers fetched successfully', {
        providers: result.providers
      });
    } else {
      return errorResponse(res, result.message || 'Failed to fetch providers', 400);
    }
  } catch (error) {
    logger.error('Error fetching OneQA providers:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

/**
 * @route POST /api/oneqa/import-invoices
 * @desc Import invoices from a specific provider
 * @access Private
 */
router.post('/import-invoices', authMiddleware, async (req, res) => {
  try {
    const { sessionId, providerId } = req.body;
    const userId = req.user.userId;
    
    if (!sessionId || !providerId) {
      return errorResponse(res, 'Session ID and Provider ID are required', 400);
    }
    
    const result = await OneQAService.fetchProviderInvoices(sessionId, providerId);
    
    if (result.success) {
      // Transform and save invoices to database
      const transformedInvoices = result.invoices.map(invoice => ({
        externalId: invoice.invoiceNumber,
        provider: providerId,
        providerName: invoice.serviceProvider,
        accountNumber: invoice.accountNumber,
        amount: parseFloat(invoice.amount?.replace(/[^0-9.-]/g, '') || '0'),
        currency: 'AED',
        dueDate: invoice.dueDate,
        billingPeriod: invoice.billingPeriod,
        status: invoice.status?.toLowerCase() || 'pending',
        downloadUrl: invoice.downloadUrl,
        description: `${invoice.serviceProvider || providerId} - ${invoice.billingPeriod || 'Services'}`
      }));
      
      // Here you would save to database
      // await saveInvoicesToDatabase(userId, transformedInvoices);
      
      return successResponse(res, 'Invoices imported successfully', {
        invoices: transformedInvoices,
        count: transformedInvoices.length
      });
    } else {
      return errorResponse(res, result.message || 'Failed to fetch invoices', 400);
    }
  } catch (error) {
    logger.error('Error importing OneQA invoices:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

/**
 * @route POST /api/oneqa/close-session
 * @desc Close OneQA session
 * @access Private
 */
router.post('/close-session', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return errorResponse(res, 'Session ID is required', 400);
    }
    
    await OneQAService.closeSession(sessionId);
    
    return successResponse(res, 'Session closed successfully');
  } catch (error) {
    logger.error('Error closing OneQA session:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

/**
 * @route GET /api/oneqa/test-providers
 * @desc Get available providers without authentication (for testing)
 * @access Private
 */
router.get('/test-providers', authMiddleware, async (req, res) => {
  try {
    const providers = await OneQAService.getAvailableProviders();
    
    return successResponse(res, 'Test providers fetched', {
      providers: providers
    });
  } catch (error) {
    logger.error('Error fetching test providers:', error);
    return errorResponse(res, 'Internal server error', 500);
  }
});

export default router;