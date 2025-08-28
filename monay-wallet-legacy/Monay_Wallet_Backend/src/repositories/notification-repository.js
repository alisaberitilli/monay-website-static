import models from '../models';
import utility from '../services/utility';
import notification from '../services/notification';
import config from '../config';
const { User, Notification } = models;
const { Op } = models.Sequelize;
export default {

  /**
   * new user signup notification for admin
   * @param {Object} req
   * @param {Object} data
   */
  async newUser(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: data.userId,
        toId: adminId,
        followId: null,
        type: 'NEW_USER',
        title: utility.getMessage(req, false, 'NEW_USER_TITLE'),
        message: utility.getMessage(req, false, 'NEW_USER_MESSAGE'),
      }
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * new merchant signup notification for admin
  * @param {Object} req
  * @param {Object} data
  */
  async newMerchant(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: data.userId,
        toId: adminId,
        followId: null,
        type: 'NEW_MERCHANT',
        title: utility.getMessage(req, false, 'NEW_MERCHANT_TITLE'),
        message: utility.getMessage(req, false, 'NEW_MERCHANT_MESSAGE'),
      }
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * User payment request notification 
  * @param {Object} req
  */
  async userPaymentRequest(req) {
    try {
      let amount = utility.formatMoney(req.body.amount)
      let result = {};
      result = {
        fromId: req.user.id,
        toId: req.body.toUserId,
        amount: amount,
        type: 'PAYMENT_REQUEST',
        title: utility.getMessage(req, false, 'PAYMENT_REQUEST_TITLE'),
        message: utility.getMessage(req, false, 'PAYMENT_REQUEST_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  *  user payment request decline notification 
  * @param {Object} req
  */
  async userPaymentRequestDecline(req) {
    try {
      let amount = utility.formatMoney(req.body.amount)
      let result = {};
      result = {
        fromId: req.user.id,
        toId: req.body.toUserId,
        amount: amount,
        type: 'PAYMENT_REQUEST',
        title: utility.getMessage(req, false, 'PAYMENT_REQUEST_DECLINED_TITLE'),
        message: utility.getMessage(req, false, 'PAYMENT_REQUEST_DECLINED_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', amount);
      result.message = result.message.replace('{reason}', (req.body.reason) ? req.body.reason : '');
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * user received payment notification 
  * @param {Object} req
  */
  async userReceivedPayment(req) {
    try {
      let amount = await utility.formatMoney(req.body.amount)
      let result = {};
      result = {
        fromId: req.user.id,
        toId: req.body.toUserId,
        amount: amount,
        type: 'PAYMENT_RECEIVED',
        title: utility.getMessage(req, false, 'PAYMENT_RECEIVED_TITLE'),
        message: utility.getMessage(req, false, 'PAYMENT_RECEIVED_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  *  user sent payment request notification 
  * @param {Object} data
  */
  async userSentPayment(req) {
    try {
      let amount = await utility.formatMoney(req.body.amount)
      let result = {};
      result = {
        fromId: req.body.toUserId,
        toId: req.user.id,
        amount: amount,
        type: 'PAYMENT_SENT',
        title: utility.getMessage(req, false, 'PAYMENT_SENT_TITLE'),
        message: utility.getMessage(req, false, 'PAYMENT_SENT_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * add Money in wallet 
  * @param {Object} req
  */
  async addMoneyFromCard(req) {
    try {
      let amount = utility.formatMoney(req.body.amount)
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: adminId,
        toId: req.body.toUserId,
        amount: amount,
        type: 'ADD_WALLET_MONAY',
        title: utility.getMessage(req, false, 'ADD_WALLET_MONAY_TITLE'),
        message: utility.getMessage(req, false, 'ADD_WALLET_MONAY_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * save user notification
   * @param {Object} req
   * @param {Object} data
   */
  async saveUserNotification(req, data) {
    try {
      let result = {};
      let fromUserInfo = await User.findOne({ where: { id: data.fromId } });

      result = {
        type: data.type,
        fromUserId: data.fromId,
        toUserId: data.toId,
        title: data.title,
        message: data.message,
        notificationData: JSON.stringify(data)
      };
      let message = data.message;
      if (fromUserInfo) {
        let fullname = await utility.getFullName(fromUserInfo);
        message = message.replace('{name}', fullname);
        message = message.replace('{email}', fromUserInfo.email);
      }
      const notificationObj = {
        type: data.type,
        title: data.title,
        message: message,
        userId: data.fromId,
        userName: (fromUserInfo) ? fromUserInfo.username : '',
        profilePictureThumbUrl: (fromUserInfo) ? fromUserInfo.profilePictureThumbUrl : ''
      };

      let userInfo = await User.findOne({ where: { id: data.toId } });
      if (userInfo && userInfo.userType != 'admin') {
        //send push notification
        await notification.sendToNotificationUser(data.toId, notificationObj);
      }
      await Notification.create(result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * update user read notification
   * @param {Object} data
   */
  async update(userId) {
    try {
      return await Notification.update({ receiverRead: 'read' }, { where: { toUserId: userId } });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get Notification list
   * @param {Object} req
   */
  async getNotificationList(req) {
    try {
      const userId = req.user.id;
      const where = {
        toUserId: {
          [Op.or]: [userId, null]
        },
        createdAt: { [Op.gte]: req.user.createdAt }
      };
      const queryData = req.query;
      let orderBy = [['createdAt', 'DESC']];

      if (queryData.sortBy == 'ASC') {
        orderBy = [['createdAt', 'ASC']];
      } else {
        orderBy = [['createdAt', 'DESC']];
      }

      const results = await Notification.findAndCountAll({
        where,
        attributes: [
          'id',
          'type',
          'message',
          'receiverRead',
          'fromUserId',
          'toUserId',
          'createdAt',
        ],
        include: [
          {
            model: User,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'userType',
              'email',
              'profilePicture',
              'profilePictureUrl',
              'createdAt',
            ],
            on: {
              col1: models.sequelize.where(
                models.sequelize.col('Notification.from_user_id'),
                '=',
                models.sequelize.col('User.id'),
              ),
            },
          }
        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });

      await Notification.update({ receiverRead: 'read' }, { where: { toUserId: userId } });

      return results;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get Admin Notification list
   * @param {Object} req
   */
  async getAdminNotificationList(req) {
    try {
      let adminData = await User.findOne({
        where: {
          userType: 'admin',
          status: 'active'
        }
      });

      let userId = 0;
      if (adminData) {
        userId = adminData.id;
      }
      const where = {
        toUserId: userId
      };
      const queryData = req.query;
      let orderBy = [['createdAt', 'DESC']];

      if (queryData.sortBy == 'ASC') {
        orderBy = [['createdAt', 'ASC']];
      } else {
        orderBy = [['createdAt', 'DESC']];
      }

      const results = await Notification.findAndCountAll({
        where,
        attributes: [
          'id',
          'type',
          'message',
          'receiverRead',
          'fromUserId',
          'toUserId',
          'createdAt',
        ],
        include: [
          {
            model: User,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'userType',
              'email',
              'profilePicture',
              'profilePictureUrl',
              'createdAt',
            ],
            on: {
              col1: models.sequelize.where(
                models.sequelize.col('Notification.from_user_id'),
                '=',
                models.sequelize.col('User.id'),
              ),
            },
          },

        ],
        order: orderBy,
        limit: parseInt(queryData.limit || 10),
        offset: parseInt(queryData.offset || 0)
      });

      await Notification.update({ receiverRead: 'read' }, { where: { toUserId: userId } });

      return results;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * new withdrawl request notification to admin
   * @param {Object} data
   */
  async withdrawalRequest(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: req.user.id,
        toId: adminId,
        followId: null,
        type: 'WITHDRAWAL_REQUEST',
        title: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_TITLE'),
        message: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', data.amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * withdrawl request status updated notification to user
   * @param {Object} data
   */
  async withdrawalUserRequest(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: adminId,
        toId: req.user.id,
        followId: null,
        type: 'WITHDRAWAL_USER_REQUEST',
        title: utility.getMessage(req, false, 'WITHDRAWAL_USER_REQUEST_TITLE'),
        message: utility.getMessage(req, false, 'WITHDRAWAL_USER_REQUEST_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', data.amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * withdrawl request approved notification to user
   * @param {Object} data
   */
  async withdrawalRequestApproved(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: adminId,
        toId: data.fromUserId,
        followId: null,
        type: 'WITHDRAWAL_REQUEST',
        title: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_APPROVED_TITLE'),
        message: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_APPROVED_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', data.amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *  withdrawl request rejected notification to user
   * @param {Object} data
   */
  async withdrawalRequestRejected(req, data) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      result = {
        fromId: adminId,
        toId: data.fromUserId,
        followId: null,
        type: 'WITHDRAWAL_REQUEST',
        title: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_REJECT_TITLE'),
        message: utility.getMessage(req, false, 'WITHDRAWAL_REQUEST_REJECT_MESSAGE'),
      }
      const currency = (req.user?.phoneNumberCountryCode === '+91') ? 'INR' : 'USD'
      result.message = result.message.replace('{currency}', currency);
      result.message = result.message.replace('{amount}', data.amount);
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  *  KYC status updated notification to user
  * @param {Object} data
  */
  async kycApproval(req) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      let message = utility.getMessage(req, false, 'KYC_APPROVED_MESSAGE')
      let title = utility.getMessage(req, false, 'KYC_APPROVAL_TITLE')
      if (req.body.status != 'approved') {
        message = utility.getMessage(req, false, 'KYC_REJECT_MESSAGE')
        message = message.replace('{reason}', (req.body.reason))
        title = utility.getMessage(req, false, 'KYC_REJECT_TITLE')
      }

      result = {
        fromId: adminId,
        toId: req.userInfo.id,
        followId: null,
        type: 'KYC_APPROVAL',
        title: title,
        message: message,
      }
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * User KYC Uplaoded Notification to admin
  * @param {Object} data
  */
  async KycUploadedNotification(req) {
    try {
      let result = {};
      let adminId = null;
      const adminData = await User.findOne({ where: { userType: 'admin', status: 'active' } });
      if (adminData) {
        adminId = adminData.id;
      }
      let message = utility.getMessage(req, false, 'KYC_UPLOADED_MESSAGE')
      let title = utility.getMessage(req, false, 'KYC_UPLOADED_TITLE')


      result = {
        fromId: req.user.id,
        toId: adminId,
        followId: null,
        type: 'KYC_UPLOADED',
        title: title,
        message: message,
      }
      await this.saveUserNotification(req, result);
    } catch (error) {
      throw Error(error);
    }
  },

};
