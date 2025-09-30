import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const {
  notificationController,
} = controllers;

const { authMiddleware } = middlewares;

router.post(
  '/test-notification',
  authMiddleware,
  notificationController.sendTestPushNotification,
);
router.get(
  '/user/notification',
  authMiddleware,
  notificationController.getNotificationList,
);
router.get(
  '/admin/notification',
  authMiddleware,
  notificationController.getAdminNotificationList
);
router.put(
  '/notification/status',
  authMiddleware,
  notificationController.updateNotification
);



export default router;
