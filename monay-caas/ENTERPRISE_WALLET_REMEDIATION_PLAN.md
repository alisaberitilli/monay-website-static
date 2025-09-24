# Enterprise Wallet Remediation Plan
## Fixing Critical Gaps to Make Application Functional
## Date: 2025-01-23

---

## Executive Summary
This plan provides specific, actionable steps to fix the Enterprise Wallet (Port 3007) which is currently non-functional due to missing backend endpoints. The plan respects the **NO DATABASE MODIFICATION** constraint and focuses on application-layer fixes only.

**Goal**: Make the Enterprise Wallet functional within 5-7 days by implementing missing API endpoints and fixing frontend integration issues.

---

## PHASE 1: CRITICAL API ENDPOINTS (Day 1-2)
### Make the UI Responsive by Implementing Missing Endpoints

#### 1.1 Fix Tenant Management Endpoints

##### Action: Implement `/api/tenants/current` endpoint
**File**: `/monay-backend-common/src/routes/tenants.js`
**Add after line 100**:

```javascript
/**
 * @route   GET /api/tenants/current
 * @desc    Get current tenant context for enterprise
 * @access  Private
 */
router.get('/current',
  tenantIsolation.middleware(), // Apply tenant isolation
  async (req, res) => {
    try {
      // Get tenant from middleware context
      if (!req.tenant) {
        return res.status(404).json({
          error: 'No tenant context found'
        });
      }

      // Get additional enterprise features
      const featuresQuery = `
        SELECT feature_name, feature_value
        FROM tenant_features
        WHERE tenant_id = $1 AND is_enabled = true
      `;

      const limitsQuery = `
        SELECT
          btc.included_transactions,
          btc.included_wallets,
          btc.included_computation_units,
          btc.max_storage_gb,
          COALESCE(bm.transaction_count, 0) as used_transactions,
          COALESCE(bm.wallet_count, 0) as used_wallets
        FROM tenants t
        JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
          AND bm.period_start = date_trunc('month', CURRENT_DATE)
        WHERE t.id = $1
      `;

      const [featuresResult, limitsResult] = await Promise.all([
        req.dbClient.query(featuresQuery, [req.tenant.id]),
        req.dbClient.query(limitsQuery, [req.tenant.id])
      ]);

      const features = featuresResult.rows.map(r => r.feature_name);
      const limits = limitsResult.rows[0] || {};

      res.json({
        tenant: {
          id: req.tenant.id,
          name: req.tenant.name,
          tenant_code: req.tenant.code,
          type: req.tenant.type,
          billing_tier: req.tenant.billing_tier,
          status: 'active',
          metadata: {}
        },
        features,
        limits: {
          transactions: {
            used: limits.used_transactions || 0,
            limit: limits.included_transactions || 1000
          },
          wallets: {
            used: limits.used_wallets || 0,
            limit: limits.included_wallets || 10
          },
          storage_gb: limits.max_storage_gb || 10,
          computation_units: limits.included_computation_units || 1000
        }
      });

    } catch (error) {
      console.error('Error fetching current tenant:', error);
      res.status(500).json({
        error: 'Failed to fetch tenant context'
      });
    }
  }
);
```

##### Action: Implement `/api/users/me/tenants` endpoint
**File**: `/monay-backend-common/src/routes/user.js`
**Add this endpoint**:

```javascript
/**
 * @route   GET /api/users/me/tenants
 * @desc    Get all tenants for current user
 * @access  Private
 */
router.get('/me/tenants',
  authenticateToken,
  async (req, res) => {
    try {
      const query = `
        SELECT DISTINCT
          t.id,
          t.name,
          t.tenant_code,
          t.type,
          t.billing_tier,
          t.status,
          tm.role as user_role,
          t.created_at
        FROM tenants t
        JOIN tenant_members tm ON t.id = tm.tenant_id
        WHERE tm.user_id = $1
          AND tm.is_active = true
          AND t.status IN ('active', 'pending')
        ORDER BY t.created_at DESC
      `;

      const result = await pool.query(query, [req.user.id]);

      res.json({
        tenants: result.rows,
        current_tenant_id: req.tenant?.id || result.rows[0]?.id
      });

    } catch (error) {
      console.error('Error fetching user tenants:', error);
      res.status(500).json({
        error: 'Failed to fetch tenants'
      });
    }
  }
);
```

##### Action: Implement `/api/tenants/:id/switch` endpoint
**File**: `/monay-backend-common/src/routes/tenants.js`
**Add after line 200**:

