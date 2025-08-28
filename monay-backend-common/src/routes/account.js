import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { accountValidator } = validations;
const { accountController, userController } = controllers;
const { authMiddleware, validateMiddleware, accountMiddleware, userMiddleware, resourceAccessMiddleware } = middlewares;

router.post(
    '/admin/login',
    validateMiddleware({ schema: accountValidator.loginSchema }),
    accountController.login
);
router.post(
    '/send-otp',
    validateMiddleware({
        schema: accountValidator.sendOtpSchema,
    }),
    accountController.sendOtp
);
router.post(
    '/login',
    validateMiddleware({ schema: accountValidator.userAccountloginSchema }),
    accountController.userAccountLogin
);


router.post('/account/logout',
    authMiddleware,
    accountController.logout
);

router.post(
    '/account/change-password',
    authMiddleware,
    validateMiddleware({ schema: accountValidator.changePasswordSchema }),
    accountController.changePassword,
);

router.post(
    '/admin/forgot-password',
    validateMiddleware({ schema: accountValidator.adminForgotPasswordSchema }),
    accountController.adminForgotPassword,
);
router.post(
    '/admin/reset-password',
    validateMiddleware({
        schema: accountValidator.resetPasswordByTokenSchema,
    }),
    accountController.resetAdminPassword,
);
router.get(
    '/account/me',
    authMiddleware,
    (req, res, next) => {
        Object.assign(req.params, {
            userId: req.user.id,
            type: 'self'
        });
        next();
    },
    userMiddleware.checkUserExists,
    accountController.getUserDetail
);
router.put(
    '/admin/account/update-profile',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    validateMiddleware({ schema: accountValidator.adminProfileUpdateSchema }),
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
    accountController.updateProfile
);


router.post(
    '/user/signup',
    validateMiddleware({
        schema: accountValidator.signupSchema,
    }),
    accountMiddleware.checkEmailExists,
    accountMiddleware.checkUniquePhoneNumber,
    accountController.signup
);
router.post(
    '/merchant/signup',
    validateMiddleware({
        schema: accountValidator.merchantSignupSchema,
    }),
    accountMiddleware.checkEmailExists,
    accountController.merchantSignup
);
router.post(
    '/verify-otp',
    validateMiddleware({
        schema: accountValidator.verifyOtpSchema,
    }),
    accountMiddleware.checkExpireOtp,
    accountController.verifyOtp
);
router.post(
    '/verify-otp-only',
    validateMiddleware({
        schema: accountValidator.verifyOtpSchema,
    }),
    accountMiddleware.checkExpireOtp,
    accountController.verifyOtpOnly
);
router.post(
    '/resend/otp',
    validateMiddleware({
        schema: accountValidator.resendOtpSchema,
    }),
    (req, res, next) => {
        const { body } = req;
        Object.assign(req.body, {
            type: 'Verification Code',
        });
        next();
    },
    accountMiddleware.checkResendOtpTime,
    accountController.resendVerificationCode
);

router.post(
    '/forgot-password',
    validateMiddleware({
        schema: accountValidator.resendOtpSchema,
    }),
    (req, res, next) => {
        const { body } = req;
        Object.assign(req.body, {
            type: 'Forgot Password',
        });
        next();
    },
    accountMiddleware.checkResendOtpTime,
    accountController.resendVerificationCode
);
router.post(
    '/reset-password',
    validateMiddleware({
        schema: accountValidator.resetPasswordSchema,
    }),
    accountMiddleware.checkPhoneNumberExists,
    accountMiddleware.checkExpireOtp,
    accountController.resetPassword
);
router.post(
    '/send/email-verification-code',
    authMiddleware,
    accountController.sendEmailVerificationCode,
);

router.post(
    '/send-primary-otp',
    authMiddleware,
    validateMiddleware({
        schema: accountValidator.sendOtpSchema,
    }),
    accountMiddleware.checkOwnPhone,
    accountController.sendOtpPrimaryUser
);

router.post(
    '/verify-primary-otp',
    authMiddleware,
    validateMiddleware({
        schema: accountValidator.verifyOtpSchema,
    }),
    accountMiddleware.checkPhoneNumberExists,
    accountController.verifyPrimaryOtp
);
router.get(
    '/user-scan/:id',
    authMiddleware,
    accountMiddleware.checkQrScanDetailsExists,
    accountMiddleware.checkOwnPhone,
    userMiddleware.checkPrimaryUserExists,
    userMiddleware.checkSecondaryExist,
    accountController.verifySecondaryUser
);


export default router;
