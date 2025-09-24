import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';

const { transactionRepository, notificationRepository, activityLogRepository } = repositories;

export default {
  /**
  * Transfer wallet money into user bank
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async transferMoneyToBank(req, res, next) {
    try {
      const result = await transactionRepository.transferMoneyToBank(req);
      if (result) {
        let message = utility.getMessage(req, false, 'MONEY_TRANSFER_SUCCESSFULLY');
        if (result.status == 'failed') {
          message = utility.getMessage(req, false, 'MONEY_TRANSFER_FAILED');
        } else {
          await notificationRepository.withdrawalRequest(req, result);
          await notificationRepository.withdrawalUserRequest(req, result);
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
  /**
 * Get user all withdrawal list
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async UserWithdrawalList(req, res, next) {
    try {
      let result = await transactionRepository.UserWithdrawalList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: '',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * update withdrawl request status by admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changeStatus(req, res, next) {
    try {
      const transactionObj = req.transaction;
      const bodyData = req.body;
      let result = await transactionObj.update({ paymentStatus: bodyData.status });
      if (result) {
        if (bodyData.status == 'completed') {
          await notificationRepository.withdrawalRequestApproved(req, transactionObj)
        } else {
          await notificationRepository.withdrawalRequestRejected(req, transactionObj)
        }
        await activityLogRepository.saveActivityLog('change_transaction_status', req);
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'TRANSACTION_STATUS_UPDATED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'TRY_AGAIN')
        });
      }
    } catch (error) {
      next(error);
    }
  },

};
