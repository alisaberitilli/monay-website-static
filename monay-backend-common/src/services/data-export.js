import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import archiver from 'archiver';

class DataExportService extends EventEmitter {
  constructor() {
    super();
    this.exportQueue = [];
    this.processing = false;
    this.exports = new Map(); // Store export jobs
    this.schedules = new Map(); // Store scheduled exports
    this.initializeService();
  }

  initializeService() {
    // Process export queue every second
    setInterval(() => this.processQueue(), 1000);

    // Check scheduled exports every minute
    setInterval(() => this.checkScheduledExports(), 60000);

    // Clean up old exports every hour
    setInterval(() => this.cleanupOldExports(), 3600000);
  }

  /**
   * Create an export job
   */
  async createExport({
    type, // 'transactions', 'wallets', 'users', 'audit-logs', 'analytics', 'compliance', 'all'
    format, // 'csv', 'json', 'pdf', 'excel', 'xml'
    filters = {}, // Date range, status, etc.
    fields = [], // Specific fields to include
    userId,
    tenantId,
    options = {}
  }) {
    try {
      const exportId = crypto.randomUUID();
      const timestamp = new Date();

      const exportJob = {
        id: exportId,
        type,
        format,
        filters,
        fields,
        userId,
        tenantId,
        options,
        status: 'pending',
        progress: 0,
        createdAt: timestamp,
        filename: null,
        fileSize: null,
        downloadUrl: null,
        error: null,
        recordCount: 0,
        processingTime: null
      };

      // Store export job
      this.exports.set(exportId, exportJob);

      // Add to processing queue
      this.exportQueue.push(exportJob);

      // Emit event
      this.emit('export:created', exportJob);

      return exportJob;
    } catch (error) {
      console.error('Create export error:', error);
      throw error;
    }
  }

  /**
   * Process export queue
   */
  async processQueue() {
    if (this.processing || this.exportQueue.length === 0) return;

    this.processing = true;
    const job = this.exportQueue.shift();

    try {
      await this.processExport(job);
    } catch (error) {
      console.error('Process export error:', error);
      job.status = 'failed';
      job.error = error.message;
      this.emit('export:failed', job);
    }

    this.processing = false;
  }

  /**
   * Process a single export job
   */
  async processExport(job) {
    const startTime = Date.now();

    try {
      // Update status
      job.status = 'processing';
      job.progress = 10;
      this.emit('export:processing', job);

      // Fetch data based on type
      const data = await this.fetchData(job);
      job.recordCount = data.length;
      job.progress = 50;

      // Generate export file
      const filePath = await this.generateExportFile(job, data);
      job.filename = path.basename(filePath);
      job.progress = 90;

      // Get file stats
      const stats = fs.statSync(filePath);
      job.fileSize = stats.size;

      // Generate download URL
      job.downloadUrl = `/api/exports/download/${job.id}`;

      // Complete
      job.status = 'completed';
      job.progress = 100;
      job.processingTime = Date.now() - startTime;
      job.completedAt = new Date();

      this.emit('export:completed', job);

      // Schedule cleanup after 24 hours
      setTimeout(() => this.cleanupExport(job.id), 86400000);

    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      throw error;
    }
  }

  /**
   * Fetch data based on export type
   */
  async fetchData(job) {
    const { type, filters, fields, tenantId } = job;

    // Simulate data fetching (in production, query database)
    // This would connect to PostgreSQL and fetch actual data

    let data = [];

    switch (type) {
      case 'transactions':
        data = await this.fetchTransactions(filters, fields, tenantId);
        break;

      case 'wallets':
        data = await this.fetchWallets(filters, fields, tenantId);
        break;

      case 'users':
        data = await this.fetchUsers(filters, fields, tenantId);
        break;

      case 'audit-logs':
        data = await this.fetchAuditLogs(filters, fields, tenantId);
        break;

      case 'analytics':
        data = await this.fetchAnalytics(filters, fields, tenantId);
        break;

      case 'compliance':
        data = await this.fetchComplianceData(filters, fields, tenantId);
        break;

      case 'all':
        // Export all data types
        data = await this.fetchAllData(filters, fields, tenantId);
        break;

      default:
        throw new Error(`Unknown export type: ${type}`);
    }

    return data;
  }

