import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailService from '../services/email.js';
import { authenticate } from '../middleware-app/auth.js';

const router = express.Router();

// Middleware to check super admin access
const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user has super admin role
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'platform_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin privileges'
    });
  }
};

// Initialize PostgreSQL pool - use same database config as main app
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'alisaberi',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'monay',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ============================================
// GET ALL USERS WITH FILTERS
// ============================================
router.get('/', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        id, email, first_name, last_name, phone, mobile, user_type, role,
        is_active, email_verified, mobile_verified, kyc_verified, risk_profile,
        wallet_balance, created_at, updated_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND user_type = $${paramCount++}`;
      params.push(role);
    }

    if (status === 'active') {
      query += ` AND is_active = true`;
    } else if (status === 'suspended') {
      query += ` AND is_active = false`;
    }

    if (search) {
      query += ` AND (email ILIKE $${paramCount++} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    if (role) {
      countQuery += ` AND user_type = $1`;
      countParams.push(role);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: {
        rows: result.rows,
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// ============================================
// LOCK USER ACCOUNT
// ============================================
router.post('/lock', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    // Log the action
    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'LOCK_USER', 'user', userId, JSON.stringify({ reason: 'Admin locked account' })]
    );

    res.json({ success: true, message: 'User account locked successfully' });
  } catch (error) {
    console.error('Error locking user:', error);
    res.status(500).json({ success: false, message: 'Failed to lock user', error: error.message });
  }
});

// ============================================
// UNLOCK USER ACCOUNT
// ============================================
router.post('/unlock', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'UNLOCK_USER', 'user', userId, JSON.stringify({ reason: 'Admin unlocked account' })]
    );

    res.json({ success: true, message: 'User account unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking user:', error);
    res.status(500).json({ success: false, message: 'Failed to unlock user', error: error.message });
  }
});

// ============================================
// ACTIVATE USER
// ============================================
router.post('/activate', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'ACTIVATE_USER', 'user', userId, JSON.stringify({ reason: 'Admin activated account' })]
    );

    res.json({ success: true, message: 'User activated successfully' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ success: false, message: 'Failed to activate user', error: error.message });
  }
});

// ============================================
// SUSPEND USER
// ============================================
router.post('/suspend', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, reason, duration } = req.body;

    await pool.query(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'SUSPEND_USER', 'user', userId, JSON.stringify({ reason, duration })]
    );

    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ success: false, message: 'Failed to suspend user', error: error.message });
  }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'RESET_PASSWORD', 'user', userId, JSON.stringify({ note: 'Password reset by admin' })]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
});

// ============================================
// SEND PASSWORD RESET LINK
// ============================================
router.post('/send-reset-link', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]
    );

    // Send email using email service
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;

    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Password Reset Request',
        message: `
          <h1>Password Reset</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      });
    } catch (emailError) {
      console.error('Email send error (continuing anyway):', emailError);
    }

    res.json({ success: true, message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Error sending reset link:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset link', error: error.message });
  }
});

// ============================================
// VERIFY EMAIL
// ============================================
router.post('/verify-email', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'VERIFY_EMAIL', 'user', userId, JSON.stringify({ note: 'Email manually verified by admin' })]
    );

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, message: 'Failed to verify email', error: error.message });
  }
});

// ============================================
// VERIFY PHONE
// ============================================
router.post('/verify-phone', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query(
      'UPDATE users SET mobile_verified = true, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'VERIFY_PHONE', 'user', userId, JSON.stringify({ note: 'Phone manually verified by admin' })]
    );

    res.json({ success: true, message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Error verifying phone:', error);
    res.status(500).json({ success: false, message: 'Failed to verify phone', error: error.message });
  }
});

// ============================================
// UPDATE KYC STATUS
// ============================================
router.post('/update-kyc', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, status } = req.body;

    await pool.query(
      'UPDATE users SET kyc_verified = $1, updated_at = NOW() WHERE id = $2',
      [status === 'verified', userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'UPDATE_KYC', 'user', userId, JSON.stringify({ status, note: 'KYC status updated by admin' })]
    );

    res.json({ success: true, message: 'KYC status updated successfully' });
  } catch (error) {
    console.error('Error updating KYC:', error);
    res.status(500).json({ success: false, message: 'Failed to update KYC status', error: error.message });
  }
});

// ============================================
// DELETE USER
// ============================================
router.delete('/delete', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.body;

    // Soft delete - set is_active to false and add deletion marker
    await pool.query(
      'UPDATE users SET is_active = false, deleted_at = NOW(), updated_at = NOW() WHERE id = $1',
      [userId]
    );

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'DELETE_USER', 'user', userId, JSON.stringify({ note: 'User deleted by admin' })]
    );

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
});

// ============================================
// UPDATE USER
// ============================================
router.put('/:userId', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, email, userType } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(firstName);
    }
    if (lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(lastName);
    }
    if (phone) {
      updates.push(`phone = $${paramCount++}`, `mobile = $${paramCount++}`);
      values.push(phone, phone);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (userType) {
      updates.push(`user_type = $${paramCount++}`);
      values.push(userType);
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`;

    await pool.query(query, values);

    await pool.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user?.id || 'super-admin', 'UPDATE_USER', 'user', userId, JSON.stringify({ updates: req.body })]
    );

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});

// ============================================
// GET ROLE PERMISSIONS
// ============================================
router.get('/roles/:role/permissions', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.params;

    // Define permissions for each role
    const rolePermissions = {
      'super_admin': [
        { id: '1', resource: 'users', action: 'create', granted: true },
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '4', resource: 'users', action: 'delete', granted: true },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '6', resource: 'transactions', action: 'update', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
        { id: '8', resource: 'settings', action: 'update', granted: true },
      ],
      'admin': [
        { id: '1', resource: 'users', action: 'create', granted: true },
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '4', resource: 'users', action: 'delete', granted: false },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '6', resource: 'transactions', action: 'update', granted: false },
        { id: '7', resource: 'settings', action: 'read', granted: true },
        { id: '8', resource: 'settings', action: 'update', granted: false },
      ],
      'platform_admin': [
        { id: '1', resource: 'users', action: 'create', granted: true },
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '4', resource: 'users', action: 'delete', granted: false },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '6', resource: 'transactions', action: 'update', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
        { id: '8', resource: 'settings', action: 'update', granted: true },
      ],
      'consumer': [
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
      ],
      'enterprise': [
        { id: '1', resource: 'users', action: 'create', granted: true },
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
        { id: '8', resource: 'settings', action: 'update', granted: true },
      ],
      'enterprise_admin': [
        { id: '1', resource: 'users', action: 'create', granted: true },
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '3', resource: 'users', action: 'update', granted: true },
        { id: '4', resource: 'users', action: 'delete', granted: true },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '6', resource: 'transactions', action: 'update', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
        { id: '8', resource: 'settings', action: 'update', granted: true },
      ],
      'merchant': [
        { id: '2', resource: 'users', action: 'read', granted: true },
        { id: '5', resource: 'transactions', action: 'read', granted: true },
        { id: '7', resource: 'settings', action: 'read', granted: true },
      ]
    };

    const permissions = rolePermissions[role] || [];

    res.json({ success: true, data: permissions });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch role permissions', error: error.message });
  }
});

export default router;
