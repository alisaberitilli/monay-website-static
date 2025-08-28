import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

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