  /**
   * Generate export file based on format
   */
  async generateExportFile(job, data) {
    const { format, type } = job;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `export-${type}-${timestamp}`;
    const exportDir = path.join(process.cwd(), 'exports');

    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    let filePath;

    switch (format) {
      case 'csv':
        filePath = await this.generateCSV(data, exportDir, baseFilename);
        break;

      case 'json':
        filePath = await this.generateJSON(data, exportDir, baseFilename);
        break;

      case 'pdf':
        filePath = await this.generatePDF(data, exportDir, baseFilename, job);
        break;

      case 'excel':
        filePath = await this.generateExcel(data, exportDir, baseFilename, job);
        break;

      case 'xml':
        filePath = await this.generateXML(data, exportDir, baseFilename);
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Store file path
    job.filePath = filePath;

    return filePath;
  }

  /**
   * Generate CSV export
   */
  async generateCSV(data, exportDir, baseFilename) {
    const filePath = path.join(exportDir, `${baseFilename}.csv`);

    if (data.length === 0) {
      fs.writeFileSync(filePath, 'No data available');
      return filePath;
    }

    // Get fields from first record
    const fields = Object.keys(data[0]);

    // Create CSV parser
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    // Write to file
    fs.writeFileSync(filePath, csv);

    return filePath;
  }

  /**
   * Generate JSON export
   */
  async generateJSON(data, exportDir, baseFilename) {
    const filePath = path.join(exportDir, `${baseFilename}.json`);

    const jsonData = JSON.stringify({
      exportDate: new Date().toISOString(),
      recordCount: data.length,
      data: data
    }, null, 2);

    fs.writeFileSync(filePath, jsonData);

    return filePath;
  }

  /**
   * Generate PDF export
   */
  async generatePDF(data, exportDir, baseFilename, job) {
    const filePath = path.join(exportDir, `${baseFilename}.pdf`);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add header
    doc.fontSize(20).text(`${job.type.toUpperCase()} Export Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.fontSize(10).text(`Total Records: ${data.length}`, { align: 'center' });
    doc.moveDown(2);

    // Add data (simplified table)
    if (data.length > 0) {
      const fields = Object.keys(data[0]);
      const maxRecords = Math.min(data.length, 100); // Limit PDF to 100 records

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      fields.forEach((field, index) => {
        const x = 50 + (index * 100);
        doc.text(field.substring(0, 12), x, doc.y, {
          width: 95,
          continued: index < fields.length - 1
        });
      });
      doc.moveDown();

      // Table data
      doc.font('Helvetica').fontSize(8);
      for (let i = 0; i < maxRecords; i++) {
        const record = data[i];
        fields.forEach((field, index) => {
          const x = 50 + (index * 100);
          const value = String(record[field] || '').substring(0, 12);
          doc.text(value, x, doc.y, {
            width: 95,
            continued: index < fields.length - 1
          });
        });
        doc.moveDown(0.5);

        // Check for page break
        if (doc.y > 700) {
          doc.addPage();
        }
      }

      if (data.length > maxRecords) {
        doc.moveDown(2);
        doc.fontSize(10).text(`... and ${data.length - maxRecords} more records`, { align: 'center' });
      }
    }

    // Add footer
    doc.fontSize(8).text('Generated by Monay Enterprise Wallet', 50, 750, { align: 'center' });

    // Finalize PDF
    doc.end();

    return new Promise((resolve) => {
      stream.on('finish', () => resolve(filePath));
    });
  }

  /**
   * Generate Excel export
   */
  async generateExcel(data, exportDir, baseFilename, job) {
    const filePath = path.join(exportDir, `${baseFilename}.xlsx`);

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Monay Enterprise Wallet';
    workbook.created = new Date();

    // Add worksheet
    const worksheet = workbook.addWorksheet(job.type);

    if (data.length > 0) {
      // Add columns
      const columns = Object.keys(data[0]).map(key => ({
        header: key,
        key: key,
        width: 15
      }));
      worksheet.columns = columns;

      // Add rows
      data.forEach(record => {
        worksheet.addRow(record);
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add filters
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(65 + columns.length - 1)}1`
      };
    }

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Property', key: 'property', width: 20 },
      { header: 'Value', key: 'value', width: 30 }
    ];

    summarySheet.addRows([
      { property: 'Export Type', value: job.type },
      { property: 'Export Date', value: new Date().toLocaleString() },
      { property: 'Total Records', value: data.length },
      { property: 'Filters Applied', value: JSON.stringify(job.filters) }
    ]);

