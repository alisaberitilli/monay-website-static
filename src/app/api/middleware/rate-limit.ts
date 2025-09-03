import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Function to generate rate limit key
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  message?: string; // Error message
}

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxRequests: 5,
    message: 'Too many requests, please try again later'
  }
) {
  // Generate rate limit key
  const key = config.keyGenerator 
    ? config.keyGenerator(req)
    : getDefaultKey(req);
    
  const now = Date.now();
  const windowMs = config.windowMs || 60000;
  const maxRequests = config.maxRequests || 5;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, entry);
  } else {
    // Increment counter
    entry.count++;
  }
  
  // Check if rate limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return NextResponse.json(
      { 
        error: config.message || 'Too many requests',
        retryAfter: retryAfter,
        resetTime: new Date(entry.resetTime).toISOString()
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
        }
      }
    );
  }
  
  // Add rate limit headers to successful responses
  return {
    headers: {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    }
  };
}

function getDefaultKey(req: NextRequest): string {
  // Try to get real IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include form type if available
  const url = new URL(req.url);
  const formType = url.pathname.replace('/api/', '');
  
  return `${ip}-${formType}`;
}

// Specific rate limits for different form types
export const FORM_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'vtiger': {
    windowMs: 60000, // 1 minute
    maxRequests: 3,
    message: 'Please wait 1 minute before submitting another form'
  },
  'send-email': {
    windowMs: 300000, // 5 minutes
    maxRequests: 5,
    message: 'Too many emails sent. Please wait 5 minutes.'
  },
  'contact-sales': {
    windowMs: 300000, // 5 minutes
    maxRequests: 2,
    message: 'Please wait before contacting sales again'
  },
  'schedule-meeting': {
    windowMs: 600000, // 10 minutes
    maxRequests: 1,
    message: 'You can only schedule one meeting every 10 minutes'
  }
};

// Helper to get form-specific rate limit
export function getFormRateLimit(formType: string): RateLimitConfig {
  return FORM_RATE_LIMITS[formType] || {
    windowMs: 60000,
    maxRequests: 5,
    message: 'Too many requests, please try again later'
  };
}