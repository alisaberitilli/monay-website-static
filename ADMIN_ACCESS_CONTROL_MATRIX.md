# Admin Access Control Matrix
**Created:** January 2025
**Status:** AUTHORITATIVE - This defines how admin access works across all Monay portals

## 🎯 Three Admin Portal Types

### 1. **Monay-Admin (Port 3002)** - PLATFORM SUPER ADMIN
**Purpose:** Platform-wide management and oversight

**User Properties:**
- `role`: `platform_admin` OR `super_admin` OR `admin`
- `userType`: `admin`
- `isAdmin`: `true`
- `tenant_id`: NULL or system tenant (cross-tenant access)

**Access Scope:** EVERYTHING
- ✅ All tenants (cross-tenant)
- ✅ All organizations (cross-organization)
- ✅ All users (platform-wide)
- ✅ Platform treasury and revenue
- ✅ Circle/Tempo global metrics
- ✅ Compliance and KYC queue
- ✅ System settings and configuration

**API Endpoints:**
- `/api/super-admin/*` - All super admin endpoints
- `/api/admin/*` - All admin endpoints
- `/api/roles/*` - Role management
- Any endpoint with `resourceAccessMiddleware(['admin', 'subadmin'])`

---

### 2. **Monay-CaaS Enterprise Wallet (Port 3007)** - ENTERPRISE ADMIN
**Purpose:** Tenant-specific enterprise management

**User Properties:**
- `role`: `enterprise_admin` OR `tenant_admin`
- `userType`: `enterprise` OR `admin` (for enterprise context)
- `isAdmin`: `false` (not platform admin)
- `tenant_id`: REQUIRED (specific tenant)
- `organization_id`: REQUIRED

**Access Scope:** TENANT-ISOLATED
- ✅ Own tenant ONLY
- ✅ Own organization ONLY
- ✅ Users in their organization
- ✅ Their organization's treasury/wallets
- ✅ Their organization's tokens (CaaS)
- ✅ Their organization's invoices
- ❌ NO access to other tenants
- ❌ NO access to platform-wide data
- ❌ NO access to Circle/Tempo global metrics

**API Endpoints:**
- `/api/enterprise-treasury/*` - Tenant-filtered
- `/api/invoice-wallets/*` - Tenant-filtered
- `/api/organizations/:orgId/*` - Own org only
- `/api/tenants/:tenantId/*` - Own tenant only

---

### 3. **Monay-Cross-Platform Consumer Wallet (Port 3003)** - CONSUMER ADMIN
**Purpose:** Consumer-facing operations (business or individual)

#### 3a. Business Consumer Admin
**User Properties:**
- `role`: `consumer_admin` OR `tenant_admin`
- `userType`: `consumer` OR `business_consumer`
- `isAdmin`: `false`
- `tenant_id`: REQUIRED
- `organization_id`: REQUIRED (for business)

**Access Scope:** TENANT-ISOLATED (Business Context)
- ✅ Own tenant ONLY
- ✅ Own organization ONLY (if business)
- ✅ Users in their organization
- ✅ Their organization's wallets
- ✅ Their organization's groups
- ❌ NO access to other tenants
- ❌ NO platform-wide access

#### 3b. Individual Consumer
**User Properties:**
- `role`: `verified_consumer` OR `premium_consumer` OR `basic_consumer`
- `userType`: `consumer`
- `isAdmin`: `false`
- `tenant_id`: REQUIRED
- `organization_id`: NULL

**Access Scope:** PERSONAL DATA ONLY
- ✅ Own tenant ONLY
- ✅ Own wallet and transactions
- ✅ Own groups (family/secondary users)
- ❌ NO organization access
- ❌ NO other users' data

**API Endpoints:**
- `/api/consumer/*` - Consumer-specific
- `/api/wallet/*` - Personal wallet
- `/api/accounts/*` - Primary/secondary accounts
- `/api/groups/*` - Personal groups

---

## 🔑 Access Control Middleware Matrix

### Current Middleware Functions

1. **`requireSuperAdmin`** (in super-admin.js)
   ```javascript
   // SHOULD CHECK: role === 'super_admin' OR 'admin' OR 'platform_admin'
   // CURRENT ISSUE: May not recognize 'platform_admin' correctly
   ```

2. **`resourceAccessMiddleware(['admin', 'subadmin'])`**
   ```javascript
   // CHECKS: userType in ['admin', 'subadmin']
   // CURRENT ISSUE: Checking userType instead of role
   ```

3. **`authenticate/authMiddleware`**
   ```javascript
   // Sets req.user from JWT token
   // CURRENT ISSUE: May not set all required fields correctly
   ```

