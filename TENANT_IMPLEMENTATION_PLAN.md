# Tenant Implementation Plan - Complete Stack

## Implementation Date: January 29, 2025

## Overview
This plan outlines the complete implementation of the correct tenant-organization-user hierarchy across the entire Monay platform stack.

## Architecture Summary
- **Individual Consumers**: Tenant → User (direct via tenant_users)
- **All Businesses**: Tenant → Organization → Users (indirect, users NOT in tenant_users)

---

## 1. DATABASE LAYER ✅ Completed

### Migration Created: `fix_tenant_hierarchy_relationships.sql`
- [x] Remove incorrect tenant_users entries for organization users
- [x] Ensure individual consumers have direct tenant relationships
- [x] Create views for correct hierarchy (`tenant_hierarchy_view`)
- [x] Add functions for tenant context retrieval
- [x] Add triggers to prevent incorrect relationships

### Key Tables
- `tenants`: Master tenant records
- `organizations`: Has `tenant_id` foreign key
- `organization_users`: Links users to organizations (NOT to tenants)
- `tenant_users`: Links ONLY individual consumers to tenants
- `users`: User records

---

## 2. BACKEND API LAYER ✅ Partially Complete

### Middleware Created: `tenant-middleware.js`
- [x] `extractTenantContext`: Gets tenant context based on user type
- [x] `enforceTenantIsolation`: Enforces tenant access rules
- [x] `applyTenantFilter`: Adds tenant filtering to queries
- [x] `getUserTenants`: Lists all tenants user can access
- [x] `validateTenantAccess`: Validates specific tenant operations

### Routes to Update

#### `/api/auth` - User Registration
```javascript
// Consumer registration (individual)
POST /api/auth/register/consumer
{
  "email": "",
  "userType": "individual",  // Creates direct tenant relationship
  "firstName": "",
  "lastName": ""
}

// Small Business registration (via consumer wallet)
POST /api/auth/register/business
{
  "email": "",
  "userType": "business",
  "businessName": "",        // Creates organization with tenant
  "businessType": "small_business"
}

// Enterprise registration
POST /api/auth/register/enterprise
{
  "organizationId": "",       // Joins existing org (no tenant_users entry)
  "inviteCode": ""
}
```

#### `/api/organizations` ✅ Updated
- [x] Create organization with tenant assignment
- [x] GET endpoints return tenant information
- [ ] Ensure users added to org are NOT added to tenant_users

#### `/api/users`
- [ ] Update profile endpoint to show tenant context
- [ ] Add tenant switching endpoint for users with multiple tenants

#### `/api/wallets`
- [ ] Apply tenant filtering based on context
- [ ] Ensure correct isolation

#### `/api/transactions`
- [ ] Apply tenant filtering
- [ ] Validate cross-tenant transfers

---

## 3. FRONTEND - ADMIN PORTAL (Port 3002)

### Pages to Update

#### `/organizations` List Page
- [ ] Show tenant assignment for each organization
- [ ] Display tenant type (small_business, enterprise, etc.)
- [ ] Show user count per organization

#### `/organizations/new` ✅ Updated
- [x] Added tenant selection dropdown
- [ ] Add logic to determine tenant type based on org type
- [ ] Validate tenant assignment

#### `/tenants` (New Page Needed)
- [ ] Create tenant management page
- [ ] Show tenant hierarchy view
- [ ] Display organizations under each tenant
- [ ] Show individual consumers vs business users

#### `/users-management`
- [ ] Show user's access type (individual vs organization)
- [ ] Display tenant context for each user
- [ ] Allow viewing users by tenant

---

## 4. FRONTEND - ENTERPRISE WALLET (Port 3007)

### Context Management
- [ ] Use organization-based tenant context
- [ ] Remove any direct tenant_users checks
- [ ] Update API calls to include tenant context

### User Interface
- [ ] Show organization name in header
- [ ] Display tenant information in settings
- [ ] Ensure all data is filtered by organization's tenant

---

## 5. FRONTEND - CONSUMER WALLET (Port 3003)

### Registration Flow

#### Individual Consumer Path
```javascript
// Step 1: User selects "Personal Account"
// Step 2: Create user
// Step 3: Create individual tenant
// Step 4: Link via tenant_users
```

