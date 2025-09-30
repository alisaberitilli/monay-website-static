import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';
// import { extractTenantContext } from './tenant-middleware.js'; // Temporarily disabled

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
            tenant_id: user.tenant_id,
            current_tenant_id: user.current_tenant_id
        };

        // Extract tenant context for authenticated user
        // await extractTenantContext(req, res, () => {}); // Temporarily disabled

        next();
    } catch (error) {
        console.log('Auth middleware - JWT verification error:', error.message);
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Alias for compatibility with existing routes
const authenticate = authenticateToken;

// Basic authorization middleware (can be extended for role-based access)
const authorize = (roles = []) => {
    return (req, res, next) => {
        // If no roles specified, just check if user is authenticated
        if (roles.length === 0) {
            return next();
        }

        // Check if user has required role
        const userRole = req.user?.role || 'user';
        if (roles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: 'Insufficient permissions'
        });
    };
};

// Middleware that combines authentication and tenant context
const authenticateWithTenant = [authenticateToken];

export default authenticateToken;
export { authenticateToken, authenticate, authorize, authenticateWithTenant };
