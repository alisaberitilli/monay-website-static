import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import mediaRepository from './media-repository';
import models from '../models';
import accountRepository from './account-repository';
import activityLogRepository from './activity-log-repository';
import utility from '../services/utility';
import moment from 'moment-timezone';
import sms from '../services/sms';
import Email from '../services/email';
import notificationRepository from './notification-repository';
import encryptAPIs from '../services/encrypt';
import logger from '../services/logger';
import config from '../config';
const { Sequelize } = models.sequelize;
const { User, Notification, UserKyc, UserRole, UserToken, ChildParent, Country } = models;
const fromDateTime = ' 00:00:00';
const toDateTime = ' 23:59:59';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
import utils from '../utils/index';


export default {
  /**
   * send otp mobile registration
   * @param {Object} req
   * @param {integer} verificationOtp
   */
  async createUserRegistration(req, verificationOtp) {
    try {
      let otpSpenDateTime = await this.getCurrentDateTiem(req);
      const { phoneNumberCountryCode, phoneNumber, userType } = req.body;
      const user = await User.create({
        phoneNumberCountryCode,
        phoneNumber,
        verificationOtp: verificationOtp,
        userType: userType,
        status: 'pending',
        otpSpentTime: otpSpenDateTime

      });
      return user;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Find user by username
  * @param {string} phoneNumberCountryCode
  * @param {string} username
  */
  async getUsernameWhere(phoneNumberCountryCode, username) {
    try {
      let where = {};
      const isEmail = utility.validateEmail(username);
      if (isEmail) {
        where.email = username;
      } else {
        where.phoneNumberCountryCode = phoneNumberCountryCode;
        where.phoneNumber = username;
      }
      return where;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Find user detail
   * @param {Object} whereObj 
   */
  async findOne(whereObj) {
    try {
      if (!whereObj.status) {
        whereObj.status = { [Op.ne]: 'deleted' };
      }
      return await User.findOne({
        where: whereObj,
        attributes: {
          exclude: ['password', 'verifyToken']
        }
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Update user
   * @param {Object} userObject
   * @param {Object} data
   */
  async updateUser(userObject, data) {
    try {
      return await userObject.update(data);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
    * Update password
    * @param {Object} userObject
    */
  async createHashPassword(password) {
    try {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      return hashPassword;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Update password
   * @param {Object} userObject
   * @param {String} newPassword
   */
  async updatePassword(userObject, newPassword) {
    try {
      const hashPassword = await this.createHashPassword(newPassword);
      return await userObject.update({
        password: hashPassword,
        passwordResetToken: null,
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * User change password
   * @param {Object} req
   */
  async changePassword(req) {
    try {
      let { id } = req.user;
      let userObject = await User.findOne({
        where: { id: id }
      });
      if (userObject) {
        const isPasswordMatch = await accountRepository.compareUserPassword(
          req.body.currentPassword,
          userObject.password,
        );
        if (!isPasswordMatch) {
          return { status: 'notmatched' };
        } else {
          if (req.body.currentPassword !== req.body.newPassword) {
            await this.updatePassword(userObject, req.body.newPassword);
            return { status: 'changed' };
          } else {
            return { status: 'samepassword' };
          }
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * User change PIN 
   * @param {Object} req
   */
  async changePIN(req) {
    try {
      let { id } = req.user;
      let bodyData = req.body;
      let userObject = await User.findOne({
        where: { id: id }
      });
      if (userObject) {
        let currentMpin = await encryptAPIs.encrypt(bodyData.currentMpin);
        let mpin = await encryptAPIs.encrypt(bodyData.mpin);
        let existCurrentMpin = userObject.mPin;
        const isPinMatch = currentMpin === existCurrentMpin
        if (!isPinMatch) {
          return { status: 'notmatched' };
        } else if (mpin === existCurrentMpin) {
          return { status: 'newAndExistPinSame' };
        } else {
          await this.updatemPin(req)
          return { status: 'changed' };
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get user details
   * @param {Object} req
   * @param {integer} userId
   */
  async getUserProfile(userId, req) {
    try {
      const result = await User.findOne({
        where: {
          id: userId
        },
        attributes: {
          exclude: [
            'password',
            'verificationOtp',
            'passwordResetToken'
          ],
        },
        include: [
          {
            model: UserKyc,
            where: { status: req.user.kycStatus },
            attributes: [
              'idProofName',
              'idProofImage',
              'addressProofName',
              'addressProofImage',
              'addressProofBackImage',
              'idProofBackImage',
              'reason',
              'status'
            ],
            required: false
          },
          {
            model: Country,
            on: {
              col1: models.sequelize.where(
                models.sequelize.col('Country.country_calling_code'),
                '=',
                models.sequelize.col('User.phone_number_country_code'),
              ),
            },
            required: false,
          },
        ]
      });
      if (result.UserKycs.length > 0) {
        for (let index = 0; index < result.UserKycs.length; index++) {
          let idProofImageUrl = '';
          let addressProofImageUrl = '';
          let addressProofBackImageUrl = '';
          let idProofBackImageUrl = '';
          if (config.app.mediaStorage == 's3') {
            idProofImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].idProofImage);
            addressProofImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].addressProofImage);
            addressProofBackImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index]?.addressProofBackImage);
            idProofBackImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index]?.idProofBackImage);
          } else {
            idProofImageUrl = `${config.app.baseUrl}${result.UserKycs[index].idProofImage}`;
            addressProofImageUrl = `${config.app.baseUrl}${result.UserKycs[index].addressProofImage}`;
            addressProofBackImageUrl = result.UserKycs[index]?.addressProofBackImage ? `${config.app.baseUrl}${result.UserKycs[index]?.addressProofBackImage}` : '';
            idProofBackImageUrl = result.UserKycs[index]?.idProofBackImage ? `${config.app.baseUrl}${result.UserKycs[index]?.idProofBackImage}` : '';
          }
          result.UserKycs[index].get()['idProofImageUrl'] = idProofImageUrl;
          result.UserKycs[index].get()['addressProofImageUrl'] = addressProofImageUrl;
          result.UserKycs[index].get()['addressProofBackImageUrl'] = addressProofBackImageUrl;
          result.UserKycs[index].get()['idProofBackImageUrl'] = idProofBackImageUrl;

        }
        return result;
      } else {
        return result;
      }

    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get user details by other user
   * @param {Object} req
   * @param {integer} userId
   */
  async getOtherUserProfile(userId, req) {
    try {
      const result = await User.findOne({
        where: {
          uniqueCode: userId,
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'profilePicture',
          'profilePictureUrl',
          'phoneNumberCountryCode',
          'phoneNumber',
          'status'
        ],
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Update user profile
  * @param {Object} req
  */
  async updateProfile(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const userData = req.user;
      const bodyData = req.body;
      const profilePicture = bodyData.profilePicture || ''

      if (!bodyData.profilePicture) {
        bodyData.profilePicture = (userData.profilePicture) ? userData.profilePicture : '';
      }
      if (!bodyData.phoneNumber) {
        bodyData.phoneNumberCountryCode = '';
        bodyData.phoneNumber = '';
      }
      const result = await User.update(bodyData, { where: { id: userData.id } }, { transaction });
      //Update media detail
      await mediaRepository.makeUsedMedias([bodyData.profilePicture]);
      //unlink media
      if (bodyData.profilePicture !== userData.profilePicture) {
        await mediaRepository.findMediaByBasePathAndUnlink(userData.profilePicture)
      }
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw Error(error);
    }
  },
  /**
  * signup new user
  * @param {Object} req
  */
  async signup(req) {
    try {
      let verificationCodeTime = await this.getCurrentDateTiem(req);
      let bodyData = req.body;
      let verificationCode = utility.generateOtp();
      let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationCode}`);
      let hashPassword = await this.createHashPassword(bodyData.password);
      bodyData.status = 'active';
      bodyData.password = hashPassword;
      bodyData.verificationCode = encryptVerificationCode;
      bodyData.codeSpentTime = verificationCodeTime;
      const referralCode = bodyData?.referralCode ?? null;
      //bodyData.userType = bodyData?.userType ?? 'user';
      bodyData.isVerified = true;
      let where = {
        phoneNumberCountryCode: bodyData.phoneNumberCountryCode,
        phoneNumber: bodyData.phoneNumber
      }
      let userData = await this.findOne(where)
      delete bodyData.referralCode;
      if (userData) {
        if (userData.userType == 'user') {
          const code = await this.getCode()
          bodyData.referralCode = code
        }

        await userData.update(bodyData);
        await accountRepository.generateQrCode(userData.id);
        await accountRepository.generateAccounNumber(userData.id);

        await notificationRepository.newUser(req, { userId: userData.id });
        let OtpMessage = utility.getMessage(req, false, 'SIGNUP_SEND_OTP')
        await sms.sendOtp(`${bodyData.phoneNumberCountryCode}${bodyData.phoneNumber}`, OtpMessage);
        // send otp on email
        let fullName = `${userData.firstName} ${userData.lastName}`;
        const data = { to: userData.email, email: userData.email, name: fullName, otp: verificationCode };
        Email.userSignup(data).then((result) => {
          return true;
        }).catch((error) => {
          logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
          return false;
        });
        if (userData.userType == 'secondaryUser') {
          const secondary = { userId: userData.id }
          if (referralCode) {
            let isReferral = await this.findOne({ referralCode });
            if (isReferral) {
              secondary.isParentVerified = 1;
              secondary.parentId = isReferral.id
            }
          }
          await ChildParent.create(secondary);

        }
        return userData;
      } else {
        return false;
      }

    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Send Email Verification Code
  * @param {Object} req
  */
  async sendEmailVerificationCode(req) {
    try {
      let userData = req.user;
      let verificationCodeTime = await this.getCurrentDateTiem(req);
      let bodyData = {};
      let verificationCode = await utility.generateOtp();
      let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationCode}`);

      bodyData.verificationCode = encryptVerificationCode;
      bodyData.codeSpentTime = verificationCodeTime;

      if (userData) {
        const result = await userData.update(bodyData);
        // send otp on email
        let fullName = `${userData.firstName} ${userData.lastName}`;
        const data = { to: userData.email, email: userData.email, name: fullName, otp: verificationCode };
        Email.emailVerification(data).then((result) => {
          return true;
        }).catch((error) => {
          logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
          return false;
        });
        return result;
      } else {
        return false;
      }

    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * signup new Merchant
  * @param {Object} req
  */
  async merchantSignup(req) {

    try {
      let verificationCodeTime = await this.getCurrentDateTiem(req);
      let bodyData = req.body;
      let verificationCode = await utility.generateOtp();
      let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationCode}`);
      let hashPassword = await this.createHashPassword(bodyData.password);
      bodyData.status = 'active';
      bodyData.password = hashPassword;
      bodyData.verificationCode = encryptVerificationCode;
      bodyData.codeSpentTime = verificationCodeTime;
      bodyData.userType = 'merchant';
      bodyData.isVerified = true;
      let where = {
        phoneNumberCountryCode: bodyData.phoneNumberCountryCode,
        phoneNumber: bodyData.phoneNumber
      }
      let userData = await this.findOne(where);
      if (userData) {
        await userData.update(bodyData);
        await accountRepository.generateQrCode(userData.id);
        await accountRepository.generateAccounNumber(userData.id);
        let OtpMessage = utility.getMessage(req, false, 'SIGNUP_SEND_OTP')
        await sms.sendOtp(`${bodyData.phoneNumberCountryCode}${bodyData.phoneNumber}`, OtpMessage);
        await notificationRepository.newMerchant(req, { userId: userData.id });
        // send otp on email
        let fullName = `${userData.firstName} ${userData.lastName}`;
        const data = { to: userData.email, email: userData.email, name: fullName, otp: verificationCode };
        Email.userSignup(data).then((result) => {
          return true;
        }).catch((error) => {
          logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
          return false;
        });
        return userData;
      } else {
        return false;
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get user count
  * @param {Object} data
  */
  async getUserCount(data) {
    try {
      let userData = {
        totalUsers: 0,
        totalLastWeekUsers: 0,
        totalCurrentWeekUsers: 0
      };
      let where = { status: { [Op.in]: ['active', 'inactive'] } };
      if (data && data.userType) {
        where.userType = data.userType;
      }
      userData.totalUsers = await User.count({ where });
      // Current week total users 
      const startCurrentWeekDate = moment.utc().startOf('week').format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf('week').format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = { [Op.between]: [startCurrentWeekDate, endCurrentWeekDate] }
        userData.totalCurrentWeekUsers = await User.count({ where });
      }
      // Last week total users 
      let lastWeekStartDate = moment.utc().startOf('week').subtract(7, 'd').format(dateFormat);
      let lastWeekendDate = moment.utc().endOf('week').subtract(7, 'd').format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = { [Op.between]: [lastWeekStartDate, lastWeekendDate] }
        userData.totalLastWeekUsers = await User.count({ where });
      }
      return userData;

    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Get all User list
  * @param {Object} req
  */
  async getUserList(req) {
    try {
      const queryData = req.query;
      const headerValues = req.headers;
      const sortFields = ['id', 'name', 'email', 'phoneNumber', 'accountNumber', 'kycStatus', 'companyName', 'taxId', 'chamberOfCommerce', 'createdAt', 'updatedAt'];
      let orderBy = [['createdAt', 'DESC']];
      let fullNameWhere = {};
      let where = { status: { [Op.in]: ['active', 'inactive'] } };

      if (queryData.userType) {
        where.userType = queryData.userType
      } else {
        where.userType = { [Op.ne]: 'admin' };
      }
      if (queryData.userType === 'allUser') {
        delete where.userType;
        where.userType = { [Op.in]: ['user', 'secondaryUser'] };
      }
      if (queryData.name) {
        fullNameWhere =
          Sequelize.where(Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), {
            [Op.like]: `%${queryData.name}%`
          })
      }

      if (queryData.email) {
        where.email = { [Op.like]: `%${queryData.email}%` };

      }
      if (queryData.companyName) {
        where.companyName = { [Op.like]: `%${queryData.companyName}%` };

      }
      if (queryData.taxId) {
        where.taxId = { [Op.like]: `%${queryData.taxId}%` };

      }
      if (queryData.chamberOfCommerce) {
        where.chamberOfCommerce = { [Op.like]: `%${queryData.chamberOfCommerce}%` };

      }
      if (queryData.phoneNumber) {
        where.phoneNumber = { [Op.like]: `%${queryData.phoneNumber}%` };
      }
      if (queryData.accountNumber) {
        where.accountNumber = { [Op.like]: `%${queryData.accountNumber}%` };
      }
      if (queryData.country) {
        where.phoneNumberCountry = queryData.country;
      }
      if (queryData.status) {
        where.status = queryData.status;
      }

      if (queryData.kycStatus) {
        where.kycStatus = queryData.kycStatus;
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

      if (queryData.sortBy && queryData.sortType && sortFields.includes(queryData.sortBy)) {
        if (queryData.sortBy == 'name') {
          orderBy = [[Sequelize.fn(
            'concat',
            Sequelize.col('User.first_name'),
            ' ',
            Sequelize.col('User.last_name')
          ), queryData.sortType]]
        } else {
          orderBy = [[queryData.sortBy, queryData.sortType]];
        }
      }
      const result = await User.findAndCountAll({
        where: {
          [Op.and]: [
            fullNameWhere,
            where
          ]
        },
        attributes: {
          exclude: ['password'],
        },
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
  * Get recent User list
  * @param {Object} req
  */
  async recentUserList(req) {
    try {
      let queryData = req.query;
      let userId = req.user.id;
      let orderBy = [['createdAt', 'DESC']];
      let where = { status: 'active', userType: { [Op.in]: ['user', 'merchant'] }, id: { [Op.ne]: userId } };
      let limit = parseInt(queryData.limit || 10);
      let offset = parseInt(queryData.offset || 0);
      let subQuery = `select GROUP_CONCAT(DISTINCT(block_user_id)) as userId from user_blocks where user_id=${userId}`;
      let blockedUserIds = await models.sequelize.query(subQuery, {
        type: models.sequelize.QueryTypes.SELECT,
      });
      blockedUserIds = (blockedUserIds) ? blockedUserIds[0].userId : null;
      if (blockedUserIds) {
        where.id = {
          [Op.notIn]: [Sequelize.literal(`${blockedUserIds},${userId}`)]
        }
      }
      let nameSearch = {}
      if (queryData.name) {
        nameSearch = Sequelize.where(Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), {
          [Op.like]: `%${queryData.name}%`
        });
      }

      if (queryData.phoneNumber) {
        where.phoneNumberCountryCode = req.user.phoneNumberCountryCode;
        where.phoneNumber = queryData.phoneNumber;
      }

      const result = await User.findAndCountAll({
        where: {
          [Op.and]: [where,
            nameSearch
          ]
        },
        attributes: [
          'profilePicture',
          'profilePictureUrl',
          'qrCodeUrl',
          'id',
          'firstName',
          'lastName',
          'email',
          'phoneNumberCountryCode',
          'phoneNumber',
          'userType'
        ],
        order: orderBy,
        limit: limit,
        offset: offset
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get recent payment User list
  * @param {Object} req
  */
  async recentPaymentUserList(req) {
    try {
      let queryData = req.query;
      let userId = req.user.id;
      let orderBy = [['createdAt', 'DESC']];
      let where = { status: 'active', userType: { [Op.ne]: 'admin' } };
      let limit = parseInt(queryData.limit || 10);
      let offset = parseInt(queryData.offset || 0);
      //get block user ids

      // get payment user ids 
      let paymentUser = `select GROUP_CONCAT(DISTINCT(CASE WHEN from_user_id = ${userId} THEN to_user_id ELSE from_user_id END)) as userId from transactions where (from_user_id=${userId} OR to_user_id=${userId}) AND action_type='transfer' AND from_user_id not in (select  (CASE WHEN count(block_user_id) > 0 THEN GROUP_CONCAT(DISTINCT(block_user_id)) ELSE 0 END) as userId from user_blocks where user_id=${userId})`;
      let paymentUserIds = await models.sequelize.query(paymentUser, {
        type: models.sequelize.QueryTypes.SELECT,
      });
      paymentUserIds = (paymentUserIds) ? paymentUserIds[0].userId : null;

      where.id = {
        [Op.in]: [Sequelize.literal(`${paymentUserIds}`)]
      }

      let nameSearch = {}
      if (queryData.name) {
        nameSearch = Sequelize.where(Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), {
          [Op.like]: `%${queryData.name}%`
        });
      }

      const result = await User.findAndCountAll({
        where: {
          [Op.and]: [where,
            nameSearch
          ]
        },
        attributes: [
          'profilePicture',
          'profilePictureUrl',
          'qrCodeUrl',
          'id',
          'firstName',
          'lastName',
          'email',
          'phoneNumberCountryCode',
          'phoneNumber',
          'userType'
        ],
        order: orderBy,
        limit: limit,
        offset: offset
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Resend verification code 
  * @param {Object} req
  */
  async resendVerificationCode(req) {
    try {
      let otpSpentDateTime = await this.getCurrentDateTiem(req);
      let verificationOtp = await utility.generateOtp();
      let encryptVerificationOtp = await encryptAPIs.encrypt(`${verificationOtp}`);
      const { phoneNumberCountryCode, username } = req.body;
      let where = await this.getUsernameWhere(phoneNumberCountryCode, username);
      const userData = await this.findOne(where);
      if (userData) {
        if (userData.status == 'active' || userData.status == 'pending') {
          const isEmail = utility.validateEmail(username);
          if (isEmail) {
            await userData.update({
              verificationCode: encryptVerificationOtp,
              codeSpentTime: otpSpentDateTime
            });
            // send otp on email
            let subject = req.body.type;
            let fullName = `${userData.firstName} ${userData.lastName}`;
            const data = { to: userData.email, email: userData.email, name: fullName, otp: verificationOtp, subject: subject };
            if (subject === 'Verification Code') {
              Email.userResendVerificationCode(data).then((result) => {
                return true;
              }).catch((error) => {
                logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
                return false;
              });
              return { status: 'updated' };
            } else {
              Email.userForgotPassword(data).then((result) => {
                return true;
              }).catch((error) => {
                logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
                return false;
              });
              return { status: 'updated' };
            }
          } else {
            await userData.update({
              verificationOtp: encryptVerificationOtp,
              otpSpentTime: otpSpentDateTime
            });
            let OtpMessage = utility.getMessage(req, false, 'SEND_OTP_MESSAGE')
            OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
            await sms.sendOtp(`${phoneNumberCountryCode}${username}`, OtpMessage);
          }
          return { status: 'updated' };
        } else {
          return { status: 'inactive' };
        }
      } else {
        return false;
      }

    } catch (error) {
      return { status: 'error', message: error.message };
    }
  },
  /**
  * Resend verification code for mpin
  * @param {Object} req
  */
  async resendVerificationCodeForMpin(req) {
    try {
      let otpSpentDateTime = await this.getCurrentDateTiem(req);
      let verificationOtp = await utility.generateOtp();
      let encryptVerificationOtp = await encryptAPIs.encrypt(`${verificationOtp}`);
      const { phoneNumberCountryCode, phoneNumber } = req.body;
      const userData = req.user;
      if (userData) {
        await userData.update({
          verificationOtp: encryptVerificationOtp,
          otpSpentTime: otpSpentDateTime
        });
        let OtpMessage = utility.getMessage(req, false, 'MPIN_OTP_MESSAGE')
        OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
        await sms.sendOtp(`${phoneNumberCountryCode}${phoneNumber}`, verificationOtp);
        return userData;
      } else {
        return false;
      }

    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Update user mpin
  * @param {Object} req
  */
  async updatemPin(req) {
    try {
      const userData = req.user;
      const bodyData = req.body;
      let mPin = await encryptAPIs.encrypt(bodyData.mpin);
      const result = await User.update({ mPin: mPin }, { where: { id: userData.id } });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get current date time 
  * @param {Object} req
  */
  async getCurrentDateTiem(req) {
    try {
      let currentDate = null;
      currentDate = moment.utc().format(dateFormat);
      return currentDate;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get user unread notification count
   * @param {Integer} userId
   */
  async getUserNotificationCount(userId) {
    try {
      const where = {
        toUserId: userId,
        receiverRead: 'unread'
      };
      return await Notification.count({
        where
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  *verify otp
  * @param {Object} req
  */
  async verifyOtp(req) {
    try {
      let { phoneNumberCountryCode, phoneNumber, otp } = req.body;
      otp = await encryptAPIs.encrypt(`${otp}`);

      let where = {
        phoneNumberCountryCode,
        phoneNumber,
        verificationOtp: otp
      };

      let user = await this.findOne(where);
      if (user) {
        return { status: user.status }
      } else {
        return false;
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * reset mpin
  * @param {Object} req
  */
  async resetMpin(req) {
    try {
      const user = req.user

      let otpVerify = await accountRepository.verifyOtpOnly(req);
      if (otpVerify) {
        await this.updatemPin(req)
        if (otpVerify.isEmail) {
          await user.update({
            verificationCode: null,
            codeSpentTime: null,
          });
        } else {
          await user.update({
            verificationOtp: null,
            otpSpentTime: null,
          });
        }

        return true
      } else {
        return false;
      }
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * verify mpin
  * @param {Object} req
  */
  async verifyMpin(req) {
    try {
      const user = req.user
      const bodyData = req.body
      let mPin = await encryptAPIs.encrypt(bodyData.mpin);
      let where = {
        mPin,
        id: user.id
      };

      let userData = await this.findOne(where);
      if (userData) {
        return true
      } else {
        return false;
      }
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get user details for admin 
   * @param {Object} req
   * @param {integer} userId
   */
  async userProfileForAdmin(userId, req) {
    try {
      let result = await User.findOne({
        where: {
          id: userId
        },
        attributes: {
          exclude: [
            'password',
            'verificationOtp',
            'passwordResetToken'
          ],
        },
        include: [
          {
            model: UserKyc,
            where: { status: req.userInfo.kycStatus },
            attributes: [
              'idProofName',
              'idProofImage',
              'addressProofName',
              'addressProofImage',
              'addressProofBackImage',
              'idProofBackImage',
              'status',
              'reason',
            ],
            required: false
          }
        ],
      });

      if (result.UserKycs.length > 0) {
        for (let index = 0; index < result.UserKycs.length; index++) {
          let idProofImageUrl = '';
          let addressProofImageUrl = '';
          let idProofBackImageUrl = '';
          let addressProofBackImageUrl = '';
          if (config.app.mediaStorage == 's3') {
            idProofImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].idProofImage);
            addressProofImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].addressProofImage);
            idProofBackImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].idProofBackImage);
            addressProofBackImageUrl = await mediaRepository.getSingedUrl(result.UserKycs[index].addressProofBackImage);
          } else {
            idProofImageUrl = `${config.app.baseUrl}${result.UserKycs[index].idProofImage}`;
            addressProofImageUrl = `${config.app.baseUrl}${result.UserKycs[index].addressProofImage}`;
            idProofBackImageUrl = result.UserKycs[index]?.idProofBackImage ? `${config.app.baseUrl}${result.UserKycs[index].idProofBackImage}` : '';
            addressProofBackImageUrl = result.UserKycs[index]?.addressProofBackImage ? `${config.app.baseUrl}${result.UserKycs[index].addressProofBackImage}` : '';
          }
          result.UserKycs[index].get()['idProofImageUrl'] = idProofImageUrl;
          result.UserKycs[index].get()['addressProofImageUrl'] = addressProofImageUrl;
          result.UserKycs[index].get()['idProofBackImageUrl'] = idProofBackImageUrl;
          result.UserKycs[index].get()['addressProofBackImageUrl'] = addressProofBackImageUrl;

        }
        return result;
      } else {
        return result;
      }


    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * create approver account
   * @param {Object} req
   */
  async createApprover(req) {
    try {
      let { email, firstName, lastName, password, status, roleId, phoneNumberCountryCode, phoneNumber } = req.body;
      if (!phoneNumber) {
        phoneNumberCountryCode = '';
        phoneNumber = '';
      }
      let hashPassword = await utility.generateHashPassword(password);
      const user = await User.create({
        email,
        firstName,
        lastName,
        password: hashPassword,
        userType: 'subadmin',
        status,
        roleId: roleId,
        phoneNumberCountryCode,
        phoneNumber

      });
      if (user) {
        let name = `${firstName} ${lastName} `
        const emailData = { to: user.email, name: name, password: password, email: user.email };

        Email.subadminCreateAccount(emailData)
          .then((result) => {
            logger.infoLogger.info('Mail sent successfully');
          })
          .catch((error) => {
            logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
          });
      }
      return user;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get sub admin list 
  * @param {Object} req
  */
  async getSubadminList(req) {
    try {
      const queryData = req.query;
      const headerValues = req.headers;
      const sortFields = ['id', 'name', 'email', 'phoneNumber', 'kycStatus', 'createdAt', 'updatedAt'];
      let orderBy = [['createdAt', 'DESC']];
      let fullNameWhere = {};
      let roleWhere = {};
      let roleRequired = false;
      let where = { status: { [Op.in]: ['active', 'inactive'] } };

      if (queryData.userType) {
        where.userType = queryData.userType
      } else {
        where.userType = 'subadmin';
      }
      if (queryData.phoneNumber) {
        where.phoneNumber = { [Op.like]: `%${queryData.phoneNumber}%` };
      }

      if (queryData.name) {
        fullNameWhere =
          Sequelize.where(Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), {
            [Op.like]: `%${queryData.name}%`
          })
      }

      if (queryData.email) {
        where.email = { [Op.like]: `%${queryData.email}%` };

      }

      if (queryData.status) {
        where.status = queryData.status;
      }
      if (queryData.role) {
        roleWhere.role = { [Op.like]: `%${queryData.role}%` };
        roleRequired = true
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
      if (queryData.sortBy && queryData.sortType && sortFields.includes(queryData.sortBy)) {
        if (queryData.sortBy == 'name') {
          orderBy = [[Sequelize.fn(
            'concat',
            Sequelize.col('User.first_name'),
            ' ',
            Sequelize.col('User.last_name')
          ), queryData.sortType]]
        } else {
          orderBy = [[queryData.sortBy, queryData.sortType]];
        }
      }
      const result = await User.findAndCountAll({
        where: {
          [Op.and]: [
            fullNameWhere,
            where
          ]
        },
        attributes: {
          exclude: ['password'],
        },
        include: [
          {
            model: UserRole,
            where: roleWhere,
            required: roleRequired
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
  * Remove auth token 
  * @param {Object} req
  * @param {boolean} tokenCheck
  */
  async subadminRemoveToken(req, tokenCheck = false) {
    let result = await UserToken.findOne({
      where: {
        userId: req.params.userId
      }
    });
    if (result) {
      if (result.accessToken) {
        if (tokenCheck) {
          return await activityLogRepository.saveActivityLog('logout', req);
        } else {
          return await activityLogRepository.saveActivityLog('inactivelogout', req);
        }

      }
    }
    return true;
  },
  /**
  * update firebase token 
  * @param {Object} req
  * @param {String} tokenCheck
  */
  async updateFirebaseToken(req) {
    let result = await UserToken.findOne({
      where: {
        userId: req.user.id
      }
    });
    if (result) {
      await result.update({ firebaseToken: req.body.firebaseToken });
    }
    return true;
  },

  /**
  * create approver account
  * @param {Object} req
  */
  async updateSubadmin(user, req) {
    try {
      let password = '';
      let { phoneNumber } = req.body;
      if (!phoneNumber) {
        req.body.phoneNumberCountryCode = '';
        req.body.phoneNumber = '';
      }
      if (req.body.password) {
        password = req.body.password;
        req.body.password = await utility.generateHashPassword(password);
      }

      const userData = await user.update(req.body);
      if (userData && password) {
        let name = `${userData.firstName} ${userData.lastName} `
        const emailData = { to: userData.email, name: name, password: password, email: userData.email };
        Email.subadminCreateAccount(emailData)
          .then((result) => {
            logger.infoLogger.info('Mail sent successfully');
          })
          .catch((error) => {
            logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
          });
      }
      return userData;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
 * Get code
 * @param {Object} req
 */
  async getCode() {
    try {
      let code = utils.generateRandomInteger(6);
      let userData = await this.findOne({ referralCode: code });
      if (!userData) {
        return code
      } else {
        this.getCode()
      }
    } catch (error) {
      throw Error(error);
    }
  },
};
