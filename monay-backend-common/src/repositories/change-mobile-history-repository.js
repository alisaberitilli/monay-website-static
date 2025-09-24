import models from '../models/index.js';
import utility from '../services/utility.js';
import sms from '../services/sms.js';
import encryptAPIs from '../services/encrypt.js';
import Email from '../services/email.js';
import logger from '../services/logger.js';
const { ChangeMobileHistory, User } = models;

export default {
    /**
    * Update phone number request from user 
    * @param {Object} req
    */
    async updatePhoneNumber(req) {
        try {
            let result = '';
            const { phoneNumber } = req.body;
            const verificationOtp = utility.generateOtp();
            let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationOtp}`);
            // Use mobile field directly (full phone number with country code)
            const mobile = req.body.mobile || phoneNumber;
            const data = {
                userId: req.user.id,
                mobile
            }
            let checkNumber = await ChangeMobileHistory.findOne({
                where: data
            });
            if (checkNumber) {
                result = await ChangeMobileHistory.update({
                    otp: encryptVerificationCode,
                    status: 'pending',
                    updatedAt: new Date()
                }, { where: data });
            } else {
                data.otp = encryptVerificationCode;
                data.status = 'pending';
                result = await ChangeMobileHistory.create(data);
            }
            if (result) {
                if (req.user) {
                    let OtpMessage = utility.getMessage(req, false, 'CHNAGE_PHONENUMBER_SEND_OTP')
                    OtpMessage = OtpMessage.replace('{otp}', verificationOtp);
                    // Use mobile field directly (full phone number with country code)
                    await sms.sendOtp(mobile, OtpMessage);
                }
            }
            return result;
        } catch (error) {
            throw Error(error);
        }
    },
    /**
   * verify new and previous mobile number otp
   * @param {Object} req
   */
    async verifyPhonenumberOtp(req) {
        try {
            let userData = req.user;
            let { phoneNumber, otp } = req.body;
            otp = await encryptAPIs.encrypt(`${otp}`);
            // Use mobile field directly (full phone number with country code)
            const mobile = req.body.mobile || phoneNumber;
            let where = {
                mobile,
                otp
            };
            const result = await ChangeMobileHistory.findOne({ where: where });
            if (result) {
                let data = {
                    userId: userData.id,
                    mobile: userData.mobile,
                }
                const updateUserInfo = User.update(
                    {
                        mobile,
                    },
                    {
                        where: {
                            id: userData.id
                        }
                    });
                if (updateUserInfo) {
                    await result.update({
                        status: 'active',
                        otp: null
                    });
                    let checkexitNumber = await ChangeMobileHistory.findOne({ where: data });
                    if (checkexitNumber) {
                        await checkexitNumber.update({
                            status: 'old'
                        })
                    } else {
                        data.status = 'old';
                        await ChangeMobileHistory.create(data);
                    }

                }
                return true;
            } else {
                return false;
            }

        } catch (error) {
            throw Error(error);
        }
    },

    /**
   * update email request by user
   * @param {integer} userId
   */
    async updateEmail(req) {
        try {
            let result = '';
            let userData = req.user;
            const { email } = req.body;
            const verificationOtp = utility.generateOtp();
            let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationOtp}`);
            const data = {
                userId: req.user.id,
                email
            }
            let checkEmail = await ChangeMobileHistory.findOne({
                where: data
            });
            if (checkEmail) {
                result = await ChangeMobileHistory.update({
                    otp: encryptVerificationCode,
                    status: 'pending',
                    type: 'email',
                    updatedAt: new Date()
                }, { where: data });
            } else {
                data.otp = encryptVerificationCode;
                data.status = 'pending';
                data.type = 'email'
                result = await ChangeMobileHistory.create(data);
            }
            if (result) {
                // send otp on email
                let fullName = `${userData.firstName} ${userData.lastName}`;
                const data = { to: email, email: email, name: fullName, otp: verificationOtp };
                Email.emailVerification(data).then((response) => {
                    return result;
                }).catch((error) => {
                    logger.emailErrorLogger.error(`Mail sent error ${new Date()} ${JSON.stringify(error)}`);
                    return false;
                });
            }
            return result;
        } catch (error) {
            throw Error(error);
        }
    },
    /**
  * verify new and previous email otp
  * @param {Object} req
  */
    async verifyEmailOtp(req) {
        try {
            let userData = req.user;
            let { email, otp } = req.body;
            otp = await encryptAPIs.encrypt(`${otp}`);
            let where = {
                email,
                otp
            };
            const result = await ChangeMobileHistory.findOne({ where: where });
            if (result) {
                let data = {
                    userId: userData.id,
                    email: userData.email
                }
                const updateUserInfo = User.update({ email }, { where: { id: userData.id } });
                if (updateUserInfo) {
                    await result.update({
                        status: 'active',
                        otp: null
                    });
                    let checkexitNumber = await ChangeMobileHistory.findOne({ where: data });
                    if (checkexitNumber) {
                        await checkexitNumber.update({
                            status: 'old'
                        })
                    } else {
                        data.status = 'old';
                        await ChangeMobileHistory.create(data);
                    }

                }
                return true;
            } else {
                return false;
            }

        } catch (error) {
            throw Error(error);
        }
    },

};
