import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from '../services/logger.js';

// Redis client for rate limiting
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 1, // Use separate DB for rate limiting
  keyPrefix: 'ratelimit:',
  enableOfflineQueue: false
});

redisClient.on('error', (err) => {
  logger.error('Redis rate limiter error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis rate limiter connected');
});

// Different rate limits for different operations
const rateLimits = {
  // General super admin endpoints
  general: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests from this admin, please try again later.'
  },

  // Sensitive operations (freeze/unfreeze wallets, provider switching)
  sensitive: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 sensitive operations per 5 minutes
    message: 'Too many sensitive operations, please wait before trying again.'
  },

  // Read-heavy operations (metrics, analytics)
  metrics: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // 200 requests per minute
    message: 'Too many metric requests, please slow down.'
  },

  // Export operations
  export: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // 5 exports per 10 minutes
    message: 'Export limit reached, please wait before exporting again.'
  },

  // Batch operations
  batch: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 batch operations per minute
    message: 'Batch operation limit reached, please wait.'
  }
};

// Create rate limiter with Redis store
const createRateLimiter = (config, keyGenerator) => {
  const limiterConfig = {
    ...config,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    store: new RedisStore({
      client: redisClient,
      prefix: 'super-admin:',
    }),
    keyGenerator: keyGenerator || ((req) => {
      // Use user ID for rate limiting to prevent bypassing with different IPs
      return req.user?.id || req.ip;
    }),
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        userId: req.user?.id,
        ip: req.ip,
        path: req.path,
        method: req.method
      });

      res.status(429).json({
        success: false,
        message: config.message,
        retryAfter: res.getHeader('Retry-After')
      });
    },
    skip: (req) => {
      // Skip rate limiting for system admins in development
      if (process.env.NODE_ENV === 'development' && req.user?.role === 'system') {
        return true;
      }
      return false;
    }
  };

  return rateLimit(limiterConfig);
};

// Export rate limiters for different endpoint types
export const generalRateLimiter = createRateLimiter(rateLimits.general);
export const sensitiveRateLimiter = createRateLimiter(rateLimits.sensitive);
export const metricsRateLimiter = createRateLimiter(rateLimits.metrics);
export const exportRateLimiter = createRateLimiter(rateLimits.export);
export const batchRateLimiter = createRateLimiter(rateLimits.batch);

// Dynamic rate limiter based on operation type
export const dynamicRateLimiter = (req, res, next) => {
  const path = req.path;
  const method = req.method;

  // Determine which rate limiter to use based on the endpoint
  if (path.includes('/freeze') || path.includes('/unfreeze') || path.includes('/set-primary') || path.includes('/failover')) {
    return sensitiveRateLimiter(req, res, next);
  }

  if (path.includes('/metrics') || path.includes('/analytics') || path.includes('/dashboard')) {
    return metricsRateLimiter(req, res, next);
  }

  if (path.includes('/export')) {
    return exportRateLimiter(req, res, next);
  }

  if (path.includes('/batch') || method === 'POST' && path.includes('/process')) {
    return batchRateLimiter(req, res, next);
  }

  // Default to general rate limiter
  return generalRateLimiter(req, res, next);
};

// Per-user rate limiting with different tiers
export const tieredRateLimiter = createRateLimiter(
  {
    windowMs: 1 * 60 * 1000,
    max: (req) => {
      // Different limits based on user role/tier
      const userRole = req.user?.role;
      const userTier = req.user?.tier;

      if (userRole === 'super_admin') {
        return 500; // Super admins get higher limits
      }

      if (userRole === 'admin') {
        switch (userTier) {
          case 'enterprise':
            return 300;
          case 'premium':
            return 200;
          default:
            return 100;
        }
      }

      return 50; // Default for other roles
    },
    message: 'Rate limit exceeded for your tier.'
  }
);

// IP-based rate limiting for authentication endpoints
export const authRateLimiter = createRateLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful logins
    message: 'Too many login attempts, please try again later.'
  },
  (req) => req.ip // Use IP for auth rate limiting
);

// Distributed rate limiting across multiple servers
export const distributedRateLimiter = createRateLimiter(
  {
    windowMs: 1 * 60 * 1000,
    max: async (req) => {
      // Check global rate limits from Redis
      const globalKey = `global:${req.user?.id}`;
      const globalCount = await redisClient.get(globalKey);

      if (globalCount && parseInt(globalCount) > 1000) {
        return 0; // Block if global limit exceeded
      }

      return 100; // Normal limit
    },
    message: 'Global rate limit exceeded.'
  }
);

// Cost-based rate limiting for expensive operations
export const costBasedRateLimiter = (costCalculator) => {
  return async (req, res, next) => {
    try {
      const cost = await costCalculator(req);
      const userId = req.user?.id || req.ip;
      const budgetKey = `budget:${userId}`;

      // Get current budget usage
      const currentUsage = parseInt(await redisClient.get(budgetKey) || '0');
      const maxBudget = req.user?.role === 'super_admin' ? 10000 : 1000;

      if (currentUsage + cost > maxBudget) {
        return res.status(429).json({
          success: false,
          message: 'Operation cost exceeds your remaining budget',
          currentUsage,
          maxBudget,
          requestedCost: cost
        });
      }

      // Increment usage
      await redisClient.incrby(budgetKey, cost);
      await redisClient.expire(budgetKey, 3600); // Reset every hour

      // Add cost info to request
      req.operationCost = cost;
      req.budgetRemaining = maxBudget - currentUsage - cost;

      next();
    } catch (error) {
      logger.error('Cost-based rate limiting error:', error);
      next(); // Don't block on errors
    }
  };
};

// Cleanup function for testing
export const cleanup = async () => {
  await redisClient.quit();
};

export default dynamicRateLimiter;