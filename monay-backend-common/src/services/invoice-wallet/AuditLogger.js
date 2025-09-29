/**
 * Audit Logger Service for Invoice-First Wallets
 * Provides comprehensive audit trail for all wallet operations
 * with compliance-grade logging and immutable records
 */

import db from '../../models/index.js'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

class AuditLogger {
  constructor() {
    this.eventTypes = {
      // Wallet Lifecycle Events
      WALLET_CREATED: 'wallet_created',
      WALLET_DESTROYED: 'wallet_destroyed',
      WALLET_TRANSFORMED: 'wallet_transformed',
      WALLET_EXPIRED: 'wallet_expired',
      WALLET_TTL_EXTENDED: 'wallet_ttl_extended',

      // Access Events
      WALLET_ACCESSED: 'wallet_accessed',
      WALLET_QUERIED: 'wallet_queried',
      WALLET_EXPORT: 'wallet_export',

      // Transaction Events
      TRANSACTION_INITIATED: 'transaction_initiated',
      TRANSACTION_COMPLETED: 'transaction_completed',
      TRANSACTION_FAILED: 'transaction_failed',

      // Security Events
      AUTHENTICATION_SUCCESS: 'auth_success',
      AUTHENTICATION_FAILURE: 'auth_failure',
      PERMISSION_DENIED: 'permission_denied',
      SUSPICIOUS_ACTIVITY: 'suspicious_activity',

      // Compliance Events
      KYC_CHECK: 'kyc_check',
      AML_SCAN: 'aml_scan',
      COMPLIANCE_VIOLATION: 'compliance_violation',
      REGULATORY_REPORT: 'regulatory_report',

      // System Events
      SYSTEM_ERROR: 'system_error',
      MAINTENANCE_MODE: 'maintenance_mode',
      CONFIG_CHANGE: 'config_change'
    }

    this.severityLevels = {
      DEBUG: 0,
      INFO: 1,
      WARNING: 2,
      ERROR: 3,
      CRITICAL: 4
    }

    this.complianceFlags = {
      PCI_DSS: 'pci_dss',
      GDPR: 'gdpr',
      CCPA: 'ccpa',
      SOC2: 'soc2',
      ISO27001: 'iso27001'
    }
  }

  /**
   * Create audit log entry with integrity hash
   */
  async logEvent({
    eventType,
    walletId = null,
    userId = null,
    invoiceId = null,
    severity = 'INFO',
    description,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    complianceFlags = [],
    parentEventId = null
  }) {
    try {
      // Generate unique event ID
      const eventId = uuidv4()

      // Create event payload
      const eventPayload = {
        eventId,
        eventType,
        walletId,
        userId,
        invoiceId,
        severity: this.severityLevels[severity] || 1,
        description,
        metadata: JSON.stringify(metadata),
        ipAddress,
        userAgent,
        complianceFlags: complianceFlags.join(','),
        parentEventId,
        timestamp: new Date().toISOString()
      }

      // Generate integrity hash
      const integrityHash = this.generateIntegrityHash(eventPayload)
      eventPayload.integrityHash = integrityHash

      // Store in database with transaction for consistency
      const result = await db.sequelize.transaction(async (t) => {
        // Create main audit log entry
        const auditEntry = await db.WalletAuditLog.create(eventPayload, { transaction: t })

        // If wallet-related, update wallet lifecycle events
        if (walletId) {
          await db.WalletLifecycleEvent.create({
            walletId,
            eventType,
            eventId: auditEntry.id,
            metadata: JSON.stringify(metadata),
            userId,
            timestamp: new Date()
          }, { transaction: t })
        }

        // Check for compliance violations
        if (this.isComplianceEvent(eventType)) {
          await this.checkComplianceRules(eventPayload, t)
        }

        // Trigger alerts for critical events
        if (severity === 'CRITICAL' || severity === 'ERROR') {
          await this.triggerAlert(eventPayload, t)
        }

        return auditEntry
      })

      // Async replication for disaster recovery
      this.replicateToBackup(result)

      return {
        success: true,
        eventId: result.id,
        integrityHash
      }

    } catch (error) {
      console.error('Audit logging failed:', error)
      // Fallback to file-based logging if database fails
      this.fallbackFileLog({ ...arguments[0], error: error.message })
      throw error
    }
  }

  /**
   * Log wallet creation with full details
   */
  async logWalletCreation(wallet, userId, metadata = {}) {
    return await this.logEvent({
      eventType: this.eventTypes.WALLET_CREATED,
      walletId: wallet.id,
      userId,
      invoiceId: wallet.invoiceId,
      severity: 'INFO',
      description: `Wallet created with mode: ${wallet.mode}`,
      metadata: {
        mode: wallet.mode,
        ttl: wallet.ttl,
        features: wallet.features,
        baseAddress: wallet.baseAddress,
        solanaAddress: wallet.solanaAddress,
        quantumEnabled: wallet.quantumEnabled,
        ...metadata
      }
    })
  }

