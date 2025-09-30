/**
 * Analytics Routes
 * API endpoints for analytics and reporting
 * Phase 3 - Day 17: Analytics & Reporting System
 */

import express from 'express';
import { authenticateToken } from '../middleware-app/auth.js';
import analyticsService from '../services/analytics-service.js';
import { validateRequest } from '../middleware-app/validation.js';
import logger from '../services/logger.js';

const router = express.Router();

/**
 * @route POST /api/analytics/track/activity
 * @desc Track user activity
 * @access Private
 */
router.post('/track/activity', authenticateToken, async (req, res) => {
    try {
        const {
            sessionId,
            pageViews,
            actionsCount,
            deviceType,
            platform,
            browser,
            ipAddress,
            countryCode,
            city
        } = req.body;

        const result = await analyticsService.trackUserActivity(
            req.user.userId,
            {
                sessionId,
                pageViews,
                actionsCount,
                deviceType,
                platform,
                browser,
                ipAddress,
                countryCode,
                city
            }
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error tracking user activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track user activity'
        });
    }
});

/**
 * @route POST /api/analytics/track/transaction
 * @desc Track transaction for analytics
 * @access Private
 */
router.post('/track/transaction', authenticateToken, async (req, res) => {
    try {
        const result = await analyticsService.trackTransaction(req.body);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error tracking transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track transaction'
        });
    }
});

/**
 * @route POST /api/analytics/track/feature
 * @desc Track feature usage
 * @access Private
 */
router.post('/track/feature', authenticateToken, async (req, res) => {
    try {
        const { featureName } = req.body;

        if (!featureName) {
            return res.status(400).json({
                success: false,
                error: 'Feature name is required'
            });
        }

        const result = await analyticsService.trackFeatureUsage(
            featureName,
            req.user.userId
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error tracking feature usage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track feature usage'
        });
    }
});

/**
 * @route POST /api/analytics/track/funnel
 * @desc Track funnel progression
 * @access Private
 */
router.post('/track/funnel', authenticateToken, async (req, res) => {
    try {
        const { funnelName, stepNumber, completed } = req.body;

        if (!funnelName || stepNumber === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Funnel name and step number are required'
            });
        }

        const result = await analyticsService.trackFunnelStep(
            funnelName,
            stepNumber,
            req.user.userId,
            completed
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error tracking funnel step:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track funnel step'
        });
    }
});

/**
 * @route POST /api/analytics/track/kpi
 * @desc Track KPI value
 * @access Admin
 */
router.post('/track/kpi', authenticateToken, async (req, res) => {
    try {
        const { kpiName, value, category } = req.body;

        if (!kpiName || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'KPI name and value are required'
            });
        }

        const result = await analyticsService.trackKPI(kpiName, value, category);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error tracking KPI:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track KPI'
        });
    }
});

/**
 * @route GET /api/analytics/dashboard
 * @desc Get dashboard metrics
 * @access Private
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const { timeframe = 'today' } = req.query;

        const metrics = await analyticsService.getDashboardMetrics(
            req.user.userId,
            timeframe
        );

        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        logger.error('Error getting dashboard metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard metrics'
        });
    }
});

/**
 * @route GET /api/analytics/summary/:type
 * @desc Get analytics summary by type
 * @access Private
 */
router.get('/summary/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        const { startDate, endDate, groupBy } = req.query;

        const validTypes = ['transactions', 'revenue', 'users', 'cohort'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const summary = await analyticsService.getAnalyticsSummary(type, {
            startDate,
            endDate,
            groupBy
        });

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        logger.error('Error getting analytics summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics summary'
        });
    }
});

/**
 * @route GET /api/analytics/user/engagement
 * @desc Get user engagement metrics
 * @access Private
 */
router.get('/user/engagement', authenticateToken, async (req, res) => {
    try {
        const { periodDays = 30 } = req.query;

        const engagement = await analyticsService.calculateUserEngagement(
            req.user.userId,
            parseInt(periodDays)
        );

        res.json({
            success: true,
            data: engagement
        });
    } catch (error) {
        logger.error('Error getting user engagement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user engagement'
        });
    }
});

/**
 * @route POST /api/analytics/cohort/retention
 * @desc Calculate cohort retention
 * @access Admin
 */
router.post('/cohort/retention', authenticateToken, async (req, res) => {
    try {
        const { cohortDate, cohortType = 'signup' } = req.body;

        if (!cohortDate) {
            return res.status(400).json({
                success: false,
                error: 'Cohort date is required'
            });
        }

        const result = await analyticsService.calculateCohortRetention(
            cohortDate,
            cohortType
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error calculating cohort retention:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate cohort retention'
        });
    }
});

/**
 * @route POST /api/analytics/generate/report
 * @desc Generate custom report
 * @access Private
 */
router.post('/generate/report', authenticateToken, async (req, res) => {
    try {
        const { reportDefinitionId } = req.body;

        if (!reportDefinitionId) {
            return res.status(400).json({
                success: false,
                error: 'Report definition ID is required'
            });
        }

        const report = await analyticsService.generateReport(reportDefinitionId);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report'
        });
    }
});

