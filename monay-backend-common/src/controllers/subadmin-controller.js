import HttpStatus from 'http-status';
import utility from '../services/utility.js';
import repositories from '../repositories';
const { userRepository, activityLogRepository } = repositories;

export default {

  /**
   *create subadmin account
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async subadminSignup(req, res, next) {
    try {
      const { email } = req.body;
      const user = await userRepository.findOne({ email });
      if (user) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'EMAIL_EXIST')
        });
      } else if (!user) {
        // new user created with otp and sent to user
        await userRepository.createApprover(req);
        await activityLogRepository.saveActivityLog('add_subadmin', req);
        res.status(HttpStatus.OK).json({
          success: true,
          data: '',
          message: utility.getMessage(req, false, 'SUBADMIN_CREATED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
    *update subadmin details by super admin
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async updateSubadminSignup(req, res, next) {
    try {
      const { id } = req.body;
      const user = await userRepository.findOne({ id });
      if (user) {
        await userRepository.updateSubadmin(user, req);
        await activityLogRepository.saveActivityLog('edit_subadmin', req);
        res.status(HttpStatus.OK).json({
          success: true,
          data: null,
          message: utility.getMessage(req, false, 'PROFILE_UPDATED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
    *get subadmin list
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async getSubadminList(req, res, next) {
    try {
      const result = await userRepository.getSubadminList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count
        },
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

};
