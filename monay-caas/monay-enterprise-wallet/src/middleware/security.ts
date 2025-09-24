import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Content Security Policy
const getCSP = () => {
  const nonce = crypto.randomBytes(16).toString('base64');

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline' ${
      process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''
    }`,
    `style-src 'self' 'unsafe-inline' https:`,
    `img-src 'self' data: https: blob:`,
    `font-src 'self' data: https:`,
    `connect-src 'self' https: wss: ${process.env.NEXT_PUBLIC_API_URL}`,
    `media-src 'self' https:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `frame-src 'self' https:`,
    `manifest-src 'self'`,
    `worker-src 'self' blob:`,
    `upgrade-insecure-requests`,
  ].join('; ');

  return { csp, nonce };
};

// Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  }
];

// Rate limiting configuration
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Check rate limit
const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  limit.count++;
  return true;
};

// IP whitelist/blacklist
const IP_WHITELIST = process.env.IP_WHITELIST?.split(',') || [];
const IP_BLACKLIST = process.env.IP_BLACKLIST?.split(',') || [];

// Check IP restrictions
const checkIPRestrictions = (ip: string): boolean => {
  if (IP_BLACKLIST.length > 0 && IP_BLACKLIST.includes(ip)) {
    return false;
  }

  if (IP_WHITELIST.length > 0 && !IP_WHITELIST.includes(ip)) {
    return false;
  }

  return true;
};

// CSRF token generation and validation
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// SQL injection prevention
const preventSQLInjection = (input: string): string => {
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|OR|AND)\b/gi, '');
};

// XSS prevention
const preventXSS = (input: string): string => {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(input).replace(/[&<>"'`=\/]/g, (s) => entityMap[s]);
};

// File upload validation
const validateFileUpload = (
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): { valid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'application/pdf': ['pdf']
  };

  const validExtensions = expectedExtensions[file.type];
  if (!extension || !validExtensions?.includes(extension)) {
    return { valid: false, error: 'File extension mismatch' };
  }

  return { valid: true };
};

// JWT validation
const validateJWT = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    // Additional checks can be added here
    return true;
  } catch {
    return false;
  }
};

// Security middleware
export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Check IP restrictions
  if (!checkIPRestrictions(ip)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Check rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Add security headers
  securityHeaders.forEach(header => {
    response.headers.set(header.key, header.value);
  });

  // Add CSP header with nonce
  const { csp, nonce } = getCSP();
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Nonce', nonce);

  // Add CSRF token to response
  if (request.method === 'GET') {
    const csrfToken = generateCSRFToken();
    response.headers.set('X-CSRF-Token', csrfToken);
  }

  return response;
}

// Export security utilities
export {
  sanitizeInput,
  preventSQLInjection,
  preventXSS,
  validateFileUpload,
  validateJWT,
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  checkIPRestrictions
};

// Security configuration
export const securityConfig = {
  // Session configuration
  session: {
    name: 'monay-session',
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  },

  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3007'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 86400 // 24 hours
  },

  // Password policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommon: true,
    preventReuse: 5 // Prevent reuse of last 5 passwords
  },

  // API security
  api: {
    rateLimitWindow: RATE_LIMIT_WINDOW,
    rateLimitMaxRequests: RATE_LIMIT_MAX_REQUESTS,
    requireAuth: true,
    requireHttps: process.env.NODE_ENV === 'production'
  }
};

export default securityMiddleware;