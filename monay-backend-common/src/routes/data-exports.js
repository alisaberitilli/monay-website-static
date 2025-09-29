import express from 'express';
import dataExportService from '../services/data-export.js';
import authenticate from '../middlewares/auth-middleware.js';
// import { authorize } from '../middleware/auth.js';  // TODO: Add role-based authorization
// import { auditAction } from '../middleware/audit.js';  // TODO: Add audit logging
import fs from 'fs';
import path from 'path';

const router = express.Router();

/**
 * @route POST /api/exports
 * @desc Create a new data export
 * @access Private
 */
router.post('/',
  authenticate,
  // authorize(['admin', 'developer', 'compliance']),  // TODO: Add role-based authorization
  // auditAction('DATA_EXPORT_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const {
        type,
        format,
        filters,
        fields,
        options
      } = req.body;

      // Validate export type
      const validTypes = ['transactions', 'wallets', 'users', 'audit-logs', 'analytics', 'compliance', 'all'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid export type. Must be one of: ${validTypes.join(', ')}`
        });
      }

      // Validate format
      const validFormats = ['csv', 'json', 'pdf', 'excel', 'xml'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({
          success: false,
          error: `Invalid format. Must be one of: ${validFormats.join(', ')}`
        });
      }

      // Create export job
      const exportJob = await dataExportService.createExport({
        type,
        format,
        filters: filters || {},
        fields: fields || [],
        userId: req.user?.id,
        tenantId: req.tenant?.id,
        options: options || {}
      });

      res.status(201).json({
        success: true,
        data: exportJob
      });
    } catch (error) {
      console.error('Create export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create export'
      });
    }
  }
);

/**
 * @route POST /api/exports/bulk
 * @desc Create bulk export
 * @access Private
 */
router.post('/bulk',
  authenticate,
  // authorize(['admin']),  // TODO: Add role-based authorization
  // auditAction('BULK_EXPORT_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { exports, format = 'zip' } = req.body;

      if (!exports || !Array.isArray(exports) || exports.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one export configuration is required'
        });
      }

      // Add user and tenant info to each export
      const exportConfigs = exports.map(exp => ({
        ...exp,
        userId: req.user?.id,
        tenantId: req.tenant?.id
      }));

      const bulkExport = await dataExportService.createBulkExport(exportConfigs, format);

      res.status(201).json({
        success: true,
        data: bulkExport
      });
    } catch (error) {
      console.error('Create bulk export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bulk export'
      });
    }
  }
);

/**
 * @route GET /api/exports/:id/status
 * @desc Get export status
 * @access Private
 */
router.get('/:id/status',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const exportJob = dataExportService.getExportStatus(id);

      if (!exportJob) {
        return res.status(404).json({
          success: false,
          error: 'Export not found'
        });
      }

      res.json({
        success: true,
        data: exportJob
      });
    } catch (error) {
      console.error('Get export status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get export status'
      });
    }
  }
);

/**
 * @route GET /api/exports/download/:id
 * @desc Download export file
 * @access Private
 */
router.get('/download/:id',
  authenticate,
  // auditAction('DATA_EXPORT_DOWNLOADED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      const filePath = dataExportService.getExportFilePath(id);

      if (!filePath) {
        return res.status(404).json({
          success: false,
          error: 'Export file not found or not ready'
        });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'Export file no longer exists'
        });
      }

      const filename = path.basename(filePath);
      const stat = fs.statSync(filePath);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stat.size);

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      console.error('Download export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download export'
      });
    }
  }
);

/**
 * @route POST /api/exports/:id/cancel
 * @desc Cancel export
 * @access Private
 */
router.post('/:id/cancel',
  authenticate,
  // auditAction('DATA_EXPORT_CANCELLED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      const exportJob = dataExportService.cancelExport(id);

      res.json({
        success: true,
        data: exportJob
      });
    } catch (error) {
      console.error('Cancel export error:', error);
      res.status(error.message === 'Export not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to cancel export'
      });
    }
  }
);

/**
 * @route POST /api/exports/schedule
 * @desc Create scheduled export
 * @access Private (Admin)
 */
router.post('/schedule',
  authenticate,
  // authorize(['admin']),  // TODO: Add role-based authorization
  // auditAction('SCHEDULED_EXPORT_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const {
        schedule,
        time,
        dayOfWeek,
        dayOfMonth,
        exportConfig,
        enabled
      } = req.body;

      // Validate schedule type
      const validSchedules = ['daily', 'weekly', 'monthly', 'custom'];
      if (!validSchedules.includes(schedule)) {
        return res.status(400).json({
          success: false,
          error: `Invalid schedule type. Must be one of: ${validSchedules.join(', ')}`
        });
      }

      // Validate time format (HH:mm)
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid time format. Must be HH:mm'
        });
      }

      // Add user and tenant info to export config
      exportConfig.userId = req.user?.id;
      exportConfig.tenantId = req.tenant?.id;

      const scheduledExport = await dataExportService.createScheduledExport({
        schedule,
        time,
        dayOfWeek,
        dayOfMonth,
        exportConfig,
        enabled: enabled !== false
      });

      res.status(201).json({
        success: true,
        data: scheduledExport
      });
    } catch (error) {
      console.error('Create scheduled export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create scheduled export'
      });
    }
  }
);

/**
 * @route GET /api/exports/scheduled
 * @desc List scheduled exports
 * @access Private (Admin)
 */
router.get('/scheduled',
  authenticate,
  // authorize(['admin']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const schedules = Array.from(dataExportService.schedules.values())
        .filter(s => s.exportConfig.tenantId === req.tenant?.id);

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('List scheduled exports error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list scheduled exports'
      });
    }
  }
);

/**
 * @route DELETE /api/exports/scheduled/:id
 * @desc Delete scheduled export
 * @access Private (Admin)
 */
router.delete('/scheduled/:id',
  authenticate,
  // authorize(['admin']),  // TODO: Add role-based authorization
  // auditAction('SCHEDULED_EXPORT_DELETED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      const schedule = dataExportService.schedules.get(id);

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Scheduled export not found'
        });
      }

      dataExportService.schedules.delete(id);

      res.json({
        success: true,
        message: 'Scheduled export deleted successfully'
      });
    } catch (error) {
      console.error('Delete scheduled export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete scheduled export'
      });
    }
  }
);

/**
 * @route GET /api/exports/templates
 * @desc Get export templates
 * @access Private
 */
router.get('/templates',
  authenticate,
  async (req, res) => {
    try {
      const templates = [
        {
          id: 'monthly-compliance',
          name: 'Monthly Compliance Report',
          description: 'Complete compliance data for the past month',
          type: 'compliance',
          format: 'pdf',
          filters: {
            dateRange: 'last-month'
          }
        },
        {
          id: 'transaction-audit',
          name: 'Transaction Audit Trail',
          description: 'Detailed transaction logs with audit information',
          type: 'transactions',
          format: 'excel',
          filters: {
            includeAudit: true
          }
        },
        {
          id: 'user-activity',
          name: 'User Activity Report',
          description: 'User login and activity statistics',
          type: 'audit-logs',
          format: 'csv',
          filters: {
            actions: ['LOGIN', 'LOGOUT']
          }
        },
        {
          id: 'financial-summary',
          name: 'Financial Summary',
          description: 'Wallet balances and transaction volumes',
          type: 'analytics',
          format: 'pdf',
          filters: {
            metrics: ['volume', 'balance', 'fees']
          }
        },
        {
          id: 'full-backup',
          name: 'Full System Backup',
          description: 'Complete export of all data',
          type: 'all',
          format: 'json',
          filters: {}
        }
      ];

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get export templates'
      });
    }
  }
);

/**
 * @route POST /api/exports/template/:templateId
 * @desc Create export from template
 * @access Private
 */
router.post('/template/:templateId',
  authenticate,
  // auditAction('TEMPLATE_EXPORT_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { templateId } = req.params;
      const { overrides = {} } = req.body;

      // Get template (in production, from database)
      const templates = {
        'monthly-compliance': {
          type: 'compliance',
          format: 'pdf',
          filters: { dateRange: 'last-month' }
        },
        'transaction-audit': {
          type: 'transactions',
          format: 'excel',
          filters: { includeAudit: true }
        },
        'user-activity': {
          type: 'audit-logs',
          format: 'csv',
          filters: { actions: ['LOGIN', 'LOGOUT'] }
        },
        'financial-summary': {
          type: 'analytics',
          format: 'pdf',
          filters: { metrics: ['volume', 'balance', 'fees'] }
        },
        'full-backup': {
          type: 'all',
          format: 'json',
          filters: {}
        }
      };

      const template = templates[templateId];
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }

      // Merge template with overrides
      const exportConfig = {
        ...template,
        ...overrides,
        userId: req.user?.id,
        tenantId: req.tenant?.id
      };

      const exportJob = await dataExportService.createExport(exportConfig);

      res.status(201).json({
        success: true,
        data: exportJob
      });
    } catch (error) {
      console.error('Create template export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create export from template'
      });
    }
  }
);

/**
 * @route GET /api/exports/history
 * @desc Get export history
 * @access Private
 */
router.get('/history',
  authenticate,
  async (req, res) => {
    try {
      const { limit = 50, status } = req.query;

      let exports = Array.from(dataExportService.exports.values())
        .filter(exp => exp.tenantId === req.tenant?.id)
        .sort((a, b) => b.createdAt - a.createdAt);

      if (status) {
        exports = exports.filter(exp => exp.status === status);
      }

      exports = exports.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: exports.map(exp => ({
          id: exp.id,
          type: exp.type,
          format: exp.format,
          status: exp.status,
          progress: exp.progress,
          recordCount: exp.recordCount,
          fileSize: exp.fileSize,
          downloadUrl: exp.downloadUrl,
          createdAt: exp.createdAt,
          completedAt: exp.completedAt,
          error: exp.error
        }))
      });
    } catch (error) {
      console.error('Get export history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get export history'
      });
    }
  }
);

export default router;