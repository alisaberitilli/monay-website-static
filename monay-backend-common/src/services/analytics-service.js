/**
 * Analytics Service
 * Comprehensive analytics and reporting functionality
 * Phase 3 - Day 17: Analytics & Reporting System
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import logger from './logger.js';
import redisClient from '../config/redis.js';
import kafkaProducer from '../config/kafka.js';

class AnalyticsService {
    constructor() {
        this.initializeAnalytics();
    }

    /**
     * Initialize analytics service
     */
    async initializeAnalytics() {
        try {
            // Schedule daily analytics generation
            this.scheduleDailyAnalytics();

            // Initialize real-time tracking
            this.initializeRealtimeTracking();

            logger.info('Analytics service initialized');
        } catch (error) {
            logger.error('Error initializing analytics:', error);
        }
    }

    /**
     * Track user activity
     */
    async trackUserActivity(userId, activityData) {
        try {
            const sessionId = activityData.sessionId || uuidv4();

            await db.sequelize.query(
                `INSERT INTO user_analytics (
                    user_id, session_id, session_start, page_views,
                    actions_count, device_type, platform, browser,
                    ip_address, country_code, city
                ) VALUES (
                    :userId, :sessionId, CURRENT_TIMESTAMP, :pageViews,
                    :actionsCount, :deviceType, :platform, :browser,
                    :ipAddress, :countryCode, :city
                )`,
                {
                    replacements: {
                        userId,
                        sessionId,
                        pageViews: activityData.pageViews || 1,
                        actionsCount: activityData.actionsCount || 0,
                        deviceType: activityData.deviceType,
                        platform: activityData.platform,
                        browser: activityData.browser,
                        ipAddress: activityData.ipAddress,
                        countryCode: activityData.countryCode,
                        city: activityData.city
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            // Update user behavior analytics
            await this.updateUserBehavior(userId, activityData);

            // Track in real-time metrics
            await this.updateRealtimeMetrics('user_activity', {
                userId,
                timestamp: new Date()
            });

            return { success: true, sessionId };

        } catch (error) {
            logger.error('Error tracking user activity:', error);
            throw error;
        }
    }

    /**
     * Track transaction analytics
     */
    async trackTransaction(transactionData) {
        try {
            // Update real-time transaction metrics
            await this.updateRealtimeMetrics('transaction', transactionData);

            // Queue for batch processing
            await kafkaProducer.send({
                topic: 'transaction-analytics',
                messages: [{
                    value: JSON.stringify({
                        ...transactionData,
                        timestamp: new Date()
                    })
                }]
            });

            // Update KPIs
            await this.updateKPI('daily_transaction_volume', transactionData.amount);
            await this.updateKPI('daily_transaction_count', 1);

            return { success: true };

        } catch (error) {
            logger.error('Error tracking transaction:', error);
            throw error;
        }
    }

    /**
     * Generate transaction analytics
     */
    async generateTransactionAnalytics(date = new Date()) {
        try {
            const dateStr = date.toISOString().split('T')[0];

            const [analytics] = await db.sequelize.query(
                `SELECT
                    COUNT(*) as total_transactions,
                    SUM(amount) as total_volume,
                    AVG(amount) as average_transaction_size,
                    COUNT(*) FILTER (WHERE transaction_type = 'deposit') as deposits_count,
                    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'deposit'), 0) as deposits_volume,
                    COUNT(*) FILTER (WHERE transaction_type = 'withdrawal') as withdrawals_count,
                    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'withdrawal'), 0) as withdrawals_volume,
                    COUNT(*) FILTER (WHERE transaction_type = 'transfer') as transfers_count,
                    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'transfer'), 0) as transfers_volume,
                    COUNT(*) FILTER (WHERE transaction_type = 'payment') as payments_count,
                    COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'payment'), 0) as payments_volume,
                    COUNT(*) FILTER (WHERE status = 'completed') as successful_transactions,
                    COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions
                FROM transactions
                WHERE DATE(created_at) = :date`,
                {
                    replacements: { date: dateStr },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Store analytics
            await db.sequelize.query(
                `INSERT INTO transaction_analytics (
                    date, hour, day_of_week, week_of_year, month, quarter, year,
                    total_transactions, total_volume, average_transaction_size,
                    deposits_count, deposits_volume,
                    withdrawals_count, withdrawals_volume,
                    transfers_count, transfers_volume,
                    payments_count, payments_volume,
                    successful_transactions, failed_transactions, pending_transactions
                ) VALUES (
                    :date, 0, :dayOfWeek, :weekOfYear, :month, :quarter, :year,
                    :totalTransactions, :totalVolume, :averageTransactionSize,
                    :depositsCount, :depositsVolume,
                    :withdrawalsCount, :withdrawalsVolume,
                    :transfersCount, :transfersVolume,
                    :paymentsCount, :paymentsVolume,
                    :successfulTransactions, :failedTransactions, :pendingTransactions
                )
                ON CONFLICT (date, hour) DO UPDATE
                SET total_transactions = EXCLUDED.total_transactions,
                    total_volume = EXCLUDED.total_volume,
                    average_transaction_size = EXCLUDED.average_transaction_size,
                    deposits_count = EXCLUDED.deposits_count,
                    deposits_volume = EXCLUDED.deposits_volume,
                    withdrawals_count = EXCLUDED.withdrawals_count,
                    withdrawals_volume = EXCLUDED.withdrawals_volume,
                    transfers_count = EXCLUDED.transfers_count,
                    transfers_volume = EXCLUDED.transfers_volume,
                    payments_count = EXCLUDED.payments_count,
                    payments_volume = EXCLUDED.payments_volume,
                    successful_transactions = EXCLUDED.successful_transactions,
                    failed_transactions = EXCLUDED.failed_transactions,
                    pending_transactions = EXCLUDED.pending_transactions,
                    updated_at = CURRENT_TIMESTAMP`,
                {
                    replacements: {
                        date: dateStr,
                        dayOfWeek: date.getDay(),
                        weekOfYear: this.getWeekOfYear(date),
                        month: date.getMonth() + 1,
                        quarter: Math.floor(date.getMonth() / 3) + 1,
                        year: date.getFullYear(),
                        ...analytics
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return analytics;

        } catch (error) {
            logger.error('Error generating transaction analytics:', error);
            throw error;
        }
    }

    /**
     * Generate revenue analytics
     */
    async generateRevenueAnalytics(date = new Date()) {
        try {
            const dateStr = date.toISOString().split('T')[0];

            // Calculate revenue from different sources
            const [revenue] = await db.sequelize.query(
                `SELECT
                    COALESCE(SUM(fee_amount) FILTER (WHERE fee_type = 'transaction'), 0) as transaction_fees,
                    COALESCE(SUM(fee_amount) FILTER (WHERE fee_type = 'subscription'), 0) as subscription_revenue,
                    COALESCE(SUM(fee_amount) FILTER (WHERE fee_type = 'interchange'), 0) as interchange_revenue,
                    COALESCE(SUM(fee_amount) FILTER (WHERE fee_type = 'investment'), 0) as investment_fees,
                    COALESCE(SUM(fee_amount), 0) as gross_revenue
                FROM transaction_fees
                WHERE DATE(created_at) = :date`,
                {
                    replacements: { date: dateStr },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Calculate costs
            const processingCosts = revenue.gross_revenue * 0.02; // 2% processing
            const operationalCosts = 1000; // Fixed daily operational cost
            const netRevenue = revenue.gross_revenue - processingCosts - operationalCosts;

            // Store revenue analytics
            await db.sequelize.query(
                `INSERT INTO revenue_analytics (
                    date, period_type,
                    transaction_fees, subscription_revenue, interchange_revenue, investment_fees,
                    gross_revenue, net_revenue,
                    processing_costs, operational_costs,
                    gross_margin, net_margin
                ) VALUES (
                    :date, 'daily',
                    :transactionFees, :subscriptionRevenue, :interchangeRevenue, :investmentFees,
                    :grossRevenue, :netRevenue,
                    :processingCosts, :operationalCosts,
                    :grossMargin, :netMargin
                )
                ON CONFLICT (date, period_type) DO UPDATE
                SET transaction_fees = EXCLUDED.transaction_fees,
                    subscription_revenue = EXCLUDED.subscription_revenue,
                    interchange_revenue = EXCLUDED.interchange_revenue,
                    investment_fees = EXCLUDED.investment_fees,
                    gross_revenue = EXCLUDED.gross_revenue,
                    net_revenue = EXCLUDED.net_revenue,
                    processing_costs = EXCLUDED.processing_costs,
                    operational_costs = EXCLUDED.operational_costs,
                    gross_margin = EXCLUDED.gross_margin,
                    net_margin = EXCLUDED.net_margin`,
                {
                    replacements: {
                        date: dateStr,
                        ...revenue,
                        netRevenue,
                        processingCosts,
                        operationalCosts,
                        grossMargin: revenue.gross_revenue > 0 ?
                            ((revenue.gross_revenue - processingCosts) / revenue.gross_revenue) * 100 : 0,
                        netMargin: revenue.gross_revenue > 0 ?
                            (netRevenue / revenue.gross_revenue) * 100 : 0
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return { ...revenue, netRevenue, processingCosts, operationalCosts };

        } catch (error) {
            logger.error('Error generating revenue analytics:', error);
            throw error;
        }
    }

    /**
     * Calculate user engagement metrics
     */
    async calculateUserEngagement(userId, periodDays = 30) {
        try {
            const [metrics] = await db.sequelize.query(
                `SELECT
                    COUNT(DISTINCT DATE(created_at)) as days_active,
                    COUNT(*) as total_sessions,
                    AVG(session_duration_seconds) as avg_session_duration,
                    SUM(page_views) as total_page_views,
                    SUM(actions_count) as total_actions
                FROM user_analytics
                WHERE user_id = :userId
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * :periodDays`,
                {
                    replacements: { userId, periodDays },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const [transactionMetrics] = await db.sequelize.query(
                `SELECT
                    COUNT(*) as transaction_count,
                    SUM(amount) as transaction_volume,
                    AVG(amount) as avg_transaction_size
                FROM transactions
                WHERE user_id = :userId
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * :periodDays`,
                {
                    replacements: { userId, periodDays },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            // Calculate engagement score (0-100)
            const engagementScore = Math.min(100,
                (metrics.days_active * 3) +
                (metrics.total_sessions * 2) +
                (transactionMetrics.transaction_count * 5)
            );

            // Update user behavior analytics
            await db.sequelize.query(
                `INSERT INTO user_behavior_analytics (
                    user_id, days_active, last_active_date,
                    retention_score, average_transaction_frequency
                ) VALUES (
                    :userId, :daysActive, CURRENT_DATE,
                    :retentionScore, :avgTransactionFrequency
                )
                ON CONFLICT (user_id) DO UPDATE
                SET days_active = EXCLUDED.days_active,
                    last_active_date = EXCLUDED.last_active_date,
                    retention_score = EXCLUDED.retention_score,
                    average_transaction_frequency = EXCLUDED.average_transaction_frequency,
                    updated_at = CURRENT_TIMESTAMP`,
                {
                    replacements: {
                        userId,
                        daysActive: metrics.days_active,
                        retentionScore: engagementScore,
                        avgTransactionFrequency: transactionMetrics.transaction_count / periodDays
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return {
                engagementScore,
                ...metrics,
                ...transactionMetrics
            };

        } catch (error) {
            logger.error('Error calculating user engagement:', error);
            throw error;
        }
    }

    /**
     * Track product feature usage
     */
    async trackFeatureUsage(featureName, userId = null) {
        try {
            const date = new Date().toISOString().split('T')[0];

            // Update product analytics
            await db.sequelize.query(
                `INSERT INTO product_analytics (
                    date, feature_name, unique_users, total_usage_count
                ) VALUES (
                    :date, :featureName, 1, 1
                )
                ON CONFLICT (date, feature_name) DO UPDATE
                SET unique_users = product_analytics.unique_users + 1,
                    total_usage_count = product_analytics.total_usage_count + 1`,
                {
                    replacements: { date, featureName },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            // Update user feature usage if userId provided
            if (userId) {
                await this.updateUserFeatureUsage(userId, featureName);
            }

            // Track in real-time
            await this.updateRealtimeMetrics('feature_usage', {
                featureName,
                userId,
                timestamp: new Date()
            });

            return { success: true };

        } catch (error) {
            logger.error('Error tracking feature usage:', error);
            throw error;
        }
    }

    /**
     * Track funnel progression
     */
    async trackFunnelStep(funnelName, stepNumber, userId, completed = false) {
        try {
            const date = new Date().toISOString().split('T')[0];

            await db.sequelize.query(
                `INSERT INTO funnel_analytics (
                    date, funnel_name, step_number, step_name,
                    users_entered, users_completed, users_dropped
                ) VALUES (
                    :date, :funnelName, :stepNumber, :stepName,
                    1, :completed, :dropped
                )
                ON CONFLICT (date, funnel_name, step_number) DO UPDATE
                SET users_entered = funnel_analytics.users_entered + 1,
                    users_completed = funnel_analytics.users_completed + :completed,
                    users_dropped = funnel_analytics.users_dropped + :dropped`,
                {
                    replacements: {
                        date,
                        funnelName,
                        stepNumber,
                        stepName: `Step ${stepNumber}`,
                        completed: completed ? 1 : 0,
                        dropped: completed ? 0 : 1
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return { success: true };

        } catch (error) {
            logger.error('Error tracking funnel step:', error);
            throw error;
        }
    }

    /**
     * Calculate cohort retention
     */
    async calculateCohortRetention(cohortDate, cohortType = 'signup') {
        try {
            // Get cohort users
            const cohortUsers = await db.sequelize.query(
                `SELECT id FROM users
                 WHERE DATE(created_at) = :cohortDate`,
                {
                    replacements: { cohortDate },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const cohortSize = cohortUsers.length;

            // Calculate retention for different periods (0-30 days)
            for (let period = 0; period <= 30; period++) {
                const retentionDate = new Date(cohortDate);
                retentionDate.setDate(retentionDate.getDate() + period);

                const [retention] = await db.sequelize.query(
                    `SELECT
                        COUNT(DISTINCT t.user_id) as users_retained,
                        COUNT(t.id) as transactions_count,
                        SUM(t.amount) as transaction_volume
                    FROM users u
                    LEFT JOIN transactions t ON u.id = t.user_id
                        AND DATE(t.created_at) = :retentionDate
                    WHERE DATE(u.created_at) = :cohortDate`,
                    {
                        replacements: {
                            cohortDate,
                            retentionDate: retentionDate.toISOString().split('T')[0]
                        },
                        type: db.Sequelize.QueryTypes.SELECT
                    }
                );

                const retentionRate = cohortSize > 0 ?
                    (retention.users_retained / cohortSize) * 100 : 0;

                await db.sequelize.query(
                    `INSERT INTO cohort_analytics (
                        cohort_date, cohort_type, cohort_size,
                        period_number, period_type,
                        users_retained, retention_rate,
                        transactions_count, transaction_volume
                    ) VALUES (
                        :cohortDate, :cohortType, :cohortSize,
                        :period, 'day',
                        :usersRetained, :retentionRate,
                        :transactionsCount, :transactionVolume
                    )
                    ON CONFLICT (cohort_date, cohort_type, period_number, period_type)
                    DO UPDATE
                    SET users_retained = EXCLUDED.users_retained,
                        retention_rate = EXCLUDED.retention_rate,
                        transactions_count = EXCLUDED.transactions_count,
                        transaction_volume = EXCLUDED.transaction_volume`,
                    {
                        replacements: {
                            cohortDate,
                            cohortType,
                            cohortSize,
                            period,
                            usersRetained: retention.users_retained,
                            retentionRate,
                            transactionsCount: retention.transactions_count || 0,
                            transactionVolume: retention.transaction_volume || 0
                        },
                        type: db.Sequelize.QueryTypes.INSERT
                    }
                );
            }

            return { success: true, cohortSize };

        } catch (error) {
            logger.error('Error calculating cohort retention:', error);
            throw error;
        }
    }

    /**
     * Track KPI
     */
    async trackKPI(kpiName, value, category = null) {
        try {
            const date = new Date().toISOString().split('T')[0];

            // Get previous value
            const [previous] = await db.sequelize.query(
                `SELECT actual_value FROM kpi_tracking
                 WHERE kpi_name = :kpiName
                 ORDER BY date DESC
                 LIMIT 1`,
                {
                    replacements: { kpiName },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const previousValue = previous?.actual_value || 0;
            const growthRate = previousValue > 0 ?
                ((value - previousValue) / previousValue) * 100 : 0;

            await db.sequelize.query(
                `INSERT INTO kpi_tracking (
                    date, kpi_name, kpi_category,
                    actual_value, previous_value,
                    growth_rate, trend
                ) VALUES (
                    :date, :kpiName, :category,
                    :value, :previousValue,
                    :growthRate, :trend
                )
                ON CONFLICT (date, kpi_name) DO UPDATE
                SET actual_value = EXCLUDED.actual_value,
                    previous_value = EXCLUDED.previous_value,
                    growth_rate = EXCLUDED.growth_rate,
                    trend = EXCLUDED.trend`,
                {
                    replacements: {
                        date,
                        kpiName,
                        category,
                        value,
                        previousValue,
                        growthRate,
                        trend: value > previousValue ? 'up' : value < previousValue ? 'down' : 'stable'
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            return { success: true, value, growthRate };

        } catch (error) {
            logger.error('Error tracking KPI:', error);
            throw error;
        }
    }

    /**
     * Generate custom report
     */
    async generateReport(reportDefinitionId) {
        try {
            // Get report definition
            const [definition] = await db.sequelize.query(
                `SELECT * FROM report_definitions WHERE id = :reportDefinitionId`,
                {
                    replacements: { reportDefinitionId },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            if (!definition) {
                throw new Error('Report definition not found');
            }

            // Create execution record
            const executionId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO report_executions (
                    id, report_definition_id, execution_status, started_at
                ) VALUES (
                    :executionId, :reportDefinitionId, 'running', CURRENT_TIMESTAMP
                )`,
                {
                    replacements: { executionId, reportDefinitionId },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );

            // Execute report query
            const queryConfig = JSON.parse(definition.query_definition);
            const results = await this.executeReportQuery(queryConfig);

            // Update execution record
            await db.sequelize.query(
                `UPDATE report_executions
                 SET execution_status = 'completed',
                     completed_at = CURRENT_TIMESTAMP,
                     row_count = :rowCount,
                     result_data = :resultData
                 WHERE id = :executionId`,
                {
                    replacements: {
                        executionId,
                        rowCount: results.length,
                        resultData: JSON.stringify(results)
                    },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );

            // Distribute report if configured
            if (definition.recipients) {
                await this.distributeReport(executionId, definition, results);
            }

            return {
                executionId,
                results,
                rowCount: results.length
            };

        } catch (error) {
            logger.error('Error generating report:', error);
            throw error;
        }
    }

    /**
     * Execute report query
     */
    async executeReportQuery(queryConfig) {
        try {
            // Build query based on configuration
            let query = '';
            let replacements = {};

            if (queryConfig.table === 'transaction_analytics') {
                query = `SELECT * FROM transaction_analytics
                         WHERE date >= :startDate AND date <= :endDate
                         ORDER BY date DESC`;
                replacements = {
                    startDate: queryConfig.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: queryConfig.endDate || new Date()
                };
            } else if (queryConfig.table === 'revenue_analytics') {
                query = `SELECT * FROM revenue_analytics
                         WHERE period_type = :periodType
                         AND date >= :startDate AND date <= :endDate
                         ORDER BY date DESC`;
                replacements = {
                    periodType: queryConfig.period || 'daily',
                    startDate: queryConfig.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: queryConfig.endDate || new Date()
                };
            }

            const results = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            return results;

        } catch (error) {
            logger.error('Error executing report query:', error);
            throw error;
        }
    }

    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics(userId = null, timeframe = 'today') {
        try {
            const metrics = {};

            // Get date range based on timeframe
            const { startDate, endDate } = this.getDateRange(timeframe);

            // Transaction metrics
            const [transactionMetrics] = await db.sequelize.query(
                `SELECT
                    COUNT(*) as total_transactions,
                    SUM(total_volume) as total_volume,
                    AVG(average_transaction_size) as avg_transaction_size
                FROM transaction_analytics
                WHERE date >= :startDate AND date <= :endDate`,
                {
                    replacements: { startDate, endDate },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            metrics.transactions = transactionMetrics;

            // Revenue metrics
            const [revenueMetrics] = await db.sequelize.query(
                `SELECT
                    SUM(gross_revenue) as total_gross_revenue,
                    SUM(net_revenue) as total_net_revenue,
                    AVG(gross_margin) as avg_gross_margin
                FROM revenue_analytics
                WHERE date >= :startDate AND date <= :endDate
                AND period_type = 'daily'`,
                {
                    replacements: { startDate, endDate },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            metrics.revenue = revenueMetrics;

            // User metrics
            const [userMetrics] = await db.sequelize.query(
                `SELECT
                    COUNT(DISTINCT user_id) as active_users,
                    COUNT(*) as total_sessions,
                    AVG(engagement_score) as avg_engagement_score
                FROM user_analytics
                WHERE DATE(created_at) >= :startDate AND DATE(created_at) <= :endDate`,
                {
                    replacements: { startDate, endDate },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            metrics.users = userMetrics;

            // KPIs
            const kpis = await db.sequelize.query(
                `SELECT kpi_name, actual_value, growth_rate, trend
                 FROM kpi_tracking
                 WHERE date = :endDate`,
                {
                    replacements: { endDate },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            metrics.kpis = kpis;

            return metrics;

        } catch (error) {
            logger.error('Error getting dashboard metrics:', error);
            throw error;
        }
    }

    /**
     * Get analytics summary
     */
    async getAnalyticsSummary(type, options = {}) {
        try {
            const { startDate, endDate, groupBy } = options;

            let query = '';
            let replacements = {};

            switch (type) {
                case 'transactions':
                    query = `SELECT
                        ${groupBy === 'hour' ? 'hour,' : ''}
                        ${groupBy === 'day' ? 'date,' : ''}
                        SUM(total_transactions) as transactions,
                        SUM(total_volume) as volume,
                        AVG(average_transaction_size) as avg_size
                    FROM transaction_analytics
                    WHERE date >= :startDate AND date <= :endDate
                    ${groupBy ? `GROUP BY ${groupBy}` : ''}
                    ORDER BY date DESC`;
                    break;

                case 'revenue':
                    query = `SELECT
                        date,
                        gross_revenue,
                        net_revenue,
                        gross_margin,
                        net_margin
                    FROM revenue_analytics
                    WHERE date >= :startDate AND date <= :endDate
                    AND period_type = 'daily'
                    ORDER BY date DESC`;
                    break;

                case 'users':
                    query = `SELECT
                        DATE(created_at) as date,
                        COUNT(DISTINCT user_id) as active_users,
                        COUNT(*) as sessions,
                        AVG(session_duration_seconds) as avg_session_duration
                    FROM user_analytics
                    WHERE DATE(created_at) >= :startDate AND DATE(created_at) <= :endDate
                    GROUP BY DATE(created_at)
                    ORDER BY date DESC`;
                    break;

                case 'cohort':
                    query = `SELECT
                        cohort_date,
                        cohort_size,
                        period_number,
                        users_retained,
                        retention_rate
                    FROM cohort_analytics
                    WHERE cohort_date >= :startDate AND cohort_date <= :endDate
                    AND period_type = 'day'
                    ORDER BY cohort_date, period_number`;
                    break;
            }

            replacements = {
                startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: endDate || new Date()
            };

            const results = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT
            });

            return results;

        } catch (error) {
            logger.error('Error getting analytics summary:', error);
            throw error;
        }
    }

    /**
     * Update user behavior analytics
     */
    async updateUserBehavior(userId, data) {
        try {
            await db.sequelize.query(
                `INSERT INTO user_behavior_analytics (
                    user_id, last_active_date, days_active,
                    preferred_transaction_type, preferred_time_of_day
                ) VALUES (
                    :userId, CURRENT_DATE, 1,
                    :preferredType, :preferredTime
                )
                ON CONFLICT (user_id) DO UPDATE
                SET last_active_date = CURRENT_DATE,
                    days_active = user_behavior_analytics.days_active + 1,
                    updated_at = CURRENT_TIMESTAMP`,
                {
                    replacements: {
                        userId,
                        preferredType: data.transactionType || null,
                        preferredTime: new Date().getHours()
                    },
                    type: db.Sequelize.QueryTypes.INSERT
                }
            );
        } catch (error) {
            logger.error('Error updating user behavior:', error);
        }
    }

    /**
     * Update user feature usage
     */
    async updateUserFeatureUsage(userId, featureName) {
        try {
            const [current] = await db.sequelize.query(
                `SELECT features_used FROM user_behavior_analytics
                 WHERE user_id = :userId`,
                {
                    replacements: { userId },
                    type: db.Sequelize.QueryTypes.SELECT
                }
            );

            const featuresUsed = current?.features_used || {};
            featuresUsed[featureName] = (featuresUsed[featureName] || 0) + 1;

            await db.sequelize.query(
                `UPDATE user_behavior_analytics
                 SET features_used = :featuresUsed,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = :userId`,
                {
                    replacements: {
                        userId,
                        featuresUsed: JSON.stringify(featuresUsed)
                    },
                    type: db.Sequelize.QueryTypes.UPDATE
                }
            );
        } catch (error) {
            logger.error('Error updating feature usage:', error);
        }
    }

    /**
     * Update real-time metrics
     */
    async updateRealtimeMetrics(metricType, data) {
        try {
            const key = `analytics:realtime:${metricType}`;
            const timestamp = Date.now();

            // Store in Redis for real-time access
            await redisClient.zadd(key, timestamp, JSON.stringify({
                ...data,
                timestamp
            }));

            // Keep only last hour of data
            const oneHourAgo = timestamp - (60 * 60 * 1000);
            await redisClient.zremrangebyscore(key, '-inf', oneHourAgo);

        } catch (error) {
            logger.error('Error updating realtime metrics:', error);
        }
    }

    /**
     * Update KPI
     */
    async updateKPI(kpiName, value) {
        try {
            await this.trackKPI(kpiName, value);
        } catch (error) {
            logger.error('Error updating KPI:', error);
        }
    }

    /**
     * Get date range based on timeframe
     */
    getDateRange(timeframe) {
        const endDate = new Date();
        let startDate = new Date();

        switch (timeframe) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * Get week of year
     */
    getWeekOfYear(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * Schedule daily analytics generation
     */
    scheduleDailyAnalytics() {
        // Schedule for 2 AM daily
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(2, 0, 0, 0);

        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilScheduled = scheduledTime - now;

        setTimeout(async () => {
            await this.runDailyAnalytics();

            // Schedule next run
            setInterval(async () => {
                await this.runDailyAnalytics();
            }, 24 * 60 * 60 * 1000); // 24 hours
        }, timeUntilScheduled);
    }

    /**
     * Run daily analytics
     */
    async runDailyAnalytics() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            // Generate analytics for yesterday
            await this.generateTransactionAnalytics(yesterday);
            await this.generateRevenueAnalytics(yesterday);

            // Calculate cohort retention
            await this.calculateCohortRetention(
                yesterday.toISOString().split('T')[0],
                'signup'
            );

            // Refresh materialized views
            await this.refreshMaterializedViews();

            logger.info('Daily analytics completed');

        } catch (error) {
            logger.error('Error running daily analytics:', error);
        }
    }

    /**
     * Refresh materialized views
     */
    async refreshMaterializedViews() {
        try {
            await db.sequelize.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_active_users');
            await db.sequelize.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_active_users');
            await db.sequelize.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary');
        } catch (error) {
            logger.error('Error refreshing materialized views:', error);
        }
    }

    /**
     * Initialize real-time tracking
     */
    initializeRealtimeTracking() {
        // Initialize WebSocket or other real-time tracking mechanisms
        logger.info('Real-time tracking initialized');
    }

    /**
     * Distribute report
     */
    async distributeReport(executionId, definition, results) {
        // Implementation for report distribution
        logger.info(`Report ${executionId} distributed`);
    }
}

export default new AnalyticsService();