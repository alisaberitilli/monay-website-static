import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import config from '../config';
import language from '../language';
import userRepository from '../repositories/user-repository';
export default {
  /**
  * Generate random string
  * @param {Number} length
  */
  async generateReferrerCode() {
    let referralCode = this.generateRandomString(8);
    let isExist = await userRepository.findOne({
      referralCode: referralCode
    });
    if (!isExist) {
      return referralCode;
    }
    this.generateReferrerCode();
  },
  /**
  * get fullname  
  * @param {Number} length
  */
  async getFullName(data) {
    return `${data.firstName} ${data.lastName}`;
  },
  /**
   * Generate random string
   * @param {Number} length
   */
  generateRandomString: (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let output = '';

    for (let x = 0; x < length; x++) {
      const i = Math.floor(Math.random() * 62);
      output += chars.charAt(i);
    }
    return output;
  },
  /**
   * Generate random integer
   */
  generateRandomInteger: (length = 8) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  },
  /**
   * Generate otp
   */
  generateOtp() {
    return config.app.environment == 'development' ? 444444 : this.generateRandomInteger(6);
  },
  /**
   * Generate randon password
   */
  generateRandomPassword() {
    return this.generateRandomString(8);
  },
  /**
   * Generate hash password
   * @param {String} dataString
   */
  async generateHashPassword(dataString) {
    try {
      const salt = await bcrypt.genSalt();
      return await bcrypt.hash(dataString, salt);
    } catch (error) {
      throw new Error(error);
    }
  },

  /**
   * Get current timestamp
   */
  getCurrentTimeInUnix() {
    return moment().unix()
  },

  /**
   * Get current year
   */
  convertDateFromTimezone(date, timezone, format) {
    date = date || new Date();
    let dateObj = '';
    if (timezone) {
      dateObj = moment.tz(date, timezone).format(format);
    } else {
      dateObj = moment.utc(date).format(format);
    }
    return dateObj;
  },

  /**
  * Get current year
  */
  getUTCDateTimeFromTimezone(date, timezone, format) {
    date = date || new Date();
    date = moment.tz(date, timezone).format(format);
    let dateObject = momentTimeZone.utc(date);
    return dateObject;
  },
  /**
  * Change Date format
  */
  changeDateFormat(date, format = 'YYYY-MM-DD') {
    date = date || new Date();
    let dateStr = '';
    dateStr = moment.utc(date).format(format);
    return dateStr;
  },
  /**
   * Get date from datetime
   */
  getDateFromDateTime(dateObject) {
    const date = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    return `${year}-${month}-${date}`;
  },
  /**
   *
   * @param {Date} date
   * @param {String} interval
   * @param {Number} units
   */
  dateAdd(date, interval, units) {
    let ret = new Date(date);
    const checkRollover = function () {
      if (ret.getDate() != date.getDate()) ret.setDate(0);
    };
    switch (interval.toLowerCase()) {
      case 'year':
        ret.setFullYear(ret.getFullYear() + units);
        checkRollover();
        break;
      case 'quarter':
        ret.setMonth(ret.getMonth() + 3 * units);
        checkRollover();
        break;
      case 'month':
        ret.setMonth(ret.getMonth() + units);
        checkRollover();
        break;
      case 'week':
        ret.setDate(ret.getDate() + 7 * units);
        break;
      case 'day':
        ret.setDate(ret.getDate() + units);
        break;
      case 'hour':
        ret.setTime(ret.getTime() + units * 3600000);
        break;
      case 'minute':
        ret.setTime(ret.getTime() + units * 60000);
        break;
      case 'second':
        ret.setTime(ret.getTime() + units * 1000);
        break;
      default:
        ret = undefined;
        break;
    }
    return ret;
  },
  /**
   *
   * @param {Date} date
   * @param {String} interval
   * @param {Number} units
   */
  dateMinus(date, interval, units) {
    let ret = new Date(date);
    const checkRollover = function () {
      if (ret.getDate() != date.getDate()) ret.setDate(0);
    };
    switch (interval.toLowerCase()) {
      case 'year':
        ret.setFullYear(ret.getFullYear() - units);
        checkRollover();
        break;
      case 'quarter':
        ret.setMonth(ret.getMonth() - 3 * units);
        checkRollover();
        break;
      case 'month':
        ret.setMonth(ret.getMonth() - units);
        checkRollover();
        break;
      case 'week':
        ret.setDate(ret.getDate() - 7 * units);
        break;
      case 'day':
        ret.setDate(ret.getDate() - units);
        break;
      case 'hour':
        ret.setTime(ret.getTime() - units * 3600000);
        break;
      case 'minute':
        ret.setTime(ret.getTime() - units * 60000);
        break;
      case 'second':
        ret.setTime(ret.getTime() - units * 1000);
        break;
      default:
        ret = undefined;
        break;
    }
    return ret;
  },
  /**
   * Get date difference
   * @param {Date} date
   * @param {String} interval
   * @param {Number} units
   */
  dateDifference(date1, date2) {
    const date1_ms = date1.getTime();
    const date2_ms = date2.getTime();

    let difference_ms = date2_ms - date1_ms;
    difference_ms /= 1000;
    const seconds = Math.floor(difference_ms % 60);
    difference_ms /= 60;
    const minutes = Math.floor(difference_ms % 60);
    difference_ms /= 60;
    const hours = Math.floor(difference_ms % 24);

    return `${hours}h ${minutes}m ${seconds}s`;
  },
  /**
   * Generate 10 digit unique number
   */
  generateUniqueNumber(length = 10) {
    const _sym = '123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += _sym[parseInt(Math.random() * _sym.length)];
    }
    return str;
  },
  /**
   * Convert iso datetime to sql time
   * @param {string} dateTime
   */
  fromIsoToSQLTime(dateTime) {
    const dateTimeObj = DateTime.fromISO(dateTime, { zone: 'utc' });
    return (dateTimeObj && dateTimeObj.toSQLTime({ includeOffset: false })) || null;
  },
  /**
   * Convert sql time to iso datetime
   * @param {string} time
   */
  fromSQLTimeToIso(time, date) {
    if (time) {
      const [hour, minute, second] = time.split(':');
      const fromObject = {
        hour,
        minute,
        second,
        zone: 'utc',
      };
      if (date) {
        const dt = DateTime.fromJSDate(date, {
          zone: 'utc',
        });
        const { year, month, day } = dt;
        Object.assign(fromObject, {
          year,
          month,
          day,
        });
      }
      return DateTime.fromObject(fromObject);
    }
    return null;
  },
  /**
   * Check file exists
   * @param {string} path
   */
  isFileExist(filePath) {
    const tmpPath = path.join(__dirname, `../../${filePath}`);
    return fs.existsSync(tmpPath) || false;
  },

  getMessage(req = {}, data, key) {
    const languages = config.app.languages;
    let message = '';
    let languageCode = req.headers && (req.headers.language || req.headers["language"]);
    languageCode = (languages.indexOf(languageCode) !== -1) ? languageCode : "en";
    if (data) {
      message = (language[languageCode] && language.en[`${key}`]) ? language[languageCode][`${key}`](data) : key;
    } else {
      message = (language[languageCode] && language.en[`${key}`]) ? language[languageCode][`${key}`] : key;
    }
    return message;
  },
  /**
   * Remove # from string
   * @param {string} path
   */
  removeHasTag(string) {
    return string.replace(/^#+/i, '');
  },
  /**
  * check valid emai or not
  * @param {string} path
  */
  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  getCardType(number) {
    // visa
    var re = new RegExp("^4");
    if (number.match(re) != null)
      return "Visa";

    // Mastercard 
    // Updated for Mastercard 2017 BINs expansion
    if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
      return "Master Card";

    // AMEX
    re = new RegExp("^3[47]");
    if (number.match(re) != null)
      return "American Express";

    // Discover
    re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
    if (number.match(re) != null)
      return "Discover";

    // Diners
    re = new RegExp("^36");
    if (number.match(re) != null)
      return "Diners Club";

    // Diners - Carte Blanche
    re = new RegExp("^30[0-5]");
    if (number.match(re) != null)
      return "Diners Carte Blanche";

    // JCB
    re = new RegExp("^35(2[89]|[3-8][0-9])");
    if (number.match(re) != null)
      return "JCB";

    // Visa Electron
    re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
    if (number.match(re) != null)
      return "Visa Electron";

    return "";
  },
  formatMoney(number, decPlaces, decSep, thouSep) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
      decSep = typeof decSep === "undefined" ? "." : decSep;
    thouSep = typeof thouSep === "undefined" ? "," : thouSep;
    var sign = number < 0 ? "-" : "";
    var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    var j = (j = i.length) > 3 ? j % 3 : 0;

    return sign +
      (j ? i.substr(0, j) + thouSep : "") +
      i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
      (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
  },

  getCardIcon(cardName) {
    if (cardName == 'Visa') {
      return 'public/icon/visa.png'
    } else if (cardName == 'Master Card') {
      return 'public/icon/master-card.png'
    } else if (cardName == 'American Express') {
      return 'public/icon/american-express.png'
    } else if (cardName == 'Discover') {
      return 'public/icon/discover.png'
    } else if (cardName == 'Diners Club') {
      return 'public/icon/diners-club.png'
    } else if (cardName == 'JCB') {
      return 'public/icon/jcb.png'
    }
    return null;
  },

  getDateFormat() {
    return 'YYYY-MM-DD HH:mm:ss';
  },
  setEnvValue(attrName, newVal) {
    var envPath = "./.env";
    var dataArray = fs.readFileSync(envPath, 'utf8').split('\n');

    var replacedArray = dataArray.map((line) => {
      if (line.split('=')[0] == attrName) {
        return attrName + "=" + String(newVal);
      } else {
        return line;
      }
    })

    fs.writeFileSync(envPath, "");
    for (let i = 0; i < replacedArray.length; i++) {
      fs.appendFileSync(envPath, replacedArray[i] + "\n");
    }
  },

  /**
* JSON stringify
*/
  jsonStringify(data) {
    try {
    if (data && typeof data === "object") {
      return JSON.stringify(data);
    }
    return null;
  } catch(error) {
    throw error;
  }
  },
};
