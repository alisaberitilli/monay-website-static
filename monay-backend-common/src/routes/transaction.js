import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();

const { transactionController } = controllers;
const { authMiddleware, resourceAccessMiddleware } = middlewares;

router.get('/admin/transaction',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  transactionController.getTransactionList
);

router.get('/user/transaction',
  authMiddleware,
  transactionController.UserTransactionList
);

router.get('/user/transaction/:id',
  authMiddleware,
  transactionController.getTransactionDetail
);


export default router;
