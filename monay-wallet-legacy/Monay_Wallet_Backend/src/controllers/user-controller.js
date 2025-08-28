import HttpStatus from 'http-status';
import { Op } from 'sequelize';
import repositories from '../repositories';
import models from '../models';
import utility from '../services/utility';
import logger from '../services/logger';
import Email from '../services/email';

const { UserToken, UserKyc, ChildParent } = models;
const {
  userRepository,
  accountRepository,
  paymentRequestRepository,
  transactionRepository,
  changeMobileHistoryRepository,
  userKycRepository,
  activityLogRepository,
  parentChildRepository,
  notificationRepository
} = repositories;

export default {

  /**
   * Get all user list for admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserListForAdmin(req, res, next) {
    try {
      const result = await userRepository.getUserList(req);
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
   * Change user status by admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changeStatus(req, res, next) {
    try {
      const userObject = req.userInfo;
      const bodyData = req.body;
      await userRepository.updateUser(userObject, bodyData);
      if (bodyData.status != 'active') {
        await userRepository.subadminRemoveToken(req);
        await UserToken.destroy({
          where: {
            userId: req.params.userId
          }
        });
      }
      if (userObject.userType = 'subadmin') {
        await activityLogRepository.saveActivityLog('subadmin_change_status', req);
      } else {
        await activityLogRepository.saveActivityLog('change_status', req);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: [],
        message: utility.getMessage(req, false, 'USER_STATUS_UPDATED')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Update user/merchant profile by user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateProfile(req, res, next) {
    try {
      const result = await userRepository.updateProfile(req);
      if (result) {
        let userInfo = await userRepository.getUserProfile(req.user.id, req);
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
   * Save user/merchant kyc 
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveUserKyc(req, res, next) {
    try {
      const result = await userKycRepository.saveUserKyc(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'USER_KYC')
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
 * Update user/merchant mpin
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async updatemPin(req, res, next) {
    try {
      const result = await userRepository.updatemPin(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'MPIN_CREATED')
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
  * After check phone return user detail 
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkUserPhone(req, res, next) {
    try {
      let { id,
        firstName,
        lastName,
        email,
        profilePictureUrl,
        phoneNumberCountryCode,
        phoneNumber } = req.user;
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          id,
          firstName,
          lastName,
          email,
          profilePictureUrl,
          phoneNumberCountryCode,
          phoneNumber
        },
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
  * User Home screen recent transactions and wallet balance
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async home(req, res, next) {
    try {
      let data = {
        creditWalletAmount: 0,
        debitWalletAmount: 0,
        totalWalletAmount: 0,
        paymentRequest: [],
        recentTransaction: [],
        unReadCount: 0
      };
      const secondaryUserLimit = await ChildParent.findOne({ where: { userId: req?.user?.id, status: { [Op.ne]: 'deleted' } } });
      data.secondaryUserLimit = secondaryUserLimit?.remainAmount ?? 0;
      const unReadCount = await userRepository.getUserNotificationCount(req.user.id);
      if (unReadCount) {
        data.unReadCount = unReadCount;
      }
      const walletAmmount = await transactionRepository.getWalletBalance(req.user.id);
      const paymentRequest = await paymentRequestRepository.recentPaymentRequest(req.user.id);
      const recentTransaction = await transactionRepository.recentTransaction(req.user.id);
      if (paymentRequest) {
        data.paymentRequest = paymentRequest;
      }
      if (recentTransaction) {
        data.recentTransaction = recentTransaction;
      }
      if (walletAmmount) {
        data.creditWalletAmount = walletAmmount.creditWalletAmount.toFixed(2);
        data.debitWalletAmount = walletAmmount.debitWalletAmount.toFixed(2);
        data.totalWalletAmount = walletAmmount.totalWalletAmount.toFixed(2);
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: data,
        message: utility.getMessage(req, false, 'DASHBOARD_DETAIL')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
  * Search user by name and phone number
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async recentUser(req, res, next) {
    try {
      const userList = await userRepository.recentUserList(req);
      if (userList.count > 0) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: { rows: userList.rows, total: userList.count },
          message: ""
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'RECENT_USER_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Get recent payment user list
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async recentPaymentUser(req, res, next) {
    try {
      const userList = await userRepository.recentPaymentUserList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: { rows: userList.rows, total: userList.count },
        message: utility.getMessage(req, false, (userList.count > 0) ? "" : 'RECENT_USER_NOT_FOUND')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
  * Get other user profile info
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async userProfile(req, res, next) {
    try {
      const { params: { userId } } = req
      const user = await userRepository.getOtherUserProfile(userId, req);
      if (user) {
        if (req.user.phoneNumberCountryCode == user.phoneNumberCountryCode) {
          if (user.status == 'active') {
            res.status(HttpStatus.OK).json({
              success: true,
              data: user,
              message: utility.getMessage(req, false, "")
            });
          } else {
            res.status(HttpStatus.OK).json({
              success: false,
              data: {},
              message: utility.getMessage(req, false, (user.status == 'pending') ? 'RECENT_USER_NOT_FOUND' : 'ACCOUNT_DISABLED')
            });
          }
        } else {
          res.status(HttpStatus.OK).json({
            success: false,
            data: {},
            message: utility.getMessage(req, false, 'TRANSACTION_RESTRICTED')
          });
        }
      } else {
        res.status(HttpStatus.OK).json({
          success: false,
          data: {},
          message: utility.getMessage(req, false, 'RECENT_USER_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * change phone number
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async changePhoneNumber(req, res, next) {
    try {
      const { phoneNumberCountryCode, phoneNumber } = req.body;
      const user = await userRepository.findOne({ phoneNumberCountryCode, phoneNumber });

      if (!user) {
        const result = await changeMobileHistoryRepository.updatePhoneNumber(req);
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'CHANGE_MOBILE_OTP_SENT')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PHONE_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Verify change mobile number otp
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async verifyChangePhonenumberOtp(req, res, next) {
    try {
      const user = await changeMobileHistoryRepository.verifyPhonenumberOtp(req);
      if (user) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'CHANGE_MOBILE_OTP_VERIFY')
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
  * Verify change email verifiaction code 
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async verifyChangeEmailOtp(req, res, next) {
    try {
      const user = await changeMobileHistoryRepository.verifyEmailOtp(req);
      if (user) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'EMAIL_OTP_VERIFIED')
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
  * Send email verification link to user
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async changeEmail(req, res, next) {
    try {
      const { email } = req.body;
      const user = await userRepository.findOne({ email });
      if (!user) {
        const result = await changeMobileHistoryRepository.updateEmail(req);
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
            message: utility.getMessage(req, false, 'TRY_AGAIN')
          });
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'EMAIL_EXIST')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
    * Resend email verification otp
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async resendVerificationCode(req, res, next) {
    try {
      const user = await userRepository.resendVerificationCode(req);
      if (user) {
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
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'MOBILE_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
    * verify email otp
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async verifyOtp(req, res, next) {
    try {
      const result = await accountRepository.verifyOtpOnly(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'OTP_VERIFIED')
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
    * Reset Mpin
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async resetMpin(req, res, next) {
    try {
      const result = await userRepository.resetMpin(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'PIN_RESET_SUCCESSFULLY')
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
    * Verify MPin
    * @param {Object} req
    * @param {Object} res
    * @param {Function} next
    */
  async verifyMpin(req, res, next) {
    try {
      const result = await userRepository.verifyMpin(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'PIN_VERIFY_SUCCESSFULLY')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'MPIN_NOT_MATCH')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * change user MPIN api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changePIN(req, res, next) {
    try {
      const result = await userRepository.changePIN(req);
      if (result) {
        if (result && result.status == 'changed') {
          res.status(HttpStatus.OK).json({
            success: true,
            data: [],
            message: utility.getMessage(req, false, 'MPIN_CHANGED')
          });
        } else {
          let msg = utility.getMessage(req, false, 'INVALID_MPIN')
          if (result.status === 'newAndExistPinSame') {
            msg = utility.getMessage(req, false, 'NEW_AND_EXIST_SAME_MPIN')
          }
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: null,
            message: msg
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
   * Update user KYC status by admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changeKycStatus(req, res, next) {
    try {
      const userObject = req.userInfo;
      const bodyData = req.body;
      let isKycVerified = (bodyData.status == 'approved') ? true : false;
      let kycData = await UserKyc.findOne({ where: { userId: userObject.id, status: 'uploaded' } });
      if (kycData) {
        await kycData.update({ status: bodyData.status, reason: bodyData.reason });
      }
      await userRepository.updateUser(userObject, {
        isKycVerified: isKycVerified,
        kycStatus: bodyData.status
      });
      await notificationRepository.kycApproval(req);
      await activityLogRepository.saveActivityLog('change_kyc_status', req);
      // send otp on email
      let subject = (bodyData.status == 'approved') ? 'Monay - Your KYC has been approved' : 'Monay - Your KYC has been rejected.';
      let fullName = `${userObject.firstName} ${userObject.lastName}`;
      const data = { to: userObject.email, email: userObject.email, name: fullName, reason: bodyData.reason, status: bodyData.status, subject: subject };
      Email.kycApprovalRejected(data).then((result) => {
        return true;
      }).catch((error) => {
        logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
        return false;
      });
      res.status(HttpStatus.OK).json({
        success: true,
        data: [],
        message: utility.getMessage(req, false, 'USER_KYC_STATUS_UPDATED')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Update admin and subadmin profile
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async userProfileForAdmin(req, res, next) {
    try {
      const { params: { userId } } = req
      const user = await userRepository.userProfileForAdmin(userId, req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: user,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
* Update firebase token
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async updateFirebaseToken(req, res, next) {
    try {
      await userRepository.updateFirebaseToken(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {},
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
* Get secondary user list
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async allSecondaryUser(req, res, next) {
    try {
      const result = await parentChildRepository.allSecondaryUser(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },


  /**
* Get secondary user details
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async secondaryUserDetails(req, res, next) {
    try {
      const { secondaryUser } = req;
      res.status(HttpStatus.OK).json({
        success: true,
        data: secondaryUser,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Secondary User Status Update
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async secondaryUserStatusUpdate(req, res, next) {
    try {
      const result = await parentChildRepository.secondaryUserStatusUpdate(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'USER_STATUS_UPDATED')
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
  * Secondary User Limit Update
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async secondaryUserLimitUpdate(req, res, next) {
    try {
      const result = await parentChildRepository.secondaryUserStatusUpdate(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'USER_LIMIT_UPDATED')
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
 * Secondary User delete
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
  async secondaryUserDelete(req, res, next) {
    try {
      req.body.status = 'deleted';
      const result = await parentChildRepository.secondaryUserStatusUpdate(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'SECONDARY_USER_DELETED')
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
* wallet Limit Update for parent
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async walletLimitUpdate(req, res, next) {
    try {
      const result = await parentChildRepository.walletLimitUpdate(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'MINIMUM_WALLET_LIMIT_UPDATED')
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
* Set auto toup status
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
  async autoToupUpdateStatus(req, res, next) {
    try {
      const result = await parentChildRepository.autoToupUserStatusUpdate(req);
      if (result) {
        const msg = (req.body.autoToupStatus === 'true') ? 'AUTO_TOP_ENROLLED' : 'AUTO_TOP_UNENROLLED';
        res.status(HttpStatus.OK).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, msg)
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
   * Auto topup status update
   */
  async autoToupUserStatusUpdate(req) {
    try {
      const { user, body} = req;
      return user.update(body);
    } catch (error) {
      next(error);
    }
  }
};
