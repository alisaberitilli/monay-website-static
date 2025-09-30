import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';

const { bankRepository } = repositories;

export default {
  /**
   * Check bank id exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkBankIdExists(req, res, next) {
    try {
      let { bankId } = req.params
      let { id: userId } = req.user
      if (bankId) {
        const result = await bankRepository.findOne({ id: bankId, userId, status: 'active' });
        if (result) {
          req.bank = result
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'NOT_FOUND_BANK')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'NOT_FOUND_BANK')
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
