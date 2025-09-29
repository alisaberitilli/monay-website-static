import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const { walletController } = controllers;
const { authMiddleware } = middlewares;

router.get(
    '/user/wallet',
    authMiddleware,
    walletController.getMyWallet
);

export default router;
