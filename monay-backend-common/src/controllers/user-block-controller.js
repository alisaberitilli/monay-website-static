import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';

const { userBlockRepository } = repositories;

export default {
  /**
   * Block and unblock user 
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async blockUnblockUser(req, res, next) {
    try {
      let message = '';
      const data = {
        userId: req.user.id,
        blockUserId: req.body.blockUserId
      }
      const result = await userBlockRepository.blockAndUnblockUser(data);
      if (result.status) {
        if (result.status == 'block') {
          message = utility.getMessage(req, false, 'BLOCK_USER');
        } else {
          message = utility.getMessage(req, false, 'UNBLOCK_USER');
        }
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: result.data || null,
        message: message
      });
    } catch (error) {
      next(error);
    }
  },
  /**
  * Block user list
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async getBlockUser(req, res, next) {
    try {
      const result = await userBlockRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: utility.getMessage(req, false, (result.count > 0) ? 'BLOCK_USER_LIST' : 'USER_NOT_FOUND')
      });
    } catch (error) {
      next(error);
    }
  }
};
