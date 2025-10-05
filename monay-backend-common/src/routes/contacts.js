/**
 * Unified Contacts API
 * Returns both organizations and individual users for invoice creation and contact management
 * Supports filtering by type (organization/individual), tenant status, and verification
 */

import express from 'express';
import pg from 'pg';
import { authenticateToken } from '../middleware-app/auth-middleware.js';
import { Logger } from '../services/logger.js';

const router = express.Router();
const { Pool } = pg;
const logger = new Logger({ logName: 'contacts', logFolder: 'contacts' });

// Database pool
const pool = new Pool({
  user: process.env.DB_USER || 'alisaberi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'monay',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

/**
 * GET /api/contacts
 * Returns unified list of organizations and individual users
 *
 * Query Parameters:
 * - type: 'all' | 'organization' | 'individual'
 * - tenant_status: 'all' | 'monay_tenant' | 'external'
 * - verified: 'all' | 'verified' | 'unverified' | 'pending'
 * - search: Search term for name, email, or phone
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      type = 'all',
      tenant_status = 'all',
      verified = 'all',
      search = ''
    } = req.query;

    const results = [];

    // Build organizations query
    if (type === 'all' || type === 'organization') {
      let orgQuery = `
        SELECT
          o.id,
          o.org_id as unique_code,
          o.name,
          o.email,
          o.phone,
          o.address_line1 || COALESCE(', ' || o.city, '') || COALESCE(', ' || o.state, '') || COALESCE(' ' || o.postal_code, '') as address,
          o.tax_id,
          o.website,
          o.tenant_id,
          o.kyb_status as verification_status,
          o.verified,
          o.created_at,
          o.updated_at,
          'organization' as contact_type,
          t.tenant_code,
          t.name as tenant_name,
          CASE WHEN o.tenant_id IS NOT NULL THEN true ELSE false END as is_monay_tenant
        FROM organizations o
        LEFT JOIN tenants t ON o.tenant_id = t.id
        WHERE 1=1
      `;

      const orgParams = [];
      let orgParamIndex = 1;

      // Filter by tenant status
      if (tenant_status === 'monay_tenant') {
        orgQuery += ` AND o.tenant_id IS NOT NULL`;
      } else if (tenant_status === 'external') {
        orgQuery += ` AND o.tenant_id IS NULL`;
      }

      // Filter by verification
      if (verified === 'verified') {
        orgQuery += ` AND o.verified = true AND o.kyb_status = 'approved'`;
      } else if (verified === 'unverified') {
        orgQuery += ` AND (o.verified = false OR o.kyb_status = 'not_started')`;
      } else if (verified === 'pending') {
        orgQuery += ` AND o.kyb_status = 'pending'`;
      }

      // Search filter
      if (search) {
        orgQuery += ` AND (
          o.name ILIKE $${orgParamIndex} OR
          o.email ILIKE $${orgParamIndex} OR
          o.phone ILIKE $${orgParamIndex}
        )`;
        orgParams.push(`%${search}%`);
        orgParamIndex++;
      }

      orgQuery += ` ORDER BY o.updated_at DESC`;

      const orgResult = await pool.query(orgQuery, orgParams);
      results.push(...orgResult.rows);
    }

    // Build users query (for individuals)
    if (type === 'all' || type === 'individual') {
      let userQuery = `
        SELECT
          u.id,
          u.id as unique_code,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.email,
          u.mobile as phone,
          COALESCE(u.address, '') as address,
          NULL as tax_id,
          NULL as website,
          tu.tenant_id,
          CASE WHEN u.kyc_verified THEN 'approved' ELSE 'not_started' END as verification_status,
          COALESCE(u.kyc_verified, false) as verified,
          u.created_at,
          u.updated_at,
          'individual' as contact_type,
          t.tenant_code,
          t.name as tenant_name,
          CASE WHEN tu.tenant_id IS NOT NULL THEN true ELSE false END as is_monay_tenant
        FROM users u
        LEFT JOIN tenant_users tu ON u.id = tu.user_id
        LEFT JOIN tenants t ON tu.tenant_id = t.id
        WHERE 1=1
      `;

      const userParams = [];
      let userParamIndex = 1;

      // Filter by tenant status
      if (tenant_status === 'monay_tenant') {
        userQuery += ` AND tu.tenant_id IS NOT NULL`;
      } else if (tenant_status === 'external') {
        userQuery += ` AND tu.tenant_id IS NULL`;
      }

      // Filter by verification
      if (verified === 'verified') {
        userQuery += ` AND u.kyc_verified = true`;
      } else if (verified === 'unverified') {
        userQuery += ` AND u.kyc_verified = false`;
      } else if (verified === 'pending') {
        userQuery += ` AND u.kyc_level IS NOT NULL AND u.kyc_verified = false`;
      }

      // Search filter
      if (search) {
        userQuery += ` AND (
          u.first_name ILIKE $${userParamIndex} OR
          u.last_name ILIKE $${userParamIndex} OR
          u.email ILIKE $${userParamIndex} OR
          u.mobile ILIKE $${userParamIndex}
        )`;
        userParams.push(`%${search}%`);
        userParamIndex++;
      }

      userQuery += ` ORDER BY u.updated_at DESC`;

      const userResult = await pool.query(userQuery, userParams);
      results.push(...userResult.rows);
    }

    // Sort combined results by updated_at DESC
    results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // Format response
    const formattedResults = results.map(contact => ({
      id: contact.id,
      type: contact.contact_type,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      address: contact.address || null,
      taxId: contact.tax_id || null,
      website: contact.website || null,
      uniqueCode: contact.unique_code || null,
      isMonayTenant: contact.is_monay_tenant,
      tenantId: contact.tenant_id || null,
      tenantCode: contact.tenant_code || null,
      tenantName: contact.tenant_name || null,
      verified: contact.verified || false,
      verificationStatus: contact.verification_status || 'not_started',
      kybStatus: contact.contact_type === 'organization' ? contact.verification_status : undefined,
      kycStatus: contact.contact_type === 'individual' ? contact.verification_status : undefined,
      createdAt: contact.created_at,
      lastUsed: contact.updated_at
    }));

    res.json({
      success: true,
      data: formattedResults,
      total: formattedResults.length,
      filters: {
        type,
        tenant_status,
        verified,
        search
      }
    });
  } catch (error) {
    logger.logError('Get contacts error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/contacts
 * Create a new contact (organization or individual) without requiring tenant
 * Used for adding external contacts that may register later
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      type, // 'organization' | 'individual'
      name,
      email,
      phone,
      address,
      taxId,
      website,
      firstName,
      lastName,
      contactPerson
    } = req.body;

    // Validate required fields
    if (!type || !email) {
      return res.status(400).json({
        success: false,
        message: 'Type and email are required'
      });
    }

    if (type === 'organization' && !name) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required'
      });
    }

    if (type === 'individual' && (!firstName || !lastName)) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required for individuals'
      });
    }

    let result;

    if (type === 'organization') {
      // Check if organization already exists
      const existing = await pool.query(
        'SELECT id FROM organizations WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Organization with this email already exists'
        });
      }

      // Create organization without tenant
      const insertQuery = `
        INSERT INTO organizations (
          org_id,
          name,
          email,
          phone,
          address_line1,
          tax_id,
          website,
          tenant_id,
          kyb_status,
          verified,
          metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NULL, 'not_started', false, $8
        ) RETURNING *
      `;

      const orgId = 'ORG-' + Date.now().toString(36).toUpperCase();
      const metadata = JSON.stringify({
        created_by: req.user.id,
        created_from: 'invoice_creation',
        is_external: true,
        contact_person: contactPerson || null
      });

      result = await pool.query(insertQuery, [
        orgId,
        name,
        email,
        phone || null,
        address || null,
        taxId || null,
        website || null,
        metadata
      ]);

      logger.logInfo('Organization created without tenant', {
        orgId,
        email,
        createdBy: req.user.id
      });

    } else if (type === 'individual') {
      // Check if user already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user without tenant
      const insertQuery = `
        INSERT INTO users (
          id,
          first_name,
          last_name,
          email,
          mobile,
          address,
          kyc_verified
        ) VALUES (
          $1, $2, $3, $4, $5, $6, false
        ) RETURNING *
      `;

      const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);

      result = await pool.query(insertQuery, [
        userId,
        firstName,
        lastName,
        email,
        phone || null,
        address || null
      ]);

      logger.logInfo('Individual user created without tenant', {
        userId,
        email,
        createdBy: req.user.id
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `${type === 'organization' ? 'Organization' : 'Individual'} created successfully as external contact`
    });

  } catch (error) {
    logger.logError('Create contact error', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
