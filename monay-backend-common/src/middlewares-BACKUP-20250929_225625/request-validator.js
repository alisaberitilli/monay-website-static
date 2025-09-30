/**
 * Request Validation Middleware
 * Input validation and sanitization for API requests
 * Consumer Wallet Phase 1 Day 3 Implementation
 */

import Joi from 'joi';
import { ValidationError } from './error-handler.js';
import xss from 'xss';
import validator from 'validator';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID validations
  uuid: Joi.string().uuid({ version: 'uuidv4' }),
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  
  // User fields
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().regex(/^\+?[1-9]\d{1,14}$/),
  username: Joi.string().alphanum().min(3).max(30),
  password: Joi.string().min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain uppercase, lowercase, number and special character'),
  
  // Financial
  amount: Joi.number().positive().precision(2),
  currency: Joi.string().uppercase().length(3),
  
  // Pagination
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
  page: Joi.number().integer().min(1).default(1),
  
  // Dates
  date: Joi.date().iso(),
  dateRange: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().min(Joi.ref('start')).required()
  }),
  
  // Common filters
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'cancelled'),
  sortBy: Joi.string(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

/**
 * Validation schemas for different endpoints
 */
export const schemas = {
  // Authentication
  login: Joi.object({
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().required(),
      rememberMe: Joi.boolean().optional(),
      deviceId: Joi.string().optional()
    })
  }),

  register: Joi.object({
    body: Joi.object({
      firstName: Joi.string().min(1).max(50).required(),
      lastName: Joi.string().min(1).max(50).required(),
      email: commonSchemas.email.required(),
      phone: commonSchemas.phone.optional(),
      password: commonSchemas.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
      acceptTerms: Joi.boolean().valid(true).required()
    })
  }),

  // Wallet Balance
  getBalance: Joi.object({
    query: Joi.object({
      walletId: commonSchemas.uuid.optional()
    })
  }),

  updateLimits: Joi.object({
    body: Joi.object({
      walletId: commonSchemas.uuid.optional(),
      daily_spending_limit: Joi.number().min(0).optional(),
      daily_p2p_limit: Joi.number().min(0).optional(),
      daily_withdrawal_limit: Joi.number().min(0).optional(),
      monthly_spending_limit: Joi.number().min(0).optional(),
      monthly_p2p_limit: Joi.number().min(0).optional(),
      monthly_withdrawal_limit: Joi.number().min(0).optional(),
      per_transaction_limit: Joi.number().min(0).optional(),
      minimum_balance: Joi.number().min(0).optional()
    }).min(1) // At least one field required
  }),

  validateTransaction: Joi.object({
    body: Joi.object({
      walletId: commonSchemas.uuid.optional(),
      amount: commonSchemas.amount.required(),
      transactionType: Joi.string().valid('p2p', 'withdrawal', 'spending', 'payment').required()
    })
  }),

  // P2P Transfer
  searchUsers: Joi.object({
    body: Joi.object({
      query: Joi.string().min(1).required(),
      type: Joi.string().valid('phone', 'email', 'username').optional()
    })
  }),

  validateRecipient: Joi.object({
    body: Joi.object({
      recipientIdentifier: Joi.string().required(),
      recipientType: Joi.string().valid('email', 'phone', 'username', 'id', 'auto').optional()
    })
  }),

  sendMoney: Joi.object({
    body: Joi.object({
      recipientIdentifier: Joi.string().required(),
      amount: commonSchemas.amount.required(),
      note: Joi.string().max(500).optional(),
      category: Joi.string().valid('personal', 'business', 'rent', 'bills', 'other').optional(),
      transferMethod: Joi.string().valid('instant', 'standard', 'scheduled').optional(),
      scheduledDate: commonSchemas.date.optional()
        .when('transferMethod', {
          is: 'scheduled',
          then: Joi.required()
        })
    })
  }),

  transferStatus: Joi.object({
    params: Joi.object({
      transferId: commonSchemas.uuid.required()
    })
  }),

  transferHistory: Joi.object({
    query: Joi.object({
      limit: commonSchemas.limit,
      offset: commonSchemas.offset,
      status: commonSchemas.status,
      type: Joi.string().valid('sent', 'received', 'all').default('all'),
      startDate: commonSchemas.date,
      endDate: commonSchemas.date
    })
  }),

  // Add Money
  addMoneyCard: Joi.object({
    body: Joi.object({
      amount: commonSchemas.amount.required(),
      cardId: commonSchemas.uuid.required(),
      saveCard: Joi.boolean().optional()
    })
  }),

  addMoneyBank: Joi.object({
    body: Joi.object({
      amount: commonSchemas.amount.required(),
      bankAccountId: commonSchemas.uuid.required(),
      transferType: Joi.string().valid('standard', 'instant').default('standard')
    })
  }),

  // Cards
  createVirtualCard: Joi.object({
    body: Joi.object({
      cardName: Joi.string().max(50).optional(),
      spendingLimit: commonSchemas.amount.optional(),
      expiresIn: Joi.number().integer().min(1).max(365).optional()
    })
  }),

  updateCardLimits: Joi.object({
    params: Joi.object({
      cardId: commonSchemas.uuid.required()
    }),
    body: Joi.object({
      dailyLimit: commonSchemas.amount.optional(),
      monthlyLimit: commonSchemas.amount.optional(),
      perTransactionLimit: commonSchemas.amount.optional(),
      allowedCategories: Joi.array().items(Joi.string()).optional(),
      blockedMerchants: Joi.array().items(Joi.string()).optional()
    }).min(1)
  }),

  // User Profile
  updateProfile: Joi.object({
    body: Joi.object({
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
      phone: commonSchemas.phone.optional(),
      dateOfBirth: commonSchemas.date.optional(),
      address: Joi.object({
        street: Joi.string().max(100),
        city: Joi.string().max(50),
        state: Joi.string().max(50),
        postalCode: Joi.string().max(20),
        country: Joi.string().max(50)
      }).optional()
    }).min(1)
  }),

  // Notifications
  updateNotificationPreferences: Joi.object({
    body: Joi.object({
      email_enabled: Joi.boolean(),
      sms_enabled: Joi.boolean(),
      push_enabled: Joi.boolean(),
      notify_transactions: Joi.boolean(),
      notify_security: Joi.boolean(),
      notify_marketing: Joi.boolean(),
      transaction_threshold: commonSchemas.amount,
      quiet_hours_enabled: Joi.boolean(),
      quiet_hours_start: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      quiet_hours_end: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    }).min(1)
  })
};

