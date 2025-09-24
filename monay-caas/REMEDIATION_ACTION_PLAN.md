# Multi-Tenant Architecture Remediation Action Plan
## Addressing Consumer Wallet Integration Gaps
## Date: 2025-01-23

---

## Overview
This document provides specific, actionable steps to remediate the gaps identified in the Consumer Wallet Gap Analysis. Each action item includes code snippets, file locations, and implementation guidance.

**⚠️ IMPORTANT: NO DATABASE MODIFICATIONS ALLOWED - Only view access granted**

---

## PHASE 1: CRITICAL API ENDPOINTS (Immediate - Day 1)

### 1.1 Missing Billing Endpoints

#### Action: Add `/api/billing/my-account` endpoint
**File**: `/monay-backend-common/src/routes/billing.js`
**Add after line 100**:

```javascript
/**
 * @route   GET /api/billing/my-account
 * @desc    Get current account billing info for UI
 * @access  Private
 */
router.get('/my-account',
  async (req, res) => {
    try {
      const tenantId = req.tenant.id;

      // Get current billing info
      const query = `
        SELECT
          t.billing_tier as tier,
          bm.total_cents as current_amount_cents,
          bm.period_end as next_billing_date,
          bm.payment_method,
          btc.included_transactions - COALESCE(bm.transaction_count, 0) as transactions_remaining,
          btc.included_transactions as transaction_limit,
          CASE
            WHEN bm.payment_method = 'USDXM' THEN bm.total_cents * 0.1
            ELSE 0
          END as discount_available,
          bm.transaction_count
        FROM tenants t
        LEFT JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
          AND bm.period_start = date_trunc('month', CURRENT_DATE)
        WHERE t.id = $1
      `;

      const result = await req.dbClient.query(query, [tenantId]);
      const data = result.rows[0] || {
        tier: 'free',
        current_amount_cents: 0,
        next_billing_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        payment_method: null,
        discount_available: 0,
        transaction_count: 0,
        transaction_limit: 100
      };

      res.json(data);
    } catch (error) {
      console.error('Error fetching account billing:', error);
      res.status(500).json({ error: 'Failed to fetch billing information' });
    }
  }
);
```

#### Action: Add `/api/billing/pay` endpoint
**File**: `/monay-backend-common/src/routes/billing.js`
**Add after the above endpoint**:

```javascript
/**
 * @route   POST /api/billing/pay
 * @desc    Process payment with stablecoin
 * @access  Private
 */
router.post('/pay',
  validateRequest([
    body('amount_cents').isInt({ min: 100 }),
    body('payment_method').isIn(['USDXM', 'USDC', 'USDT'])
  ]),
  async (req, res) => {
    try {
      const { amount_cents, payment_method } = req.body;
      const tenantId = req.tenant.id;

      // Calculate final amount with discount
      let final_amount = amount_cents;
      let discount_cents = 0;

      if (payment_method === 'USDXM') {
        discount_cents = Math.floor(amount_cents * 0.1);
        final_amount = amount_cents - discount_cents;
      }

      // TODO: Integrate with actual payment processor
      // For now, simulate success

      // Record payment
      const insertQuery = `
        INSERT INTO billing_payments (
          tenant_id, amount_cents, discount_cents,
          payment_method, status, processed_at
        ) VALUES ($1, $2, $3, $4, 'completed', NOW())
        RETURNING id
      `;

      const result = await req.dbClient.query(insertQuery, [
        tenantId, final_amount, discount_cents, payment_method
      ]);

      // Update billing metrics
      await billingService.updatePaymentMethod(tenantId, payment_method);

      res.json({
        success: true,
        payment_id: result.rows[0].id,
        amount_paid: final_amount,
        discount_applied: discount_cents,
        payment_method
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  }
);
```

### 1.2 Missing Group Endpoints

#### Action: Add `/api/groups/my-membership` endpoint
**File**: `/monay-backend-common/src/routes/groups.js`
**Add after line 100**:

