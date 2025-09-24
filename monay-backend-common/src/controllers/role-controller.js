import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';

const { roleRepository, activityLogRepository } = repositories;

export default {
  /**
   * Get user permissions according to role
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getRolePermission(req, res, next) {
    try {
      const result = await roleRepository.getRolePermission(req);
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
  /**
   * Get role detail by id
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getRoleDetail(req, res, next) {
    try {
      const role = req.role;
      res.status(HttpStatus.OK).json({
        success: true,
        data: role,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Create and Update role permissions
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async rolePermission(req, res, next) {
    try {
      let bodyData = req.body;
      let ressult = await roleRepository.rolePermission(req);
      if (ressult) {
        if (bodyData.roleId > 0) {
          await activityLogRepository.saveActivityLog('role_edit', req);
        } else {
          await activityLogRepository.saveActivityLog('role_created', req);
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: null,
          message: utility.getMessage(req, false, (bodyData.roleId > 0) ? 'ROLE_PERMISSION_UPDATE' : 'ROLE_PERMISSION_CREATE')
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
  }
};
