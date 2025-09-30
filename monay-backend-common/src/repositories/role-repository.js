import models from '../models/index.js';
import utility from '../services/utility.js';
const { Op } = models.Sequelize;
const { Sequelize } = models.sequelize;
export default {

  /**
   * Get Role Permission
   * @param {Object} req
   */
  async getRolePermission(req) {
    try {
      const queryData = req.query;
      const sortFields = ['id', 'role', 'createdAt', 'updatedAt'];
      let orderBy = [['role', 'ASC']];
      const dateFormat = 'YYYY-MM-DD HH:mm:ss';
      const headerValues = req.headers;
      let where = {};

      if (queryData.sortBy && queryData.sortType && sortFields.includes(queryData.sortBy)) {
        orderBy = [[queryData.sortBy, queryData.sortType]];
      }

      if (queryData.role) {
        where.role = { [Op.like]: `%${queryData.role}%` };
      }

      if (queryData.fromDate && queryData.toDate && headerValues.timezone) {
        let fromDate = `${queryData.fromDate} 00:00:00`;
        let toDate = `${queryData.toDate} 23:59:59`;
        fromDate = utility.getUTCDateTimeFromTimezone(fromDate, headerValues.timezone, dateFormat);
        toDate = utility.getUTCDateTimeFromTimezone(toDate, headerValues.timezone, dateFormat);
        where.createdAt = { [Op.gte]: fromDate, [Op.lte]: toDate };
      }
      let searchCritarea = {
        where,
        order: orderBy
      };
      let listType = queryData.listType || null;
      if (listType != 'all') {
        orderBy = [['createdAt', 'DESC']];
        searchCritarea.limit = parseInt(queryData.limit || 10);
        searchCritarea.offset = parseInt(queryData.offset || 0);
      }
      const result = await UserRole.findAndCountAll(searchCritarea);
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * get role detail
   * @param {Object} req
   */
  async getRoleDetail(req) {
    try {
      const paramData = req.params;
      const result = await UserRole.findOne({
        where: { id: paramData.roleId },
        include: [
          {
            model: RolePermission
          }
        ]
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Fine Role
   * @param {Object} req
   */
  async findUserRole(req) {
    try {
      const bodyData = req.body;
      let where = { role: bodyData.role }
      if (bodyData.roleId > 0) {
        where.id = { [Op.ne]: bodyData.roleId };
      }
      const result = await UserRole.findOne({
        where: where
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Create and update role permissions
   * @param {Object} req
   */
  async rolePermission(req) {
    try {
      let bodyData = req.body;
      let rolePermission = bodyData.rolePermission;
      let rolePermissionData = {};
      let role = '';
      if (bodyData.roleId > 0) {
        role = await UserRole.findOne({ where: { id: bodyData.roleId } });
        if (role) {
          await role.update({ role: bodyData.role });

          let userIdQuery = `select GROUP_CONCAT(id) as userIds from users where users.role_id=${bodyData.roleId}`
          let userIds = await models.sequelize.query(userIdQuery, {
            type: models.sequelize.QueryTypes.SELECT,
          });

          userIds = (userIds) ? userIds[0].userIds : null;
          if (userIds) {
            // Use raw query instead of UserToken model
            await models.sequelize.query(
              'UPDATE user_tokens SET token = NULL WHERE user_id IN (:userIds)',
              {
                replacements: { userIds: userIds.split(',') },
                type: models.QueryTypes.UPDATE
              }
            );
          }
        }
      } else {
        role = await UserRole.create({ role: bodyData.role });
      }
      if (role) {
        await RolePermission.destroy({ where: { roleId: role.id } });
        for (let index = 0; index < rolePermission.length; index++) {
          rolePermissionData = {
            moduleKey: rolePermission[index]['moduleKey'],
            permission: rolePermission[index]['permission'],
            roleId: role.id,
          };
          await RolePermission.findOrCreate({ where: rolePermissionData });
        }
      }
      return true;
    } catch (error) {
      throw Error(error);
    }
  },
};
