import models from '../models';
import utility from '../services/utility';
import sms from '../services/sms';
import encryptAPIs from '../services/encrypt';
import Email from '../services/email';
import logger from '../services/logger';
const { ChangeMobileHistory, User } = models;

export default {
    /**
    * Update phone number request from user 
    * @param {Object} req
    */
    async updatePhoneNumber(req) {
        try {
            let result = '';
            const { phoneNumberCountryCode, phoneNumber } = req.body;
            const verificationOtp = utility.generateOtp();
            let encryptVerificationCode = await encryptAPIs.encrypt(`${verificationOtp}`);
            const data = {
                userId: req.user.id,
                phoneNumberCountryCode,
                phoneNumber
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
                    await sms.sendOtp(`${phoneNumberCountryCode}${phoneNumber}`, OtpMessage);
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
            let { phoneNumberCountryCode, phoneNumber, otp } = req.body;
            otp = await encryptAPIs.encrypt(`${otp}`);
            let where = {
                phoneNumberCountryCode,
                phoneNumber,
                otp
            };
            const result = await ChangeMobileHistory.findOne({ where: where });
            if (result) {
                let data = {
                    userId: userData.id,
                    phoneNumberCountryCode: userData.phoneNumberCountryCode,
                    phoneNumber: userData.phoneNumber,
                }
                const updateUserInfo = User.update(
                    {
                        phoneNumberCountryCode,
                        phoneNumber,
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