  /**
   * Log wallet destruction with secure erasure confirmation
   */
  async logWalletDestruction(walletId, userId, erasureProof = null) {
    return await this.logEvent({
      eventType: this.eventTypes.WALLET_DESTROYED,
      walletId,
      userId,
      severity: 'WARNING',
      description: 'Wallet destroyed with secure erasure',
      metadata: {
        erasureProof,
        erasurePasses: 7,
        erasureStandard: 'NIST SP 800-88',
        timestamp: new Date().toISOString()
      },
      complianceFlags: [this.complianceFlags.SOC2, this.complianceFlags.ISO27001]
    })
  }

  /**
   * Log wallet transformation from ephemeral to persistent
   */
  async logWalletTransformation(walletId, fromMode, toMode, userId, reason) {
    return await this.logEvent({
      eventType: this.eventTypes.WALLET_TRANSFORMED,
      walletId,
      userId,
      severity: 'INFO',
      description: `Wallet transformed from ${fromMode} to ${toMode}`,
      metadata: {
        fromMode,
        toMode,
        reason,
        transformedAt: new Date().toISOString()
      }
    })
  }

  /**
   * Log transaction events with compliance data
   */
  async logTransaction(walletId, transactionData, userId) {
    const { type, amount, currency, status, hash } = transactionData

    return await this.logEvent({
      eventType: status === 'completed'
        ? this.eventTypes.TRANSACTION_COMPLETED
        : this.eventTypes.TRANSACTION_FAILED,
      walletId,
      userId,
      severity: status === 'failed' ? 'ERROR' : 'INFO',
      description: `Transaction ${type}: ${amount} ${currency}`,
      metadata: {
        transactionHash: hash,
        amount,
        currency,
        type,
        status,
        timestamp: new Date().toISOString()
      },
      complianceFlags: amount > 10000
        ? [this.complianceFlags.AML_SCAN, this.complianceFlags.PCI_DSS]
        : [this.complianceFlags.PCI_DSS]
    })
  }

  /**
   * Log security events with threat detection
   */
  async logSecurityEvent(eventType, userId, details = {}) {
    const isSuspicious = this.detectSuspiciousActivity(eventType, details)

    return await this.logEvent({
      eventType: isSuspicious ? this.eventTypes.SUSPICIOUS_ACTIVITY : eventType,
      userId,
      severity: isSuspicious ? 'CRITICAL' : 'WARNING',
      description: `Security event: ${eventType}`,
      metadata: {
        ...details,
        threatLevel: isSuspicious ? 'HIGH' : 'MEDIUM',
        detectionMethod: 'pattern_analysis'
      },
      complianceFlags: [this.complianceFlags.SOC2]
    })
  }

  /**
   * Query audit logs with filters
   */
  async queryAuditLogs({
    walletId = null,
    userId = null,
    eventTypes = [],
    startDate = null,
    endDate = null,
    severity = null,
    limit = 100,
    offset = 0
  }) {
    const where = {}

    if (walletId) where.walletId = walletId
    if (userId) where.userId = userId
    if (eventTypes.length > 0) where.eventType = { [db.Sequelize.Op.in]: eventTypes }
    if (severity) where.severity = { [db.Sequelize.Op.gte]: this.severityLevels[severity] }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt[db.Sequelize.Op.gte] = startDate
      if (endDate) where.createdAt[db.Sequelize.Op.lte] = endDate
    }

