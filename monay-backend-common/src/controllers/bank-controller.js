import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility';

const { bankRepository } = repositories;

export default {
  /**
   * Save bank account
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveBankRequest(req, res, next) {
    try {
      const result = await bankRepository.saveBankRequest(req);
      if (result) {
        let message = utility.getMessage(req, false, 'NEW_BANK_ADDED');
        if (result.status == 'invalid') {
          let apiResponse = JSON.parse(result.apiResponse);
          if (apiResponse && typeof apiResponse === "object") {
            message = apiResponse.message;
          } else {
            message = utility.getMessage(req, false, 'TRY_AGAIN');
          }
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: message
          });
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            data: result,
            message: message
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'BANK_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * get bank account detail 
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getSpecificBank(req, res, next) {
    res.status(HttpStatus.OK).json({
      success: true,
      data: req.bank,
      message: utility.getMessage(req, false, 'BANK_FOUND')
    });
  },
  /**
   * get user bank account list by user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserBanks(req, res, next) {
    try {
      const result = await bankRepository.findAll({ userId: req.user.id, status: 'active' });
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'USER_BANK_FOUND')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * delete user bank account by id
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async deleteSpecificBank(req, res, next) {
    try {
      const result = await bankRepository.deleteBank(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'USER_BANK_DELETED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'USER_BANK_NOT_DELETED')
        });
      }

    } catch (error) {
      next(error);
    }
  },
};
