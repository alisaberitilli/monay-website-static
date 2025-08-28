import HttpStatus from 'http-status';

/**
 * Check resource access permision
 * according to user role
 * @param {Array} userTypeArr
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const resourceAccessGuard = userTypeArr => async (req, res, next) => {
  const { user } = req;
  try {
    if (~userTypeArr.indexOf(user.userType)) {
      next();
    } else {
      const error = new Error('INVALID_USER_ACCESS');
      error.status = HttpStatus.BAD_REQUEST;
      error.message = `Resource can not be accessed by [${user.userType}]`;
      next(error);
    }
  } catch (error) {
    error.status = HttpStatus.UNAUTHORIZED;
    next(error);
  }
};

export default resourceAccessGuard;
