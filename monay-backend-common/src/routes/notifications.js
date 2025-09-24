/**
 * Notification Routes
 * API endpoints for notification management
 * Phase 3 - Day 16: Notifications & Alerts System
 */

import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import notificationService from '../services/notification-service.js';
import { validateRequest } from '../middlewares/validation.js';
import logger from '../services/logger.js';

const router = express.Router();

/**
 * @route GET /api/notifications/preferences
 * @desc Get user notification preferences
 * @access Private
 */
router.get('/preferences', authenticateToken, async (req, res) => {
    try {
        const preferences = await notificationService.getUserPreferences(req.user.userId);

        res.json({
            success: true,
            data: preferences
        });
    } catch (error) {
        logger.error('Error getting notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification preferences'
        });
    }
});

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user notification preferences
 * @access Private
 */
router.put('/preferences', authenticateToken, async (req, res) => {
    try {
        const validPreferences = [
            'email_enabled', 'sms_enabled', 'push_enabled', 'in_app_enabled',
            'transaction_alerts', 'transaction_threshold', 'large_transaction_alert',
            'international_transaction_alert', 'login_alerts', 'password_change_alerts',
            'device_change_alerts', 'suspicious_activity_alerts', 'low_balance_alerts',
            'low_balance_threshold', 'deposit_alerts', 'withdrawal_alerts',
            'payment_due_reminders', 'payment_success_alerts', 'payment_failure_alerts',
            'recurring_payment_alerts', 'card_transaction_alerts', 'card_expiry_reminders',
            'card_limit_alerts', 'money_request_alerts', 'money_received_alerts',
            'split_bill_alerts', 'trade_execution_alerts', 'dividend_alerts',
            'portfolio_alerts', 'market_alerts', 'points_earned_alerts',
            'reward_expiry_alerts', 'tier_change_alerts', 'offer_alerts',
            'promotional_emails', 'product_updates', 'newsletter',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'quiet_hours_timezone', 'digest_frequency'
        ];

        // Filter valid preferences
        const preferences = {};
        Object.keys(req.body).forEach(key => {
            if (validPreferences.includes(key)) {
                preferences[key] = req.body[key];
            }
        });

        const updated = await notificationService.updatePreferences(
            req.user.userId,
            preferences
        );

        res.json({
            success: true,
            data: updated
        });
    } catch (error) {
        logger.error('Error updating notification preferences:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification preferences'
        });
    }
});

/**
 * @route POST /api/notifications/send
 * @desc Send a notification (admin only)
 * @access Admin
 */
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { userId, templateCode, variables, options } = req.body;

        if (!userId || !templateCode) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId and templateCode'
            });
        }

        const result = await notificationService.sendNotification(
            userId,
            templateCode,
            variables || {},
            options || {}
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send notification'
        });
    }
});

/**
 * @route GET /api/notifications/in-app
 * @desc Get in-app messages
 * @access Private
 */
router.get('/in-app', authenticateToken, async (req, res) => {
    try {
        const { status = 'unread' } = req.query;

        const messages = await notificationService.getInAppMessages(
            req.user.userId,
            status
        );

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        logger.error('Error getting in-app messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get in-app messages'
        });
    }
});

/**
 * @route PUT /api/notifications/in-app/:messageId/read
 * @desc Mark in-app message as read
 * @access Private
 */
router.put('/in-app/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;

        await notificationService.markAsRead(req.user.userId, messageId);

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        logger.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark message as read'
        });
    }
});

/**
 * @route PUT /api/notifications/in-app/:messageId/dismiss
 * @desc Dismiss in-app message
 * @access Private
 */
router.put('/in-app/:messageId/dismiss', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;

        await notificationService.dismissMessage(req.user.userId, messageId);

        res.json({
            success: true,
            message: 'Message dismissed'
        });
    } catch (error) {
        logger.error('Error dismissing message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to dismiss message'
        });
    }
});

/**
 * @route GET /api/notifications/history
 * @desc Get notification history
 * @access Private
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const history = await notificationService.getNotificationHistory(
            req.user.userId,
            { limit: parseInt(limit), offset: parseInt(offset) }
        );

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error('Error getting notification history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification history'
        });
    }
});

/**
 * @route POST /api/notifications/alert-rules
 * @desc Create custom alert rule
 * @access Private
 */
router.post('/alert-rules', authenticateToken, async (req, res) => {
    try {
        const {
            ruleName,
            ruleType,
            conditions,
            channels,
            templateId,
            customMessage,
            isActive,
            priority,
            cooldownMinutes
        } = req.body;

        if (!ruleName || !ruleType || !conditions) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: ruleName, ruleType, and conditions'
            });
        }

        const rule = await notificationService.createAlertRule(req.user.userId, {
            ruleName,
            ruleType,
            conditions,
            channels,
            templateId,
            customMessage,
            isActive,
            priority,
            cooldownMinutes
        });

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        logger.error('Error creating alert rule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create alert rule'
        });
    }
});

/**
 * @route GET /api/notifications/alert-rules
 * @desc Get user's alert rules
 * @access Private
 */
router.get('/alert-rules', authenticateToken, async (req, res) => {
    try {
        const rules = await notificationService.getUserAlertRules(req.user.userId);

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        logger.error('Error getting alert rules:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get alert rules'
        });
    }
});

/**
 * @route PUT /api/notifications/alert-rules/:ruleId
 * @desc Update alert rule
 * @access Private
 */
router.put('/alert-rules/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { ruleId } = req.params;
        const updates = req.body;

        const rule = await notificationService.updateAlertRule(
            req.user.userId,
            ruleId,
            updates
        );

        res.json({
            success: true,
            data: rule
        });
    } catch (error) {
        logger.error('Error updating alert rule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update alert rule'
        });
    }
});