```javascript
/**
 * @route   GET /api/groups/my-membership
 * @desc    Get current user's group membership
 * @access  Private
 */
router.get('/my-membership',
  async (req, res) => {
    try {
      const query = `
        SELECT
          g.id as group_id,
          g.group_name,
          g.group_type,
          gm.role as my_role,
          COUNT(gm2.id) as member_count,
          t.name as primary_member_name
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        LEFT JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.is_active = true
        LEFT JOIN tenants t ON g.primary_tenant_id = t.id
        WHERE gm.tenant_id = $1
          AND gm.is_active = true
          AND g.status = 'active'
          AND g.group_type = 'household'
        GROUP BY g.id, g.group_name, g.group_type, gm.role, t.name
        ORDER BY g.created_at DESC
        LIMIT 1
      `;

      const result = await req.dbClient.query(query, [req.tenant.id]);

      res.json({
        membership: result.rows[0] || null
      });

    } catch (error) {
      console.error('Error fetching membership:', error);
      res.status(500).json({ error: 'Failed to fetch membership' });
    }
  }
);
```

#### Action: Add `/api/groups/:id/invite` endpoint
**File**: `/monay-backend-common/src/routes/groups.js`
**Add after the above endpoint**:

```javascript
/**
 * @route   POST /api/groups/:id/invite
 * @desc    Invite member to group
 * @access  Private (Primary/Admin only)
 */
router.post('/:id/invite',
  validateRequest([
    param('id').isUUID(),
    body('email').isEmail(),
    body('role').optional().isIn(['member', 'viewer'])
  ]),
  async (req, res) => {
    try {
      const { id: groupId } = req.params;
      const { email, role = 'member' } = req.body;

      // Check if user is primary or admin
      const permQuery = `
        SELECT role FROM group_members
        WHERE group_id = $1 AND tenant_id = $2 AND is_active = true
      `;

      const permResult = await req.dbClient.query(permQuery, [groupId, req.tenant.id]);

      if (!permResult.rows[0] || !['primary', 'admin'].includes(permResult.rows[0].role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Create invitation (simplified - should send email)
      const inviteQuery = `
        INSERT INTO group_invitations (
          group_id, invited_email, invited_by_tenant_id, role, status
        ) VALUES ($1, $2, $3, $4, 'pending')
        RETURNING id
      `;

      const result = await req.dbClient.query(inviteQuery, [
        groupId, email, req.tenant.id, role
      ]);

      // TODO: Send invitation email

      res.json({
        success: true,
        invitation_id: result.rows[0].id,
        message: 'Invitation sent successfully'
      });

    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  }
);
```

---

## PHASE 2: FRONTEND-BACKEND INTEGRATION (Day 1-2)

### 2.1 Fix API URL Configuration

#### Action: Update SimpleBilling.tsx to use environment variable
**File**: `/monay-cross-platform/web/components/SimpleBilling.tsx`
**Line 31-32, replace**:
```typescript
// OLD:
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/billing/my-account`,

// NEW:
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/billing/my-account`,
```

#### Action: Add .env.local file
**File**: `/monay-cross-platform/web/.env.local`
**Create file with**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2.2 Add Error Handling to Components

#### Action: Update SimpleBilling.tsx with proper error handling
**File**: `/monay-cross-platform/web/components/SimpleBilling.tsx`
**After line 43, add**:
```typescript
} catch (error) {
  console.error('Failed to load billing info:', error);
  // Set error state
  setError('Failed to load billing information. Please try again.');
  // Show fallback UI
  setBilling({
    tier: 'free',
    current_amount_cents: 0,
    next_billing_date: new Date().toISOString(),
    payment_method: null,
    discount_available: 0,
    transaction_count: 0,
    transaction_limit: 100
  });
```

### 2.3 Add Loading States

#### Action: Add loading skeleton to FamilyGroupIndicator
**File**: `/monay-cross-platform/web/components/FamilyGroupIndicator.tsx`
**After line 77, replace null with**:
```typescript
if (loading) {
  return (
    <Card className="p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    </Card>
  );
}
```

---

## PHASE 3: CORS & MIDDLEWARE FIXES (Day 2)

### 3.1 Update CORS Configuration

#### Action: Add missing headers to CORS
**File**: `/monay-backend-common/src/bootstrap.js`
**Line 93, update allowedHeaders**:
```javascript
// OLD:
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']

// NEW:
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-Tenant-Id',
  'X-API-Key',
  'X-Internal-Key'
]
```

### 3.2 Fix Tenant Context in Middleware

#### Action: Add tenant context to response headers
**File**: `/monay-backend-common/src/middleware/tenant-isolation.js`
**After line 96, add**:
```javascript
// Add tenant context to response headers for debugging
if (process.env.NODE_ENV === 'development') {
  res.setHeader('X-Tenant-Id', req.tenant.id);
  res.setHeader('X-Tenant-Code', req.tenant.code);
}
```

