const pool = require('../models');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ComplianceReportingSystem extends EventEmitter {
  constructor() {
    super();
    this.reportQueue = [];
    this.scheduledReports = new Map();
    this.reportTemplates = new Map();
    this.isProcessing = false;
    this.reportStorage = process.env.REPORT_STORAGE_PATH || '/tmp/compliance-reports';
  }

  /**
   * Initialize Compliance Reporting System
   */
  async initialize() {
    console.log('Initializing Compliance Reporting System...');

    // Create report storage directory
    await this.ensureReportDirectory();

    // Load report templates
    await this.loadReportTemplates();

    // Schedule required reports
    await this.scheduleRequiredReports();

    // Start report processor
    this.startReportProcessor();

    console.log('Compliance Reporting System initialized');
  }

  /**
   * Generate compliance report
   */
  async generateReport(reportType, parameters = {}) {
    const reportId = this.generateReportId();
    const startTime = Date.now();

    try {
      console.log(`Generating ${reportType} report...`);

      let reportData;
      let reportMetadata;

      switch (reportType) {
        case 'GENIUS_ACT_COMPLIANCE':
          reportData = await this.generateGENIUSActReport(parameters);
          break;

        case 'GOVERNMENT_BENEFITS_USAGE':
          reportData = await this.generateBenefitsUsageReport(parameters);
          break;

        case 'TRANSACTION_MONITORING':
          reportData = await this.generateTransactionMonitoringReport(parameters);
          break;

        case 'FRAUD_DETECTION':
          reportData = await this.generateFraudReport(parameters);
          break;

        case 'AML_COMPLIANCE':
          reportData = await this.generateAMLReport(parameters);
          break;

        case 'CTR_FILING':
          reportData = await this.generateCTRReport(parameters);
          break;

        case 'SAR_FILING':
          reportData = await this.generateSARReport(parameters);
          break;

        case 'PROGRAM_COMPLIANCE':
          reportData = await this.generateProgramComplianceReport(parameters);
          break;

        case 'AUDIT_TRAIL':
          reportData = await this.generateAuditReport(parameters);
          break;

        case 'REGULATORY_SUBMISSION':
          reportData = await this.generateRegulatorySubmission(parameters);
          break;

        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Format report
      const formattedReport = await this.formatReport(reportType, reportData);

      // Generate report file
      const reportFile = await this.saveReport(reportId, reportType, formattedReport);

      // Store report metadata
      reportMetadata = await this.storeReportMetadata(
        reportId,
        reportType,
        parameters,
        reportFile,
        Date.now() - startTime
      );

      // Emit report generated event
      this.emit('report_generated', {
        report_id: reportId,
        report_type: reportType,
        file_path: reportFile,
        generation_time: Date.now() - startTime
      });

      return {
        success: true,
        report_id: reportId,
        report_type: reportType,
        file_path: reportFile,
        metadata: reportMetadata,
        generation_time: Date.now() - startTime
      };

    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);

      // Log failed report
      await this.logFailedReport(reportId, reportType, error);

      return {
        success: false,
        report_id: reportId,
        report_type: reportType,
        error: error.message
      };
    }
  }

  /**
   * Generate GENIUS Act Compliance Report
   */
  async generateGENIUSActReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        compliance_status: 'COMPLIANT',
        instant_payment_metrics: {},
        digital_identity_metrics: {},
        emergency_disbursement_metrics: {},
        program_coverage: {},
        issues: [],
        recommendations: []
      };

      // Instant Payment Metrics
      const instantPayments = await client.query(
        `SELECT
          COUNT(*) as total_payments,
          COUNT(*) FILTER (WHERE processing_time_ms < 1000) as instant_payments,
          AVG(processing_time_ms) as avg_processing_time,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_processing_time,
          COUNT(*) FILTER (WHERE payment_rail = 'RTP') as rtp_payments,
          COUNT(*) FILTER (WHERE payment_rail = 'FEDNOW') as fednow_payments
         FROM benefit_transactions
         WHERE transaction_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.instant_payment_metrics = {
        total_payments: instantPayments.rows[0].total_payments,
        instant_payments: instantPayments.rows[0].instant_payments,
        instant_payment_rate: (instantPayments.rows[0].instant_payments /
                              instantPayments.rows[0].total_payments * 100).toFixed(2) + '%',
        avg_processing_time_ms: instantPayments.rows[0].avg_processing_time,
        p95_processing_time_ms: instantPayments.rows[0].p95_processing_time,
        payment_rails: {
          rtp: instantPayments.rows[0].rtp_payments,
          fednow: instantPayments.rows[0].fednow_payments
        }
      };

      // Digital Identity Verification Metrics
      const identityMetrics = await client.query(
        `SELECT
          COUNT(*) as total_verifications,
          COUNT(*) FILTER (WHERE verification_method = 'LOGIN_GOV') as login_gov,
          COUNT(*) FILTER (WHERE verification_method = 'ID_ME') as id_me,
          COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') as verified,
          AVG(EXTRACT(EPOCH FROM (verified_at - created_at))) as avg_verification_time
         FROM customer_verifications
         WHERE created_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.digital_identity_metrics = {
        total_verifications: identityMetrics.rows[0].total_verifications,
        verification_methods: {
          login_gov: identityMetrics.rows[0].login_gov,
          id_me: identityMetrics.rows[0].id_me
        },
        verification_rate: (identityMetrics.rows[0].verified /
                           identityMetrics.rows[0].total_verifications * 100).toFixed(2) + '%',
        avg_verification_time_seconds: identityMetrics.rows[0].avg_verification_time
      };

      // Emergency Disbursement Metrics
      const emergencyMetrics = await client.query(
        `SELECT
          COUNT(*) as total_emergency,
          COUNT(*) FILTER (WHERE processing_time_ms < 60000) as within_1_minute,
          AVG(amount) as avg_amount,
          SUM(amount) as total_amount,
          ARRAY_AGG(DISTINCT emergency_type) as emergency_types
         FROM benefit_disbursements
         WHERE disbursement_type = 'EMERGENCY'
           AND issued_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.emergency_disbursement_metrics = {
        total_disbursements: emergencyMetrics.rows[0].total_emergency,
        within_sla: emergencyMetrics.rows[0].within_1_minute,
        sla_compliance: (emergencyMetrics.rows[0].within_1_minute /
                        emergencyMetrics.rows[0].total_emergency * 100).toFixed(2) + '%',
        avg_amount: emergencyMetrics.rows[0].avg_amount,
        total_amount: emergencyMetrics.rows[0].total_amount,
        emergency_types: emergencyMetrics.rows[0].emergency_types
      };

      // Program Coverage
      const programCoverage = await client.query(
        `SELECT
          program_type,
          COUNT(DISTINCT user_id) as enrolled_users,
          COUNT(*) as transactions,
          SUM(balance_amount) as total_balance
         FROM government_benefits
         WHERE created_at <= $2
           AND (status = 'ACTIVE' OR status = 'COMPLETED')
         GROUP BY program_type`,
        [end_date]
      );

      reportData.program_coverage = programCoverage.rows.reduce((acc, row) => {
        acc[row.program_type] = {
          enrolled_users: row.enrolled_users,
          transactions: row.transactions,
          total_balance: row.total_balance
        };
        return acc;
      }, {});

      // Compliance Issues
      const issues = await client.query(
        `SELECT
          issue_type,
          COUNT(*) as count,
          AVG(resolution_time_hours) as avg_resolution_time
         FROM compliance_issues
         WHERE detected_at BETWEEN $1 AND $2
         GROUP BY issue_type`,
        [start_date, end_date]
      );

      reportData.issues = issues.rows;

      // Generate recommendations
      reportData.recommendations = this.generateGENIUSRecommendations(reportData);

      // Determine compliance status
      const instantRate = parseFloat(reportData.instant_payment_metrics.instant_payment_rate);
      const verificationRate = parseFloat(reportData.digital_identity_metrics.verification_rate);
      const emergencySLA = parseFloat(reportData.emergency_disbursement_metrics.sla_compliance);

      if (instantRate < 95 || verificationRate < 98 || emergencySLA < 99) {
        reportData.compliance_status = 'NEEDS_IMPROVEMENT';
      }

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Government Benefits Usage Report
   */
  async generateBenefitsUsageReport(parameters) {
    const { start_date, end_date, program_type } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        program_type: program_type || 'ALL',
        enrollment_metrics: {},
        usage_metrics: {},
        disbursement_metrics: {},
        compliance_metrics: {},
        fraud_metrics: {}
      };

      // Build program filter
      const programFilter = program_type ? 'AND program_type = $3' : '';
      const queryParams = program_type ?
        [start_date, end_date, program_type] :
        [start_date, end_date];

      // Enrollment metrics
      const enrollment = await client.query(
        `SELECT
          COUNT(DISTINCT user_id) as total_enrolled,
          COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') as verified,
          COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
          COUNT(*) FILTER (WHERE created_at BETWEEN $1 AND $2) as new_enrollments
         FROM government_benefits
         WHERE created_at <= $2 ${programFilter}`,
        queryParams
      );

      reportData.enrollment_metrics = enrollment.rows[0];

      // Usage metrics
      const usage = await client.query(
        `SELECT
          COUNT(*) as total_transactions,
          COUNT(DISTINCT gb.user_id) as active_users,
          SUM(bt.amount) as total_spent,
          AVG(bt.amount) as avg_transaction,
          COUNT(DISTINCT DATE_TRUNC('day', bt.transaction_date)) as active_days,
          COUNT(DISTINCT bt.merchant_info->>'merchant_id') as unique_merchants
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE bt.transaction_date BETWEEN $1 AND $2 ${programFilter}`,
        queryParams
      );

      reportData.usage_metrics = usage.rows[0];

      // Disbursement metrics
      const disbursements = await client.query(
        `SELECT
          COUNT(*) as total_disbursements,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount,
          COUNT(DISTINCT benefit_id) as beneficiaries,
          COUNT(*) FILTER (WHERE disbursement_type = 'REGULAR') as regular,
          COUNT(*) FILTER (WHERE disbursement_type = 'EMERGENCY') as emergency
         FROM benefit_disbursements bd
         JOIN government_benefits gb ON bd.benefit_id = gb.id
         WHERE bd.issued_at BETWEEN $1 AND $2 ${programFilter}`,
        queryParams
      );

      reportData.disbursement_metrics = disbursements.rows[0];

      // Compliance metrics by MCC
      const mccCompliance = await client.query(
        `SELECT
          bt.mcc_code,
          mc.description as mcc_description,
          COUNT(*) as transaction_count,
          SUM(bt.amount) as total_amount,
          COUNT(*) FILTER (WHERE bt.status = 'BLOCKED') as blocked_count
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         LEFT JOIN mcc_codes mc ON bt.mcc_code = mc.mcc_code
         WHERE bt.transaction_date BETWEEN $1 AND $2 ${programFilter}
         GROUP BY bt.mcc_code, mc.description
         ORDER BY transaction_count DESC
         LIMIT 20`,
        queryParams
      );

      reportData.compliance_metrics.mcc_distribution = mccCompliance.rows;

      // Fraud metrics
      const fraud = await client.query(
        `SELECT
          COUNT(*) as total_flagged,
          COUNT(*) FILTER (WHERE recommended_action = 'BLOCK') as blocked,
          COUNT(*) FILTER (WHERE recommended_action = 'REVIEW') as under_review,
          AVG(fraud_score) as avg_fraud_score,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY fraud_score) as p95_fraud_score
         FROM fraud_detection_results fdr
         JOIN benefit_transactions bt ON fdr.transaction_id = bt.id
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE fdr.detected_at BETWEEN $1 AND $2 ${programFilter}`,
        queryParams
      );

      reportData.fraud_metrics = fraud.rows[0];

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Transaction Monitoring Report
   */
  async generateTransactionMonitoringReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        monitoring_summary: {},
        alerts: {},
        risk_distribution: {},
        suspicious_activities: [],
        actions_taken: {}
      };

      // Monitoring summary
      const summary = await client.query(
        `SELECT
          COUNT(*) as total_monitored,
          AVG(risk_score) as avg_risk_score,
          COUNT(*) FILTER (WHERE risk_score >= 80) as high_risk,
          COUNT(*) FILTER (WHERE risk_score >= 60 AND risk_score < 80) as medium_risk,
          COUNT(*) FILTER (WHERE risk_score >= 30 AND risk_score < 60) as low_risk,
          COUNT(*) FILTER (WHERE alerts IS NOT NULL) as with_alerts
         FROM transaction_monitoring_results
         WHERE monitored_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.monitoring_summary = summary.rows[0];

      // Alert breakdown
      const alerts = await client.query(
        `SELECT
          alert_level,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'OPEN') as open,
          COUNT(*) FILTER (WHERE status = 'CLOSED') as closed,
          COUNT(*) FILTER (WHERE auto_action = 'BLOCK') as blocked,
          COUNT(*) FILTER (WHERE auto_action = 'HOLD') as held
         FROM monitoring_alerts
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY alert_level`,
        [start_date, end_date]
      );

      reportData.alerts = alerts.rows.reduce((acc, row) => {
        acc[row.alert_level] = row;
        return acc;
      }, {});

      // Risk distribution
      const riskDist = await client.query(
        `SELECT
          WIDTH_BUCKET(risk_score, 0, 100, 10) as risk_bucket,
          COUNT(*) as count,
          AVG(risk_score) as avg_score
         FROM transaction_monitoring_results
         WHERE monitored_at BETWEEN $1 AND $2
         GROUP BY risk_bucket
         ORDER BY risk_bucket`,
        [start_date, end_date]
      );

      reportData.risk_distribution = riskDist.rows;

      // Top suspicious activities
      const suspicious = await client.query(
        `SELECT
          tmr.transaction_id,
          tmr.risk_score,
          tmr.checks,
          bt.amount,
          bt.merchant_info,
          gb.program_type,
          u.email
         FROM transaction_monitoring_results tmr
         JOIN benefit_transactions bt ON tmr.transaction_id = bt.id
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         JOIN users u ON gb.user_id = u.id
         WHERE tmr.monitored_at BETWEEN $1 AND $2
           AND tmr.risk_score >= 70
         ORDER BY tmr.risk_score DESC
         LIMIT 50`,
        [start_date, end_date]
      );

      reportData.suspicious_activities = suspicious.rows;

      // Actions taken
      const actions = await client.query(
        `SELECT
          actions->0 as action,
          COUNT(*) as count
         FROM transaction_monitoring_results
         WHERE monitored_at BETWEEN $1 AND $2
           AND actions IS NOT NULL
         GROUP BY actions->0`,
        [start_date, end_date]
      );

      reportData.actions_taken = actions.rows.reduce((acc, row) => {
        acc[row.action] = row.count;
        return acc;
      }, {});

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Fraud Report
   */
  async generateFraudReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        fraud_summary: {},
        pattern_analysis: {},
        fraud_by_program: {},
        fraud_losses: {},
        recovery_efforts: {}
      };

      // Fraud summary
      const summary = await client.query(
        `SELECT
          COUNT(*) as total_detected,
          AVG(fraud_score) as avg_fraud_score,
          COUNT(*) FILTER (WHERE recommended_action = 'BLOCK') as blocked,
          COUNT(*) FILTER (WHERE recommended_action = 'REVIEW') as reviewed,
          COUNT(DISTINCT transaction_id) as unique_transactions
         FROM fraud_detection_results
         WHERE detected_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.fraud_summary = summary.rows[0];

      // Pattern analysis
      const patterns = await client.query(
        `SELECT
          jsonb_array_elements(patterns_matched)->>'pattern_name' as pattern,
          COUNT(*) as occurrences,
          AVG(fraud_score) as avg_score
         FROM fraud_detection_results
         WHERE detected_at BETWEEN $1 AND $2
           AND patterns_matched IS NOT NULL
         GROUP BY pattern
         ORDER BY occurrences DESC`,
        [start_date, end_date]
      );

      reportData.pattern_analysis = patterns.rows;

      // Fraud by program
      const byProgram = await client.query(
        `SELECT
          gb.program_type,
          COUNT(fdr.id) as fraud_count,
          SUM(bt.amount) as potential_loss,
          AVG(fdr.fraud_score) as avg_score
         FROM fraud_detection_results fdr
         JOIN benefit_transactions bt ON fdr.transaction_id = bt.id
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE fdr.detected_at BETWEEN $1 AND $2
         GROUP BY gb.program_type`,
        [start_date, end_date]
      );

      reportData.fraud_by_program = byProgram.rows;

      // Fraud losses
      const losses = await client.query(
        `SELECT
          SUM(amount) FILTER (WHERE status = 'COMPLETED') as actual_losses,
          SUM(amount) FILTER (WHERE status = 'BLOCKED') as prevented_losses,
          COUNT(*) FILTER (WHERE status = 'COMPLETED') as successful_frauds,
          COUNT(*) FILTER (WHERE status = 'BLOCKED') as prevented_frauds
         FROM benefit_transactions bt
         JOIN fraud_detection_results fdr ON bt.id = fdr.transaction_id
         WHERE fdr.detected_at BETWEEN $1 AND $2
           AND fdr.fraud_score >= 70`,
        [start_date, end_date]
      );

      reportData.fraud_losses = losses.rows[0];

      // Recovery efforts
      const recovery = await client.query(
        `SELECT
          COUNT(*) as total_cases,
          SUM(amount_recovered) as total_recovered,
          AVG(EXTRACT(DAYS FROM (recovered_at - initiated_at))) as avg_recovery_days
         FROM fraud_recovery_cases
         WHERE initiated_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.recovery_efforts = recovery.rows[0];

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate AML Report
   */
  async generateAMLReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        aml_summary: {},
        sanctions_screening: {},
        pep_screening: {},
        high_risk_countries: {},
        suspicious_patterns: []
      };

      // AML summary
      const summary = await client.query(
        `SELECT
          COUNT(*) as total_checks,
          COUNT(*) FILTER (WHERE check_result = 'PASS') as passed,
          COUNT(*) FILTER (WHERE check_result = 'FAIL') as failed,
          COUNT(*) FILTER (WHERE check_result = 'REVIEW') as review_required
         FROM aml_checks
         WHERE check_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.aml_summary = summary.rows[0];

      // Sanctions screening
      const sanctions = await client.query(
        `SELECT
          list_name,
          COUNT(*) as matches,
          COUNT(DISTINCT entity_id) as unique_entities
         FROM sanctions_screening_results
         WHERE screening_date BETWEEN $1 AND $2
           AND match_found = true
         GROUP BY list_name`,
        [start_date, end_date]
      );

      reportData.sanctions_screening = sanctions.rows;

      // High risk countries
      const countries = await client.query(
        `SELECT
          country_code,
          country_name,
          COUNT(*) as transactions,
          SUM(amount) as total_amount,
          AVG(risk_score) as avg_risk
         FROM high_risk_country_transactions
         WHERE transaction_date BETWEEN $1 AND $2
         GROUP BY country_code, country_name
         ORDER BY transactions DESC`,
        [start_date, end_date]
      );

      reportData.high_risk_countries = countries.rows;

      // Suspicious patterns
      const patterns = await client.query(
        `SELECT
          pattern_type,
          pattern_description,
          COUNT(*) as occurrences,
          ARRAY_AGG(DISTINCT user_id) as users_involved
         FROM aml_suspicious_patterns
         WHERE detected_at BETWEEN $1 AND $2
         GROUP BY pattern_type, pattern_description
         ORDER BY occurrences DESC
         LIMIT 20`,
        [start_date, end_date]
      );

      reportData.suspicious_patterns = patterns.rows;

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate CTR Report
   */
  async generateCTRReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        ctr_summary: {},
        transactions: [],
        filing_status: {}
      };

      // CTR summary
      const summary = await client.query(
        `SELECT
          COUNT(*) as total_ctrs,
          SUM(amount) as total_amount,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) FILTER (WHERE filed = true) as filed,
          COUNT(*) FILTER (WHERE filed = false) as pending_filing
         FROM ctr_reports
         WHERE transaction_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.ctr_summary = summary.rows[0];

      // CTR transactions
      const transactions = await client.query(
        `SELECT
          ctr.*,
          u.first_name,
          u.last_name,
          u.ssn_last_four,
          bt.merchant_info
         FROM ctr_reports ctr
         JOIN users u ON ctr.user_id = u.id
         LEFT JOIN benefit_transactions bt ON ctr.transaction_id = bt.id
         WHERE ctr.transaction_date BETWEEN $1 AND $2
           AND ctr.amount >= 10000
         ORDER BY ctr.transaction_date DESC`,
        [start_date, end_date]
      );

      reportData.transactions = transactions.rows.map(t => ({
        ...t,
        // Mask sensitive data
        ssn_last_four: '***-**-' + t.ssn_last_four
      }));

      // Filing status
      const filing = await client.query(
        `SELECT
          filing_status,
          COUNT(*) as count,
          AVG(EXTRACT(HOURS FROM (filed_at - transaction_date))) as avg_filing_time_hours
         FROM ctr_reports
         WHERE transaction_date BETWEEN $1 AND $2
         GROUP BY filing_status`,
        [start_date, end_date]
      );

      reportData.filing_status = filing.rows;

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate SAR Report
   */
  async generateSARReport(parameters) {
    const { start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        sar_summary: {},
        triggers: {},
        narratives: [],
        filing_metrics: {}
      };

      // SAR summary
      const summary = await client.query(
        `SELECT
          COUNT(*) as total_sars,
          COUNT(*) FILTER (WHERE filed = true) as filed,
          COUNT(*) FILTER (WHERE filed = false) as pending,
          COUNT(DISTINCT user_id) as unique_subjects,
          SUM(suspicious_amount) as total_suspicious_amount
         FROM sar_reports
         WHERE created_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.sar_summary = summary.rows[0];

      // SAR triggers
      const triggers = await client.query(
        `SELECT
          trigger_type,
          COUNT(*) as count,
          AVG(confidence_score) as avg_confidence
         FROM sar_triggers
         WHERE detected_at BETWEEN $1 AND $2
         GROUP BY trigger_type
         ORDER BY count DESC`,
        [start_date, end_date]
      );

      reportData.triggers = triggers.rows;

      // SAR narratives (sanitized)
      const narratives = await client.query(
        `SELECT
          sar_id,
          subject_type,
          activity_type,
          SUBSTRING(narrative, 1, 200) as narrative_excerpt,
          filing_date
         FROM sar_reports
         WHERE created_at BETWEEN $1 AND $2
           AND filed = true
         ORDER BY filing_date DESC
         LIMIT 20`,
        [start_date, end_date]
      );

      reportData.narratives = narratives.rows;

      // Filing metrics
      const metrics = await client.query(
        `SELECT
          AVG(EXTRACT(DAYS FROM (filed_at - created_at))) as avg_filing_time_days,
          MIN(EXTRACT(DAYS FROM (filed_at - created_at))) as min_filing_time_days,
          MAX(EXTRACT(DAYS FROM (filed_at - created_at))) as max_filing_time_days,
          COUNT(*) FILTER (WHERE EXTRACT(DAYS FROM (filed_at - created_at)) <= 30) as within_deadline
         FROM sar_reports
         WHERE filed_at BETWEEN $1 AND $2`,
        [start_date, end_date]
      );

      reportData.filing_metrics = metrics.rows[0];

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Program Compliance Report
   */
  async generateProgramComplianceReport(parameters) {
    const { program_type, start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        program: program_type,
        compliance_metrics: {},
        violations: [],
        mcc_compliance: {},
        eligibility_compliance: {},
        disbursement_compliance: {}
      };

      // Overall compliance metrics
      const metrics = await client.query(
        `SELECT
          COUNT(*) as total_transactions,
          COUNT(*) FILTER (WHERE compliance_check = 'PASS') as compliant,
          COUNT(*) FILTER (WHERE compliance_check = 'FAIL') as non_compliant,
          COUNT(*) FILTER (WHERE compliance_check = 'REVIEW') as under_review
         FROM benefit_transaction_compliance
         WHERE program_type = $1
           AND check_date BETWEEN $2 AND $3`,
        [program_type, start_date, end_date]
      );

      reportData.compliance_metrics = metrics.rows[0];

      // Violations
      const violations = await client.query(
        `SELECT
          violation_type,
          COUNT(*) as count,
          SUM(amount) as total_amount,
          ARRAY_AGG(DISTINCT user_id) as users_involved
         FROM compliance_violations
         WHERE program_type = $1
           AND violation_date BETWEEN $2 AND $3
         GROUP BY violation_type
         ORDER BY count DESC`,
        [program_type, start_date, end_date]
      );

      reportData.violations = violations.rows;

      // MCC compliance
      const mccCompliance = await client.query(
        `SELECT
          mcc_code,
          mcc_description,
          COUNT(*) as transactions,
          COUNT(*) FILTER (WHERE allowed = false) as blocked,
          SUM(amount) as total_amount
         FROM mcc_compliance_checks
         WHERE program_type = $1
           AND check_date BETWEEN $2 AND $3
         GROUP BY mcc_code, mcc_description
         ORDER BY transactions DESC`,
        [program_type, start_date, end_date]
      );

      reportData.mcc_compliance = mccCompliance.rows;

      // Eligibility compliance
      const eligibility = await client.query(
        `SELECT
          COUNT(*) as total_checks,
          COUNT(*) FILTER (WHERE eligible = true) as eligible,
          COUNT(*) FILTER (WHERE eligible = false) as ineligible,
          ARRAY_AGG(DISTINCT ineligible_reason) as ineligible_reasons
         FROM eligibility_checks
         WHERE program_type = $1
           AND check_date BETWEEN $2 AND $3`,
        [program_type, start_date, end_date]
      );

      reportData.eligibility_compliance = eligibility.rows[0];

      // Disbursement compliance
      const disbursement = await client.query(
        `SELECT
          COUNT(*) as total_disbursements,
          AVG(amount) as avg_amount,
          COUNT(*) FILTER (WHERE amount > max_allowed) as over_limit,
          COUNT(*) FILTER (WHERE frequency_violation = true) as frequency_violations
         FROM disbursement_compliance
         WHERE program_type = $1
           AND disbursement_date BETWEEN $2 AND $3`,
        [program_type, start_date, end_date]
      );

      reportData.disbursement_compliance = disbursement.rows[0];

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Audit Report
   */
  async generateAuditReport(parameters) {
    const { entity_type, entity_id, start_date, end_date } = parameters;
    const client = await pool.connect();

    try {
      const reportData = {
        report_date: new Date(),
        period: { start_date, end_date },
        entity: { type: entity_type, id: entity_id },
        audit_trail: [],
        changes: {},
        access_logs: [],
        compliance_actions: []
      };

      // Audit trail
      const auditTrail = await client.query(
        `SELECT
          *
         FROM audit_logs
         WHERE entity_type = $1
           AND entity_id = $2
           AND created_at BETWEEN $3 AND $4
         ORDER BY created_at DESC`,
        [entity_type, entity_id, start_date, end_date]
      );

      reportData.audit_trail = auditTrail.rows;

      // Changes summary
      const changes = await client.query(
        `SELECT
          action,
          COUNT(*) as count,
          COUNT(DISTINCT user_id) as unique_users
         FROM audit_logs
         WHERE entity_type = $1
           AND entity_id = $2
           AND created_at BETWEEN $3 AND $4
         GROUP BY action`,
        [entity_type, entity_id, start_date, end_date]
      );

      reportData.changes = changes.rows.reduce((acc, row) => {
        acc[row.action] = {
          count: row.count,
          unique_users: row.unique_users
        };
        return acc;
      }, {});

      // Access logs
      const accessLogs = await client.query(
        `SELECT
          user_id,
          COUNT(*) as access_count,
          MIN(accessed_at) as first_access,
          MAX(accessed_at) as last_access
         FROM access_logs
         WHERE resource_type = $1
           AND resource_id = $2
           AND accessed_at BETWEEN $3 AND $4
         GROUP BY user_id
         ORDER BY access_count DESC`,
        [entity_type, entity_id, start_date, end_date]
      );

      reportData.access_logs = accessLogs.rows;

      // Compliance actions
      const complianceActions = await client.query(
        `SELECT
          action_type,
          action_details,
          performed_by,
          performed_at
         FROM compliance_actions
         WHERE entity_type = $1
           AND entity_id = $2
           AND performed_at BETWEEN $3 AND $4
         ORDER BY performed_at DESC`,
        [entity_type, entity_id, start_date, end_date]
      );

      reportData.compliance_actions = complianceActions.rows;

      return reportData;

    } finally {
      client.release();
    }
  }

  /**
   * Generate Regulatory Submission
   */
  async generateRegulatorySubmission(parameters) {
    const { regulator, submission_type, period } = parameters;
    const reportData = {
      submission_date: new Date(),
      regulator,
      submission_type,
      period,
      sections: {}
    };

    switch (regulator) {
      case 'FINCEN':
        reportData.sections = await this.generateFinCENSubmission(submission_type, period);
        break;

      case 'STATE_REGULATOR':
        reportData.sections = await this.generateStateSubmission(submission_type, period);
        break;

      case 'FTC':
        reportData.sections = await this.generateFTCSubmission(submission_type, period);
        break;

      case 'CFPB':
        reportData.sections = await this.generateCFPBSubmission(submission_type, period);
        break;

      default:
        throw new Error(`Unknown regulator: ${regulator}`);
    }

    return reportData;
  }

  /**
   * Generate GENIUS recommendations
   */
  generateGENIUSRecommendations(data) {
    const recommendations = [];

    // Check instant payment performance
    const instantRate = parseFloat(data.instant_payment_metrics.instant_payment_rate);
    if (instantRate < 95) {
      recommendations.push({
        area: 'INSTANT_PAYMENTS',
        priority: 'HIGH',
        recommendation: `Increase instant payment adoption to meet 95% target (current: ${instantRate}%)`,
        actions: [
          'Expand RTP network connectivity',
          'Implement FedNow for all eligible transactions',
          'Optimize payment routing logic'
        ]
      });
    }

    // Check identity verification
    const verificationRate = parseFloat(data.digital_identity_metrics.verification_rate);
    if (verificationRate < 98) {
      recommendations.push({
        area: 'DIGITAL_IDENTITY',
        priority: 'HIGH',
        recommendation: `Improve identity verification success rate (current: ${verificationRate}%)`,
        actions: [
          'Add fallback verification methods',
          'Improve user guidance during verification',
          'Implement progressive KYC'
        ]
      });
    }

    // Check emergency disbursement SLA
    const emergencySLA = parseFloat(data.emergency_disbursement_metrics.sla_compliance);
    if (emergencySLA < 99) {
      recommendations.push({
        area: 'EMERGENCY_DISBURSEMENTS',
        priority: 'CRITICAL',
        recommendation: `Improve emergency disbursement SLA compliance (current: ${emergencySLA}%)`,
        actions: [
          'Implement pre-authorization for emergency cases',
          'Establish dedicated emergency processing queue',
          'Add automated approval for qualified cases'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Format report
   */
  async formatReport(reportType, data) {
    const template = this.reportTemplates.get(reportType) || this.getDefaultTemplate();

    // Apply template formatting
    let formatted = {
      header: {
        title: `${reportType.replace(/_/g, ' ')} REPORT`,
        generated_at: new Date().toISOString(),
        report_id: this.generateReportId(),
        classification: 'CONFIDENTIAL'
      },
      executive_summary: this.generateExecutiveSummary(reportType, data),
      body: data,
      footer: {
        disclaimer: 'This report contains confidential information and should be handled accordingly.',
        generated_by: 'Monay Compliance Reporting System',
        version: '1.0.0'
      }
    };

    // Convert to specified format (JSON, CSV, PDF, etc.)
    if (template.format === 'CSV') {
      formatted = this.convertToCSV(formatted);
    } else if (template.format === 'PDF') {
      formatted = await this.convertToPDF(formatted);
    }

    return formatted;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(reportType, data) {
    let summary = '';

    switch (reportType) {
      case 'GENIUS_ACT_COMPLIANCE':
        summary = `Compliance Status: ${data.compliance_status}. ` +
                 `Instant payment rate: ${data.instant_payment_metrics.instant_payment_rate}. ` +
                 `Digital identity verification rate: ${data.digital_identity_metrics.verification_rate}. ` +
                 `Emergency disbursement SLA: ${data.emergency_disbursement_metrics.sla_compliance}.`;
        break;

      case 'FRAUD_DETECTION':
        summary = `Total fraud cases detected: ${data.fraud_summary.total_detected}. ` +
                 `Blocked transactions: ${data.fraud_summary.blocked}. ` +
                 `Prevented losses: $${data.fraud_losses.prevented_losses}.`;
        break;

      default:
        summary = 'Report generated successfully with all required metrics.';
    }

    return summary;
  }

  /**
   * Save report to file
   */
  async saveReport(reportId, reportType, content) {
    const filename = `${reportType}_${reportId}_${Date.now()}.json`;
    const filepath = path.join(this.reportStorage, filename);

    await fs.writeFile(filepath, JSON.stringify(content, null, 2));

    return filepath;
  }

  /**
   * Store report metadata
   */
  async storeReportMetadata(reportId, reportType, parameters, filepath, generationTime) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO compliance_reports
         (report_id, report_type, parameters, file_path, generation_time_ms,
          generated_at, generated_by)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         RETURNING *`,
        [reportId, reportType, parameters, filepath, generationTime, 'SYSTEM']
      );

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  /**
   * Log failed report
   */
  async logFailedReport(reportId, reportType, error) {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO failed_reports
         (report_id, report_type, error_message, failed_at)
         VALUES ($1, $2, $3, NOW())`,
        [reportId, reportType, error.message]
      );

    } finally {
      client.release();
    }
  }

  /**
   * Load report templates
   */
  async loadReportTemplates() {
    // Define standard templates
    this.reportTemplates.set('GENIUS_ACT_COMPLIANCE', {
      format: 'JSON',
      sections: ['summary', 'metrics', 'compliance', 'recommendations'],
      frequency: 'DAILY'
    });

    this.reportTemplates.set('CTR_FILING', {
      format: 'XML',
      sections: ['header', 'transactions', 'filing_info'],
      frequency: 'AS_NEEDED'
    });

    this.reportTemplates.set('SAR_FILING', {
      format: 'XML',
      sections: ['header', 'suspicious_activity', 'narrative', 'filing_info'],
      frequency: 'AS_NEEDED'
    });

    console.log(`Loaded ${this.reportTemplates.size} report templates`);
  }

  /**
   * Schedule required reports
   */
  async scheduleRequiredReports() {
    // Schedule daily GENIUS Act compliance report
    this.scheduleReport('GENIUS_ACT_COMPLIANCE', '0 2 * * *', {});

    // Schedule weekly benefits usage report
    this.scheduleReport('GOVERNMENT_BENEFITS_USAGE', '0 3 * * 1', {});

    // Schedule monthly fraud report
    this.scheduleReport('FRAUD_DETECTION', '0 4 1 * *', {});

    console.log('Scheduled required compliance reports');
  }

  /**
   * Schedule a report
   */
  scheduleReport(reportType, cronSchedule, parameters) {
    const cron = require('node-cron');

    const task = cron.schedule(cronSchedule, async () => {
      console.log(`Running scheduled report: ${reportType}`);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1); // Previous day

      await this.generateReport(reportType, {
        ...parameters,
        start_date: startDate,
        end_date: endDate
      });
    });

    this.scheduledReports.set(reportType, task);
  }

  /**
   * Start report processor
   */
  startReportProcessor() {
    setInterval(async () => {
      if (this.reportQueue.length > 0 && !this.isProcessing) {
        await this.processReportQueue();
      }
    }, 5000);
  }

  /**
   * Process report queue
   */
  async processReportQueue() {
    if (this.isProcessing || this.reportQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.reportQueue.length > 0) {
        const report = this.reportQueue.shift();
        await this.generateReport(report.type, report.parameters);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Ensure report directory exists
   */
  async ensureReportDirectory() {
    try {
      await fs.access(this.reportStorage);
    } catch {
      await fs.mkdir(this.reportStorage, { recursive: true });
    }
  }

  /**
   * Generate report ID
   */
  generateReportId() {
    return 'RPT-' + Date.now().toString(36).toUpperCase() +
           '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Get default template
   */
  getDefaultTemplate() {
    return {
      format: 'JSON',
      sections: ['header', 'body', 'footer'],
      frequency: 'ON_DEMAND'
    };
  }

  /**
   * Convert to CSV
   */
  convertToCSV(data) {
    // Simplified CSV conversion
    const rows = [];
    const flatten = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          rows.push(`"${newKey}","${value}"`);
        }
      });
    };

    flatten(data);
    return rows.join('\n');
  }

  /**
   * Convert to PDF (placeholder)
   */
  async convertToPDF(data) {
    // In production, would use a PDF generation library
    console.log('PDF generation not implemented in this version');
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate FinCEN submission (placeholder)
   */
  async generateFinCENSubmission(type, period) {
    return {
      submission_type: type,
      period: period,
      data: 'FinCEN submission data would be generated here'
    };
  }

  /**
   * Generate State submission (placeholder)
   */
  async generateStateSubmission(type, period) {
    return {
      submission_type: type,
      period: period,
      data: 'State regulatory submission data would be generated here'
    };
  }

  /**
   * Generate FTC submission (placeholder)
   */
  async generateFTCSubmission(type, period) {
    return {
      submission_type: type,
      period: period,
      data: 'FTC submission data would be generated here'
    };
  }

  /**
   * Generate CFPB submission (placeholder)
   */
  async generateCFPBSubmission(type, period) {
    return {
      submission_type: type,
      period: period,
      data: 'CFPB submission data would be generated here'
    };
  }

  /**
   * Shutdown the system
   */
  shutdown() {
    console.log('Shutting down Compliance Reporting System');

    // Stop scheduled reports
    for (const [name, task] of this.scheduledReports) {
      task.stop();
    }

    this.scheduledReports.clear();
    this.reportQueue = [];
  }
}

// Export singleton instance
export default new ComplianceReportingSystem();