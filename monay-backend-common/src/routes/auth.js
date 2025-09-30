import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';
import validations from '../validations/index.js';

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

        // Check if this is an admin login (email-based)
        const isAdminEmail = req.body.email && (
            req.body.email === 'admin@monay.com' ||
            req.body.email.endsWith('@monay.com')
        );

        if (isAdminEmail) {
            // Admin login - route to admin login handler
            // Admin expects: { email, password, deviceType }
            req.body.email = req.body.email.toLowerCase();

            // Auto-detect deviceType
            if (!req.body.deviceType) {
                const userAgent = req.headers['user-agent'] || '';
                req.body.deviceType = userAgent.includes('Android') ? 'android' :
                                      userAgent.includes('iPhone') || userAgent.includes('iOS') ? 'ios' : 'web';
            }

            // Call the admin login handler directly
            return accountController.login(req, res, next);
        }

        // Regular user login flow
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
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'WEB';
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
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'WEB';
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
            // Keep firstName for validation
        }

        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            // Keep lastName for validation
        }

        // Auto-detect deviceType based on request source
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';

            if (userAgent.includes('Android')) {
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                // Web browser or unknown - use 'web'
                req.body.deviceType = 'WEB';
            }
        }

        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/register/consumer - Individual consumer registration
router.post(
    '/auth/register/consumer',
    async (req, res, next) => {
        // Mark as individual consumer - gets direct tenant relationship
        req.body.userType = 'individual';
        req.body.accountType = 'consumer';

        // Transform fields
        if (req.body.phoneNumber) {
            let phoneNumber = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber;
            }
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            delete req.body.phoneNumber;
        }

        if (req.body.firstName) {
            req.body.first_name = req.body.firstName;
            // Keep firstName for validation
        }

        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            // Keep lastName for validation
        }

        // Auto-detect deviceType
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                req.body.deviceType = 'WEB';
            }
        }

        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/register/business - Small business registration
router.post(
    '/auth/register/business',
    async (req, res, next) => {
        // Mark as business user - creates organization with tenant
        req.body.userType = 'business';
        req.body.accountType = 'small_business';

        // Business specific fields
        if (!req.body.businessName) {
            return res.status(400).json({
                success: false,
                error: 'Business name is required'
            });
        }

        req.body.organizationName = req.body.businessName;
        req.body.businessType = req.body.businessType || 'small_business';

        // Transform user fields
        if (req.body.phoneNumber) {
            let phoneNumber = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber;
            }
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            delete req.body.phoneNumber;
        }

        if (req.body.firstName) {
            req.body.first_name = req.body.firstName;
            // Keep firstName for validation
        }

        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            // Keep lastName for validation
        }

        // Auto-detect deviceType
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                req.body.deviceType = 'WEB';
            }
        }

        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/register/enterprise - Enterprise user joining existing organization
router.post(
    '/auth/register/enterprise',
    async (req, res, next) => {
        // Mark as enterprise user - joins existing organization
        req.body.userType = 'enterprise';
        req.body.accountType = 'enterprise';

        // Enterprise specific fields
        if (!req.body.organizationId && !req.body.inviteCode) {
            return res.status(400).json({
                success: false,
                error: 'Organization ID or invite code is required'
            });
        }

        // Transform user fields
        if (req.body.phoneNumber) {
            let phoneNumber = req.body.phoneNumber.replace(/[\s\-\(\)]/g, '');
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber;
            }
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            delete req.body.phoneNumber;
        }

        if (req.body.firstName) {
            req.body.first_name = req.body.firstName;
            // Keep firstName for validation
        }

        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            // Keep lastName for validation
        }

        // Auto-detect deviceType
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                req.body.deviceType = 'WEB';
            }
        }

        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/register/organization - Create new enterprise organization with owner
router.post(
    '/auth/register/organization',
    async (req, res, next) => {
        // Enterprise organization creation - creates tenant, organization, and user
        req.body.userType = 'enterprise';
        req.body.accountType = 'enterprise';
        req.body.createOrganization = true; // Flag to indicate we want to create a new org

        // Enterprise organization must have organizationName
        if (!req.body.organizationName) {
            return res.status(400).json({
                success: false,
                error: 'Organization name is required for enterprise registration'
            });
        }

        // Transform phone field
        if (req.body.phone_number || req.body.phoneNumber) {
            let phoneNumber = (req.body.phone_number || req.body.phoneNumber).replace(/[\s\-\(\)]/g, '');
            if (!phoneNumber.startsWith('+')) {
                phoneNumber = '+1' + phoneNumber;
            }
            req.body.phone_number = phoneNumber;
            req.body.mobile = phoneNumber;
            delete req.body.phoneNumber;
        }

        if (req.body.firstName) {
            req.body.first_name = req.body.firstName;
            // Keep firstName for validation
        }

        if (req.body.lastName) {
            req.body.last_name = req.body.lastName;
            // Keep lastName for validation
        }

        // Auto-detect deviceType
        if (!req.body.deviceType) {
            const userAgent = req.headers['user-agent'] || '';
            if (userAgent.includes('Android')) {
                req.body.deviceType = 'ANDROID';
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
                req.body.deviceType = 'IOS';
            } else {
                req.body.deviceType = 'WEB';
            }
        }

        next();
    },
    validateMiddleware({ schema: accountValidator.signupSchema }),
    accountController.signup
);

