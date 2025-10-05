import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';
import { extractTenantContext } from './tenant-middleware.js';

const authenticateToken = async (req, res, next) => {
    // Development bypass for admin dashboard - generates proper JWT token
    if (process.env.NODE_ENV === 'development' && req.headers['x-admin-bypass'] === 'true') {
        try {
            // Get the admin user from database dynamically
            const adminUser = await models.User.findOne({
                where: { email: 'admin@monay.com' }
            });

            if (adminUser) {
                // Create a proper JWT token for the admin user (same as production login)
                const tokenPayload = {
                    id: adminUser.id,
                    userId: adminUser.id,
                    email: adminUser.email,
                    role: adminUser.role || 'platform_admin',
                    userType: 'admin',
                    isAdmin: true,
                    tenant_id: adminUser.tenant_id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
                };

                // Generate JWT token using the same secret as production
                const token = jwt.sign(tokenPayload, config.jwtSecret);

                // Set the Authorization header so frontend can access the token
                req.headers.authorization = `Bearer ${token}`;

                // Also set req.user for immediate use
                req.user = {
                    ...tokenPayload,
                    permissions: {},
                    current_tenant_id: adminUser.current_tenant_id
                };

                console.log('Development bypass: Generated JWT token for admin user:', adminUser.email);
                return next();
            } else {
                console.error('Admin user not found in database for bypass');
                return res.status(401).json({
                    success: false,
                    error: 'Admin user not found for development bypass'
                });
            }
        } catch (error) {
            console.error('Error in development bypass:', error);
            return res.status(500).json({
                success: false,
                error: 'Development bypass failed'
            });
        }
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

        // Determine the correct role - prioritize decoded.role from JWT
        const userRole = decoded.role || user.role || (isAdmin ? 'platform_admin' : 'user');

        // Determine userType - for admins, always set to 'admin' for backward compatibility
        const userType = isAdmin ? 'admin' : (decoded.userType || user.userType || 'user');

        req.user = {
            ...decoded,
            id: user.id,
            email: user.email,
            isAdmin: isAdmin,
            userType: userType,
            tenant_id: user.tenant_id || decoded.tenant_id,
            current_tenant_id: user.current_tenant_id || decoded.tenant_id,
            organization_id: decoded.organization_id,
            role: userRole,  // Ensure role is always set
            permissions: decoded.permissions || {},
            organization: decoded.organization,
            tenant: decoded.tenant,
            loginType: decoded.loginType
        };

        console.log('Auth middleware - User authenticated:', {
            email: req.user.email,
            role: req.user.role,
            userType: req.user.userType,
            isAdmin: req.user.isAdmin
        });

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
