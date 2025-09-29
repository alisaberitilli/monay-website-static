import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';

const { transactionRepository } = repositories;

export default {
  /**
   * pay money to user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async payMoney(req, res, next) {
    try {
      const result = await transactionRepository.payMoney(req);
      if (result) {
        let message = utility.getMessage(req, false, 'PAY_MONEY');
        if (result.status == 'failed') {
          message = utility.getMessage(req, false, 'PAY_MONEY_FAILED');
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

}