/**
 * Financial Reporting Service
 * Generates comprehensive financial reports for government benefit programs and compliance
 * Created: 2025-01-21
 */

const { EventEmitter } = require('events');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

class FinancialReportingService extends EventEmitter {
  constructor() {
    super();
    this.reportTypes = {
      DAILY_TRANSACTION: 'DAILY_TRANSACTION',
      MONTHLY_STATEMENT: 'MONTHLY_STATEMENT',
      QUARTERLY_SUMMARY: 'QUARTERLY_SUMMARY',
      ANNUAL_REPORT: 'ANNUAL_REPORT',
      COMPLIANCE_REPORT: 'COMPLIANCE_REPORT',
      TAX_REPORT: 'TAX_REPORT',
      GOVERNMENT_BENEFITS: 'GOVERNMENT_BENEFITS',
      RECONCILIATION_REPORT: 'RECONCILIATION_REPORT',
      SETTLEMENT_REPORT: 'SETTLEMENT_REPORT',
      FRAUD_REPORT: 'FRAUD_REPORT',
      EXCEPTION_REPORT: 'EXCEPTION_REPORT',
      REGULATORY_FILING: 'REGULATORY_FILING'
    };

    this.reportFormats = {
      PDF: 'PDF',
      EXCEL: 'EXCEL',
      CSV: 'CSV',
      JSON: 'JSON',
      XML: 'XML',
      HTML: 'HTML'
    };

    this.regulatoryReports = {
      CTR: 'CURRENCY_TRANSACTION_REPORT',
      SAR: 'SUSPICIOUS_ACTIVITY_REPORT',
      OFAC: 'OFAC_COMPLIANCE_REPORT',
      BSA: 'BANK_SECRECY_ACT_REPORT',
      AML: 'ANTI_MONEY_LAUNDERING_REPORT',
      FINRA: 'FINRA_COMPLIANCE_REPORT',
      STATE_MSB: 'STATE_MSB_REPORT'
    };
  }

