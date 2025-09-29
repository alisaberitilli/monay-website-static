import models from '../models/index.js';
import moment from 'moment-timezone';
import utility from '../services/utility.js';
import notificationRepository from '../repositories/notification-repository.js';
const { Op } = models.Sequelize;
const { Sequelize } = models.sequelize;
const fromDateTime = ' 00:00:00';
const toDateTime = ' 23:59:59';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

export default {

  /**
    * get payment request
    * @param {Object} req
    */
  async findOne(whereObj) {
    try {
      return await PaymentRequest.findOne({
        where: whereObj
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
    * get declined last request
    * @param {Object} req
    */
  async findOneDeclined(whereObj) {
    const orderBy = [['id', 'DESC']];
    try {
      return await PaymentRequest.findOne({
        where: whereObj,
        order: orderBy
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Save user payment request
   * @param {Object} req
   */
  async savePaymentRequest(req) {
    try {
      const userData = req.user;
      const { message, amount, toUserId } = req.body;
      const data = {
        message,
        amount,
        toUserId,
        fromUserId: userData.id,
        status: 'pending'
      }
      const result = await PaymentRequest.create(data);
      if (result) {
        await notificationRepository.userPaymentRequest(req);
      }
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get my payment request list
  * @param {Object} req
  */
  async findAll(req) {
    try {
      const userData = req.user;
      const queryData = req.query;
      const orderBy = [['id', 'DESC']];
      let where = { fromUserId: userData.id };
      const result = await PaymentRequest.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'toUser',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'profilePicture',
              'profilePictureUrl',
              'email'
            ],
          },
          {
            model: Transaction,
            attributes: [
              'id',
              'transactionId',
              'amount'
            ],
            required: false
          }
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });

      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get User payment request list
  * @param {Object} req
  */
  async userPaymentRequestList(req) {
    try {
      const userData = req.user;
      const queryData = req.query;
      const paramData = req.params;
      const orderBy = [['id', 'DESC']];
      let where = { toUserId: userData.id };
      if (paramData.type != 'received') {
        where.status = paramData.type;
      } else {
        where.status = 'pending';
      }
      const result = await PaymentRequest.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'fromUser',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'profilePicture',
              'profilePictureUrl',
              'email',
              'mobile'
            ],
          },
          {
            model: Transaction,
            attributes: [
              'id',
              'transactionId',
              'amount'
            ],
            required: false
          }
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });

      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * decline payment request
  * @param {Object} req
  */
  async declinePaymentRequest(req) {
    try {
      const paymentRequest = req.paymentRequest;
      let declineReason = (req.body.declineReason) ? req.body.declineReason : null;
      const result = await paymentRequest.update({ status: 'declined', declineReason: declineReason });
      if (result) {
        req.body.toUserId = result.fromUserId;
        req.body.amount = result.amount;
        req.body.reason = declineReason;
        await notificationRepository.userPaymentRequestDecline(req);
      }
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get all Payment request
   * @param {Object} req
   */
  async paymentRequestList(req) {
    try {
      const queryData = req.query;
      const headerValues = req.headers;
      const sortFields = ['id', 'transactionId', 'fromUserId', 'toUserId', 'amount', 'status', 'message', 'createdAt', 'updatedAt'];
      let orderBy = [['createdAt', 'DESC']];
      let fromWhere = {};
      let toWhere = {};
      let where = {};

      if (queryData.status) {

        where.status = queryData.status;
      }
      if (queryData.transactionId) {
        where.transactionId = queryData.transactionId
      }
      if (queryData.minAmount) {
        where.amount = { [Op.gte]: queryData.minAmount };
      }
      if (queryData.maxAmount) {
        where.amount = { [Op.lte]: queryData.maxAmount };
      }
      if (queryData.minAmount && queryData.maxAmount) {
        where.amount = { [Op.gte]: queryData.minAmount, [Op.lte]: queryData.maxAmount };
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

      if (queryData.fromName) {
        fromWhere = {
          [Op.or]: [
            Sequelize.where(Sequelize.fn("concat", Sequelize.col("fromUser.first_name"), ' ', Sequelize.col("fromUser.last_name")), {
              [Op.like]: `%${queryData.fromName}%`
            }),
            Sequelize.where(Sequelize.col("fromUser.email"), {
              [Op.like]: `%${queryData.fromName}%`
            })
          ]
        }
      }
      if (queryData.toName) {
        toWhere = {
          [Op.or]: [
            Sequelize.where(Sequelize.fn("concat", Sequelize.col("toUser.first_name"), ' ', Sequelize.col("toUser.last_name")), {
              [Op.like]: `%${queryData.toName}%`
            }),
            Sequelize.where(Sequelize.col("toUser.email"), {
              [Op.like]: `%${queryData.toName}%`
            })
          ]
        }

      }

      if (queryData.sortBy && queryData.sortType && sortFields.includes(queryData.sortBy)) {

        if (queryData.sortBy == 'fromUserId') {
          orderBy = [[Sequelize.fn(
            'concat',
            Sequelize.col('fromUser.first_name'),
            ' ',
            Sequelize.col('fromUser.last_name')
          ), queryData.sortType]]
        } else if (queryData.sortBy == 'toUserId') {
          orderBy = [[Sequelize.fn(
            'concat',
            Sequelize.col('toUser.first_name'),
            ' ',
            Sequelize.col('toUser.last_name')
          ), queryData.sortType]]
        } else {
          orderBy = [[queryData.sortBy, queryData.sortType]];
        }


      }
      const result = await PaymentRequest.findAndCountAll({
        where: where,
        include: [
          {
            model: User,
            as: 'fromUser',
            where: fromWhere,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'profilePicture',
              'profilePictureUrl',
              'email',
              'mobile'
            ],
          },
          {
            model: User,
            as: 'toUser',
            where: toWhere,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'profilePicture',
              'profilePictureUrl',
              'email',
              'mobile'
            ],

          }
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get Recent Payment Request
  * @param {Object} req
  */
  async recentPaymentRequest(userId) {
    try {
      const orderBy = [['id', 'DESC']];
      let where = { toUserId: userId, status: 'pending' };
      const result = await PaymentRequest.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'fromUser',
            attributes: [
              'id',
              'firstName',
              'lastName',
              'profilePicture',
              'profilePictureUrl',
              'email',
              'mobile'
            ],
          },
        ],
        order: orderBy,
        limit: 3,
        offset: 0
      });

      return result.rows;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  *Get total amount sum for admin dashboard 
  * @param {Object} req
  */
  async getPaymentRequestCount() {
    try {
      let where = {};
      let data = {
        lastWeekPaymentCount: 0,
        currentWeekPaymentCount: 0,
      };
      // Current week total  
      const startCurrentWeekDate = moment.utc().startOf('week').format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf('week').format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = { [Op.between]: [startCurrentWeekDate, endCurrentWeekDate] }
        data.currentWeekPaymentCount = await PaymentRequest.count({
          where
        });

      }
      // Last week total  
      let lastWeekStartDate = moment.utc().startOf('week').subtract(7, 'd').format(dateFormat);
      let lastWeekendDate = moment.utc().endOf('week').subtract(7, 'd').format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = { [Op.between]: [lastWeekStartDate, lastWeekendDate] }
        data.lastWeekPaymentCount = await PaymentRequest.count({
          where
        });
      }
      return data;
    } catch (error) {
      throw Error(error);
    }
  },
};
