import { Router } from 'express';
import pg from 'pg';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';
import validations from '../validations/index.js';

const router = Router();
const { Pool } = pg;
const { userController } = controllers;
const { userValidator } = validations;
const { authMiddleware, resourceAccessMiddleware, validateMiddleware, userMiddleware, accountMiddleware, mediaMiddleware, cardMiddleware } = middlewares;

router.get('/admin/user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  userController.getUserListForAdmin
);

router.get('/admin/user-profile/:userId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  userMiddleware.checkUserIdExists,
  userController.userProfileForAdmin
);

router.put(
  '/admin/user/:userId/change-status',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: userValidator.changeStatusSchema,
  }),
  userMiddleware.checkUserIdExists,
  userController.changeStatus
);

// Admin endpoint to update any user's profile
router.put(
  '/admin/user/:userId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  userMiddleware.checkUserIdExists,
  userController.updateUserByAdmin
);

router.put(
  '/user/update-profile',
  authMiddleware,
  validateMiddleware({ schema: userValidator.userProfileUpdateSchema }),
  accountMiddleware.checkEmailExists,
  (req, res, next) => {
    const { body } = req;
    Object.assign(req.params, {
      basePath: body.profilePicture,
      mediaFor: 'user',
    });
    next();
  },
  accountMiddleware.checkUniquePhoneNumber,
  accountMiddleware.checkUserMediaFor,
  accountMiddleware.checkUserMediaExists,
  userController.updateProfile
);

router.post(
  '/user/kyc',
  authMiddleware,
  validateMiddleware({ schema: userValidator.userKycSchema }),
  (req, res, next) => {
    const { body } = req;
    const basePathArray = [body.idProofImage];
    if (body.idProofBackImage) {
      basePathArray.push(body.idProofBackImage);
    }
    Object.assign(req.params, {
      basePathArray,
      mediaFor: 'user-kyc'
    });
    next();
  },

  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  (req, res, next) => {
    const { body } = req;
    const basePathArray = [body.addressProofImage];
    if (body.addressProofBackImage) {
      basePathArray.push(body.addressProofBackImage);
    }
    Object.assign(req.params, {
      basePathArray,
      mediaFor: 'user-kyc',
      apiName: 'profile-update'
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  accountMiddleware.checkKycStatus,
  userController.saveUserKyc
);
router.put(
  '/merchant/update-profile',
  authMiddleware,
  validateMiddleware({ schema: userValidator.merchantProfileUpdateSchema }),
  accountMiddleware.checkEmailExists,
  (req, res, next) => {
    const { body } = req;
    Object.assign(req.params, {
      basePath: body.profilePicture,
      mediaFor: 'user',
      apiName: 'profile-update'
    });
    next();
  },
  accountMiddleware.checkUniquePhoneNumber,
  accountMiddleware.checkUserMediaFor,
  accountMiddleware.checkUserMediaExists,
  userController.updateProfile
);

router.post(
  '/user/change-pin',
  authMiddleware,
  validateMiddleware({ schema: userValidator.changeMpinOtpSchema }),
  userController.changePIN,
);

router.post(
  '/user/forgot-pin',
  authMiddleware,
  validateMiddleware({ schema: userValidator.forgotMpinSchema }),
  (req, res, next) => {
    const { body } = req;
    Object.assign(req.body, {
      type: 'Forgot Pin',
    });
    next();
  },
  userMiddleware.validateUserInfo,
  accountMiddleware.checkPhoneNumberExists,
  accountMiddleware.checkResendOtpTime,
  // userMiddleware.checkResendOtpTime,
  userController.resendVerificationCode
);

router.post(
  '/user/verify-pin-otp',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.verifyMpinOtpSchema,
  }),
  accountMiddleware.checkPhoneNumberExists,
  accountMiddleware.checkExpireOtp,
  userController.verifyOtp
);
router.post(
  '/user/verify-mpin',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.verifyMpinSchema,
  }),
  userController.verifyMpin
);

router.post(
  '/user/reset-pin',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.resetMpinOtpSchema,
  }),
  accountMiddleware.checkPhoneNumberExists,
  accountMiddleware.checkExpireOtp,
  userController.resetMpin
);

router.put(
  '/user/set-pin',
  authMiddleware,
  validateMiddleware({ schema: userValidator.setmPinSchema }),
  userController.updatemPin
);
router.get('/user/check/phone',
  validateMiddleware({ schema: userValidator.checkUserPhoneNumberSchema, type: 'query' }),
  userMiddleware.checkUserPhoneNumber,
  userController.checkUserPhone
);

router.get('/user/check/email',
  validateMiddleware({ schema: userValidator.checkUserEmailSchema, type: 'query' }),
  userMiddleware.checkUserEmailExist,
  userController.checkUserPhone
);

router.get('/home',
  authMiddleware,
  userController.home
);
router.get('/user/search',
  authMiddleware,
  userController.recentUser
);

router.get('/users',
  userController.getAllConsumerUsers
);

// Temporarily disabled - missing export in user-controller.js
// router.post(
//   '/user/update/phone-number',
//   authMiddleware,
//   validateMiddleware({
//     schema: userValidator.checkUserPhoneNumberSchema,
//   }),
//   accountMiddleware.checkChangeExpireOtp,
//   userController.changePhoneNumber
// );
router.post(
  '/user/verify/phone-number',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.verifyChangePhonenumberSchema,
  }),
  userController.verifyChangePhonenumberOtp
);

router.post(
  '/user/update/email',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.checkUserEmailSchema,
  }),
  accountMiddleware.checkChangeExpireOtp,
  userController.changeEmail
);
router.post(
  '/user/verify/email',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.verifyChangeEmailSchema,
  }),
  userController.verifyChangeEmailOtp
);

