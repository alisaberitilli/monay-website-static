/**
 * Admin Login Routes
 * Dedicated authentication endpoint for platform administrators
 * Separated from consumer and enterprise login for security and clarity
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import controllers from '../controllers/index.js';

const router = Router();
const { accountController } = controllers;

/**
 * Admin Login Endpoint
 * POST /api/admin/login
 *
 * For platform administrators only:
 * - admin@monay.com (platform_admin)
 * - compliance@monay.com (compliance_officer)
 * - treasury@monay.com (treasury_manager)
 * - support@monay.com (support_agent)
 *
 * This endpoint is separate from:
 * - /api/auth/login (enterprise users with corporate emails)
 * - /api/login (consumer users and fallback)
 */
router.post('/admin/login', async (req, res, next) => {
    console.log('=== /api/admin/login received ===');
    console.log('Email:', req.body?.email);
    console.log('Password provided:', req.body?.password ? 'Yes' : 'No');

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('ERROR: Empty request body!');
        return res.status(400).json({
            success: false,
            error: 'Empty request body - no email or password provided'
        });
    }

    const { email, password } = req.body;

    // Validate that it's an admin email
    if (!email || !email.endsWith('@monay.com')) {
        console.error('ERROR: Non-admin email attempting admin login:', email);
        return res.status(403).json({
            success: false,
            error: 'This endpoint is only for Monay platform administrators. Use /api/auth/login for enterprise users.'
        });
    }

    // Set deviceType if not provided
    if (!req.body.deviceType) {
        const userAgent = req.headers['user-agent'] || '';
        req.body.deviceType = userAgent.includes('Android') ? 'android' :
                              userAgent.includes('iPhone') || userAgent.includes('iOS') ? 'ios' : 'web';
    }

    // Normalize email to lowercase
    req.body.email = email.toLowerCase();

    console.log('Admin login attempt for:', req.body.email);

    // Use the existing account controller login method
    return accountController.login(req, res, next);
});

export default router;