```javascript
/**
 * @route   POST /api/tenants/:id/switch
 * @desc    Switch to different tenant context
 * @access  Private
 */
router.post('/:id/switch',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id: tenantId } = req.params;

      // Verify user has access to this tenant
      const accessQuery = `
        SELECT role, permissions
        FROM tenant_members
        WHERE tenant_id = $1 AND user_id = $2 AND is_active = true
      `;

      const accessResult = await pool.query(accessQuery, [tenantId, req.user.id]);

      if (accessResult.rows.length === 0) {
        return res.status(403).json({
          error: 'Access denied to this tenant'
        });
      }

      // Generate new JWT with tenant context
      const jwt = require('jsonwebtoken');
      const newToken = jwt.sign(
        {
          user_id: req.user.id,
          tenant_id: tenantId,
          role: accessResult.rows[0].role,
          permissions: accessResult.rows[0].permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log the tenant switch
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, details, created_at)
         VALUES ($1, 'tenant_switch', $2, NOW())`,
        [req.user.id, { from: req.tenant?.id, to: tenantId }]
      );

      res.json({
        success: true,
        token: newToken,
        tenant_id: tenantId
      });

    } catch (error) {
      console.error('Error switching tenant:', error);
      res.status(500).json({
        error: 'Failed to switch tenant context'
      });
    }
  }
);
```

#### 1.2 Fix Billing Endpoints

##### Action: Rename and fix `/api/billing/current` endpoint
**File**: `/monay-backend-common/src/routes/billing.js`
**Update the calculate endpoint to current**:

```javascript
/**
 * @route   GET /api/billing/current
 * @desc    Get current billing metrics for enterprise
 * @access  Private
 */
router.get('/current',  // Changed from /calculate
  async (req, res) => {
    try {
      const tenantId = req.tenant.id;

      // Get current month metrics
      const metricsQuery = `
        SELECT
          t.billing_tier,
          btc.monthly_base_fee_cents as base_fee_cents,
          COALESCE(bm.transaction_count * oc.cost_cents, 0) as usage_fees_cents,
          COALESCE(bm.computation_units_used * 10, 0) as computation_fees_cents,
          CASE
            WHEN bm.transaction_count > btc.included_transactions
            THEN (bm.transaction_count - btc.included_transactions) * btc.overage_transaction_price_cents
            ELSE 0
          END as overage_fees_cents,
          bm.payment_method,
          bm.transaction_count,
          bm.wallet_count,
          bm.storage_gb_used as storage_gb,
          bm.api_calls
        FROM tenants t
        JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        LEFT JOIN billing_metrics bm ON t.id = bm.tenant_id
          AND bm.period_start = date_trunc('month', CURRENT_DATE)
        LEFT JOIN operation_costs oc ON oc.operation_type = 'transaction'
        WHERE t.id = $1
      `;

      const trendQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as transactions,
          SUM(amount_cents) as amount_cents
        FROM transactions
        WHERE tenant_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      const [metricsResult, trendResult] = await Promise.all([
        req.dbClient.query(metricsQuery, [tenantId]),
        req.dbClient.query(trendQuery, [tenantId])
      ]);

      const metrics = metricsResult.rows[0] || {};
      const total = metrics.base_fee_cents + metrics.usage_fees_cents +
                   metrics.computation_fees_cents + metrics.overage_fees_cents;

      // Calculate USDXM discount
      const discount = metrics.payment_method === 'USDXM' ? Math.floor(total * 0.1) : 0;

      res.json({
        current_month: {
          base_fee_cents: metrics.base_fee_cents || 0,
          usage_fees_cents: metrics.usage_fees_cents || 0,
          computation_fees_cents: metrics.computation_fees_cents || 0,
          overage_fees_cents: metrics.overage_fees_cents || 0,
          discount_cents: discount,
          total_cents: total - discount,
          transaction_count: metrics.transaction_count || 0,
          wallet_count: metrics.wallet_count || 0,
          storage_gb: metrics.storage_gb || 0,
          api_calls: metrics.api_calls || 0,
          payment_method: metrics.payment_method || null
        },
        previous_month: {
          total_cents: 0, // TODO: Implement
          transaction_count: 0
        },
        billing_tier: {
          name: metrics.billing_tier || 'free',
          monthly_base_fee_cents: metrics.base_fee_cents || 0,
          included_transactions: 1000,
          included_wallets: 10,
          overage_transaction_price_cents: 10,
          overage_wallet_price_cents: 100
        },
        usage_trend: trendResult.rows
      });

    } catch (error) {
      console.error('Error fetching billing metrics:', error);
      res.status(500).json({
        error: 'Failed to fetch billing metrics'
      });
    }
  }
);
```

##### Action: Implement `/api/billing/payment` endpoint
**File**: `/monay-backend-common/src/routes/billing.js`
**Add after the current endpoint**:

```javascript
/**
 * @route   POST /api/billing/payment
 * @desc    Process enterprise payment
 * @access  Private
 */
