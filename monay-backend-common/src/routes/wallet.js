import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

const router = Router();
const { walletController } = controllers;
const { authMiddleware } = middlewares;

router.get(
    '/user/wallet',
    authMiddleware,
    walletController.getMyWallet
);

export default router;
