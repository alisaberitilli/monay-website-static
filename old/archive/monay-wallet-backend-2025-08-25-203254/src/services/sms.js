import loggers from './logger';
import twilio from '../services/twilio';
import config from '../config';
const { errorLogger } = loggers;

export default {
  /**
   * Send otp on phone number
   * @param {string} to
   * @param {string} message
   */
  async sendOtp(to, message) {
    try {
      let restult = config.app.environment == 'development' ? true : await twilio.sendMessage(to, message);
      return restult;
    } catch (error) {
      errorLogger.error(JSON.stringify(error));
      error.message = 'Invalid phone number.';
      throw Error(error);
    }
  },
};
