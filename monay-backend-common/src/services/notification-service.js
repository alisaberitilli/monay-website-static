/**
 * Notification Service
 * Handles all notification channels: email, SMS, push, and in-app
 * Phase 3 - Day 16: Notifications & Alerts System
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import logger from './logger.js';
import redisClient from '../config/redis.js';
import kafkaProducer from '../config/kafka.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Provider imports (these would be actual provider SDKs)
// import sgMail from '@sendgrid/mail';
// import twilio from 'twilio';
// import admin from 'firebase-admin';

class NotificationService {
    constructor() {
        this.initializeProviders();
    }

    /**
     * Initialize notification providers
     */
    initializeProviders() {
        // Email provider (SendGrid)
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // SMS provider (Twilio)
        // this.twilioClient = twilio(
        //     process.env.TWILIO_ACCOUNT_SID,
        //     process.env.TWILIO_AUTH_TOKEN
        // );

        // Push provider (Firebase)
        // admin.initializeApp({
        //     credential: admin.credential.cert({
        //         // Firebase service account
        //     })
        // });

        logger.info('Notification providers initialized');
    }

    /**
     * Send notification through multiple channels
     */
    async sendNotification(userId, templateCode, variables = {}, options = {}) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get user preferences
            const preferences = await this.getUserPreferences(userId);

            // Get notification template
            const template = await this.getTemplate(templateCode);
            if (!template) {
                throw new Error(`Template not found: ${templateCode}`);
            }

            // Process template with variables
            const processedContent = this.processTemplate(template, variables);

            // Create notification record
            const notification = await db.sequelize.query(
                `INSERT INTO notifications (
                    user_id, template_id, notification_type, notification_category,
                    title, message, channel, priority, action_url, metadata
                ) VALUES (
                    :userId, :templateId, :notificationType, :notificationCategory,
                    :title, :message, :channel, :priority, :actionUrl, :metadata
                ) RETURNING *`,
                {
                    replacements: {
                        userId,
                        templateId: template.id,
                        notificationType: template.template_code,
                        notificationCategory: template.template_category,
                        title: processedContent.title,
                        message: processedContent.message,
                        channel: options.channel || 'all',
                        priority: options.priority || template.priority || 'normal',
                        actionUrl: processedContent.actionUrl,
                        metadata: JSON.stringify(options.metadata || {})
                    },
                    type: db.Sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            const notificationId = notification[0][0].id;

            // Determine channels to use
            const channels = this.determineChannels(preferences, options.channel, template);

            // Queue notifications for each channel
            for (const channel of channels) {
                await this.queueNotification(notificationId, userId, channel, processedContent, transaction);
            }

            await transaction.commit();

            // Process queue asynchronously
            this.processNotificationQueue();

            return {
                success: true,
                notificationId,
                channels
            };

        } catch (error) {
            await transaction.rollback();
            logger.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * Get user notification preferences
     */
    async getUserPreferences(userId) {
        const [preferences] = await db.sequelize.query(
            `SELECT * FROM notification_preferences WHERE user_id = :userId`,
            {
                replacements: { userId },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        // Return default preferences if none exist
        if (!preferences) {
            return {
                email_enabled: true,
                sms_enabled: true,
                push_enabled: true,
                in_app_enabled: true,
                quiet_hours_enabled: false,
                digest_frequency: 'immediate'
            };
        }

        return preferences;
    }

    /**
     * Update user notification preferences
     */
    async updatePreferences(userId, preferences) {
        try {
            const [result] = await db.sequelize.query(
                `INSERT INTO notification_preferences (user_id, ${Object.keys(preferences).join(', ')})
                 VALUES (:userId, ${Object.keys(preferences).map(k => ':' + k).join(', ')})
                 ON CONFLICT (user_id) DO UPDATE
                 SET ${Object.keys(preferences).map(k => `${k} = EXCLUDED.${k}`).join(', ')},
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                {
                    replacements: { userId, ...preferences },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return result[0];

        } catch (error) {
            logger.error('Error updating preferences:', error);
            throw error;
        }
    }

    /**
     * Get notification template
     */
    async getTemplate(templateCode) {
        const [template] = await db.sequelize.query(
            `SELECT * FROM notification_templates
             WHERE template_code = :templateCode AND is_active = true`,
            {
                replacements: { templateCode },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );

        return template;
    }

    /**
     * Process template with variables
     */
    processTemplate(template, variables) {
        let title = template.in_app_title || '';
        let message = template.in_app_body || '';
        let emailSubject = template.email_subject || '';
        let emailBody = template.email_body_text || '';
        let smsBody = template.sms_body || '';
        let pushTitle = template.push_title || '';
        let pushBody = template.push_body || '';

        // Replace variables
        Object.keys(variables).forEach(key => {
            const value = variables[key];
            const placeholder = `{{${key}}}`;

            title = title.replace(new RegExp(placeholder, 'g'), value);
            message = message.replace(new RegExp(placeholder, 'g'), value);
            emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), value);
            emailBody = emailBody.replace(new RegExp(placeholder, 'g'), value);
            smsBody = smsBody.replace(new RegExp(placeholder, 'g'), value);
            pushTitle = pushTitle.replace(new RegExp(placeholder, 'g'), value);
            pushBody = pushBody.replace(new RegExp(placeholder, 'g'), value);
        });

        return {
            title,
            message,
            emailSubject,
            emailBody,
            smsBody,
            pushTitle,
            pushBody,
            actionUrl: template.in_app_action
        };
    }

    /**
     * Determine which channels to use
     */
    determineChannels(preferences, requestedChannel, template) {
        if (requestedChannel && requestedChannel !== 'all') {
            return [requestedChannel];
        }

        const channels = [];

        if (preferences.email_enabled && template.email_subject) {
            channels.push('email');
        }
        if (preferences.sms_enabled && template.sms_body) {
            channels.push('sms');
        }
        if (preferences.push_enabled && template.push_title) {
            channels.push('push');
        }
        if (preferences.in_app_enabled) {
            channels.push('in_app');
        }

        // Check quiet hours
        if (preferences.quiet_hours_enabled && this.isQuietHours(preferences)) {
            // Only allow in-app during quiet hours
            return channels.filter(c => c === 'in_app');
        }

        return channels;
    }

    /**
     * Check if current time is in quiet hours
     */
    isQuietHours(preferences) {
        if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
            return false;
        }

        const now = new Date();
        const timezone = preferences.quiet_hours_timezone || 'UTC';

        // Convert to user's timezone
        const userTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        const currentHour = userTime.getHours();
        const currentMinute = userTime.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [startHour, startMinute] = preferences.quiet_hours_start.split(':').map(Number);
        const [endHour, endMinute] = preferences.quiet_hours_end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        } else {
            // Quiet hours span midnight
            return currentTime >= startTime || currentTime <= endTime;
        }
    }

    /**
     * Queue notification for processing
     */
    async queueNotification(notificationId, userId, channel, content, transaction) {
        // Get recipient based on channel
        const recipient = await this.getRecipient(userId, channel);

        if (!recipient) {
            logger.warn(`No recipient found for user ${userId} on channel ${channel}`);
            return;
        }

        await db.sequelize.query(
            `INSERT INTO notification_queue (
                notification_id, channel, recipient, status, scheduled_for
            ) VALUES (
                :notificationId, :channel, :recipient, 'pending', CURRENT_TIMESTAMP
            )`,
            {
                replacements: {
                    notificationId,
                    channel,
                    recipient
                },
                type: db.Sequelize.QueryTypes.INSERT,
                transaction
            }
        );
    }

    /**
     * Get recipient contact for channel
     */
    async getRecipient(userId, channel) {
        switch (channel) {
            case 'email':
                const [user] = await db.sequelize.query(
                    `SELECT email FROM users WHERE id = :userId`,
                    {
                        replacements: { userId },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                return user?.email;

            case 'sms':
                const [phone] = await db.sequelize.query(
                    `SELECT phone_number FROM users WHERE id = :userId`,
                    {
                        replacements: { userId },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                return phone?.phone_number;

            case 'push':
                const [token] = await db.sequelize.query(
                    `SELECT push_token FROM device_tokens
                     WHERE user_id = :userId AND is_active = true
                     ORDER BY is_primary DESC, last_used_at DESC NULLS LAST
                     LIMIT 1`,
                    {
                        replacements: { userId },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );
                return token?.push_token;

            case 'in_app':
                return userId; // In-app uses user ID

            default:
                return null;
        }
    }

    /**
     * Process notification queue
     */
    async processNotificationQueue() {
        try {
            // Get pending notifications
            const pendingNotifications = await db.sequelize.query(
                `SELECT * FROM notification_queue
                 WHERE status = 'pending'
                 AND scheduled_for <= CURRENT_TIMESTAMP
                 ORDER BY created_at ASC
                 LIMIT 100`,
                {
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            for (const item of pendingNotifications) {
                await this.processQueueItem(item);
            }

        } catch (error) {
            logger.error('Error processing notification queue:', error);
        }
    }

    /**
     * Process individual queue item
     */
    async processQueueItem(item) {
        try {
            // Update status to processing
            await db.sequelize.query(
                `UPDATE notification_queue
                 SET status = 'processing', updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                {
                    replacements: { id: item.id },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            // Get notification details
            const [notification] = await db.sequelize.query(
                `SELECT n.*, t.*
                 FROM notifications n
                 LEFT JOIN notification_templates t ON n.template_id = t.id
                 WHERE n.id = :notificationId`,
                {
                    replacements: { notificationId: item.notification_id },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Send based on channel
            let success = false;
            let messageId = null;
            let errorMessage = null;

            switch (item.channel) {
                case 'email':
                    ({ success, messageId, errorMessage } = await this.sendEmail(
                        item.recipient,
                        notification
                    ));
                    break;

                case 'sms':
                    ({ success, messageId, errorMessage } = await this.sendSMS(
                        item.recipient,
                        notification
                    ));
                    break;

                case 'push':
                    ({ success, messageId, errorMessage } = await this.sendPushNotification(
                        item.recipient,
                        notification
                    ));
                    break;

                case 'in_app':
                    ({ success, messageId, errorMessage } = await this.createInAppMessage(
                        item.recipient,
                        notification
                    ));
                    break;
            }

            // Update queue item status
            if (success) {
                await db.sequelize.query(
                    `UPDATE notification_queue
                     SET status = 'sent',
                         processed_at = CURRENT_TIMESTAMP,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    {
                        replacements: { id: item.id },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );

                // Update notification status
                await db.sequelize.query(
                    `UPDATE notifications
                     SET status = 'sent',
                         sent_at = CURRENT_TIMESTAMP,
                         ${item.channel}_message_id = :messageId,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :notificationId`,
                    {
                        replacements: {
                            notificationId: item.notification_id,
                            messageId
                        },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );

                // Update analytics
                await this.updateAnalytics(notification, 'sent');

            } else {
                // Handle retry logic
                const shouldRetry = item.retry_count < 3;
                const nextRetryAt = shouldRetry ?
                    new Date(Date.now() + Math.pow(2, item.retry_count) * 60000) : null;

                await db.sequelize.query(
                    `UPDATE notification_queue
                     SET status = :status,
                         retry_count = retry_count + 1,
                         next_retry_at = :nextRetryAt,
                         error_message = :errorMessage,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    {
                        replacements: {
                            id: item.id,
                            status: shouldRetry ? 'pending' : 'failed',
                            nextRetryAt,
                            errorMessage
                        },
                        type: db.Sequelize.QueryTypes.UPDATE
                    }
                );

                if (!shouldRetry) {
                    await db.sequelize.query(
                        `UPDATE notifications
                         SET status = 'failed',
                             failed_at = CURRENT_TIMESTAMP,
                             error_message = :errorMessage,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = :notificationId`,
                        {
                            replacements: {
                                notificationId: item.notification_id,
                                errorMessage
                            },
                            type: db.Sequelize.QueryTypes.UPDATE
                        }
                    );

                    // Update analytics
                    await this.updateAnalytics(notification, 'failed');
                }
            }

        } catch (error) {
            logger.error('Error processing queue item:', error);
        }
    }

    /**
     * Send email notification
     */
    async sendEmail(recipient, notification) {
        try {
            // Check suppression list
            const [suppressed] = await db.sequelize.query(
                `SELECT * FROM email_suppression_list
                 WHERE email_address = :email
                 AND (is_permanent = true OR expires_at > CURRENT_TIMESTAMP)`,
                {
                    replacements: { email: recipient },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (suppressed) {
                return {
                    success: false,
                    errorMessage: 'Email address is suppressed'
                };
            }

            // Send via provider (placeholder)
            // const msg = {
            //     to: recipient,
            //     from: process.env.NOTIFICATION_FROM_EMAIL,
            //     subject: notification.email_subject || notification.title,
            //     text: notification.email_body_text || notification.message,
            //     html: notification.email_body_html || notification.message
            // };

            // const response = await sgMail.send(msg);

            // Simulate success for now
            const messageId = `email_${uuidv4()}`;

            return {
                success: true,
                messageId
            };

        } catch (error) {
            logger.error('Error sending email:', error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }

    /**
     * Send SMS notification
     */
    async sendSMS(recipient, notification) {
        try {
            // Check blacklist
            const [blacklisted] = await db.sequelize.query(
                `SELECT * FROM sms_blacklist WHERE phone_number = :phone`,
                {
                    replacements: { phone: recipient },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (blacklisted) {
                return {
                    success: false,
                    errorMessage: 'Phone number is blacklisted'
                };
            }

            // Send via provider (placeholder)
            // const message = await this.twilioClient.messages.create({
            //     body: notification.sms_body || notification.message,
            //     from: process.env.TWILIO_PHONE_NUMBER,
            //     to: recipient
            // });

            // Simulate success for now
            const messageId = `sms_${uuidv4()}`;

            return {
                success: true,
                messageId
            };

        } catch (error) {
            logger.error('Error sending SMS:', error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }

    /**
     * Send push notification
     */
    async sendPushNotification(token, notification) {
        try {
            // Send via provider (placeholder)
            // const message = {
            //     notification: {
            //         title: notification.push_title || notification.title,
            //         body: notification.push_body || notification.message
            //     },
            //     token: token
            // };

            // const response = await admin.messaging().send(message);

            // Simulate success for now
            const messageId = `push_${uuidv4()}`;

            return {
                success: true,
                messageId
            };

        } catch (error) {
            logger.error('Error sending push notification:', error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }

    /**
     * Create in-app message
     */
    async createInAppMessage(userId, notification) {
        try {
            const [result] = await db.sequelize.query(
                `INSERT INTO in_app_messages (
                    user_id, message_type, title, message,
                    icon, color, position, is_dismissible,
                    action_button_text, action_url
                ) VALUES (
                    :userId, :messageType, :title, :message,
                    :icon, :color, :position, :isDismissible,
                    :actionButtonText, :actionUrl
                ) RETURNING id`,
                {
                    replacements: {
                        userId,
                        messageType: this.getMessageType(notification.notification_category),
                        title: notification.title,
                        message: notification.message,
                        icon: this.getIcon(notification.notification_category),
                        color: this.getColor(notification.priority),
                        position: 'top',
                        isDismissible: true,
                        actionButtonText: notification.requires_action ? 'View' : null,
                        actionUrl: notification.action_url
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            // Publish to WebSocket for real-time delivery
            await this.publishToWebSocket(userId, {
                type: 'notification',
                data: {
                    id: result[0].id,
                    title: notification.title,
                    message: notification.message,
                    timestamp: new Date()
                }
            });

            return {
                success: true,
                messageId: result[0].id
            };

        } catch (error) {
            logger.error('Error creating in-app message:', error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }

    /**
     * Get message type based on category
     */
    getMessageType(category) {
        const typeMap = {
            'transaction': 'alert',
            'security': 'warning',
            'account': 'alert',
            'payment': 'alert',
            'rewards': 'success',
            'marketing': 'promotion',
            'system': 'announcement'
        };
        return typeMap[category] || 'alert';
    }

    /**
     * Get icon based on category
     */
    getIcon(category) {
        const iconMap = {
            'transaction': 'payment',
            'security': 'shield',
            'account': 'account_balance',
            'payment': 'send',
            'card': 'credit_card',
            'rewards': 'star',
            'investment': 'trending_up'
        };
        return iconMap[category] || 'notifications';
    }

    /**
     * Get color based on priority
     */
    getColor(priority) {
        const colorMap = {
            'low': 'gray',
            'normal': 'blue',
            'high': 'orange',
            'critical': 'red'
        };
        return colorMap[priority] || 'blue';
    }

    /**
     * Publish to WebSocket for real-time delivery
     */
    async publishToWebSocket(userId, message) {
        try {
            // Publish to Redis for Socket.io
            await redisClient.publish(
                `user:${userId}:notifications`,
                JSON.stringify(message)
            );
        } catch (error) {
            logger.error('Error publishing to WebSocket:', error);
        }
    }

    /**
     * Update notification analytics
     */
    async updateAnalytics(notification, event) {
        try {
            const date = new Date();
            const hour = date.getHours();

            await db.sequelize.query(
                `INSERT INTO notification_analytics (
                    date, hour, channel, notification_type, template_id,
                    ${event}_count
                ) VALUES (
                    CURRENT_DATE, :hour, :channel, :type, :templateId, 1
                )
                ON CONFLICT (date, hour, channel, notification_type, template_id)
                DO UPDATE SET ${event}_count = notification_analytics.${event}_count + 1`,
                {
                    replacements: {
                        hour,
                        channel: notification.channel,
                        type: notification.notification_type,
                        templateId: notification.template_id
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );
        } catch (error) {
            logger.error('Error updating analytics:', error);
        }
    }

    /**
     * Get unread in-app messages
     */
    async getInAppMessages(userId, status = 'unread') {
        try {
            const messages = await db.sequelize.query(
                `SELECT * FROM in_app_messages
                 WHERE user_id = :userId
                 AND status = :status
                 AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
                 ORDER BY created_at DESC
                 LIMIT 50`,
                {
                    replacements: { userId, status },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            return messages;

        } catch (error) {
            logger.error('Error getting in-app messages:', error);
            throw error;
        }
    }

    /**
     * Mark message as read
     */
    async markAsRead(userId, messageId) {
        try {
            await db.sequelize.query(
                `UPDATE in_app_messages
                 SET status = 'read',
                     read_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :messageId AND user_id = :userId`,
                {
                    replacements: { messageId, userId },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            return { success: true };

        } catch (error) {
            logger.error('Error marking message as read:', error);
            throw error;
        }
    }

    /**
     * Create custom alert rule
     */
    async createAlertRule(userId, ruleData) {
        try {
            const [result] = await db.sequelize.query(
                `INSERT INTO alert_rules (
                    user_id, rule_name, rule_type, conditions,
                    notification_channels, template_id, custom_message,
                    is_active, priority, cooldown_minutes
                ) VALUES (
                    :userId, :ruleName, :ruleType, :conditions,
                    :notificationChannels, :templateId, :customMessage,
                    :isActive, :priority, :cooldownMinutes
                ) RETURNING *`,
                {
                    replacements: {
                        userId,
                        ruleName: ruleData.ruleName,
                        ruleType: ruleData.ruleType,
                        conditions: JSON.stringify(ruleData.conditions),
                        notificationChannels: JSON.stringify(ruleData.channels || ['in_app']),
                        templateId: ruleData.templateId || null,
                        customMessage: ruleData.customMessage || null,
                        isActive: ruleData.isActive !== false,
                        priority: ruleData.priority || 'normal',
                        cooldownMinutes: ruleData.cooldownMinutes || 60
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return result[0];

        } catch (error) {
            logger.error('Error creating alert rule:', error);
            throw error;
        }
    }

    /**
     * Check and trigger alert rules
     */
    async checkAlertRules(userId, eventType, eventData) {
        try {
            // Get applicable rules
            const rules = await db.sequelize.query(
                `SELECT * FROM alert_rules
                 WHERE (user_id = :userId OR user_id IS NULL)
                 AND rule_type = :eventType
                 AND is_active = true
                 AND (last_triggered_at IS NULL OR
                      last_triggered_at < CURRENT_TIMESTAMP - INTERVAL '1 minute' * cooldown_minutes)`,
                {
                    replacements: { userId, eventType },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            for (const rule of rules) {
                if (this.evaluateRuleConditions(rule.conditions, eventData)) {
                    await this.triggerAlert(userId, rule, eventData);
                }
            }

        } catch (error) {
            logger.error('Error checking alert rules:', error);
        }
    }

    /**
     * Evaluate rule conditions
     */
    evaluateRuleConditions(conditions, eventData) {
        try {
            const conditionsObj = typeof conditions === 'string' ?
                JSON.parse(conditions) : conditions;

            // Simple evaluation logic (can be enhanced)
            if (conditionsObj.operator === 'AND') {
                return conditionsObj.rules.every(rule =>
                    this.evaluateCondition(rule, eventData)
                );
            } else if (conditionsObj.operator === 'OR') {
                return conditionsObj.rules.some(rule =>
                    this.evaluateCondition(rule, eventData)
                );
            }

            return false;

        } catch (error) {
            logger.error('Error evaluating conditions:', error);
            return false;
        }
    }

    /**
     * Evaluate single condition
     */
    evaluateCondition(rule, eventData) {
        const value = eventData[rule.field];

        switch (rule.operator) {
            case '>':
                return value > rule.value;
            case '<':
                return value < rule.value;
            case '>=':
                return value >= rule.value;
            case '<=':
                return value <= rule.value;
            case '=':
            case '==':
                return value == rule.value;
            case '!=':
                return value != rule.value;
            case 'IN':
                return Array.isArray(rule.value) && rule.value.includes(value);
            case 'NOT_IN':
                return Array.isArray(rule.value) && !rule.value.includes(value);
            default:
                return false;
        }
    }

    /**
     * Trigger alert based on rule
     */
    async triggerAlert(userId, rule, eventData) {
        try {
            // Send notification
            await this.sendNotification(
                userId,
                rule.template_id || 'CUSTOM_ALERT',
                {
                    ruleName: rule.rule_name,
                    ...eventData
                },
                {
                    channel: rule.notification_channels ?
                        JSON.parse(rule.notification_channels)[0] : 'in_app',
                    priority: rule.priority,
                    metadata: {
                        ruleId: rule.id,
                        eventData
                    }
                }
            );

            // Update rule
            await db.sequelize.query(
                `UPDATE alert_rules
                 SET last_triggered_at = CURRENT_TIMESTAMP,
                     trigger_count = trigger_count + 1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :ruleId`,
                {
                    replacements: { ruleId: rule.id },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

        } catch (error) {
            logger.error('Error triggering alert:', error);
        }
    }

    /**
     * Get notification history
     */
    async getNotificationHistory(userId, options = {}) {
        try {
            const limit = options.limit || 50;
            const offset = options.offset || 0;

            const notifications = await db.sequelize.query(
                `SELECT n.*, t.template_name
                 FROM notifications n
                 LEFT JOIN notification_templates t ON n.template_id = t.id
                 WHERE n.user_id = :userId
                 ORDER BY n.created_at DESC
                 LIMIT :limit OFFSET :offset`,
                {
                    replacements: { userId, limit, offset },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const [count] = await db.sequelize.query(
                `SELECT COUNT(*) as total FROM notifications WHERE user_id = :userId`,
                {
                    replacements: { userId },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            return {
                notifications,
                total: count.total,
                limit,
                offset
            };

        } catch (error) {
            logger.error('Error getting notification history:', error);
            throw error;
        }
    }

    /**
     * Register device token
     */
    async registerDeviceToken(userId, tokenData) {
        try {
            const [result] = await db.sequelize.query(
                `INSERT INTO device_tokens (
                    user_id, device_id, platform, push_token, token_type,
                    device_name, device_model, os_version, app_version
                ) VALUES (
                    :userId, :deviceId, :platform, :pushToken, :tokenType,
                    :deviceName, :deviceModel, :osVersion, :appVersion
                )
                ON CONFLICT (user_id, device_id)
                DO UPDATE SET
                    push_token = EXCLUDED.push_token,
                    platform = EXCLUDED.platform,
                    os_version = EXCLUDED.os_version,
                    app_version = EXCLUDED.app_version,
                    is_active = true,
                    last_used_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *`,
                {
                    replacements: {
                        userId,
                        deviceId: tokenData.deviceId,
                        platform: tokenData.platform,
                        pushToken: tokenData.pushToken,
                        tokenType: tokenData.tokenType || 'fcm',
                        deviceName: tokenData.deviceName,
                        deviceModel: tokenData.deviceModel,
                        osVersion: tokenData.osVersion,
                        appVersion: tokenData.appVersion
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return result[0];

        } catch (error) {
            logger.error('Error registering device token:', error);
            throw error;
        }
    }

    /**
     * Unregister device token
     */
    async unregisterDeviceToken(userId, deviceId) {
        try {
            await db.sequelize.query(
                `UPDATE device_tokens
                 SET is_active = false,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = :userId AND device_id = :deviceId`,
                {
                    replacements: { userId, deviceId },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            return { success: true };

        } catch (error) {
            logger.error('Error unregistering device token:', error);
            throw error;
        }
    }
}

export default new NotificationService();