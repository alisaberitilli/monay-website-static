import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const { blockUserValidator } = validations;
const { userBlockController } = controllers;
const { authMiddleware, validateMiddleware, userMiddleware } = middlewares;

router.post(
  '/user/block',
  authMiddleware,
  validateMiddleware({
    schema: blockUserValidator.blockUserSchema,
  }),
  (req, res, next) => {
    if (req.body.blockUserId) {
      Object.assign(req.params, {
        userId: req.body.blockUserId,
      });
    }
    next();
  },
  userMiddleware.checkUserExists,
  userBlockController.blockUnblockUser,
);
router.get(
  '/user/block',
  authMiddleware,
  userBlockController.getBlockUser,
);

export default router;