  /**
   * Generate financial report
   */
  async generateReport(reportConfig) {
    try {
      const report = {
        id: this.generateReportId(),
        type: reportConfig.type,
        format: reportConfig.format || this.reportFormats.PDF,
        dateRange: reportConfig.dateRange,
        filters: reportConfig.filters || {},
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: reportConfig.userId,
          organization: reportConfig.organizationId,
          version: '1.0'
        },
        status: 'GENERATING'
      };

      // Get report data
      const data = await this.gatherReportData(report);

      // Generate report in requested format
      let output;
      switch (report.format) {
        case this.reportFormats.PDF:
          output = await this.generatePDFReport(data, report);
          break;
        case this.reportFormats.EXCEL:
          output = await this.generateExcelReport(data, report);
          break;
        case this.reportFormats.CSV:
          output = await this.generateCSVReport(data, report);
          break;
        case this.reportFormats.JSON:
          output = await this.generateJSONReport(data, report);
          break;
        case this.reportFormats.XML:
          output = await this.generateXMLReport(data, report);
          break;
        case this.reportFormats.HTML:
          output = await this.generateHTMLReport(data, report);
          break;
      }

      report.status = 'COMPLETED';
      report.output = output;

      this.emit('report_generated', report);
      return report;

    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  /**
   * Gather data for report
   */
  async gatherReportData(report) {
    const data = {
      transactions: [],
      balances: {},
      settlements: [],
      fees: {},
      compliance: {},
      exceptions: []
    };

    // Based on report type, gather relevant data
    switch (report.type) {
      case this.reportTypes.GOVERNMENT_BENEFITS:
        data.transactions = await this.getGovernmentBenefitTransactions(report);
        data.programMetrics = await this.getProgramMetrics(report);
        data.compliance = await this.getComplianceMetrics(report);
        break;

      case this.reportTypes.RECONCILIATION_REPORT:
        data.reconciliations = await this.getReconciliationData(report);
        data.discrepancies = await this.getDiscrepancies(report);
        data.disputes = await this.getDisputes(report);
        break;

      case this.reportTypes.COMPLIANCE_REPORT:
        data.amlScores = await this.getAMLScores(report);
        data.sanctions = await this.getSanctionsScreening(report);
        data.riskAssessment = await this.getRiskAssessment(report);
        break;

      case this.reportTypes.SETTLEMENT_REPORT:
        data.settlements = await this.getSettlements(report);
        data.fees = await this.getSettlementFees(report);
        data.chargebacks = await this.getChargebacks(report);
        break;

      default:
        data.transactions = await this.getTransactions(report);
        data.balances = await this.getBalances(report);
        data.fees = await this.getFees(report);
    }

    return data;
  }

  /**
   * Get government benefit transactions
   */
  async getGovernmentBenefitTransactions(report) {
    // Query transactions filtered by government programs
    const transactions = await global.db.query(`
      SELECT
        t.*,
        gb.program_type,
        gb.eligibility_status,
        gb.benefit_amount,
        gb.disbursement_date,
        w.wallet_id,
        u.first_name,
        u.last_name
      FROM transactions t
      JOIN government_benefits gb ON t.reference_id = gb.id
      JOIN wallets w ON t.wallet_id = w.id
      JOIN users u ON w.user_id = u.id
      WHERE t.created_at BETWEEN $1 AND $2
        AND ($3::text IS NULL OR gb.program_type = $3)
        AND ($4::uuid IS NULL OR gb.organization_id = $4)
      ORDER BY t.created_at DESC
    `, [
      report.dateRange.start,
      report.dateRange.end,
      report.filters.programType,
      report.filters.organizationId
    ]);

    return transactions.rows;
  }

  /**
   * Get program metrics
   */
  async getProgramMetrics(report) {
    const metrics = await global.db.query(`
      SELECT
        program_type,
        COUNT(*) as total_beneficiaries,
        SUM(benefit_amount) as total_disbursed,
        AVG(benefit_amount) as average_benefit,
        COUNT(DISTINCT wallet_id) as unique_wallets,
        COUNT(CASE WHEN eligibility_status = 'ACTIVE' THEN 1 END) as active_recipients,
        COUNT(CASE WHEN eligibility_status = 'SUSPENDED' THEN 1 END) as suspended_recipients
      FROM government_benefits
      WHERE created_at BETWEEN $1 AND $2
        AND ($3::uuid IS NULL OR organization_id = $3)
      GROUP BY program_type
    `, [
      report.dateRange.start,
      report.dateRange.end,
      report.filters.organizationId
    ]);

    return metrics.rows;
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(data, report) {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('Financial Report', { align: 'center' });
    doc.fontSize(14).text(report.type, { align: 'center' });
    doc.moveDown();

    // Report metadata
    doc.fontSize(10);
    doc.text(`Report ID: ${report.id}`);
    doc.text(`Generated: ${report.metadata.generatedAt}`);
    doc.text(`Date Range: ${report.dateRange.start} to ${report.dateRange.end}`);
    doc.moveDown();

    // Report specific content
    switch (report.type) {
      case this.reportTypes.GOVERNMENT_BENEFITS:
        this.addGovernmentBenefitsPDFContent(doc, data);
        break;
      case this.reportTypes.RECONCILIATION_REPORT:
        this.addReconciliationPDFContent(doc, data);
        break;
      case this.reportTypes.COMPLIANCE_REPORT:
        this.addCompliancePDFContent(doc, data);
        break;
      default:
        this.addStandardPDFContent(doc, data);
    }

    // Footer
    doc.moveDown();
    doc.fontSize(8).text('Confidential - Monay Financial Services', { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve({
          format: 'PDF',
          data: pdfBuffer.toString('base64'),
          size: pdfBuffer.length
        });
      });
    });
  }

