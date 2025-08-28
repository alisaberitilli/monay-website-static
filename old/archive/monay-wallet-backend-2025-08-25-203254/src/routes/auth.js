import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';
import validations from '../validations';

const router = Router();
const { accountController } = controllers;
const { accountValidator } = validations;
const { validateMiddleware, authMiddleware } = middlewares;

// Auth wrapper endpoints to match frontend expectations

// POST /api/auth/login - wrapper for existing /api/login
router.post(
    '/auth/login',
    async (req, res, next) => {
        // Transform frontend request to match backend expectations
        // Frontend sends: { phoneNumber: '+15551234567', password: 'demo123' }
        // Backend expects: { username: '+15551234567', password: 'demo123', deviceType: 'ios/android' }
        
        
        if (req.body.phoneNumber) {
            // Use phone number directly as username
            let phoneNumber = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
            
            // Ensure phone number starts with + for international format
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber; // Default to US if no country code
            }
            
            req.body.username = phoneNumber;
            // phoneCountryCode not used anymore
            delete req.body.phoneNumber;
        } else if (req.body.email) {
            // If email is provided instead
            req.body.username = req.body.email.toLowerCase();
            // phoneCountryCode not used anymore
            delete req.body.email;
        }
        
        // Auto-detect deviceType based on request source
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'android';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'ios';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'web';
            }
        }
        
        // Add device headers for web login (required for user_devices table)
        if (!req.headers['device-id']) {
            req.headers['device-id'] = 'web-browser-' + Date.now();
        }
        if (!req.headers['device-model']) {
            req.headers['device-model'] = 'Web Browser';
        }
        if (!req.headers['app-version']) {
            req.headers['app-version'] = '1.0.0';
        }
        if (!req.headers['os-version']) {
            req.headers['os-version'] = 'Web';
        }
        
        next();
    },
    validateMiddleware({ schema: accountValidator.userAccountloginSchema }),
    accountController.userAccountLogin
);

// GET /api/auth/me - Get current user info (matching frontend expectation)
router.get(
    '/auth/me',
    authMiddleware,
    (req, res) => {
        res.json({
            success: true,
            data: req.user,
            message: 'User data retrieved successfully'
        });
    }
);

// GET /api/auth/user - Get current user info (alias)
router.get(
    '/auth/user',
    authMiddleware,
    (req, res) => {
        res.json({
            success: true,
            data: {
                user: req.user,
                token: req.headers.authorization?.replace('Bearer ', '')
            },
            message: 'User data retrieved successfully'
        });
    }
);

// POST /api/auth/logout
router.post(
    '/auth/logout',
    authMiddleware,
    accountController.logout
);

// POST /api/auth/signup - wrapper for registration (matching frontend expectation)
router.post(
    '/auth/signup',
    async (req, res, next) => {
        // Transform frontend registration data to match backend
        if (req.body.phoneNumber) {
            // Use phone number directly
            let phoneNumber = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
            
            // Ensure phone number starts with + for international format
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber; // Default to US if no country code
            }
            
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            delete req.body.phoneNumber;
        }
        
        // Keep firstName and lastName as-is since validation schema expects them
        // Don't transform these fields for signup
        
        if (req.body.fullName) {
            req.body.full_name = req.body.fullName;
            delete req.body.fullName;
        }
        
        // Auto-detect deviceType based on request source
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'android';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'ios';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'web';
            }
        }
        
        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/register - wrapper for registration (alias)
router.post(
    '/auth/register',
    async (req, res, next) => {
        // Transform frontend registration data to match backend
        if (req.body.mobileNumber) {
            // Use phone number directly (keep full international format)
            let phoneNumber = req.body.mobileNumber.replace(/[\s\-\(\)]/g, '');
            
            // Ensure phone number starts with + for international format
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber; // Default to US if no country code
            }
            
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            req.body.phone_number_country_code = ''; // Not used anymore
            delete req.body.mobileNumber;
        }
        
        if (req.body.firstName) {
            req.body.first_name = req.body.firstName;
            delete req.body.firstName;
        }
        
        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            delete req.body.lastName;
        }
        
        // Auto-detect deviceType based on request source
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'android';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'ios';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'web';
            }
        }
        
        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

export default router;