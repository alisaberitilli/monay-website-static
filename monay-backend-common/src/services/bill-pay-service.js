/**
 * Bill Pay Service
 * Consumer Wallet Phase 3 Day 12 Implementation
 * 
 * Handles bill payments, payee management, and check processing
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import moment from 'moment';
import db from '../models/index.js';
import dwollaPaymentService from './dwolla-payment.js';
import stripePaymentService from './stripe-payment.js';
import walletService from './wallet.js';
import notificationService from './multi-channel-notifications.js';
import logger from './enhanced-logger.js';

class BillPayService {
    constructor() {
        this.encryptionKey = process.env.BILL_PAY_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
        this.checkPrintingService = null; // Will integrate with third-party service
        this.ebillProviders = new Map(); // Electronic bill providers
    }

    /**
     * Add a new payee
     */
    async addPayee(userId, payeeData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                payeeName,
                payeeNickname,
                payeeType,
                accountNumber,
                routingNumber,
                referenceNumber,
                addressLine1,
                city,
                state,
                zipCode,
                paymentMethod = 'electronic',
                isElectronic = true
            } = payeeData;

            // Encrypt sensitive account information
            const encryptedAccountNumber = accountNumber 
                ? this.encryptData(accountNumber)
                : null;

            // Check for duplicate payee
            const existingPayee = await db.sequelize.query(
                `SELECT id FROM payees 
                WHERE user_id = ? 
                AND payee_name = ? 
                AND account_number = ?
                AND status != 'archived'`,
                {
                    replacements: [userId, payeeName, accountNumber],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (existingPayee[0]) {
                throw new Error('Payee already exists');
            }

            // Create payee
            const payee = await db.sequelize.query(
                `INSERT INTO payees (
                    user_id, payee_name, payee_nickname, payee_type,
                    account_number, account_number_encrypted, routing_number,
                    reference_number, address_line1, city, state, zip_code,
                    payment_method, preferred_payment_type, is_electronic,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                RETURNING *`,
                {
                    replacements: [
                        userId, payeeName, payeeNickname, payeeType,
                        accountNumber, encryptedAccountNumber, routingNumber,
                        referenceNumber, addressLine1, city, state, zipCode,
                        paymentMethod, paymentMethod, isElectronic
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Check if payee matches any templates for verification
            await this.matchPayeeTemplate(payee[0][0], transaction);

            await transaction.commit();

            logger.info('Payee added successfully', {
                payeeId: payee[0][0].id,
                userId,
                payeeName
            });

            return payee[0][0];

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to add payee', { error, userId });
            throw error;
        }
    }

    /**
     * Create a bill for payment
     */
    async createBill(userId, billData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                payeeId,
                billNumber,
                statementDate,
                dueDate,
                amountDue,
                minimumPayment,
                isEbill = false,
                autoPayEnabled = false
            } = billData;

            // Verify payee ownership
            const payee = await db.sequelize.query(
                `SELECT id, payee_name FROM payees 
                WHERE id = ? AND user_id = ? AND status = 'active'`,
                {
                    replacements: [payeeId, userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!payee[0]) {
                throw new Error('Payee not found');
            }

            // Create bill
            const bill = await db.sequelize.query(
                `INSERT INTO bills (
                    user_id, payee_id, bill_number, statement_date,
                    due_date, amount_due, minimum_payment, total_amount,
                    status, is_ebill, auto_pay_enabled
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, ?)
                RETURNING *`,
                {
                    replacements: [
                        userId, payeeId, billNumber, statementDate,
                        dueDate, amountDue, minimumPayment || amountDue,
                        amountDue, isEbill, autoPayEnabled
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Set up reminder if due date is in the future
            if (moment(dueDate).isAfter(moment())) {
                await this.scheduleReminder(bill[0][0].id, userId, dueDate, transaction);
            }

            // Check for overdue status
            if (moment(dueDate).isBefore(moment())) {
                await db.sequelize.query(
                    `UPDATE bills SET status = 'overdue' WHERE id = ?`,
                    {
                        replacements: [bill[0][0].id],
                        transaction
                    }
                );
            }

            await transaction.commit();

            // Send notification
            await notificationService.sendNotification(userId, {
                type: 'bill_added',
                title: 'Bill Added',
                body: `Bill from ${payee[0].payee_name} for $${amountDue} due on ${moment(dueDate).format('MMM DD')}`,
                data: { billId: bill[0][0].id }
            });

            return bill[0][0];

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to create bill', { error, userId });
            throw error;
        }
    }

    /**
     * Pay a bill
     */
    async payBill(userId, paymentData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                billId,
                payeeId,
                amount,
                paymentMethod,
                paymentSourceId,
                memo,
                processDate = new Date()
            } = paymentData;

            // Get wallet
            const wallet = await db.sequelize.query(
                `SELECT id, available_balance FROM wallets 
                WHERE user_id = ? AND is_primary = TRUE`,
                {
                    replacements: [userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!wallet[0] || wallet[0].available_balance < amount) {
                throw new Error('Insufficient funds');
            }

            // Get payee details
            const payee = await db.sequelize.query(
                `SELECT * FROM payees WHERE id = ? AND user_id = ?`,
                {
                    replacements: [payeeId || billId ? 
                        `(SELECT payee_id FROM bills WHERE id = ?)` : payeeId,
                        userId
                    ],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!payee[0]) {
                throw new Error('Payee not found');
            }

            // Create bill payment record
            const billPayment = await db.sequelize.query(
                `INSERT INTO bill_payments (
                    user_id, bill_id, payee_id, wallet_id,
                    payment_method, payment_source_id,
                    amount, fee_amount, total_amount,
                    status, processing_date, memo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?, ?)
                RETURNING *`,
                {
                    replacements: [
                        userId, billId, payee[0].id, wallet[0].id,
                        paymentMethod, paymentSourceId,
                        amount, 0, amount,
                        processDate, memo
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Process payment based on method
            let paymentResult;
            switch (paymentMethod) {
                case 'ach':
                    paymentResult = await this.processACHPayment(
                        billPayment[0][0],
                        payee[0],
                        transaction
                    );
                    break;
                case 'check':
                    paymentResult = await this.processCheckPayment(
                        billPayment[0][0],
                        payee[0],
                        transaction
                    );
                    break;
                case 'electronic':
                    paymentResult = await this.processElectronicPayment(
                        billPayment[0][0],
                        payee[0],
                        transaction
                    );
                    break;
                case 'wallet_balance':
                    paymentResult = await this.processWalletPayment(
                        billPayment[0][0],
                        wallet[0],
                        transaction
                    );
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            // Update bill payment status
            await db.sequelize.query(
                `UPDATE bill_payments
                SET status = ?,
                    processor_reference = ?,
                    confirmation_number = ?,
                    processed_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                {
                    replacements: [
                        paymentResult.status,
                        paymentResult.processorReference,
                        paymentResult.confirmationNumber,
                        billPayment[0][0].id
                    ],
                    transaction
                }
            );

            // Update bill status if provided
            if (billId) {
                await db.sequelize.query(
                    `UPDATE bills
                    SET status = 'paid',
                        paid_amount = paid_amount + ?,
                        paid_date = CURRENT_TIMESTAMP,
                        payment_confirmation = ?
                    WHERE id = ?`,
                    {
                        replacements: [
                            amount,
                            paymentResult.confirmationNumber,
                            billId
                        ],
                        transaction
                    }
                );
            }

            // Create transaction record
            await db.sequelize.query(
                `INSERT INTO transactions (
                    user_id, wallet_id, type, amount, currency,
                    status, description, reference_id
                ) VALUES (?, ?, 'bill_payment', ?, 'USD', 'completed', ?, ?)
                RETURNING id`,
                {
                    replacements: [
                        userId,
                        wallet[0].id,
                        amount,
                        `Bill payment to ${payee[0].payee_name}`,
                        billPayment[0][0].id
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Update wallet balance
            await walletService.updateBalance(
                wallet[0].id,
                -amount,
                transaction
            );

            await transaction.commit();

            // Send confirmation
            await notificationService.sendNotification(userId, {
                type: 'payment_sent',
                title: 'Bill Payment Sent',
                body: `$${amount} payment to ${payee[0].payee_name} is being processed`,
                data: { paymentId: billPayment[0][0].id }
            });

            logger.info('Bill payment initiated', {
                paymentId: billPayment[0][0].id,
                userId,
                amount,
                payee: payee[0].payee_name
            });

            return billPayment[0][0];

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to pay bill', { error, userId });
            throw error;
        }
    }

    /**
     * Process ACH payment
     */
    async processACHPayment(payment, payee, transaction) {
        try {
            // Decrypt account number if needed
            const accountNumber = payee.account_number_encrypted
                ? this.decryptData(payee.account_number_encrypted)
                : payee.account_number;

            // Process via Dwolla
            const transfer = await dwollaPaymentService.createTransfer({
                amount: payment.amount,
                destination: {
                    routingNumber: payee.routing_number,
                    accountNumber: accountNumber,
                    name: payee.payee_name,
                    type: 'checking'
                },
                metadata: {
                    billPaymentId: payment.id,
                    payeeId: payee.id
                }
            });

            return {
                status: 'processing',
                processorReference: transfer.id,
                confirmationNumber: `ACH-${Date.now()}`,
                expectedDelivery: moment().add(3, 'days').toDate()
            };

        } catch (error) {
            logger.error('ACH payment failed', { error, paymentId: payment.id });
            throw error;
        }
    }

    /**
     * Process check payment
     */
    async processCheckPayment(payment, payee, transaction) {
        try {
            // Generate check number
            const checkNumber = await this.generateCheckNumber(payment.user_id);

            // Create check register entry
            const check = await db.sequelize.query(
                `INSERT INTO check_register (
                    user_id, bill_payment_id, check_number,
                    check_amount, payee_name, status,
                    issue_date, expected_delivery_date, memo
                ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
                RETURNING *`,
                {
                    replacements: [
                        payment.user_id,
                        payment.id,
                        checkNumber,
                        payment.amount,
                        payee.payee_name,
                        new Date(),
                        moment().add(7, 'days').toDate(),
                        payment.memo
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            // Queue for printing (would integrate with service like Lob.com)
            await this.queueCheckForPrinting(check[0][0], payee);

            return {
                status: 'processing',
                processorReference: check[0][0].id,
                confirmationNumber: `CHK-${checkNumber}`,
                checkNumber: checkNumber,
                expectedDelivery: moment().add(7, 'days').toDate()
            };

        } catch (error) {
            logger.error('Check payment failed', { error, paymentId: payment.id });
            throw error;
        }
    }

    /**
     * Process electronic payment
     */
    async processElectronicPayment(payment, payee, transaction) {
        try {
            // This would integrate with bill pay aggregators or direct biller APIs
            // For now, simulate electronic payment
            const confirmationNumber = `ELEC-${Date.now()}`;

            return {
                status: 'completed',
                processorReference: confirmationNumber,
                confirmationNumber: confirmationNumber,
                expectedDelivery: new Date()
            };

        } catch (error) {
            logger.error('Electronic payment failed', { error, paymentId: payment.id });
            throw error;
        }
    }

    /**
     * Process wallet balance payment
     */
    async processWalletPayment(payment, wallet, transaction) {
        // Direct wallet deduction - balance already updated in main flow
        return {
            status: 'completed',
            processorReference: `WALLET-${payment.id}`,
            confirmationNumber: `WLT-${Date.now()}`,
            expectedDelivery: new Date()
        };
    }

    /**
     * Set up recurring bill payment
     */
    async setupRecurringBill(userId, recurringData) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                payeeId,
                recurrencePattern,
                paymentDay,
                paymentTiming,
                amountType,
                fixedAmount,
                paymentMethod,
                paymentSourceId,
                startDate,
                endDate,
                monthlyLimit
            } = recurringData;

            // Verify payee
            const payee = await db.sequelize.query(
                `SELECT * FROM payees WHERE id = ? AND user_id = ?`,
                {
                    replacements: [payeeId, userId],
                    type: db.sequelize.QueryTypes.SELECT,
                    transaction
                }
            );

            if (!payee[0]) {
                throw new Error('Payee not found');
            }

            // Calculate first payment date
            const nextPaymentDate = this.calculateNextPaymentDate(
                startDate || new Date(),
                recurrencePattern,
                paymentDay
            );

            // Create recurring bill
            const recurringBill = await db.sequelize.query(
                `INSERT INTO recurring_bills (
                    user_id, payee_id, recurrence_pattern,
                    payment_day, payment_timing, amount_type,
                    fixed_amount, payment_method, payment_source_id,
                    is_active, start_date, end_date,
                    next_payment_date, monthly_limit
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?)
                RETURNING *`,
                {
                    replacements: [
                        userId, payeeId, recurrencePattern,
                        paymentDay, paymentTiming || 'on_due_date',
                        amountType, fixedAmount,
                        paymentMethod, paymentSourceId,
                        startDate || new Date(), endDate,
                        nextPaymentDate, monthlyLimit
                    ],
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );

            await transaction.commit();

            // Send confirmation
            await notificationService.sendNotification(userId, {
                type: 'recurring_setup',
                title: 'Recurring Payment Set Up',
                body: `Recurring payment to ${payee[0].payee_name} has been configured`,
                data: { recurringBillId: recurringBill[0][0].id }
            });

            logger.info('Recurring bill created', {
                recurringBillId: recurringBill[0][0].id,
                userId,
                payeeId
            });

            return recurringBill[0][0];

        } catch (error) {
            await transaction.rollback();
            logger.error('Failed to setup recurring bill', { error, userId });
            throw error;
        }
    }

    /**
     * Get user's bills
     */
    async getUserBills(userId, filters = {}) {
        let query = `
            SELECT b.*, p.payee_name, p.payee_type, p.logo_url
            FROM bills b
            JOIN payees p ON b.payee_id = p.id
            WHERE b.user_id = ?`;

        const replacements = [userId];

        if (filters.status) {
            query += ` AND b.status = ?`;
            replacements.push(filters.status);
        }

        if (filters.dueStart && filters.dueEnd) {
            query += ` AND b.due_date BETWEEN ? AND ?`;
            replacements.push(filters.dueStart, filters.dueEnd);
        }

        if (filters.payeeId) {
            query += ` AND b.payee_id = ?`;
            replacements.push(filters.payeeId);
        }

        query += ` ORDER BY b.due_date ASC`;

        const bills = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        return bills;
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(userId, filters = {}) {
        const { limit = 50, offset = 0, startDate, endDate } = filters;

        let query = `
            SELECT bp.*, p.payee_name, p.payee_type,
                   b.bill_number, b.due_date,
                   cr.check_number, cr.status as check_status
            FROM bill_payments bp
            JOIN payees p ON bp.payee_id = p.id
            LEFT JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN check_register cr ON bp.id = cr.bill_payment_id
            WHERE bp.user_id = ?`;

        const replacements = [userId];

        if (startDate && endDate) {
            query += ` AND bp.created_at BETWEEN ? AND ?`;
            replacements.push(startDate, endDate);
        }

        query += ` ORDER BY bp.created_at DESC LIMIT ? OFFSET ?`;
        replacements.push(limit, offset);

        const payments = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        return payments;
    }

    /**
     * Get upcoming bills
     */
    async getUpcomingBills(userId, days = 30) {
        const bills = await db.sequelize.query(
            `SELECT b.*, p.payee_name, p.payee_type, p.logo_url,
                    rb.is_active as auto_pay_active,
                    rb.fixed_amount as auto_pay_amount
             FROM bills b
             JOIN payees p ON b.payee_id = p.id
             LEFT JOIN recurring_bills rb ON p.id = rb.payee_id AND rb.is_active = TRUE
             WHERE b.user_id = ?
             AND b.status IN ('unpaid', 'scheduled')
             AND b.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '? days'
             ORDER BY b.due_date ASC`,
            {
                replacements: [userId, days],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Group by week
        const grouped = {
            thisWeek: [],
            nextWeek: [],
            later: [],
            total: 0
        };

        const now = moment();
        const endOfWeek = moment().endOf('week');
        const endOfNextWeek = moment().add(1, 'week').endOf('week');

        bills.forEach(bill => {
            const dueDate = moment(bill.due_date);
            grouped.total += parseFloat(bill.amount_due);

            if (dueDate.isSameOrBefore(endOfWeek)) {
                grouped.thisWeek.push(bill);
            } else if (dueDate.isSameOrBefore(endOfNextWeek)) {
                grouped.nextWeek.push(bill);
            } else {
                grouped.later.push(bill);
            }
        });

        return grouped;
    }

    /**
     * Search payees from templates
     */
    async searchPayeeTemplates(searchTerm, category = null) {
        let query = `
            SELECT * FROM payee_templates
            WHERE is_active = TRUE
            AND (LOWER(company_name) LIKE LOWER(?) OR LOWER(template_name) LIKE LOWER(?))`;

        const replacements = [`%${searchTerm}%`, `%${searchTerm}%`];

        if (category) {
            query += ` AND category = ?`;
            replacements.push(category);
        }

        query += ` ORDER BY popularity_score DESC, company_name ASC LIMIT 20`;

        const templates = await db.sequelize.query(query, {
            replacements,
            type: db.sequelize.QueryTypes.SELECT
        });

        return templates;
    }

    /**
     * Import electronic bill
     */
    async importEBill(userId, payeeId) {
        try {
            // Get payee with ebill credentials
            const payee = await db.sequelize.query(
                `SELECT * FROM payees WHERE id = ? AND user_id = ?`,
                {
                    replacements: [payeeId, userId],
                    type: db.sequelize.QueryTypes.SELECT
                }
            );

            if (!payee[0] || !payee[0].is_electronic) {
                throw new Error('Payee does not support electronic bills');
            }

            // This would integrate with bill aggregators (Yodlee, MX, etc.)
            // For now, simulate ebill import
            const mockBill = {
                billNumber: `EBILL-${Date.now()}`,
                statementDate: moment().subtract(15, 'days').toDate(),
                dueDate: moment().add(15, 'days').toDate(),
                amountDue: Math.random() * 500 + 50,
                isEbill: true
            };

            const bill = await this.createBill(userId, {
                payeeId,
                ...mockBill
            });

            // Update last ebill fetch
            await db.sequelize.query(
                `UPDATE payees 
                SET last_ebill_fetch = CURRENT_TIMESTAMP 
                WHERE id = ?`,
                {
                    replacements: [payeeId]
                }
            );

            logger.info('E-bill imported', { billId: bill.id, payeeId });
            return bill;

        } catch (error) {
            logger.error('Failed to import ebill', { error, payeeId });
            throw error;
        }
    }

    /**
     * Schedule bill reminder
     */
    async scheduleReminder(billId, userId, dueDate, transaction = null) {
        const reminderDate = moment(dueDate).subtract(3, 'days').toDate();

        if (moment(reminderDate).isAfter(moment())) {
            await db.sequelize.query(
                `INSERT INTO bill_reminders (
                    user_id, bill_id, reminder_type,
                    days_before_due, reminder_date,
                    status, delivery_method
                ) VALUES (?, ?, 'due_date', 3, ?, 'pending', 'all')`,
                {
                    replacements: [userId, billId, reminderDate],
                    transaction
                }
            );
        }
    }

    /**
     * Process bill reminders
     */
    async processReminders() {
        const reminders = await db.sequelize.query(
            `SELECT br.*, b.amount_due, b.due_date, p.payee_name
             FROM bill_reminders br
             JOIN bills b ON br.bill_id = b.id
             JOIN payees p ON b.payee_id = p.id
             WHERE br.status = 'pending'
             AND br.reminder_date <= CURRENT_DATE
             AND b.status = 'unpaid'`,
            {
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        for (const reminder of reminders) {
            try {
                await notificationService.sendNotification(reminder.user_id, {
                    type: 'bill_reminder',
                    title: 'Bill Due Soon',
                    body: `${reminder.payee_name} bill for $${reminder.amount_due} is due on ${moment(reminder.due_date).format('MMM DD')}`,
                    data: { billId: reminder.bill_id }
                });

                await db.sequelize.query(
                    `UPDATE bill_reminders 
                    SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
                    WHERE id = ?`,
                    {
                        replacements: [reminder.id]
                    }
                );
            } catch (error) {
                logger.error('Failed to send reminder', { error, reminderId: reminder.id });
            }
        }

        logger.info(`Processed ${reminders.length} bill reminders`);
    }

    /**
     * Match payee to template
     */
    async matchPayeeTemplate(payee, transaction = null) {
        const template = await db.sequelize.query(
            `SELECT * FROM payee_templates
             WHERE LOWER(company_name) = LOWER(?)
             OR LOWER(template_name) = LOWER(?)
             LIMIT 1`,
            {
                replacements: [payee.payee_name, payee.payee_name],
                type: db.sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        if (template[0]) {
            await db.sequelize.query(
                `UPDATE payees 
                SET is_verified = TRUE,
                    logo_url = ?,
                    category = ?
                WHERE id = ?`,
                {
                    replacements: [
                        template[0].logo_url,
                        template[0].category,
                        payee.id
                    ],
                    transaction
                }
            );

            // Update template usage
            await db.sequelize.query(
                `UPDATE payee_templates 
                SET usage_count = usage_count + 1 
                WHERE id = ?`,
                {
                    replacements: [template[0].id],
                    transaction
                }
            );
        }
    }

    /**
     * Generate check number
     */
    async generateCheckNumber(userId) {
        const lastCheck = await db.sequelize.query(
            `SELECT check_number FROM check_register
             WHERE user_id = ?
             ORDER BY check_number::INTEGER DESC
             LIMIT 1`,
            {
                replacements: [userId],
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        const lastNumber = lastCheck[0] ? parseInt(lastCheck[0].check_number) : 1000;
        return String(lastNumber + 1).padStart(6, '0');
    }

    /**
     * Queue check for printing (integration point)
     */
    async queueCheckForPrinting(check, payee) {
        // This would integrate with check printing services like Lob.com
        // For now, just mark as queued
        await db.sequelize.query(
            `UPDATE check_register 
            SET status = 'printed', mail_date = CURRENT_DATE + INTERVAL '1 day' 
            WHERE id = ?`,
            {
                replacements: [check.id]
            }
        );

        logger.info('Check queued for printing', { checkId: check.id });
    }

    /**
     * Calculate next payment date
     */
    calculateNextPaymentDate(currentDate, pattern, dayOfMonth = null) {
        const current = moment(currentDate);

        switch (pattern) {
            case 'monthly':
                if (dayOfMonth) {
                    return current.add(1, 'month').date(dayOfMonth).toDate();
                }
                return current.add(1, 'month').toDate();
            case 'quarterly':
                return current.add(3, 'months').toDate();
            case 'semi_annually':
                return current.add(6, 'months').toDate();
            case 'annually':
                return current.add(1, 'year').toDate();
            default:
                return current.add(1, 'month').toDate();
        }
    }

    /**
     * Encrypt sensitive data
     */
    encryptData(data) {
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }

    /**
     * Decrypt sensitive data
     */
    decryptData(encryptedData) {
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        
        const algorithm = 'aes-256-gcm';
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}

export default new BillPayService();