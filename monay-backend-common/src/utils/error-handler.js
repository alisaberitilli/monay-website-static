/**
 * Custom Error Classes for Monay Platform
 * Provides standardized error handling across all services
 */

export class BaseError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends BaseError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends BaseError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource = 'Resource', id = '') {
    super(`${resource} ${id ? `with id ${id} ` : ''}not found`, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends BaseError {
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

export class PaymentError extends BaseError {
  constructor(message = 'Payment processing failed', code = null) {
    super(message, 402);
    this.code = code;
  }
}

export class SecurityError extends BaseError {
  constructor(message = 'Security violation detected') {
    super(message, 403);
    this.severity = 'high';
  }
}

export class ExternalServiceError extends BaseError {
  constructor(service, message = 'External service error') {
    super(`${service}: ${message}`, 503);
    this.service = service;
  }
}

export class DatabaseError extends BaseError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.isOperational = false;
  }
}

export class BlockchainError extends BaseError {
  constructor(message = 'Blockchain operation failed', chain = null) {
    super(message, 500);
    this.chain = chain;
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  if (!(err instanceof BaseError)) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }

  // Log error
  if (!err.isOperational) {
    console.error('Critical error:', err);
  }

  // Send error response
  const response = {
    success: false,
    error: err.name,
    message: err.message,
    timestamp: err.timestamp
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err instanceof ValidationError && err.errors) {
    response.errors = err.errors;
  }

  if (err instanceof RateLimitError) {
    res.setHeader('Retry-After', err.retryAfter);
  }

  return res.status(err.statusCode).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
};

export default {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  PaymentError,
  SecurityError,
  ExternalServiceError,
  DatabaseError,
  BlockchainError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};