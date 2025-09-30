import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const { bankValidator } = validations;
const { bankController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware, bankMiddleware } = middlewares;

router.get(
  '/user/banks',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  bankController.getUserBanks,
);

router.get(
  '/user/bank/:bankId',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  bankMiddleware.checkBankIdExists,
  bankController.getSpecificBank,
);

router.post(
  '/user/bank',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  validateMiddleware({
    schema: bankValidator.createRequestSchema,
  }),
  bankController.saveBankRequest,
);

router.delete(
  '/user/bank/:bankId',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  bankMiddleware.checkBankIdExists,
  bankController.deleteSpecificBank
);

export default router;
