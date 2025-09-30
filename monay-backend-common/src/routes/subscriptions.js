/**
 * Subscription and Recurring Payment Routes
 * Consumer Wallet Phase 3 Day 11 Implementation
 */

import express from 'express';
import subscriptionService from '../services/subscription-service.js';
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
import Joi from 'joi';
import logger from '../services/enhanced-logger.js';

const router = express.Router();

// Validation schemas
const createSubscriptionSchema = Joi.object({
    body: Joi.object({
        subscriptionName: Joi.string().max(255).required(),
        merchantName: Joi.string().max(255).required(),
        amount: Joi.number().positive().max(10000).required(),
        billingCycle: Joi.string().valid(
            'daily', 'weekly', 'biweekly', 'monthly',
            'quarterly', 'semi_annually', 'annually', 'custom'
        ).required(),
        customIntervalDays: Joi.when('billingCycle', {
            is: 'custom',
            then: Joi.number().integer().min(1).max(365).required(),
            otherwise: Joi.forbidden()
        }),
        paymentMethodType: Joi.string().valid(
            'card', 'bank_account', 'wallet_balance'
        ).required(),
        paymentMethodId: Joi.when('paymentMethodType', {
            is: 'wallet_balance',
            then: Joi.forbidden(),
            otherwise: Joi.string().uuid().required()
        }),
        startDate: Joi.date().min('now').optional(),
        endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
        category: Joi.string().max(50).optional(),
        description: Joi.string().max(500).optional(),
        notifyBeforeCharge: Joi.boolean().default(true),
        notifyDaysBefore: Joi.number().integer().min(1).max(7).default(3),
        autoRenew: Joi.boolean().default(true),
        billingDay: Joi.when('billingCycle', {
            is: 'monthly',
            then: Joi.number().integer().min(1).max(31).optional(),
            otherwise: Joi.forbidden()
        }),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    })
});

const createScheduledPaymentSchema = Joi.object({
    body: Joi.object({
        payeeName: Joi.string().max(255).required(),
        amount: Joi.number().positive().max(100000).required(),
        paymentType: Joi.string().valid('one_time', 'recurring').default('one_time'),
        paymentMethodType: Joi.string().valid(
            'card', 'bank_account', 'wallet_balance'
        ).required(),
        paymentMethodId: Joi.when('paymentMethodType', {
            is: 'wallet_balance',
            then: Joi.forbidden(),
            otherwise: Joi.string().uuid().required()
        }),
        scheduledDate: Joi.date().min('now').required(),
        scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        category: Joi.string().max(50).optional(),
        memo: Joi.string().max(500).optional(),
        referenceNumber: Joi.string().max(100).optional()
    })
});

const updateSubscriptionSchema = Joi.object({
    params: Joi.object({
        subscriptionId: Joi.string().uuid().required()
    }),
    body: Joi.object({
        amount: Joi.number().positive().max(10000).optional(),
        paymentMethodType: Joi.string().valid(
            'card', 'bank_account', 'wallet_balance'
        ).optional(),
        paymentMethodId: Joi.string().uuid().optional(),
        notifyBeforeCharge: Joi.boolean().optional(),
        notifyDaysBefore: Joi.number().integer().min(1).max(7).optional(),
        autoRenew: Joi.boolean().optional(),
        category: Joi.string().max(50).optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    })
});

const pauseSubscriptionSchema = Joi.object({
    params: Joi.object({
        subscriptionId: Joi.string().uuid().required()
    }),
    body: Joi.object({
        resumeDate: Joi.date().min('now').optional(),
        reason: Joi.string().max(500).optional()
    })
});

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
router.post('/',
    authenticateToken,
    validate(createSubscriptionSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const subscription = await subscriptionService.createSubscription(userId, req.body);

        res.status(201).json({
            success: true,
            data: subscription
        });
    })
);

/**
 * @route   GET /api/subscriptions
 * @desc    Get user's subscriptions
 * @access  Private
 */
router.get('/',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status, category } = req.query;
        
        const subscriptions = await subscriptionService.getUserSubscriptions(
            userId,
            { status, category }
        );

        res.json({
            success: true,
            data: {
                subscriptions,
                count: subscriptions.length
            }
        });
    })
);

/**
 * @route   GET /api/subscriptions/analytics
 * @desc    Get subscription analytics
 * @access  Private
 */
router.get('/analytics',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { period = '30d' } = req.query;
        
        const analytics = await subscriptionService.getSubscriptionAnalytics(
            userId,
            period
        );

        res.json({
            success: true,
            data: analytics
        });
    })
);

