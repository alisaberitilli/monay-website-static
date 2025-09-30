import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middleware-app/auth-middleware.js';
import rateLimiter from '../middleware-app/rate-limiter-middleware.js';
import customerVerification from '../services/customer-verification.js';

const router = Router();

// Create verification session
router.post('/session', authenticate, async (req, res, next) => {
  try {
    const { userData, provider, verificationType } = req.body;
    
    const result = await customerVerification.createVerificationSession(
      {
        ...userData,
        userId: req.user.id
      },
      {
        provider: provider || 'persona',
        verificationType: verificationType || 'individual'
      }
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Verification session created'
    });
  } catch (error) {
    next(error);
  }
});

// Check verification status
router.get('/status/:sessionId', authenticate, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { provider } = req.query;

    const status = await customerVerification.checkVerificationStatus(
      sessionId,
      provider || 'persona'
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: status,
      message: 'Verification status retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Webhook endpoints for each provider
router.post('/webhook/persona', async (req, res, next) => {
  try {
    const signature = req.headers['persona-signature'];
    
    const result = await customerVerification.processWebhook(
      'persona',
      req.body,
      signature
    );

    res.status(HttpStatus.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook/alloy', async (req, res, next) => {
  try {
    const result = await customerVerification.processWebhook(
      'alloy',
      req.body,
      null // Alloy uses basic auth
    );

    res.status(HttpStatus.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook/onfido', async (req, res, next) => {
  try {
    const signature = req.headers['x-sha2-signature'];
    
    const result = await customerVerification.processWebhook(
      'onfido',
      req.body,
      signature
    );

    res.status(HttpStatus.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Enhanced due diligence
router.post('/enhanced-due-diligence', authenticate, async (req, res, next) => {
  try {
    const { userId, includeCreditCheck } = req.body;
    
    const result = await customerVerification.performEnhancedDueDiligence(
      userId || req.user.id,
      { includeCreditCheck }
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Enhanced due diligence completed'
    });
  } catch (error) {
    next(error);
  }
});

// Generate verification report
router.get('/report/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const report = await customerVerification.generateVerificationReport(
      userId || req.user.id
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: report,
      message: 'Verification report generated'
    });
  } catch (error) {
    next(error);
  }
});

// Supported providers
router.get('/providers', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      providers: ['persona', 'alloy', 'onfido'],
      verificationTypes: ['individual', 'business'],
      documentTypes: ['passport', 'drivers_license', 'national_id', 'residence_permit'],
      levels: ['basic', 'enhanced', 'full']
    }
  });
});

export default router;