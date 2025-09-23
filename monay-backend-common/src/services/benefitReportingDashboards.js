const { pool } = require('../models');
const redis = require('../config/redis');
const { generatePDF, generateExcel, generateCSV } = require('../utils/reportGenerators');
const { sendEmail } = require('../utils/emailService');
const schedule = require('node-schedule');

class BenefitReportingDashboards {
  constructor() {
    this.reportCache = new Map();
    this.scheduledReports = new Map();
    this.initializeScheduledReports();
  }

  async initializeScheduledReports() {
    try {
      const result = await pool.query(`
        SELECT * FROM scheduled_reports
        WHERE is_active = true
      `);

      for (const report of result.rows) {
        this.scheduleReport(report);
      }
    } catch (error) {
      console.error('Error initializing scheduled reports:', error);
    }
  }

  scheduleReport(reportConfig) {
    const { id, cron_expression, report_type, recipients } = reportConfig;

    const job = schedule.scheduleJob(cron_expression, async () => {
      try {
        const report = await this.generateReport(report_type, reportConfig.parameters);
        await this.distributeReport(report, recipients);
      } catch (error) {
        console.error(`Error running scheduled report ${id}:`, error);
      }
    });

    this.scheduledReports.set(id, job);
  }

  async createDashboard(dashboardData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const dashboardResult = await client.query(`
        INSERT INTO benefit_dashboards (
          name, description, organization_id, dashboard_type,
          layout_config, widgets, filters, permissions,
          refresh_interval, is_public, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        dashboardData.name,
        dashboardData.description,
        dashboardData.organization_id,
        dashboardData.dashboard_type,
        JSON.stringify(dashboardData.layout_config),
        JSON.stringify(dashboardData.widgets),
        JSON.stringify(dashboardData.filters),
        JSON.stringify(dashboardData.permissions),
        dashboardData.refresh_interval || 300,
        dashboardData.is_public || false,
        dashboardData.created_by
      ]);

      for (const widget of dashboardData.widgets) {
        await client.query(`
          INSERT INTO dashboard_widgets (
            dashboard_id, widget_type, title, configuration,
            data_source, refresh_interval, position, size
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          dashboardResult.rows[0].id,
          widget.type,
          widget.title,
          JSON.stringify(widget.configuration),
          widget.data_source,
          widget.refresh_interval,
          JSON.stringify(widget.position),
          JSON.stringify(widget.size)
        ]);
      }

      await client.query('COMMIT');

      await redis.setex(
        `dashboard:${dashboardResult.rows[0].id}`,
        300,
        JSON.stringify(dashboardResult.rows[0])
      );