/**
 * @route   GET /api/subscriptions/categories
 * @desc    Get available subscription categories
 * @access  Private
 */
router.get('/categories',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const categories = await db.sequelize.query(
            `SELECT name, display_name, description, icon_name, color_hex
             FROM subscription_categories
             WHERE is_active = TRUE
             ORDER BY display_name`,
            {
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: {
                categories,
                count: categories.length
            }
        });
    })
);

/**
 * @route   GET /api/subscriptions/:subscriptionId
 * @desc    Get subscription details
 * @access  Private
 */
router.get('/:subscriptionId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;

        const subscription = await db.sequelize.query(
            `SELECT s.*, 
                sc.display_name as category_name,
                sc.icon_name as category_icon,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', st.id,
                            'amount', st.amount,
                            'status', st.status,
                            'initiated_at', st.initiated_at,
                            'billing_period_start', st.billing_period_start,
                            'billing_period_end', st.billing_period_end
                        ) ORDER BY st.initiated_at DESC
                    )
                    FROM subscription_transactions st
                    WHERE st.subscription_id = s.id
                    LIMIT 10
                ) as recent_transactions
             FROM subscriptions s
             LEFT JOIN subscription_categories sc ON s.category = sc.name
             WHERE s.id = ? AND s.user_id = ?`,
            {
                replacements: [subscriptionId, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!subscription[0]) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            data: subscription[0]
        });
    })
);

/**
 * @route   PUT /api/subscriptions/:subscriptionId
 * @desc    Update subscription
 * @access  Private
 */
router.put('/:subscriptionId',
    authenticateToken,
    validate(updateSubscriptionSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;
        const updates = req.body;

        // Build update query
        const updateFields = [];
        const replacements = [];

        if (updates.amount !== undefined) {
            updateFields.push('amount = ?');
            replacements.push(updates.amount);
        }
        if (updates.paymentMethodType) {
            updateFields.push('payment_method_type = ?');
            replacements.push(updates.paymentMethodType);
        }
        if (updates.paymentMethodId) {
            updateFields.push('payment_method_id = ?');
            replacements.push(updates.paymentMethodId);
        }
        if (updates.notifyBeforeCharge !== undefined) {
            updateFields.push('notify_before_charge = ?');
            replacements.push(updates.notifyBeforeCharge);
        }
        if (updates.notifyDaysBefore) {
            updateFields.push('notify_days_before = ?');
            replacements.push(updates.notifyDaysBefore);
        }
        if (updates.autoRenew !== undefined) {
            updateFields.push('auto_renew = ?');
            replacements.push(updates.autoRenew);
        }
        if (updates.category) {
            updateFields.push('category = ?');
            replacements.push(updates.category);
        }
        if (updates.tags) {
            updateFields.push('tags = ?');
            replacements.push(updates.tags);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        replacements.push(subscriptionId, userId);

        const result = await db.sequelize.query(
            `UPDATE subscriptions
             SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?
             RETURNING *`,
            {
                replacements,
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        if (!result[0][0]) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            data: result[0][0]
        });
    })
);

/**
 * @route   POST /api/subscriptions/:subscriptionId/pause
 * @desc    Pause a subscription
 * @access  Private
 */
router.post('/:subscriptionId/pause',
    authenticateToken,
    validate(pauseSubscriptionSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;
        const { resumeDate, reason } = req.body;

        const result = await subscriptionService.pauseSubscription(
            subscriptionId,
            userId,
            resumeDate
        );

        res.json({
            success: true,
            data: result
        });
    })
);

/**
 * @route   POST /api/subscriptions/:subscriptionId/resume
 * @desc    Resume a paused subscription
 * @access  Private
 */
router.post('/:subscriptionId/resume',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;

        const result = await db.sequelize.query(
            `UPDATE subscriptions
             SET status = 'active',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ? AND status = 'paused'
             RETURNING *`,
            {
                replacements: [subscriptionId, userId],
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        if (!result[0][0]) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found or not paused'
            });
        }

        // Create next scheduled payment
        await subscriptionService.createScheduledPayment(subscriptionId);

        res.json({
            success: true,
            data: {
                message: 'Subscription resumed',
                subscription: result[0][0]
            }
        });
    })
);

/**
 * @route   DELETE /api/subscriptions/:subscriptionId
 * @desc    Cancel a subscription
 * @access  Private
 */
router.delete('/:subscriptionId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;
        const { reason } = req.body;

        const result = await subscriptionService.cancelSubscription(
            subscriptionId,
            userId,
            reason
        );

        res.json({
            success: true,
            data: result
        });
    })
);

