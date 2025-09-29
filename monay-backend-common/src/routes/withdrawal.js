import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const { withdrawalValidator } = validations;
const { withdrawalController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware, userMiddleware, withdrawalMiddleware } = middlewares;

router.post(
  '/user/withdrawal-money',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  validateMiddleware({
    schema: withdrawalValidator.withdrawalMoneyToBankSchema,
  }),
  userMiddleware.checkUserExistsOnly,
  userMiddleware.checkUserMpin,
  withdrawalMiddleware.checkBankExists,
  withdrawalMiddleware.checkWalletBalance,
  withdrawalController.transferMoneyToBank
);

router.get('/user/withdrawal-history',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  userMiddleware.checkUserExists,
  withdrawalController.UserWithdrawalList
);

router.put(
  '/admin/withdrawal/:transactionId/change-status',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: withdrawalValidator.changeStatusSchema,
  }),
  withdrawalMiddleware.checkTransactionExists,
  withdrawalController.changeStatus
);

export default router;