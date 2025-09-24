import nodemailer from 'nodemailer';
import config from '../config/index.js';
import settingRepository from '../repositories/setting-repository';

export default {
  async sendEmail(options) {
    let settingData = await settingRepository.findAll({ query: '' });
    const smtpConfig = {
      host: settingData.smtp_host,
      port: settingData.smtp_port,
      secure: false,
      auth: {
        user: settingData.smtp_username,
        pass: settingData.smtp_password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transport = nodemailer.createTransport(smtpConfig);
    const mailOptions = {
      from: settingData.smtp_email_from_email,
      to: options.to,
      subject: options.subject,
      html: options.message,
    };
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    return new Promise((resolve, reject) => {
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {

          resolve(info);
        }
      });
    });
  },
};