---

## 🛠️ Required Fixes

### Fix 1: Update `requireSuperAdmin` in super-admin.js
**Location:** `/monay-backend-common/src/routes/super-admin.js:68-84`

**Current:**
```javascript
if (!user || (user.role !== 'super_admin' && user.role !== 'admin' && user.role !== 'platform_admin'))
```

**Issue:** Works correctly, but may have JWT token issues

**Fix:** Ensure JWT token contains correct role

---

### Fix 2: Update `resourceAccessMiddleware`
**Location:** `/monay-backend-common/src/middleware-app/resource-access-middleware.js`

**Current:** Checks `userType`
```javascript
if (~userTypeArr.indexOf(user.userType))
```

**Issue:**
- Platform admins have `userType: 'admin'` but routes check for role-based access
- Mixing userType and role concepts

**Fix:** Create role-aware middleware or update to check both

---

### Fix 3: Update auth-middleware.js JWT token creation
**Location:** `/monay-backend-common/src/middleware-app/auth-middleware.js:89-105`

**Current:** Sets multiple fields
```javascript
req.user = {
  ...decoded,
  id: user.id,
  email: user.email,
  isAdmin: isAdmin,
  userType: isAdmin ? 'admin' : (decoded.userType || user.userType || 'user'),
  ...
}
```

**Issue:** `userType` logic may override role-based access

**Fix:** Preserve both role AND userType correctly

---

## ✅ Recommended Solution

### Solution 1: Enhanced requireSuperAdmin middleware
```javascript
const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // Check for platform admin roles
    const isPlatformAdmin = user && (
      user.role === 'super_admin' ||
      user.role === 'platform_admin' ||
      user.role === 'admin' ||
      user.userType === 'admin'  // Backward compatibility
    );

    if (!isPlatformAdmin) {
      console.log('Access denied - User:', user?.email, 'Role:', user?.role, 'UserType:', user?.userType);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for super admin operations'
      });
    }

    next();
  } catch (error) {
    console.error('requireSuperAdmin error:', error);
    res.status(500).json({ success: false, message: 'Authorization error' });
  }
};
```

### Solution 2: Tenant-aware middleware for Enterprise/Consumer admins
```javascript
const requireTenantAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    // Check for tenant admin roles
    const isTenantAdmin = user && (
      user.role === 'enterprise_admin' ||
      user.role === 'tenant_admin' ||
      user.role === 'consumer_admin'
    );

    if (!isTenantAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Tenant admin access required'
      });
    }

    // Ensure tenant context exists
    if (!user.tenant_id && !req.tenantContext) {
      return res.status(403).json({
        success: false,
        message: 'Tenant context required'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authorization error' });
  }
};
```

---

## 🎯 Implementation Priority

1. **HIGH:** Fix requireSuperAdmin to properly recognize platform_admin
2. **HIGH:** Ensure JWT tokens contain correct role field
3. **MEDIUM:** Add tenant isolation checks for enterprise/consumer admins
4. **MEDIUM:** Update resourceAccessMiddleware to be role-aware
5. **LOW:** Document admin access patterns for future development

---

## 📊 Testing Checklist

### Platform Admin (Port 3002)
- [ ] Can access `/api/super-admin/platform/overview`
- [ ] Can access `/api/super-admin/treasury/transactions`
- [ ] Can access `/api/super-admin/treasury/wallets`
- [ ] Can access `/api/super-admin/treasury/revenue`
- [ ] Can access `/api/admin/user-profile/:userId` for ANY user
- [ ] Can access `/api/roles/:role/permissions`

### Enterprise Admin (Port 3007)
- [ ] Can access own organization's data
- [ ] CANNOT access other tenants' data
- [ ] CANNOT access platform-wide treasury
- [ ] Can access `/api/enterprise-treasury/*` for own tenant
- [ ] Can create/manage invoices for own organization

### Consumer Admin (Port 3003)
- [ ] Can access own wallet data
- [ ] Can access own groups
- [ ] CANNOT access other users' data
- [ ] CANNOT access platform admin endpoints
- [ ] Can manage secondary accounts

---

## 🔒 Security Notes

1. **Never bypass tenant isolation** for enterprise/consumer admins
2. **Always validate tenant_id** in requests for non-platform admins
3. **Log all admin actions** for audit purposes
4. **Platform admins** should be limited to Monay employees only
5. **Regular access audits** for compliance

---

**Last Updated:** January 2025
**Maintained By:** Engineering Team
**Review Frequency:** Quarterly or when adding new admin features
