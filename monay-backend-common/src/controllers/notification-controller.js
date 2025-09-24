import HttpStatus from 'http-status';
import repositories from '../repositories';
import notification from '../services/notification.js';
import utility from '../services/utility.js';

const { notificationRepository, userRepository } = repositories;

export default {

  /**
   * Send test push notification
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async sendTestPushNotification(req, res, next) {
    try {
      const { device_id, ...payload } = req.body;
      const result = await notification.sendTestNotification(device_id, payload);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * notification list by user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getNotificationList(req, res, next) {
    try {
      const result = await notificationRepository.getNotificationList(req);
      const unReadCount = await userRepository.getUserNotificationCount(req.user.id);
      res.status(HttpStatus.OK).json({
        success: true,
        data: { ...result, unReadCount },
        message: utility.getMessage(req, false, 'NOTIFICATION_NOT_FOUND')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * admin notification list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getAdminNotificationList(req, res, next) {
    try {
      const result = await notificationRepository.getAdminNotificationList(req);
      const unReadCount = await userRepository.getUserNotificationCount(req.user.id);
      res.status(HttpStatus.OK).json({
        success: true,
        data: { ...result, unReadCount },
        message: utility.getMessage(req, false, 'NOTIFICATION_NOT_FOUND')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Update notification status
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateNotification(req, res, next) {
    try {
      const result = await notificationRepository.update(req.user.id);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'UPDATE_NOTIFICATION')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