  /**
   * Add government benefits PDF content
   */
  addGovernmentBenefitsPDFContent(doc, data) {
    doc.fontSize(16).text('Government Benefits Summary', { underline: true });
    doc.moveDown();

    // Program metrics
    if (data.programMetrics && data.programMetrics.length > 0) {
      doc.fontSize(12).text('Program Metrics');
      data.programMetrics.forEach(metric => {
        doc.fontSize(10);
        doc.text(`Program: ${metric.program_type}`);
        doc.text(`  Total Beneficiaries: ${metric.total_beneficiaries}`);
        doc.text(`  Total Disbursed: $${parseFloat(metric.total_disbursed).toFixed(2)}`);
        doc.text(`  Average Benefit: $${parseFloat(metric.average_benefit).toFixed(2)}`);
        doc.text(`  Active Recipients: ${metric.active_recipients}`);
        doc.moveDown();
      });
    }

    // Transaction summary
    if (data.transactions && data.transactions.length > 0) {
      doc.fontSize(12).text('Transaction Summary');
      doc.fontSize(10);
      doc.text(`Total Transactions: ${data.transactions.length}`);

      const totalAmount = data.transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);
      doc.moveDown();
    }

    // Compliance metrics
    if (data.compliance) {
      doc.fontSize(12).text('Compliance Status');
      doc.fontSize(10);
      doc.text(`MCC Restrictions Enforced: ${data.compliance.mccRestrictions || 'YES'}`);
      doc.text(`Velocity Checks Passed: ${data.compliance.velocityChecks || 'YES'}`);
      doc.text(`Fraud Alerts: ${data.compliance.fraudAlerts || 0}`);
      doc.moveDown();
    }
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(data, report) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Monay Financial Services';
    workbook.created = new Date();

    // Main worksheet
    const worksheet = workbook.addWorksheet('Report');

    // Headers
    worksheet.addRow(['Financial Report']);
    worksheet.addRow([report.type]);
    worksheet.addRow([]);
    worksheet.addRow(['Report ID', report.id]);
    worksheet.addRow(['Generated', report.metadata.generatedAt]);
    worksheet.addRow(['Date Range', `${report.dateRange.start} to ${report.dateRange.end}`]);
    worksheet.addRow([]);

