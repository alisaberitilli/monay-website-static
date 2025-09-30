# Middleware Import Mapping - Broken to Fixed

## 🚨 CRITICAL IMPORT FIXES NEEDED

This document maps all 53 broken middleware imports to their correct new paths after the directory migration from `middleware/` and `middlewares/` to `middleware-core/` and `middleware-app/`.

## 📋 MAPPING RULES

**Rule 1:** `../middlewares/` (plural, old) → `../middleware-app/` (business logic)
**Rule 2:** `../middleware/` (singular, old) → `../middleware-core/` (system critical)

## 🔥 HIGH-PRIORITY FIXES (Financial/Security Routes)

### tenants.js (3 broken imports) - CAUSING CURRENT 500 ERRORS
```javascript
// ❌ BROKEN
import authenticate from '../middlewares/tenant-user-auth.js';
import tenantIsolation from '../middlewares/tenant-middleware.js';
import { validateRequest } from '../middlewares/validate-middleware.js';

// ✅ FIXED
import authenticate from '../middleware-app/tenant-user-auth.js';
import tenantIsolation from '../middleware-app/tenant-middleware.js';
import { validateRequest } from '../middleware-app/validate-middleware.js';
```

### withdrawals.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### card-payments.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### enterprise-rbac.js (3 broken imports)
```javascript
// ❌ BROKEN
// import { authorize } from '../middleware/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware/audit.js';  // TODO: Add audit logging

// ✅ FIXED
// import { authorize } from '../middleware-core/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware-core/audit.js';  // TODO: Add audit logging
```

### wallet-balance.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### p2p-transfer.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### p2p-transfers.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### payment-request.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### organizations.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### organization-invites.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### industry-verticals.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

## 📋 MEDIUM-PRIORITY FIXES (Utility Routes)

### subscriptions.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### virtual-cards.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### bill-pay.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### bank-accounts.js (3 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';
import { asyncHandler } from '../middlewares/error-handler.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
```

### data-exports.js (3 broken imports)
```javascript
// ❌ BROKEN
// import { authorize } from '../middleware/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware/audit.js';  // TODO: Add audit logging
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
// import { authorize } from '../middleware-core/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware-core/audit.js';  // TODO: Add audit logging
import { authenticateToken } from '../middleware-app/auth.js';
```

### webhooks.js (2 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
```

### notifications.js (2 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
```

### government-services.js (2 broken imports)
```javascript
// ❌ BROKEN
import authenticate from '../middlewares/auth-middleware.js';
import { validateRequest } from '../middlewares/validation.js';

// ✅ FIXED
import authenticate from '../middleware-app/auth-middleware.js';
import { validateRequest } from '../middleware-app/validation.js';
```

### governmentBenefits.js (2 broken imports)
```javascript
// ❌ BROKEN
import authenticate from '../middlewares/auth-middleware.js';
import { validateRequest } from '../middlewares/validation.js';

// ✅ FIXED
import authenticate from '../middleware-app/auth-middleware.js';
import { validateRequest } from '../middleware-app/validation.js';
```

### benefitPortal.js (2 broken imports)
```javascript
// ❌ BROKEN
import authenticate from '../middlewares/auth-middleware.js';
import { validateRequest } from '../middlewares/validation.js';

// ✅ FIXED
import authenticate from '../middleware-app/auth-middleware.js';
import { validateRequest } from '../middleware-app/validation.js';
```

### analytics.js (2 broken imports)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';
import { validate } from '../middlewares/request-validator.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
```

## 🔧 SINGLE IMPORT FIXES

### super-admin-routes.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### rewards.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### oneqa.js (1 broken import)
```javascript
// ❌ BROKEN
import middlewares from '../middlewares/index.js';

// ✅ FIXED
import middlewares from '../middleware-app/index.js';
```

### investments.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### consumer.js (1 broken import)
```javascript
// ❌ BROKEN
import { authenticateToken } from '../middlewares/auth.js';

// ✅ FIXED
import { authenticateToken } from '../middleware-app/auth.js';
```

### groups.js (1 broken import)
```javascript
// ❌ BROKEN
// import { validateRequest } from '../middleware/validation';

// ✅ FIXED
// import { validateRequest } from '../middleware-core/validation.js';
```

## 📊 SUMMARY

**Total Fixes Needed:** 53 broken imports across 28 files

**Priority Order:**
1. **IMMEDIATE:** `tenants.js` (causing current 500 errors)
2. **HIGH:** Financial/payment routes (withdrawals, card-payments, p2p-transfer, etc.)
3. **MEDIUM:** Utility routes (subscriptions, notifications, webhooks, etc.)
4. **LOW:** Single import fixes

**Validation Required:**
- Verify each file exists at the new path
- Confirm middleware exports match expected functions
- Test each route after fixing imports
- Ensure no functional changes to middleware behavior

**Safety Protocol:**
- Fix one file at a time
- Test immediately after each fix
- Never batch-fix financial routes
- Maintain audit trail for compliance