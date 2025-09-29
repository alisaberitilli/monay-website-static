import express from 'express';
const router = express.Router();
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth.js';
import tenantIsolation from '../middleware/tenant-isolation.js';
import BillingCalculationService from '../services/billing-calculation.js';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

// Initialize service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const billingService = new BillingCalculationService(pool);

// Apply authentication and tenant isolation to all routes
router.use(authenticateToken);
router.use(tenantIsolation.middleware());

// ================================================================
// BILLING CALCULATION ENDPOINTS
// ================================================================

/**
 * @route   GET /api/billing/calculate
 * @desc    Calculate current billing for tenant
 * @access  Private
 */
router.get('/calculate',
  async (req, res) => {
    try {
      const tenantId = req.tenant.id;
      const bill = await billingService.calculateCurrentBill(tenantId);

      // Add USDXM savings calculation
      const usdxmSavings = bill.costs.usdxm_discount_cents;
      const savingsPercentage = bill.payment_method === 'USDXM' ? 10 : 0;

      res.json({
        ...bill,
        savings: {
          amount_cents: usdxmSavings,
          percentage: savingsPercentage,
          message: bill.payment_method === 'USDXM'
            ? 'You are saving 10% with USDXM payment!'
            : 'Switch to USDXM to save 10% on your bill'
        }
      });

    } catch (error) {
      console.error('Error calculating bill:', error);
      res.status(500).json({
        error: 'Failed to calculate billing',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/billing/current
 * @desc    Get current billing (alias for /calculate)
 * @access  Private
 */
router.get('/current',
  async (req, res) => {
    try {
      const tenantId = req.tenant.id;
      const bill = await billingService.calculateCurrentBill(tenantId);

      // Add USDXM savings calculation
      const usdxmSavings = bill.costs.usdxm_discount_cents;
      const savingsPercentage = bill.payment_method === 'USDXM' ? 10 : 0;

      res.json({
        ...bill,
        savings: {
          amount_cents: usdxmSavings,
          percentage: savingsPercentage,
          message: bill.payment_method === 'USDXM'
            ? 'You are saving 10% with USDXM payment!'
            : 'Switch to USDXM to save 10% on your bill'
        }
      });

    } catch (error) {
      console.error('Error calculating bill:', error);
      res.status(500).json({
        error: 'Failed to calculate billing',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/billing/history
 * @desc    Get billing history for tenant
 * @access  Private
 */
router.get('/history',
  validateRequest([
    query('limit').optional().isInt({ min: 1, max: 24 }).default(12)
  ]),
  async (req, res) => {
    try {
      const { limit } = req.query;
      const history = await billingService.getBillingHistory(req.tenant.id, limit);

      // Calculate total savings from USDXM
      const totalSavings = history.reduce((sum, bill) => {
        return sum + (bill.discount_cents || 0);
      }, 0);

      res.json({
        history,
        summary: {
          total_records: history.length,
          total_savings_cents: totalSavings,
          average_monthly_cents: history.length > 0
            ? Math.round(history.reduce((sum, b) => sum + b.total_cents, 0) / history.length)
            : 0
        }
      });

    } catch (error) {
      console.error('Error fetching billing history:', error);
      res.status(500).json({
        error: 'Failed to fetch billing history',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/billing/usage
 * @desc    Get current usage metrics
 * @access  Private
 */
router.get('/usage',
  async (req, res) => {
    try {
      const limits = req.tenant.limits;
      const features = req.tenant.features;

      // Get current period usage
      const usageQuery = `
        SELECT
          bm.*,
          btc.tier_name,
          btc.monthly_base_fee_cents
        FROM billing_metrics bm
        JOIN tenants t ON bm.tenant_id = t.id
        JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        WHERE bm.tenant_id = $1
        AND bm.period_start = date_trunc('month', CURRENT_DATE)
      `;

      const result = await pool.query(usageQuery, [req.tenant.id]);
      const metrics = result.rows[0];

      res.json({
        period: {
          start: metrics?.period_start || new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: metrics?.period_end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        },
        tier: req.tenant.billing_tier,
        usage: {
          transactions: limits.transactions,
          computation_units: limits.computation_units,
          api_calls: limits.api_calls,
          storage_gb: limits.storage_gb
        },
        features,
        payment_method: metrics?.payment_method || 'USDXM',
        alerts: await getUsageAlerts(req.tenant.id)
      });

    } catch (error) {
      console.error('Error fetching usage:', error);
      res.status(500).json({
        error: 'Failed to fetch usage metrics',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/billing/track-operation
 * @desc    Track a billable operation
 * @access  Private/Internal
 */
router.post('/track-operation',
  validateRequest([
    body('operation_type').notEmpty(),
    body('metadata').optional().isObject()
  ]),
  async (req, res) => {
    try {
      const { operation_type, metadata } = req.body;

      const operation = await billingService.trackOperation(
        req.tenant.id,
        operation_type,
        metadata
      );

      res.json({
        operation,
        message: 'Operation tracked successfully'
      });

    } catch (error) {
      console.error('Error tracking operation:', error);
      res.status(500).json({
        error: 'Failed to track operation',
        message: error.message
      });
    }
  }
);

// ================================================================
// PAYMENT ENDPOINTS
// ================================================================

/**
 * @route   GET /api/billing/payment-methods
 * @desc    Get available payment methods (stablecoins)
 * @access  Private
 */
router.get('/payment-methods',
  async (req, res) => {
    try {
      const query = `
        SELECT
          stablecoin_symbol,
          stablecoin_name,
          blockchain_network,
          processing_fee_percent,
          metadata
        FROM stablecoin_payment_config
        WHERE is_active = true
        ORDER BY
          CASE WHEN stablecoin_symbol = 'USDXM' THEN 0 ELSE 1 END,
          stablecoin_symbol
      `;

      const result = await pool.query(query);

      res.json({
        payment_methods: result.rows.map(method => ({
          ...method,
          recommended: method.stablecoin_symbol === 'USDXM',
          discount: method.metadata?.discount || 0
        }))
      });

    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({
        error: 'Failed to fetch payment methods',
        message: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/billing/payment-method
 * @desc    Update payment method for tenant
 * @access  Private
 */
router.put('/payment-method',
  validateRequest([
    body('payment_method').isIn(['USDXM', 'USDC', 'USDT'])
  ]),
  async (req, res) => {
    try {
      const { payment_method } = req.body;

      await billingService.updatePaymentMethod(req.tenant.id, payment_method);

      // Calculate impact
      let message = `Payment method updated to ${payment_method}`;
      if (payment_method === 'USDXM') {
        message += '. You will now receive a 10% discount on all fees!';
      } else if (req.body.previous_method === 'USDXM') {
        message += '. You will no longer receive the 10% USDXM discount.';
      }

      res.json({
        payment_method,
        message
      });

    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({
        error: 'Failed to update payment method',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/billing/invoice/:month
 * @desc    Get invoice for specific month
 * @access  Private
 */
router.get('/invoice/:month',
  validateRequest([
    param('month').matches(/^\d{4}-\d{2}$/)
  ]),
  async (req, res) => {
    try {
      const { month } = req.params;
      const [year, monthNum] = month.split('-').map(Number);

      // Get billing history for the specified month
      const query = `
        SELECT
          bh.*,
          t.name as tenant_name,
          t.type as tenant_type,
          btc.tier_name
        FROM billing_history bh
        JOIN tenants t ON bh.tenant_id = t.id
        JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        WHERE bh.tenant_id = $1
        AND EXTRACT(YEAR FROM bh.period_start) = $2
        AND EXTRACT(MONTH FROM bh.period_start) = $3
      `;

      const result = await pool.query(query, [req.tenant.id, year, monthNum]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Invoice not found for the specified month'
        });
      }

      const invoice = result.rows[0];

      // Generate invoice data
      res.json({
        invoice_id: `INV-${year}-${String(monthNum).padStart(2, '0')}-${req.tenant.id.substring(0, 8)}`,
        tenant: {
          name: invoice.tenant_name,
          type: invoice.tenant_type,
          id: req.tenant.id
        },
        period: {
          start: invoice.period_start,
          end: invoice.period_end,
          month: month
        },
        billing: {
          tier: invoice.tier_name,
          base_fee_cents: invoice.base_fee_cents,
          overage_fee_cents: invoice.overage_fee_cents,
          discount_cents: invoice.discount_cents,
          total_cents: invoice.total_cents,
          payment_method: invoice.payment_method
        },
        usage: {
          transactions: invoice.transaction_count,
          computation_units: invoice.computation_units_used,
          api_calls: invoice.api_calls_count
        },
        status: invoice.status,
        paid_at: invoice.paid_at,
        payment_transaction_id: invoice.payment_transaction_id,
        download_url: `/api/billing/invoice/${month}/pdf` // Future implementation
      });

    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        error: 'Failed to fetch invoice',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/billing/payment
 * @desc    Process payment for billing
 * @access  Private
 */
router.post('/payment',
  validateRequest([
    body('billing_history_id').optional().isUUID(),
    body('amount_cents').isInt({ min: 1 }),
    body('payment_method').isIn(['USDXM', 'USDC', 'USDT']),
    body('blockchain_txn_hash').optional().isString()
  ]),
  async (req, res) => {
    try {
      const {
        billing_history_id,
        amount_cents,
        payment_method,
        blockchain_txn_hash
      } = req.body;

      // Calculate discount
      let finalAmount = amount_cents;
      let discountApplied = 0;

      if (payment_method === 'USDXM') {
        discountApplied = Math.floor(amount_cents * 0.1);
        finalAmount = amount_cents - discountApplied;
      }

      // Record payment validation
      const paymentQuery = `
        INSERT INTO stablecoin_payment_validation (
          tenant_id,
          payment_id,
          stablecoin_symbol,
          amount,
          blockchain_txn_hash,
          validation_status,
          validated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const paymentId = `pay_${Date.now()}_${req.tenant.id.substring(0, 8)}`;
      const paymentResult = await pool.query(paymentQuery, [
        req.tenant.id,
        paymentId,
        payment_method,
        finalAmount / 100, // Convert cents to dollars
        blockchain_txn_hash,
        blockchain_txn_hash ? 'validated' : 'pending'
      ]);

      // Update billing history if ID provided
      if (billing_history_id) {
        await pool.query(
          `UPDATE billing_history
           SET status = 'paid',
               payment_transaction_id = $1,
               paid_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND tenant_id = $3`,
          [paymentId, billing_history_id, req.tenant.id]
        );
      }

      res.json({
        payment: paymentResult.rows[0],
        amount_cents: amount_cents,
        discount_applied: discountApplied,
        final_amount: finalAmount,
        message: payment_method === 'USDXM'
          ? `Payment processed with 10% USDXM discount! Saved $${(discountApplied/100).toFixed(2)}`
          : 'Payment processed successfully'
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        error: 'Failed to process payment',
        message: error.message
      });
    }
  }
);

// ================================================================
// BILLING TIER ENDPOINTS
// ================================================================

/**
 * @route   GET /api/billing/tiers
 * @desc    Get available billing tiers
 * @access  Public
 */
router.get('/tiers',
  async (req, res) => {
    try {
      const query = `
        SELECT
          tier_name,
          monthly_base_fee_cents,
          included_transactions,
          overage_transaction_price_cents,
          included_computation_units,
          overage_computation_price_cents,
          included_api_calls,
          max_users,
          max_wallets,
          custom_branding,
          priority_support,
          target_gross_margin_percent
        FROM billing_tier_config
        WHERE tier_name != 'custom'
        ORDER BY monthly_base_fee_cents
      `;

      const result = await pool.query(query);

      res.json({
        tiers: result.rows.map(tier => ({
          ...tier,
          monthly_price: tier.monthly_base_fee_cents / 100,
          annual_price: (tier.monthly_base_fee_cents * 12 * 0.9) / 100, // 10% annual discount
          usdxm_monthly_price: (tier.monthly_base_fee_cents * 0.9) / 100, // USDXM discount
          usdxm_annual_price: (tier.monthly_base_fee_cents * 12 * 0.81) / 100 // Both discounts
        }))
      });

    } catch (error) {
      console.error('Error fetching billing tiers:', error);
      res.status(500).json({
        error: 'Failed to fetch billing tiers',
        message: error.message
      });
    }
  }
);

/**
 * @route   POST /api/billing/upgrade-tier
 * @desc    Request tier upgrade
 * @access  Private
 */
router.post('/upgrade-tier',
  validateRequest([
    body('new_tier').isIn(['small_business', 'enterprise', 'custom'])
  ]),
  async (req, res) => {
    try {
      const { new_tier } = req.body;
      const currentTier = req.tenant.billing_tier;

      // Validate upgrade path
      const validUpgrades = {
        'free': ['small_business', 'enterprise'],
        'small_business': ['enterprise'],
        'enterprise': ['custom']
      };

      if (!validUpgrades[currentTier]?.includes(new_tier)) {
        return res.status(400).json({
          error: 'Invalid upgrade path',
          message: `Cannot upgrade from ${currentTier} to ${new_tier}`
        });
      }

      // Create upgrade request (would go through approval in production)
      const requestQuery = `
        INSERT INTO tier_upgrade_requests (
          tenant_id,
          current_tier,
          requested_tier,
          status,
          requested_at
        ) VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
        RETURNING id
      `;

      const result = await pool.query(requestQuery, [
        req.tenant.id,
        currentTier,
        new_tier
      ]);

      res.json({
        request_id: result.rows[0].id,
        message: 'Tier upgrade requested. Our team will contact you shortly.',
        estimated_response: '24-48 hours'
      });

    } catch (error) {
      console.error('Error requesting tier upgrade:', error);
      res.status(500).json({
        error: 'Failed to request upgrade',
        message: error.message
      });
    }
  }
);

// ================================================================
// ADMIN ENDPOINTS
// ================================================================

/**
 * @route   POST /api/billing/process-monthly
 * @desc    Process monthly billing for all tenants (Admin only)
 * @access  Private/Admin
 */
router.post('/process-monthly',
  async (req, res) => {
    try {
      // Check admin permission
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin access required'
        });
      }

      const result = await billingService.processMonthlyBilling();

      res.json({
        ...result,
        message: 'Monthly billing processed successfully'
      });

    } catch (error) {
      console.error('Error processing monthly billing:', error);
      res.status(500).json({
        error: 'Failed to process monthly billing',
        message: error.message
      });
    }
  }
);

/**
 * @route   GET /api/billing/analytics
 * @desc    Get billing analytics (Admin only)
 * @access  Private/Admin
 */
router.get('/analytics',
  async (req, res) => {
    try {
      // Check admin permission
      if (!req.user.isAdmin) {
        return res.status(403).json({
          error: 'Admin access required'
        });
      }

      const analyticsQuery = `
        WITH monthly_revenue AS (
          SELECT
            date_trunc('month', period_start) as month,
            SUM(total_cents) as revenue_cents,
            SUM(discount_cents) as discounts_cents,
            COUNT(DISTINCT tenant_id) as active_tenants,
            SUM(CASE WHEN payment_method = 'USDXM' THEN 1 ELSE 0 END) as usdxm_payments
          FROM billing_history
          WHERE status = 'paid'
          GROUP BY date_trunc('month', period_start)
        ),
        tier_distribution AS (
          SELECT
            billing_tier,
            COUNT(*) as tenant_count,
            AVG(gross_margin_percent) as avg_margin
          FROM tenants
          WHERE status = 'active'
          GROUP BY billing_tier
        )
        SELECT
          (SELECT json_agg(mr.* ORDER BY month DESC) FROM monthly_revenue mr) as monthly_revenue,
          (SELECT json_agg(td.*) FROM tier_distribution td) as tier_distribution,
          (SELECT COUNT(*) FROM tenants WHERE status = 'active') as total_active_tenants,
          (SELECT SUM(total_cents) FROM billing_history WHERE status = 'paid') as lifetime_revenue_cents,
          (SELECT SUM(discount_cents) FROM billing_history WHERE payment_method = 'USDXM') as total_usdxm_savings
      `;

      const result = await pool.query(analyticsQuery);

      res.json({
        analytics: result.rows[0],
        usdxm_adoption_rate: calculateUSDXMAdoptionRate(result.rows[0])
      });

    } catch (error) {
      console.error('Error fetching billing analytics:', error);
      res.status(500).json({
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  }
);

// ================================================================
// HELPER FUNCTIONS
// ================================================================

async function getUsageAlerts(tenantId) {
  const query = `
    SELECT
      alert_type,
      threshold,
      usage_percent,
      message,
      acknowledged,
      created_at
    FROM billing_alerts
    WHERE tenant_id = $1
    AND period_month = date_trunc('month', CURRENT_DATE)
    AND acknowledged = false
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const result = await pool.query(query, [tenantId]);
  return result.rows;
}

function calculateUSDXMAdoptionRate(analytics) {
  if (!analytics.monthly_revenue || analytics.monthly_revenue.length === 0) {
    return 0;
  }

  const latestMonth = analytics.monthly_revenue[0];
  if (latestMonth.active_tenants === 0) {
    return 0;
  }

  return Math.round((latestMonth.usdxm_payments / latestMonth.active_tenants) * 100);
}

// Create tier_upgrade_requests table if it doesn't exist
const createUpgradeTableQuery = `
  CREATE TABLE IF NOT EXISTS tier_upgrade_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    current_tier VARCHAR(50),
    requested_tier VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
  );
`;

// Execute on module load
pool.query(createUpgradeTableQuery).catch(err => {
  console.log('Tier upgrade requests table already exists or error:', err.message);
});

export default router;