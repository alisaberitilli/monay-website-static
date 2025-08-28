import HttpStatus from 'http-status';
import repositories from '../repositories';
import encryptAPIs from '../services/encrypt';
import utility from '../services/utility';
import moment from 'moment';
import { Op } from 'sequelize';

const { userRepository, parentChildRepository, transactionRepository } = repositories;

export default {

  /**
   * Check user exist by query params
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkUserExists(req, res, next) {
    try {
      if (req.params.userId) {
        let { userId } = req.params
        const result = await userRepository.findOne({ id: userId });
        if (result) {
          if (result.status == 'active') {
            req.userInfo = result;
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'ACCOUNT_DISABLED')
            });
          }
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND')
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Check user exist by body
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
 */
  async checkPrimaryUserExists(req, res, next) {
    try {
      let { userId } = req.body;
      const result = await userRepository.findOne({ id: userId, userType: 'user' });
      if (result) {
        if (result.status == 'active') {
          req.userInfo = result;
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'ACCOUNT_DISABLED')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'USER_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
* Check user exist by body
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async checkSecondaryExist(req, res, next) {
    try {
      let { userId } = req.body;
      const result = await parentChildRepository.findOne({ userId: req.user?.id, parentId: userId });
      if (result) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'AlREADY_PRIME')
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check user exist by body data
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
  */
  async checkUserIdExists(req, res, next) {
    try {
      let userId = (req.body.userId) ? req.body.userId : (req.params.userId) ? req.params.userId : null;
      if (userId) {
        const result = await userRepository.findOne({ id: userId });
        if (result) {
          req.userInfo = result;
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND')
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Check phone number exists
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkUserPhoneNumber(req, res, next) {
    try {
      const { phoneNumberCountryCode, phoneNumber } = req.query;
      let where = { status: { [Op.ne]: 'deleted' } };
      if (phoneNumberCountryCode) {
        where.phoneNumberCountryCode = phoneNumberCountryCode;
      }
      where.userType = { [Op.in]: ['user', 'merchant'] }
      where.phoneNumber = phoneNumber;
      const user = await userRepository.findOne(where);
      if (user) {
        if (user.status == 'active') {
          req.user = user;
          next();
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, (user.status == 'pending') ? 'RECENT_USER_NOT_FOUND' : 'ACCOUNT_DISABLED')
          });
        }
      } else {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: 'PHONE_NOT_FOUND'
        });
      }

    } catch (error) {
      next(error);
    }
  },
  /**
  * Validate user phone number
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async validateUserPhoneNumber(req, res, next) {
    try {

      const { phoneNumberCountryCode, phoneNumber } = req.body;
      if (
        req.user.phoneNumberCountryCode === phoneNumberCountryCode &&
        req.user.phoneNumber === phoneNumber
      ) {
        next();
      } else {
        res.status(HttpStatus.OK).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'MOBILE_NOT_FOUND')
        });
      }

    } catch (error) {
      next(error);
    }
  },


  /**
 * Validate user phone number
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async validateUserInfo(req, res, next) {
    try {
      const { phoneNumberCountryCode, username } = req.body;
      const isEmail = utility.validateEmail(username);
      if (isEmail) {
        if (req.user.email.toLowerCase() === username.toLowerCase()) {
          if (req.user.isEmailVerified) {
            next();
          } else {
            res.status(HttpStatus.OK).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'EMAIL_NOT_VERIFIED')
            });
          }
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'INVALID_EMAIL')
          });
        }
      } else {
        if (req.user.phoneNumberCountryCode === phoneNumberCountryCode &&
          req.user.phoneNumber === username) {
          if (req.user.isMobileVerified) {
            next();
          } else {
            res.status(HttpStatus.OK).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'PHONE_NOT_VERIFIED')
            });
          }
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'INVALID_MOBILE')
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
  * Check mPin exists
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkUserMpin(req, res, next) {
    try {

      const { body: { mpin }, user: { id } } = req;
      let mPin = await encryptAPIs.encrypt(`${mpin}`);
      let where = {
        id,
        mPin
      };
      const user = await userRepository.findOne(where);
      if (user) {
        next();
      } else {
        res.status(HttpStatus.OK).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_MPIN')
        });
      }

    } catch (error) {
      next(error);
    }
  },
  /**
  * Check expire otp
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkResendOtpTime(req, res, next) {
    try {
      let currentDateTime = await userRepository.getCurrentDateTiem(req);
      const user = req.user;
      if (user) {
        if (user.otpSpentTime) {
          let convertdate = moment.utc(user.otpSpentTime).toDate();
          let otpSpentTime = moment(convertdate).local().format(utility.getDateFormat());
          otpSpentTime = moment(otpSpentTime).add(15, "seconds").format(utility.getDateFormat());
          if (otpSpentTime < currentDateTime) {
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'OTP_15_SECONDS')
            });
          }

        } else {
          next();
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'MOBILE_NOT_FOUND')
        });
      }

    } catch (error) {
      next(error);
    }
  },
  /**
* Check expire otp
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async checkExpireOtp(req, res, next) {
    try {
      let currentDateTime = await userRepository.getCurrentDateTiem(req);
      currentDateTime = moment(currentDateTime).subtract(10, "minutes").format(utility.getDateFormat());
      const { phoneNumberCountryCode, phoneNumber } = req.body;
      let where = {
        otpSpentTime: { [Op.gte]: currentDateTime },
        phoneNumberCountryCode,
        phoneNumber
      };

      const user = await userRepository.findOne(where);
      if (user) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'OTP_EXPIRE')
        });
      }

    } catch (error) {
      next(error);
    }
  },

  /**
 * Check phone number exists
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async checkUserEmailExist(req, res, next) {
    try {
      const { email } = req.query;
      let where = {};
      where.email = email;
      const user = await userRepository.findOne(where);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(HttpStatus.OK).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'EMAIL_NOT_FOUND')
        });
      }

    } catch (error) {
      next(error);
    }
  },

  /**
  * Check user exist by query params
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
 */
  async checkUserExistsOnly(req, res, next) {
    try {
      if (req.params.userId) {
        let { userId } = req.params
        const result = await userRepository.findOne({ id: userId, userType: { [Op.in]: ['merchant', 'user', 'secondary_user'] } });
        if (result) {
          if (result.status == 'active') {
            req.userInfo = result;
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'ACCOUNT_DISABLED')
            });
          }
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND')
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
* Check secondary user exists
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async checkSecondaryUserExists(req, res, next) {
    try {
      const { params: { id, type, parentUser } } = req;
      const where = {
        id,
        status: { [Op.ne]: 'deleted' },
      };
      if (type) {
        delete where.id;
        where.userId = id;
        where['$User.user_type$'] = 'secondary_user';
      }
      if (parentUser) {
        delete where.userId;
        delete where.id;
        where.parentId = id;
        where['$parent.user_type$'] = 'user';
      }

      const user = await parentChildRepository.secondaryUserDetails(where);
      if (user) {
        req.secondaryUser = user;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, parentUser ? 'PARENT_USER_NOT_FOUND' : 'SECONDARY_USER_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
* Check secondary user verification check
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async checkSecondaryUserVerifyCheck(req, res, next) {
    try {
      const { params: { id } } = req;
      const where = {
        id,
        '$User.user_type$': 'secondary_user',
        status: { [Op.ne]: 'deleted' },
        isParentVerified: true
      };
      const user = await parentChildRepository.secondaryUserDetails(where);
      if (user) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'SECONDARY_USER_VERIFICATION_PENDING')
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
* Check parent user wallet limit and assign limit check
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async checkWalletLimitCheck(req, res, next) {
    try {
      const { body: { limit } } = req;
      const parentLimit = await transactionRepository.getParentWalletLimit(req);
      if (parseInt(parentLimit) >= parseInt(limit)) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'PARENT_WALLET_LIMIT_NOT_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
  * Check user exist by query params
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
 */
  async checkUserExistsPayOnly(req, res, next) {
    try {
      if (req.body.toUserId) {
        let { toUserId } = req.body
        const result = await userRepository.findOne({ id: toUserId, userType: { [Op.in]: ['merchant', 'user'] } });
        if (result) {
          if (result.status == 'active') {
            req.userInfo = result;
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, 'ACCOUNT_DISABLED')
            });
          }
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND')
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Self parent payment request
   */
  async checkSelfParentExistsOnly(req, res, next) {
    try {
      const { user: { id }, body: { toUserId }, userInfo } = req;
      const parentDetails = await parentChildRepository.findOne({ parentId: toUserId, userId: id, status: {[Op.ne]:"deleted"} });

      if (parentDetails) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'YOU_CAN_NOT_REQUEST_SELF_PARENT')
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  }
};
