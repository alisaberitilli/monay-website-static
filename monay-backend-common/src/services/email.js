import emailer from './base-emailer';
import config from '../config/index.js';
import ejsTemplate from './ejs';
export default {
    /**
     * Send email on forgot password
     * @param {Object} data
     */
    forgotPassword(data) {
        return new Promise((resolve, reject) => {
            const { adminUrl } = config.app;
            data.logo = `${config.app.baseUrl}public/default-images/logo.png`;
            data.redirect_url = adminUrl + 'reset-password/' + data.token;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'forgot-password.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay Admin- Reset Password',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
     * Support reply email
     * @param {Object} data
     */
    supportReply(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'support-reply.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay: Support Request',
                            message: result,
                        };

                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },

    /**
     * User signup
     * @param {Object} data
     */
    userSignup(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'create-user-account.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay - Registration Successful',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
     * User forgot password
     * @param {Object} data
     */
    userForgotPassword(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: (data.subject == 'Forgot Pin') ? 'forgot-mpin-code.ejs' : 'send-verification-code.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            // subject: `Monay: ${data.subject}`,
                            subject: (data.subject == 'Forgot Pin') ? 'Monay - Reset Monay Pin' : 'Monay - Reset Password',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
     * User Resend verification code 
     * @param {Object} data
     */
    userResendVerificationCode(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'resend-verification-code.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            // subject: `Monay: ${data.subject}`,
                            subject: 'Monay - Resend verification code',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
     * User KYC Approval /Rejected
     * @param {Object} data
     */
    kycApprovalRejected(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: (data.status == 'approved') ? 'approved-kyc.ejs' : 'rejected-kyc.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: data.subject,
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },

    /**
     *Send email verification code
     * @param {Object} data
     */
    emailVerification(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'email-verification-code.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay:Email verification',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
    * Support reply email
    * @param {Object} data
    */
    subadminCreateAccount(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            const { adminUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            data.redirect_url = adminUrl
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'subadmin-create-account.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay - Your account as a Sub-Admin is created.',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
    /**
    * Failed transaction mail for admin
    * @param {Object} data
    */
    failedTransaction(data) {
        return new Promise((resolve, reject) => {
            const { baseUrl } = config.app;
            data.logo = `${baseUrl}public/default-images/logo.png`;
            ejsTemplate.generateEjsTemplate(
                {
                    template: 'failed-transaction.ejs',
                    data,
                },
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        const options = {
                            to: data.to,
                            subject: 'Monay - Transaction failure.',
                            message: result,
                        };
                        emailer
                            .sendEmail(options)
                            .then((object) => {
                                resolve(object);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    }
                },
            );
        });
    },
};
