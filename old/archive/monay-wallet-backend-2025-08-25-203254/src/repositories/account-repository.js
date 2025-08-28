import { Op, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import Email from '../services/email';
import utility from '../services/utility';
import jwt from '../services/jwt';
import models from '../models';
import userRepository from './user-repository';
import encryptAPIs from '../services/encrypt';
import config from '../config';
import path from 'path';
import fs from 'fs';
import logger from '../services/logger';
import mediaRepository from './media-repository';
const { User, UserToken, UserDevice, UserRole, RolePermission, ChildParent, Country, UserKyc } = models;
const QRCode = require('qrcode')
var uniqid = require('uniqid');

export default {
  /**
    * Generate unique code for QR
    * @param {Object} req
  */
  async getUniqueId() {
    try {
      let uniqueCode = uniqid();
      // Skip checking for existing uniqueCode since we're using UUID IDs
      // let isExist = await User.findOne({
      //   where: { uniqueCode: uniqueCode }
      // });
      // if (!isExist) {
      return uniqueCode;
      // }
      // this.getUniqueId();
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Generate QR image and upload on S3
   * @param {Object} req
  */
  async generateQrCode(userId) {
    try {
      if (config.app.mediaStorage == 's3') {
        await mediaRepository.generateQrCodeOnS3(userId);
      } else {
        let userInfo = await User.findOne({ where: { id: userId } });
        if (userInfo && !userInfo.qrCode) {
          let uniqueCode = await this.getUniqueId();
          if (uniqueCode) {
            const fileDir = path.join(__dirname, `../../public/uploads/qrcode`);
            if (!fs.existsSync(fileDir)) {
              fs.mkdirSync(fileDir, { recursive: true }, (err) => {
                throw Error(err);
              });
            }
            QRCode.toFile(`${fileDir}/qrcode_${uniqueCode}.png`, JSON.stringify({ userId: uniqueCode }), {
              width: 200,
              color: {
                dark: '#000',  // QR Color
                light: '#fff' // Transparent background
              }
            }, async function (err) {
              if (err) throw err
              await userInfo.update({ qrCode: `public/uploads/qrcode/qrcode_${uniqueCode}.png` });
            });
          }
        }
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Generate unique account number for both user and merchant
  * @param {Object} req
  */
  async generateAccounNumber(userId) {
    try {

      let userInfo = await User.findOne({ where: { id: userId } });
      if (userInfo && !userInfo.accountNumber) {
        let accountNumber = null;
        let padNumber = userId.toString().padStart(7, '0');
        if (userInfo.userType == 'merchant') {
          accountNumber = 'MM1' + padNumber
        } else if (userInfo.userType == 'user') {
          accountNumber = 'MC1' + padNumber
        }
        if (accountNumber) {
          await userInfo.update({ accountNumber: accountNumber });
        }
      }
    } catch (error) {
      throw Error(error);
    }
  },
  /**
    * Check user or Merchant login
    * @param {Object} req
    */
  async checkUserAccountLogin(req) {
    try {
      let { phoneCountryCode, username, password, firebaseToken, deviceType } = req.body;
      let where = {
        role: { [Op.ne]: 'platform_admin' },
        isDeleted: false
      };
      const isEmail = await utility.validateEmail(username);
      if (isEmail) {
        where.email = username;
      } else {
        // Use mobile number directly (already includes country code)
        where.mobile = username;
      }
      let user = await User.findOne({
        where: where,
        attributes: {
          exclude: [
            'companyName',
            'taxId',
            'chamberOfCommerce',
            'verifyToken',
            'verificationOtp',
            'passwordResetToken'
          ]
        }
      });
      if (user) {
        // Check if verification is needed based on login method
        if (isEmail) {
          if (!user.isEmailVerified) {
            return { status: 'verify_email' };;
          }
        } else {
          if (!user.isMobileVerified) {
            return { status: 'verify_phone_number' };;
          }
        }

        if (user.isActive && !user.isBlocked) {
          const isMpinSet = user.mPin !== null ? true : false
          const isPasswordMatch = await this.compareUserPassword(password, user.password);
          if (isPasswordMatch) {
            const { password, mPin, ...userData } = user.get();
            const token = jwt.createToken(userData);

            const deviceData = {
              userId: userData.id,
              firebaseToken,
              deviceType,
              accessToken: token
            };
            await this.addUpdateUserDevice(deviceData);
            // const xForwardedFor = (req.headers['x-forwarded-for'] || '').replace(/:\d+$/, '');
            // const ip = xForwardedFor || req.connection.remoteAddress;
            let userDeviceData = {
              userId: user.id,
              // ip,
              deviceType,
              appVersion: (req.headers['app-version']) ? req.headers['app-version'] : null,
              timezone: (req.headers['timezone']) ? req.headers['timezone'] : null,
              deviceModel: (req.headers['device-model']) ? req.headers['device-model'] : null,
              osVersion: (req.headers['os-version']) ? req.headers['os-version'] : null,
              deviceId: (req.headers['device-id']) ? req.headers['device-id'] : null
            };
            await this.addUserDeviceHistory(userDeviceData);

            let userDetail = await User.findOne({
              where: where,
              attributes: {
                exclude: [
                  'companyName',
                  'taxId',
                  'chamberOfCommerce',
                  'verifyToken',
                  'verificationOtp',
                  'passwordResetToken'
                ]
              },
              include: [
                {
                  model: ChildParent,
                  as: 'parent',
                  where: { parentId: { [Op.ne]: null }, status: { [Op.ne]: 'deleted' } },
                  required: false,
                },
                {
                  model: UserKyc,
                  // where: { status: req.user.kycStatus },
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

                // Temporarily disabled - Country association not configured
                // {
                //   model: Country,
                //   on: {
                //     col1: models.sequelize.where(
                //       models.sequelize.col('Country.country_calling_code'),
                //       '=',
                //       models.sequelize.col('User.phone_number_country_code'),
                //     ),
                //   },
                //   required: false,
                // },
              ],
            });
            let data = userDetail.get();
            if (userDetail && userDetail?.UserKycs?.length > 0) {
              for (let index = 0; index < userDetail.UserKycs.length; index++) {
                let idProofImageUrl = '';
                let addressProofImageUrl = '';
                let addressProofBackImageUrl = '';
                let idProofBackImageUrl = '';
                if (config.app.mediaStorage == 's3') {
                  idProofImageUrl = await mediaRepository.getSingedUrl(userDetail.UserKycs[index].idProofImage);
                  addressProofImageUrl = await mediaRepository.getSingedUrl(userDetail.UserKycs[index].addressProofImage);
                  addressProofBackImageUrl = await mediaRepository.getSingedUrl(userDetail.UserKycs[index]?.addressProofBackImage);
                  idProofBackImageUrl = await mediaRepository.getSingedUrl(userDetail.UserKycs[index]?.idProofBackImage);
                } else {
                  idProofImageUrl = `${config.app.baseUrl}${userDetail.UserKycs[index].idProofImage}`;
                  addressProofImageUrl = `${config.app.baseUrl}${userDetail.UserKycs[index].addressProofImage}`;
                  addressProofBackImageUrl = userDetail.UserKycs[index]?.addressProofBackImage ? `${config.app.baseUrl}${userDetail.UserKycs[index]?.addressProofBackImage}` : '';
                  idProofBackImageUrl = userDetail.UserKycs[index]?.idProofBackImage ? `${config.app.baseUrl}${userDetail.UserKycs[index]?.idProofBackImage}` : '';
                }
                userDetail.UserKycs[index].get()['idProofImageUrl'] = idProofImageUrl;
                userDetail.UserKycs[index].get()['addressProofImageUrl'] = addressProofImageUrl;
                userDetail.UserKycs[index].get()['addressProofBackImageUrl'] = addressProofBackImageUrl;
                userDetail.UserKycs[index].get()['idProofBackImageUrl'] = idProofBackImageUrl;
              }
              return { token, isMpinSet, ...data };
            } else {
              return { token, isMpinSet, ...data };
            }
          }
        } else {
          let status = 'inactive';
          if (user.isDeleted) status = 'deleted';
          else if (user.isBlocked) status = 'blocked';
          return { status };
        }
      }
      return { status: 'invalid' };
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Check admin email and password for login
   * @param {Object} req
   */
  async checkLogin(req) {
    try {
      let { email, password, firebaseToken, deviceType } = req.body;
      let user = await User.findOne({
        where: {
          email: email,
          role: { [Op.in]: ['platform_admin', 'compliance_officer', 'treasury_manager', 'support_agent'] },
          isDeleted: false
        },
        // UserRole not in current database schema
        // include: [
        //   {
        //     model: UserRole,
        //     required: false,
        //     include: [
        //       {
        //         model: RolePermission,
        //         required: false
        //       }
        //     ],
        //   }
        // ],
        attributes: {
          exclude: [
            'companyName',
            'taxId',
            'chamberOfCommerce',
            'verifyToken',
            'verificationOtp',
            'passwordResetToken'
          ]
        }
      });
      if (user) {
        if (user.isActive && !user.isBlocked) {
          const isPasswordMatch = await this.compareUserPassword(password, user.password);
          if (isPasswordMatch) {
            const { password, ...userData } = user.get();
            const token = jwt.createToken(userData);
            req.params.userId = userData.id;
            await userRepository.subadminRemoveToken(req, true);
            const deviceData = {
              userId: userData.id,
              firebaseToken,
              deviceType,
              accessToken: token
            };
            await this.addUpdateUserDevice(deviceData);
            return { token, ...userData }
          }
        } else {
          return { status: 'inactive' };
        }
      }
      return { status: 'invalid' };;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
 * Add user login log
 * @param {Object} data
 */
  async addUserLoginLog(data) {
    try {
      const response = await LoginLog.create(data);

      return response;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Add or update user device
   * @param {Object} data
   */
  async addUpdateUserDevice(data) {
    try {
      const userDeviceToken = await this.getUserDeviceToken(data.userId);
      const { userId, firebaseToken, deviceType, accessToken } = data;
      if (userDeviceToken) {
        const newData = {
          accessToken,
          firebaseToken,
          deviceType,
        };
        await this.updateUserDevice(userDeviceToken, newData);
      } else {
        const updateData = {
          userId,
          firebaseToken,
          deviceType,
          accessToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
        };
        await this.addUserDevice(updateData);
      }
      await this.generateQrCode(userId);
      await this.generateAccounNumber(userId);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Compare user password
   * @param {String} password
   * @param {String} hashPassword
   */
  async compareUserPassword(password, hashPassword) {
    try {
      if (password && hashPassword) {
        const isPasswordMatch = await bcrypt.compare(password, hashPassword);
        if (isPasswordMatch) {
          return true;
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
 * Get user device token from user id
 * @param {Number} userId
 */
  async getUserDeviceToken(userId) {
    try {
      let userToken = await UserToken.findOne({
        where: { userId }
      });
      return userToken;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Update user device
  * @param {Object} userDeviceObject
  * @param {Object} data
  */
  async updateUserDevice(userDeviceObject, data) {
    try {
      const response = await userDeviceObject.update(data);
      return response;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
     * Add user device
     * @param {Object} data
     */
  async addUserDevice(data) {
    try {
      return await UserToken.create(data);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
 * Get device etail by token
 * @param {String} token
 */
  async getDeviceDetailByToken(token) {
    try {
      const where = {
        token: token  // Use 'token' field instead of 'access_token'
      };
      return await UserToken.findOne({
        where
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * admin forgot password api
   * @param {Object} req
   */
  async adminForgotPassword(req) {
    try {
      let { email } = req.body;
      let user = await userRepository.findOne({ email: email });
      if (user) {
        if (user && (user.role === 'platform_admin' || ['compliance_officer', 'treasury_manager', 'support_agent'].includes(user.role)) && user.status == 'active') {
          req.forgotUser = user;
          const result = await this.generatePasswordResetToken(req);
          const data = { to: user.email, name: user.name, token: result.passwordResetToken };
          Email.forgotPassword(data).then((result) => {
            return true;
          }).catch((error) => {
            logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
            return false;
          });
          return { status: 'sent' };
        } else {
          return { status: 'inactive' };
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * admin reset password api
   * @param {Object} req
   */
  async resetAdminPassword(req) {
    try {
      let { token, newPassword } = req.body;
      let user = await User.findOne({ where: { passwordResetToken: token } });
      if (user) {
        if (user && (user.role === 'platform_admin' || ['compliance_officer', 'treasury_manager', 'support_agent'].includes(user.role)) && user.status == 'active') {
          const isCompare = await this.compareUserPassword(newPassword, user.password);
          if (!isCompare) {
            await userRepository.updatePassword(user, newPassword);
            return { status: 'updated' };
          } else {
            return { status: 'samepassword' };
          }
        } else {
          return { status: 'inactive' };
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * reset password for user and merchant
   * @param {Object} req
   */
  async resetPassword(req) {
    try {
      let { username, otp, newPassword } = req.body;
      otp = await encryptAPIs.encrypt(`${otp}`);
      const isEmail = utility.validateEmail(username);
      let where = {};
      if (isEmail) {
        where.email = username;
        where.verificationCode = otp
      } else {
        // Use mobile field directly (full phone number with country code)
        where.mobile = username;
        where.verificationOtp = otp
      }
      let user = await User.findOne({ where: where });
      if (user) {
        if (user && user.status == 'active') {
          const isCompare = await this.compareUserPassword(newPassword, user.password);
          if (!isCompare) {
            await userRepository.updatePassword(user, newPassword);
            if (user.email == username) {
              await user.update({
                verificationCode: null,
                isEmailVerified: true,
                codeSpentTime: null
              })
            } else {
              await user.update({
                verificationotp: null,
                isMobileVerified: true,
                otpSpentTime: null
              })
            }
            return { status: 'updated' };
          } else {
            return { status: 'samepassword' };
          }
        } else {
          return { status: 'inactive' };
        }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
  * Generate password reset token
  * @param {Object} req
  */
  async generatePasswordResetToken(req) {
    const { forgotUser } = req;
    try {
      const token = utility.generateRandomString(32);
      const userData = {
        passwordResetToken: token
      };
      await forgotUser.update(userData);
      return userData;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Add user device info
  * @param {Object} data
  */
  async addUserDeviceHistory(data) {
    try {
      return await UserDevice.create(data);
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * verify email or mobile otp (Set null after verify)
  * @param {Object} req
  */
  async verifyOtp(req) {
    try {
      let { username, otp } = req.body;
      otp = await encryptAPIs.encrypt(`${otp}`);
      const isEmail = await utility.validateEmail(username);
      let where = {};
      if (isEmail) {
        where.email = username;
        where.verificationCode = otp
      } else {
        // Use mobile field directly (full phone number with country code)
        where.mobile = username;
        where.verificationOtp = otp
      }
      let user = await userRepository.findOne(where);
      if (user) {
        if (user.email == username) {
          await user.update({
            verificationCode: null,
            codeSpentTime: null,
            isEmailVerified: 1
          });
        } else {
          await user.update({
            verificationOtp: null,
            otpSpentTime: null,
            isMobileVerified: 1
          });
        }
        return { isEmail: isEmail, status: user.status }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * verify email or mobile otp only (Not set null after verify)
  * @param {Object} req
  */
  async verifyOtpOnly(req) {
    try {
      let { username, otp } = req.body;
      otp = await encryptAPIs.encrypt(`${otp}`);
      const isEmail = await utility.validateEmail(username);
      let where = {};
      if (isEmail) {
        where.email = username;
        where.verificationCode = otp
      } else {
        // Use mobile field directly (full phone number with country code)
        where.mobile = username;
        where.verificationOtp = otp
      }
      let user = await userRepository.findOne(where);
      if (user) {
        return { isEmail: isEmail, status: user.status }
      }
      return false;
    } catch (error) {
      throw Error(error);
    }
  },
};
