import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

const router = Router();

const { activityLogController } = controllers;
const { authMiddleware, resourceAccessMiddleware } = middlewares;

router.get(
  '/admin/activity/log',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  activityLogController.getActivityLogList
);

export default router;
