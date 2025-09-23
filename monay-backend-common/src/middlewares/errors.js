/**
 * Custom Error Class for Application-wide Error Handling
 */
export class CustomError extends Error {
  constructor(message, status = 500, code = null) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error Class
 */
export class ValidationError extends CustomError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Authentication Error Class
 */
export class AuthenticationError extends CustomError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error Class
 */
export class AuthorizationError extends CustomError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error Class
 */
export class NotFoundError extends CustomError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error Class
 */
export class ConflictError extends CustomError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error Class
 */
export class RateLimitError extends CustomError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/**
 * Service Unavailable Error Class
 */
export class ServiceUnavailableError extends CustomError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Payment Error Class
 */
export class PaymentError extends CustomError {
  constructor(message, details = {}) {
    super(message, 402, 'PAYMENT_ERROR');
    this.name = 'PaymentError';
    this.details = details;
  }
}

/**
 * Integration Error Class
 */
export class IntegrationError extends CustomError {
  constructor(service, message) {
    super(`${service} integration error: ${message}`, 502, 'INTEGRATION_ERROR');
    this.name = 'IntegrationError';
    this.service = service;
  }
}

export default {
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  PaymentError,
  IntegrationError
};