      return dashboardResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getProgramMetrics(programType, dateRange = {}) {
    const cacheKey = `metrics:${programType}:${JSON.stringify(dateRange)}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end_date = new Date() } = dateRange;

    const metrics = await pool.query(`
      WITH enrollment_stats AS (
        SELECT
          COUNT(DISTINCT customer_id) as total_beneficiaries,
          COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_enrollments_week,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_enrollments_month
        FROM government_benefits
        WHERE program_type = $1
          AND created_at BETWEEN $2 AND $3
      ),
      transaction_stats AS (
        SELECT
          COUNT(*) as total_transactions,
          SUM(amount) as total_disbursed,
          AVG(amount) as avg_transaction_amount,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as daily_volume,
          SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as weekly_volume,
          SUM(amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as monthly_volume
        FROM benefit_transactions
        WHERE program_type = $1
          AND created_at BETWEEN $2 AND $3
          AND status = 'completed'
      ),
      utilization_stats AS (
        SELECT
          COUNT(DISTINCT customer_id) as unique_users,
          AVG(transaction_count) as avg_transactions_per_user,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY transaction_count) as median_transactions
        FROM (
          SELECT customer_id, COUNT(*) as transaction_count
          FROM benefit_transactions
          WHERE program_type = $1
            AND created_at BETWEEN $2 AND $3
            AND status = 'completed'
          GROUP BY customer_id
        ) user_counts
      ),
      geographic_distribution AS (
        SELECT
          state,
          COUNT(DISTINCT customer_id) as beneficiaries_by_state,
          SUM(amount) as disbursed_by_state
        FROM benefit_transactions bt
        JOIN customers c ON bt.customer_id = c.id
        WHERE bt.program_type = $1
          AND bt.created_at BETWEEN $2 AND $3
        GROUP BY state
        ORDER BY disbursed_by_state DESC
        LIMIT 10
      ),
      mcc_distribution AS (
        SELECT
          mcc_code,
          mcc_description,
          COUNT(*) as transaction_count,
          SUM(amount) as total_spent
        FROM benefit_transactions
        WHERE program_type = $1
          AND created_at BETWEEN $2 AND $3
          AND mcc_code IS NOT NULL
        GROUP BY mcc_code, mcc_description
        ORDER BY total_spent DESC
        LIMIT 20
      ),
      hourly_pattern AS (
        SELECT
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as transaction_count,
          AVG(amount) as avg_amount
        FROM benefit_transactions
        WHERE program_type = $1
          AND created_at BETWEEN $2 AND $3
        GROUP BY EXTRACT(HOUR FROM created_at)
        ORDER BY hour
      ),
      fraud_stats AS (
        SELECT
          COUNT(*) FILTER (WHERE fraud_score > 0.7) as high_risk_transactions,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked_transactions,
          SUM(amount) FILTER (WHERE status = 'blocked') as blocked_amount
        FROM benefit_transactions
        WHERE program_type = $1
          AND created_at BETWEEN $2 AND $3
      )
      SELECT
        enrollment_stats.*,
        transaction_stats.*,
        utilization_stats.*,
        (
          SELECT json_agg(row_to_json(geographic_distribution))
          FROM geographic_distribution
        ) as geographic_data,
        (
          SELECT json_agg(row_to_json(mcc_distribution))
          FROM mcc_distribution
        ) as mcc_data,
        (
          SELECT json_agg(row_to_json(hourly_pattern))
          FROM hourly_pattern
        ) as hourly_data,
        fraud_stats.*
      FROM enrollment_stats, transaction_stats, utilization_stats, fraud_stats
    `, [programType, start_date, end_date]);

    const result = {
      program_type: programType,
      date_range: { start_date, end_date },
      enrollment: {
        total_beneficiaries: metrics.rows[0].total_beneficiaries,
        active_enrollments: metrics.rows[0].active_enrollments,
        new_enrollments_week: metrics.rows[0].new_enrollments_week,
        new_enrollments_month: metrics.rows[0].new_enrollments_month
      },
      transactions: {
        total_transactions: metrics.rows[0].total_transactions,
        total_disbursed: metrics.rows[0].total_disbursed,
        avg_transaction_amount: metrics.rows[0].avg_transaction_amount,
        daily_volume: metrics.rows[0].daily_volume,
        weekly_volume: metrics.rows[0].weekly_volume,
        monthly_volume: metrics.rows[0].monthly_volume
      },
      utilization: {
        unique_users: metrics.rows[0].unique_users,
        avg_transactions_per_user: metrics.rows[0].avg_transactions_per_user,
        median_transactions: metrics.rows[0].median_transactions,
        utilization_rate: (metrics.rows[0].unique_users / metrics.rows[0].total_beneficiaries * 100).toFixed(2)
      },
      geographic_distribution: metrics.rows[0].geographic_data,
      mcc_distribution: metrics.rows[0].mcc_data,
      hourly_pattern: metrics.rows[0].hourly_data,
      fraud_metrics: {
        high_risk_transactions: metrics.rows[0].high_risk_transactions,
        blocked_transactions: metrics.rows[0].blocked_transactions,
        blocked_amount: metrics.rows[0].blocked_amount
      }
    };

    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  async getComplianceMetrics(organizationId, dateRange = {}) {
    const { start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end_date = new Date() } = dateRange;

    const complianceData = await pool.query(`
      WITH kyc_metrics AS (
        SELECT
          COUNT(*) as total_verifications,
          COUNT(*) FILTER (WHERE verification_status = 'approved') as approved,
          COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected,
          COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_verification_time_hours
        FROM customer_verifications
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      transaction_monitoring AS (
        SELECT
          COUNT(*) as total_monitored,
          COUNT(*) FILTER (WHERE alert_generated = true) as alerts_generated,
          COUNT(DISTINCT CASE WHEN alert_generated = true THEN customer_id END) as unique_flagged_customers,
          COUNT(*) FILTER (WHERE sar_filed = true) as sars_filed,
          COUNT(*) FILTER (WHERE ctr_filed = true) as ctrs_filed
        FROM transaction_monitoring_logs
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      audit_trail AS (
        SELECT
          COUNT(*) as total_audit_entries,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) FILTER (WHERE action_type = 'data_export') as data_exports,
          COUNT(*) FILTER (WHERE action_type = 'permission_change') as permission_changes,
          COUNT(*) FILTER (WHERE action_type = 'compliance_override') as compliance_overrides
        FROM audit_logs
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      regulatory_reports AS (
        SELECT
          COUNT(*) as total_reports,
          COUNT(*) FILTER (WHERE report_type = 'CTR') as ctr_reports,
          COUNT(*) FILTER (WHERE report_type = 'SAR') as sar_reports,
          COUNT(*) FILTER (WHERE report_type = 'OFAC') as ofac_reports,
          COUNT(*) FILTER (WHERE submission_status = 'submitted') as submitted,
          COUNT(*) FILTER (WHERE submission_status = 'pending') as pending_submission
        FROM compliance_reports
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      )
      SELECT
        kyc_metrics.*,
        transaction_monitoring.*,
        audit_trail.*,
        regulatory_reports.*
      FROM kyc_metrics, transaction_monitoring, audit_trail, regulatory_reports
    `, [organizationId, start_date, end_date]);

    return {
      organization_id: organizationId,
      date_range: { start_date, end_date },
      kyc_compliance: {
        total_verifications: complianceData.rows[0].total_verifications,
        approved: complianceData.rows[0].approved,
        rejected: complianceData.rows[0].rejected,
        pending: complianceData.rows[0].pending,
        approval_rate: (complianceData.rows[0].approved / complianceData.rows[0].total_verifications * 100).toFixed(2),
        avg_verification_time_hours: complianceData.rows[0].avg_verification_time_hours
      },
      transaction_monitoring: {
        total_monitored: complianceData.rows[0].total_monitored,
        alerts_generated: complianceData.rows[0].alerts_generated,
        unique_flagged_customers: complianceData.rows[0].unique_flagged_customers,
        sars_filed: complianceData.rows[0].sars_filed,
        ctrs_filed: complianceData.rows[0].ctrs_filed,
        alert_rate: (complianceData.rows[0].alerts_generated / complianceData.rows[0].total_monitored * 100).toFixed(2)
      },
      audit_trail: {
        total_entries: complianceData.rows[0].total_audit_entries,
        unique_users: complianceData.rows[0].unique_users,
        data_exports: complianceData.rows[0].data_exports,
        permission_changes: complianceData.rows[0].permission_changes,
        compliance_overrides: complianceData.rows[0].compliance_overrides
      },
      regulatory_reports: {
        total_reports: complianceData.rows[0].total_reports,
        ctr_reports: complianceData.rows[0].ctr_reports,
        sar_reports: complianceData.rows[0].sar_reports,
        ofac_reports: complianceData.rows[0].ofac_reports,
        submitted: complianceData.rows[0].submitted,
        pending_submission: complianceData.rows[0].pending_submission
      }
    };
  }

  async getOperationalDashboard(organizationId) {
    const cacheKey = `operational:${organizationId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const operational = await pool.query(`
      WITH system_health AS (
        SELECT
          AVG(response_time_ms) as avg_response_time,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
          COUNT(*) FILTER (WHERE status_code >= 500) as server_errors,
          COUNT(*) as total_requests,
          (COUNT(*) FILTER (WHERE status_code < 400)::float / COUNT(*)::float * 100) as success_rate
        FROM api_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
      ),
      payment_rails AS (
        SELECT
          payment_rail,
          COUNT(*) as transaction_count,
          AVG(processing_time_ms) as avg_processing_time,
          SUM(amount) as total_volume,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions
        FROM payment_transactions
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        GROUP BY payment_rail
      ),
      card_metrics AS (
        SELECT
          COUNT(*) FILTER (WHERE card_status = 'active') as active_cards,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as cards_issued_today,
          COUNT(*) FILTER (WHERE card_type = 'virtual') as virtual_cards,
          COUNT(*) FILTER (WHERE card_type = 'physical') as physical_cards
        FROM cards
        WHERE organization_id = $1
      ),
      wallet_metrics AS (
        SELECT
          COUNT(*) FILTER (WHERE wallet_status = 'active') as active_wallets,
          SUM(balance) as total_balance,
          AVG(balance) as avg_balance,
          COUNT(*) FILTER (WHERE last_activity >= CURRENT_DATE - INTERVAL '7 days') as active_last_week
        FROM wallets
        WHERE organization_id = $1
      ),
      disbursement_queue AS (
        SELECT
          COUNT(*) FILTER (WHERE status = 'pending') as pending_disbursements,
          COUNT(*) FILTER (WHERE status = 'processing') as processing_disbursements,
          COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= CURRENT_DATE) as completed_today,
          SUM(amount) FILTER (WHERE status = 'pending') as pending_amount
        FROM benefit_disbursements
        WHERE organization_id = $1
      )
      SELECT
        system_health.*,
        (SELECT json_agg(row_to_json(payment_rails)) FROM payment_rails) as payment_rails_data,
        card_metrics.*,
        wallet_metrics.*,
        disbursement_queue.*
      FROM system_health, card_metrics, wallet_metrics, disbursement_queue
    `, [organizationId]);

    const result = {
      timestamp: new Date(),
      system_health: {
        avg_response_time: operational.rows[0].avg_response_time,
        p95_response_time: operational.rows[0].p95_response_time,
        server_errors: operational.rows[0].server_errors,
        total_requests: operational.rows[0].total_requests,
        success_rate: operational.rows[0].success_rate
      },
      payment_rails: operational.rows[0].payment_rails_data,
      cards: {
        active_cards: operational.rows[0].active_cards,
        cards_issued_today: operational.rows[0].cards_issued_today,
        virtual_cards: operational.rows[0].virtual_cards,
        physical_cards: operational.rows[0].physical_cards
      },
      wallets: {
        active_wallets: operational.rows[0].active_wallets,
        total_balance: operational.rows[0].total_balance,
        avg_balance: operational.rows[0].avg_balance,
        active_last_week: operational.rows[0].active_last_week
      },
      disbursements: {
        pending: operational.rows[0].pending_disbursements,
        processing: operational.rows[0].processing_disbursements,
        completed_today: operational.rows[0].completed_today,
        pending_amount: operational.rows[0].pending_amount
      }
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }

  async getExecutiveDashboard(organizationId, dateRange = {}) {
    const { start_date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            end_date = new Date() } = dateRange;

    const executive = await pool.query(`
      WITH revenue_metrics AS (
        SELECT
          SUM(transaction_fee) as total_revenue,
          SUM(transaction_fee) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
          SUM(transaction_fee) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as revenue_7d,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM transactions
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      growth_metrics AS (
        SELECT
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_customers_30d,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '90 days') as new_customers_90d,
          (
            SELECT COUNT(*)
            FROM customers
            WHERE organization_id = $1
              AND last_activity >= CURRENT_DATE - INTERVAL '30 days'
          ) as active_customers_30d
        FROM customers
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      program_adoption AS (
        SELECT
          program_type,
          COUNT(DISTINCT customer_id) as enrolled_users,
          SUM(current_balance) as total_balance,
          COUNT(*) FILTER (WHERE last_transaction >= CURRENT_DATE - INTERVAL '7 days') as active_users_7d
        FROM government_benefits
        WHERE organization_id = $1
          AND status = 'active'
        GROUP BY program_type
      ),
      cost_analysis AS (
        SELECT
          SUM(processing_cost) as total_costs,
          SUM(processing_cost) FILTER (WHERE payment_rail = 'ACH') as ach_costs,
          SUM(processing_cost) FILTER (WHERE payment_rail = 'WIRE') as wire_costs,
          SUM(processing_cost) FILTER (WHERE payment_rail = 'FedNow') as fednow_costs,
          SUM(processing_cost) FILTER (WHERE payment_rail = 'RTP') as rtp_costs
        FROM payment_transactions
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      ),
      compliance_summary AS (
        SELECT
          COUNT(*) FILTER (WHERE report_type = 'SAR') as total_sars,
          COUNT(*) FILTER (WHERE report_type = 'CTR') as total_ctrs,
          (
            SELECT COUNT(*)
            FROM customer_verifications
            WHERE organization_id = $1
              AND verification_status = 'pending'
          ) as pending_kyc
        FROM compliance_reports
        WHERE organization_id = $1
          AND created_at BETWEEN $2 AND $3
      )
      SELECT
        revenue_metrics.*,
        growth_metrics.*,
        (SELECT json_agg(row_to_json(program_adoption)) FROM program_adoption) as program_data,
        cost_analysis.*,
        compliance_summary.*,
        (revenue_metrics.total_revenue - cost_analysis.total_costs) as net_revenue,
        ((revenue_metrics.total_revenue - cost_analysis.total_costs) / revenue_metrics.total_revenue * 100) as margin_percentage
      FROM revenue_metrics, growth_metrics, cost_analysis, compliance_summary
    `, [organizationId, start_date, end_date]);

    return {
      organization_id: organizationId,
      date_range: { start_date, end_date },
      revenue: {
        total_revenue: executive.rows[0].total_revenue,
        revenue_30d: executive.rows[0].revenue_30d,
        revenue_7d: executive.rows[0].revenue_7d,
        unique_customers: executive.rows[0].unique_customers
      },
      growth: {
        new_customers_30d: executive.rows[0].new_customers_30d,
        new_customers_90d: executive.rows[0].new_customers_90d,
        active_customers_30d: executive.rows[0].active_customers_30d,
        customer_growth_rate: ((executive.rows[0].new_customers_30d / executive.rows[0].active_customers_30d) * 100).toFixed(2)
      },
      program_adoption: executive.rows[0].program_data,
      costs: {
        total_costs: executive.rows[0].total_costs,
        ach_costs: executive.rows[0].ach_costs,
        wire_costs: executive.rows[0].wire_costs,
        fednow_costs: executive.rows[0].fednow_costs,
        rtp_costs: executive.rows[0].rtp_costs
      },
      profitability: {
        net_revenue: executive.rows[0].net_revenue,
        margin_percentage: executive.rows[0].margin_percentage
      },
      compliance: {
        total_sars: executive.rows[0].total_sars,
        total_ctrs: executive.rows[0].total_ctrs,
        pending_kyc: executive.rows[0].pending_kyc
      }
    };
  }

  async generateCustomReport(reportConfig) {
    const {
      report_type,
      filters,
      grouping,
      metrics,
      format = 'json',
      organization_id
    } = reportConfig;

    let query = `
      SELECT
        ${metrics.map(m => this.buildMetricSQL(m)).join(', ')}
      FROM ${this.getTableForReportType(report_type)}
      WHERE organization_id = $1
    `;

    const params = [organization_id];
    let paramIndex = 2;

    if (filters && filters.length > 0) {
      const filterClauses = filters.map(filter => {
        params.push(filter.value);
        return `${filter.field} ${filter.operator} $${paramIndex++}`;
      });
      query += ` AND ${filterClauses.join(' AND ')}`;
    }

    if (grouping && grouping.length > 0) {
      query += ` GROUP BY ${grouping.join(', ')}`;
    }

    query += ` ORDER BY created_at DESC LIMIT 10000`;

    const result = await pool.query(query, params);

    switch (format) {
      case 'pdf':
        return await generatePDF(result.rows, reportConfig);
      case 'excel':
        return await generateExcel(result.rows, reportConfig);
      case 'csv':
        return await generateCSV(result.rows, reportConfig);
      default:
        return result.rows;
    }
  }

  buildMetricSQL(metric) {
    const aggregations = {
      count: 'COUNT(*)',
      sum: `SUM(${metric.field})`,
      avg: `AVG(${metric.field})`,
      min: `MIN(${metric.field})`,
      max: `MAX(${metric.field})`,
      distinct: `COUNT(DISTINCT ${metric.field})`
    };

    const sql = aggregations[metric.aggregation] || metric.field;
    return `${sql} as ${metric.alias || metric.field}`;
  }

  getTableForReportType(reportType) {
    const tableMap = {
      'benefits': 'government_benefits',
      'transactions': 'benefit_transactions',
      'disbursements': 'benefit_disbursements',
      'cards': 'cards',
      'wallets': 'wallets',
      'compliance': 'compliance_reports',
      'customers': 'customers'
    };

    return tableMap[reportType] || 'transactions';
  }

  async createReportSchedule(scheduleConfig) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(`
        INSERT INTO scheduled_reports (
          name, report_type, cron_expression, parameters,
          recipients, format, organization_id, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        scheduleConfig.name,
        scheduleConfig.report_type,
        scheduleConfig.cron_expression,
        JSON.stringify(scheduleConfig.parameters),
        JSON.stringify(scheduleConfig.recipients),
        scheduleConfig.format || 'pdf',
        scheduleConfig.organization_id,
        true
      ]);

      this.scheduleReport(result.rows[0]);

      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async distributeReport(report, recipients) {
    const promises = recipients.map(async (recipient) => {
      if (recipient.type === 'email') {
        await sendEmail({
          to: recipient.address,
          subject: `Scheduled Report: ${report.name}`,
          attachments: [{
            filename: `${report.name}_${new Date().toISOString()}.${report.format}`,
            content: report.data
          }]
        });
      } else if (recipient.type === 'webhook') {
        await fetch(recipient.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
      } else if (recipient.type === 'sftp') {
        await this.uploadToSFTP(recipient, report);
      }
    });

    await Promise.all(promises);
  }

  async getRealTimeDashboard(dashboardId) {
    const dashboard = await redis.get(`dashboard:realtime:${dashboardId}`);

    if (!dashboard) {
      const result = await pool.query(`
        SELECT * FROM benefit_dashboards
        WHERE id = $1 AND is_real_time = true
      `, [dashboardId]);

      if (result.rows.length === 0) {
        throw new Error('Dashboard not found');
      }

      return result.rows[0];
    }

    return JSON.parse(dashboard);
  }

  async updateDashboardWidget(dashboardId, widgetId, data) {
    const widgetKey = `widget:${dashboardId}:${widgetId}`;

    await redis.setex(widgetKey, 60, JSON.stringify({
      ...data,
      last_updated: new Date()
    }));

    await pool.query(`
      UPDATE dashboard_widgets
      SET
        last_data = $1,
        last_updated = CURRENT_TIMESTAMP
      WHERE dashboard_id = $2 AND id = $3
    `, [JSON.stringify(data), dashboardId, widgetId]);

    return { success: true, widget_id: widgetId };
  }

  async getAlertsDashboard(organizationId) {
    const alerts = await pool.query(`
      WITH recent_alerts AS (
        SELECT
          alert_type,
          severity,
          COUNT(*) as count,
          MAX(created_at) as latest
        FROM system_alerts
        WHERE organization_id = $1
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
          AND status = 'active'
        GROUP BY alert_type, severity
      ),
      fraud_alerts AS (
        SELECT
          COUNT(*) as total_fraud_alerts,
          SUM(amount) as flagged_amount
        FROM fraud_alerts
        WHERE organization_id = $1
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      ),
      compliance_alerts AS (
        SELECT
          COUNT(*) FILTER (WHERE alert_type = 'KYC_EXPIRED') as kyc_expired,
          COUNT(*) FILTER (WHERE alert_type = 'SUSPICIOUS_ACTIVITY') as suspicious_activity,
          COUNT(*) FILTER (WHERE alert_type = 'VELOCITY_BREACH') as velocity_breach,
          COUNT(*) FILTER (WHERE alert_type = 'SANCTIONS_HIT') as sanctions_hit
        FROM compliance_alerts
        WHERE organization_id = $1
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
      )
      SELECT
        (SELECT json_agg(row_to_json(recent_alerts)) FROM recent_alerts) as recent_alerts,
        fraud_alerts.*,
        compliance_alerts.*
      FROM fraud_alerts, compliance_alerts
    `, [organizationId]);

    return {
      timestamp: new Date(),
      recent_alerts: alerts.rows[0].recent_alerts,
      fraud: {
        total_alerts: alerts.rows[0].total_fraud_alerts,
        flagged_amount: alerts.rows[0].flagged_amount
      },
      compliance: {
        kyc_expired: alerts.rows[0].kyc_expired,
        suspicious_activity: alerts.rows[0].suspicious_activity,
        velocity_breach: alerts.rows[0].velocity_breach,
        sanctions_hit: alerts.rows[0].sanctions_hit
      }
    };
  }

  async exportDashboard(dashboardId, format = 'json') {
    const dashboard = await pool.query(`
      SELECT
        d.*,
        json_agg(dw.*) as widgets
      FROM benefit_dashboards d
      LEFT JOIN dashboard_widgets dw ON d.id = dw.dashboard_id
      WHERE d.id = $1
      GROUP BY d.id
    `, [dashboardId]);

    if (dashboard.rows.length === 0) {
      throw new Error('Dashboard not found');
    }

    const data = dashboard.rows[0];

    const widgetData = await Promise.all(
      data.widgets.map(async (widget) => {
        const metrics = await this.getWidgetData(widget);
        return {
          ...widget,
          data: metrics
        };
      })
    );

    const exportData = {
      ...data,
      widgets: widgetData,
      exported_at: new Date()
    };

    switch (format) {
      case 'pdf':
        return await generatePDF(exportData, { type: 'dashboard' });
      case 'html':
        return this.generateHTMLDashboard(exportData);
      default:
        return exportData;
    }
  }

  async getWidgetData(widget) {
    switch (widget.widget_type) {
      case 'metric':
        return await this.getMetricWidgetData(widget);
      case 'chart':
        return await this.getChartWidgetData(widget);
      case 'table':
        return await this.getTableWidgetData(widget);
      case 'map':
        return await this.getMapWidgetData(widget);
      default:
        return null;
    }
  }

  generateHTMLDashboard(data) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.name}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .widget { margin: 20px; padding: 15px; border: 1px solid #ddd; }
            .metric { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>${data.name}</h1>
          <p>${data.description}</p>
          ${data.widgets.map(w => this.renderWidget(w)).join('')}
          <footer>
            <p>Generated: ${new Date().toISOString()}</p>
          </footer>
        </body>
      </html>
    `;
  }

  renderWidget(widget) {
    switch (widget.widget_type) {
      case 'metric':
        return `
          <div class="widget">
            <h3>${widget.title}</h3>
            <div class="metric">${widget.data.value}</div>
            <p>${widget.data.change}% change</p>
          </div>
        `;
      case 'table':
        return `
          <div class="widget">
            <h3>${widget.title}</h3>
            <table>
              ${widget.data.headers.map(h => `<th>${h}</th>`).join('')}
              ${widget.data.rows.map(r => `
                <tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>
              `).join('')}
            </table>
          </div>
        `;
      default:
        return `<div class="widget"><h3>${widget.title}</h3></div>`;
    }
  }
}

module.exports = new BenefitReportingDashboards();