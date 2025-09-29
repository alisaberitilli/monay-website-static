import HttpStatus from 'http-status';
import repositories from '../repositories/index.js';
import _ from 'lodash';
const { find } = _;
const { mediaRepository, userKycRepository } = repositories;
import s3Bucket from '../services/s3-bucket.js';

export default {
  /**
   * Check media exist by basepath
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkMediaExists(req, res, next) {
    const { params } = req;
    try {
      const basePathStr = params.basePath;
      const basePathStrArray = params.basePathArray || [];
      let message;
      let error;

      if (basePathStrArray.length < 1) {
        next()
      }

      basePathStr && basePathStrArray.push(basePathStr);

      const medias = await mediaRepository.findAllByBasePathIn(basePathStrArray);

      error = basePathStrArray.find((element) => {
        const isExist = find(medias, { basePath: element });
        return !isExist && (message = `Media file not found, for '${element}'`);
      });

      if (!error) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message,
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check media for
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkMediaFor(req, res, next) {
    const { params } = req;
    try {

      const basePathStr = params.basePath;
      const basePathStrArray = params.basePathArray || [];
      const regexp = RegExp(`${params.mediaFor}(\\\\|/)`);
      let message;
      let error;
      if (basePathStrArray.length < 1) {
        next()
      }

      basePathStr && basePathStrArray.push(basePathStr);

      if (basePathStrArray && basePathStrArray.length) {
        error = basePathStrArray.find(
          element => !element.match(regexp)
            && (message = `Invalid media type for '${params.mediaFor}', in '${element}'`),
        );
      }

      if (!error) {
        next();
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check media exist by basepath in s3 bucket
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkMediaExistsS3(req, res, next) {
    try {
      const basePathStr = req.query.filePath;
      s3Bucket.checkS3MediaExist(basePathStr)
        .then(result => {
          if (result) {
            next();
          } else {
            res.status(HttpStatus.BAD_REQUEST).json({
              success: false,
              data: [],
              message: 'Media not found in our storag.',
            });
          }
        })
        .catch(error => {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: 'Media not found in our storag.',
          });

        });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Check user authorized to access for kyc document
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
  async checkMediaOwner(req, res, next) {
    try {
      let { userType } = req.user
      if (userType == 'admin' || userType == 'subadmin') {
        next();
      } else {
        let result = await userKycRepository.checkUserKyc(req);
        if (result) {
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: 'You are not authorized to access.',
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },
};
