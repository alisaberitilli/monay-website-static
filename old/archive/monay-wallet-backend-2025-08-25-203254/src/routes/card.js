import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

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

router.delete(
  '/user/card/:cardId',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  cardMiddleware.checkCardIdExists,
  cardController.deleteSpecificCard
);

export default router;
