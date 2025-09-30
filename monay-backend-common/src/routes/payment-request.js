import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middleware-app/index.js';
// import { rateLimiterPayMiddleware } from '../middleware-app/rate-limiter-middleware.js';

const router = Router();
const { paymentRequestValidator } = validations;
const { paymentRequestController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware, userMiddleware, paymentRequestMiddleware, blockUserMiddleware } = middlewares;

router.post(
    '/user/payment/request',
    authMiddleware,
    validateMiddleware({
        schema: paymentRequestValidator.paymentRequestSchema,
    }),
    (req, res, next) => {
        const { body } = req;
        Object.assign(req.params, {
            userId: body.toUserId
        });
        next();
    },
    userMiddleware.checkUserExistsOnly,
    paymentRequestMiddleware.checkRequestedUser,
    userMiddleware.checkSelfParentExistsOnly,
    blockUserMiddleware.checkBlockUserExists,
    paymentRequestMiddleware.checkKycRequestLimit,
    // rateLimiterPayMiddleware,
    paymentRequestController.savePaymentRequest
);

router.post(
    '/user/payment/request/pay',
    authMiddleware,
    validateMiddleware({
        schema: paymentRequestValidator.payRequestMoneySchema,
    }),
    userMiddleware.checkUserMpin,
    (req, res, next) => {
        const { body } = req;
        Object.assign(req.params, {
            userId: body.toUserId
        });
        Object.assign(req.body, {
            transactionType: 'debit',
            checkActionType: 'transfer'
        });
        next();
    },
    
    paymentRequestMiddleware.checkPayPaymentRequest,
    userMiddleware.checkUserExistsOnly,
    paymentRequestMiddleware.checkRequestedUser,
    paymentRequestMiddleware.checkSecondaryUser,
    paymentRequestMiddleware.checkKycLimit,
    paymentRequestMiddleware.checkPaymentMethod,
    paymentRequestController.payRequestMoney
);

router.put(
    '/payment/request/decline',
    authMiddleware,
    validateMiddleware({
        schema: paymentRequestValidator.declineRequestSchema,
    }),
    paymentRequestMiddleware.checkPaymentRequest,
    paymentRequestController.declinePaymentRequest
);

router.get(
    '/user/my-request',
    authMiddleware,
    paymentRequestController.getMyRequest
);

router.get('/admin/payment/request',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    paymentRequestController.paymentRequestList
);
router.get('/user/payment/request/:type',
    authMiddleware,
    paymentRequestController.userPaymentRequestList
);


export default router;
