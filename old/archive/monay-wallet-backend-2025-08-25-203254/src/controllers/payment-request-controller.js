import config from '../config';
import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility';

const { paymentRequestRepository, transactionRepository } = repositories;

export default {

  /**
   * Save user payment request
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async savePaymentRequest(req, res, next) {
    try {
      const result = await paymentRequestRepository.savePaymentRequest(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'NEW_PAYMENT_REQUEST')
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
  * Get user payment rquest list
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async getMyRequest(req, res, next) {
    try {
      const result = await paymentRequestRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: utility.getMessage(req, false, (result.count) ? 'MY_REQUEST' : 'MY_REQUEST_NOT_FOUND'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * decline user payment request
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async declinePaymentRequest(req, res, next) {
    try {
      const result = await paymentRequestRepository.declinePaymentRequest(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'PAYMENT_REQUEST_DECLINED')
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
   * Get user payment request list for admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async paymentRequestList(req, res, next) {
    try {
      let result = await paymentRequestRepository.paymentRequestList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
          currencySymbol: (config.region.currencySymbol) ? config.region.currencySymbol : ''
        },
        message: utility.getMessage(req, false, (result.count <= 0) ? 'PAYMENT_REQUEST_NOT_FOUND' : ''),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
 * Get received user payment rquest list
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async userPaymentRequestList(req, res, next) {
    try {
      const result = await paymentRequestRepository.userPaymentRequestList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: utility.getMessage(req, false, (result.count) ? '' : 'MY_REQUEST_NOT_FOUND'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * pay user payment request
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async payRequestMoney(req, res, next) {
    try {
      const result = await transactionRepository.payRequestMoney(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'NEW_PAYMENT_REQUEST')
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