// POST /api/auth/login/organization - Organization-specific login for enterprise wallet access
router.post(
    '/auth/login/organization',
    async (req, res) => {
        try {
            const { email, password, organizationId } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            // Import models and other dependencies
            const { Pool } = await import('pg');
            const bcrypt = await import('bcrypt');
            const jwt = await import('jsonwebtoken');

            const pool = new Pool({
                user: process.env.DB_USER || 'alisaberi',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'monay',
                password: process.env.DB_PASSWORD || '',
                port: process.env.DB_PORT || 5432,
            });

            // Find user by email
            const userQuery = `
                SELECT u.*, ou.organization_id, ou.role as org_role, ou.permissions as org_permissions,
                       o.name as org_name, o.wallet_type, o.feature_tier, o.tenant_id,
                       t.tenant_code, t.name as tenant_name, t.type as tenant_type
                FROM users u
                LEFT JOIN organization_users ou ON u.id = ou.user_id
                LEFT JOIN organizations o ON ou.organization_id = o.id
                LEFT JOIN tenants t ON o.tenant_id = t.id
                WHERE u.email = $1 AND u.is_active = true
                ${organizationId ? 'AND ou.organization_id = $2' : ''}
                ORDER BY ou.created_at DESC
                LIMIT 1
            `;

            const params = organizationId ? [email.toLowerCase(), organizationId] : [email.toLowerCase()];
            const userResult = await pool.query(userQuery, params);

            if (userResult.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials or user not found in organization'
                });
            }

            const user = userResult.rows[0];

            // Verify password
            const isValidPassword = await bcrypt.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // Check if user belongs to an organization
            if (!user.organization_id) {
                return res.status(403).json({
                    success: false,
                    error: 'User not associated with any organization'
                });
            }

            // Generate JWT token with organization context
            const tokenPayload = {
                id: user.id,
                user_id: user.id,
                email: user.email,
                username: user.username || user.email,
                organization_id: user.organization_id,
                tenant_id: user.tenant_id,
                role: user.org_role || 'member',
                permissions: user.org_permissions || {},
                organization: {
                    id: user.organization_id,
                    name: user.org_name,
                    wallet_type: user.wallet_type,
                    feature_tier: user.feature_tier
                },
                tenant: {
                    id: user.tenant_id,
                    code: user.tenant_code,
                    name: user.tenant_name,
                    type: user.tenant_type
                },
                userType: 'organization',
                loginType: 'enterprise_wallet'
            };

            const token = jwt.default.sign(
                tokenPayload,
                process.env.JWT_SECRET || 'monay-secret-key-2025',
                { expiresIn: '24h' }
            );

            // Update user's current tenant context if they have multiple tenants
            await pool.query(
                'UPDATE users SET current_tenant_id = $1, updated_at = NOW() WHERE id = $2',
                [user.tenant_id, user.id]
            );

            // Log successful login
            console.log(`Organization user login: ${user.email} -> Organization: ${user.org_name} (${user.organization_id})`);

            res.json({
                success: true,
                message: 'Organization login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username || user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        role: user.org_role,
                        permissions: user.org_permissions
                    },
                    organization: {
                        id: user.organization_id,
                        name: user.org_name,
                        wallet_type: user.wallet_type,
                        feature_tier: user.feature_tier
                    },
                    tenant: {
                        id: user.tenant_id,
                        code: user.tenant_code,
                        name: user.tenant_name,
                        type: user.tenant_type
                    },
                    enterprise_wallet_access: true
                }
            });

        } catch (error) {
            console.error('Organization login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during organization login',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// POST /api/verify-email - Simple email verification for testing
router.post('/verify-email', async (req, res) => {
  try {
    const { otp } = req.body;

    // For testing purposes, accept the demo code
    if (otp === '123456') {
      return res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          verified: true
        }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid verification code'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

// POST /api/resend-otp - Simple resend for testing
router.post('/resend-otp', async (req, res) => {
  try {
    // For testing purposes, just return success
    res.json({
      success: true,
      message: 'Verification code resent (demo)',
      data: {
        demo: true,
        code: '123456'
      }
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification code'
    });
  }
});

// POST /api/setup-mpin - Simple MPIN setup for testing
router.post('/setup-mpin', async (req, res) => {
  try {
    const { mpin } = req.body;

    if (!mpin || mpin.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'MPIN must be 6 digits'
      });
    }

    // For testing purposes, accept any 6-digit MPIN
    res.json({
      success: true,
      message: 'MPIN setup successful',
      data: {
        mpin_set: true
      }
    });
  } catch (error) {
    console.error('Setup MPIN error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup MPIN'
    });
  }
});

// POST /api/submit-kyc - Simple KYC submission for testing
router.post('/submit-kyc', async (req, res) => {
  try {
    // For testing purposes, accept any KYC submission
    res.json({
      success: true,
      message: 'KYC verification submitted successfully',
      data: {
        kyc_submitted: true,
        status: 'pending_review'
      }
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit KYC'
    });
  }
});

export default router;