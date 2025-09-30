import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const { payMoneyValidator } = validations;
const { payMoneyController } = controllers;
const { authMiddleware, validateMiddleware, userMiddleware, paymentRequestMiddleware } = middlewares;

router.post(
  '/user/pay-money',
  authMiddleware,
  validateMiddleware({
    schema: payMoneyValidator.payMoneySchema,
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
  userMiddleware.checkUserExistsPayOnly,
  paymentRequestMiddleware.checkRequestedUser,
  paymentRequestMiddleware.checkSecondaryUser,
  paymentRequestMiddleware.checkKycLimit,
  paymentRequestMiddleware.checkPaymentMethod,
  payMoneyController.payMoney
);

export default router;