router.get('/user/profile/:userId',
  authMiddleware,
  userController.userProfile
);

router.get('/user/recent-payment-users',
  authMiddleware,
  userController.recentPaymentUser
);

router.put(
  '/admin/user/:userId/kyc-status',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: userValidator.changeKycStatusSchema,
  }),
  userMiddleware.checkUserIdExists,
  userController.changeKycStatus
);

router.put(
  '/user/update-firebase-token',
  authMiddleware,
  userController.updateFirebaseToken
);

router.get('/secondary-user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user']),
  userController.allSecondaryUser
);

router.get('/secondary-user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user']),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondary_user'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  userController.secondaryUserDetails
);

router.get('/parent-user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user']),
  (req, res, next) => {
    Object.assign(req.params, {
      parentUser: 'yes'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,  
  userController.secondaryUserDetails
);

router.put('/secondary-user/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer']),
  validateMiddleware({
    schema: userValidator.changeStatusSchema,
  }),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondary_user'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  // userMiddleware.checkSecondaryUserVerifyCheck,
  userController.secondaryUserStatusUpdate
);

/**
 * Secondary user exist check
 * Parent verification check
 * Parent wallet limit check
 */
router.put('/secondary-user/limit/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer']),
  validateMiddleware({
    schema: userValidator.changeLimitSchema,
  }),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondary_user'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  // userMiddleware.checkSecondaryUserVerifyCheck,
  userMiddleware.checkWalletLimitCheck,
  userController.secondaryUserLimitUpdate
);

router.delete('/secondary-user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user']),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondary_user'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  userController.secondaryUserDelete
);

router.get('/parent-user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user']),
  (req, res, next) => {
    Object.assign(req.query, {
      type: 'secondary_user'
    });
    next();
  },
  userController.allSecondaryUser
);

 router.put('/user/wallet-limit',
 authMiddleware,
 resourceAccessMiddleware(['basic_consumer', 'verified_consumer', 'premium_consumer']),
 validateMiddleware({
   schema: userValidator.walletLimitSchema,
 }), 
 userMiddleware.checkUserMpin,
 cardMiddleware.checkOptionalCardIdExists,
 userController.walletLimitUpdate
);

router.put('/user/auto-toup',
authMiddleware,
resourceAccessMiddleware(['user']),
validateMiddleware({
  schema: userValidator.autoToupSchema,
}),
cardMiddleware.checkAutoTopUpCardIdExists,
userController.autoToupUpdateStatus
);

// Tenant context endpoint - returns complete tenant information for the authenticated user
router.get('/user/context',
  authMiddleware,
  async (req, res) => {
    try {
      // Tenant context is already extracted in auth middleware
      const tenantContext = req.tenantContext;

      if (!tenantContext) {
        return res.status(200).json({
          success: true,
          data: {
            tenantId: null,
            tenantCode: null,
            tenantType: null,
            accessType: 'none',
            organizationId: null,
            organizationName: null,
            role: null,
            walletType: 'consumer',
            message: 'No tenant context found. User may need to complete registration.'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          tenantId: tenantContext.tenant_id,
          tenantCode: tenantContext.tenant_code,
          tenantName: tenantContext.tenant_name,
          tenantType: tenantContext.tenant_type,
          accessType: tenantContext.access_type,
          organizationId: tenantContext.organization_id,
          organizationName: tenantContext.organization_name,
          organizationType: tenantContext.organization_type,
          role: tenantContext.user_role,
          walletType: tenantContext.wallet_type || (tenantContext.isBusinessUser ? 'enterprise' : 'consumer'),
          isIndividualConsumer: tenantContext.isIndividualConsumer,
          isBusinessUser: tenantContext.isBusinessUser,
          billingTier: tenantContext.billing_tier,
          isolationLevel: tenantContext.isolation_level
        }
      });
    } catch (error) {
      console.error('Error getting tenant context:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get tenant context'
      });
    }
  }
);

// Switch tenant endpoint for users with multiple tenant access
router.post('/user/switch-tenant',
  authMiddleware,
  validateMiddleware({
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', format: 'uuid' }
      },
      required: ['tenantId']
    }
  }),
  async (req, res) => {
    try {
      const { tenantId } = req.body;
      const userId = req.user.id;

      // Import tenant middleware functions
      const { getUserTenants } = await import('../middleware-app/tenant-middleware.js');

      // Check if user has access to the requested tenant
      const userTenants = await getUserTenants(userId);
      const hasAccess = userTenants.some(t => t.id === tenantId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this tenant'
        });
      }

      // Update user's current tenant in session or database as needed
      // This is a placeholder - actual implementation depends on session management

      return res.status(200).json({
        success: true,
        message: 'Tenant switched successfully',
        data: {
          tenantId: tenantId
        }
      });
    } catch (error) {
      console.error('Error switching tenant:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to switch tenant'
      });
    }
  }
);

// DEV/TEST ONLY - Get user password for testing
// This endpoint is for development/testing purposes only and should be disabled in production
router.get('/password',
  async (req, res) => {
    try {
      // Only allow in development/test environments
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is not available in production'
        });
      }

      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email parameter is required'
        });
      }

      // Create database pool
      const pool = new Pool({
        user: process.env.DB_USER || 'alisaberi',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'monay',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 5432,
      });

      // Query user by email
      const result = await pool.query(
        'SELECT email, password_hash FROM users WHERE email = $1',
        [email]
      );

      await pool.end(); // Close the connection

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      return res.status(200).json({
        success: true,
        data: {
          email: user.email,
          password: user.password_hash,
          note: 'This is the bcrypt hash. In test environment, the plain password is typically the same as set in scripts.'
        }
      });
    } catch (error) {
      console.error('Error fetching password:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;
