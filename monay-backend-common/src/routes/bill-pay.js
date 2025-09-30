/**
 * Bill Pay Routes
 * Consumer Wallet Phase 3 Day 12 Implementation
 */

import express from 'express';
import billPayService from '../services/bill-pay-service.js';
import { authenticateToken } from '../middleware-app/auth.js';
import { validate } from '../middleware-app/request-validator.js';
import { asyncHandler } from '../middleware-app/error-handler.js';
import Joi from 'joi';
import logger from '../services/enhanced-logger.js';

const router = express.Router();

// Validation schemas
const addPayeeSchema = Joi.object({
    body: Joi.object({
        payeeName: Joi.string().max(255).required(),
        payeeNickname: Joi.string().max(100).optional(),
        payeeType: Joi.string().valid(
            'utility', 'telecom', 'insurance', 'loan',
            'credit_card', 'mortgage', 'rent', 'government',
            'education', 'healthcare', 'business', 'personal', 'other'
        ).required(),
        accountNumber: Joi.string().max(100).required(),
        routingNumber: Joi.string().pattern(/^[0-9]{9}$/).optional(),
        referenceNumber: Joi.string().max(100).optional(),
        addressLine1: Joi.string().max(255).optional(),
        addressLine2: Joi.string().max(255).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().length(2).optional(),
        zipCode: Joi.string().max(10).optional(),
        paymentMethod: Joi.string().valid('ach', 'wire', 'check', 'electronic').optional(),
        isElectronic: Joi.boolean().optional(),
        phoneNumber: Joi.string().max(20).optional(),
        email: Joi.string().email().optional()
    })
});

const createBillSchema = Joi.object({
    body: Joi.object({
        payeeId: Joi.string().uuid().required(),
        billNumber: Joi.string().max(100).optional(),
        statementDate: Joi.date().optional(),
        dueDate: Joi.date().required(),
        amountDue: Joi.number().positive().max(100000).required(),
        minimumPayment: Joi.number().positive().optional(),
        totalAmount: Joi.number().positive().optional(),
        isEbill: Joi.boolean().default(false),
        autoPayEnabled: Joi.boolean().default(false),
        category: Joi.string().max(50).optional(),
        notes: Joi.string().max(500).optional()
    })
});

const payBillSchema = Joi.object({
    body: Joi.object({
        billId: Joi.string().uuid().optional(),
        payeeId: Joi.string().uuid().required(),
        amount: Joi.number().positive().max(100000).required(),
        paymentMethod: Joi.string().valid(
            'ach', 'wire', 'check', 'debit_card', 'wallet_balance'
        ).required(),
        paymentSourceId: Joi.string().uuid().optional(),
        memo: Joi.string().max(255).optional(),
        processDate: Joi.date().min('now').optional(),
        referenceNumber: Joi.string().max(100).optional()
    })
});

const setupRecurringSchema = Joi.object({
    body: Joi.object({
        payeeId: Joi.string().uuid().required(),
        recurrencePattern: Joi.string().valid(
            'monthly', 'quarterly', 'semi_annually', 'annually', 'custom'
        ).required(),
        customIntervalDays: Joi.when('recurrencePattern', {
            is: 'custom',
            then: Joi.number().integer().min(1).max(365).required(),
            otherwise: Joi.forbidden()
        }),
        paymentDay: Joi.number().integer().min(1).max(31).optional(),
        paymentTiming: Joi.string().valid(
            'on_due_date', 'days_before', 'fixed_day'
        ).default('on_due_date'),
        daysBefore: Joi.when('paymentTiming', {
            is: 'days_before',
            then: Joi.number().integer().min(1).max(10).required(),
            otherwise: Joi.forbidden()
        }),
        amountType: Joi.string().valid(
            'fixed', 'full_balance', 'minimum', 'percentage'
        ).required(),
        fixedAmount: Joi.when('amountType', {
            is: 'fixed',
            then: Joi.number().positive().required(),
            otherwise: Joi.forbidden()
        }),
        percentageAmount: Joi.when('amountType', {
            is: 'percentage',
            then: Joi.number().min(1).max(100).required(),
            otherwise: Joi.forbidden()
        }),
        paymentMethod: Joi.string().valid(
            'ach', 'wire', 'check', 'debit_card', 'wallet_balance'
        ).required(),
        paymentSourceId: Joi.string().uuid().optional(),
        startDate: Joi.date().min('now').optional(),
        endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
        monthlyLimit: Joi.number().positive().optional(),
        requireApprovalAbove: Joi.number().positive().optional()
    })
});

