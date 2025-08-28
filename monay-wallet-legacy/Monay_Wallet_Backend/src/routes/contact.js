import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { contactValidator } = validations;
const { contactController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware } = middlewares;

router.post(
  '/contact/sync',
  authMiddleware,
  resourceAccessMiddleware(['user', 'merchant']),
  validateMiddleware({
    schema: contactValidator.contactSchema,
  }),
  contactController.checkContactsInSystem
);

export default router;