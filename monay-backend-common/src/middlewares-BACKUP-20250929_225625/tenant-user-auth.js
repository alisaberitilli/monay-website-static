import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';
import { extractTenantContext } from './tenant-middleware.js';

/**
 * Tenant User Authentication Middleware
 *
 * This middleware is for TENANT-ISOLATED operations within business boundaries.
 * It provides JWT authentication WITH full tenant context and isolation for:
 *
 * - Normal business operations within tenant scope
 * - User-facing features and data access
 * - Multi-tenant SaaS functionality
 * - Customer-specific operations
 * - Tenant-specific groups, transactions, and resources
 *
 * This middleware ensures proper tenant isolation and prevents cross-tenant
 * data leakage. It should be used for ALL normal business operations.
 *
 * For platform-wide admin operations, use platform-admin-auth.js instead.
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
        console.log('Tenant User Auth - JWT secret:', config.jwtSecret);
        console.log('Tenant User Auth - Token (first 50 chars):', token.substring(0, 50));
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('Tenant User Auth - Token verified successfully');

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

        // Set user object with all necessary properties for tenant operations
        const isAdmin = user.email === 'admin@monay.com' || user.role === 'admin' || user.role === 'platform_admin' || decoded.role === 'platform_admin';
        req.user = {
            ...decoded,
            id: user.id,
            email: user.email,
            isAdmin: isAdmin,
            userType: isAdmin ? 'admin' : (decoded.userType || user.userType || 'user'),
            tenant_id: user.tenant_id || decoded.tenant_id,
            current_tenant_id: user.current_tenant_id || decoded.tenant_id,
            organization_id: decoded.organization_id,
            role: decoded.role || user.role,
            permissions: decoded.permissions || {},
            organization: decoded.organization,
            tenant: decoded.tenant,
            loginType: decoded.loginType,
            // Tenant user properties
            accessType: 'tenant_user',
            tenantIsolated: true
        };

        // CRITICAL: Extract tenant context for proper isolation
        await extractTenantContext(req, res, () => {});

        next();
    } catch (error) {
        console.log('Tenant User Auth - JWT verification error:', error.message);
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Middleware that combines authentication and tenant context
const authenticateWithTenant = [authenticateToken];

// Alias for compatibility with existing routes
const authenticate = authenticateToken;

export default authenticateToken;
export { authenticateToken, authenticate, authenticateWithTenant };