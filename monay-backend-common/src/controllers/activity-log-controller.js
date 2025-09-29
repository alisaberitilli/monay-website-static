import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
const { activityLogRepository } = repositories;

export default {
  /**
   * Get activity log list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getActivityLogList(req, res, next) {
    try {
      let result = await activityLogRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

};
