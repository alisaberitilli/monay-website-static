const express = require('express');
const router = express.Router();
const { auditLogService, AuditActions } = require('../services/audit-log');
const { authenticate, authorize } = require('../middleware/auth');
const { auditAction } = require('../middleware/audit');

/**
 * @route GET /api/audit-logs
 * @desc Get audit logs with filtering
 * @access Private (Admin/Compliance Officer)
 */
router.get('/',
  authenticate,
  authorize(['admin', 'compliance_officer', 'auditor']),
  async (req, res) => {
    try {
      const {
        userId,
        action,
        resource,
        startDate,
        endDate,
        severity,
        category,
        page = 1,
        limit = 50,
        orderBy = 'timestamp',
        orderDirection = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;

      const logs = await auditLogService.query({
        userId,
        tenantId: req.tenant?.id,
        action,
        resource,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        severity,
        category,
        limit: parseInt(limit),
        offset,
        orderBy,
        orderDirection
      });

      res.json({
        success: true,
        data: logs.rows,
        pagination: {
          total: logs.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(logs.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/user/:userId
 * @desc Get audit logs for specific user
 * @access Private (Admin or Self)
 */
router.get('/user/:userId',
  authenticate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;

      // Check authorization
      if (req.user.id !== userId && !['admin', 'compliance_officer'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to view these audit logs'
        });
      }

      const activity = await auditLogService.getUserActivity(userId, parseInt(days));

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user activity'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/compliance-report
 * @desc Generate compliance report
 * @access Private (Compliance Officer)
 */
router.get('/compliance-report',
  authenticate,
  authorize(['admin', 'compliance_officer', 'auditor']),
  auditAction(AuditActions.REPORT_GENERATED, {
    resource: 'compliance_report',
    category: 'COMPLIANCE'
  }),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
      }

      const report = await auditLogService.getComplianceReport(
        req.tenant?.id,
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate compliance report'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/security-events
 * @desc Get recent security events
 * @access Private (Admin/Security)
 */
router.get('/security-events',
  authenticate,
  authorize(['admin', 'security_admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const { hours = 24 } = req.query;

      const events = await auditLogService.getSecurityEvents(parseInt(hours));

      res.json({
        success: true,
        data: events,
        count: events.length,
        period: `Last ${hours} hours`
      });
    } catch (error) {
      console.error('Error fetching security events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch security events'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/search
 * @desc Search audit logs by text
 * @access Private (Admin)
 */
router.get('/search',
  authenticate,
  authorize(['admin', 'compliance_officer', 'auditor']),
  async (req, res) => {
    try {
      const { q, page = 1, limit = 50 } = req.query;

      if (!q || q.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 3 characters'
        });
      }

      const offset = (page - 1) * limit;

      const results = await auditLogService.searchLogs(q, {
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: results.rows,
        pagination: {
          total: results.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(results.count / limit)
        }
      });
    } catch (error) {
      console.error('Error searching audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search audit logs'
      });
    }
  }
);

/**
 * @route POST /api/audit-logs/archive
 * @desc Archive old audit logs
 * @access Private (Admin)
 */
router.post('/archive',
  authenticate,
  authorize(['admin']),
  auditAction(AuditActions.BACKUP_CREATED, {
    resource: 'audit_logs',
    severity: 'INFO',
    category: 'SYSTEM'
  }),
  async (req, res) => {
    try {
      const { daysToKeep = 90 } = req.body;

      const archivedCount = await auditLogService.archiveLogs(daysToKeep);

      res.json({
        success: true,
        message: `Archived ${archivedCount} audit logs older than ${daysToKeep} days`
      });
    } catch (error) {
      console.error('Error archiving audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to archive audit logs'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/export
 * @desc Export audit logs
 * @access Private (Admin/Compliance)
 */
router.get('/export',
  authenticate,
  authorize(['admin', 'compliance_officer', 'auditor']),
  auditAction(AuditActions.DATA_EXPORTED, {
    resource: 'audit_logs',
    category: 'COMPLIANCE'
  }),
  async (req, res) => {
    try {
      const {
        format = 'csv',
        startDate,
        endDate,
        userId,
        action,
        resource,
        severity,
        category
      } = req.query;

      const logs = await auditLogService.query({
        userId,
        tenantId: req.tenant?.id,
        action,
        resource,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        severity,
        category,
        limit: 10000, // Max export limit
        offset: 0
      });

      if (format === 'csv') {
        // Convert to CSV
        const csv = convertToCSV(logs.rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
        res.send(csv);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.json"');
        res.json(logs.rows);
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid format. Use csv or json'
        });
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export audit logs'
      });
    }
  }
);

/**
 * @route GET /api/audit-logs/stats
 * @desc Get audit log statistics
 * @access Private (Admin)
 */
router.get('/stats',
  authenticate,
  authorize(['admin', 'compliance_officer']),
  async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const db = require('../models');
      const { Op } = require('sequelize');
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await db.AuditLog.findAll({
        where: {
          tenantId: req.tenant?.id,
          timestamp: { [Op.gte]: startDate }
        },
        attributes: [
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total'],
          [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('userId'))), 'uniqueUsers'],
          'severity',
          'category'
        ],
        group: ['severity', 'category']
      });

      const dailyActivity = await db.AuditLog.findAll({
        where: {
          tenantId: req.tenant?.id,
          timestamp: { [Op.gte]: startDate }
        },
        attributes: [
          [db.sequelize.fn('DATE', db.sequelize.col('timestamp')), 'date'],
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: [db.sequelize.fn('DATE', db.sequelize.col('timestamp'))],
        order: [[db.sequelize.fn('DATE', db.sequelize.col('timestamp')), 'ASC']]
      });

      res.json({
        success: true,
        data: {
          summary: stats,
          dailyActivity,
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit statistics'
      });
    }
  }
);

/**
 * Helper function to convert logs to CSV
 */
function convertToCSV(logs) {
  if (!logs || logs.length === 0) return '';

  const headers = [
    'ID',
    'Timestamp',
    'User ID',
    'Action',
    'Resource',
    'Resource ID',
    'Severity',
    'Category',
    'IP Address',
    'Session ID',
    'Integrity Valid'
  ];

  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.userId || '',
    log.action,
    log.resource,
    log.resourceId || '',
    log.severity,
    log.category,
    log.ipAddress || '',
    log.sessionId || '',
    log.integrityValid ? 'Valid' : 'Invalid'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))
  ].join('\n');

  return csv;
}

module.exports = router;