/**
 * @route GET /api/analytics/reports
 * @desc Get available report definitions
 * @access Private
 */
router.get('/reports', authenticateToken, async (req, res) => {
    try {
        const reports = await db.sequelize.query(
            `SELECT id, report_name, report_type, schedule_frequency, is_active
             FROM report_definitions
             WHERE is_active = true
             ORDER BY report_name`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        logger.error('Error getting reports:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get reports'
        });
    }
});

/**
 * @route POST /api/analytics/reports
 * @desc Create report definition
 * @access Admin
 */
router.post('/reports', authenticateToken, async (req, res) => {
    try {
        const {
            reportName,
            reportType,
            queryDefinition,
            filters,
            grouping,
            sorting,
            chartType,
            isScheduled,
            scheduleFrequency,
            recipients
        } = req.body;

        if (!reportName || !reportType || !queryDefinition) {
            return res.status(400).json({
                success: false,
                error: 'Report name, type, and query definition are required'
            });
        }

        const [report] = await db.sequelize.query(
            `INSERT INTO report_definitions (
                report_name, report_type, query_definition,
                filters, grouping, sorting, chart_type,
                is_scheduled, schedule_frequency, recipients,
                created_by, is_active
            ) VALUES (
                :reportName, :reportType, :queryDefinition,
                :filters, :grouping, :sorting, :chartType,
                :isScheduled, :scheduleFrequency, :recipients,
                :createdBy, true
            ) RETURNING *`,
            {
                replacements: {
                    reportName,
                    reportType,
                    queryDefinition: JSON.stringify(queryDefinition),
                    filters: filters ? JSON.stringify(filters) : null,
                    grouping: grouping ? JSON.stringify(grouping) : null,
                    sorting: sorting ? JSON.stringify(sorting) : null,
                    chartType,
                    isScheduled: isScheduled || false,
                    scheduleFrequency,
                    recipients: recipients ? JSON.stringify(recipients) : null,
                    createdBy: req.user.userId
                },
                type: db.Sequelize.QueryTypes.INSERT
            }
        );

        res.json({
            success: true,
            data: report[0]
        });
    } catch (error) {
        logger.error('Error creating report definition:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create report definition'
        });
    }
});

/**
 * @route GET /api/analytics/reports/:reportId/executions
 * @desc Get report execution history
 * @access Private
 */
router.get('/reports/:reportId/executions', authenticateToken, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { limit = 10 } = req.query;

        const executions = await db.sequelize.query(
            `SELECT * FROM report_executions
             WHERE report_definition_id = :reportId
             ORDER BY created_at DESC
             LIMIT :limit`,
            {
                replacements: { reportId, limit: parseInt(limit) },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: executions
        });
    } catch (error) {
        logger.error('Error getting report executions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get report executions'
        });
    }
});

/**
 * @route GET /api/analytics/kpis
 * @desc Get KPI tracking data
 * @access Private
 */
router.get('/kpis', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, kpiName } = req.query;

        let query = `SELECT * FROM kpi_tracking WHERE 1=1`;
        const replacements = {};

        if (startDate) {
            query += ` AND date >= :startDate`;
            replacements.startDate = startDate;
        }

        if (endDate) {
            query += ` AND date <= :endDate`;
            replacements.endDate = endDate;
        }

        if (kpiName) {
            query += ` AND kpi_name = :kpiName`;
            replacements.kpiName = kpiName;
        }

        query += ` ORDER BY date DESC, kpi_name`;

        const kpis = await db.sequelize.query(query, {
            replacements,
            type: db.Sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: kpis
        });
    } catch (error) {
        logger.error('Error getting KPIs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get KPIs'
        });
    }
});

/**
 * @route POST /api/analytics/widgets
 * @desc Create dashboard widget
 * @access Private
 */
router.post('/widgets', authenticateToken, async (req, res) => {
    try {
        const {
            widgetName,
            widgetType,
            dataSource,
            queryConfig,
            refreshInterval,
            positionX,
            positionY,
            width,
            height,
            colorScheme
        } = req.body;

        if (!widgetName || !widgetType) {
            return res.status(400).json({
                success: false,
                error: 'Widget name and type are required'
            });
        }

        const [widget] = await db.sequelize.query(
            `INSERT INTO dashboard_widgets (
                user_id, widget_name, widget_type,
                data_source, query_config, refresh_interval_seconds,
                position_x, position_y, width, height, color_scheme
            ) VALUES (
                :userId, :widgetName, :widgetType,
                :dataSource, :queryConfig, :refreshInterval,
                :positionX, :positionY, :width, :height, :colorScheme
            ) RETURNING *`,
            {
                replacements: {
                    userId: req.user.userId,
                    widgetName,
                    widgetType,
                    dataSource,
                    queryConfig: queryConfig ? JSON.stringify(queryConfig) : null,
                    refreshInterval: refreshInterval || 300,
                    positionX: positionX || 0,
                    positionY: positionY || 0,
                    width: width || 4,
                    height: height || 2,
                    colorScheme: colorScheme || 'default'
                },
                type: db.Sequelize.QueryTypes.INSERT
            }
        );

        res.json({
            success: true,
            data: widget[0]
        });
    } catch (error) {
        logger.error('Error creating widget:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create widget'
        });
    }
});

