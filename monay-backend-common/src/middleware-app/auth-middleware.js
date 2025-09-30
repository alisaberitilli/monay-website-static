import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';
import { extractTenantContext } from './tenant-middleware.js';

const authenticateToken = async (req, res, next) => {
    // Development bypass for admin dashboard
    if (process.env.NODE_ENV === 'development' && req.headers['x-admin-bypass'] === 'true') {
        // Set a default admin user for development
        req.user = {
            id: 'user-cd06a4f0-b5fd-4c33-b0a2-79a518d62567',
            email: 'test@monay.com',
            isAdmin: false,
            userType: 'user',
            role: 'basic_consumer',
            permissions: {},
            tenant_id: null,
            current_tenant_id: null
        };
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token is missing'
        });
    }

    try {
        console.log('Auth middleware - JWT secret:', config.jwtSecret);
        console.log('Auth middleware - Token (first 50 chars):', token.substring(0, 50));
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('Auth middleware - Token verified successfully');

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
            tenant_id: user.tenant_id || decoded.tenant_id,
            current_tenant_id: user.current_tenant_id || decoded.tenant_id,
            organization_id: decoded.organization_id,
            role: decoded.role || user.role,
            permissions: decoded.permissions || {},
            organization: decoded.organization,
            tenant: decoded.tenant,
            loginType: decoded.loginType
        };

        // Extract tenant context for authenticated user
        await extractTenantContext(req, res, () => {});

        next();
    } catch (error) {
        console.log('Auth middleware - JWT verification error:', error.message);
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Middleware that combines authentication and tenant context
const authenticateWithTenant = [authenticateToken];

export default authenticateToken;
export { authenticateToken, authenticateWithTenant };
