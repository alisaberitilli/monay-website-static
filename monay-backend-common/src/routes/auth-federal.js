import express from 'express';
import authenticate from '../middleware-app/auth-middleware.js';
import HttpStatus from 'http-status';

const router = express.Router();

// Configuration for Monay-ID service
const MONAY_ID_SERVICE_URL = process.env.MONAY_ID_SERVICE_URL || 'http://localhost:4000';

/**
 * Federal Authentication Routes
 * These routes proxy authentication requests to the Monay-ID service
 * which handles all federal identity provider integrations
 */

// Helper function to proxy requests to Monay-ID
async function proxyToMonayId(endpoint, requestData) {
  try {
    const response = await fetch(`${MONAY_ID_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Key': process.env.MONAY_ID_SERVICE_KEY || 'development-key'
      },
      body: JSON.stringify(requestData)
    });

    return await response.json();
  } catch (error) {
    console.error('Monay-ID proxy error:', error);
    throw new Error('Authentication service unavailable');
  }
}

/**
 * @route POST /api/auth/federal/login-gov
 * @desc Initiate Login.gov OAuth flow via Monay-ID
 * @access Public (for initial auth) / Private (for re-verification)
 */
router.post('/federal/login-gov', async (req, res, next) => {
  try {
    const { purpose, returnUrl } = req.body;
    const userId = req.user?.id || null;

    const result = await proxyToMonayId('/auth/federal/login-gov', {
      purpose,
      returnUrl,
      userId,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      redirectUrl: result.redirectUrl,
      sessionId: result.sessionId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/id-me
 * @desc Initiate ID.me verification via Monay-ID
 * @access Public (for initial auth) / Private (for re-verification)
 */
router.post('/federal/id-me', async (req, res, next) => {
  try {
    const { purpose, returnUrl } = req.body;
    const userId = req.user?.id || null;

    const result = await proxyToMonayId('/auth/federal/id-me', {
      purpose,
      returnUrl,
      userId,
      clientId: process.env.CLIENT_ID,
      scope: purpose === 'veteran-benefits' ? 'military' : 'identity'
    });

    res.status(HttpStatus.OK).json({
      success: true,
      redirectUrl: result.redirectUrl,
      sessionId: result.sessionId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/usps-ipp
 * @desc Initiate USPS In-Person Proofing via Monay-ID
 * @access Private
 */
router.post('/federal/usps-ipp', authenticate, async (req, res, next) => {
  try {
    const { purpose, location } = req.body;
    const userId = req.user.id;

    const result = await proxyToMonayId('/auth/federal/usps-ipp', {
      purpose,
      userId,
      location,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      proofingCode: result.proofingCode,
      nearestLocations: result.nearestLocations,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/irs
 * @desc IRS Identity Verification via Monay-ID
 * @access Private
 */
router.post('/federal/irs', authenticate, async (req, res, next) => {
  try {
    const { purpose, taxYear } = req.body;
    const userId = req.user.id;

    const result = await proxyToMonayId('/auth/federal/irs', {
      purpose,
      userId,
      taxYear,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      redirectUrl: result.redirectUrl,
      verificationId: result.verificationId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/ssa-dmf
 * @desc SSA Death Master File Check via Monay-ID
 * @access Private (Admin only)
 */
router.post('/federal/ssa-dmf', authenticate, async (req, res, next) => {
  try {
    const { ssn, firstName, lastName, dateOfBirth } = req.body;

    // This is a sensitive check - ensure proper authorization
    if (req.user.role !== 'admin' && req.user.role !== 'compliance_officer') {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions for SSA verification'
      });
    }

    const result = await proxyToMonayId('/auth/federal/ssa-dmf', {
      ssn,
      firstName,
      lastName,
      dateOfBirth,
      requestedBy: req.user.id,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      verified: result.verified,
      status: result.status // 'alive', 'deceased', 'unknown'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/e-verify
 * @desc E-Verify Employment Authorization via Monay-ID
 * @access Private
 */
router.post('/federal/e-verify', authenticate, async (req, res, next) => {
  try {
    const { employeeInfo, employerId } = req.body;
    const userId = req.user.id;

    const result = await proxyToMonayId('/auth/federal/e-verify', {
      employeeInfo,
      employerId,
      requestedBy: userId,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      caseNumber: result.caseNumber,
      workAuthorized: result.workAuthorized,
      caseStatus: result.caseStatus
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/tsa-precheck
 * @desc TSA PreCheck verification via Monay-ID
 * @access Private
 */
router.post('/federal/tsa-precheck', authenticate, async (req, res, next) => {
  try {
    const { ktn } = req.body; // Known Traveler Number
    const userId = req.user.id;

    const result = await proxyToMonayId('/auth/federal/tsa-precheck', {
      ktn,
      userId,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      verified: result.verified,
      expirationDate: result.expirationDate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/federal/callback
 * @desc Handle OAuth callbacks from federal providers via Monay-ID
 * @access Public
 */
router.get('/federal/callback', async (req, res) => {
  try {
    const { code, state, provider } = req.query;

    const result = await proxyToMonayId('/auth/federal/callback', {
      code,
      state,
      provider,
      clientId: process.env.CLIENT_ID
    });

    // Redirect to the application with the result
    const returnUrl = result.returnUrl || '/';
    const params = new URLSearchParams({
      verified: result.verified,
      provider: provider,
      sessionId: result.sessionId
    });

    res.redirect(`${returnUrl}?${params.toString()}`);
  } catch (error) {
    res.redirect('/login?error=verification_failed');
  }
});

/**
 * @route POST /api/auth/federal/verify-session
 * @desc Verify a federal authentication session via Monay-ID
 * @access Public
 */
router.post('/federal/verify-session', async (req, res, next) => {
  try {
    const { sessionId, provider } = req.body;

    const result = await proxyToMonayId('/auth/federal/verify-session', {
      sessionId,
      provider,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      verified: result.verified,
      userData: result.userData,
      claims: result.claims
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/federal/mfa
 * @desc Multi-factor authentication via Monay-ID
 * @access Private
 */
router.post('/federal/mfa', authenticate, async (req, res, next) => {
  try {
    const { method, code } = req.body;
    const userId = req.user.id;

    const result = await proxyToMonayId('/auth/mfa', {
      userId,
      method,
      code,
      clientId: process.env.CLIENT_ID
    });

    res.status(HttpStatus.OK).json({
      success: true,
      verified: result.verified,
      nextStep: result.nextStep
    });
  } catch (error) {
    next(error);
  }
});

export default router;