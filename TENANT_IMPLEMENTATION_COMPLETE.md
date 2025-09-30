# Tenant Implementation - Complete Documentation

## Implementation Date: January 29, 2025

## Overview
The tenant-organization-user hierarchy has been fully implemented across the Monay platform, establishing proper multi-tenant isolation and management capabilities for both consumer and business users.

## Architecture Overview

### Core Principle
The tenant represents the **billing and isolation boundary**. Users access the system through either:
1. **Direct tenant relationship** (individual consumers only)
2. **Organization membership** (all business users)

### Hierarchy Models

```
Individual Consumer Path:
Tenant (type='individual')
    ↓ (direct via tenant_users)
User

Business Path (Small Business & Enterprise):
Tenant (type='small_business'|'enterprise')
    ↓ (1:1 relationship)
Organization
    ↓ (via organization_users)
Users
```

## Implementation Details

### 1. Database Schema

#### Key Tables
- **tenants**: Master tenant records with billing and isolation settings
- **organizations**: Business entities linked to tenants (tenant_id FK)
- **organization_users**: Links users to organizations (NOT to tenants)
- **tenant_users**: Links ONLY individual consumers directly to tenants
- **users**: User records with type differentiation

#### Database Migration
File: `/monay-backend-common/migrations/fix_tenant_hierarchy_relationships.sql`
- Removes incorrect tenant_users entries for organization users
- Creates views for hierarchy queries
- Adds functions for tenant context retrieval
- Implements triggers to prevent invalid relationships

### 2. Backend Implementation

#### Tenant Middleware
File: `/monay-backend-common/src/middlewares/tenant-middleware.js`

Key Functions:
- `extractTenantContext`: Automatically extracts tenant context for authenticated users
- `enforceTenantIsolation`: Enforces tenant access rules
- `applyTenantFilter`: Adds tenant filtering to database queries
- `getUserTenants`: Lists all tenants a user can access
- `validateTenantAccess`: Validates specific tenant operations

#### Authentication Enhancement
File: `/monay-backend-common/src/middlewares/auth-middleware.js`
- Integrated tenant context extraction into authentication flow
- Tenant context automatically available on all authenticated requests

#### User Repository Updates
File: `/monay-backend-common/src/repositories/user-repository.js`

Enhanced signup function now handles:
- **Individual Consumers**: Creates individual tenant and direct tenant-user link
- **Small Businesses**: Creates tenant, organization, and organization-user link
- **Enterprise Users**: Joins existing organization (no new tenant)

### 3. API Endpoints

#### Registration Endpoints
- `POST /api/auth/register/consumer` - Individual consumer registration
- `POST /api/auth/register/business` - Small business registration
- `POST /api/auth/register/enterprise` - Enterprise user registration

#### Tenant Context Endpoints
- `GET /api/user/context` - Returns complete tenant context for authenticated user
- `POST /api/user/switch-tenant` - Switch between multiple tenants (if applicable)

#### Response Format
```json
{
  "tenantId": "uuid",
  "tenantCode": "TNT-XXX",
  "tenantType": "individual|small_business|enterprise",
  "accessType": "individual|organization",
  "organizationId": "uuid|null",
  "organizationName": "string|null",
  "role": "owner|admin|member",
  "walletType": "consumer|enterprise"
}
```

### 4. Registration Flow

#### Individual Consumer
```javascript
// Request to /api/auth/register/consumer
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+15551234567",
  "password": "securepassword",
  "userType": "individual"  // Auto-set by endpoint
}
// Creates: User → Tenant (individual) → TenantUser link
```

#### Small Business
```javascript
// Request to /api/auth/register/business
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@business.com",
  "phoneNumber": "+15551234567",
  "password": "securepassword",
  "businessName": "Smith Enterprises",
  "businessType": "small_business"  // Auto-set
}
// Creates: User → Organization → Tenant (small_business)
```

#### Enterprise User
```javascript
// Request to /api/auth/register/enterprise
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob@enterprise.com",
  "phoneNumber": "+15551234567",
  "password": "securepassword",
  "organizationId": "existing-org-uuid"  // Or inviteCode
}
// Creates: User → Joins existing Organization (no new tenant)
```

## Security & Isolation

### Row-Level Security (RLS)
- Individual consumers: Filter by tenant_id from tenant_users
- Business users: Filter by tenant_id from organization
- Tenant context automatically applied to all queries

### Middleware Protection
- `extractTenantContext`: Runs on every authenticated request
- `enforceTenantIsolation`: Can be applied to routes requiring tenant context
- `validateTenantAccess`: Validates cross-tenant operations

### Trigger Protection
Database trigger `check_tenant_user_validity` prevents:
- Organization users being added to tenant_users
- Invalid tenant relationships

## Testing the Implementation

### Test Endpoints

1. **Get Current User Context**
```bash
curl -X GET http://localhost:3001/api/user/context \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

2. **Register Individual Consumer**
```bash
curl -X POST http://localhost:3001/api/auth/register/consumer \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phoneNumber": "+15551234567",
    "password": "Test123!"
  }'
```

3. **Register Small Business**
```bash
curl -X POST http://localhost:3001/api/auth/register/business \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Business",
    "lastName": "Owner",
    "email": "owner@business.com",
    "phoneNumber": "+15551234568",
    "password": "Test123!",
    "businessName": "Test Business LLC"
  }'
```

### Verification Queries

```sql
-- Check tenant summary
SELECT * FROM tenant_summary;

-- View hierarchy
SELECT * FROM tenant_hierarchy_view;

-- Get user's tenant context
SELECT * FROM get_user_tenant_context('user-id-here');
```

## Migration Status

### Completed ✅
1. Database migration executed successfully
2. Tenant middleware integrated into authentication
3. Registration endpoints created for all user types
4. User repository enhanced with tenant creation logic
5. API endpoints for tenant context management

### Database Status
```
Individual Consumers: 2 users with direct tenant relationships
Business Users: Ready for new registrations
Organizations: Ready for tenant assignment
```

## Important Notes

### Business Rules
1. **NEVER** add organization users to tenant_users table
2. Small businesses are treated same as enterprises (organization-based)
3. Only individual consumers have direct tenant relationships
4. Organizations have 1:1 relationship with tenants

### Error Handling
- Tenant creation failures don't block user registration
- Errors are logged but user creation continues
- Tenant context extraction failures return null context

### Performance Considerations
- Tenant context cached in request object
- Database views optimize hierarchy queries
- Indexes on tenant_id, organization_id, user_id

## Maintenance

### Adding New User Types
1. Update registration endpoint
2. Modify user repository signup logic
3. Update tenant type in database
4. Test isolation and access

### Monitoring
- Check logs for tenant creation errors
- Monitor `tenant_summary` view for counts
- Verify no organization users in tenant_users

## Rollback Plan

If issues occur:
1. Remove trigger `check_tenant_user_validity`
2. Restore original auth middleware (remove tenant extraction)
3. Disable new registration endpoints
4. Revert user repository changes

## Next Steps

1. **Frontend Implementation**
   - Add account type selection UI in consumer wallet
   - Update enterprise wallet to show organization context
   - Display tenant information in admin portal

2. **Enhanced Features**
   - Implement invite code system for enterprises
   - Add tenant switching UI for multi-tenant users
   - Create tenant management dashboard for admins

3. **Testing**
   - End-to-end registration flow tests
   - Tenant isolation verification tests
   - Performance testing with multiple tenants

## Contact

For questions or issues related to tenant implementation:
- Check logs in `/monay-backend-common/logs/`
- Review migration output in PostgreSQL
- Monitor tenant_summary for anomalies