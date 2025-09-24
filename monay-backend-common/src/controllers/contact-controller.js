import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';

const { contactRepository } = repositories;

export default {
  /**
   * Check the existing contact in system
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkContactsInSystem(req, res, next) {
    try {
      const result = await contactRepository.checkContactsInSystem(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'EXISTING_CONTACTS')
      });
    } catch (error) {
      next(error);
    }
  },
}