import models from '../models/index.js';
import config from '../config/index.js';
import utility from '../services/utility.js';
const { exec } = require('child_process');
const { Setting, Country, KycDocument } = models;

export default {

  /**
   * Get all setting
   * @param {Object} req
   */
  async findAll(req) {
    try {
      let settings = {};
      let where = { status: 'active' };
      if (req.query.settingType) {
        where.settingType = req.query.settingType;
      }
      const results = await Setting.findAll({
        where: where
      });
      const country = await Country.findOne({
        where: { countryCallingCode: config.region.countryPhoneCode }
      });
      results.forEach((data, index) => {
        let obj = data.toJSON();
        if (['android_force_update', 'ios_force_update'].indexOf(obj.key) != -1) {
          settings[obj.key] = parseInt(obj.value);
        } else {
          settings[obj.key] = obj.value;
        }
      })

      settings.countryPhoneCode = config.region.countryPhoneCode;
      settings.currencyAbbr = config.region.currencySymbol;
      settings.country = country;
      return settings;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
     * update settings
     * @param {Object} data
     */
  async updateSettings(req) {
    try {
      for (const [key, value] of Object.entries(req.body)) {
        await Setting.update({ value: value }, { where: { key: key } });
      }
      return true;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
     * update country settings
     * @param {Object} data
     */
  async updateCountrySettings(req) {
    try {
      let res = '';
      let envKey = '';
      let isSetting = await Setting.findOne({ where: { key: 'is_country_setting' } });
      if (isSetting.value == 0) {
        for (const [key, value] of Object.entries(req.body)) {
          res = await Setting.update({ value: value }, { where: { key: key } });
          if (key === 'country_phone_code') {
            envKey = 'COUNTRY_PHONE_CODE';
          }
          if (key === 'currency_abbr') {
            envKey = 'CURRENCY_ABBR';
          }
          utility.setEnvValue(envKey, value);
        }
        if (res) {
          await Setting.update({ value: 1 }, { where: { key: 'is_country_setting' } });
          exec(
            `sudo pm2 restart monay-api/index.js`,
            { maxBuffer: 1024 * 2084 }, async (err, stdout, stderr) => {
              if (err) {
                console.error('buffer error', err);
              }
            }
          );
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
  * Get country list
  * @param {Object} req
  */
  async getCountryList(req) {
    try {
      return await Country.findAll();

    } catch (error) {
      throw Error(error);
    }
  },
  /**
  * Get country list
  * @param {Object} req
  */
   async getActiveCountryList(req) {
    try {
      return await Country.findAll({ where : { status: 'active'}});

    } catch (error) {
      throw Error(error);
    }
  },

   /**
  * Get kyc document list
  * @param {Object} req
  */
    async getKycDocument(req) {
      try {
        const { query: { countryCode } } = req;
        const where = {};
        if (countryCode) {
          where.countryCode = countryCode;
        }
        const picture = await KycDocument.findAll({ where: { type: 'picture', ...where } });
        const address = await KycDocument.findAll({ where: { type: 'address', ...where } });
        return { picture, address };
      } catch (error) {
        throw Error(error);
      }
    },
};
