/**
 * Enhanced Logging Service
 * Comprehensive logging with structured data and multiple transports
 * Consumer Wallet Phase 1 Day 3 Implementation
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Log colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray'
};

winston.addColors(colors);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// File rotation configuration
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Error file rotation
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
});

// Transaction log rotation
const transactionFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/transactions-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '50m',
  maxFiles: '90d',
  format: logFormat
});

// Security log rotation
const securityFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/security-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  format: logFormat
});

// Performance log rotation
const performanceFileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs/performance-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '7d',
  format: logFormat
});

// Create main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: logFormat,
  defaultMeta: {
    service: 'monay-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    fileRotateTransport,
    errorFileRotateTransport
  ],
  exitOnError: false
});

// Add console transport for non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Specialized loggers
const transactionLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { type: 'transaction' },
  transports: [transactionFileRotateTransport]
});

const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { type: 'security' },
  transports: [securityFileRotateTransport]
});

const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { type: 'performance' },
  transports: [performanceFileRotateTransport]
});

/**
 * Enhanced Logger Class
 */
class EnhancedLogger {
  constructor() {
    this.logger = logger;
    this.transactionLogger = transactionLogger;
    this.securityLogger = securityLogger;
    this.performanceLogger = performanceLogger;
    this.contextMap = new Map();
  }

  /**
   * Create a child logger with context
   */
  child(context) {
    const childLogger = Object.create(this);
    childLogger.context = { ...this.context, ...context };
    return childLogger;
  }

  /**
   * Set request context
   */
  setRequestContext(req) {
    const requestId = req.id || uuidv4();
    const context = {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      sessionId: req.session?.id
    };
    this.contextMap.set(requestId, context);
    return requestId;
  }

  /**
   * Get request context
   */
  getRequestContext(requestId) {
    return this.contextMap.get(requestId) || {};
  }

  /**
   * Clear request context
   */
  clearRequestContext(requestId) {
    this.contextMap.delete(requestId);
  }

  /**
   * Log with context
   */
  _log(level, message, metadata = {}) {
    const enhancedMetadata = {
      ...this.context,
      ...metadata,
      timestamp: new Date().toISOString(),
      pid: process.pid
    };
    this.logger[level](message, enhancedMetadata);
  }

  // Standard log methods
  error(message, metadata = {}) {
    this._log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    this._log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    this._log('info', message, metadata);
  }

  http(message, metadata = {}) {
    this._log('http', message, metadata);
  }

  verbose(message, metadata = {}) {
    this._log('verbose', message, metadata);
  }

  debug(message, metadata = {}) {
    this._log('debug', message, metadata);
  }

  /**
   * Log transaction
   */
  logTransaction(data) {
    const transactionData = {
      id: data.id || uuidv4(),
      type: data.type,
      amount: data.amount,
      currency: data.currency || 'USD',
      senderId: data.senderId,
      recipientId: data.recipientId,
      status: data.status,
      method: data.method,
      fees: data.fees,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.transactionLogger.info('Transaction', transactionData);

    // Also log to main logger if error
    if (data.status === 'failed' || data.error) {
      this.error('Transaction failed', transactionData);
    }
  }

  /**
   * Log security event
   */
  logSecurity(event, data = {}) {
    const securityData = {
      event,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.securityLogger.info(event, securityData);

    // Critical security events to main logger
    const criticalEvents = [
      'UNAUTHORIZED_ACCESS',
      'BRUTE_FORCE_ATTEMPT',
      'DATA_BREACH_ATTEMPT',
      'SUSPICIOUS_ACTIVITY'
    ];

    if (criticalEvents.includes(event)) {
      this.error(`SECURITY ALERT: ${event}`, securityData);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation, metrics) {
    const performanceData = {
      operation,
      duration: metrics.duration,
      timestamp: new Date().toISOString(),
      ...metrics
    };

    this.performanceLogger.info(operation, performanceData);

    // Log slow operations to main logger
    if (metrics.duration > 1000) {
      this.warn(`Slow operation: ${operation}`, performanceData);
    }
  }

  /**
   * Log API call
   */
  logApiCall(method, endpoint, statusCode, duration, metadata = {}) {
    const apiData = {
      method,
      endpoint,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.http('API Call', apiData);

    // Log performance
    this.logPerformance(`API:${method}:${endpoint}`, { duration, statusCode });

    // Log errors
    if (statusCode >= 400) {
      this.error(`API Error: ${method} ${endpoint}`, apiData);
    }
  }

  /**
   * Log database query
   */
  logDatabaseQuery(query, duration, metadata = {}) {
    const queryData = {
      query: this._sanitizeQuery(query),
      duration,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    this.debug('Database Query', queryData);

    // Log slow queries
    if (duration > 500) {
      this.warn('Slow Query', queryData);
      this.logPerformance('DB_QUERY', { duration, query: queryData.query });
    }
  }

  /**
   * Log audit trail
   */
  logAudit(action, data) {
    const auditData = {
      action,
      userId: data.userId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      changes: data.changes,
      timestamp: new Date().toISOString(),
      ip: data.ip,
      userAgent: data.userAgent,
      ...data
    };

    this.info(`AUDIT: ${action}`, auditData);

    // Also log to security logger for sensitive actions
    const sensitiveActions = [
      'DELETE',
      'MODIFY_PERMISSIONS',
      'EXPORT_DATA',
      'ACCESS_ADMIN'
    ];

    if (sensitiveActions.includes(action)) {
      this.logSecurity(`AUDIT_${action}`, auditData);
    }
  }

  /**
   * Start performance timer
   */
  startTimer() {
    return process.hrtime();
  }

  /**
   * End performance timer
   */
  endTimer(startTime) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    return seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
  }

  /**
   * Sanitize sensitive data from logs
   */
  _sanitizeQuery(query) {
    if (typeof query !== 'string') return query;

    // Remove sensitive data patterns
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='***'")
      .replace(/key\s*=\s*'[^']*'/gi, "key='***'");
  }

  /**
   * Create request logger middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const startTime = this.startTimer();
      const requestId = this.setRequestContext(req);
      req.id = requestId;

      // Log request
      this.http('Incoming Request', {
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        body: this._sanitizeBody(req.body),
        headers: this._sanitizeHeaders(req.headers)
      });

      // Capture response
      const originalSend = res.send;
      res.send = function(data) {
        res.send = originalSend;
        const duration = enhancedLogger.endTimer(startTime);

        // Log response
        enhancedLogger.logApiCall(
          req.method,
          req.path,
          res.statusCode,
          duration,
          {
            requestId,
            responseSize: data ? data.length : 0
          }
        );

        // Clear context
        enhancedLogger.clearRequestContext(requestId);

        return res.send(data);
      };

      next();
    };
  }

  /**
   * Sanitize request body
   */
  _sanitizeBody(body) {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'pin', 'cvv'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize headers
   */
  _sanitizeHeaders(headers) {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***';
      }
    });

    return sanitized;
  }

  /**
   * Error logger
   */
  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      ...context
    };

    this.error(error.message, errorData);
  }

  /**
   * Stream logs (for real-time monitoring)
   */
  stream() {
    return {
      write: (message) => {
        this.http(message.trim());
      }
    };
  }
}

// Create singleton instance
const enhancedLogger = new EnhancedLogger();

export default enhancedLogger;