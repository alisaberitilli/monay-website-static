import HttpStatus from 'http-status';
import jwt from '../services/jwt';
import userRepository from '../repositories/user-repository';
import accountRepository from '../repositories/account-repository';
/**
  * Check user authorization
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
const authValidateRequest = async (req, res, next) => {
  try {
    const skippedApis = ['profile-update'];
    if (req.headers && req.headers.authorization) {
      const apiName = req.params.apiName;
      const parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        const scheme = parts[0];
        const token = parts[1];

        if (/^Bearer$/i.test(scheme)) {

          const decodedToken = jwt.verifyToken(token);
          if (decodedToken) {
            const user = await userRepository.findOne({ id: decodedToken.id });//Find user detail from token
            if (user && (user.status == 'active' || skippedApis.indexOf(apiName) != -1)) {
              const userToken = await accountRepository.getDeviceDetailByToken(token);
              if (userToken) {
                req.user = user;
                next();
              } else {
                const error = new Error('TOKEN_BAD_FORMAT');
                error.status = HttpStatus.UNAUTHORIZED;
                error.message = 'Your session has expired. Please login.'; // 'Format is Authorization: Bearer [token]';
                next(error);
              }
            } else {
              const error = new Error();
              error.status = HttpStatus.UNAUTHORIZED;
              error.message = 'Your Account is inactive, please contact to admin.';
              next(error);
            }

          } else {
            const error = new Error('TOKEN_NOT_FOUND');
            error.status = HttpStatus.BAD_REQUEST;
            error.message = 'Unauthorized access or token required.';
            next(error);
          }
        } else {
          const error = new Error('TOKEN_BAD_FORMAT');
          error.status = HttpStatus.UNAUTHORIZED;
          error.message = 'Your session has expired. Please login.'; // 'Format is Authorization: Bearer [token]';
          next(error);
        }
      } else {
        const error = new Error('TOKEN_BAD_FORMAT');
        error.status = HttpStatus.UNAUTHORIZED; // HttpStatus['401'];
        error.message = 'Unauthorized user access.'; // 'Format is Authorization: Bearer [token]';
        next(error);
      }
    } else {
      const error = new Error('TOKEN_NOT_FOUND');
      error.status = HttpStatus.BAD_REQUEST;
      error.message = 'Unauthorized access or token required.';
      next(error);
    }
  } catch (error) {
    error.status = HttpStatus.UNAUTHORIZED;
    next(error);
  }
};
export default authValidateRequest;
