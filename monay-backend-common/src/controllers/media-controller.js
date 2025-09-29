import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import utility from '../services/utility.js';

const { mediaRepository } = repositories;

export default {
  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMedia(req, res, next) {
    try {
      return await mediaRepository.uploadMedia(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveMedia(req, res, next) {
    try {
      const result = await mediaRepository.create(req);
      res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
        message: '',
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getSignedUrl(req, res, next) {
    try {
      let signedUrl = await mediaRepository.getSingedUrl(req.query.filePath)
      if (signedUrl) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: { url: signedUrl },
          message: ''
        });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: true,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
