import HttpStatus from 'http-status';
import { Op } from 'sequelize';
import utility from '../services/utility.js';
import repositories from '../repositories';
import sms from '../services/sms.js';
import encryptAPIs from '../services/encrypt.js';
import config from '../config/index.js'
const { accountRepository, userRepository, activityLogRepository , parentChildRepository } = repositories;

export default {
  /**
   * Send otp when user try to signup
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async sendOtp(req, res, next) {
    try {
      const { phoneNumber } = req.body;
      const mobile = phoneNumber && phoneNumber.startsWith('+') ? phoneNumber : '+1' + phoneNumber;
      let verificationOtp = utility.generateOtp();
      console.log('verificationOtp', verificationOtp, phoneNumber);
      let encrypedVerificationOtp = await encryptAPIs.encrypt(`${verificationOtp}`);
      let otpSpentTime = await userRepository.getCurrentDateTiem(req);
      const user = await userRepository.findOne({ mobile });
      if (user && (user.status === 'pending')) {
        // existing user otp updated in db and sent to user
        await userRepository.updateUser(user, { verificationOtp: encrypedVerificationOtp, otpSpentTime });
        let OtpMessage = utility.getMessage(req, false, 'SEND_OTP_MESSAGE')
        OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
        await sms.sendOtp(mobile, OtpMessage);
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'OTP_SEND')
        });
      } else if (user && user.status === 'active') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_ACTIVE')
        });
      } else if (user && user.status === 'inactive') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
        });
      } else if (!user) {
        // new user created with otp and sent to user
        await userRepository.createUserRegistration(req, encrypedVerificationOtp);
        let OtpMessage = utility.getMessage(req, false, 'SEND_OTP_MESSAGE')
        OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
        await sms.sendOtp(mobile, OtpMessage);
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'OTP_SEND')
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
  },
  /**
   * User login 
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async userAccountLogin(req, res, next) {
    try {
      let user = await accountRepository.checkUserAccountLogin(req);
      if (user.token) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: user,
          message: utility.getMessage(req, false, 'LOGIN_SUCCESS')
        });
      } else {
        if (user.status == 'inactive') {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            status: 'ACCOUNT_INACTIVE',
            message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
          });
        } else if (user.status == 'pending') {
          res.status(HttpStatus.OK).json({
            success: false,
            data: { status: user.status },
            message: utility.getMessage(req, false, 'ACCOUNT_PENDING')
          });
        } else if (user.status == 'verify_email') {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, 'EMAIL_NOT_VERIFIED')
          });
        } else if (user.status == 'verify_phone_number') {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, 'PHONE_NOT_VERIFIED')
          });
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, 'INVALID_USER_CREDENTIAL')
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin login
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async login(req, res, next) {
    try {
      let user = await accountRepository.checkLogin(req);
      if (user.token) {
        req.user = user;
        // admin activity log
        await activityLogRepository.saveActivityLog('login', req);
        user.permissions = (user.UserRole) ? user.UserRole.RolePermissions : null
        user.countryPhoneCode = config.region.countryPhoneCode;
        res.status(HttpStatus.OK).json({
          success: true,
          data: user,
          message: utility.getMessage(req, false, 'LOGIN_SUCCESS')
        });
      } else {
        if (user.status == 'inactive') {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
          });
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'INVALID_CREDENTIAL')
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * User logout api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async logout(req, res, next) {
    try {
      const userData = req.user;
      const userDevice = await accountRepository.getUserDeviceToken(userData.id);
      if (userDevice) {
        const data = { accessToken: null, firebaseToken: null };
        await accountRepository.updateUserDevice(userDevice, data);
        if (userData.userType == 'admin' || userData.userType == 'subadmin') {
          await activityLogRepository.saveActivityLog('logout', req);
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'LOGOUT_SUCCESS')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'USER_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * User change password 
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changePassword(req, res, next) {
    try {
      const result = await userRepository.changePassword(req);
      if (result) {
        if (result.status == 'changed') {
          await activityLogRepository.saveActivityLog('change_password', req);
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, 'PASSWORD_CHANGED')
          });
        } else if (result.status == 'samepassword') {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: null,
            message: utility.getMessage(req, false, 'CURRENT_PASSWORD_NOT_MATCH')
          });
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: null,
            message: utility.getMessage(req, false, 'INVALID_PASSWORD')
          });
        }
      } else {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'UNAUTHORISED_ACCESS')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Admin forgot password
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async adminForgotPassword(req, res, next) {
    try {
      let result = await accountRepository.adminForgotPassword(req);
      if (result) {
        if (result.status == 'inactive') {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
          });
        } else if (result.status == 'send_error') {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: result.message
          });
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, 'PASSWORD_LINK_SENT')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'EMAIL_NOT_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset admin password
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async resetAdminPassword(req, res, next) {
    try {
      const user = await accountRepository.resetAdminPassword(req);
      if (user && user.status === 'updated') {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'PASSWORD_CHANGED')
        });
      } else if (user && user.status == 'inactive') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
        });
      } else if (user && user.status == 'samepassword') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'CURRENT_PASSWORD_NOT_MATCH')
        });
      } else if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PASSWORD_LINK_EXPIRED')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Reset user password
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async resetPassword(req, res, next) {
    try {
      const user = await accountRepository.resetPassword(req);
      if (user && user.status === 'updated') {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'PASSWORD_CHANGED')
        });
      } else if (user && user.status == 'inactive') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
        });
      } else if (user && user.status == 'samepassword') {
        // return if user try to enter old password in new password field
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'CURRENT_PASSWORD_NOT_MATCH')
        });
      } else if (!user) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_OTP')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * User detail
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async getUserDetail(req, res, next) {
    try {
      const userId = req.params.userId;
      let userInfo = await userRepository.getUserProfile(userId, req);
      const { password, mPin, ...userData } = userInfo.get();
      const isMpinSet = userInfo.mPin !== null ? true : false
      req.query.userId = userId;
      res.status(HttpStatus.OK).json({
        success: true,
        data: { isMpinSet, ...userData },
        message: utility.getMessage(req, false, 'USER_DETAIL')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update admin profile
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateProfile(req, res, next) {
    try {
      const result = await userRepository.updateProfile(req);
      if (result) {
        let userInfo = await userRepository.getUserProfile(req.user.id, req);
        await activityLogRepository.saveActivityLog('update_profile', req);
        res.status(HttpStatus.OK).json({
          success: true,
          data: userInfo,
          message: utility.getMessage(req, false, 'PROFILE_UPDATED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * User signup after verify otp
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async signup(req, res, next) {
    try {
      let { password } = req.body;
      const result = await userRepository.signup(req);
      if (result) {
        req.body.username = result.mobile;
        req.body.phoneCountryCode = ''; // Not used anymore
        req.body.password = password;
        let user = await accountRepository.checkUserAccountLogin(req);
        if (user.token) {
          res.status(HttpStatus.OK).json({
            success: true,
            data: user,
            message: utility.getMessage(req, false, 'LOGIN_SUCCESS')
          });
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, 'SIGNUP')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Send Email Verification Code
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async sendEmailVerificationCode(req, res, next) {
    try {
      const result = await userRepository.sendEmailVerificationCode(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'SEND_EMAIL_VERIFICATION')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Merchant signup after verify otp
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async merchantSignup(req, res, next) {
    try {
      let { password } = req.body;
      const result = await userRepository.merchantSignup(req);
      if (result) {
        req.body.username = result.mobile;
        req.body.phoneCountryCode = ''; // Not used anymore
        req.body.password = password;
        let user = await accountRepository.checkUserAccountLogin(req);
        if (user.token) {
          res.status(HttpStatus.OK).json({
            success: true,
            data: user,
            message: utility.getMessage(req, false, 'LOGIN_SUCCESS')
          });
        } else {
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, 'SIGNUP')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'USER_NOT_FOUND'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Verify mobile and email otp
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async verifyOtp(req, res, next) {
    try {
      const result = await accountRepository.verifyOtp(req);
      if (result) {
        let message = utility.getMessage(req, false, 'MOBILE_OTP_VERIFIED');
        if (result.isEmail) {
          message = utility.getMessage(req, false, 'EMAIL_OTP_VERIFIED');
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_OTP')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Verify OTP Only
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async verifyOtpOnly(req, res, next) {
    try {
      const result = await accountRepository.verifyOtpOnly(req);
      if (result) {
        let message = utility.getMessage(req, false, 'MOBILE_OTP_VERIFIED');
        if (result.isEmail) {
          message = utility.getMessage(req, false, 'EMAIL_OTP_VERIFIED');
        }
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_OTP')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
    * Resend verification code
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async resendVerificationCode(req, res, next) {
    try {
      const user = await userRepository.resendVerificationCode(req);
      if (user) {
        if (user && user.status === 'updated') {
          let message = 'OTP_SEND';
          const isEmail = utility.validateEmail(req.body.username);
          if (isEmail) {
            message = 'SEND_EMAIL_VERIFICATION';
          }
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, message)
          });
        } else if (user && user.status == 'inactive') {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: null,
            message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'USERNAME_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Send otp when secondary user send otp to primary user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
   async sendOtpPrimaryUser(req, res, next) {
    try {
      const { phoneNumber } = req.body;
      const mobile = phoneNumber && phoneNumber.startsWith('+') ? phoneNumber : '+1' + phoneNumber;
     
      let verificationOtp = utility.generateOtp();
      console.log('verificationOtp', verificationOtp, phoneNumber);
      let encrypedVerificationOtp = await encryptAPIs.encrypt(`${verificationOtp}`);
      // Find primary consumer user (basic, verified, premium, or secondary)
      const user = await userRepository.findOne({ 
        mobile, 
        role: { [Op.in]: ['basic_consumer', 'verified_consumer', 'premium_consumer', 'secondary_user'] } 
      });
       if (user && (user.status === 'active')) {
        // existing user otp updated in db and sent to user
        await parentChildRepository.updateSecondaryUser(req.user?.id ,{parentId:user.id, verificationOtp: encrypedVerificationOtp});
        let OtpMessage = utility.getMessage(req, false, 'SEND_OTP_MESSAGE')
        OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
        await sms.sendOtp(mobile, OtpMessage);
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'OTP_SEND')
        });
      } else if (user && user.status === 'pending') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PRIME_ACCOUNT_PENDING')
        });
      } else if (user && user.status === 'inactive') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE')
        });
      }  else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Verify otp for secondary otp
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
   async verifyPrimaryOtp(req, res, next) {
    try {
      const result = await parentChildRepository.verifyPrimaryOtp(req);
      if (result) {
        let message = utility.getMessage(req, false, 'USER_LINKED');
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_OTP')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Verify  secondary User
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
   async verifySecondaryUser(req, res, next) {
    try {
      const result = await parentChildRepository.verifySecondaryUser(req);
      if (result) {
        let message = utility.getMessage(req, false, 'USER_LINKED');
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: message
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'INVALID_OTP')
        });
      }
    } catch (error) {
      next(error);
    }
  },

};
