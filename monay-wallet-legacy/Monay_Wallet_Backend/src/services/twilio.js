'use strict';

import twilio from 'twilio';
import config from '../config';
import settingRepository from '../repositories/setting-repository';
import loggers from './logger';
let infoLogger = loggers.infoLogger;
let errorLogger = loggers.errorLogger;

export default {
  /**
   * Send sms
   * @param {string} to 
   * @param {string} message 
   */
  async sendMessage(to, message) {
    let settingData = await settingRepository.findAll({ query: '' });
    let fromNumber = settingData.twilio_from_number;
    let accountSid = settingData.twilio_account_sid;
    let authToken = settingData.twilio_auth_token;

    let client = new twilio(accountSid, authToken);
    let messageBody = {
      body: message,
      to: to,
      from: fromNumber
    };

    return client.messages.create(messageBody)
      .then((object) => {
        infoLogger.info(`Successfully sent with message sid: ${message.sid}`);
        return Promise.resolve(object);
      }).catch(error => {
        errorLogger.error(JSON.stringify(error));
        return Promise.reject(error);
      });
  }
}