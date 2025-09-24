const { auditLogService, AuditActions, AuditSeverity, AuditCategory } = require('../services/audit-log');

/**
 * Middleware to automatically log API requests
 */
const auditMiddleware = (options = {}) => {
  const {
    excludePaths = ['/health', '/metrics', '/api/docs'],
    includeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'],
    logGET = false,
    sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey']
  } = options;

  return async (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Skip GET requests unless specifically included
    if (req.method === 'GET' && !logGET) {
      return next();
    }

    // Skip if method not in include list
    if (!includeMethods.includes(req.method) && !logGET) {
      return next();
    }

    // Capture original end method
    const originalEnd = res.end;
    const startTime = Date.now();

    // Override res.end to capture response
    res.end = function(...args) {
      // Call original end
      originalEnd.apply(res, args);

      // Log the audit entry
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Determine severity based on status code
      let severity = AuditSeverity.INFO;
      if (statusCode >= 500) severity = AuditSeverity.ERROR;
      else if (statusCode >= 400) severity = AuditSeverity.WARNING;

      // Sanitize request body
      const sanitizedBody = sanitizeObject(req.body, sensitiveFields);

      // Extract action from path
      const action = extractAction(req.method, req.path);
      const resource = extractResource(req.path);
      const resourceId = extractResourceId(req.path, req.params);

      // Log audit entry
      auditLogService.log({
        userId: req.user?.id || req.userId,
        tenantId: req.tenant?.id || req.tenantId,
        action,
        resource,
        resourceId,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: sanitizedBody,
          statusCode,
          duration
        },
        metadata: {
          headers: sanitizeHeaders(req.headers),
          responseSize: res.get('content-length'),
          errorMessage: statusCode >= 400 ? res.locals.errorMessage : undefined
        },
        ipAddress: getClientIp(req),
        userAgent: req.get('user-agent'),
        sessionId: req.sessionID || req.session?.id,
        severity,
        category: determineCategory(req.path)
      });
    };

    next();
  };
};

/**
 * Middleware for logging specific actions
 */
const auditAction = (action, options = {}) => {
  return async (req, res, next) => {
    const {
      resource = extractResource(req.path),
      resourceId = extractResourceId(req.path, req.params),
      severity = AuditSeverity.INFO,
      category = AuditCategory.GENERAL,
      includeBody = true,
      includeResponse = false
    } = options;

    // Log before action
    await auditLogService.log({
      userId: req.user?.id || req.userId,
      tenantId: req.tenant?.id || req.tenantId,
      action,
      resource,
      resourceId,
      details: includeBody ? {
        method: req.method,
        path: req.path,
        body: sanitizeObject(req.body, ['password', 'token', 'secret'])
      } : {},
      metadata: {
        query: req.query,
        headers: sanitizeHeaders(req.headers)
      },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      sessionId: req.sessionID || req.session?.id,
      severity,
      category
    });

    // Optionally capture response
    if (includeResponse) {
      const originalJson = res.json;
      res.json = function(data) {
        // Log response
        auditLogService.log({
          userId: req.user?.id || req.userId,
          tenantId: req.tenant?.id || req.tenantId,
          action: `${action}_RESPONSE`,
          resource,
          resourceId,
          details: {
            response: sanitizeObject(data, ['password', 'token', 'secret']),
            statusCode: res.statusCode
          },
          severity: res.statusCode >= 400 ? AuditSeverity.WARNING : AuditSeverity.INFO,
          category
        });

        return originalJson.call(this, data);
      };
    }

    next();
  };
};

/**
 * Middleware for compliance logging
 */
const auditCompliance = (complianceType) => {
  return async (req, res, next) => {
    await auditLogService.log({
      userId: req.user?.id || req.userId,
      tenantId: req.tenant?.id || req.tenantId,
      action: `COMPLIANCE_${complianceType.toUpperCase()}`,
      resource: 'compliance',
      resourceId: req.params.id || req.body.id,
      details: {
        complianceType,
        requestData: sanitizeObject(req.body, ['ssn', 'taxId', 'bankAccount']),
        result: res.locals.complianceResult
      },
      metadata: {
        regulations: res.locals.regulations,
        riskScore: res.locals.riskScore
      },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      sessionId: req.sessionID,
      severity: AuditSeverity.INFO,
      category: AuditCategory.COMPLIANCE
    });

    next();
  };
};

/**
 * Middleware for security event logging
 */
const auditSecurity = (eventType, severity = AuditSeverity.SECURITY) => {
  return async (req, res, next) => {
    await auditLogService.log({
      userId: req.user?.id || req.userId,
      tenantId: req.tenant?.id || req.tenantId,
      action: `SECURITY_${eventType.toUpperCase()}`,
      resource: 'security',
      resourceId: null,
      details: {
        eventType,
        path: req.path,
        method: req.method,
        suspiciousActivity: res.locals.suspiciousActivity,
        blocked: res.locals.blocked
      },
      metadata: {
        threatLevel: res.locals.threatLevel,
        attackVector: res.locals.attackVector,
        mitigationApplied: res.locals.mitigation
      },
      ipAddress: getClientIp(req),
      userAgent: req.get('user-agent'),
      sessionId: req.sessionID,
      severity,
      category: AuditCategory.SECURITY
    });

    next();
  };
};

/**
 * Helper function to sanitize sensitive data
 */
function sanitizeObject(obj, sensitiveFields = []) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, sensitiveFields);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper function to sanitize headers
 */
function sanitizeHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  const sanitized = {};

  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Helper function to get client IP
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip;
}

/**
 * Helper function to extract action from request
 */
function extractAction(method, path) {
  const pathParts = path.split('/').filter(Boolean);
  const resource = pathParts[pathParts.length - 1] || 'unknown';
  
  const methodMap = {
    'GET': 'VIEW',
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE'
  };

  return `${resource.toUpperCase()}_${methodMap[method] || method}`;
}

/**
 * Helper function to extract resource from path
 */
function extractResource(path) {
  const pathParts = path.split('/').filter(Boolean);
  
  // Skip 'api' if present
  if (pathParts[0] === 'api') {
    pathParts.shift();
  }

  // Return the resource name (usually first part after api)
  return pathParts[0] || 'unknown';
}

/**
 * Helper function to extract resource ID
 */
function extractResourceId(path, params) {
  // Try to get ID from params
  if (params?.id) return params.id;

  // Try to extract UUID from path
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = path.match(uuidRegex);
  
  return match ? match[0] : null;
}

/**
 * Helper function to determine category from path
 */
function determineCategory(path) {
  if (path.includes('/auth') || path.includes('/login') || path.includes('/logout')) {
    return AuditCategory.AUTHENTICATION;
  }
  if (path.includes('/users') || path.includes('/profile')) {
    return AuditCategory.USER_MANAGEMENT;
  }
  if (path.includes('/transactions') || path.includes('/payments') || path.includes('/wallets')) {
    return AuditCategory.FINANCIAL;
  }
  if (path.includes('/compliance') || path.includes('/kyc') || path.includes('/aml')) {
    return AuditCategory.COMPLIANCE;
  }
  if (path.includes('/admin') || path.includes('/system')) {
    return AuditCategory.SYSTEM;
  }
  
  return AuditCategory.GENERAL;
}

module.exports = {
  auditMiddleware,
  auditAction,
  auditCompliance,
  auditSecurity
};