import HttpStatus from 'http-status';
import utility from '../services/utility';
import userBlockRepository from '../repositories/user-block-repository';

export default {

  /**
   * Check block user exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkBlockUserExists(req, res, next) {
    try {
      if (req.params.userId) {
        let data = {
          userId: req.params.userId,
          blockUserId: req.user.id
        }
        const result = await userBlockRepository.findBlockUser(data);
        if (result) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'BLOCKED_USER_EXIST')
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

};
