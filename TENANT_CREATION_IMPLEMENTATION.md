# Tenant Creation Implementation - Verified Process

**Date**: January 30, 2025
**Status**: ✅ IMPLEMENTED & TESTED

## Overview

When creating a tenant through Monay Admin (`http://localhost:3002/tenants/create`), the system automatically:
1. Creates the tenant
2. Creates the corresponding organization
3. Creates the admin user with the provided email
4. Links the user correctly based on tenant type
5. Sends credentials via email

## Implementation Flow

### Step 1: Admin Creates Tenant
**Location**: `http://localhost:3002/tenants/create`

**Form Fields**:
- Tenant Name: "Microstrategy"
- Email: "ali@microstrategy.com"
- Tenant Type: "Enterprise"
- Billing Tier: "Enterprise"
- Other metadata (phone, address, etc.)

### Step 2: Backend Processing
**Route**: `POST /api/tenants`
**File**: `/monay-backend-common/src/routes/tenants.js` (Lines 220-366)

#### What Happens:

```javascript
// 1. Create Tenant
const tenant = await tenantService.createTenant(req.body);
// Creates tenant with type='enterprise', status='active'

// 2. Auto-Create Organization (inside createTenant)
const organization = tenant.organization;
// Organization automatically created with tenant_id linking back

// 3. Create User
const userId = `enterprise-{tenant.id}`;
INSERT INTO users (
  id, email, first_name, last_name, password_hash,
  user_type, primary_organization_id, ...
)
// User linked to organization via primary_organization_id

// 4. Link User to Organization (NOT tenant_users!)
INSERT INTO organization_users (
  organization_id, user_id, role, permissions, status
) VALUES (
  organization.id, userId, 'admin', '["*"]', 'active'
)

// 5. Send Email with Credentials
emailService.userSignup({
  email: "ali@microstrategy.com",
  password: "password123",
  loginUrl: "http://localhost:3007/login"  // Enterprise Wallet
})
```

## Database Relationships

### Enterprise Tenant (Microstrategy Example):

```
┌─────────────────────────────────────────┐
│ TENANT                                  │
│ id: {uuid}                              │
│ name: "Microstrategy"                   │
│ type: "enterprise"                      │
│ status: "active"                        │
└─────────────────────────────────────────┘
           ↑ (tenant_id)
           │
┌─────────────────────────────────────────┐
│ ORGANIZATION                            │
│ id: {uuid}                              │
│ name: "Microstrategy"                   │
│ tenant_id: {tenant.id} ← LINK           │
│ type: "corporation"                     │
└─────────────────────────────────────────┘
           ↑ (organization_id)
           │
┌─────────────────────────────────────────┐
│ ORGANIZATION_USERS (Junction Table)    │
│ organization_id: {org.id}               │
│ user_id: "enterprise-{tenant.id}"       │
│ role: "admin"                           │
│ permissions: ["*"]                      │
│ status: "active"                        │
└─────────────────────────────────────────┘
           ↓ (user_id)
┌─────────────────────────────────────────┐
│ USER                                    │
│ id: "enterprise-{tenant.id}"            │
│ email: "ali@microstrategy.com"          │
│ password_hash: {bcrypt hash}            │
│ primary_organization_id: {org.id}       │
│ user_type: "enterprise"                 │
│ is_active: true                         │
│ is_verified: true                       │
└─────────────────────────────────────────┘
```

**KEY POINT**: Enterprise users are **NOT** in `tenant_users` table!

## Tenant Type Matrix

| Tenant Type | Organization Created? | User Linkage | Table Used |
|-------------|----------------------|--------------|------------|
| `individual` | ❌ No | Direct to tenant | `tenant_users` |
| `household_member` | ❌ No | Direct to tenant | `tenant_users` |
| `small_business` | ✅ Yes | Via organization | `organization_users` |
| `enterprise` | ✅ Yes | Via organization | `organization_users` |
| `holding_company` | ✅ Yes | Via organization | `organization_users` |

## Login Process

### Enterprise Wallet Login (`http://localhost:3007/login`)

**Credentials**:
- Email: `ali@microstrategy.com`
- Password: `password123` (default, should be changed on first login)

**Authentication Flow**:
```javascript
// 1. User submits email + password
POST /api/auth/login
{ email: "ali@microstrategy.com", password: "password123" }

// 2. Backend verifies credentials
SELECT * FROM users WHERE email = $1 AND is_active = true
// Finds user with id: "enterprise-{tenant.id}"

// 3. Verify password hash
bcrypt.compare(password, user.password_hash)

// 4. Get tenant context via organization
SELECT t.* FROM tenants t
JOIN organizations o ON t.id = o.tenant_id
JOIN organization_users ou ON o.id = ou.organization_id
WHERE ou.user_id = "enterprise-{tenant.id}"

// 5. Generate JWT with tenant context
jwt.sign({
  user_id: user.id,
  email: user.email,
  tenant_id: tenant.id,
  organization_id: organization.id
})

// 6. Return token + user data
```