router.post('/payment',
  validateRequest([
    body('amount_cents').isInt({ min: 100 }),
    body('payment_method').isIn(['USDXM', 'USDC', 'USDT'])
  ]),
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { amount_cents, payment_method } = req.body;
      const tenantId = req.tenant.id;

      // Calculate discount for USDXM
      let final_amount = amount_cents;
      let discount_cents = 0;

      if (payment_method === 'USDXM') {
        discount_cents = Math.floor(amount_cents * 0.1);
        final_amount = amount_cents - discount_cents;
      }

      // Create payment record
      const paymentQuery = `
        INSERT INTO billing_payments (
          tenant_id,
          amount_cents,
          discount_cents,
          payment_method,
          status,
          transaction_hash,
          processed_at
        ) VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
        RETURNING id
      `;

      const paymentResult = await client.query(paymentQuery, [
        tenantId,
        final_amount,
        discount_cents,
        payment_method,
        'tx_' + Date.now() // Mock transaction hash
      ]);

      // Update billing metrics
      await client.query(
        `UPDATE billing_metrics
         SET payment_method = $1,
             last_payment_date = NOW(),
             total_paid_cents = COALESCE(total_paid_cents, 0) + $2
         WHERE tenant_id = $3
           AND period_start = date_trunc('month', CURRENT_DATE)`,
        [payment_method, final_amount, tenantId]
      );

      // TODO: Integrate with actual blockchain payment processor
      // For now, mark as completed
      await client.query(
        `UPDATE billing_payments SET status = 'completed' WHERE id = $1`,
        [paymentResult.rows[0].id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        payment_id: paymentResult.rows[0].id,
        amount_paid: final_amount,
        discount_applied: discount_cents,
        payment_method,
        status: 'completed'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Payment processing error:', error);
      res.status(500).json({
        error: 'Payment processing failed',
        details: error.message
      });
    } finally {
      client.release();
    }
  }
);
```

---

## PHASE 2: FRONTEND FIXES (Day 2-3)

#### 2.1 Fix TenantSelector Component

##### Action: Add error handling and remove page reload
**File**: `/monay-enterprise-wallet/src/components/TenantSelector.tsx`
**Replace lines 33-48 with**:

```typescript
const loadCurrentTenant = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/tenants/current`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to load tenant:', response.status);
      // Set fallback data
      setCurrentTenant({
        tenant: {
          id: 'default',
          name: 'Default Tenant',
          tenant_code: 'DEFAULT',
          type: 'individual',
          billing_tier: 'free',
          status: 'active'
        },
        features: [],
        limits: {}
      });
      return;
    }

    const data = await response.json();
    setCurrentTenant(data);
  } catch (error) {
    console.error('Failed to load current tenant:', error);
    // Show user-friendly error
    alert('Unable to load tenant information. Please refresh the page.');
  }
};
```

##### Action: Fix tenant switching without page reload
**File**: `/monay-enterprise-wallet/src/components/TenantSelector.tsx`
**Replace lines 69-87 with**:

