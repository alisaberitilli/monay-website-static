import HttpStatus from 'http-status';
import repositories from '../repositories';
import notificationRepository from '../repositories/notification-repository';
import utility from '../services/utility.js';

const { transactionRepository,userRepository } = repositories;

export default {
  /**
  * Add money from user Card
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async addMoneyFromCard(req, res, next) {
    try {
      let userId = req.user.id;
      let inTime = await userRepository.getCurrentDateTiem(req);
      const result = await transactionRepository.addMoneyFromCard(req);
      if (result) {
        let outTime = await userRepository.getCurrentDateTiem(req);
        
        let message = utility.getMessage(req, false, 'MONEY_ADDED_SUCCESSFULLY');
        if (result.status == 'success') {
          await notificationRepository.addMoneyFromCard(req);
        }
        if (result.status == 'failed') {
          message = utility.getMessage(req, false, 'MONEY_ADDED_FAILED');
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
        });
      } else {
        let errorTime = await userRepository.getCurrentDateTiem(req);
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

  /**
  * Add money from user bank
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async addMoneyFromBank(req, res, next) {
    try {
      const result = await transactionRepository.addMoneyFromBank(req);
      if (result) {
        let message = utility.getMessage(req, false, 'MONEY_ADDED_SUCCESSFULLY');
        if (result.status == 'success') {
          await notificationRepository.addMoneyFromCard(req);
        }
        if (result.status == 'failed') {
          message = utility.getMessage(req, false, 'MONEY_ADDED_FAILED');
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
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
