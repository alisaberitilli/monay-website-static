import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';

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