#### Small Business Path
```javascript
// Step 1: User selects "Business Account"
// Step 2: Create organization with tenant
// Step 3: Create user
// Step 4: Link user to organization (NOT tenant_users)
```

### Account Type Selection Component
```jsx
<AccountTypeSelector>
  <Option value="individual">
    Personal Account
    - Individual wallet
    - Direct tenant relationship
  </Option>

  <Option value="small_business">
    Small Business
    - Business features
    - Organization with tenant
  </Option>
</AccountTypeSelector>
```

### Dashboard Updates
- [ ] Show correct wallet type based on tenant context
- [ ] Display organization info for business users
- [ ] Show individual features for consumers

---

## 6. API ENDPOINTS SPECIFICATION

### GET /api/user/context
Returns complete tenant context for authenticated user
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

### POST /api/user/switch-tenant
For users with multiple tenant access
```json
{
  "tenantId": "uuid"
}
```

### GET /api/tenants/summary
Admin endpoint for tenant overview
```json
{
  "individualConsumers": {
    "count": 100,
    "activeCount": 95
  },
  "businesses": {
    "smallBusiness": 50,
    "enterprise": 10,
    "holdingCompany": 2
  }
}
```

---

## 7. TESTING SCENARIOS

### Test Case 1: Individual Consumer Registration
1. Register as individual
2. Verify tenant created with type='individual'
3. Verify user in tenant_users
4. Verify user NOT in organization_users
5. Verify can access individual wallet features

### Test Case 2: Small Business Registration
1. Register as small business
2. Verify organization created
3. Verify tenant created with type='small_business'
4. Verify user in organization_users
5. Verify user NOT in tenant_users
6. Verify can access business features

### Test Case 3: Enterprise User Join
1. Join existing enterprise organization
2. Verify NO new tenant created
3. Verify user added to organization_users
4. Verify user NOT in tenant_users
5. Verify inherits organization's tenant context

### Test Case 4: Tenant Isolation
1. Create data for tenant A
2. Create data for tenant B
3. Login as tenant A user
4. Verify cannot see tenant B data
5. Verify all queries filtered by tenant

---

## 8. DEPLOYMENT STEPS

### Phase 1: Database & Backend
1. Run migration `fix_tenant_hierarchy_relationships.sql`
2. Deploy tenant middleware
3. Update organization routes
4. Test with existing data

### Phase 2: Registration Flows
1. Update consumer wallet registration
2. Add business/individual selection
3. Update enterprise onboarding
4. Test all paths

### Phase 3: Frontend Updates
1. Update Admin portal
2. Update Enterprise wallet
3. Update Consumer wallet
4. Add tenant context displays

### Phase 4: Testing & Validation
1. Run all test scenarios
2. Verify data isolation
3. Check performance
4. Security audit

---

## 9. ROLLBACK PLAN

If issues occur:
1. Remove trigger `check_tenant_user_validity`
2. Restore original views
3. Re-add organization users to tenant_users (if needed)
4. Revert middleware changes
5. Restore original routes

---

## 10. SUCCESS METRICS

- [ ] Zero organization users in tenant_users table
- [ ] All individual consumers have tenant relationship
- [ ] All organizations have tenant_id
- [ ] Tenant isolation working correctly
- [ ] Registration flows handle both paths
- [ ] Admin can view correct hierarchy
- [ ] No performance degradation
- [ ] All tests passing

---

## NOTES

1. **Critical**: Never add organization users to tenant_users table
2. **Small Businesses**: Treated same as enterprises (org-based)
3. **Tenant Types**: Determine features and limits
4. **Migration**: Already created, needs to be refined and run
5. **Middleware**: Created, needs integration into routes
6. **Frontend**: Needs significant updates for proper context

---

## Current Status

✅ **Completed**:
- Database migration script
- Tenant middleware
- Organization route updates (partial)
- Admin new organization page

⏳ **In Progress**:
- User registration flows
- Frontend context management

❌ **Not Started**:
- Tenant management UI
- Consumer wallet account type selection
- Enterprise wallet tenant context
- Testing scenarios

---

## Next Immediate Steps

1. Fix and run the database migration
2. Integrate middleware into all routes
3. Update consumer wallet registration UI
4. Create tenant management page in admin
5. Test with sample data