/**
 * @route DELETE /api/notifications/alert-rules/:ruleId
 * @desc Delete alert rule (soft delete)
 * @access Private
 */
router.delete('/alert-rules/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { ruleId } = req.params;

        await notificationService.deleteAlertRule(req.user.userId, ruleId);

        res.json({
            success: true,
            message: 'Alert rule deleted'
        });
    } catch (error) {
        logger.error('Error deleting alert rule:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete alert rule'
        });
    }
});

/**
 * @route POST /api/notifications/device-tokens
 * @desc Register device token for push notifications
 * @access Private
 */
router.post('/device-tokens', authenticateToken, async (req, res) => {
    try {
        const {
            deviceId,
            platform,
            pushToken,
            tokenType,
            deviceName,
            deviceModel,
            osVersion,
            appVersion
        } = req.body;

        if (!deviceId || !platform || !pushToken) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: deviceId, platform, and pushToken'
            });
        }

        const token = await notificationService.registerDeviceToken(req.user.userId, {
            deviceId,
            platform,
            pushToken,
            tokenType,
            deviceName,
            deviceModel,
            osVersion,
            appVersion
        });

        res.json({
            success: true,
            data: token
        });
    } catch (error) {
        logger.error('Error registering device token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register device token'
        });
    }
});

/**
 * @route DELETE /api/notifications/device-tokens/:deviceId
 * @desc Unregister device token
 * @access Private
 */
router.delete('/device-tokens/:deviceId', authenticateToken, async (req, res) => {
    try {
        const { deviceId } = req.params;

        await notificationService.unregisterDeviceToken(req.user.userId, deviceId);

        res.json({
            success: true,
            message: 'Device token unregistered'
        });
    } catch (error) {
        logger.error('Error unregistering device token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unregister device token'
        });
    }
});

/**
 * @route GET /api/notifications/device-tokens
 * @desc Get user's registered devices
 * @access Private
 */
router.get('/device-tokens', authenticateToken, async (req, res) => {
    try {
        const devices = await notificationService.getUserDevices(req.user.userId);

        res.json({
            success: true,
            data: devices
        });
    } catch (error) {
        logger.error('Error getting user devices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user devices'
        });
    }
});

/**
 * @route POST /api/notifications/test
 * @desc Send test notification
 * @access Private
 */
router.post('/test', authenticateToken, async (req, res) => {
    try {
        const { channel = 'in_app' } = req.body;

        const result = await notificationService.sendNotification(
            req.user.userId,
            'TEST_NOTIFICATION',
            {
                timestamp: new Date().toISOString(),
                channel
            },
            { channel }
        );

        res.json({
            success: true,
            data: result,
            message: 'Test notification sent'
        });
    } catch (error) {
        logger.error('Error sending test notification:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send test notification'
        });
    }
});

/**
 * @route GET /api/notifications/analytics
 * @desc Get notification analytics (admin only)
 * @access Admin
 */
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const analytics = await notificationService.getAnalytics({
            startDate,
            endDate
        });

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        logger.error('Error getting notification analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification analytics'
        });
    }
});

/**
 * @route POST /api/notifications/bulk
 * @desc Send bulk notifications (admin only)
 * @access Admin
 */
router.post('/bulk', authenticateToken, async (req, res) => {
    try {
        const { userIds, templateCode, variables, options } = req.body;

        if (!userIds || !Array.isArray(userIds) || !templateCode) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userIds (array) and templateCode'
            });
        }

        const results = await Promise.allSettled(
            userIds.map(userId =>
                notificationService.sendNotification(
                    userId,
                    templateCode,
                    variables || {},
                    options || {}
                )
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        res.json({
            success: true,
            data: {
                total: userIds.length,
                successful,
                failed,
                results: results.map((r, i) => ({
                    userId: userIds[i],
                    status: r.status,
                    result: r.status === 'fulfilled' ? r.value : null,
                    error: r.status === 'rejected' ? r.reason?.message : null
                }))
            }
        });
    } catch (error) {
        logger.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send bulk notifications'
        });
    }
});

/**
 * @route POST /api/notifications/unsubscribe
 * @desc Unsubscribe from specific notification types
 * @access Private
 */
router.post('/unsubscribe', authenticateToken, async (req, res) => {
    try {
        const { notificationType } = req.body;

        if (!notificationType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: notificationType'
            });
        }

        const preferences = {};
        preferences[`${notificationType}_alerts`] = false;

        await notificationService.updatePreferences(req.user.userId, preferences);

        res.json({
            success: true,
            message: `Unsubscribed from ${notificationType} notifications`
        });
    } catch (error) {
        logger.error('Error unsubscribing from notifications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unsubscribe from notifications'
        });
    }
});

/**
 * @route GET /api/notifications/templates
 * @desc Get available notification templates (admin only)
 * @access Admin
 */
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const templates = await notificationService.getTemplates();

        res.json({
            success: true,
            data: templates
        });
    } catch (error) {
        logger.error('Error getting notification templates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notification templates'
        });
    }
});

/**
 * @route POST /api/notifications/templates
 * @desc Create notification template (admin only)
 * @access Admin
 */
router.post('/templates', authenticateToken, async (req, res) => {
    try {
        const template = await notificationService.createTemplate(req.body);

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        logger.error('Error creating notification template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create notification template'
        });
    }
});

/**
 * @route PUT /api/notifications/templates/:templateId
 * @desc Update notification template (admin only)
 * @access Admin
 */
router.put('/templates/:templateId', authenticateToken, async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = await notificationService.updateTemplate(templateId, req.body);

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        logger.error('Error updating notification template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update notification template'
        });
    }
});

export default router;