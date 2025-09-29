import pkg from 'sequelize';
const { Op } = pkg;
import crypto from 'crypto';
import { EventEmitter } from 'events';
import db from '../models/index.js';

class AuditLogService extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.flushInterval = null;
    this.batchSize = 100;
    this.flushIntervalMs = 5000;
    this.initializeService();
  }

  initializeService() {
    // Start batch processing
    this.flushInterval = setInterval(() => {
      this.flushQueue();
    }, this.flushIntervalMs);

    // Handle process termination
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Log an audit event
   */
  async log({
    userId,
    tenantId,
    action,
    resource,
    resourceId,
    details = {},
    metadata = {},
    ipAddress,
    userAgent,
    sessionId,
    severity = 'INFO',
    category = 'GENERAL'
  }) {
    try {
      const auditEntry = {
        id: crypto.randomUUID(),
        userId,
        tenantId,
        action,
        resource,
        resourceId,
        details: JSON.stringify(details),
        metadata: JSON.stringify(metadata),
        ipAddress,
        userAgent,
        sessionId,
        severity,
        category,
        timestamp: new Date(),
        hash: null
      };

      // Generate hash for tamper detection
      auditEntry.hash = this.generateHash(auditEntry);

      // Add to queue for batch processing
      this.queue.push(auditEntry);

      // Emit event for real-time processing
      this.emit('audit:logged', auditEntry);

      // Flush immediately for critical events
      if (severity === 'CRITICAL' || severity === 'SECURITY') {
        await this.flushQueue();
      }

      return auditEntry;
    } catch (error) {
      console.error('Audit log error:', error);
      // Never throw errors from audit logging
      return null;
    }
  }

  /**
   * Generate hash for audit entry
   */
  generateHash(entry) {
    const data = [
      entry.userId,
      entry.action,
      entry.resource,
      entry.resourceId,
      entry.details,
      entry.timestamp?.toISOString()
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Verify audit entry integrity
   */
  verifyIntegrity(entry) {
    const calculatedHash = this.generateHash(entry);
    return calculatedHash === entry.hash;
  }

  /**
   * Flush queued entries to database
   */
  async flushQueue() {
    if (this.queue.length === 0) return;

    const entriesToFlush = this.queue.splice(0, this.batchSize);
    
    try {
      // Use imported db
      await db.AuditLog.bulkCreate(entriesToFlush, {
        ignoreDuplicates: true
      });

      // Emit batch processed event
      this.emit('audit:batch:processed', {
        count: entriesToFlush.length,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-queue failed entries
      this.queue.unshift(...entriesToFlush);
    }
  }

  /**
   * Query audit logs
   */
  async query({
    userId,
    tenantId,
    action,
    resource,
    startDate,
    endDate,
    severity,
    category,
    limit = 100,
    offset = 0,
    orderBy = 'timestamp',
    orderDirection = 'DESC'
  }) {
    try {
      // Use imported db
      const where = {};

      if (userId) where.userId = userId;
      if (tenantId) where.tenantId = tenantId;
      if (action) where.action = action;
      if (resource) where.resource = resource;
      if (severity) where.severity = severity;
      if (category) where.category = category;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = startDate;
        if (endDate) where.timestamp[Op.lte] = endDate;
      }

      const logs = await db.AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [[orderBy, orderDirection]]
      });

      // Verify integrity of retrieved logs
      logs.rows = logs.rows.map(log => ({
        ...log.toJSON(),
        integrityValid: this.verifyIntegrity(log)
      }));

      return logs;
    } catch (error) {
      console.error('Audit query error:', error);
      throw error;
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(userId, days = 30) {
    try {
      // Use imported db
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const activity = await db.AuditLog.findAll({
        where: {
          userId,
          timestamp: { [Op.gte]: startDate }
        },
        attributes: [
          'action',
          'resource',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
          [db.sequelize.fn('DATE', db.sequelize.col('timestamp')), 'date']
        ],
        group: ['action', 'resource', db.sequelize.fn('DATE', db.sequelize.col('timestamp'))],
        order: [[db.sequelize.fn('DATE', db.sequelize.col('timestamp')), 'DESC']]
      });

      return activity;
    } catch (error) {
      console.error('User activity query error:', error);
      throw error;
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(tenantId, startDate, endDate) {
    try {
      // Use imported db
      
      const report = await db.AuditLog.findAll({
        where: {
          tenantId,
          timestamp: {
            [Op.between]: [startDate, endDate]
          },
          category: ['COMPLIANCE', 'SECURITY', 'FINANCIAL']
        },
        attributes: [
          'category',
          'severity',
          'action',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['category', 'severity', 'action'],
        order: [['category', 'ASC'], ['severity', 'DESC']]
      });

      return {
        period: { startDate, endDate },
        tenantId,
        summary: report,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Compliance report error:', error);
      throw error;
    }
  }

  /**
   * Archive old audit logs
   */
  async archiveLogs(daysToKeep = 90) {
    try {
      // Use imported db
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Export to archive storage (S3, cold storage, etc.)
      const logsToArchive = await db.AuditLog.findAll({
        where: {
          timestamp: { [Op.lt]: cutoffDate }
        }
      });

      if (logsToArchive.length > 0) {
        // Archive logic here (e.g., upload to S3)
        await this.exportToArchive(logsToArchive);

        // Delete archived logs from active database
        await db.AuditLog.destroy({
          where: {
            timestamp: { [Op.lt]: cutoffDate }
          }
        });

        console.log(`Archived ${logsToArchive.length} audit logs`);
      }

      return logsToArchive.length;
    } catch (error) {
      console.error('Archive error:', error);
      throw error;
    }
  }

  /**
   * Export logs to archive storage
   */
  async exportToArchive(logs) {
    // Implement S3 or other archive storage
    // For now, just log
    console.log(`Would archive ${logs.length} logs to storage`);
  }

  /**
   * Search logs by text
   */
  async searchLogs(searchText, options = {}) {
    try {
      // Use imported db
      const { limit = 100, offset = 0 } = options;

      const logs = await db.AuditLog.findAndCountAll({
        where: {
          [Op.or]: [
            { action: { [Op.iLike]: `%${searchText}%` } },
            { resource: { [Op.iLike]: `%${searchText}%` } },
            { details: { [Op.iLike]: `%${searchText}%` } }
          ]
        },
        limit,
        offset,
        order: [['timestamp', 'DESC']]
      });

      return logs;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(hours = 24) {
    try {
      // Use imported db
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hours);

      const events = await db.AuditLog.findAll({
        where: {
          timestamp: { [Op.gte]: cutoffTime },
          [Op.or]: [
            { severity: 'CRITICAL' },
            { severity: 'SECURITY' },
            { category: 'SECURITY' }
          ]
        },
        order: [['timestamp', 'DESC']]
      });

      return events;
    } catch (error) {
      console.error('Security events error:', error);
      throw error;
    }
  }

  /**
   * Clean shutdown
   */
  async shutdown() {
    console.log('Shutting down audit service...');
    clearInterval(this.flushInterval);
    await this.flushQueue();
    console.log('Audit service shutdown complete');
  }
}

// Singleton instance
const auditLogService = new AuditLogService();

// Audit action constants
const AuditActions = {
  // Authentication
  LOGIN: 'USER_LOGIN',
  LOGOUT: 'USER_LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  
  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  
  // Wallet Operations
  WALLET_CREATED: 'WALLET_CREATED',
  WALLET_UPDATED: 'WALLET_UPDATED',
  WALLET_DELETED: 'WALLET_DELETED',
  WALLET_FUNDED: 'WALLET_FUNDED',
  
  // Transactions
  TRANSACTION_INITIATED: 'TRANSACTION_INITIATED',
  TRANSACTION_APPROVED: 'TRANSACTION_APPROVED',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  TRANSACTION_COMPLETED: 'TRANSACTION_COMPLETED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Compliance
  KYC_INITIATED: 'KYC_INITIATED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  AML_ALERT: 'AML_ALERT',
  COMPLIANCE_CHECK: 'COMPLIANCE_CHECK',
  
  // System
  CONFIG_CHANGED: 'CONFIG_CHANGED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  
  // Data Access
  DATA_EXPORTED: 'DATA_EXPORTED',
  DATA_IMPORTED: 'DATA_IMPORTED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  BACKUP_CREATED: 'BACKUP_CREATED'
};

// Severity levels
const AuditSeverity = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
  SECURITY: 'SECURITY'
};

// Categories
const AuditCategory = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  FINANCIAL: 'FINANCIAL',
  COMPLIANCE: 'COMPLIANCE',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  GENERAL: 'GENERAL'
};

export default {
  auditLogService,
  AuditActions,
  AuditSeverity,
  AuditCategory
};
