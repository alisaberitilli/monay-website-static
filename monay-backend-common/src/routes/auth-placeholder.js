/**
 * Authentication Routes Placeholder
 * TODO: Proxy to Monay-ID service in production
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import authService from '../services/auth-placeholder.js';
import controllers from '../controllers/index.js';

const router = Router();

// List of personal email domains that are NOT allowed for enterprise/organizational users
const PERSONAL_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'aol.com', 'msn.com', 'icloud.com', 'live.com', 'me.com',
    'mail.com', 'protonmail.com', 'yandex.com', 'zoho.com'
];

// Helper function to check if email is a corporate/enterprise email
function isCorporateEmail(email) {
    if (!email || !email.includes('@')) return false;

    const domain = email.split('@')[1].toLowerCase();

    // Check if it's a personal email domain
    if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
        return false;
    }

    // If not in personal list, consider it corporate
    return true;
}

const { accountController } = controllers;

/**
 * Login Endpoint - Redirects to Primary Auth Endpoint
 * This endpoint exists for backward compatibility and uses same logic as /api/auth/login
 */
router.post('/login', async (req, res, next) => {
    // Debug logging
    console.log('=== /api/login received ===');
    console.log('Email:', req.body?.email);
    console.log('Password provided:', req.body?.password ? 'Yes' : 'No');

    // If body is empty, return error immediately
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('ERROR: Empty request body!');
        return res.status(400).json({
            success: false,
            error: 'Empty request body - no email or password provided',
            debug: {
                contentType: req.headers['content-type'],
                contentLength: req.headers['content-length'],
                bodyKeys: Object.keys(req.body || {})
            }
        });
    }

    // Check if this is an email-based login (admin or enterprise)
    const isEmailLogin = req.body.email && req.body.email.includes('@');

    if (isEmailLogin) {
        const email = req.body.email.toLowerCase();

        // Check if it's a Monay platform admin
        const isMonayAdmin = email === 'admin@monay.com' || email.endsWith('@monay.com');

        // Check if it's a corporate/enterprise email
        const isCorporate = isCorporateEmail(email);

        if (isMonayAdmin || isCorporate) {
            // Admin or Enterprise login - route to admin login handler
            req.body.email = email;

            // Auto-detect deviceType
            if (!req.body.deviceType) {
                const userAgent = req.headers['user-agent'] || '';
                req.body.deviceType = userAgent.includes('Android') ? 'android' :
                                      userAgent.includes('iPhone') || userAgent.includes('iOS') ? 'ios' : 'web';
            }

            // Call the admin login handler directly (same as /api/auth/login)
            return accountController.login(req, res, next);
        }
    }

    // For consumer/personal users, fallback to mock (development only)
    try {
        const result = await authService.login(req.body.email, req.body.password || 'placeholder');

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'DEVELOPMENT MODE: Using placeholder authentication',
            data: result
        });
    } catch (error) {
        res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Mock Token Validation
 */
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const validation = await authService.validateToken(token);
    
    if (!validation.valid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: validation.message
      });
    }
    
    res.status(HttpStatus.OK).json({
      success: true,
      data: validation.user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mock Current User
 */
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = await authService.getCurrentUser(token);
    
    res.status(HttpStatus.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mock Logout
 */
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await authService.logout(token);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Federal Login Placeholder
 * TODO: Implement OAuth flow
 */
router.post('/federal/:provider', async (req, res, next) => {
  try {
    const { provider } = req.params;
    const result = await authService.federalLogin(provider);
    
    res.status(HttpStatus.NOT_IMPLEMENTED).json({
      success: false,
      message: result.message,
      note: 'Federal login integration pending'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * MFA Setup Placeholder
 * TODO: Implement actual MFA
 */
router.post('/mfa/setup', async (req, res, next) => {
  try {
    const { userId, method } = req.body;
    const result = await authService.setupMFA(userId, method);
    
    res.status(HttpStatus.OK).json({
      success: true,
      message: 'PLACEHOLDER: MFA setup mock response',
      data: result
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
    service: 'Authentication Placeholder',
    status: 'development',
    warning: 'This is a placeholder auth service. Integrate with Monay-ID for production.',
    features: {
      login: 'mock',
      federal: 'not_implemented',
      mfa: 'placeholder',
      biometric: 'not_implemented'
    },
    timestamp: new Date()
  });
});

export default router;