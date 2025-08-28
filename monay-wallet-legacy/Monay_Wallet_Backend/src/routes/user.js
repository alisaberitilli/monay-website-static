import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';
import validations from '../validations';

const router = Router();
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

router.post(
  '/user/update/phone-number',
  authMiddleware,
  validateMiddleware({
    schema: userValidator.checkUserPhoneNumberSchema,
  }),
  accountMiddleware.checkChangeExpireOtp,
  userController.changePhoneNumber
);
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
  resourceAccessMiddleware(['admin', 'subadmin', 'user', 'secondaryUser']),
  userController.allSecondaryUser
);

router.get('/secondary-user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'user', 'secondaryUser']),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondaryUser'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  userController.secondaryUserDetails
);

router.get('/parent-user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'user', 'secondaryUser']),
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
  resourceAccessMiddleware(['admin', 'subadmin', 'user']),
  validateMiddleware({
    schema: userValidator.changeStatusSchema,
  }),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondaryUser'
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
  resourceAccessMiddleware(['admin', 'subadmin', 'user']),
  validateMiddleware({
    schema: userValidator.changeLimitSchema,
  }),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondaryUser'
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
  resourceAccessMiddleware(['admin', 'subadmin', 'user', 'secondaryUser']),
  (req, res, next) => {
    Object.assign(req.params, {
      type: 'secondaryUser'
    });
    next();
  },
  userMiddleware.checkSecondaryUserExists,
  userController.secondaryUserDelete
);

router.get('/parent-user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin', 'user', 'secondaryUser']),
  (req, res, next) => {
    Object.assign(req.query, {
      type: 'secondaryUser'
    });
    next();
  },
  userController.allSecondaryUser
);

 router.put('/user/wallet-limit',
 authMiddleware,
 resourceAccessMiddleware(['user']),
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
export default router;
