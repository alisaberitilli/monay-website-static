# Tenant-Organization-User Hierarchy Architecture

## Last Updated: January 29, 2025

## Core Principle
The tenant represents the **billing and isolation boundary**. Users access the system through either:
1. **Direct tenant relationship** (individual consumers only)
2. **Organization membership** (all business users)

## Architecture Paths

### Path 1: Individual Consumer (Direct)
```
Tenant (type='individual')
    ↓
User (via tenant_users table)
```

**Characteristics:**
- User has direct relationship with tenant via `tenant_users` table
- No organization involved
- One tenant per individual consumer
- Used for: Consumer wallet individual users

**Database Relationship:**
```sql
tenant_users.tenant_id → tenants.id
tenant_users.user_id → users.id
```

### Path 2: Business/Organization (Indirect)
```
Tenant (type='small_business'|'enterprise'|'holding_company')
    ‖ (1:1 relationship)
Organization
    ↓
Users (via organization_users table)
```

**Characteristics:**
- Users are ONLY linked to organization
- Users are NOT in tenant_users table
- Organization is linked to tenant (tenant_id foreign key)
- The organization effectively IS the tenant from a business perspective
- Used for: ALL business users including:
  - Small businesses using consumer wallet
  - Enterprises
  - Holding companies
  - Any business entity

**Database Relationship:**
```sql
organizations.tenant_id → tenants.id
organization_users.organization_id → organizations.id
organization_users.user_id → users.id
```

## Important Rules

### ✅ DO:
- Create individual tenant for consumer wallet individual users
- Create organization with tenant for ALL business users
- Link business users ONLY to organizations (not to tenants directly)
- Treat small businesses same as enterprises for tenant purposes

### ❌ DON'T:
- Add organization users to tenant_users table
- Create direct tenant-user relationships for business users
- Treat small business users as individual consumers

## Query Patterns

### To get a user's tenant context:

```sql
-- For individual consumers
SELECT t.* FROM tenants t
JOIN tenant_users tu ON t.id = tu.tenant_id
WHERE tu.user_id = :user_id;

-- For business users
SELECT t.* FROM tenants t
JOIN organizations o ON t.id = o.tenant_id
JOIN organization_users ou ON o.id = ou.organization_id
WHERE ou.user_id = :user_id;

-- Combined query for any user
SELECT
  t.*,
  CASE
    WHEN tu.id IS NOT NULL THEN 'individual'
    WHEN ou.id IS NOT NULL THEN 'organization'
  END as access_type
FROM users u
LEFT JOIN tenant_users tu ON u.id = tu.user_id
LEFT JOIN tenants t_ind ON tu.tenant_id = t_ind.id
LEFT JOIN organization_users ou ON u.id = ou.user_id
LEFT JOIN organizations o ON ou.organization_id = o.id
LEFT JOIN tenants t_org ON o.tenant_id = t_org.id
CROSS JOIN LATERAL (
  SELECT COALESCE(t_ind.*, t_org.*) as t
) AS tenant_data
WHERE u.id = :user_id;
```

## Tenant Types

| Tenant Type | User Access Pattern | Use Case |
|------------|-------------------|----------|
| `individual` | Direct (tenant_users) | Consumer wallet individual users |
| `household_member` | Direct (tenant_users) | Family member accounts |
| `small_business` | Via Organization | Small businesses using consumer wallet |
| `enterprise` | Via Organization | Enterprise businesses |
| `holding_company` | Via Organization | Parent company with subsidiaries |

## Migration Notes

The migration script (`add_tenant_organization_relationship.sql`) incorrectly added organization users to tenant_users. This should be corrected:

1. Organization users should NOT be in tenant_users table
2. Only individual consumers should be in tenant_users table
3. The organization's tenant_id is the only link needed for business users

## Security & Isolation

### Row-Level Security (RLS)
- Individual consumers: Filter by tenant_id from tenant_users
- Business users: Filter by tenant_id from organization
- Never mix direct and indirect tenant relationships

### API Context
When determining tenant context in API calls:
1. Check if user has direct tenant (tenant_users)
2. If not, check user's organization for tenant
3. Apply appropriate tenant filter to all queries

## Examples

### Individual Consumer Signup
```javascript
// 1. Create user
const user = await createUser(userData);

// 2. Create individual tenant
const tenant = await createTenant({
  type: 'individual',
  name: `${user.firstName} ${user.lastName}`
});

// 3. Link user to tenant directly
await linkUserToTenant(user.id, tenant.id);
```

### Business User Signup
```javascript
// 1. Create organization with tenant
const org = await createOrganization({
  ...orgData,
  tenant_id: tenantId // or auto-create
});

// 2. Create user
const user = await createUser(userData);

// 3. Link user to organization ONLY
await addUserToOrganization(user.id, org.id);
// NOT: await linkUserToTenant() - This would be wrong!
```

### Small Business via Consumer Wallet
```javascript
// Same as business user - NO special treatment
// Even if using consumer wallet, small business = organization pattern
const org = await createOrganization({
  type: 'small_business',
  wallet_type: 'consumer', // Using consumer wallet
  tenant_id: tenantId
});

// Add users to organization, NOT to tenant directly
await addUserToOrganization(user.id, org.id);
```

## Summary

The key insight is that the **organization IS the tenant boundary** for all business users, regardless of size or which wallet they use. Only individual consumers have a direct tenant relationship. This maintains clean separation of concerns and simplifies permission management.