/**
 * @route GET /api/analytics/widgets
 * @desc Get user's dashboard widgets
 * @access Private
 */
router.get('/widgets', authenticateToken, async (req, res) => {
    try {
        const widgets = await db.sequelize.query(
            `SELECT * FROM dashboard_widgets
             WHERE user_id = :userId AND is_visible = true
             ORDER BY position_y, position_x`,
            {
                replacements: { userId: req.user.userId },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: widgets
        });
    } catch (error) {
        logger.error('Error getting widgets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get widgets'
        });
    }
});

/**
 * @route PUT /api/analytics/widgets/:widgetId
 * @desc Update dashboard widget
 * @access Private
 */
router.put('/widgets/:widgetId', authenticateToken, async (req, res) => {
    try {
        const { widgetId } = req.params;
        const updates = req.body;

        // Build update query dynamically
        const updateFields = [];
        const replacements = { widgetId, userId: req.user.userId };

        Object.keys(updates).forEach(key => {
            if (['widgetName', 'positionX', 'positionY', 'width', 'height', 'colorScheme', 'isVisible'].includes(key)) {
                updateFields.push(`${key} = :${key}`);
                replacements[key] = updates[key];
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid update fields provided'
            });
        }

        await db.sequelize.query(
            `UPDATE dashboard_widgets
             SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = :widgetId AND user_id = :userId`,
            {
                replacements,
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        res.json({
            success: true,
            message: 'Widget updated successfully'
        });
    } catch (error) {
        logger.error('Error updating widget:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update widget'
        });
    }
});

/**
 * @route DELETE /api/analytics/widgets/:widgetId
 * @desc Delete dashboard widget (soft delete)
 * @access Private
 */
router.delete('/widgets/:widgetId', authenticateToken, async (req, res) => {
    try {
        const { widgetId } = req.params;

        await db.sequelize.query(
            `UPDATE dashboard_widgets
             SET is_visible = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = :widgetId AND user_id = :userId`,
            {
                replacements: {
                    widgetId,
                    userId: req.user.userId
                },
                type: db.Sequelize.QueryTypes.UPDATE
            }
        );

        res.json({
            success: true,
            message: 'Widget deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting widget:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete widget'
        });
    }
});

/**
 * @route POST /api/analytics/export
 * @desc Export analytics data
 * @access Private
 */
router.post('/export', authenticateToken, async (req, res) => {
    try {
        const {
            exportType,
            exportFormat,
            dateFrom,
            dateTo,
            dataScope
        } = req.body;

        if (!exportType || !exportFormat) {
            return res.status(400).json({
                success: false,
                error: 'Export type and format are required'
            });
        }

        // Log export for compliance
        const [exportLog] = await db.sequelize.query(
            `INSERT INTO data_export_logs (
                export_type, export_format,
                date_from, date_to,
                exported_by, export_reason
            ) VALUES (
                :exportType, :exportFormat,
                :dateFrom, :dateTo,
                :userId, :reason
            ) RETURNING id`,
            {
                replacements: {
                    exportType,
                    exportFormat,
                    dateFrom: dateFrom || null,
                    dateTo: dateTo || null,
                    userId: req.user.userId,
                    reason: 'User requested export'
                },
                type: db.Sequelize.QueryTypes.INSERT
            }
        );

        // Generate export (placeholder - actual implementation would generate file)
        const exportData = {
            exportId: exportLog[0].id,
            format: exportFormat,
            downloadUrl: `/api/analytics/export/${exportLog[0].id}/download`
        };

        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        logger.error('Error exporting analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export analytics'
        });
    }
});

/**
 * @route POST /api/analytics/custom-metric
 * @desc Track custom metric
 * @access Private
 */
router.post('/custom-metric', authenticateToken, async (req, res) => {
    try {
        const {
            metricName,
            metricType,
            value,
            dimensions,
            tags
        } = req.body;

        if (!metricName || value === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Metric name and value are required'
            });
        }

        await db.sequelize.query(
            `INSERT INTO custom_metrics (
                metric_name, metric_type, timestamp, value,
                dimension1_name, dimension1_value,
                dimension2_name, dimension2_value,
                tags
            ) VALUES (
                :metricName, :metricType, CURRENT_TIMESTAMP, :value,
                :dim1Name, :dim1Value,
                :dim2Name, :dim2Value,
                :tags
            )`,
            {
                replacements: {
                    metricName,
                    metricType: metricType || 'gauge',
                    value,
                    dim1Name: dimensions?.[0]?.name || null,
                    dim1Value: dimensions?.[0]?.value || null,
                    dim2Name: dimensions?.[1]?.name || null,
                    dim2Value: dimensions?.[1]?.value || null,
                    tags: tags ? JSON.stringify(tags) : null
                },
                type: db.Sequelize.QueryTypes.INSERT
            }
        );

        res.json({
            success: true,
            message: 'Custom metric tracked successfully'
        });
    } catch (error) {
        logger.error('Error tracking custom metric:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track custom metric'
        });
    }
});

export default router;