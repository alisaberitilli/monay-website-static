import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';

const { roleRepository } = repositories;

export default {

  /**
   * Check role exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkRoleExist(req, res, next) {
    try {
      const result = await roleRepository.findUserRole(req);
      if (!result) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ROLE_EXIST')
        });
      }

    } catch (error) {
      next(error);
    }
  },
  /**
  * Check role exists
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkRoleExistById(req, res, next) {
    try {
      const result = await roleRepository.getRoleDetail(req);
      if (result) {
        req.role = result;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ROLE_EXIST')
        });
      }

    } catch (error) {
      next(error);
    }
  },

};