    // Save workbook
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Generate XML export
   */
  async generateXML(data, exportDir, baseFilename) {
    const filePath = path.join(exportDir, `${baseFilename}.xml`);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<export>\n';
    xml += `  <metadata>\n`;
    xml += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
    xml += `    <recordCount>${data.length}</recordCount>\n`;
    xml += `  </metadata>\n`;
    xml += '  <data>\n';

    data.forEach((record, index) => {
      xml += `    <record id="${index + 1}">\n`;
      Object.entries(record).forEach(([key, value]) => {
        xml += `      <${key}>${this.escapeXML(String(value || ''))}</${key}>\n`;
      });
      xml += '    </record>\n';
    });

    xml += '  </data>\n';
    xml += '</export>';

    fs.writeFileSync(filePath, xml);

    return filePath;
  }

  /**
   * Escape XML special characters
   */
  escapeXML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Create scheduled export
   */
  async createScheduledExport({
    schedule, // 'daily', 'weekly', 'monthly', 'custom'
    time, // HH:mm format
    dayOfWeek, // For weekly (0-6)
    dayOfMonth, // For monthly (1-31)
    exportConfig, // Same as createExport params
    enabled = true
  }) {
    const scheduleId = crypto.randomUUID();

    const scheduledExport = {
      id: scheduleId,
      schedule,
      time,
      dayOfWeek,
      dayOfMonth,
      exportConfig,
      enabled,
      lastRun: null,
      nextRun: this.calculateNextRun(schedule, time, dayOfWeek, dayOfMonth),
      createdAt: new Date()
    };

    this.schedules.set(scheduleId, scheduledExport);

    return scheduledExport;
  }

  /**
   * Check and run scheduled exports
   */
  async checkScheduledExports() {
    const now = new Date();

    for (const schedule of this.schedules.values()) {
      if (!schedule.enabled) continue;

      if (schedule.nextRun && now >= schedule.nextRun) {
        // Run the export
        await this.createExport(schedule.exportConfig);

        // Update schedule
        schedule.lastRun = now;
        schedule.nextRun = this.calculateNextRun(
          schedule.schedule,
          schedule.time,
          schedule.dayOfWeek,
          schedule.dayOfMonth
        );

        this.emit('schedule:executed', schedule);
      }
    }
  }

  /**
   * Calculate next run time for scheduled export
   */
  calculateNextRun(schedule, time, dayOfWeek, dayOfMonth) {
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date();
    next.setHours(hours, minutes, 0, 0);

    switch (schedule) {
      case 'daily':
        if (next <= new Date()) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        next.setDate(next.getDate() + ((7 + dayOfWeek - next.getDay()) % 7));
        if (next <= new Date()) {
          next.setDate(next.getDate() + 7);
        }
        break;

      case 'monthly':
        next.setDate(dayOfMonth);
        if (next <= new Date()) {
          next.setMonth(next.getMonth() + 1);
        }
        break;
    }

    return next;
  }

  /**
   * Create bulk export (multiple types)
   */
  async createBulkExport(exportConfigs, format = 'zip') {
    const bulkId = crypto.randomUUID();
    const exports = [];

    // Create individual exports
    for (const config of exportConfigs) {
      const exportJob = await this.createExport(config);
      exports.push(exportJob);
    }

    // Wait for all exports to complete
    await Promise.all(exports.map(job =>
      new Promise(resolve => {
        const checkStatus = setInterval(() => {
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(checkStatus);
            resolve(job);
          }
        }, 1000);
      })
    ));

    // Create ZIP archive if requested
    if (format === 'zip') {
      const zipPath = await this.createZipArchive(exports, bulkId);
      return {
        id: bulkId,
        exports,
        zipPath,
        downloadUrl: `/api/exports/download-bulk/${bulkId}`
      };
    }