## Email Notification

**Email Sent To**: Provided email address (e.g., `ali@microstrategy.com`)

**Email Contains**:
- Welcome message
- Organization name
- Login credentials:
  - Email: `ali@microstrategy.com`
  - Password: `password123`
- Login URL: `http://localhost:3007/login` (Enterprise Wallet)
- Instructions to change password on first login
- Support contact: `support@monay.com`

**Email Template**: `create-user-account.ejs`

## Testing Checklist

### ✅ Test 1: Create Enterprise Tenant
1. Login to Monay Admin (`http://localhost:3002/login`)
2. Navigate to Tenants → Create Tenant
3. Fill form:
   - Name: "Test Enterprise"
   - Email: "test@testenterprise.com"
   - Type: "Enterprise"
4. Submit form
5. **Expected Result**:
   - Success message
   - Tenant created
   - Organization created
   - User created
   - Email sent

### ✅ Test 2: Verify Database Records
```sql
-- Check tenant
SELECT * FROM tenants WHERE name = 'Test Enterprise';

-- Check organization (linked to tenant)
SELECT o.* FROM organizations o
JOIN tenants t ON o.tenant_id = t.id
WHERE t.name = 'Test Enterprise';

-- Check user (linked to organization)
SELECT u.* FROM users u
JOIN organizations o ON u.primary_organization_id = o.id
JOIN tenants t ON o.tenant_id = t.id
WHERE t.name = 'Test Enterprise';

-- Check organization membership (NOT tenant_users!)
SELECT ou.* FROM organization_users ou
JOIN users u ON ou.user_id = u.id
WHERE u.email = 'test@testenterprise.com';

-- Verify user is NOT in tenant_users (for enterprise)
SELECT * FROM tenant_users tu
JOIN users u ON tu.user_id = u.id
WHERE u.email = 'test@testenterprise.com';
-- Should return 0 rows for enterprise users!
```

### ✅ Test 3: Login to Enterprise Wallet
1. Navigate to `http://localhost:3007/login`
2. Enter credentials:
   - Email: `test@testenterprise.com`
   - Password: `password123`
3. Click Login
4. **Expected Result**:
   - Successful login
   - Redirected to Enterprise Wallet dashboard
   - User sees organization: "Test Enterprise"

### ✅ Test 4: Verify Tenant Context
After login, verify API calls include tenant context:
```javascript
// All API requests should have tenant isolation
GET /api/wallets
// Should only return wallets for "Test Enterprise" organization
```

## Error Scenarios

### Duplicate Email
If email already exists:
```javascript
ON CONFLICT (email) DO UPDATE SET
  primary_organization_id = $12,
  updated_at = NOW()
```
User is re-assigned to new organization.

### Email Service Failure
If email fails to send:
- Tenant creation still succeeds
- Error logged to console
- Admin sees default password in response
- User can still login

### Missing Organization
If organization creation fails:
- Entire transaction is rolled back
- No tenant created
- No user created
- Error returned to admin

## API Response Example

```json
{
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tenant_code": "ENT-ABC123",
    "name": "Microstrategy",
    "type": "enterprise",
    "status": "active",
    "billing_tier": "enterprise",
    "vault_key": "..." // Only returned on creation
  },
  "organization": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Microstrategy",
    "type": "corporation"
  },
  "user": {
    "id": "enterprise-550e8400-e29b-41d4-a716-446655440000",
    "email": "ali@microstrategy.com",
    "firstName": "Microstrategy",
    "lastName": "Admin",
    "defaultPassword": "password123",
    "message": "Credentials have been sent to the email address provided"
  },
  "message": "Tenant, organization, and admin user created successfully"
}
```

## Configuration

### Environment Variables
```bash
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@monay.com
SMTP_PASS=...

# Application URLs
ENTERPRISE_WALLET_URL=http://localhost:3007
CONSUMER_WALLET_URL=http://localhost:3003

# JWT Secret
JWT_SECRET=monay_jwt_secret_key_2025

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monay
DB_USERNAME=alisaberi
DB_PASSWORD=
```

## Security Considerations

1. **Default Password**: `password123` - Must be changed on first login
2. **Password Hashing**: Bcrypt with 10 salt rounds
3. **Email Security**: Credentials sent once via email, then deleted from response
4. **Tenant Isolation**: Enforced via organization membership
5. **API Keys**: Vault key only returned once on creation

## Future Enhancements

1. **Password Policy**: Enforce strong passwords on first login
2. **Email Verification**: Require email verification before login
3. **MFA Setup**: Prompt for MFA setup after first login
4. **Password Reset**: Automatic password reset link in welcome email
5. **Custom Email Templates**: Per-tenant branded emails

## References

- **Architecture**: `/TENANT_HIERARCHY_ARCHITECTURE.md`
- **Implementation**: `/monay-backend-common/src/routes/tenants.js`
- **Email Service**: `/monay-backend-common/src/services/email.js`
- **Tenant Service**: `/monay-backend-common/src/services/tenant-management.js`
