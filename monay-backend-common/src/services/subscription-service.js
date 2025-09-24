/**
 * Subscription Management Service
 * Consumer Wallet Phase 3 Day 11 Implementation
 * 
 * Handles recurring payments, subscriptions, and scheduled transactions
 */

import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import moment from 'moment';
import db from '../models/index.js';
import stripePaymentService from './stripe-payment.js';
import dwollaPaymentService from './dwolla-payment.js';
import walletService from './wallet.js';
import notificationService from './multi-channel-notifications.js';
import logger from './enhanced-logger.js';

class SubscriptionService {
    constructor() {
        this.processingJobs = new Map();
        this.initializeScheduler();
    }

    /**
     * Initialize cron jobs for payment processing
     */
    initializeScheduler() {
        // Process scheduled payments every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            await this.processScheduledPayments();
        });

        // Process retry queue every hour
        cron.schedule('0 * * * *', async () => {
            await this.processRetryQueue();
        });

        // Daily subscription maintenance at 2 AM
        cron.schedule('0 2 * * *', async () => {
            await this.performDailyMaintenance();
        });

        // Check for upcoming payments daily at 10 AM
        cron.schedule('0 10 * * *', async () => {
            await this.sendUpcomingPaymentNotifications();
        });

        logger.info('Subscription scheduler initialized');
    }

    /**
     * Create a new subscription
     */
    async createSubscription(userId, subscriptionData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                subscriptionName,
                merchantName,
                amount,
                billingCycle,
                paymentMethodType,
                paymentMethodId,
                startDate,
                category,
                notifyBeforeCharge = true,
                notifyDaysBefore = 3,
                autoRenew = true
            } = subscriptionData;

            // Validate payment method
            await this.validatePaymentMethod(userId, paymentMethodType, paymentMethodId);

            // Get user's primary wallet
            const wallet = await db.sequelize.query(
                `SELECT id FROM wallets WHERE user_id = ? AND is_primary = TRUE`,
                {
                    replacements: [userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!wallet[0]) {
                throw new Error('No primary wallet found');
            }

            // Calculate first billing date
            const firstBillingDate = this.calculateFirstBillingDate(
                startDate || new Date(),
                billingCycle
            );

            // Create subscription
            const subscription = await db.sequelize.query(
                `INSERT INTO subscriptions (
                    user_id, wallet_id, subscription_name, merchant_name,
                    amount, billing_cycle, payment_method_type, payment_method_id,
                    start_date, next_billing_date, status, category,
                    notify_before_charge, notify_days_before, auto_renew
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
                RETURNING *`,
                {
                    replacements: [
                        userId, wallet[0].id, subscriptionName, merchantName,
                        amount, billingCycle, paymentMethodType, paymentMethodId,
                        startDate || new Date(), firstBillingDate, category,
                        notifyBeforeCharge, notifyDaysBefore, autoRenew
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Create first scheduled payment
            await this.createScheduledPayment(subscription[0][0].id, transaction);

            // Auto-detect from transaction history
            await this.detectSubscriptionPattern(userId, merchantName, amount, transaction);

            await transaction.commit();

            // Send confirmation
            await notificationService.sendNotification(userId, {
                type: 'subscription_created',
                title: 'Subscription Created',
                body: `Your ${subscriptionName} subscription has been set up`,
                data: { subscriptionId: subscription[0][0].id }
            });

            logger.info('Subscription created', {
                subscriptionId: subscription[0][0].id,
                userId,
                merchantName
            });

            return subscription[0][0];

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to create subscription', { error, userId });
            throw error;
        }
    }

    /**
     * Create scheduled payment for subscription
     */
    async createScheduledPayment(subscriptionId, transaction = null) {
        try {
            const subscription = await db.sequelize.query(
                `SELECT * FROM subscriptions WHERE id = ?`,
                {
                    replacements: [subscriptionId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!subscription[0]) {
                throw new Error('Subscription not found');
            }

            const sub = subscription[0];

            const payment = await db.sequelize.query(
                `INSERT INTO scheduled_payments (
                    user_id, wallet_id, subscription_id, payment_type,
                    amount, currency, payee_name, payee_type,
                    payment_method_type, payment_method_id,
                    scheduled_date, execute_at, status
                ) VALUES (?, ?, ?, 'subscription', ?, ?, ?, 'merchant', ?, ?, ?, ?, 'scheduled')
                RETURNING *`,
                {
                    replacements: [
                        sub.user_id, sub.wallet_id, subscriptionId,
                        sub.amount, sub.currency, sub.merchant_name,
                        sub.payment_method_type, sub.payment_method_id,
                        sub.next_billing_date,
                        moment(sub.next_billing_date).hour(10).toDate()
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            return payment[0][0];

        } catch (error) {
            logger.error('Failed to create scheduled payment', { error, subscriptionId });
            throw error;
        }
    }

    /**
     * Process due scheduled payments
     */
    async processScheduledPayments() {
        const processingId = uuidv4();
        this.processingJobs.set(processingId, new Date());

        try {
            // Get due payments
            const duePayments = await db.sequelize.query(
                `SELECT sp.*, s.user_id, s.subscription_name
                FROM scheduled_payments sp
                LEFT JOIN subscriptions s ON sp.subscription_id = s.id
                WHERE sp.status = 'scheduled'
                AND sp.execute_at <= CURRENT_TIMESTAMP
                ORDER BY sp.execute_at
                LIMIT 50`,
                {
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            logger.info(`Processing ${duePayments.length} scheduled payments`);

            // Process each payment
            const results = await Promise.allSettled(
                duePayments.map(payment => this.processPayment(payment))
            );

            // Log results
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            logger.info('Scheduled payments processed', {
                processingId,
                total: duePayments.length,
                successful,
                failed
            });

        } catch (error) {
            logger.error('Failed to process scheduled payments', { error, processingId });
        } finally {
            this.processingJobs.delete(processingId);
        }
    }

    /**
     * Process individual payment
     */
    async processPayment(scheduledPayment) {
        const transaction = await db.sequelize.transaction();

        try {
            // Update status to processing
            await db.sequelize.query(
                `UPDATE scheduled_payments 
                SET status = 'processing', execution_attempts = execution_attempts + 1
                WHERE id = ?`,
                {
                    replacements: [scheduledPayment.id],
                    transaction
                }
            );

            // Check wallet balance
            const wallet = await db.sequelize.query(
                `SELECT available_balance FROM wallets WHERE id = ?`,
                {
                    replacements: [scheduledPayment.wallet_id],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (wallet[0].available_balance < scheduledPayment.amount) {
                throw new Error('Insufficient funds');
            }

            // Process payment based on method
            let transactionId;
            if (scheduledPayment.payment_method_type === 'wallet_balance') {
                transactionId = await this.processWalletPayment(scheduledPayment, transaction);
            } else if (scheduledPayment.payment_method_type === 'card') {
                transactionId = await this.processCardPayment(scheduledPayment, transaction);
            } else if (scheduledPayment.payment_method_type === 'bank_account') {
                transactionId = await this.processBankPayment(scheduledPayment, transaction);
            }

            // Update scheduled payment
            await db.sequelize.query(
                `UPDATE scheduled_payments
                SET status = 'completed',
                    executed_at = CURRENT_TIMESTAMP,
                    transaction_id = ?
                WHERE id = ?`,
                {
                    replacements: [transactionId, scheduledPayment.id],
                    transaction
                }
            );

            // Record subscription transaction
            if (scheduledPayment.subscription_id) {
                await db.sequelize.query(
                    `INSERT INTO subscription_transactions (
                        subscription_id, scheduled_payment_id, transaction_id,
                        amount, net_amount, status, billing_period_start, billing_period_end
                    ) VALUES (?, ?, ?, ?, ?, 'success', ?, ?)`,
                    {
                        replacements: [
                            scheduledPayment.subscription_id,
                            scheduledPayment.id,
                            transactionId,
                            scheduledPayment.amount,
                            scheduledPayment.amount,
                            moment(scheduledPayment.scheduled_date).startOf('month').toDate(),
                            moment(scheduledPayment.scheduled_date).endOf('month').toDate()
                        ],
                        transaction
                    }
                );

                // Update subscription and create next payment
                await this.updateSubscriptionAfterPayment(
                    scheduledPayment.subscription_id,
                    transaction
                );
            }

            await transaction.commit();

            // Send success notification
            await notificationService.sendNotification(scheduledPayment.user_id, {
                type: 'payment_successful',
                title: 'Payment Processed',
                body: `$${scheduledPayment.amount} payment to ${scheduledPayment.payee_name} completed`,
                data: { paymentId: scheduledPayment.id }
            });

            return { success: true, paymentId: scheduledPayment.id };

        } catch (error) {
            await transaction.rollback();
            
            // Handle payment failure
            await this.handlePaymentFailure(scheduledPayment, error);
            
            throw error;
        }
    }

    /**
     * Process wallet balance payment
     */
    async processWalletPayment(payment, transaction) {
        const result = await db.sequelize.query(
            `INSERT INTO transactions (
                user_id, wallet_id, type, amount, currency,
                status, description, merchant_name, reference_id
            ) VALUES (?, ?, 'payment', ?, ?, 'completed', ?, ?, ?)
            RETURNING id`,
            {
                replacements: [
                    payment.user_id,
                    payment.wallet_id,
                    payment.amount,
                    payment.currency,
                    `Payment to ${payment.payee_name}`,
                    payment.payee_name,
                    payment.id
                ],
                type: db.sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        // Deduct from wallet
        await walletService.updateBalance(
            payment.wallet_id,
            -payment.amount,
            transaction
        );

        return result[0][0].id;
    }

    /**
     * Process card payment
     */
    async processCardPayment(payment, transaction) {
        // Get card details
        const card = await db.sequelize.query(
            `SELECT * FROM payment_methods
            WHERE id = ? AND user_id = ? AND type = 'card'`,
            {
                replacements: [payment.payment_method_id, payment.user_id],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!card[0]) {
            throw new Error('Card not found');
        }

        // Process via Stripe
        const charge = await stripePaymentService.createCharge({
            amount: payment.amount * 100,
            currency: payment.currency,
            customer: card[0].stripe_customer_id,
            source: card[0].stripe_source_id,
            description: `Subscription: ${payment.payee_name}`,
            metadata: {
                scheduled_payment_id: payment.id,
                subscription_id: payment.subscription_id
            }
        });

        // Record transaction
        const result = await db.sequelize.query(
            `INSERT INTO transactions (
                user_id, wallet_id, type, amount, currency,
                status, description, processor_reference, reference_id
            ) VALUES (?, ?, 'card_payment', ?, ?, 'completed', ?, ?, ?)
            RETURNING id`,
            {
                replacements: [
                    payment.user_id,
                    payment.wallet_id,
                    payment.amount,
                    payment.currency,
                    `Card payment to ${payment.payee_name}`,
                    charge.id,
                    payment.id
                ],
                type: db.sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        return result[0][0].id;
    }

    /**
     * Process bank account payment
     */
    async processBankPayment(payment, transaction) {
        // Get bank account details
        const bankAccount = await db.sequelize.query(
            `SELECT * FROM bank_accounts
            WHERE id = ? AND user_id = ?`,
            {
                replacements: [payment.payment_method_id, payment.user_id],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!bankAccount[0]) {
            throw new Error('Bank account not found');
        }

        // Process via Dwolla
        const transfer = await dwollaPaymentService.createTransfer({
            source: bankAccount[0].dwolla_funding_source,
            destination: payment.payee_account_details?.dwolla_id,
            amount: payment.amount,
            metadata: {
                scheduled_payment_id: payment.id,
                subscription_id: payment.subscription_id
            }
        });

        // Record transaction
        const result = await db.sequelize.query(
            `INSERT INTO transactions (
                user_id, wallet_id, type, amount, currency,
                status, description, processor_reference, reference_id
            ) VALUES (?, ?, 'ach_payment', ?, ?, 'pending', ?, ?, ?)
            RETURNING id`,
            {
                replacements: [
                    payment.user_id,
                    payment.wallet_id,
                    payment.amount,
                    payment.currency,
                    `ACH payment to ${payment.payee_name}`,
                    transfer.id,
                    payment.id
                ],
                type: db.sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        return result[0][0].id;
    }

    /**
     * Handle payment failure
     */
    async handlePaymentFailure(payment, error) {
        try {
            const errorMessage = error.message || 'Payment processing failed';
            
            // Update payment status
            await db.sequelize.query(
                `UPDATE scheduled_payments
                SET status = 'failed',
                    last_attempt_at = CURRENT_TIMESTAMP,
                    last_attempt_error = ?
                WHERE id = ?`,
                {
                    replacements: [errorMessage, payment.id]
                }
            );

            // Record failed transaction
            if (payment.subscription_id) {
                await db.sequelize.query(
                    `INSERT INTO subscription_transactions (
                        subscription_id, scheduled_payment_id,
                        amount, net_amount, status, failure_reason
                    ) VALUES (?, ?, ?, ?, 'failed', ?)`,
                    {
                        replacements: [
                            payment.subscription_id,
                            payment.id,
                            payment.amount,
                            payment.amount,
                            errorMessage
                        ]
                    }
                );
            }

            // Check if retry is eligible
            const retryEligible = this.isRetryEligible(error);
            if (retryEligible && payment.execution_attempts < 3) {
                await this.scheduleRetry(payment);
            } else {
                // Mark subscription as payment failed
                if (payment.subscription_id) {
                    await db.sequelize.query(
                        `UPDATE subscriptions
                        SET status = 'payment_failed',
                            failed_payment_count = failed_payment_count + 1
                        WHERE id = ?`,
                        {
                            replacements: [payment.subscription_id]
                        }
                    );
                }
            }

            // Send failure notification
            await notificationService.sendNotification(payment.user_id, {
                type: 'payment_failed',
                title: 'Payment Failed',
                body: `Payment to ${payment.payee_name} failed: ${errorMessage}`,
                data: { paymentId: payment.id }
            });

        } catch (err) {
            logger.error('Failed to handle payment failure', { err, paymentId: payment.id });
        }
    }

    /**
     * Schedule payment retry
     */
    async scheduleRetry(payment) {
        const retryAttempt = payment.execution_attempts || 1;
        const backoffMinutes = [60, 240, 1440][retryAttempt - 1] || 1440;
        const scheduledFor = moment().add(backoffMinutes, 'minutes').toDate();

        await db.sequelize.query(
            `INSERT INTO payment_retry_queue (
                scheduled_payment_id, subscription_id,
                retry_attempt, scheduled_for, status
            ) VALUES (?, ?, ?, ?, 'pending')`,
            {
                replacements: [
                    payment.id,
                    payment.subscription_id,
                    retryAttempt,
                    scheduledFor
                ]
            }
        );

        await db.sequelize.query(
            `UPDATE scheduled_payments
            SET status = 'retry_pending',
                retry_count = ?,
                next_retry_at = ?
            WHERE id = ?`,
            {
                replacements: [retryAttempt, scheduledFor, payment.id]
            }
        );

        logger.info('Payment retry scheduled', {
            paymentId: payment.id,
            retryAttempt,
            scheduledFor
        });
    }

    /**
     * Process retry queue
     */
    async processRetryQueue() {
        try {
            const retries = await db.sequelize.query(
                `SELECT rq.*, sp.*
                FROM payment_retry_queue rq
                JOIN scheduled_payments sp ON rq.scheduled_payment_id = sp.id
                WHERE rq.status = 'pending'
                AND rq.scheduled_for <= CURRENT_TIMESTAMP
                LIMIT 20`,
                {
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            logger.info(`Processing ${retries.length} payment retries`);

            for (const retry of retries) {
                try {
                    // Update retry status
                    await db.sequelize.query(
                        `UPDATE payment_retry_queue
                        SET status = 'processing',
                            processing_started_at = CURRENT_TIMESTAMP
                        WHERE id = ?`,
                        {
                            replacements: [retry.id]
                        }
                    );

                    // Attempt payment
                    await this.processPayment(retry);

                    // Mark retry as completed
                    await db.sequelize.query(
                        `UPDATE payment_retry_queue
                        SET status = 'completed',
                            processing_completed_at = CURRENT_TIMESTAMP
                        WHERE id = ?`,
                        {
                            replacements: [retry.id]
                        }
                    );

                } catch (error) {
                    // Update retry with error
                    await db.sequelize.query(
                        `UPDATE payment_retry_queue
                        SET status = 'failed',
                            last_error_message = ?,
                            processing_completed_at = CURRENT_TIMESTAMP
                        WHERE id = ?`,
                        {
                            replacements: [error.message, retry.id]
                        }
                    );
                }
            }

        } catch (error) {
            logger.error('Failed to process retry queue', { error });
        }
    }

    /**
     * Update subscription after successful payment
     */
    async updateSubscriptionAfterPayment(subscriptionId, transaction) {
        const subscription = await db.sequelize.query(
            `SELECT * FROM subscriptions WHERE id = ?`,
            {
                replacements: [subscriptionId],
                type: db.sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        if (!subscription[0]) return;

        const sub = subscription[0];

        // Calculate next billing date
        const nextDate = this.calculateNextBillingDate(
            sub.next_billing_date,
            sub.billing_cycle,
            sub.custom_interval_days,
            sub.billing_day,
            sub.billing_weekday
        );

        // Update subscription
        await db.sequelize.query(
            `UPDATE subscriptions
            SET last_billing_date = next_billing_date,
                next_billing_date = ?,
                total_payments_made = total_payments_made + 1,
                total_amount_paid = total_amount_paid + ?,
                last_payment_status = 'success',
                last_payment_date = CURRENT_TIMESTAMP,
                failed_payment_count = 0
            WHERE id = ?`,
            {
                replacements: [nextDate, sub.amount, subscriptionId],
                transaction
            }
        );

        // Create next scheduled payment if auto-renew is enabled
        if (sub.auto_renew && (!sub.end_date || nextDate <= sub.end_date)) {
            await this.createScheduledPayment(subscriptionId, transaction);
        }
    }

    /**
     * Get user subscriptions
     */
    async getUserSubscriptions(userId, filters = {}) {
        let query = `
            SELECT s.*, 
                sc.display_name as category_name,
                sc.icon_name as category_icon,
                sc.color_hex as category_color,
                (
                    SELECT COUNT(*) 
                    FROM subscription_transactions st 
                    WHERE st.subscription_id = s.id 
                    AND st.status = 'success'
                ) as successful_payments,
                (
                    SELECT SUM(amount) 
                    FROM subscription_transactions st 
                    WHERE st.subscription_id = s.id 
                    AND st.status = 'success'
                    AND st.initiated_at >= DATE_TRUNC('month', CURRENT_DATE)
                ) as current_month_spent
            FROM subscriptions s
            LEFT JOIN subscription_categories sc ON s.category = sc.name
            WHERE s.user_id = ?`;

        const replacements = [userId];

        if (filters.status) {
            query += ` AND s.status = ?`;
            replacements.push(filters.status);
        }

        if (filters.category) {
            query += ` AND s.category = ?`;
            replacements.push(filters.category);
        }

        query += ` ORDER BY s.next_billing_date ASC`;

        const subscriptions = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        return subscriptions;
    }

    /**
     * Get subscription analytics
     */
    async getSubscriptionAnalytics(userId, period = '30d') {
        const periodDays = parseInt(period) || 30;
        const startDate = moment().subtract(periodDays, 'days').toDate();

        // Get spending by category
        const categorySpending = await db.sequelize.query(
            `SELECT 
                s.category,
                sc.display_name,
                sc.color_hex,
                COUNT(DISTINCT s.id) as subscription_count,
                SUM(st.amount) as total_spent
            FROM subscriptions s
            LEFT JOIN subscription_categories sc ON s.category = sc.name
            LEFT JOIN subscription_transactions st ON s.id = st.subscription_id
            WHERE s.user_id = ?
            AND st.status = 'success'
            AND st.initiated_at >= ?
            GROUP BY s.category, sc.display_name, sc.color_hex
            ORDER BY total_spent DESC`,
            {
                replacements: [userId, startDate],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Get monthly trend
        const monthlyTrend = await db.sequelize.query(
            `SELECT 
                DATE_TRUNC('month', st.initiated_at) as month,
                COUNT(*) as payment_count,
                SUM(st.amount) as total_amount
            FROM subscription_transactions st
            JOIN subscriptions s ON st.subscription_id = s.id
            WHERE s.user_id = ?
            AND st.status = 'success'
            AND st.initiated_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
            GROUP BY month
            ORDER BY month`,
            {
                replacements: [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Get upcoming payments
        const upcomingPayments = await db.sequelize.query(
            `SELECT 
                s.subscription_name,
                s.merchant_name,
                s.amount,
                s.next_billing_date,
                s.category
            FROM subscriptions s
            WHERE s.user_id = ?
            AND s.status = 'active'
            AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
            ORDER BY s.next_billing_date`,
            {
                replacements: [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Calculate summary statistics
        const stats = await db.sequelize.query(
            `SELECT
                COUNT(DISTINCT s.id) as active_subscriptions,
                SUM(s.amount) as monthly_recurring_total,
                AVG(s.amount) as average_subscription_amount,
                (
                    SELECT SUM(amount) 
                    FROM subscription_transactions 
                    WHERE subscription_id IN (
                        SELECT id FROM subscriptions WHERE user_id = ?
                    )
                    AND status = 'success'
                    AND initiated_at >= ?
                ) as period_total_spent
            FROM subscriptions s
            WHERE s.user_id = ?
            AND s.status = 'active'`,
            {
                replacements: [userId, startDate, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        return {
            period: `${periodDays}d`,
            stats: stats[0],
            categoryBreakdown: categorySpending,
            monthlyTrend,
            upcomingPayments,
            projectedMonthlySpend: stats[0]?.monthly_recurring_total || 0
        };
    }

    /**
     * Auto-detect subscription from transaction patterns
     */
    async detectSubscriptionPattern(userId, merchantName, amount, transaction = null) {
        try {
            // Check for merchant recognizer
            const recognizer = await db.sequelize.query(
                `SELECT * FROM merchant_recognizers
                WHERE ? ILIKE merchant_name_pattern
                LIMIT 1`,
                {
                    replacements: [merchantName],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (recognizer[0]?.likely_subscription) {
                // Update recognizer usage
                await db.sequelize.query(
                    `UPDATE merchant_recognizers
                    SET match_count = match_count + 1,
                        last_matched_at = CURRENT_TIMESTAMP
                    WHERE id = ?`,
                    {
                        replacements: [recognizer[0].id],
                        transaction
                    }
                );

                // Check for recurring pattern in transaction history
                const pattern = await db.sequelize.query(
                    `SELECT COUNT(*) as occurrence_count,
                        AVG(amount) as avg_amount,
                        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 86400 as days_span
                    FROM transactions
                    WHERE user_id = ?
                    AND merchant_name ILIKE ?
                    AND created_at >= CURRENT_DATE - INTERVAL '90 days'`,
                    {
                        replacements: [userId, `%${merchantName}%`],
                        type: db.sequelize.QueryTypes.SELECT,
                        transaction
                    }
                );

                // If pattern detected (3+ occurrences in 90 days)
                if (pattern[0].occurrence_count >= 3) {
                    // Send notification about detected subscription
                    await notificationService.sendNotification(userId, {
                        type: 'subscription_detected',
                        title: 'Recurring Payment Detected',
                        body: `We noticed recurring payments to ${merchantName}. Would you like to track this as a subscription?`,
                        data: {
                            merchantName,
                            suggestedCategory: recognizer[0].suggested_category,
                            suggestedName: recognizer[0].suggested_name,
                            amount
                        }
                    });
                }
            }
        } catch (error) {
            logger.error('Failed to detect subscription pattern', { error, merchantName });
        }
    }

    /**
     * Pause subscription
     */
    async pauseSubscription(subscriptionId, userId, resumeDate = null) {
        const transaction = await db.sequelize.transaction();

        try {
            // Verify ownership
            const subscription = await db.sequelize.query(
                `SELECT * FROM subscriptions WHERE id = ? AND user_id = ?`,
                {
                    replacements: [subscriptionId, userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!subscription[0]) {
                throw new Error('Subscription not found');
            }

            // Update subscription status
            await db.sequelize.query(
                `UPDATE subscriptions
                SET status = 'paused',
                    metadata = jsonb_set(
                        COALESCE(metadata, '{}'),
                        '{pause_date}',
                        to_jsonb(CURRENT_TIMESTAMP::text)
                    )
                WHERE id = ?`,
                {
                    replacements: [subscriptionId],
                    transaction
                }
            );

            // Cancel pending payments
            await db.sequelize.query(
                `UPDATE scheduled_payments
                SET status = 'cancelled'
                WHERE subscription_id = ?
                AND status = 'scheduled'`,
                {
                    replacements: [subscriptionId],
                    transaction
                }
            );

            // Schedule resume if date provided
            if (resumeDate) {
                await db.sequelize.query(
                    `UPDATE subscriptions
                    SET metadata = jsonb_set(
                        metadata,
                        '{resume_date}',
                        to_jsonb(?::text)
                    )
                    WHERE id = ?`,
                    {
                        replacements: [resumeDate, subscriptionId],
                        transaction
                    }
                );
            }

            await transaction.commit();

            logger.info('Subscription paused', { subscriptionId, userId });
            return { success: true, message: 'Subscription paused' };

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to pause subscription', { error, subscriptionId });
            throw error;
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, userId, reason = null) {
        const transaction = await db.sequelize.transaction();

        try {
            // Verify ownership
            const subscription = await db.sequelize.query(
                `SELECT * FROM subscriptions WHERE id = ? AND user_id = ?`,
                {
                    replacements: [subscriptionId, userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!subscription[0]) {
                throw new Error('Subscription not found');
            }

            // Update subscription status
            await db.sequelize.query(
                `UPDATE subscriptions
                SET status = 'cancelled',
                    cancelled_at = CURRENT_TIMESTAMP,
                    metadata = jsonb_set(
                        COALESCE(metadata, '{}'),
                        '{cancellation_reason}',
                        to_jsonb(?::text)
                    )
                WHERE id = ?`,
                {
                    replacements: [reason || 'User requested', subscriptionId],
                    transaction
                }
            );

            // Cancel all pending payments
            await db.sequelize.query(
                `UPDATE scheduled_payments
                SET status = 'cancelled'
                WHERE subscription_id = ?
                AND status IN ('scheduled', 'retry_pending')`,
                {
                    replacements: [subscriptionId],
                    transaction
                }
            );

            await transaction.commit();

            // Send confirmation
            await notificationService.sendNotification(userId, {
                type: 'subscription_cancelled',
                title: 'Subscription Cancelled',
                body: `Your ${subscription[0].subscription_name} subscription has been cancelled`,
                data: { subscriptionId }
            });

            logger.info('Subscription cancelled', { subscriptionId, userId, reason });
            return { success: true, message: 'Subscription cancelled' };

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to cancel subscription', { error, subscriptionId });
            throw error;
        }
    }

    /**
     * Send upcoming payment notifications
     */
    async sendUpcomingPaymentNotifications() {
        try {
            const upcomingPayments = await db.sequelize.query(
                `SELECT s.*, sp.amount, sp.scheduled_date
                FROM subscriptions s
                JOIN scheduled_payments sp ON s.id = sp.subscription_id
                WHERE s.notify_before_charge = TRUE
                AND sp.status = 'scheduled'
                AND sp.scheduled_date BETWEEN 
                    CURRENT_DATE + INTERVAL '1 day' * (s.notify_days_before - 1)
                    AND CURRENT_DATE + INTERVAL '1 day' * s.notify_days_before
                AND NOT EXISTS (
                    SELECT 1 FROM notifications
                    WHERE reference_id = sp.id::text
                    AND type = 'upcoming_payment'
                    AND created_at >= CURRENT_DATE
                )`,
                {
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            for (const payment of upcomingPayments) {
                await notificationService.sendNotification(payment.user_id, {
                    type: 'upcoming_payment',
                    title: 'Upcoming Payment',
                    body: `$${payment.amount} will be charged for ${payment.subscription_name} on ${moment(payment.scheduled_date).format('MMM DD')}`,
                    data: {
                        subscriptionId: payment.id,
                        amount: payment.amount,
                        scheduledDate: payment.scheduled_date
                    },
                    reference_id: payment.id
                });
            }

            logger.info(`Sent ${upcomingPayments.length} upcoming payment notifications`);

        } catch (error) {
            logger.error('Failed to send upcoming payment notifications', { error });
        }
    }

    /**
     * Perform daily maintenance tasks
     */
    async performDailyMaintenance() {
        try {
            // Resume paused subscriptions with resume date
            await db.sequelize.query(
                `UPDATE subscriptions
                SET status = 'active'
                WHERE status = 'paused'
                AND metadata->>'resume_date' IS NOT NULL
                AND (metadata->>'resume_date')::date <= CURRENT_DATE`
            );

            // Mark expired subscriptions
            await db.sequelize.query(
                `UPDATE subscriptions
                SET status = 'expired'
                WHERE status = 'active'
                AND end_date IS NOT NULL
                AND end_date < CURRENT_DATE`
            );

            // Mark old retry queue entries as archived (soft delete)
            await db.sequelize.query(
                `UPDATE payment_retry_queue
                SET status = 'archived',
                    updated_at = CURRENT_TIMESTAMP
                WHERE status IN ('completed', 'failed', 'cancelled')
                AND created_at < CURRENT_DATE - INTERVAL '30 days'
                AND status != 'archived'`
            );

            logger.info('Daily maintenance completed');

        } catch (error) {
            logger.error('Daily maintenance failed', { error });
        }
    }

    /**
     * Helper: Calculate first billing date
     */
    calculateFirstBillingDate(startDate, billingCycle) {
        const start = moment(startDate);
        
        switch (billingCycle) {
            case 'daily':
                return start.add(1, 'day').toDate();
            case 'weekly':
                return start.add(1, 'week').toDate();
            case 'biweekly':
                return start.add(2, 'weeks').toDate();
            case 'monthly':
                return start.add(1, 'month').toDate();
            case 'quarterly':
                return start.add(3, 'months').toDate();
            case 'semi_annually':
                return start.add(6, 'months').toDate();
            case 'annually':
                return start.add(1, 'year').toDate();
            default:
                return start.add(1, 'month').toDate();
        }
    }

    /**
     * Helper: Calculate next billing date
     */
    calculateNextBillingDate(currentDate, billingCycle, customDays, billingDay, billingWeekday) {
        const current = moment(currentDate);
        
        switch (billingCycle) {
            case 'daily':
                return current.add(1, 'day').toDate();
            case 'weekly':
                return current.add(1, 'week').toDate();
            case 'biweekly':
                return current.add(2, 'weeks').toDate();
            case 'monthly':
                if (billingDay) {
                    return current.add(1, 'month').date(billingDay).toDate();
                }
                return current.add(1, 'month').toDate();
            case 'quarterly':
                return current.add(3, 'months').toDate();
            case 'semi_annually':
                return current.add(6, 'months').toDate();
            case 'annually':
                return current.add(1, 'year').toDate();
            case 'custom':
                return current.add(customDays, 'days').toDate();
            default:
                return current.add(1, 'month').toDate();
        }
    }

    /**
     * Helper: Check if error is retry eligible
     */
    isRetryEligible(error) {
        const retryableErrors = [
            'Insufficient funds',
            'Card declined',
            'Network error',
            'Timeout',
            'Service unavailable'
        ];

        return retryableErrors.some(msg => 
            error.message?.toLowerCase().includes(msg.toLowerCase())
        );
    }

    /**
     * Helper: Validate payment method
     */
    async validatePaymentMethod(userId, type, methodId) {
        if (type === 'wallet_balance') {
            return true;
        }

        const table = type === 'card' ? 'payment_methods' : 'bank_accounts';
        const result = await db.sequelize.query(
            `SELECT id FROM ${table} WHERE id = ? AND user_id = ? AND is_active = TRUE`,
            {
                replacements: [methodId, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!result[0]) {
            throw new Error(`Invalid ${type}`);
        }

        return true;
    }
}

export default new SubscriptionService();