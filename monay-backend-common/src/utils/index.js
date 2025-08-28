import dotenv from 'dotenv';
import moment from 'moment';

moment.suppressDeprecationWarnings = true;
dotenv.config();

export default {
  
  /**
   * Generate random string
   * @param {Number} length
   */
  generateRandomString: (length) => {
    let chars = 'klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars = `${chars}0123456789abcdefghij`;
    let output = '';

    for (let x = 0; x < length; x += 1) {
      const i = Math.floor(Math.random() * 62);
      output += chars.charAt(i);
    }
    return output;
  },

  

  /**
 * Generate random integer
 */
  generateRandomInteger: (length = 8) => {
    const addData = Math.random() * 9 * 10 ** (length - 1);
    return Math.floor(10 ** (length - 1) + addData);
  },
  
};