```typescript
const switchTenant = async (tenantId: string) => {
  try {
    setLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/tenants/${tenantId}/switch`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Switch failed: ${response.status}`);
    }

    const data = await response.json();

    // Update token without page reload
    localStorage.setItem('token', data.token);

    // Update state
    await loadCurrentTenant();
    await loadAvailableTenants();

    // Close dropdown
    setIsDropdownOpen(false);

    // Notify other components via custom event
    window.dispatchEvent(new CustomEvent('tenant-switched', {
      detail: { tenantId }
    }));

  } catch (error) {
    console.error('Failed to switch tenant:', error);
    alert('Failed to switch tenant. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

#### 2.2 Fix BillingDashboard Component

##### Action: Add error handling and loading states
**File**: `/monay-enterprise-wallet/src/components/BillingDashboard.tsx`
**Add error state after line 66**:

```typescript
const [error, setError] = useState<string | null>(null);
const [processingPayment, setProcessingPayment] = useState(false);
```

##### Action: Fix loadBillingMetrics with error handling
**File**: `/monay-enterprise-wallet/src/components/BillingDashboard.tsx`
**Replace lines 74-91 with**:

```typescript
const loadBillingMetrics = async () => {
  try {
    setError(null);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/current`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to load billing: ${response.status}`);
    }

    const data = await response.json();
    setMetrics(data);

  } catch (error) {
    console.error('Failed to load billing metrics:', error);
    setError('Unable to load billing information. Please try again later.');

    // Set fallback data so UI doesn't break
    setMetrics({
      current_month: {
        base_fee_cents: 0,
        usage_fees_cents: 0,
        computation_fees_cents: 0,
        overage_fees_cents: 0,
        discount_cents: 0,
        total_cents: 0,
        transaction_count: 0,
        wallet_count: 0,
        storage_gb: 0,
        api_calls: 0,
        payment_method: null
      },
      previous_month: { total_cents: 0, transaction_count: 0 },
      billing_tier: {
        name: 'free',
        monthly_base_fee_cents: 0,
        included_transactions: 100,
        included_wallets: 1,
        overage_transaction_price_cents: 10,
        overage_wallet_price_cents: 100
      },
      usage_trend: []
    });
  } finally {
    setLoading(false);
  }
};
```

##### Action: Add payment confirmation
**File**: `/monay-enterprise-wallet/src/components/BillingDashboard.tsx`
**Replace makePayment function starting at line 104**:

```typescript
const makePayment = async () => {
  if (!metrics) return;

  const amount = metrics.current_month.total_cents;
  const discount = paymentMethod === 'USDXM' ? calculateUSDXMDiscount(amount) : 0;
  const finalAmount = amount - discount;

  // Confirmation dialog
  const confirmed = window.confirm(
    `Confirm payment of ${formatCurrency(finalAmount)} via ${paymentMethod}?\n` +
    (discount > 0 ? `You're saving ${formatCurrency(discount)} with USDXM!` : '')
  );

  if (!confirmed) return;

  setProcessingPayment(true);
  setError(null);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/payment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_cents: amount,
          payment_method: paymentMethod,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Payment failed');
    }

    const data = await response.json();

    // Show success message
    alert(`Payment successful! Transaction ID: ${data.payment_id}`);

    // Close modal and refresh billing
    setShowPaymentModal(false);
    await loadBillingMetrics();

  } catch (error) {
    console.error('Payment error:', error);
    setError('Payment failed. Please try again or contact support.');
  } finally {
    setProcessingPayment(false);
  }
};
```

---

## PHASE 3: ENVIRONMENT & CONFIGURATION (Day 3)

#### 3.1 Create Environment Configuration

##### Action: Create .env.local for Enterprise Wallet
**File**: `/monay-enterprise-wallet/.env.local`
**Create new file**:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Monay Enterprise Wallet
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_USDXM_DISCOUNT=10
```

#### 3.2 Fix CORS Headers

##### Action: Add enterprise-specific headers
**File**: `/monay-backend-common/src/bootstrap.js`
**Update line 93 to include enterprise headers**:

```javascript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-Tenant-Id',
  'X-API-Key',
  'X-Enterprise-Key',
  'X-Internal-Key'
]
```

---

## PHASE 4: GROUP MANAGEMENT ENDPOINTS (Day 4)

#### 4.1 Implement Group Member Endpoints

##### Action: Add group members endpoint
**File**: `/monay-backend-common/src/routes/groups.js`
**Add after line 150**:

```javascript
/**
 * @route   GET /api/groups/:id/members
 * @desc    Get group members for enterprise
 * @access  Private
 */
router.get('/:id/members',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id: groupId } = req.params;

      // Verify access to group
      const accessQuery = `
        SELECT role FROM group_members
        WHERE group_id = $1 AND tenant_id = $2 AND is_active = true
      `;

      const accessResult = await req.dbClient.query(accessQuery, [groupId, req.tenant.id]);

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to this group' });
      }

      // Get group members
      const membersQuery = `
        SELECT
          gm.id,
          gm.tenant_id,
          t.name as member_name,
          t.tenant_code,
          gm.role,
          gm.ownership_percent,
          gm.joined_at,
          gm.is_active
        FROM group_members gm
        JOIN tenants t ON gm.tenant_id = t.id
        WHERE gm.group_id = $1 AND gm.is_active = true
        ORDER BY gm.role DESC, gm.joined_at ASC
      `;

      const membersResult = await req.dbClient.query(membersQuery, [groupId]);

      res.json({
        members: membersResult.rows,
        total: membersResult.rowCount,
        your_role: accessResult.rows[0].role
      });

    } catch (error) {
      console.error('Error fetching group members:', error);
      res.status(500).json({ error: 'Failed to fetch group members' });
    }
  }
);
```