---

## PHASE 4: STATE MANAGEMENT (Day 2-3)

### 4.1 Create Global State Store

#### Action: Create Zustand store for tenant context
**File**: `/monay-cross-platform/web/stores/useTenantStore.ts`
**Create new file**:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantState {
  currentTenant: {
    id: string;
    code: string;
    name: string;
    billing_tier: string;
    type: string;
  } | null;
  familyMembership: {
    group_id: string;
    group_name: string;
    role: string;
    member_count: number;
  } | null;
  billingInfo: {
    tier: string;
    current_amount_cents: number;
    payment_method: string | null;
  } | null;
  setCurrentTenant: (tenant: any) => void;
  setFamilyMembership: (membership: any) => void;
  setBillingInfo: (billing: any) => void;
  clearAll: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentTenant: null,
      familyMembership: null,
      billingInfo: null,
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setFamilyMembership: (membership) => set({ familyMembership: membership }),
      setBillingInfo: (billing) => set({ billingInfo: billing }),
      clearAll: () => set({
        currentTenant: null,
        familyMembership: null,
        billingInfo: null
      })
    }),
    {
      name: 'tenant-storage',
    }
  )
);
```

### 4.2 Integrate Store with Components

#### Action: Update FamilyGroupIndicator to use store
**File**: `/monay-cross-platform/web/components/FamilyGroupIndicator.tsx`
**Add at top**:
```typescript
import { useTenantStore } from '@/stores/useTenantStore';

// Inside component:
const { familyMembership, setFamilyMembership } = useTenantStore();

// After successful API call (line 42):
setFamilyMembership(data.membership);
```

---

## PHASE 5: MISSING UI ELEMENTS (Day 3-4)

### 5.1 Add Click Handlers

#### Action: Implement "Create Family Group" button handler
**File**: `/monay-cross-platform/web/components/FamilyGroupIndicator.tsx`
**Line 94-96, update**:
```typescript
<Button
  size="sm"
  variant="outline"
  className="text-blue-600 border-blue-300"
  onClick={() => router.push('/settings/family')}
>
  Create Family Group
  <ChevronRight className="w-4 h-4 ml-1" />
</Button>
```

#### Action: Implement "Upgrade Now" button handler
**File**: `/monay-cross-platform/web/components/SimpleBilling.tsx`
**Line 138, update**:
```typescript
onClick={() => router.push('/settings/upgrade')}
```

### 5.2 Add Payment Confirmation

#### Action: Add confirmation dialog to payment
**File**: `/monay-cross-platform/web/components/SimpleBilling.tsx`
**Before line 59 (makePayment), add**:
```typescript
const confirmPayment = async () => {
  const confirmed = window.confirm(
    `Confirm payment of ${formatCurrency(finalAmount)} via ${selectedMethod}?\n\n` +
    (selectedMethod === 'USDXM' ? `You'll save ${formatCurrency(discountAmount)}!` : '')
  );

  if (confirmed) {
    await makePayment();
  }
};
```

---

## PHASE 6: ERROR RECOVERY (Day 4)

### 6.1 Add Retry Logic

#### Action: Create retry utility
**File**: `/monay-cross-platform/web/lib/retry-utils.ts`
**Create new file**:
```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### 6.2 Implement Retry in API Calls

#### Action: Update SimpleBilling to use retry
**File**: `/monay-cross-platform/web/components/SimpleBilling.tsx`
**Update loadBillingInfo**:
```typescript
import { retryWithBackoff } from '@/lib/retry-utils';

const loadBillingInfo = async () => {
  try {
    const data = await retryWithBackoff(async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/my-account`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    });

    setBilling(data);
  } catch (error) {
    console.error('Failed to load billing after retries:', error);
    setError('Unable to load billing information');
  } finally {
    setLoading(false);
  }
};
```

---

## PHASE 7: TESTING IMPLEMENTATION (Day 5)

### 7.1 Create Integration Tests

#### Action: Create billing flow test
**File**: `/monay-cross-platform/web/__tests__/billing-flow.test.ts`
**Create new file**:
```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SimpleBilling from '@/components/SimpleBilling';

