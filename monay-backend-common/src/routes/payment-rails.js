/**
 * Payment Rails API Routes
 * Handles FedNow, RTP, ACH, and Wire transfers through Dwolla and Stripe
 * @module routes/payment-rails
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middlewares/auth-middleware.js';
import dwollaPaymentService from '../services/dwolla-payment.js';
import paymentRailOrchestrator from '../services/payment-rail-orchestrator.js';
import loggers from '../services/logger.js';

const router = Router();

/**
 * Initialize Dwolla service on startup
 */
router.get('/initialize', async (req, res, next) => {
  try {
    await dwollaPaymentService.initialize();
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Payment rails initialized',
      environment: process.env.DWOLLA_ENVIRONMENT || 'sandbox'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create Dwolla customer
 */
router.post('/customers', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.createCustomer({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      businessName: req.body.businessName,
      verified: req.body.verified || false,
      address1: req.body.address1,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      dateOfBirth: req.body.dateOfBirth,
      ssn: req.body.ssn // Last 4 digits only for sandbox
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Customer created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Add bank account to customer
 */
router.post('/customers/:customerId/funding-sources', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.addBankAccount(
      req.params.customerId,
      {
        routingNumber: req.body.routingNumber,
        accountNumber: req.body.accountNumber,
        accountType: req.body.accountType || 'checking',
        accountName: req.body.accountName,
        plaidToken: req.body.plaidToken // Optional for instant payment eligibility
      }
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Bank account added successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check instant payment eligibility
 */
router.get('/funding-sources/:fundingSourceId/eligibility', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.checkInstantPaymentEligibility(
      req.params.fundingSourceId
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: result.eligible
        ? 'Funding source is eligible for instant payments (FedNow/RTP)'
        : 'Funding source is not eligible for instant payments'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process instant payment (FedNow/RTP)
 */
router.post('/payments/instant', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.processInstantPayment({
      sourceFundingSourceId: req.body.sourceFundingSourceId,
      destinationFundingSourceId: req.body.destinationFundingSourceId,
      amount: req.body.amount, // Amount in cents
      metadata: req.body.metadata || {},
      correlationId: req.body.correlationId
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `Instant payment processed via ${result.network}`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process ACH payment
 */
router.post('/payments/ach', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.processACHPayment({
      sourceFundingSourceId: req.body.sourceFundingSourceId,
      destinationFundingSourceId: req.body.destinationFundingSourceId,
      amount: req.body.amount, // Amount in cents
      clearing: req.body.clearing || 'standard', // 'standard' or 'same-day'
      metadata: req.body.metadata || {},
      correlationId: req.body.correlationId
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `ACH payment initiated (${result.clearing})`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Route payment through optimal rail
 */
router.post('/payments/route', authenticate, async (req, res, next) => {
  try {
    const result = await paymentRailOrchestrator.routePayment({
      amount: req.body.amount, // Amount in cents
      priority: req.body.priority || 'standard', // 'emergency', 'urgent', 'standard', 'batch'
      sourceFundingSourceId: req.body.sourceFundingSourceId,
      destinationFundingSourceId: req.body.destinationFundingSourceId,
      stripeCustomerId: req.body.stripeCustomerId, // For wire transfers
      paymentType: req.body.paymentType,
      metadata: req.body.metadata || {}
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `Payment routed through ${result.rail} rail`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process emergency disbursement (4-hour SLA for GENIUS Act)
 */
router.post('/payments/emergency', authenticate, async (req, res, next) => {
  try {
    // Force emergency priority for GENIUS Act compliance
    const result = await paymentRailOrchestrator.routePayment({
      amount: req.body.amount,
      priority: 'emergency', // Forces instant payment if available
      sourceFundingSourceId: req.body.sourceFundingSourceId,
      destinationFundingSourceId: req.body.destinationFundingSourceId,
      paymentType: 'emergency_disbursement',
      metadata: {
        ...req.body.metadata,
        programType: req.body.programType || 'SNAP',
        beneficiaryId: req.body.beneficiaryId,
        slaTarget: '4_hours',
        initiatedAt: new Date().toISOString()
      }
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `Emergency disbursement processed via ${result.rail}`,
      sla: {
        target: '4 hours',
        trackingId: result.paymentId,
        estimatedCompletion: result.rail === 'RTP' || result.rail === 'FEDNOW'
          ? 'Instant'
          : 'Same day'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get available payment rails for amount
 */
router.post('/payments/available-rails', authenticate, async (req, res, next) => {
  try {
    const availableRails = paymentRailOrchestrator.getAvailableRails(
      req.body.amount,
      req.body.priority || 'standard'
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: availableRails,
      message: `${availableRails.length} payment rails available`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get transfer details
 */
router.get('/transfers/:transferId', authenticate, async (req, res, next) => {
  try {
    const transfer = await dwollaPaymentService.getTransfer(req.params.transferId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: transfer,
      message: 'Transfer details retrieved'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel transfer (if still pending)
 */
router.post('/transfers/:transferId/cancel', authenticate, async (req, res, next) => {
  try {
    const result = await dwollaPaymentService.cancelTransfer(req.params.transferId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Transfer cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Webhook endpoint for Dwolla
 */
router.post('/webhooks/dwolla', async (req, res, next) => {
  try {
    const secret = process.env.DWOLLA_WEBHOOK_SECRET || 'test-secret';

    // Verify webhook signature
    const isValid = dwollaPaymentService.verifyWebhookSignature(
      req.headers,
      req.body,
      secret
    );

    if (!isValid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Process webhook
    await paymentRailOrchestrator.handleWebhook('dwolla', req.body);

    res.status(HttpStatus.OK).json({ success: true });
  } catch (error) {
    loggers.errorLogger.error(`Dwolla webhook error: ${error.message}`);
    res.status(HttpStatus.OK).json({ success: true }); // Always return 200 to prevent retries
  }
});

/**
 * Test endpoint - Create sandbox test data
 */
router.post('/test/setup', async (req, res, next) => {
  try {
    // Initialize Dwolla
    await dwollaPaymentService.initialize();

    // Create test customers
    const customer1 = await dwollaPaymentService.createCustomer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      verified: false
    });

    const customer2 = await dwollaPaymentService.createCustomer({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      verified: false
    });

    // Add test bank accounts (these are Dwolla sandbox test accounts)
    const bank1 = await dwollaPaymentService.addBankAccount(customer1.customerId, {
      routingNumber: '222222226', // Dwolla sandbox routing number
      accountNumber: '123456789',
      accountType: 'checking',
      accountName: 'John Doe Checking'
    });

    const bank2 = await dwollaPaymentService.addBankAccount(customer2.customerId, {
      routingNumber: '222222226', // Dwolla sandbox routing number
      accountNumber: '987654321',
      accountType: 'checking',
      accountName: 'Jane Smith Checking'
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Test data created successfully',
      data: {
        customer1: customer1.customerId,
        customer2: customer2.customerId,
        bank1: bank1.fundingSourceId,
        bank2: bank2.fundingSourceId,
        supportsInstant: {
          bank1: bank1.supportsInstant,
          bank2: bank2.supportsInstant
        }
      },
      instructions: 'Use the bank funding source IDs to test payments'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    service: 'Payment Rails',
    status: 'operational',
    providers: {
      dwolla: 'configured',
      stripe: 'configured'
    },
    rails: ['FedNow', 'RTP', 'Same-Day ACH', 'Standard ACH', 'Wire'],
    timestamp: new Date()
  });
});

export default router;