/**
 * @route   POST /api/bill-pay/payees
 * @desc    Add a new payee
 * @access  Private
 */
router.post('/payees',
    authenticateToken,
    validate(addPayeeSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const payee = await billPayService.addPayee(userId, req.body);

        res.status(201).json({
            success: true,
            data: payee
        });
    })
);

/**
 * @route   GET /api/bill-pay/payees
 * @desc    Get user's payees
 * @access  Private
 */
router.get('/payees',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status = 'active', type } = req.query;

        let query = `
            SELECT p.*, 
                COUNT(DISTINCT b.id) as bill_count,
                COUNT(DISTINCT rb.id) as recurring_count
            FROM payees p
            LEFT JOIN bills b ON p.id = b.payee_id AND b.status != 'paid'
            LEFT JOIN recurring_bills rb ON p.id = rb.payee_id AND rb.is_active = TRUE
            WHERE p.user_id = ? AND p.status = ?`;

        const replacements = [userId, status];

        if (type) {
            query += ` AND p.payee_type = ?`;
            replacements.push(type);
        }

        query += ` GROUP BY p.id ORDER BY p.payee_name ASC`;

        const payees = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                payees,
                count: payees.length
            }
        });
    })
);

/**
 * @route   GET /api/bill-pay/payees/:payeeId
 * @desc    Get payee details
 * @access  Private
 */
router.get('/payees/:payeeId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { payeeId } = req.params;

        const payee = await db.sequelize.query(
            `SELECT p.*, 
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', b.id,
                            'due_date', b.due_date,
                            'amount_due', b.amount_due,
                            'status', b.status
                        ) ORDER BY b.due_date DESC
                    )
                    FROM bills b
                    WHERE b.payee_id = p.id
                    LIMIT 5
                ) as recent_bills,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', bp.id,
                            'amount', bp.amount,
                            'created_at', bp.created_at,
                            'status', bp.status
                        ) ORDER BY bp.created_at DESC
                    )
                    FROM bill_payments bp
                    WHERE bp.payee_id = p.id
                    LIMIT 5
                ) as recent_payments
            FROM payees p
            WHERE p.id = ? AND p.user_id = ?`,
            {
                replacements: [payeeId, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!payee[0]) {
            return res.status(404).json({
                success: false,
                error: 'Payee not found'
            });
        }

        res.json({
            success: true,
            data: payee[0]
        });
    })
);

/**
 * @route   PUT /api/bill-pay/payees/:payeeId
 * @desc    Update payee
 * @access  Private
 */
router.put('/payees/:payeeId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { payeeId } = req.params;
        const updates = req.body;

        // Build update query
        const updateFields = [];
        const replacements = [];

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined && key !== 'id' && key !== 'user_id') {
                updateFields.push(`${key} = ?`);
                replacements.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        replacements.push(payeeId, userId);

        const result = await db.sequelize.query(
            `UPDATE payees
             SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?
             RETURNING *`,
            {
                replacements,
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        res.json({
            success: true,
            data: result[0][0]
        });
    })
);

/**
 * @route   DELETE /api/bill-pay/payees/:payeeId
 * @desc    Archive payee (soft delete)
 * @access  Private
 */
