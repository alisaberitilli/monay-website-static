import mediaMiddleware from "./media-middleware";
import HttpStatus from "http-status";
import utility from "../services/utility";
import userRepository from "../repositories/user-repository";
import moment from "moment-timezone";
import { Op } from "sequelize";
import models from "../models";
const { ChangeMobileHistory } = models;
const dateFormat = "YYYY-MM-DD HH:mm:ss";

export default {
  /**
   * Check email exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkEmailExists(req, res, next) {
    try {
      const userData = req.user;
      const { email } = req.body;
      const user = await userRepository.findOne({ email });
      if (userData) {
        if (user && user.id != userData.id) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "EMAIL_EXIST"),
          });
        } else {
          next();
        }
      } else {
        if (user) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "EMAIL_EXIST"),
          });
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check phone number/email exists by username key
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkPhoneNumberExists(req, res, next) {
    try {
      const { phoneNumberCountryCode, username } = req.body;
      const isEmail = utility.validateEmail(username);
      let where = {};
      if (isEmail) {
        where.email = username;
      } else {
        where.phoneNumberCountryCode = phoneNumberCountryCode;
        where.phoneNumber = username;
      }
      const user = await userRepository.findOne(where);
      if (user) {
        req.parentUserData = user;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "USERNAME_NOT_FOUND"),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check phone number exists by phone number key
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUniquePhoneNumber(req, res, next) {
    try {
      const userData = req.user;
      const { phoneNumberCountryCode, phoneNumber } = req.body;
      if (phoneNumberCountryCode && phoneNumber) {
        const user = await userRepository.findOne({
          phoneNumberCountryCode,
          phoneNumber,
        });

        if (userData) {
          if (user && user.id != userData.id) {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "PHONE_EXIST"),
            });
          } else {
            next();
          }
        } else {
          if (user) {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "PHONE_EXIST"),
            });
          } else {
            next();
          }
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check phone number exists for sub admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUniquePhoneNumberSubadmin(req, res, next) {
    try {
      const userData = req.user;
      const { id, phoneNumberCountryCode, phoneNumber } = req.body;
      if (phoneNumberCountryCode && phoneNumber) {
        const user = await userRepository.findOne({
          phoneNumberCountryCode,
          phoneNumber,
        });

        if (userData) {
          if (user && user.id != id) {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "PHONE_EXIST"),
            });
          } else {
            next();
          }
        } else {
          if (user) {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: utility.getMessage(req, false, "PHONE_EXIST"),
            });
          } else {
            next();
          }
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check email exists for sub admin
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUniqueEmailSubadmin(req, res, next) {
    try {
      const { id, email } = req.body;
      if (email) {
        const user = await userRepository.findOne({ email });
        if (user && user.id != id) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "EMAIL_EXIST"),
          });
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user media for
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaFor(req, res, next) {
    const { params } = req;
    const basePathStr = params.basePath;
    const newImages = [];
    if (basePathStr && basePathStr !== req.user.profilePicture) {
      newImages.push(basePathStr);
    }
    params.basePath = "";
    params.basePathArray = newImages;
    return (
      (params.basePathArray.length > 0 &&
        mediaMiddleware.checkMediaFor(req, res, next)) ||
      next()
    );
  },

  /**
   * Check user media exist
   * Note:- this middleware after checkUserMediaExists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaExists(req, res, next) {
    const { params } = req;
    return (
      (params.basePathArray.length > 0 &&
        mediaMiddleware.checkMediaExists(req, res, next)) ||
      next()
    );
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
      currentDateTime = moment(currentDateTime)
        .subtract(10, "minutes")
        .format(dateFormat);
      const { phoneNumberCountryCode, username } = req.body;
      const isEmail = utility.validateEmail(username);
      let where = {};

      if (isEmail) {
        if (currentDateTime) {
          where.codeSpentTime = { [Op.gte]: currentDateTime };
        }
        where.email = username;
      } else {
        if (currentDateTime) {
          where.otpSpentTime = { [Op.gte]: currentDateTime };
        }
        where.phoneNumberCountryCode = phoneNumberCountryCode;
        where.phoneNumber = username;
      }
      const user = await userRepository.findOne(where);
      if (user) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "OTP_EXPIRE"),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check expire otp time for resend otp
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkResendOtpTime(req, res, next) {
    try {
      let currentDateTime = await userRepository.getCurrentDateTiem(req);
      const { phoneNumberCountryCode, username } = req.body;
      const isEmail = await utility.validateEmail(username);
      let where = {};
      if (isEmail) {
        where.email = username;
      } else {
        where.phoneNumberCountryCode = phoneNumberCountryCode;
        where.phoneNumber = username;
      }
      const user = await userRepository.findOne(where);
      if (user) {
        if (isEmail) {
          if (user.codeSpentTime) {
            let convertdate = moment.utc(user.codeSpentTime).toDate();
            let codeSpentTime = moment(convertdate).local().format(dateFormat);
            codeSpentTime = moment(codeSpentTime)
              .add(15, "seconds")
              .format(dateFormat);
            if (codeSpentTime < currentDateTime) {
              next();
            } else {
              res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                data: [],
                message: utility.getMessage(req, false, "OTP_15_SECONDS"),
              });
            }
          } else {
            next();
          }
        } else {
          if (user.otpSpentTime) {
            let convertdate = moment.utc(user.otpSpentTime).toDate();
            let otpSpentTime = moment(convertdate).local().format(dateFormat);
            otpSpentTime = moment(otpSpentTime)
              .add(15, "seconds")
              .format(dateFormat);
            if (otpSpentTime < currentDateTime) {
              next();
            } else {
              res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                data: [],
                message: utility.getMessage(req, false, "OTP_15_SECONDS"),
              });
            }
          } else {
            next();
          }
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "USERNAME_NOT_FOUND"),
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
  async checkPhoneExists(req, res, next) {
    try {
      const { phoneNumberCountryCode, phoneNumber } = req.body;
      let where = {};
      where.phoneNumberCountryCode = phoneNumberCountryCode;
      where.phoneNumber = phoneNumber;

      const user = await userRepository.findOne(where);
      if (user) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "MOBILE_NOT_FOUND"),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check company exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkCompanyExists(req, res, next) {
    try {
      const userData = req.user;
      const { companyName } = req.body;
      const user = await userRepository.findOne({ companyName });
      if (userData) {
        if (user && user.id != userData.id) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "COMPANY_EXIST"),
          });
        } else {
          next();
        }
      } else {
        if (user) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "COMPANY_EXIST"),
          });
        } else {
          next();
        }
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Kyc Status
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkKycStatus(req, res, next) {
    try {
      let user = req.user;
      if (user) {
        if (user.kycStatus == "uploaded" || user.kycStatus == "approved") {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "KYC_IN_APPROVAL_STATUS"),
          });
        } else {
          next();
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "MOBILE_NOT_FOUND"),
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
  async checkChangeExpireOtp(req, res, next) {
    try {
      let currentDateTime = await userRepository.getCurrentDateTiem(req);
      const phoneNumberCountryCode = req.body.phoneNumberCountryCode
        ? req.body.phoneNumberCountryCode
        : null;
      const username = req.body.email ? req.body.email : req.body.phoneNumber;
      const isEmail = utility.validateEmail(username);
      let where = { status: "pending" };
      if (isEmail) {
        where.email = username;
        where.type = "email";
      } else {
        where.phoneNumberCountryCode = phoneNumberCountryCode;
        where.phoneNumber = username;
      }
      const user = await ChangeMobileHistory.findOne({ where });
      if (user) {
        let convertdate = moment.utc(user.updatedAt).toDate();
        let otpSpentTime = moment(convertdate).format(dateFormat);
        otpSpentTime = moment(otpSpentTime)
          .utc()
          .add(15, "seconds")
          .format(dateFormat);
        if (otpSpentTime < currentDateTime) {
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "OTP_15_SECONDS"),
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
   * Check Qr scan details
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkQrScanDetailsExists(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const user = await userRepository.getOtherUserProfile(id);
      if (user) {
        req.body.userId = user?.id;
        req.body.phoneNumber = user?.phoneNumber;
        req.body.phoneNumberCountryCode = user?.phoneNumberCountryCode;
        // req.user = user;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "INVALID_DETAILS_QR"),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check ownphone number
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkOwnPhone(req, res, next) {
    try {
      const {
        body: { phoneNumberCountryCode, phoneNumber },
        user,
      } = req;
      let where = {
        phoneNumberCountryCode: phoneNumberCountryCode,
        phoneNumber: phoneNumber,
        userType: "user",
      };
      const userDetails = await userRepository.findOne(where);
      if (userDetails) {
        if (userDetails.id === user?.id) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, "YOU_CAN_NOT_REQUEST"),
          });
        } else if (phoneNumberCountryCode !== user?.phoneNumberCountryCode) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(
              req,
              false,
              "COUNTRY_CODE_SHOULD_BE_SAME"
            ),
          });
        } else {
          next();
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, "PRIMARY_USER_NOT_FOUND"),
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