/**
 * @route   GET /api/subscriptions/:subscriptionId/transactions
 * @desc    Get subscription transaction history
 * @access  Private
 */
router.get('/:subscriptionId/transactions',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { subscriptionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        // Verify ownership
        const subscription = await db.sequelize.query(
            `SELECT id FROM subscriptions WHERE id = ? AND user_id = ?`,
            {
                replacements: [subscriptionId, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!subscription[0]) {
            return res.status(404).json({
                success: false,
                error: 'Subscription not found'
            });
        }

        const transactions = await db.sequelize.query(
            `SELECT st.*, sp.payee_name, sp.payment_method_type
             FROM subscription_transactions st
             LEFT JOIN scheduled_payments sp ON st.scheduled_payment_id = sp.id
             WHERE st.subscription_id = ?
             ORDER BY st.initiated_at DESC
             LIMIT ? OFFSET ?`,
            {
                replacements: [subscriptionId, limit, offset],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: {
                transactions,
                count: transactions.length,
                hasMore: transactions.length === parseInt(limit)
            }
        });
    })
);

/**
 * @route   POST /api/subscriptions/scheduled-payments
 * @desc    Create a scheduled payment
 * @access  Private
 */
router.post('/scheduled-payments',
    authenticateToken,
    validate(createScheduledPaymentSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const {
            payeeName,
            amount,
            paymentType,
            paymentMethodType,
            paymentMethodId,
            scheduledDate,
            scheduledTime,
            category,
            memo,
            referenceNumber
        } = req.body;

        // Get user's primary wallet
        const wallet = await db.sequelize.query(
            `SELECT id FROM wallets WHERE user_id = ? AND is_primary = TRUE`,
            {
                replacements: [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!wallet[0]) {
            return res.status(400).json({
                success: false,
                error: 'No primary wallet found'
            });
        }

        // Calculate execute time
        const executeAt = scheduledTime
            ? moment(scheduledDate).hour(parseInt(scheduledTime.split(':')[0]))
                .minute(parseInt(scheduledTime.split(':')[1])).toDate()
            : moment(scheduledDate).hour(10).toDate();

        const payment = await db.sequelize.query(
            `INSERT INTO scheduled_payments (
                user_id, wallet_id, payment_type, amount, currency,
                payee_name, payment_method_type, payment_method_id,
                scheduled_date, execute_at, status, category, memo, reference_number
            ) VALUES (?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?)
            RETURNING *`,
            {
                replacements: [
                    userId, wallet[0].id, paymentType, amount,
                    payeeName, paymentMethodType, paymentMethodId,
                    scheduledDate, executeAt, category, memo, referenceNumber
                ],
                type: db.sequelize.QueryTypes.INSERT
            }
        );

        res.status(201).json({
            success: true,
            data: payment[0][0]
        });
    })
);

/**
 * @route   GET /api/subscriptions/scheduled-payments
 * @desc    Get scheduled payments
 * @access  Private
 */
router.get('/scheduled-payments',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status = 'scheduled', startDate, endDate } = req.query;

        let query = `
            SELECT sp.*, s.subscription_name, s.merchant_name
            FROM scheduled_payments sp
            LEFT JOIN subscriptions s ON sp.subscription_id = s.id
            WHERE sp.user_id = ?`;
        
        const replacements = [userId];

        if (status) {
            query += ` AND sp.status = ?`;
            replacements.push(status);
        }

        if (startDate) {
            query += ` AND sp.scheduled_date >= ?`;
            replacements.push(startDate);
        }

        if (endDate) {
            query += ` AND sp.scheduled_date <= ?`;
            replacements.push(endDate);
        }

        query += ` ORDER BY sp.scheduled_date ASC`;

        const payments = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                payments,
                count: payments.length
            }
        });
    })
);

/**
 * @route   DELETE /api/subscriptions/scheduled-payments/:paymentId
 * @desc    Cancel a scheduled payment
 * @access  Private
 */
router.delete('/scheduled-payments/:paymentId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { paymentId } = req.params;

        const result = await db.sequelize.query(
            `UPDATE scheduled_payments
             SET status = 'cancelled',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ? AND status = 'scheduled'
             RETURNING *`,
            {
                replacements: [paymentId, userId],
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        if (!result[0][0]) {
            return res.status(404).json({
                success: false,
                error: 'Scheduled payment not found or cannot be cancelled'
            });
        }

        res.json({
            success: true,
            data: {
                message: 'Scheduled payment cancelled',
                payment: result[0][0]
            }
        });
    })
);

