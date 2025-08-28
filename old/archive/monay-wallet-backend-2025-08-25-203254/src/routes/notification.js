import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

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
