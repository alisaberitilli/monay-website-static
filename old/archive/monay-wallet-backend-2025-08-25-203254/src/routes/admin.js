import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

const router = Router();

const { adminController } = controllers;
const { authMiddleware, resourceAccessMiddleware } = middlewares;

router.get(
  '/admin/dashboard',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  adminController.getDashboardDetail
);
router.get(
  '/admin/dashboard/donut/graph',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  adminController.getDashboardGraph
);
router.get(
  '/admin/dashboard/line/graph',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  adminController.getDashboardLineGraph
);

export default router;
