import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

class BillingCalculationService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Track a billable operation
   * @param {String} tenantId - Tenant ID
   * @param {String} operationType - Type of operation
   * @param {Object} metadata - Operation metadata
   * @returns {Object} Tracked operation
   */
  async trackOperation(tenantId, operationType, metadata = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get operation cost configuration
      const costConfig = await this.getOperationCost(operationType);

      // Calculate costs
      const quantity = metadata.quantity || 1;
      const computationUnits = costConfig.computation_units * quantity;
      const baseCostCents = costConfig.base_cost_cents || 0;
      const perUnitCostCents = costConfig.per_unit_cost_cents || 0;
      const totalCostCents = baseCostCents + (perUnitCostCents * quantity);

      // Track the operation
      const trackQuery = `
        INSERT INTO billing_operations (
          id,
          tenant_id,
          operation_type,
          quantity,
          computation_units,
          base_cost_cents,
          total_cost_cents,
          metadata,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const operationId = uuidv4();
      const result = await client.query(trackQuery, [
        operationId,
        tenantId,
        operationType,
        quantity,
        computationUnits,
        baseCostCents,
        totalCostCents,
        metadata
      ]);

      // Update current period metrics
      await this.updatePeriodMetrics(client, tenantId, {
        transactions: operationType.includes('transaction') ? quantity : 0,
        computationUnits: computationUnits,
        volumeCents: metadata.amount_cents || 0
      });

      // Check if we need to send usage alerts
      await this.checkUsageAlerts(client, tenantId);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculate current period bill for a tenant
   * @param {String} tenantId - Tenant ID
   * @returns {Object} Detailed bill calculation
   */
  async calculateCurrentBill(tenantId) {
    const client = await this.pool.connect();

    try {
      // Get tenant information
      const tenantQuery = `
        SELECT t.*, btc.*
        FROM tenants t
        LEFT JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
        WHERE t.id = $1
      `;
      const tenantResult = await client.query(tenantQuery, [tenantId]);

      if (tenantResult.rows.length === 0) {
        throw new Error('Tenant not found');
      }

      const tenant = tenantResult.rows[0];

      // Get current period metrics
      const metricsQuery = `
        SELECT *
        FROM billing_metrics
        WHERE tenant_id = $1
          AND period_start = date_trunc('month', CURRENT_DATE)
      `;
      const metricsResult = await client.query(metricsQuery, [tenantId]);

      const metrics = metricsResult.rows[0] || {
        transaction_count: 0,
        computation_units_used: 0,
        transaction_volume_cents: 0,
        storage_gb_used: 0,
        api_calls: 0,
        payment_method: 'USDXM'
      };

      // Calculate base fee
      const baseFee = tenant.monthly_base_fee_cents || 0;

      // Calculate transaction overages
      const includedTransactions = tenant.included_transactions || 0;
      const transactionOverage = Math.max(0, metrics.transaction_count - includedTransactions);
      const transactionOverageCost = transactionOverage * (tenant.overage_transaction_price_cents || 0);

      // Calculate computation unit overages
      const includedComputation = tenant.included_computation_units || 0;
      const computationOverage = Math.max(0, metrics.computation_units_used - includedComputation);
      const computationOverageCost = computationOverage * (tenant.overage_computation_price_cents || 0);

      // Get operation-specific charges
      const operationsQuery = `
        SELECT
          operation_type,
          COUNT(*) as count,
          SUM(total_cost_cents) as total_cost_cents
        FROM billing_operations
        WHERE tenant_id = $1
          AND timestamp >= date_trunc('month', CURRENT_DATE)
          AND timestamp < date_trunc('month', CURRENT_DATE) + interval '1 month'
        GROUP BY operation_type
      `;
      const operationsResult = await client.query(operationsQuery, [tenantId]);

      let operationsCost = 0;
      const operationBreakdown = {};
      for (const op of operationsResult.rows) {
        operationsCost += op.total_cost_cents;
        operationBreakdown[op.operation_type] = {
          count: parseInt(op.count),
          cost_cents: op.total_cost_cents
        };
      }

      // Calculate storage cost
      const storageCost = Math.ceil(metrics.storage_gb_used * (tenant.storage_gb_price_cents || 10));

      // Calculate API cost (if over included limit)
      const includedAPICalls = tenant.included_api_calls || 1000;
      const apiOverage = Math.max(0, metrics.api_calls - includedAPICalls);
      const apiCost = Math.ceil((apiOverage / 1000) * (tenant.api_thousand_price_cents || 5));

      // Sum up all costs
      const subtotal = baseFee + transactionOverageCost + computationOverageCost +
                      operationsCost + storageCost + apiCost;

      // Apply gross margin
      const grossMarginPercent = tenant.gross_margin_percent || 60;
      const marginMultiplier = 1 + (grossMarginPercent / 100);
      const totalBeforeDiscount = Math.ceil(subtotal * marginMultiplier);

      // Apply USDXM discount if applicable
      const isUSDXM = metrics.payment_method === 'USDXM';
      const usdxmDiscount = isUSDXM ? Math.floor(totalBeforeDiscount * 0.1) : 0;
      const finalTotal = totalBeforeDiscount - usdxmDiscount;

      // Check if this is part of a group
      const groupQuery = `
        SELECT g.*, gm.role
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.tenant_id = $1
          AND gm.is_active = true
          AND g.configuration->>'aggregate_billing' = 'true'
      `;
      const groupResult = await client.query(groupQuery, [tenantId]);

      let billingNote = null;
      if (groupResult.rows.length > 0) {
        const group = groupResult.rows[0];
        if (group.configuration.primary_pays_all && group.role !== 'primary') {
          billingNote = `Billed through ${group.group_type}: ${group.group_name}`;
        }
      }

      return {
        tenant_id: tenantId,
        tenant_name: tenant.name,
        billing_tier: tenant.billing_tier,
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        },
        usage: {
          transactions: {
            used: metrics.transaction_count,
            included: includedTransactions,
            overage: transactionOverage
          },
          computation_units: {
            used: metrics.computation_units_used,
            included: includedComputation,
            overage: computationOverage
          },
          storage_gb: metrics.storage_gb_used,
          api_calls: {
            used: metrics.api_calls,
            included: includedAPICalls,
            overage: apiOverage
          }
        },
        costs: {
          base_fee_cents: baseFee,
          transaction_overage_cents: transactionOverageCost,
          computation_overage_cents: computationOverageCost,
          operations_cents: operationsCost,
          storage_cents: storageCost,
          api_cents: apiCost,
          subtotal_cents: subtotal,
          gross_margin_percent: grossMarginPercent,
          total_before_discount_cents: totalBeforeDiscount,
          usdxm_discount_cents: usdxmDiscount,
          final_total_cents: finalTotal
        },
        operations_breakdown: operationBreakdown,
        payment_method: metrics.payment_method,
        is_usdxm_discounted: isUSDXM,
        billing_note: billingNote,
        estimated: true // This is an estimate, not a final bill
      };

    } finally {
      client.release();
    }
  }

  /**
   * Process end-of-period billing for all tenants
   * @returns {Object} Billing run summary
   */
  async processMonthlyBilling() {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get all active tenants
      const tenantsQuery = `
        SELECT t.id, t.billing_tier
        FROM tenants t
        WHERE t.status = 'active'
          AND t.billing_tier != 'free'
      `;
      const tenantsResult = await client.query(tenantsQuery);

      const billingResults = [];
      let totalBilled = 0;
      let totalDiscounts = 0;

      for (const tenant of tenantsResult.rows) {
        try {
          // Calculate bill
          const bill = await this.calculateCurrentBill(tenant.id);

          // Create billing record
          const billingQuery = `
            INSERT INTO billing_history (
              id,
              tenant_id,
              period_start,
              period_end,
              subtotal_cents,
              discount_cents,
              total_cents,
              payment_method,
              usage_summary,
              cost_breakdown,
              status,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
            RETURNING id
          `;

          const billingId = uuidv4();
          await client.query(billingQuery, [
            billingId,
            tenant.id,
            bill.period.start,
            bill.period.end,
            bill.costs.total_before_discount_cents,
            bill.costs.usdxm_discount_cents,
            bill.costs.final_total_cents,
            bill.payment_method,
            bill.usage,
            bill.costs,
            'pending'
          ]);

          billingResults.push({
            tenant_id: tenant.id,
            billing_id: billingId,
            total_cents: bill.costs.final_total_cents
          });

          totalBilled += bill.costs.final_total_cents;
          totalDiscounts += bill.costs.usdxm_discount_cents;

        } catch (error) {
          console.error(`Failed to bill tenant ${tenant.id}:`, error);
          billingResults.push({
            tenant_id: tenant.id,
            error: error.message
          });
        }
      }

      // Process group billing aggregations
      await this.processGroupBilling(client);

      await client.query('COMMIT');

      return {
        run_date: new Date(),
        tenants_billed: billingResults.length,
        total_billed_cents: totalBilled,
        total_discounts_cents: totalDiscounts,
        results: billingResults
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get billing history for a tenant
   * @param {String} tenantId - Tenant ID
   * @param {Number} limit - Number of records to return
   * @returns {Array} Billing history
   */
  async getBillingHistory(tenantId, limit = 12) {
    const query = `
      SELECT *
      FROM billing_history
      WHERE tenant_id = $1
      ORDER BY period_start DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [tenantId, limit]);
    return result.rows;
  }

  /**
   * Update payment method for a tenant
   * @param {String} tenantId - Tenant ID
   * @param {String} paymentMethod - Payment method (USDXM, USDC, etc)
   * @returns {Boolean} Success status
   */
  async updatePaymentMethod(tenantId, paymentMethod) {
    // Verify payment method is a stablecoin
    const stablecoinQuery = `
      SELECT * FROM stablecoin_payment_config
      WHERE stablecoin_symbol = $1 AND is_active = true
    `;
    const stablecoinResult = await this.pool.query(stablecoinQuery, [paymentMethod]);

    if (stablecoinResult.rows.length === 0) {
      throw new Error(`Invalid payment method: ${paymentMethod}`);
    }

    // Update current period metrics
    const updateQuery = `
      UPDATE billing_metrics
      SET payment_method = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $2
        AND period_start = date_trunc('month', CURRENT_DATE)
      RETURNING *
    `;

    const result = await this.pool.query(updateQuery, [paymentMethod, tenantId]);

    if (result.rows.length === 0) {
      // Create new period if doesn't exist
      await this.initializePeriodMetrics(tenantId, paymentMethod);
    }

    return true;
  }

  // Helper methods

  async getOperationCost(operationType) {
    const query = `
      SELECT * FROM operation_costs
      WHERE operation_type = $1 AND is_active = true
    `;

    const result = await this.pool.query(query, [operationType]);

    if (result.rows.length === 0) {
      // Return default cost if not configured
      return {
        operation_type: operationType,
        base_cost_cents: 1,
        per_unit_cost_cents: 0,
        computation_units: 10,
        category: 'general'
      };
    }

    return result.rows[0];
  }

  async updatePeriodMetrics(client, tenantId, updates) {
    const updateQuery = `
      UPDATE billing_metrics
      SET transaction_count = transaction_count + $1,
          computation_units_used = computation_units_used + $2,
          transaction_volume_cents = transaction_volume_cents + $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = $4
        AND period_start = date_trunc('month', CURRENT_DATE)
    `;

    const result = await client.query(updateQuery, [
      updates.transactions,
      updates.computationUnits,
      updates.volumeCents,
      tenantId
    ]);

    if (result.rowCount === 0) {
      // Initialize period if doesn't exist
      await this.initializePeriodMetrics(tenantId);
      // Retry update
      await client.query(updateQuery, [
        updates.transactions,
        updates.computationUnits,
        updates.volumeCents,
        tenantId
      ]);
    }
  }

  async initializePeriodMetrics(tenantId, paymentMethod = 'USDXM') {
    const query = `
      INSERT INTO billing_metrics (
        tenant_id,
        period_start,
        period_end,
        transaction_count,
        transaction_volume_cents,
        computation_units_used,
        storage_gb_used,
        api_calls,
        payment_method
      ) VALUES ($1, $2, $3, 0, 0, 0, 0, 0, $4)
      ON CONFLICT (tenant_id, period_start) DO NOTHING
    `;

    const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const periodEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    await this.pool.query(query, [tenantId, periodStart, periodEnd, paymentMethod]);
  }

  async checkUsageAlerts(client, tenantId) {
    // Get current usage percentage
    const usageQuery = `
      SELECT
        bm.transaction_count,
        bm.computation_units_used,
        btc.included_transactions,
        btc.included_computation_units,
        t.metadata->>'usage_alerts' as alerts_enabled
      FROM billing_metrics bm
      JOIN tenants t ON bm.tenant_id = t.id
      JOIN billing_tier_config btc ON t.billing_tier = btc.tier_name
      WHERE bm.tenant_id = $1
        AND bm.period_start = date_trunc('month', CURRENT_DATE)
    `;

    const result = await client.query(usageQuery, [tenantId]);

    if (result.rows.length === 0 || result.rows[0].alerts_enabled === 'false') {
      return;
    }

    const usage = result.rows[0];

    // Calculate usage percentages
    const transactionUsage = (usage.transaction_count / usage.included_transactions) * 100;
    const computationUsage = (usage.computation_units_used / usage.included_computation_units) * 100;

    // Check thresholds (75%, 90%, 100%)
    const thresholds = [75, 90, 100];
    for (const threshold of thresholds) {
      if (transactionUsage >= threshold || computationUsage >= threshold) {
        // Log alert (would send notification in production)
        await client.query(
          `INSERT INTO billing_alerts (tenant_id, alert_type, threshold, usage_percent, created_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (tenant_id, alert_type, threshold, period_month) DO NOTHING`,
          [
            tenantId,
            transactionUsage >= threshold ? 'transaction' : 'computation',
            threshold,
            Math.max(transactionUsage, computationUsage)
          ]
        );
      }
    }
  }

  async processGroupBilling(client) {
    // Get all active groups with aggregated billing
    const groupsQuery = `
      SELECT g.*
      FROM groups g
      WHERE g.status = 'active'
        AND g.configuration->>'aggregate_billing' = 'true'
    `;

    const groupsResult = await client.query(groupsQuery);

    for (const group of groupsResult.rows) {
      // Calculate aggregated bill for the group
      const aggregateQuery = `
        SELECT
          SUM(bh.total_cents) as total_group_bill_cents,
          COUNT(DISTINCT gm.tenant_id) as member_count
        FROM group_members gm
        LEFT JOIN billing_history bh ON gm.tenant_id = bh.tenant_id
          AND bh.period_start = date_trunc('month', CURRENT_DATE)
        WHERE gm.group_id = $1
          AND gm.is_active = true
      `;

      const aggregateResult = await client.query(aggregateQuery, [group.id]);

      const totalBill = aggregateResult.rows[0].total_group_bill_cents || 0;

      // Update group billing aggregation
      const updateGroupQuery = `
        UPDATE group_billing_aggregation
        SET total_bill_cents = $1,
            status = 'billed',
            updated_at = CURRENT_TIMESTAMP
        WHERE group_id = $2
          AND period_start = date_trunc('month', CURRENT_DATE)
      `;

      await client.query(updateGroupQuery, [totalBill, group.id]);

      // If primary pays all, transfer charges to primary tenant
      if (group.configuration.primary_pays_all) {
        await client.query(
          `UPDATE billing_history
           SET billing_responsibility = $1
           WHERE tenant_id IN (
             SELECT tenant_id FROM group_members
             WHERE group_id = $2 AND is_active = true
           )
           AND period_start = date_trunc('month', CURRENT_DATE)`,
          [group.primary_tenant_id, group.id]
        );
      }
    }
  }
}

export default BillingCalculationService;