    return { id: bulkId, exports };
  }

  /**
   * Create ZIP archive of multiple exports
   */
  async createZipArchive(exports, bulkId) {
    const exportDir = path.join(process.cwd(), 'exports');
    const zipPath = path.join(exportDir, `bulk-export-${bulkId}.zip`);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    // Add each export file to archive
    for (const exportJob of exports) {
      if (exportJob.status === 'completed' && exportJob.filePath) {
        archive.file(exportJob.filePath, { name: exportJob.filename });
      }
    }

    await archive.finalize();

    return new Promise((resolve) => {
      output.on('close', () => resolve(zipPath));
    });
  }

  /**
   * Get export status
   */
  getExportStatus(exportId) {
    return this.exports.get(exportId);
  }

  /**
   * Get export file path
   */
  getExportFilePath(exportId) {
    const exportJob = this.exports.get(exportId);
    if (!exportJob || exportJob.status !== 'completed') {
      return null;
    }
    return exportJob.filePath;
  }

  /**
   * Cancel export
   */
  cancelExport(exportId) {
    const exportJob = this.exports.get(exportId);
    if (!exportJob) {
      throw new Error('Export not found');
    }

    if (exportJob.status === 'pending' || exportJob.status === 'processing') {
      exportJob.status = 'cancelled';
      // Remove from queue
      const index = this.exportQueue.findIndex(job => job.id === exportId);
      if (index !== -1) {
        this.exportQueue.splice(index, 1);
      }
      this.emit('export:cancelled', exportJob);
    }

    return exportJob;
  }

  /**
   * Clean up old exports
   */
  async cleanupOldExports() {
    const now = Date.now();
    const maxAge = 86400000; // 24 hours

    for (const [exportId, exportJob] of this.exports.entries()) {
      if (exportJob.createdAt && (now - exportJob.createdAt.getTime()) > maxAge) {
        await this.cleanupExport(exportId);
      }
    }
  }

  /**
   * Clean up a single export
   */
  async cleanupExport(exportId) {
    const exportJob = this.exports.get(exportId);
    if (!exportJob) return;

    // Delete file if exists
    if (exportJob.filePath && fs.existsSync(exportJob.filePath)) {
      fs.unlinkSync(exportJob.filePath);
    }

    // Remove from memory
    this.exports.delete(exportId);

    this.emit('export:cleaned', exportId);
  }

  /**
   * Mock data fetching methods (in production, these would query the database)
   */
  async fetchTransactions(filters, fields, tenantId) {
    // Mock transaction data
    return Array.from({ length: 100 }, (_, i) => ({
      id: `txn_${i}`,
      amount: Math.floor(Math.random() * 10000),
      currency: 'USD',
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      walletId: `wallet_${Math.floor(Math.random() * 10)}`,
      type: ['transfer', 'deposit', 'withdrawal'][Math.floor(Math.random() * 3)]
    }));
  }

  async fetchWallets(filters, fields, tenantId) {
    // Mock wallet data
    return Array.from({ length: 50 }, (_, i) => ({
      id: `wallet_${i}`,
      name: `Wallet ${i}`,
      balance: Math.floor(Math.random() * 100000),
      currency: 'USD',
      type: ['enterprise', 'consumer'][Math.floor(Math.random() * 2)],
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString()
    }));
  }

  async fetchUsers(filters, fields, tenantId) {
    // Mock user data
    return Array.from({ length: 25 }, (_, i) => ({
      id: `user_${i}`,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      role: ['admin', 'user', 'developer'][Math.floor(Math.random() * 3)],
      status: 'active',
      createdAt: new Date(Date.now() - Math.random() * 180 * 86400000).toISOString(),
      lastLogin: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString()
    }));
  }

  async fetchAuditLogs(filters, fields, tenantId) {
    // Mock audit log data
    return Array.from({ length: 200 }, (_, i) => ({
      id: `log_${i}`,
      action: ['LOGIN', 'TRANSFER', 'UPDATE', 'DELETE'][Math.floor(Math.random() * 4)],
      userId: `user_${Math.floor(Math.random() * 25)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      result: ['success', 'failed'][Math.floor(Math.random() * 2)]
    }));
  }

  async fetchAnalytics(filters, fields, tenantId) {
    // Mock analytics data
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      transactions: Math.floor(Math.random() * 1000),
      volume: Math.floor(Math.random() * 1000000),
      newUsers: Math.floor(Math.random() * 50),
      activeWallets: Math.floor(Math.random() * 100)
    }));
  }

  async fetchComplianceData(filters, fields, tenantId) {
    // Mock compliance data
    return Array.from({ length: 50 }, (_, i) => ({
      id: `comp_${i}`,
      type: ['KYC', 'AML', 'CTR', 'SAR'][Math.floor(Math.random() * 4)],
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      userId: `user_${Math.floor(Math.random() * 25)}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      riskScore: Math.floor(Math.random() * 100)
    }));
  }

  async fetchAllData(filters, fields, tenantId) {
    // Combine all data types
    const [transactions, wallets, users, auditLogs, analytics, compliance] = await Promise.all([
      this.fetchTransactions(filters, fields, tenantId),
      this.fetchWallets(filters, fields, tenantId),
      this.fetchUsers(filters, fields, tenantId),
      this.fetchAuditLogs(filters, fields, tenantId),
      this.fetchAnalytics(filters, fields, tenantId),
      this.fetchComplianceData(filters, fields, tenantId)
    ]);

    return {
      transactions,
      wallets,
      users,
      auditLogs,
      analytics,
      compliance
    };
  }
}

// Singleton instance
const dataExportService = new DataExportService();

export default dataExportService;