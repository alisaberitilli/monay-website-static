import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';

/**
 * Platform Admin Authentication Middleware
 *
 * This middleware is for PLATFORM-LEVEL operations that need to work ACROSS tenants.
 * It provides JWT authentication with role-based access control but DELIBERATELY
 * does NOT include tenant isolation for the following use cases:
 *
 * - Cross-tenant audit log access
 * - Platform-wide billing operations
 * - Global compliance and regulatory reporting
 * - Platform administration functions
 * - System-wide analytics and monitoring
 *
 * WARNING: Only use this for operations that legitimately need cross-tenant access.
 * For normal business operations, use tenant-user-auth.js instead.
 */

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token is missing'
        });
    }

    try {
        console.log('Platform Admin Auth - JWT secret:', config.jwtSecret);
        console.log('Platform Admin Auth - Token (first 50 chars):', token.substring(0, 50));
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('Platform Admin Auth - Token verified successfully');

        // Extract user ID from various possible locations in the token
        const userId = decoded.id || decoded.userId || decoded.user_id;

        // Verify user exists
        const user = await models.User.findByPk(userId);
        if (!user) {
            console.log('User not found for ID:', userId, 'Token payload keys:', Object.keys(decoded));
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Set user object with all necessary properties
        const isAdmin = user.email === 'admin@monay.com' || user.role === 'admin' || user.role === 'platform_admin' || decoded.role === 'platform_admin';
        req.user = {
            ...decoded,
            id: user.id,
            email: user.email,
            isAdmin: isAdmin,
            userType: isAdmin ? 'admin' : (decoded.userType || user.userType || 'user'),
            tenant_id: user.tenant_id,
            current_tenant_id: user.current_tenant_id,
            // Platform admin properties
            accessType: 'platform_admin',
            crossTenantAccess: true
        };

        // NOTE: We deliberately do NOT call extractTenantContext here
        // This middleware is for platform operations that need cross-tenant access

        next();
    } catch (error) {
        console.log('Platform Admin Auth - JWT verification error:', error.message);
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Role-based authorization middleware for platform admin operations
const authorize = (roles = []) => {
    return (req, res, next) => {
        // If no roles specified, just check if user is authenticated
        if (roles.length === 0) {
            return next();
        }

        // Check if user has required role
        const userRole = req.user?.role || 'user';
        if (roles.includes(userRole) || req.user?.isAdmin) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'Insufficient permissions for platform operation'
        });
    };
};

// Alias for compatibility with existing routes
const authenticate = authenticateToken;

export default authenticateToken;
export { authenticateToken, authenticate, authorize };