/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 * Consumer Wallet Phase 1 Day 3 Implementation
 */

import logger from '../services/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    this.id = uuidv4();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific Error Classes
 */
export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = {}) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', details = {}) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = {}) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = {}) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message, code = 'BUSINESS_ERROR', details = {}) {
    super(message, 422, code, details);
  }
}

export class InsufficientFundsError extends BusinessLogicError {
  constructor(available, required, details = {}) {
    super(
      `Insufficient funds. Available: ${available}, Required: ${required}`,
      'INSUFFICIENT_FUNDS',
      { available, required, ...details }
    );
  }
}

export class TransactionLimitError extends BusinessLogicError {
  constructor(limitType, limit, attempted, details = {}) {
    super(
      `Transaction limit exceeded. ${limitType} limit: ${limit}, Attempted: ${attempted}`,
      'TRANSACTION_LIMIT_EXCEEDED',
      { limitType, limit, attempted, ...details }
    );
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message, details = {}) {
    super(
      `External service error (${service}): ${message}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      { service, ...details }
    );
  }
}

/**
 * Error Response Formatter
 */
class ErrorResponse {
  constructor(error, req) {
    this.success = false;
    this.error = {
      id: error.id || uuidv4(),
      code: error.code || 'UNKNOWN_ERROR',
      message: this.sanitizeMessage(error.message),
      timestamp: error.timestamp || new Date().toISOString()
    };

    // Add details in development mode
    if (process.env.NODE_ENV === 'development') {
      this.error.details = error.details || {};
      this.error.stack = error.stack;
      this.error.path = req.path;
      this.error.method = req.method;
    }

    // Add request ID for tracking
    if (req.id) {
      this.error.requestId = req.id;
    }
  }

  sanitizeMessage(message) {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /key/gi,
      /authorization/gi
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        sanitized = 'An error occurred with sensitive information';
      }
    });

    return sanitized;
  }
}

/**
 * Async Error Handler Wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request Validation Middleware
 */
export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(
        {
          body: req.body,
          query: req.query,
          params: req.params
        },
        {
          abortEarly: false,
          stripUnknown: true
        }
      );

      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      const validationError = new ValidationError(
        'Validation failed',
        {
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      );
      next(validationError);
    }
  };
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError('Endpoint');
  next(error);
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle non-operational errors
  if (!error.isOperational) {
    // Log unexpected errors
    logger.error('Unexpected error:', {
      error: err,
      stack: err.stack,
      request: {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        user: req.user?.id
      }
    });

    // Replace with generic error for client
    error = new AppError(
      'An unexpected error occurred',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  // Handle specific error types
  if (err.name === 'CastError') {
    error = new ValidationError('Invalid ID format');
  } else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new ValidationError(errors.join('. '));
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ConflictError(`${field} already exists`);
  } else if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  } else if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  } else if (err.name === 'SequelizeDatabaseError') {
    logger.error('Database error:', err);
    error = new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  } else if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    error = new ValidationError(errors.join('. '));
  }

  // Log error
  logger.error(`Error ${error.id}:`, {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    user: req.user?.id,
    path: req.path,
    method: req.method
  });

  // Send error response
  const errorResponse = new ErrorResponse(error, req);
  res.status(error.statusCode || 500).json(errorResponse);
};

/**
 * Database Error Handler
 */
export const handleDatabaseError = (error) => {
  if (error.name === 'SequelizeDatabaseError') {
    if (error.parent?.code === '23505') {
      // Unique constraint violation
      return new ConflictError('Record already exists');
    } else if (error.parent?.code === '23503') {
      // Foreign key violation
      return new ValidationError('Invalid reference');
    } else if (error.parent?.code === '23502') {
      // Not null violation
      return new ValidationError('Required field missing');
    }
  }
  return error;
};

/**
 * Transaction Error Recovery
 */
export const withErrorRecovery = async (fn, retries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors
      if (error.statusCode && error.statusCode < 500) {
        throw error;
      }
      
      // Wait before retry
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        logger.info(`Retrying operation (attempt ${i + 2}/${retries})`);
      }
    }
  }
  
  throw lastError;
};

/**
 * Circuit Breaker for External Services
 */
class CircuitBreaker {
  constructor(name, threshold = 5, timeout = 60000) {
    this.name = name;
    this.failureCount = 0;
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new ExternalServiceError(
          this.name,
          'Service temporarily unavailable',
          { retryAfter: this.nextAttempt }
        );
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      logger.warn(`Circuit breaker opened for ${this.name}`);
    }
  }
}

export const circuitBreakers = {
  stripe: new CircuitBreaker('Stripe', 5, 60000),
  dwolla: new CircuitBreaker('Dwolla', 5, 60000),
  twilio: new CircuitBreaker('Twilio', 5, 30000),
  sendgrid: new CircuitBreaker('SendGrid', 5, 30000)
};

/**
 * Rate Limit Error Handler
 */
export const handleRateLimitError = (req, res) => {
  const error = new RateLimitError(
    'Too many requests from this IP',
    {
      ip: req.ip,
      limit: req.rateLimit?.limit,
      remaining: req.rateLimit?.remaining,
      resetTime: req.rateLimit?.resetTime
    }
  );
  
  res.status(429).json(new ErrorResponse(error, req));
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BusinessLogicError,
  InsufficientFundsError,
  TransactionLimitError,
  ExternalServiceError,
  asyncHandler,
  validateRequest,
  notFoundHandler,
  errorHandler,
  handleDatabaseError,
  withErrorRecovery,
  circuitBreakers,
  handleRateLimitError
};