router.delete('/payees/:payeeId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { payeeId } = req.params;

        await db.sequelize.query(
            `UPDATE payees
             SET status = 'archived',
                 archived_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            {
                replacements: [payeeId, userId]
            }
        );

        res.json({
            success: true,
            data: { message: 'Payee archived successfully' }
        });
    })
);

/**
 * @route   POST /api/bill-pay/bills
 * @desc    Create a bill
 * @access  Private
 */
router.post('/bills',
    authenticateToken,
    validate(createBillSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const bill = await billPayService.createBill(userId, req.body);

        res.status(201).json({
            success: true,
            data: bill
        });
    })
);

/**
 * @route   GET /api/bill-pay/bills
 * @desc    Get user's bills
 * @access  Private
 */
router.get('/bills',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status, dueStart, dueEnd, payeeId } = req.query;

        const bills = await billPayService.getUserBills(userId, {
            status,
            dueStart,
            dueEnd,
            payeeId
        });

        res.json({
            success: true,
            data: {
                bills,
                count: bills.length,
                totalDue: bills.reduce((sum, bill) => sum + parseFloat(bill.amount_due), 0)
            }
        });
    })
);

/**
 * @route   GET /api/bill-pay/bills/upcoming
 * @desc    Get upcoming bills
 * @access  Private
 */
router.get('/bills/upcoming',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { days = 30 } = req.query;

        const upcoming = await billPayService.getUpcomingBills(userId, days);

        res.json({
            success: true,
            data: upcoming
        });
    })
);

/**
 * @route   POST /api/bill-pay/payments
 * @desc    Pay a bill
 * @access  Private
 */
router.post('/payments',
    authenticateToken,
    validate(payBillSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const payment = await billPayService.payBill(userId, req.body);

        res.status(201).json({
            success: true,
            data: payment
        });
    })
);

/**
 * @route   GET /api/bill-pay/payments
 * @desc    Get payment history
 * @access  Private
 */
router.get('/payments',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { limit = 50, offset = 0, startDate, endDate } = req.query;

        const payments = await billPayService.getPaymentHistory(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            startDate,
            endDate
        });

        res.json({
            success: true,
            data: {
                payments,
                count: payments.length,
                hasMore: payments.length === parseInt(limit)
            }
        });
    })
);

/**
 * @route   GET /api/bill-pay/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/payments/:paymentId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { paymentId } = req.params;

        const payment = await db.sequelize.query(
            `SELECT bp.*, p.payee_name, p.payee_type,
                    b.bill_number, b.due_date,
                    cr.check_number, cr.status as check_status,
                    cr.mail_date, cr.expected_delivery_date
             FROM bill_payments bp
             JOIN payees p ON bp.payee_id = p.id
             LEFT JOIN bills b ON bp.bill_id = b.id
             LEFT JOIN check_register cr ON bp.id = cr.bill_payment_id
             WHERE bp.id = ? AND bp.user_id = ?`,
            {
                replacements: [paymentId, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (!payment[0]) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment[0]
        });
    })
);

/**
 * @route   POST /api/bill-pay/recurring
 * @desc    Set up recurring bill payment
 * @access  Private
 */
router.post('/recurring',
    authenticateToken,
    validate(setupRecurringSchema),
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const recurring = await billPayService.setupRecurringBill(userId, req.body);

        res.status(201).json({
            success: true,
            data: recurring
        });
    })
);

/**
 * @route   GET /api/bill-pay/recurring
 * @desc    Get recurring bills
 * @access  Private
 */
router.get('/recurring',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { isActive = true } = req.query;

        const recurring = await db.sequelize.query(
            `SELECT rb.*, p.payee_name, p.payee_type, p.logo_url
             FROM recurring_bills rb
             JOIN payees p ON rb.payee_id = p.id
             WHERE rb.user_id = ?
             ${isActive !== undefined ? 'AND rb.is_active = ?' : ''}
             ORDER BY rb.next_payment_date ASC`,
            {
                replacements: isActive !== undefined ? [userId, isActive] : [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: {
                recurring,
                count: recurring.length,
                monthlyTotal: recurring
                    .filter(r => r.is_active)
                    .reduce((sum, r) => sum + (parseFloat(r.fixed_amount) || 0), 0)
            }
        });
    })
);

/**
 * @route   PUT /api/bill-pay/recurring/:recurringId/pause
 * @desc    Pause recurring bill
 * @access  Private
 */
router.put('/recurring/:recurringId/pause',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { recurringId } = req.params;

        await db.sequelize.query(
            `UPDATE recurring_bills
             SET is_active = FALSE,
                 paused_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            {
                replacements: [recurringId, userId]
            }
        );

        res.json({
            success: true,
            data: { message: 'Recurring bill paused' }
        });
    })
);

/**
 * @route   PUT /api/bill-pay/recurring/:recurringId/resume
 * @desc    Resume recurring bill
 * @access  Private
 */
router.put('/recurring/:recurringId/resume',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { recurringId } = req.params;

        await db.sequelize.query(
            `UPDATE recurring_bills
             SET is_active = TRUE,
                 paused_at = NULL
             WHERE id = ? AND user_id = ?`,
            {
                replacements: [recurringId, userId]
            }
        );

        res.json({
            success: true,
            data: { message: 'Recurring bill resumed' }
        });
    })
);

/**
 * @route   DELETE /api/bill-pay/recurring/:recurringId
 * @desc    Cancel recurring bill
 * @access  Private
 */
router.delete('/recurring/:recurringId',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { recurringId } = req.params;

        await db.sequelize.query(
            `UPDATE recurring_bills
             SET is_active = FALSE,
                 cancelled_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?`,
            {
                replacements: [recurringId, userId]
            }
        );

        res.json({
            success: true,
            data: { message: 'Recurring bill cancelled' }
        });
    })
);

