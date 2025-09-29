import { Router } from 'express';
import helpers from '../helpers/index.js';

const router = Router();
const { successResponse, errorResponse } = helpers;

// Simple mock service for testing
const mockSessions = new Map();

/**
 * @route GET /oneqa/test
 * @desc Test endpoint
 */
router.get('/oneqa/test', (req, res) => {
  return successResponse(req, res, {
    status: 'active',
    endpoints: ['/initiate-login', '/verify-otp', '/providers']
  }, 'OneQA service is working');
});

/**
 * @route POST /oneqa/initiate-login
 * @desc Initiate login with mobile number
 */
router.post('/oneqa/initiate-login', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    console.log('OneQA: Initiating login for:', mobileNumber);
    
    // Create mock session
    const sessionId = `session_${Date.now()}_${mobileNumber}`;
    mockSessions.set(sessionId, {
      mobileNumber,
      status: 'otp_sent',
      timestamp: Date.now()
    });
    
    return successResponse(req, res, {
      sessionId,
      requiresOTP: true,
      message: 'Mock OTP: 123456'
    }, 'OTP sent successfully');
    
  } catch (error) {
    console.error('OneQA login error:', error);
    return errorResponse(req, res, 'Failed to initiate login', 500);
  }
});

/**
 * @route POST /oneqa/verify-otp
 * @desc Verify OTP
 */
router.post('/oneqa/verify-otp', async (req, res) => {
  try {
    const { sessionId, otp } = req.body;
    
    console.log('OneQA: Verifying OTP for session:', sessionId);
    
    const session = mockSessions.get(sessionId);
    if (!session) {
      return errorResponse(req, res, 'Invalid session', 400);
    }
    
    // Mock OTP verification (accept any OTP for testing)
    session.status = 'authenticated';
    
    return successResponse(req, res, {
      authToken: `mock_token_${Date.now()}`
    }, 'Authentication successful');
    
  } catch (error) {
    console.error('OneQA OTP verification error:', error);
    return errorResponse(req, res, 'Failed to verify OTP', 500);
  }
});

/**
 * @route GET /oneqa/providers
 * @desc Get mock service providers
 */
router.get('/oneqa/providers', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    console.log('OneQA: Fetching providers for session:', sessionId);
    
    // Return mock providers
    const providers = [
      {
        id: 'dewa',
        name: 'Dubai Electricity & Water Authority',
        accountNumber: '1234567890',
        logo: null,
        hasInvoices: '3 invoices'
      },
      {
        id: 'etisalat',
        name: 'Etisalat',
        accountNumber: '9876543210',
        logo: null,
        hasInvoices: '2 invoices'
      },
      {
        id: 'du',
        name: 'Du Telecom',
        accountNumber: '5555555555',
        logo: null,
        hasInvoices: '1 invoice'
      }
    ];
    
    return successResponse(req, res, {
      providers
    }, 'Providers fetched successfully');
    
  } catch (error) {
    console.error('OneQA providers error:', error);
    return errorResponse(req, res, 'Failed to fetch providers', 500);
  }
});

/**
 * @route POST /oneqa/import-invoices
 * @desc Import mock invoices
 */
router.post('/oneqa/import-invoices', async (req, res) => {
  try {
    const { sessionId, providerId } = req.body;
    
    console.log('OneQA: Importing invoices for provider:', providerId);
    
    // Return mock invoices based on provider
    const mockInvoices = {
      dewa: [
        {
          invoiceNumber: 'DEWA-2024-001',
          amount: 450.50,
          currency: 'AED',
          dueDate: '2024-02-15',
          billingPeriod: 'January 2024',
          status: 'pending',
          serviceProvider: 'DEWA',
          description: 'Electricity and Water - January 2024'
        },
        {
          invoiceNumber: 'DEWA-2024-002',
          amount: 520.00,
          currency: 'AED',
          dueDate: '2024-03-15',
          billingPeriod: 'February 2024',
          status: 'pending',
          serviceProvider: 'DEWA',
          description: 'Electricity and Water - February 2024'
        }
      ],
      etisalat: [
        {
          invoiceNumber: 'ETIS-2024-001',
          amount: 299.00,
          currency: 'AED',
          dueDate: '2024-02-20',
          billingPeriod: 'February 2024',
          status: 'pending',
          serviceProvider: 'Etisalat',
          description: 'Mobile and Internet Services'
        }
      ],
      du: [
        {
          invoiceNumber: 'DU-2024-001',
          amount: 199.00,
          currency: 'AED',
          dueDate: '2024-02-25',
          billingPeriod: 'February 2024',
          status: 'paid',
          serviceProvider: 'Du',
          description: 'Mobile Plan - Unlimited'
        }
      ]
    };
    
    const invoices = mockInvoices[providerId] || [];
    
    return successResponse(req, res, {
      invoices,
      count: invoices.length
    }, 'Invoices imported successfully');
    
  } catch (error) {
    console.error('OneQA import invoices error:', error);
    return errorResponse(req, res, 'Failed to import invoices', 500);
  }
});

export default router;