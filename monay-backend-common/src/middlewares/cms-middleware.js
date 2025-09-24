import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility.js';
const { cmsRepository } = repositories;

export default {

  /**
     * Check cms page exist
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
  async checkCmsPageExists(req, res, next) {
    try {
      const where = { id: req.params.cmsPageId };
      const result = await cmsRepository.findOne(where);
      if (result) {
        req.cms = result;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'CMS_PAGE_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check faq exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkFaqExists(req, res, next) {
    try {
      const result = await cmsRepository.findFaq(req);
      if (result) {
        req.faq = result;
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'FAQ_NOT_FOUND')
        });
      }
    } catch (error) {
      next(error);
    }
  },

   /**
   * Check user type
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
    async checkUserType(req, res, next) {
      try {
        if (req.query.userType === 'secondary_user') {
          req.query.userType = 'user';
        }
          next();
      } catch (error) {
        next(error);
      }
    },
};
