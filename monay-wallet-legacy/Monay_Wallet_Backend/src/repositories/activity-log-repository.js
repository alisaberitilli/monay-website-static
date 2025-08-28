import models from '../models';
import utility from '../services/utility';
import moment from 'moment-timezone';
import { Op } from 'sequelize';
const { Sequelize } = models.sequelize;
const requestIp = require('request-ip');
const { ActivityLog, User } = models;
const fromDateTime = ' 00:00:00';
const toDateTime = ' 23:59:59';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

export default {
  /**
     * Get all Transaction for admin
     * @param {Object} req
     */
  async findAll(req) {
    try {
      const queryData = req.query;
      const headerValues = req.headers;
      const sortFields = ['id', 'activityType', 'phoneNumber', 'ip', 'userType', 'name', 'createdAt', 'updatedAt'];
      let orderBy = [['id', 'DESC']];
      let where = {};
      let userWhere = {};
      if (queryData.activityType) {
        where.activityType = queryData.activityType
      }
      if (queryData.ip) {
        where.ip = queryData.ip
      }
      if (queryData.fromDate && queryData.toDate && headerValues.timezone) {
        let fromDate = `${queryData.fromDate}${fromDateTime}`;
        let toDate = `${queryData.toDate}${toDateTime}`;
        fromDate = utility.convertDateFromTimezone(fromDate, headerValues.timezone, dateFormat);
        toDate = utility.convertDateFromTimezone(toDate, headerValues.timezone, dateFormat);
        fromDate = moment.utc(fromDate);
        toDate = moment.utc(toDate);
        where.createdAt = { [Op.gte]: fromDate, [Op.lte]: toDate };
      }
      if (queryData.name) {
        userWhere =
          Sequelize.where(Sequelize.fn("concat", Sequelize.col("adminUser.first_name"), ' ', Sequelize.col("adminUser.last_name")), {
            [Op.like]: `%${queryData.name}%`
          })
      }
      if (queryData.email) {
        userWhere.email = { [Op.like]: `%${queryData.email}%` };
      }
      if (queryData.userType) {
        userWhere.userType = queryData.userType
      }
      if (queryData.phoneNumber) {
        userWhere.phoneNumber = { [Op.like]: `%${queryData.phoneNumber}%` };
      }


      if (queryData.sortBy && queryData.sortType && sortFields.includes(queryData.sortBy)) {
        if (queryData.sortBy == 'name') {
          orderBy = [[Sequelize.fn(
            'concat',
            Sequelize.col('adminUser.first_name'),
            ' ',
            Sequelize.col('adminUser.last_name')
          ), queryData.sortType]]
        } else if (queryData.sortBy == 'userType') {
          orderBy = [[Sequelize.literal('adminUser.user_type'), queryData.sortType]]
        } else if (queryData.sortBy == 'phoneNumber') {
          orderBy = [[Sequelize.literal('adminUser.phone_number'), queryData.sortType]]
        }
        else {
          orderBy = [[queryData.sortBy, queryData.sortType]];
        }
      }

      const result = await ActivityLog.findAndCountAll({
        where: where,
        include: [
          {
            model: User,
            as: 'adminUser',
            where: userWhere,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'email',
              'profilePicture',
              'profilePictureUrl',
              'phoneNumberCountryCode',
              'phoneNumber',
              'userType'
            ],
          },
          {
            model: User,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'email',
              'profilePicture',
              'profilePictureUrl',
              'phoneNumberCountryCode',
              'phoneNumber',
              'userType'
            ],
          }
        ],
        distinct: true,
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0),
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
     * save all admin activity logs
     * @param {Object} data
     */
  async saveActivityLog(activityType, req) {
    try {
      const ip = requestIp.getClientIp(req);
      let userData = req.user;
      let transactionId = (req.params.transactionId) ? req.params.transactionId : (req.body.transactionId) ? req.body.transactionId : null
      let message = null
      let userId = (req.params.userId) ? req.params.userId : (req.body.userId) ? req.body.userId : null
      // save activity log
      if (activityType == 'change_password') {
        message = utility.getMessage(req, false, 'ACTIVITY_PASSWORD_CHANGED')
      } else if (activityType == 'update_profile') {
        message = utility.getMessage(req, false, 'ACTIVITY_PROFILE_UPDATED')
      } else if (activityType == 'logout') {
        message = utility.getMessage(req, false, 'ACTIVITY_LOGOUT')
      } else if (activityType == 'login') {
        message = utility.getMessage(req, false, 'ACTIVITY_LOGIN')
      } else if (activityType == 'change_status') {
        message = utility.getMessage(req, false, 'ACTIVITY_USER_STATUS_UPDATED')
        message = message.replace('{status}', req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1));
        message = message.replace('{userType}', req.userInfo.userType.charAt(0).toUpperCase() + req.userInfo.userType.slice(1));

      } else if (activityType == 'change_kyc_status') {
        message = utility.getMessage(req, false, 'ACTIVITY_USER_KYC_STATUS_UPDATED')
        message = message.replace('{status}', req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1));
        message = message.replace('{userType}', req.userInfo.userType.charAt(0).toUpperCase() + req.userInfo.userType.slice(1));
      } else if (activityType == 'change_transaction_status') {
        userId = req.transaction.transactionUserId;
        message = utility.getMessage(req, false, 'ACTIVITY_TRANSACTION_STATUS_UPDATED')
        let status = req.body.status;
        if (req.body.status == 'cancelled') {
          status = 'rejected'
        }
        message = message.replace('{status}', status.charAt(0).toUpperCase() + status.slice(1));
      } else if (activityType == 'user_update_cms') {
        message = utility.getMessage(req, false, 'ACTIVITY_CMS_UPDATED')
        message = message.replace('{pageName}', req.cms.pageName.charAt(0).toUpperCase() + req.cms.pageName.slice(1));

      } else if (activityType == 'merchant_update_cms') {
        message = utility.getMessage(req, false, 'ACTIVITY_MERCHANT_CMS_UPDATED')
        message = message.replace('{pageName}', req.cms.pageName.charAt(0).toUpperCase() + req.cms.pageName.slice(1));
      } else if (activityType == 'user_add_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_FAQ_ADD')
      } else if (activityType == 'merchant_add_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_MERCHANT_FAQ_ADD')
      } else if (activityType == 'user_update_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_FAQ_UPDATED')
      } else if (activityType == 'merchant_update_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_MERCHANT_FAQ_UPDATED')
      } else if (activityType == 'user_delete_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_FAQ_DELETE')
      } else if (activityType == 'merchant_delete_faq') {
        message = utility.getMessage(req, false, 'ACTIVITY_MERCHANT_FAQ_DELETE')
      } else if (activityType == 'sms_setting') {
        message = utility.getMessage(req, false, 'ACTIVITY_SMS_SETTING')
      } else if (activityType == 'email_setting') {
        message = utility.getMessage(req, false, 'ACTIVITY_EMAIL_SETTING')
      } else if (activityType == 'kyc_setting') {
        message = utility.getMessage(req, false, 'ACTIVITY_KYC_SETTING')
      } else if (activityType == 'role_created') {
        message = utility.getMessage(req, false, 'ACTIVITY_ROLE_CREATED')
      } else if (activityType == 'role_edit') {
        message = utility.getMessage(req, false, 'ACTIVITY_ROLE_EDIT')
      } else if (activityType == 'add_subadmin') {
        message = utility.getMessage(req, false, 'ACTIVITY_ADD_SUBADMIN')
      } else if (activityType == 'edit_subadmin') {
        userId = req.body.id
        message = utility.getMessage(req, false, 'ACTIVITY_EDIT_SUBADMIN')
      } else if (activityType == 'subadmin_change_status') {
        message = utility.getMessage(req, false, 'ACTIVITY_STATUS_SUBADMIN')
        message = message.replace('{status}', req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1));

      } else if (activityType == 'inactivelogout') {
        userData.id = userId;
        userId = req.user.id;
        message = utility.getMessage(req, false, 'ACTIVITY_LOGOUT')
      }

      return await ActivityLog.create({
        adminId: (userData) ? userData.id : userId,
        userId: userId,
        transactionId: transactionId,
        ip: ip,
        activityType: activityType,
        message: message,
      });

    } catch (error) {
      throw Error(error);
    }
  },
};
