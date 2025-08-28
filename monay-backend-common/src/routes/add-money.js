import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { addMoneyValidator } = validations;
const { addMoneyController } = controllers;
const { authMiddleware, validateMiddleware, userMiddleware, paymentRequestMiddleware } = middlewares;

router.post(
  '/user/add-money/card',
  authMiddleware,
  validateMiddleware({
    schema: addMoneyValidator.addMoneyByCardSchema,
  }),
  userMiddleware.checkUserMpin,
  (req, res, next) => {
    Object.assign(req.body, {
      paymentMethod: 'card',
      transactionType: 'credit',
      checkActionType: 'deposit'
    });
    next();
  },
  paymentRequestMiddleware.checkKycLimit,
  paymentRequestMiddleware.checkPaymentMethod,
  addMoneyController.addMoneyFromCard
);

router.post(
  '/user/add-money/bank',
  authMiddleware,
  validateMiddleware({
    schema: addMoneyValidator.addMoneyByBankSchema,
  }),
  userMiddleware.checkUserMpin,
  (req, res, next) => {
    Object.assign(req.body, {
      paymentMethod: 'account',
      transactionType: 'credit',
      checkActionType: 'deposit'
    });
    next();
  },
  paymentRequestMiddleware.checkKycLimit,
  paymentRequestMiddleware.checkPaymentMethod,
  addMoneyController.addMoneyFromBank
);

export default router;