/**
 * Input sanitization functions
 */
export const sanitizers = {
  /**
   * Sanitize HTML/XSS
   */
  sanitizeHtml: (input) => {
    if (typeof input !== 'string') return input;
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  },

  /**
   * Sanitize SQL injection
   */
  sanitizeSql: (input) => {
    if (typeof input !== 'string') return input;
    // Remove SQL keywords and special characters
    return input.replace(/[;'"\\]/g, '');
  },

  /**
   * Sanitize file paths
   */
  sanitizePath: (input) => {
    if (typeof input !== 'string') return input;
    // Remove path traversal attempts
    return input.replace(/\.\.[\\/]/g, '').replace(/^[\.\\/]+/, '');
  },

  /**
   * Sanitize email
   */
  sanitizeEmail: (email) => {
    if (!email) return email;
    return validator.normalizeEmail(email, {
      all_lowercase: true,
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    });
  },

  /**
   * Sanitize phone number
   */
  sanitizePhone: (phone) => {
    if (!phone) return phone;
    // Remove all non-numeric except +
    return phone.replace(/[^\d+]/g, '');
  },

  /**
   * Sanitize amount
   */
  sanitizeAmount: (amount) => {
    if (!amount) return 0;
    // Ensure 2 decimal places
    return Math.round(parseFloat(amount) * 100) / 100;
  },

  /**
   * Sanitize object recursively
   */
  sanitizeObject: (obj, options = {}) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          sanitized[key] = options.html !== false ? 
            sanitizers.sanitizeHtml(value) : value;
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizers.sanitizeObject(value, options);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }
};

/**
 * Validation middleware factory
 */
export const validate = (schemaName) => {
  return async (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found`));
    }

    try {
      // Sanitize input first
      req.body = sanitizers.sanitizeObject(req.body);
      req.query = sanitizers.sanitizeObject(req.query, { html: false });
      req.params = sanitizers.sanitizeObject(req.params, { html: false });

      // Validate
      const validated = await schema.validateAsync(
        {
          body: req.body,
          query: req.query,
          params: req.params
        },
        {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        }
      );

      // Apply validated and converted values
      req.body = validated.body || {};
      req.query = validated.query || {};
      req.params = validated.params || {};

      next();
    } catch (error) {
      if (error.isJoi) {
        const validationError = new ValidationError(
          'Validation failed',
          {
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
              type: detail.type
            }))
          }
        );
        return next(validationError);
      }
      next(error);
    }
  };
};

/**
 * Custom validation rules
 */
export const customValidators = {
  /**
   * Validate IBAN
   */
  isIBAN: (value) => {
    return validator.isIBAN(value);
  },

  /**
   * Validate credit card
   */
  isCreditCard: (value) => {
    return validator.isCreditCard(value);
  },

  /**
   * Validate crypto address
   */
  isCryptoAddress: (value, chain = 'ETH') => {
    const patterns = {
      ETH: /^0x[a-fA-F0-9]{40}$/,
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    };
    return patterns[chain]?.test(value) || false;
  },

  /**
   * Validate routing number
   */
  isRoutingNumber: (value) => {
    if (!/^\d{9}$/.test(value)) return false;
    
    // ABA routing number checksum
    const digits = value.split('').map(Number);
    const checksum = (
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      (digits[2] + digits[5] + digits[8])
    ) % 10;
    
    return checksum === 0;
  },

  /**
   * Validate SSN (last 4 digits only for security)
   */
  isSSNLast4: (value) => {
    return /^\d{4}$/.test(value);
  }
};

/**
 * Rate limiting validation
 */
export const validateRateLimit = (limit = 100, window = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowStart = now - window;

    // Clean old entries
    for (const [k, timestamps] of requests.entries()) {
      const filtered = timestamps.filter(t => t > windowStart);
      if (filtered.length === 0) {
        requests.delete(k);
      } else {
        requests.set(k, filtered);
      }
    }

    // Check current request
    const timestamps = requests.get(key) || [];
    if (timestamps.length >= limit) {
      return next(new ValidationError(
        'Rate limit exceeded',
        {
          limit,
          window,
          resetTime: new Date(windowStart + window)
        }
      ));
    }

    // Add current request
    timestamps.push(now);
    requests.set(key, timestamps);
    
    // Add rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - timestamps.length);
    res.setHeader('X-RateLimit-Reset', new Date(windowStart + window).toISOString());

    next();
  };
};

export default {
  commonSchemas,
  schemas,
  sanitizers,
  validate,
  customValidators,
  validateRateLimit
};