/**
 * @route   GET /api/bill-pay/templates
 * @desc    Search payee templates
 * @access  Private
 */
router.get('/templates',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const { search, category } = req.query;

        if (!search && !category) {
            return res.status(400).json({
                success: false,
                error: 'Search term or category required'
            });
        }

        const templates = await billPayService.searchPayeeTemplates(search, category);

        res.json({
            success: true,
            data: {
                templates,
                count: templates.length
            }
        });
    })
);

/**
 * @route   POST /api/bill-pay/import-ebill
 * @desc    Import electronic bill
 * @access  Private
 */
router.post('/import-ebill',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { payeeId } = req.body;

        if (!payeeId) {
            return res.status(400).json({
                success: false,
                error: 'Payee ID required'
            });
        }

        const bill = await billPayService.importEBill(userId, payeeId);

        res.json({
            success: true,
            data: bill
        });
    })
);

/**
 * @route   GET /api/bill-pay/checks
 * @desc    Get check register
 * @access  Private
 */
router.get('/checks',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { status, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT cr.*, bp.amount, p.payee_name
            FROM check_register cr
            LEFT JOIN bill_payments bp ON cr.bill_payment_id = bp.id
            LEFT JOIN payees p ON bp.payee_id = p.id
            WHERE cr.user_id = ?`;

        const replacements = [userId];

        if (status) {
            query += ` AND cr.status = ?`;
            replacements.push(status);
        }

        query += ` ORDER BY cr.issue_date DESC LIMIT ? OFFSET ?`;
        replacements.push(limit, offset);

        const checks = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                checks,
                count: checks.length
            }
        });
    })
);

/**
 * @route   PUT /api/bill-pay/checks/:checkId/stop
 * @desc    Stop payment on check
 * @access  Private
 */
router.put('/checks/:checkId/stop',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { checkId } = req.params;
        const { reason } = req.body;

        await db.sequelize.query(
            `UPDATE check_register
             SET status = 'stopped',
                 stop_payment_requested = TRUE,
                 stop_payment_date = CURRENT_TIMESTAMP,
                 stop_payment_reason = ?,
                 stop_payment_fee = 35.00
             WHERE id = ? AND user_id = ?
             AND status NOT IN ('cleared', 'void')`,
            {
                replacements: [reason || 'User requested', checkId, userId]
            }
        );

        res.json({
            success: true,
            data: { message: 'Stop payment requested' }
        });
    })
);

/**
 * @route   GET /api/bill-pay/analytics
 * @desc    Get bill pay analytics
 * @access  Private
 */
router.get('/analytics',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { period = '30d' } = req.query;
        const days = parseInt(period) || 30;

        const analytics = await db.sequelize.query(
            `WITH payment_stats AS (
                SELECT
                    COUNT(*) as total_payments,
                    SUM(amount) as total_amount,
                    AVG(amount) as avg_amount,
                    COUNT(DISTINCT payee_id) as unique_payees
                FROM bill_payments
                WHERE user_id = ?
                AND created_at >= CURRENT_DATE - INTERVAL '? days'
                AND status = 'completed'
            ),
            category_breakdown AS (
                SELECT
                    p.payee_type,
                    COUNT(bp.id) as payment_count,
                    SUM(bp.amount) as category_total
                FROM bill_payments bp
                JOIN payees p ON bp.payee_id = p.id
                WHERE bp.user_id = ?
                AND bp.created_at >= CURRENT_DATE - INTERVAL '? days'
                AND bp.status = 'completed'
                GROUP BY p.payee_type
            ),
            upcoming_summary AS (
                SELECT
                    COUNT(*) as upcoming_bills,
                    SUM(amount_due) as upcoming_total
                FROM bills
                WHERE user_id = ?
                AND status = 'unpaid'
                AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
            )
            SELECT
                ps.*,
                us.upcoming_bills,
                us.upcoming_total,
                (
                    SELECT json_agg(
                        json_build_object(
                            'category', payee_type,
                            'count', payment_count,
                            'total', category_total
                        ) ORDER BY category_total DESC
                    )
                    FROM category_breakdown
                ) as category_breakdown
            FROM payment_stats ps, upcoming_summary us`,
            {
                replacements: [userId, days, userId, days, userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        res.json({
            success: true,
            data: analytics[0] || {}
        });
    })
);

export default router;