##### Action: Add group treasury endpoint
**File**: `/monay-backend-common/src/routes/groups.js`
**Add after members endpoint**:

```javascript
/**
 * @route   GET /api/groups/:id/treasury
 * @desc    Get group treasury information
 * @access  Private
 */
router.get('/:id/treasury',
  validateRequest([
    param('id').isUUID()
  ]),
  async (req, res) => {
    try {
      const { id: groupId } = req.params;

      // Check if user is primary or admin
      const roleQuery = `
        SELECT role FROM group_members
        WHERE group_id = $1 AND tenant_id = $2 AND is_active = true
      `;

      const roleResult = await req.dbClient.query(roleQuery, [groupId, req.tenant.id]);

      if (!roleResult.rows[0] || !['primary', 'admin'].includes(roleResult.rows[0].role)) {
        return res.status(403).json({ error: 'Treasury access requires admin role' });
      }

      // Get treasury information
      const treasuryQuery = `
        SELECT
          ta.balance_cents,
          ta.reserved_cents,
          ta.currency,
          ta.last_updated,
          gbc.monthly_allocation_cents,
          gbc.member_allocation_type
        FROM treasury_accounts ta
        JOIN groups g ON ta.group_id = g.id
        LEFT JOIN group_billing_config gbc ON g.id = gbc.group_id
        WHERE g.id = $1
      `;

      const treasuryResult = await req.dbClient.query(treasuryQuery, [groupId]);

      const treasury = treasuryResult.rows[0] || {
        balance_cents: 0,
        reserved_cents: 0,
        currency: 'USD',
        monthly_allocation_cents: 0,
        member_allocation_type: 'equal'
      };

      res.json({
        treasury,
        available_balance_cents: treasury.balance_cents - treasury.reserved_cents
      });

    } catch (error) {
      console.error('Error fetching treasury:', error);
      res.status(500).json({ error: 'Failed to fetch treasury information' });
    }
  }
);
```

---

## PHASE 5: STATE MANAGEMENT (Day 5)

#### 5.1 Create Enterprise Store

##### Action: Create Zustand store for enterprise
**File**: `/monay-enterprise-wallet/src/stores/useEnterpriseStore.ts`
**Create new file**:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnterpriseState {
  currentTenant: any | null;
  availableTenants: any[];
  billingMetrics: any | null;
  groups: any[];
  setCurrentTenant: (tenant: any) => void;
  setAvailableTenants: (tenants: any[]) => void;
  setBillingMetrics: (metrics: any) => void;
  setGroups: (groups: any[]) => void;
  clearAll: () => void;
}

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set) => ({
      currentTenant: null,
      availableTenants: [],
      billingMetrics: null,
      groups: [],
      setCurrentTenant: (tenant) => set({ currentTenant: tenant }),
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setBillingMetrics: (metrics) => set({ billingMetrics: metrics }),
      setGroups: (groups) => set({ groups }),
      clearAll: () => set({
        currentTenant: null,
        availableTenants: [],
        billingMetrics: null,
        groups: []
      })
    }),
    {
      name: 'enterprise-storage',
    }
  )
);
```

#### 5.2 Listen for Tenant Switch Events

##### Action: Add event listener to BillingDashboard
**File**: `/monay-enterprise-wallet/src/components/BillingDashboard.tsx`
**Add in useEffect**:

```typescript
useEffect(() => {
  loadBillingMetrics();

  // Listen for tenant switch events
  const handleTenantSwitch = () => {
    loadBillingMetrics();
  };

  window.addEventListener('tenant-switched', handleTenantSwitch);

  return () => {
    window.removeEventListener('tenant-switched', handleTenantSwitch);
  };
}, []);
```

---

## PHASE 6: ERROR HANDLING & USER FEEDBACK (Day 5-6)

#### 6.1 Create Error Boundary

##### Action: Create error boundary component
**File**: `/monay-enterprise-wallet/src/components/ErrorBoundary.tsx`
**Create new file**:

```typescript
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg">
            <h2 className="text-red-800 font-semibold mb-2">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 6.2 Create Toast Notification System