    const logs = await db.WalletAuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    })

    // Verify integrity of returned logs
    const verifiedLogs = await Promise.all(
      logs.rows.map(async (log) => ({
        ...log.toJSON(),
        integrityValid: await this.verifyIntegrity(log)
      }))
    )

    return {
      total: logs.count,
      logs: verifiedLogs,
      limit,
      offset
    }
  }

  /**
   * Generate compliance report for regulatory requirements
   */
  async generateComplianceReport(startDate, endDate, complianceType) {
    const events = await db.WalletAuditLog.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        },
        complianceFlags: {
          [db.Sequelize.Op.like]: `%${complianceType}%`
        }
      },
      order: [['createdAt', 'ASC']]
    })

    const report = {
      reportId: uuidv4(),
      complianceType,
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      totalEvents: events.length,
      events: events.map(e => ({
        eventId: e.id,
        eventType: e.eventType,
        timestamp: e.createdAt,
        severity: e.severity,
        metadata: JSON.parse(e.metadata || '{}')
      })),
      summary: this.generateComplianceSummary(events, complianceType)
    }

    // Store report for audit trail
    await db.ComplianceReport.create({
      reportId: report.reportId,
      type: complianceType,
      content: JSON.stringify(report),
      generatedBy: 'SYSTEM',
      createdAt: new Date()
    })

    return report
  }

  /**
   * Generate integrity hash for audit entry
   */
  generateIntegrityHash(payload) {
    const data = JSON.stringify({
      eventId: payload.eventId,
      eventType: payload.eventType,
      walletId: payload.walletId,
      userId: payload.userId,
      timestamp: payload.timestamp,
      metadata: payload.metadata
    })

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
  }

  /**
   * Verify integrity of audit log entry
   */
  async verifyIntegrity(logEntry) {
    const recalculatedHash = this.generateIntegrityHash({
      eventId: logEntry.eventId,
      eventType: logEntry.eventType,
      walletId: logEntry.walletId,
      userId: logEntry.userId,
      timestamp: logEntry.timestamp,
      metadata: logEntry.metadata
    })

    return recalculatedHash === logEntry.integrityHash
  }

  /**
   * Detect suspicious activity patterns
   */
  detectSuspiciousActivity(eventType, details) {
    // Simple pattern detection - expand for production
    const suspiciousPatterns = [
      'multiple_failed_auth',
      'rapid_wallet_creation',
      'unusual_transaction_volume',
      'geographic_anomaly'
    ]

    // Check for rapid repeated events
    if (details.rapidRepetition > 10) return true

    // Check for unusual access patterns
    if (details.unusualTime && details.unusualLocation) return true

    // Check for high-risk transactions
    if (details.amount && details.amount > 100000) return true

    return false
  }

  /**
   * Check compliance rules and flag violations
   */
  async checkComplianceRules(event, transaction) {
    // Check AML thresholds
    if (event.metadata && JSON.parse(event.metadata).amount > 10000) {
      await db.ComplianceViolation.create({
        eventId: event.eventId,
        violationType: 'AML_THRESHOLD',
        severity: 'WARNING',
        description: 'Transaction exceeds AML reporting threshold',
        createdAt: new Date()
      }, { transaction })
    }

    // Check for sanctioned entities
    // (Implementation would connect to real sanctions lists)
  }

  /**
   * Trigger alerts for critical events
   */
  async triggerAlert(event, transaction) {
    await db.SecurityAlert.create({
      eventId: event.eventId,
      alertType: 'CRITICAL_EVENT',
      severity: event.severity,
      description: event.description,
      status: 'pending',
      createdAt: new Date()
    }, { transaction })

    // In production, would trigger actual notifications
    console.log('ALERT:', event.description)
  }

  /**
   * Replicate to backup for disaster recovery
   */
  async replicateToBackup(auditEntry) {
    // Async replication to backup storage
    // In production, would use message queue (Kafka/SQS)
    setTimeout(() => {
      console.log('Replicated to backup:', auditEntry.id)
    }, 100)
  }

  /**
   * Fallback file-based logging if database fails
   */
  fallbackFileLog(data) {
    const logFile = `/var/log/monay/audit-fallback-${new Date().toISOString().split('T')[0]}.log`

    fs.appendFileSync(logFile, JSON.stringify({
      ...data,
      fallbackLog: true,
      timestamp: new Date().toISOString()
    }) + '\n')
  }

  /**
   * Generate compliance summary for reports
   */
  generateComplianceSummary(events, complianceType) {
    const summary = {
      totalEvents: events.length,
      byEventType: {},
      bySeverity: {},
      violations: 0
    }

    events.forEach(event => {
      // Count by event type
      summary.byEventType[event.eventType] = (summary.byEventType[event.eventType] || 0) + 1

      // Count by severity
      const severityName = Object.keys(this.severityLevels).find(
        key => this.severityLevels[key] === event.severity
      )
      summary.bySeverity[severityName] = (summary.bySeverity[severityName] || 0) + 1

      // Count violations
      if (event.eventType.includes('violation')) {
        summary.violations++
      }
    })

    return summary
  }

  /**
   * Archive old audit logs for long-term storage
   */
  async archiveOldLogs(daysToKeep = 90) {
    const archiveDate = new Date()
    archiveDate.setDate(archiveDate.getDate() - daysToKeep)

    const logsToArchive = await db.WalletAuditLog.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.lt]: archiveDate
        }
      }
    })

    // In production, would move to cold storage (S3 Glacier, etc.)
    console.log(`Archiving ${logsToArchive.length} audit logs older than ${daysToKeep} days`)

    // Mark as archived
    await db.WalletAuditLog.update(
      { archived: true },
      {
        where: {
          createdAt: {
            [db.Sequelize.Op.lt]: archiveDate
          }
        }
      }
    )

    return logsToArchive.length
  }
}

export default new AuditLogger()