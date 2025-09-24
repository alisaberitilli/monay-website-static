import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';

const { cmsRepository, activityLogRepository } = repositories;

export default {

  /**
   * Get all Cms Pages
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getCmsPages(req, res, next) {
    try {
      const result = await cmsRepository.findAll(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result,
        },
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get cms page details
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getCmsPage(req, res, next) {
    try {
      const where = { id: req.params.cmsPageId };
      const result = await cmsRepository.findOne(where);
      if (result) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: result,
          message: ''
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'CMS_PAGE_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Update cms page
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateCmsPage(req, res, next) {
    try {
      const cmsObject = req.cms;
      const bodyData = req.body;
      const result = await cmsRepository.updateCmsPage(req, cmsObject, bodyData);
      if (cmsObject.userType == 'user') {
        await activityLogRepository.saveActivityLog('user_update_cms', req);
      } else {
        await activityLogRepository.saveActivityLog('merchant_update_cms', req);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'CMS_UPDATED')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create faq
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveFaq(req, res, next) {
    try {
      const result = await cmsRepository.saveFaq(req);
      if (req.body.userType == 'user') {
        await activityLogRepository.saveActivityLog('user_add_faq', req);
      } else {
        await activityLogRepository.saveActivityLog('merchant_add_faq', req);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'FAQ_ADDED')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all Faq list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getFaqList(req, res, next) {
    try {
      const result = await cmsRepository.getFaqList(req);
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          rows: result.rows,
          total: result.count,
        },
        message: ''
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Delete faq
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async deleteFaq(req, res, next) {
    try {
      await cmsRepository.deleteFaq(req);

      if (req.faq.userType == 'user') {
        await activityLogRepository.saveActivityLog('user_delete_faq', req);
      } else {
        await activityLogRepository.saveActivityLog('merchant_delete_faq', req);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: [],
        message: utility.getMessage(req, false, 'FAQ_DELETED')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update faq
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateFaq(req, res, next) {
    try {
      const faqObject = req.faq;
      const bodyData = req.body;
      const result = await cmsRepository.updateFaq(faqObject, bodyData);
      if (bodyData.userType == 'user') {
        await activityLogRepository.saveActivityLog('user_update_faq', req);
      } else {
        await activityLogRepository.saveActivityLog('merchant_update_faq', req);
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'FAQ_UPDATED')
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Find faq
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getFaqDetail(req, res, next) {
    try {
      res.status(HttpStatus.OK).json({
        success: true,
        data: req.faq,
        message: ''
      });
    } catch (error) {
      next(error);
    }
  }
};