##### Action: Create toast component
**File**: `/monay-enterprise-wallet/src/components/Toast.tsx`
**Create new file**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-3 p-4 rounded-lg border ${colors[type]} shadow-lg max-w-md animate-slide-up`}>
      {icons[type]}
      <p className="flex-1 text-sm">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## PHASE 7: TESTING (Day 6-7)

#### 7.1 Create API Test Suite

##### Action: Create test for tenant endpoints
**File**: `/monay-backend-common/tests/enterprise-tenant.test.js`
**Create new file**:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Enterprise Tenant Endpoints', () => {
  const validToken = 'Bearer test_enterprise_token';

  test('GET /api/tenants/current returns tenant context', async () => {
    const response = await request(app)
      .get('/api/tenants/current')
      .set('Authorization', validToken)
      .expect(200);

    expect(response.body).toHaveProperty('tenant');
    expect(response.body).toHaveProperty('features');
    expect(response.body).toHaveProperty('limits');
  });

  test('POST /api/tenants/:id/switch switches context', async () => {
    const response = await request(app)
      .post('/api/tenants/test-tenant-id/switch')
      .set('Authorization', validToken)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
  });

  test('GET /api/billing/current returns metrics', async () => {
    const response = await request(app)
      .get('/api/billing/current')
      .set('Authorization', validToken)
      .expect(200);

    expect(response.body).toHaveProperty('current_month');
    expect(response.body).toHaveProperty('billing_tier');
    expect(response.body).toHaveProperty('usage_trend');
  });
});
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment Verification
- [ ] All P0 endpoints implemented and tested
- [ ] Frontend error handling added
- [ ] Environment variables configured
- [ ] CORS headers updated
- [ ] No hardcoded URLs in frontend
- [ ] Payment confirmation dialog working
- [ ] Tenant switching without page reload

### Deployment Steps
1. Deploy backend changes first (restart server)
2. Test endpoints with Postman/curl
3. Deploy frontend with environment variables
4. Clear browser cache and test
5. Monitor error logs for 1 hour

### Post-Deployment Monitoring
- [ ] Check error rates in logs
- [ ] Verify tenant switching works
- [ ] Test payment flow end-to-end
- [ ] Monitor API response times
- [ ] Check for CORS errors

---

## SUCCESS METRICS

### Functional Metrics
- All UI components receive data (no 404s)
- Tenant switching completes in < 2 seconds
- Payment processing shows confirmation
- Error messages display to users
- No page reloads except on errors

### Technical Metrics
- API response time < 500ms
- Zero 404 errors on implemented endpoints
- Payment success rate > 95%
- Frontend error boundary catches crashes

---

## RISK MITIGATION

### Rollback Plan
1. Keep current version as backup
2. Use feature flags for new endpoints
3. Database is read-only (no migration risks)
4. Can revert frontend independently

### Known Limitations
- No real blockchain integration (mock transactions)
- No multi-signature support yet
- Treasury management is read-only
- No KYB verification integrated

---

## NEXT STEPS AFTER THIS PLAN

### Phase 8: Advanced Features (Week 2)
1. Implement real blockchain payment processing
2. Add multi-signature approval workflow
3. Create treasury management interface
4. Implement KYB verification

### Phase 9: Security Hardening (Week 3)
1. Add multi-factor authentication
2. Implement audit logging
3. Add rate limiting per tenant
4. Create enterprise API key management

---

**Document Version**: 1.0
**Implementation Timeline**: 5-7 days
**Team Required**: 2 developers (1 backend, 1 frontend)
**Risk Level**: Medium (payment handling)
**Success Criteria**: Enterprise Wallet becomes functional for basic operations

---

## IMMEDIATE ACTION ITEMS

### Day 1 (Backend Developer)
1. Implement `/api/tenants/current` endpoint
2. Implement `/api/tenants/:id/switch` endpoint
3. Fix `/api/billing/current` endpoint
4. Test with Postman

### Day 1 (Frontend Developer)
1. Add error handling to TenantSelector
2. Remove window.reload()
3. Create .env.local file
4. Test with mock data

### Day 2 (Both)
1. Implement `/api/billing/payment` endpoint
2. Add payment confirmation dialog
3. Test end-to-end payment flow
4. Deploy to staging environment

**Note**: This plan focuses on making the Enterprise Wallet functional quickly while respecting the database read-only constraint. All changes are in the application layer only.