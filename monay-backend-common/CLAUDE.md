# Monay Backend Common - Development Guidelines

## 🧬 PROJECT DNA - GRADUAL IMPROVEMENT PRINCIPLES

### 🛡️ MIDDLEWARE ARCHITECTURE MIGRATION STRATEGY
**Established: September 29, 2025**

**CRITICAL**: We have identified dual middleware directories that require careful, gradual consolidation to prevent financial system disruption.

#### **🎉 DIRECTORY RENAMING COMPLETED - SEPTEMBER 29, 2025 🎉**
**CONFUSION ELIMINATED!** Directories have been renamed for crystal clear purpose:
- **`src/middleware-core/`** (4 files) - System-critical, security-sensitive implementations
- **`src/middleware-app/`** (27 files) - Application business logic and features

#### **⚠️ FINANCIAL SYSTEM SAFETY RULES ⚠️**

**NEVER BATCH-MIGRATE THESE CRITICAL CATEGORIES:**
1. **Authentication** (`auth.js`, `platform-admin-auth.js`, `tenant-user-auth.js`)
2. **Payment Processing** (`billing.js`, `card-payments.js`, `withdrawals.js`)
3. **Tenant Isolation** (`tenant-middleware.js`, `tenant-isolation.js`)
4. **Audit/Compliance** (`audit.js`, `auditLogs.js`)
5. **Security Boundaries** (anything handling user permissions)

**MIGRATION IS ONLY ALLOWED WHEN:**
- ✅ A route file requires major feature updates anyway
- ✅ You find broken imports that prevent compilation
- ✅ The route is non-financial (media, CMS, static content)
- ✅ You have comprehensive test coverage for the specific route

#### **📋 DEVELOPMENT WORKFLOW - MIDDLEWARE DECISION TREE**

**When working on ANY route file:**

1. **Check Current Imports**
   ```bash
   # See what middleware directory is being used
   grep -n "import.*middleware" src/routes/your-file.js
   ```

2. **Apply Decision Logic**:
   - **If all imports are from `middlewares/`** → ✅ Continue development
   - **If imports are mixed** → ⚠️ Fix broken imports only, don't migrate working ones
   - **If route is financial/security** → 🚨 DO NOT MIGRATE unless absolutely necessary
   - **If route is utility/media** → ✅ Can migrate to `middlewares/` if desired

3. **For NEW route files**:
   ```javascript
   // ✅ ALWAYS use middleware-app/ for new development
   import { authenticateToken } from '../middleware-app/tenant-user-auth.js';
   import { validateRequest } from '../middleware-app/validate-middleware.js';

   // ✅ Use middleware-core/ for system-level functions
   import { auditAction } from '../middleware-core/audit.js';
   ```

4. **For EXISTING route files**:
   ```javascript
   // ❌ BROKEN - Must fix (old paths don't exist)
   import { validateRequest } from '../middleware/validation'; // File doesn't exist
   import { validateRequest } from '../middlewares/validate.js'; // Path changed

   // ✅ WORKING - New clear paths
   import { auditAction } from '../middleware-core/audit.js';
   import { validateRequest } from '../middleware-app/validate-middleware.js';
   ```

#### **🔧 IMMEDIATE FIXES PROTOCOL**

**When you encounter broken imports:**

1. **Identify the correct working equivalent**:
   ```bash
   # Find the real file
   find src -name "*validation*" -o -name "*validate*"
   ```

2. **Update ONLY the broken import**:
   ```javascript
   // Before (broken)
   import { validateRequest } from '../middleware/validation';

   // After (fixed)
   import { validateRequest } from '../middlewares/validate-middleware.js';
   ```

3. **Test the single route thoroughly**
4. **Document the change in git commit**

#### **📊 TRACKING PROGRESS**

**Current Status (Updated when changes are made):**
- Legacy imports fixed: 0/18
- Financial routes migrated: 0/15 (⚠️ DISCOURAGED)
- Utility routes migrated: 0/25 (✅ SAFE TO MIGRATE)
- Broken imports fixed: 0/7 (🔥 URGENT)

**Progress Tracking Commands:**
```bash
# Count legacy imports still in use
grep -r "from '../middleware/" src/routes/ | wc -l

# Find broken imports
grep -r "from '../middleware/validation'" src/routes/
grep -r "from '../middleware/validateRequest'" src/routes/

# List financial routes (handle with extreme care)
grep -l "billing\|payment\|card\|bank\|withdraw\|transfer\|auth\|tenant\|audit" src/routes/*.js
```

#### **🎯 LONG-TERM VISION (3-6 Months)**

**Goal**: Gradually standardize on `middlewares/` while preserving system stability

**Success Metrics**:
- Zero broken imports
- All new development uses `middlewares/`
- Legacy `middleware/` directory remains for critical working routes
- No production incidents related to middleware changes

**Documentation Updates Required After Each Migration:**
1. Update progress counters above
2. Note which route was migrated and why
3. Record any issues encountered
4. Update team knowledge base

#### **🚨 EMERGENCY ROLLBACK PROTOCOL**

If ANY middleware change causes issues:

1. **Immediate Revert**:
   ```bash
   git revert HEAD  # Or specific commit
   ```

2. **Root Cause Analysis**:
   - Which route was affected?
   - What import was changed?
   - Did we violate the financial/security rule?

3. **Update Documentation**:
   - Mark the route as "DO NOT MIGRATE"
   - Add specific notes about why it failed

#### **✅ SAFE MIGRATION EXAMPLES**

**Low-Risk Routes (OK to migrate when needed):**
- `media.js`, `cms.js`, `contact.js`, `notification.js`
- Routes that don't handle money, auth, or tenant data

**High-Risk Routes (AVOID migrating):**
- `billing.js`, `payments.js`, `auth.js`, `tenants.js`
- Anything in audit, compliance, or security domains

---

## 🔐 AUTHENTICATION ARCHITECTURE

### **Dual Authentication System (Working - Don't Touch)**

**Platform Admin Auth** (`middlewares/platform-admin-auth.js`):
- Cross-tenant administrative operations
- Compliance and audit access
- System-wide management functions

**Tenant User Auth** (`middlewares/tenant-user-auth.js`):
- Tenant-isolated business operations
- Customer-facing functionality
- Multi-tenant SaaS features

**NEVER** change which auth system a route uses without deep architectural review.

---

## 📝 COMMIT MESSAGE STANDARDS

**For middleware-related changes:**
```
fix: resolve broken import in billing.js middleware

- Updated ../middleware/validation to ../middlewares/validate-middleware.js
- Verified billing calculations still work correctly
- No functional changes to route behavior
- Part of gradual middleware consolidation strategy

FINANCIAL_SYSTEM_SAFE: ✅
TESTED: ✅
MIGRATION_TYPE: broken_import_fix
```

---

This document is LIVING DOCUMENTATION - update it every time you work with middleware to build institutional knowledge and prevent future confusion.