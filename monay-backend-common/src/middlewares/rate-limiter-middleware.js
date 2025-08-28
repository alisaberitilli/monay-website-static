import utility from '../services/utility';
import loggers from '../services/logger';
const { RateLimiterMemory } = require('rate-limiter-flexible');

/**
* Set rate limitor object
*/
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60, // per 60 seconds
  blockDuration: 86400
});

/**
  * Check rate limitor 
  * @param {Object} req
  * @param {Object} res
  * @param {Function} next
  */
const rateLimiterMiddleware = (req, res, next) => {
  // Consume 1 point for each action
  rateLimiter.consume(req.ip) // or req.ip
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      loggers.concurrentRequestsLogger.error({ ip: req.ip, apiUrl: req.url });
      return res.status(429).json({
        success: false,
        data: [],
        message: utility.getMessage(req, false, 'TO_MANY_REQUEST')
      })
    });
};

/**
* Set rate limiter object for pay
*/
const rateLimiterForPay = new RateLimiterMemory({
  points: 1,
  duration: 86400, // per 60 seconds
  blockDuration: 86400
});

/**
* Check rate limiter for pay request
* @param {Object} req
* @param {Object} res
* @param {Function} next
*/
export const rateLimiterPayMiddleware = (req, res, next) => {
  // Consume 1 point for each action
  rateLimiterForPay.consume(`${req.url}/${req.user.id}/${req.body.toUserId}`) // or req.ip
    .then((rateLimiterRes) => {
      next();
    })
    .catch((rejRes) => {
      return res.status(429).json({
        success: false,
        data: [],
        message: utility.getMessage(req, false, 'TO_MANY_PAYMENT_REQUEST')
      })
    });
};

// Payment rate limiter for TilliPay
const paymentRateLimiter = new RateLimiterMemory({
  points: 10, // 10 payment attempts
  duration: 60, // per 60 seconds
  blockDuration: 300 // block for 5 minutes
});

/**
 * Check rate limiter for payment requests
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export const paymentRateLimit = (req, res, next) => {
  const key = req.user ? `payment_${req.user.id}` : `payment_${req.ip}`;
  
  paymentRateLimiter.consume(key)
    .then(() => {
      next();
    })
    .catch((rejRes) => {
      loggers.concurrentRequestsLogger.error({ 
        ip: req.ip, 
        apiUrl: req.url,
        userId: req.user?.id 
      });
      return res.status(429).json({
        success: false,
        data: [],
        message: utility.getMessage(req, false, 'TO_MANY_PAYMENT_REQUEST')
      });
    });
};

// Add properties to the default export for compatibility
rateLimiterMiddleware.rateLimiterPayMiddleware = rateLimiterPayMiddleware;
rateLimiterMiddleware.paymentRateLimit = paymentRateLimit;

export default rateLimiterMiddleware;
