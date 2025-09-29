import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';
const { settingRepository, activityLogRepository } = repositories;

export default {
  /**
   * Get public settings
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getPublicSettings(req, res, next) {
    try {
      req.query.settingType = 'public';
      let result = await settingRepository.findAll(req);
      if (result.ios_build_update) {
        result.ios_build_update = parseInt(result.ios_build_update);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get private setting list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getPrivateSettings(req, res, next) {
    try {
      req.query.settingType = 'private';
      let result = await settingRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get county list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getCountryList(req, res, next) {
    try {
      let result = await settingRepository.getCountryList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get county list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
   async getActiveCountryList(req, res, next) {
    try {
      let result = await settingRepository.getActiveCountryList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Update settings by keys
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateSettings(req, res, next) {
    try {
      await settingRepository.updateSettings(req);
      await activityLogRepository.saveActivityLog(req.body.setting_type, req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: [],
        message: utility.getMessage(req, false, 'SETTING_UPDATED')
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * update one time country settings for app
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateCountrySettings(req, res, next) {
    try {
      let result = await settingRepository.updateCountrySettings(req);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: [],
          message: utility.getMessage(req, false, 'SETTING_UPDATED')
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'SETTING_UPDATED_ALREADY'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get kyc document list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
   async getKycDocument(req, res, next) {
    try {
      let result = await settingRepository.getKycDocument(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
};
