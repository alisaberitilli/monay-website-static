import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const { cardRequestValidator } = validations;
const { cardController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware, cardMiddleware } = middlewares;

router.get(
  '/user/cards',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  cardController.getUserCards
);

router.get(
  '/user/card/:cardId',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  cardMiddleware.checkCardIdExists,
  cardController.getSpecificCard
);

router.post(
  '/user/card',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  validateMiddleware({
    schema: cardRequestValidator.createRequestSchema,
  }),
  cardController.saveCardRequest
);

// New endpoint for issuing cards with wallet association
router.post(
  '/cards/issue',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant', 'admin']),
  cardController.issueCard
);

router.delete(
  '/user/card/:cardId',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  cardMiddleware.checkCardIdExists,
  cardController.deleteSpecificCard
);

export default router;