/**
 * @route   GET /api/subscriptions/upcoming
 * @desc    Get upcoming subscription payments
 * @access  Private
 */
router.get('/upcoming',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const upcoming = await db.sequelize.query(
            `SELECT 
                s.id as subscription_id,
                s.subscription_name,
                s.merchant_name,
                s.amount,
                s.next_billing_date,
                s.payment_method_type,
                sc.display_name as category_name,
                sc.color_hex as category_color
             FROM subscriptions s
             LEFT JOIN subscription_categories sc ON s.category = sc.name
             WHERE s.user_id = ?
             AND s.status = 'active'
             AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '? days'
             ORDER BY s.next_billing_date ASC`,
            {
                replacements: [userId, days],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Calculate total upcoming amount
        const totalAmount = upcoming.reduce((sum, sub) => sum + parseFloat(sub.amount), 0);

        res.json({
            success: true,
            data: {
                upcoming,
                count: upcoming.length,
                totalAmount,
                period: `${days} days`
            }
        });
    })
);

/**
 * @route   POST /api/subscriptions/detect
 * @desc    Auto-detect subscriptions from transaction history
 * @access  Private
 */
router.post('/detect',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { lookbackDays = 90 } = req.body;

        // Find recurring patterns in transaction history
        const patterns = await db.sequelize.query(
            `WITH merchant_patterns AS (
                SELECT 
                    merchant_name,
                    COUNT(*) as transaction_count,
                    AVG(amount) as avg_amount,
                    STDDEV(amount) as amount_variance,
                    MAX(created_at) as last_transaction,
                    MIN(created_at) as first_transaction,
                    ARRAY_AGG(DISTINCT DATE_TRUNC('month', created_at)) as months
                FROM transactions
                WHERE user_id = ?
                AND type IN ('payment', 'card_payment')
                AND created_at >= CURRENT_DATE - INTERVAL '? days'
                AND merchant_name IS NOT NULL
                GROUP BY merchant_name
                HAVING COUNT(*) >= 2
            )
            SELECT 
                mp.*,
                mr.suggested_category,
                mr.suggested_name,
                mr.typical_billing_cycle,
                mr.confidence_score
            FROM merchant_patterns mp
            LEFT JOIN merchant_recognizers mr 
                ON mp.merchant_name ILIKE mr.merchant_name_pattern
            WHERE mp.transaction_count >= 2
            ORDER BY mp.transaction_count DESC`,
            {
                replacements: [userId, lookbackDays],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Filter for likely subscriptions
        const detectedSubscriptions = patterns.filter(pattern => {
            // Check if transactions occur regularly (e.g., monthly)
            const monthCount = pattern.months?.length || 0;
            const transactionCount = pattern.transaction_count;
            const avgTransactionsPerMonth = transactionCount / monthCount;
            
            // Low variance in amounts suggests subscription
            const coefficientOfVariation = pattern.amount_variance / pattern.avg_amount;
            
            return (
                avgTransactionsPerMonth >= 0.8 && // At least one per month
                avgTransactionsPerMonth <= 1.5 && // Not more than 1.5 per month
                coefficientOfVariation < 0.1 // Low variance in amounts
            );
        });

        res.json({
            success: true,
            data: {
                detected: detectedSubscriptions,
                count: detectedSubscriptions.length,
                lookbackPeriod: `${lookbackDays} days`
            }
        });
    })
);

/**
 * @route   GET /api/subscriptions/retry-queue
 * @desc    Get payment retry queue (admin)
 * @access  Private
 */
router.get('/retry-queue',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;

        const retries = await db.sequelize.query(
            `SELECT 
                prq.*,
                sp.payee_name,
                sp.amount,
                s.subscription_name
             FROM payment_retry_queue prq
             JOIN scheduled_payments sp ON prq.scheduled_payment_id = sp.id
             LEFT JOIN subscriptions s ON prq.subscription_id = s.id
             WHERE sp.user_id = ?
             AND prq.status = 'pending'
             ORDER BY prq.scheduled_for ASC`,
            {
                replacements: [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: {
                retries,
                count: retries.length
            }
        });
    })
);

/**
 * @route   POST /api/subscriptions/process-payments
 * @desc    Manually trigger payment processing (admin/testing)
 * @access  Private
 */
router.post('/process-payments',
    authenticateToken,
    asyncHandler(async (req, res) => {
        // Check if user has admin privileges (implement your admin check)
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Trigger payment processing
        await subscriptionService.processScheduledPayments();

        res.json({
            success: true,
            data: {
                message: 'Payment processing triggered'
            }
        });
    })
);

export default router;