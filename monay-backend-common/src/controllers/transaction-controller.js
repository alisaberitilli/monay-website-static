import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';
import config from '../config/index.js';
const { transactionRepository } = repositories;

export default {
  /**
   * Get transaction list for admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getTransactionList(req, res, next) {
    try {
      let result = await transactionRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
          currencySymbol: (config.region.currencySymbol) ? config.region.currencySymbol : ''
        },
        message: utility.getMessage(req, false, (result.count <= 0) ? 'TRANSACTION_NOT_FOUND' : ''),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get user transaction list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async UserTransactionList(req, res, next) {
    try {
      let result = await transactionRepository.UserTransactionList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: utility.getMessage(req, false, (result.count <= 0) ? 'TRANSACTION_NOT_FOUND' : ''),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get transaction detail
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getTransactionDetail(req, res, next) {
    try {
      let result = await transactionRepository.findOne(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: '',
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRANSACTION_NOT_FOUND'),
        });
      }

    } catch (error) {
      next(error);
    }
  }
};