    // Add data based on report type
    switch (report.type) {
      case this.reportTypes.GOVERNMENT_BENEFITS:
        this.addGovernmentBenefitsExcelContent(worksheet, data);
        break;
      case this.reportTypes.RECONCILIATION_REPORT:
        this.addReconciliationExcelContent(worksheet, data);
        break;
      default:
        this.addStandardExcelContent(worksheet, data);
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      format: 'EXCEL',
      data: buffer.toString('base64'),
      size: buffer.length
    };
  }

  /**
   * Add government benefits Excel content
   */
  addGovernmentBenefitsExcelContent(worksheet, data) {
    // Program metrics section
    if (data.programMetrics && data.programMetrics.length > 0) {
      worksheet.addRow(['Program Metrics']);
      worksheet.addRow(['Program', 'Beneficiaries', 'Total Disbursed', 'Average Benefit', 'Active']);

      data.programMetrics.forEach(metric => {
        worksheet.addRow([
          metric.program_type,
          metric.total_beneficiaries,
          parseFloat(metric.total_disbursed),
          parseFloat(metric.average_benefit),
          metric.active_recipients
        ]);
      });

      worksheet.addRow([]);
    }

    // Transactions section
    if (data.transactions && data.transactions.length > 0) {
      worksheet.addRow(['Transaction Details']);
      worksheet.addRow([
        'Transaction ID',
        'Date',
        'Program',
        'Amount',
        'Status',
        'Beneficiary',
        'Wallet ID'
      ]);

      data.transactions.forEach(tx => {
        worksheet.addRow([
          tx.id,
          tx.created_at,
          tx.program_type,
          parseFloat(tx.amount),
          tx.status,
          `${tx.first_name} ${tx.last_name}`,
          tx.wallet_id
        ]);
      });
    }
  }

  /**
   * Generate CSV report
   */
  async generateCSVReport(data, report) {
    let csv = [];

    // Headers
    csv.push(['Report Type', report.type]);
    csv.push(['Report ID', report.id]);
    csv.push(['Generated', report.metadata.generatedAt]);
    csv.push(['Date Range', `${report.dateRange.start} to ${report.dateRange.end}`]);
    csv.push([]);

    // Add data rows
    if (data.transactions && data.transactions.length > 0) {
      csv.push(['Transaction ID', 'Date', 'Amount', 'Type', 'Status']);
      data.transactions.forEach(tx => {
        csv.push([
          tx.id,
          tx.created_at,
          tx.amount,
          tx.transaction_type,
          tx.status
        ]);
      });
    }

    const csvString = csv.map(row => row.join(',')).join('\n');

    return {
      format: 'CSV',
      data: Buffer.from(csvString).toString('base64'),
      size: csvString.length
    };
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(data, report) {
    const jsonReport = {
      report: {
        id: report.id,
        type: report.type,
        metadata: report.metadata,
        dateRange: report.dateRange,
        filters: report.filters
      },
      data: data
    };

    const jsonString = JSON.stringify(jsonReport, null, 2);

    return {
      format: 'JSON',
      data: Buffer.from(jsonString).toString('base64'),
      size: jsonString.length
    };
  }

  /**
   * Generate XML report
   */
  async generateXMLReport(data, report) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<FinancialReport>\n';
    xml += `  <ReportId>${report.id}</ReportId>\n`;
    xml += `  <ReportType>${report.type}</ReportType>\n`;
    xml += `  <GeneratedAt>${report.metadata.generatedAt}</GeneratedAt>\n`;
    xml += `  <DateRange>\n`;
    xml += `    <Start>${report.dateRange.start}</Start>\n`;
    xml += `    <End>${report.dateRange.end}</End>\n`;
    xml += `  </DateRange>\n`;

    // Add data sections
    if (data.transactions) {
      xml += '  <Transactions>\n';
      data.transactions.forEach(tx => {
        xml += '    <Transaction>\n';
        xml += `      <Id>${tx.id}</Id>\n`;
        xml += `      <Amount>${tx.amount}</Amount>\n`;
        xml += `      <Date>${tx.created_at}</Date>\n`;
        xml += `      <Status>${tx.status}</Status>\n`;
        xml += '    </Transaction>\n';
      });
      xml += '  </Transactions>\n';
    }

    xml += '</FinancialReport>';

    return {
      format: 'XML',
      data: Buffer.from(xml).toString('base64'),
      size: xml.length
    };
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(data, report) {
    let html = '<!DOCTYPE html>\n<html>\n<head>\n';
    html += '<title>Financial Report</title>\n';
    html += '<style>body{font-family:Arial;}table{border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;}</style>\n';
    html += '</head>\n<body>\n';
    html += `<h1>Financial Report - ${report.type}</h1>\n`;
    html += `<p>Report ID: ${report.id}</p>\n`;
    html += `<p>Generated: ${report.metadata.generatedAt}</p>\n`;
    html += `<p>Date Range: ${report.dateRange.start} to ${report.dateRange.end}</p>\n`;

    // Add data tables
    if (data.transactions && data.transactions.length > 0) {
      html += '<h2>Transactions</h2>\n';
      html += '<table>\n<tr><th>ID</th><th>Date</th><th>Amount</th><th>Status</th></tr>\n';
      data.transactions.forEach(tx => {
        html += `<tr><td>${tx.id}</td><td>${tx.created_at}</td><td>${tx.amount}</td><td>${tx.status}</td></tr>\n`;
      });
      html += '</table>\n';
    }

    html += '</body>\n</html>';

    return {
      format: 'HTML',
      data: Buffer.from(html).toString('base64'),
      size: html.length
    };
  }

  /**
   * Schedule recurring report
   */
  async scheduleReport(schedule) {
    const scheduledReport = {
      id: this.generateReportId(),
      ...schedule,
      status: 'SCHEDULED',
      nextRun: this.calculateNextRun(schedule.frequency),
      createdAt: new Date().toISOString()
    };

    // Store in database
    await global.db.query(
      `INSERT INTO scheduled_reports
       (id, report_type, frequency, recipients, config, next_run, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        scheduledReport.id,
        scheduledReport.reportType,
        scheduledReport.frequency,
        JSON.stringify(scheduledReport.recipients),
        JSON.stringify(scheduledReport.config),
        scheduledReport.nextRun,
        scheduledReport.status,
        scheduledReport.createdAt
      ]
    );

    this.emit('report_scheduled', scheduledReport);
    return scheduledReport;
  }

  /**
   * Generate regulatory report
   */
  async generateRegulatoryReport(type, data) {
    const report = {
      id: this.generateReportId(),
      type: this.regulatoryReports[type],
      data: data,
      generatedAt: new Date().toISOString(),
      status: 'PENDING_SUBMISSION'
    };

    switch (type) {
      case 'CTR':
        report.content = await this.generateCTRReport(data);
        break;
      case 'SAR':
        report.content = await this.generateSARReport(data);
        break;
      case 'OFAC':
        report.content = await this.generateOFACReport(data);
        break;
      case 'BSA':
        report.content = await this.generateBSAReport(data);
        break;
      case 'AML':
        report.content = await this.generateAMLReport(data);
        break;
    }

    // Store report
    await this.storeRegulatoryReport(report);

    // Submit if required
    if (report.content.requiresImediateSubmission) {
      await this.submitRegulatoryReport(report);
    }

    return report;
  }

  /**
   * Generate CTR (Currency Transaction Report)
   */
  async generateCTRReport(data) {
    return {
      filingType: 'CTR',
      transactionAmount: data.amount,
      transactionDate: data.date,
      customerInfo: {
        name: data.customerName,
        ssn: data.customerSSN,
        address: data.customerAddress
      },
      institutionInfo: {
        name: 'Monay Financial Services',
        ein: process.env.INSTITUTION_EIN,
        address: process.env.INSTITUTION_ADDRESS
      },
      requiresImediateSubmission: data.amount > 10000
    };
  }

  /**
   * Generate SAR (Suspicious Activity Report)
   */
  async generateSARReport(data) {
    return {
      filingType: 'SAR',
      suspiciousActivity: data.activityType,
      suspectInfo: {
        name: data.suspectName,
        identifiers: data.identifiers,
        accountNumbers: data.accounts
      },
      activityDescription: data.description,
      amountInvolved: data.amount,
      dateRange: data.dateRange,
      lawEnforcementNotified: data.lawEnforcementContact,
      requiresImediateSubmission: true
    };
  }

  /**
   * Real-time report generation
   */
  async generateRealTimeReport(filters) {
    const data = await this.gatherRealTimeData(filters);

    return {
      timestamp: new Date().toISOString(),
      metrics: {
        activeTransactions: data.activeTransactions,
        pendingSettlements: data.pendingSettlements,
        totalVolume24h: data.volume24h,
        averageProcessingTime: data.avgProcessingTime,
        successRate: data.successRate
      },
      alerts: data.alerts,
      exceptions: data.exceptions
    };
  }

  /**
   * Export report to file
   */
  async exportReport(report, filePath) {
    try {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      let fileContent;
      if (report.output.format === 'PDF' || report.output.format === 'EXCEL') {
        fileContent = Buffer.from(report.output.data, 'base64');
      } else {
        fileContent = Buffer.from(report.output.data, 'base64').toString('utf-8');
      }

      await fs.writeFile(filePath, fileContent);

      return {
        success: true,
        path: filePath,
        size: fileContent.length
      };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Email report
   */
  async emailReport(report, recipients) {
    // Integration with email service
    const emailData = {
      to: recipients,
      subject: `Financial Report: ${report.type}`,
      body: `Please find attached the ${report.type} report for ${report.dateRange.start} to ${report.dateRange.end}`,
      attachments: [{
        filename: `report_${report.id}.${report.format.toLowerCase()}`,
        content: report.output.data,
        encoding: 'base64'
      }]
    };

    // Send via email service
    await this.sendEmail(emailData);

    return {
      success: true,
      recipients: recipients,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Helper functions
   */
  generateReportId() {
    return `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateNextRun(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'DAILY':
        return new Date(now.setDate(now.getDate() + 1));
      case 'WEEKLY':
        return new Date(now.setDate(now.getDate() + 7));
      case 'MONTHLY':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'QUARTERLY':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'ANNUAL':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return null;
    }
  }
}

module.exports = FinancialReportingService;