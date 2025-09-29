import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middlewares/index.js';

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