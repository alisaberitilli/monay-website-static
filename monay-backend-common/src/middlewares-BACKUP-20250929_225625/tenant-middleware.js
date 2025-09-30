import pg from 'pg';
const { Pool } = pg;

// Database pool
const pool = new Pool({
  user: process.env.DB_USER || 'alisaberi',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'monay',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

/**
 * Middleware to extract and validate tenant context for authenticated users
 * This implements the correct tenant hierarchy:
 * - Individual consumers: Direct tenant relationship via tenant_users
 * - Business users: Indirect tenant relationship via organization
 */
export const extractTenantContext = async (req, res, next) => {
  try {
    // Skip if no authenticated user
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;

    // First, check if user is an individual consumer (direct tenant relationship)
    const individualResult = await pool.query(`
      SELECT
        t.id as tenant_id,
        t.tenant_code,
        t.name as tenant_name,
        t.type as tenant_type,
        t.isolation_level,
        t.billing_tier,
        tu.role as user_role,
        'individual' as access_type,
        NULL::UUID as organization_id,
        NULL::TEXT as organization_name
      FROM tenant_users tu
      JOIN tenants t ON tu.tenant_id = t.id
      WHERE tu.user_id = $1
        AND tu.status = 'active'
      LIMIT 1
    `, [userId]);

    if (individualResult.rows.length > 0) {
      // Individual consumer with direct tenant relationship
      req.tenantContext = {
        ...individualResult.rows[0],
        isIndividualConsumer: true,
        isBusinessUser: false
      };
      return next();
    }

    // If not individual, check for business user (via organization)
    const businessResult = await pool.query(`
      SELECT
        t.id as tenant_id,
        t.tenant_code,
        t.name as tenant_name,
        t.type as tenant_type,
        t.isolation_level,
        t.billing_tier,
        ou.role::text as user_role,
        'organization' as access_type,
        o.id as organization_id,
        o.name as organization_name,
        o.organization_type,
        o.wallet_type
      FROM organization_users ou
      JOIN organizations o ON ou.organization_id = o.id
      JOIN tenants t ON o.tenant_id = t.id
      WHERE ou.user_id = $1
        AND ou.invitation_status = 'active'
      ORDER BY ou.joined_at
      LIMIT 1
    `, [userId]);

    if (businessResult.rows.length > 0) {
      // Business user accessing via organization
      req.tenantContext = {
        ...businessResult.rows[0],
        isIndividualConsumer: false,
        isBusinessUser: true
      };
      return next();
    }

    // User has no tenant context - this might be a new user or an error
    req.tenantContext = null;
    next();
  } catch (error) {
    console.error('Error extracting tenant context:', error);
    // Don't fail the request, just log and continue without tenant context
    req.tenantContext = null;
    next();
  }
};

/**
 * Middleware to enforce tenant isolation for data access
 * Must be used after extractTenantContext
 */
export const enforceTenantIsolation = (required = true) => {
  return (req, res, next) => {
    if (!req.tenantContext && required) {
      return res.status(403).json({
        success: false,
        message: 'No tenant context found. Access denied.'
      });
    }
    next();
  };
};

/**
 * Helper function to apply tenant filter to SQL queries
 */
export const applyTenantFilter = (query, tenantId, tableAlias = '') => {
  const prefix = tableAlias ? `${tableAlias}.` : '';

  // Check if WHERE clause exists
  const whereIndex = query.toUpperCase().lastIndexOf('WHERE');

  if (whereIndex !== -1) {
    // Add to existing WHERE clause
    return query.slice(0, whereIndex + 5) +
           ` ${prefix}tenant_id = '${tenantId}' AND` +
           query.slice(whereIndex + 5);
  } else {
    // Add new WHERE clause before ORDER BY, GROUP BY, or at the end
    const orderIndex = query.toUpperCase().lastIndexOf('ORDER BY');
    const groupIndex = query.toUpperCase().lastIndexOf('GROUP BY');
    const insertIndex = Math.min(
      orderIndex !== -1 ? orderIndex : query.length,
      groupIndex !== -1 ? groupIndex : query.length
    );

    return query.slice(0, insertIndex) +
           ` WHERE ${prefix}tenant_id = '${tenantId}'` +
           query.slice(insertIndex);
  }
};

/**
 * Get all tenants a user has access to (for tenant switching)
 */
export const getUserTenants = async (userId) => {
  try {
    const result = await pool.query(`
      -- Individual tenant access
      SELECT
        t.id,
        t.tenant_code,
        t.name,
        t.type,
        'individual' as access_type,
        NULL::UUID as organization_id,
        tu.role,
        tu.is_primary
      FROM tenant_users tu
      JOIN tenants t ON tu.tenant_id = t.id
      WHERE tu.user_id = $1 AND tu.status = 'active'

      UNION ALL

      -- Organization-based tenant access
      SELECT
        t.id,
        t.tenant_code,
        t.name,
        t.type,
        'organization' as access_type,
        o.id as organization_id,
        ou.role::text,
        FALSE as is_primary
      FROM organization_users ou
      JOIN organizations o ON ou.organization_id = o.id
      JOIN tenants t ON o.tenant_id = t.id
      WHERE ou.user_id = $1 AND ou.invitation_status = 'active'

      ORDER BY is_primary DESC, name
    `, [userId]);

    return result.rows;
  } catch (error) {
    console.error('Error getting user tenants:', error);
    throw error;
  }
};

/**
 * Middleware to validate tenant access for specific operations
 */
export const validateTenantAccess = (tenantIdParam = 'tenantId') => {
  return async (req, res, next) => {
    const requestedTenantId = req.params[tenantIdParam] || req.body[tenantIdParam];

    if (!requestedTenantId) {
      return next();
    }

    if (!req.tenantContext) {
      return res.status(403).json({
        success: false,
        message: 'No tenant context found'
      });
    }

    // Check if user has access to the requested tenant
    if (req.tenantContext.tenant_id !== requestedTenantId) {
      // Check if user has access through multiple tenants
      const userTenants = await getUserTenants(req.user.id);
      const hasAccess = userTenants.some(t => t.id === requestedTenantId);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this tenant'
        });
      }
    }

    next();
  };
};

export default {
  extractTenantContext,
  enforceTenantIsolation,
  applyTenantFilter,
  getUserTenants,
  validateTenantAccess
};