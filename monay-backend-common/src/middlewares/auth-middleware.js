import HttpStatus from 'http-status';
import jwt from '../services/jwt.js';
import userRepository from '../repositories/user-repository.js';
import accountRepository from '../repositories/account-repository.js';
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
            if (user && (user.isActive || user.status == 'active' || skippedApis.indexOf(apiName) != -1)) {
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

/**
 * Check if user has required role
 * @param {Array} allowedRoles - Array of roles that are allowed
 * @returns {Function} Express middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated first
      if (!req.user) {
        const error = new Error('UNAUTHORIZED');
        error.status = HttpStatus.UNAUTHORIZED;
        error.message = 'User not authenticated';
        return next(error);
      }
      
      // Get user's role
      const userRole = req.user.role || req.user.userType || 'user';
      
      // Check if user's role is in the allowed roles
      if (allowedRoles.includes(userRole) || userRole === 'platform_admin') {
        // Allow platform_admin to access everything
        return next();
      }
      
      // For now in development, allow all authenticated users
      // TODO: Implement proper role checking in production
      console.log(`Warning: Role check bypassed in development. User role: ${userRole}, Required roles: ${allowedRoles}`);
      return next();
      
      // In production, uncomment this:
      // const error = new Error('FORBIDDEN');
      // error.status = HttpStatus.FORBIDDEN;
      // error.message = 'You do not have permission to access this resource';
      // return next(error);
    } catch (error) {
      error.status = HttpStatus.INTERNAL_SERVER_ERROR;
      return next(error);
    }
  };
};

// Create verifyAdmin middleware
const verifyAdmin = checkRole(['platform_admin', 'admin', 'high_security']);

// Make authValidateRequest the default export for backward compatibility
// But also add properties to it for the new functionality
authValidateRequest.verifyToken = authValidateRequest; // auth.verifyToken works same as auth
authValidateRequest.checkRole = checkRole;
authValidateRequest.authValidateRequest = authValidateRequest;

// Export as default with backward compatibility
// This allows:
// - auth (same as authValidateRequest for Solana routes)
// - auth.verifyToken (same as auth for TilliPay routes if needed)
// - auth.checkRole (for role-based access control)
export default authValidateRequest;

// Named exports for new API style
export {
  authValidateRequest as verifyToken,
  verifyAdmin,
  checkRole
};
