// Re-export auth middleware functions for backward compatibility
export * from './auth-middleware.js';
export { default } from './auth-middleware.js';

// Add authenticate alias for compatibility
export { authenticateToken as authenticate } from './auth-middleware.js';