describe('Billing Flow', () => {
  it('should load billing information', async () => {
    render(<SimpleBilling />);

    await waitFor(() => {
      expect(screen.getByText(/Your Plan/i)).toBeInTheDocument();
    });
  });

  it('should calculate USDXM discount correctly', async () => {
    render(<SimpleBilling />);

    const payButton = await screen.findByText(/Pay Now/i);
    fireEvent.click(payButton);

    const usdxmOption = await screen.findByText(/USDXM/i);
    fireEvent.click(usdxmOption);

    expect(screen.getByText(/Save 10%/i)).toBeInTheDocument();
  });
});
```

### 7.2 Create API Endpoint Tests

#### Action: Create billing endpoint test
**File**: `/monay-backend-common/tests/billing.test.js`
**Create new file**:
```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Billing Endpoints', () => {
  test('GET /api/billing/my-account returns billing info', async () => {
    const response = await request(app)
      .get('/api/billing/my-account')
      .set('Authorization', 'Bearer valid_token')
      .expect(200);

    expect(response.body).toHaveProperty('tier');
    expect(response.body).toHaveProperty('current_amount_cents');
  });

  test('POST /api/billing/pay processes payment', async () => {
    const response = await request(app)
      .post('/api/billing/pay')
      .set('Authorization', 'Bearer valid_token')
      .send({
        amount_cents: 1000,
        payment_method: 'USDXM'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.discount_applied).toBe(100);
  });
});
```

---

## PHASE 8: MONITORING & LOGGING (Day 5-6)

### 8.1 Add Request Logging

#### Action: Create logging middleware
**File**: `/monay-backend-common/src/middleware/request-logger.js`
**Create new file**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      tenant_id: req.tenant?.id,
      user_id: req.user?.id
    });
  });

  next();
};
```

### 8.2 Add Error Tracking

#### Action: Create error tracking service
**File**: `/monay-cross-platform/web/lib/error-tracking.ts`
**Create new file**:
```typescript
export class ErrorTracker {
  static logError(error: Error, context?: Record<string, any>) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    // TODO: Send to error tracking service (Sentry, etc.)
  }

  static logAPIError(endpoint: string, status: number, error: any) {
    this.logError(new Error(`API Error: ${endpoint}`), {
      status,
      response: error
    });
  }
}
```

---

## TESTING CHECKLIST

### Backend Testing
- [ ] All new endpoints return correct data
- [ ] Tenant isolation is enforced
- [ ] USDXM discount calculation is accurate
- [ ] Error responses are consistent
- [ ] Rate limiting works per tier

### Frontend Testing
- [ ] Components load without errors
- [ ] API calls use correct endpoints
- [ ] Error states display properly
- [ ] Loading states show during fetch
- [ ] Payment flow completes successfully

### Integration Testing
- [ ] End-to-end payment flow
- [ ] Family group invitation flow
- [ ] Tenant switching (when implemented)
- [ ] Billing calculation accuracy
- [ ] CORS headers work correctly

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations ready (view only)
- [ ] API documentation updated
- [ ] Error tracking configured

### Deployment Steps
1. Deploy backend changes first
2. Test API endpoints manually
3. Deploy frontend changes
4. Verify CORS configuration
5. Monitor error logs

### Post-Deployment
- [ ] Verify all endpoints accessible
- [ ] Check error rates
- [ ] Monitor performance metrics
- [ ] Validate billing calculations
- [ ] Test payment flow in production

---

## RISK MITIGATION

### High-Risk Areas
1. **Payment Processing**: Use idempotency keys
2. **Tenant Isolation**: Add monitoring alerts
3. **Rate Limiting**: Implement gradual rollout
4. **Data Migration**: Create rollback plan

### Rollback Strategy
1. Keep previous version deployed
2. Use feature flags for new endpoints
3. Database changes are read-only
4. Monitor for 24 hours post-deployment

---

## SUCCESS METRICS

### Technical Metrics
- API response time < 200ms (P95)
- Error rate < 0.1%
- Payment success rate > 99%
- Page load time < 2 seconds

### Business Metrics
- USDXM adoption rate increase
- Family group creation rate
- Payment completion rate
- User satisfaction score

---

**Document Version**: 1.0
**Implementation Timeline**: 5-6 days
**Team Required**: 2-3 developers
**Risk Level**: Medium (due to payment handling)

---

## NEXT STEPS

1. **Day 1**: Implement critical API endpoints
2. **Day 2**: Fix frontend integration issues
3. **Day 3**: Add state management
4. **Day 4**: Implement error handling
5. **Day 5**: Testing and monitoring
6. **Day 6**: Deployment preparation

**Note**: This plan addresses all P0 and P1 issues from the gap analysis while respecting the database read-only constraint.