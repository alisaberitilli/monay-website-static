import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { publishToQueue } from './kafka.js';
import NotificationService from './notificationService.js';
import { trackMetrics } from './analytics.js';
import logger from './logger.js';

class P2PAdvancedService {
    constructor() {
        this.notificationService = new NotificationService();
        this.transactionTimeouts = new Map();
    }

    // ==================== USER SEARCH & DISCOVERY ====================

    /**
     * Search for users by various criteria
     */
    async searchUsers(searchTerm, searcherId) {
        try {
            // Sanitize search term
            const sanitizedTerm = searchTerm.trim().toLowerCase();

            // Search by email, phone, or username
            const query = `
                SELECT
                    u.id,
                    u.username,
                    u.email,
                    u.phone_number,
                    u.first_name,
                    u.last_name,
                    u.avatar_url,
                    ud.display_name,
                    ud.searchable,
                    ud.require_contact_approval,
                    CASE
                        WHEN pc.id IS NOT NULL THEN true
                        ELSE false
                    END as is_contact
                FROM users u
                LEFT JOIN p2p_user_directory ud ON u.id = ud.user_id
                LEFT JOIN p2p_contacts pc ON
                    pc.user_id = :searcherId AND
                    pc.contact_id = u.id AND
                    pc.status = 'active'
                WHERE
                    u.id != :searcherId AND
                    u.status = 'active' AND
                    (ud.searchable = true OR ud.searchable IS NULL) AND
                    (
                        LOWER(u.email) = :term OR
                        u.phone_number = :term OR
                        LOWER(u.username) LIKE :likeTerm OR
                        LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE :likeTerm OR
                        LOWER(ud.display_name) LIKE :likeTerm
                    )
                ORDER BY is_contact DESC, u.username ASC
                LIMIT 20
            `;

            const [results] = await db.sequelize.query(query, {
                replacements: {
                    searcherId,
                    term: sanitizedTerm,
                    likeTerm: `%${sanitizedTerm}%`
                }
            });

            // Filter sensitive information
            return results.map(user => ({
                id: user.id,
                username: user.username,
                displayName: user.display_name || `${user.first_name} ${user.last_name}`,
                avatarUrl: user.avatar_url,
                isContact: user.is_contact,
                requiresApproval: user.require_contact_approval || false
            }));
        } catch (error) {
            logger.error('User search error:', error);
            throw error;
        }
    }

    /**
     * Get user's contacts list
     */
    async getUserContacts(userId, options = {}) {
        try {
            const { limit = 50, offset = 0, includeRecent = true } = options;

            let query = `
                SELECT
                    pc.*,
                    u.username,
                    u.email,
                    u.first_name,
                    u.last_name,
                    u.avatar_url,
                    ud.display_name,
                    (
                        SELECT COUNT(*)
                        FROM p2p_transfers pt
                        WHERE
                            (pt.sender_id = pc.user_id AND pt.recipient_id = pc.contact_id) OR
                            (pt.sender_id = pc.contact_id AND pt.recipient_id = pc.user_id)
                    ) as transaction_count,
                    (
                        SELECT MAX(created_at)
                        FROM p2p_transfers pt
                        WHERE
                            (pt.sender_id = pc.user_id AND pt.recipient_id = pc.contact_id) OR
                            (pt.sender_id = pc.contact_id AND pt.recipient_id = pc.user_id)
                    ) as last_transaction
                FROM p2p_contacts pc
                JOIN users u ON pc.contact_id = u.id
                LEFT JOIN p2p_user_directory ud ON u.id = ud.user_id
                WHERE
                    pc.user_id = :userId AND
                    pc.status = 'active'
            `;

            if (includeRecent) {
                // Also include recent transaction partners not in contacts
                query = `
                    WITH contacts AS (${query}),
                    recent_partners AS (
                        SELECT DISTINCT
                            CASE
                                WHEN pt.sender_id = :userId THEN pt.recipient_id
                                ELSE pt.sender_id
                            END as partner_id,
                            MAX(pt.created_at) as last_transaction
                        FROM p2p_transfers pt
                        WHERE
                            (pt.sender_id = :userId OR pt.recipient_id = :userId) AND
                            pt.status = 'completed'
                        GROUP BY partner_id
                        ORDER BY last_transaction DESC
                        LIMIT 10
                    )
                    SELECT * FROM (
                        SELECT * FROM contacts
                        UNION ALL
                        SELECT
                            NULL as id,
                            :userId as user_id,
                            rp.partner_id as contact_id,
                            NULL as nickname,
                            'recent' as status,
                            NULL as is_favorite,
                            NULL as is_blocked,
                            rp.last_transaction as created_at,
                            rp.last_transaction as updated_at,
                            u.username,
                            u.email,
                            u.first_name,
                            u.last_name,
                            u.avatar_url,
                            ud.display_name,
                            (
                                SELECT COUNT(*)
                                FROM p2p_transfers pt2
                                WHERE
                                    (pt2.sender_id = :userId AND pt2.recipient_id = rp.partner_id) OR
                                    (pt2.sender_id = rp.partner_id AND pt2.recipient_id = :userId)
                            ) as transaction_count,
                            rp.last_transaction
                        FROM recent_partners rp
                        JOIN users u ON rp.partner_id = u.id
                        LEFT JOIN p2p_user_directory ud ON u.id = ud.user_id
                        WHERE rp.partner_id NOT IN (
                            SELECT contact_id FROM p2p_contacts
                            WHERE user_id = :userId AND status = 'active'
                        )
                    ) combined
                `;
            }

            query += `
                ORDER BY
                    is_favorite DESC,
                    last_transaction DESC NULLS LAST,
                    transaction_count DESC
                LIMIT :limit OFFSET :offset
            `;

            const [contacts] = await db.sequelize.query(query, {
                replacements: { userId, limit, offset }
            });

            return contacts;
        } catch (error) {
            logger.error('Get contacts error:', error);
            throw error;
        }
    }

    /**
     * Add a new contact
     */
    async addContact(userId, contactId, nickname = null) {
        try {
            // Check if contact already exists
            const [[existing]] = await db.sequelize.query(
                `SELECT * FROM p2p_contacts
                 WHERE user_id = :userId AND contact_id = :contactId`,
                { replacements: { userId, contactId } }
            );

            if (existing) {
                if (existing.status === 'blocked') {
                    throw new Error('This user is blocked');
                }
                if (existing.status === 'active') {
                    return existing;
                }
                // Reactivate archived contact
                await db.sequelize.query(
                    `UPDATE p2p_contacts
                     SET status = 'active', nickname = :nickname, updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    { replacements: { id: existing.id, nickname } }
                );
                return { ...existing, status: 'active', nickname };
            }

            // Create new contact
            const id = uuidv4();
            await db.sequelize.query(
                `INSERT INTO p2p_contacts
                 (id, user_id, contact_id, nickname, status)
                 VALUES (:id, :userId, :contactId, :nickname, 'active')`,
                {
                    replacements: {
                        id,
                        userId,
                        contactId,
                        nickname
                    }
                }
            );

            return { id, userId, contactId, nickname, status: 'active' };
        } catch (error) {
            logger.error('Add contact error:', error);
            throw error;
        }
    }

    // ==================== INSTANT TRANSFERS ====================

    /**
     * Create instant P2P transfer
     */
    async createTransfer(senderId, recipientId, amount, options = {}) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                note = null,
                isInstant = true,
                transferMethod = 'instant',
                metadata = {}
            } = options;

            // Validate amount
            if (amount <= 0) {
                throw new Error('Transfer amount must be positive');
            }

            // Check sender balance
            const [[sender]] = await db.sequelize.query(
                `SELECT balance FROM wallets WHERE user_id = :senderId`,
                { replacements: { senderId }, transaction }
            );

            if (!sender || sender.balance < amount) {
                throw new Error('Insufficient balance');
            }

            // Check transfer limits
            await this.checkTransferLimits(senderId, amount, transaction);

            // Generate transfer reference
            const transferReference = await this.generateTransferReference();

            // Create transfer record
            const transferId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO p2p_transfers
                 (id, sender_id, recipient_id, amount, transfer_type, transfer_method,
                  note, status, transfer_reference, metadata)
                 VALUES (:id, :senderId, :recipientId, :amount, 'send', :transferMethod,
                  :note, :status, :transferReference, :metadata)`,
                {
                    replacements: {
                        id: transferId,
                        senderId,
                        recipientId,
                        amount,
                        transferMethod,
                        note,
                        status: isInstant ? 'completed' : 'pending',
                        transferReference,
                        metadata: JSON.stringify(metadata)
                    },
                    transaction
                }
            );

            // Process instant transfer
            if (isInstant) {
                // Debit sender
                await db.sequelize.query(
                    `UPDATE wallets
                     SET balance = balance - :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :senderId`,
                    { replacements: { amount, senderId }, transaction }
                );

                // Credit recipient
                await db.sequelize.query(
                    `UPDATE wallets
                     SET balance = balance + :amount,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = :recipientId`,
                    { replacements: { amount, recipientId }, transaction }
                );

                // Update completion time
                await db.sequelize.query(
                    `UPDATE p2p_transfers
                     SET completed_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    { replacements: { id: transferId }, transaction }
                );

                // Update contact statistics
                await this.updateContactStats(senderId, recipientId, transaction);
            }

            await transaction.commit();

            // Send notifications
            await this.sendTransferNotifications(transferId, senderId, recipientId, amount, isInstant);

            // Track metrics
            await trackMetrics('p2p_transfer', {
                transferId,
                senderId,
                recipientId,
                amount,
                method: transferMethod,
                instant: isInstant
            });

            return {
                id: transferId,
                reference: transferReference,
                status: isInstant ? 'completed' : 'pending',
                amount,
                senderId,
                recipientId
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Create transfer error:', error);
            throw error;
        }
    }

    /**
     * Check and enforce transfer limits
     */
    async checkTransferLimits(userId, amount, transaction) {
        // Get user limits
        let [[limits]] = await db.sequelize.query(
            `SELECT * FROM p2p_transfer_limits WHERE user_id = :userId`,
            { replacements: { userId }, transaction }
        );

        if (!limits) {
            // Use default limits
            [[limits]] = await db.sequelize.query(
                `SELECT * FROM p2p_transfer_limits WHERE is_default = true`,
                { transaction }
            );

            if (!limits) {
                // System defaults
                limits = {
                    daily_limit: 10000,
                    weekly_limit: 50000,
                    monthly_limit: 100000,
                    per_transaction_limit: 5000
                };
            }
        }

        // Check per-transaction limit
        if (amount > limits.per_transaction_limit) {
            throw new Error(`Amount exceeds per-transaction limit of $${limits.per_transaction_limit}`);
        }

        // Check daily limit
        const [[dailyTotal]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= CURRENT_DATE`,
            { replacements: { userId }, transaction }
        );

        if (parseFloat(dailyTotal.total) + amount > limits.daily_limit) {
            throw new Error(`Transfer would exceed daily limit of $${limits.daily_limit}`);
        }

        // Check weekly limit
        const [[weeklyTotal]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
            { replacements: { userId }, transaction }
        );

        if (parseFloat(weeklyTotal.total) + amount > limits.weekly_limit) {
            throw new Error(`Transfer would exceed weekly limit of $${limits.weekly_limit}`);
        }

        // Check monthly limit
        const [[monthlyTotal]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            { replacements: { userId }, transaction }
        );

        if (parseFloat(monthlyTotal.total) + amount > limits.monthly_limit) {
            throw new Error(`Transfer would exceed monthly limit of $${limits.monthly_limit}`);
        }

        return true;
    }

    // ==================== MONEY REQUESTS ====================

    /**
     * Create money request
     */
    async createMoneyRequest(requesterId, payerId, amount, options = {}) {
        try {
            const {
                note = null,
                dueDate = null,
                metadata = {}
            } = options;

            // Validate amount
            if (amount <= 0) {
                throw new Error('Request amount must be positive');
            }

            // Create request
            const requestId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO money_requests
                 (id, requester_id, payer_id, amount, note, due_date, status, metadata)
                 VALUES (:id, :requesterId, :payerId, :amount, :note, :dueDate, 'pending', :metadata)`,
                {
                    replacements: {
                        id: requestId,
                        requesterId,
                        payerId,
                        amount,
                        note,
                        dueDate,
                        metadata: JSON.stringify(metadata)
                    }
                }
            );

            // Send notification to payer
            await this.notificationService.sendNotification(payerId, {
                type: 'money_request',
                title: 'Money Request',
                message: `You have a new money request for $${amount.toFixed(2)}`,
                data: { requestId, amount, requesterId }
            });

            // Set reminder if due date provided
            if (dueDate) {
                await this.scheduleRequestReminder(requestId, payerId, dueDate);
            }

            return { id: requestId, status: 'pending', amount };
        } catch (error) {
            logger.error('Create money request error:', error);
            throw error;
        }
    }

    /**
     * Accept and pay money request
     */
    async acceptMoneyRequest(requestId, payerId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get request details
            const [[request]] = await db.sequelize.query(
                `SELECT * FROM money_requests
                 WHERE id = :requestId AND payer_id = :payerId AND status = 'pending'`,
                { replacements: { requestId, payerId }, transaction }
            );

            if (!request) {
                throw new Error('Request not found or already processed');
            }

            // Process payment
            const transfer = await this.createTransfer(
                payerId,
                request.requester_id,
                request.amount,
                {
                    note: `Payment for request: ${request.note || 'No note'}`,
                    metadata: { requestId }
                }
            );

            // Update request status
            await db.sequelize.query(
                `UPDATE money_requests
                 SET status = 'paid',
                     transfer_id = :transferId,
                     paid_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :requestId`,
                {
                    replacements: {
                        requestId,
                        transferId: transfer.id
                    },
                    transaction
                }
            );

            await transaction.commit();

            // Notify requester
            await this.notificationService.sendNotification(request.requester_id, {
                type: 'request_paid',
                title: 'Money Request Paid',
                message: `Your request for $${request.amount.toFixed(2)} has been paid`,
                data: { requestId, transferId: transfer.id }
            });

            return { requestId, transferId: transfer.id, status: 'paid' };
        } catch (error) {
            await transaction.rollback();
            logger.error('Accept money request error:', error);
            throw error;
        }
    }

    /**
     * Decline money request
     */
    async declineMoneyRequest(requestId, payerId, reason = null) {
        try {
            // Update request status
            const [result] = await db.sequelize.query(
                `UPDATE money_requests
                 SET status = 'declined',
                     decline_reason = :reason,
                     declined_at = CURRENT_TIMESTAMP,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :requestId AND payer_id = :payerId AND status = 'pending'
                 RETURNING requester_id, amount`,
                { replacements: { requestId, payerId, reason } }
            );

            if (result.length === 0) {
                throw new Error('Request not found or already processed');
            }

            const [[request]] = result;

            // Notify requester
            await this.notificationService.sendNotification(request.requester_id, {
                type: 'request_declined',
                title: 'Money Request Declined',
                message: `Your request for $${request.amount.toFixed(2)} was declined`,
                data: { requestId, reason }
            });

            return { requestId, status: 'declined' };
        } catch (error) {
            logger.error('Decline money request error:', error);
            throw error;
        }
    }

    // ==================== SPLIT BILLS ====================

    /**
     * Create split bill
     */
    async createSplitBill(creatorId, totalAmount, participants, options = {}) {
        const transaction = await db.sequelize.transaction();

        try {
            const {
                description = null,
                splitMethod = 'equal',
                customAmounts = {},
                dueDate = null,
                metadata = {}
            } = options;

            // Validate participants
            if (participants.length < 1) {
                throw new Error('At least one participant required');
            }

            // Create split bill
            const splitId = uuidv4();
            await db.sequelize.query(
                `INSERT INTO split_bills
                 (id, creator_id, total_amount, description, split_method,
                  participant_count, status, due_date, metadata)
                 VALUES (:id, :creatorId, :totalAmount, :description, :splitMethod,
                  :participantCount, 'pending', :dueDate, :metadata)`,
                {
                    replacements: {
                        id: splitId,
                        creatorId,
                        totalAmount,
                        description,
                        splitMethod,
                        participantCount: participants.length + 1, // Include creator
                        dueDate,
                        metadata: JSON.stringify(metadata)
                    },
                    transaction
                }
            );

            // Calculate amounts for each participant
            const amounts = this.calculateSplitAmounts(
                totalAmount,
                participants.length + 1,
                splitMethod,
                customAmounts
            );

            // Add creator as participant (already paid)
            await db.sequelize.query(
                `INSERT INTO split_participants
                 (id, split_bill_id, user_id, amount_owed, status, is_creator)
                 VALUES (:id, :splitId, :creatorId, :amount, 'paid', true)`,
                {
                    replacements: {
                        id: uuidv4(),
                        splitId,
                        creatorId,
                        amount: amounts[0]
                    },
                    transaction
                }
            );

            // Add other participants
            for (let i = 0; i < participants.length; i++) {
                const participantId = participants[i];
                await db.sequelize.query(
                    `INSERT INTO split_participants
                     (id, split_bill_id, user_id, amount_owed, status, is_creator)
                     VALUES (:id, :splitId, :userId, :amount, 'pending', false)`,
                    {
                        replacements: {
                            id: uuidv4(),
                            splitId,
                            userId: participantId,
                            amount: amounts[i + 1]
                        },
                        transaction
                    }
                );

                // Send notification
                await this.notificationService.sendNotification(participantId, {
                    type: 'split_bill',
                    title: 'New Split Bill',
                    message: `You owe $${amounts[i + 1].toFixed(2)} for ${description || 'a split bill'}`,
                    data: { splitId, amount: amounts[i + 1] }
                });
            }

            await transaction.commit();

            return { id: splitId, status: 'pending', totalAmount, participants: participants.length + 1 };
        } catch (error) {
            await transaction.rollback();
            logger.error('Create split bill error:', error);
            throw error;
        }
    }

    /**
     * Calculate split amounts based on method
     */
    calculateSplitAmounts(totalAmount, participantCount, method, customAmounts = {}) {
        const amounts = [];

        switch (method) {
            case 'equal':
                const equalAmount = totalAmount / participantCount;
                for (let i = 0; i < participantCount; i++) {
                    amounts.push(Math.round(equalAmount * 100) / 100);
                }
                // Adjust for rounding
                const diff = totalAmount - amounts.reduce((a, b) => a + b, 0);
                if (diff !== 0) {
                    amounts[0] += diff;
                }
                break;

            case 'percentage':
                // customAmounts should contain percentage for each participant
                for (let i = 0; i < participantCount; i++) {
                    const percentage = customAmounts[i] || (100 / participantCount);
                    amounts.push(Math.round(totalAmount * percentage / 100 * 100) / 100);
                }
                break;

            case 'custom':
                // customAmounts should contain exact amount for each participant
                for (let i = 0; i < participantCount; i++) {
                    amounts.push(customAmounts[i] || 0);
                }
                break;

            default:
                throw new Error('Invalid split method');
        }

        return amounts;
    }

    /**
     * Pay split bill share
     */
    async paySplitBill(splitId, payerId) {
        const transaction = await db.sequelize.transaction();

        try {
            // Get participant details
            const [[participant]] = await db.sequelize.query(
                `SELECT sp.*, sb.creator_id
                 FROM split_participants sp
                 JOIN split_bills sb ON sp.split_bill_id = sb.id
                 WHERE sp.split_bill_id = :splitId
                 AND sp.user_id = :payerId
                 AND sp.status = 'pending'`,
                { replacements: { splitId, payerId }, transaction }
            );

            if (!participant) {
                throw new Error('Participant not found or already paid');
            }

            // Process payment to creator
            const transfer = await this.createTransfer(
                payerId,
                participant.creator_id,
                participant.amount_owed,
                {
                    note: `Split bill payment`,
                    metadata: { splitId, participantId: participant.id }
                }
            );

            // Update participant status
            await db.sequelize.query(
                `UPDATE split_participants
                 SET status = 'paid',
                     paid_at = CURRENT_TIMESTAMP,
                     transfer_id = :transferId,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id`,
                {
                    replacements: {
                        id: participant.id,
                        transferId: transfer.id
                    },
                    transaction
                }
            );

            // Check if all participants have paid
            const [[pending]] = await db.sequelize.query(
                `SELECT COUNT(*) as count
                 FROM split_participants
                 WHERE split_bill_id = :splitId
                 AND status = 'pending'`,
                { replacements: { splitId }, transaction }
            );

            if (pending.count === 0) {
                // Mark split bill as settled
                await db.sequelize.query(
                    `UPDATE split_bills
                     SET status = 'settled',
                         settled_at = CURRENT_TIMESTAMP,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :splitId`,
                    { replacements: { splitId }, transaction }
                );

                // Notify creator
                await this.notificationService.sendNotification(participant.creator_id, {
                    type: 'split_settled',
                    title: 'Split Bill Settled',
                    message: 'All participants have paid their share',
                    data: { splitId }
                });
            }

            await transaction.commit();

            return { splitId, transferId: transfer.id, status: 'paid' };
        } catch (error) {
            await transaction.rollback();
            logger.error('Pay split bill error:', error);
            throw error;
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate unique transfer reference
     */
    async generateTransferReference() {
        const prefix = 'P2P';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Update contact statistics after transfer
     */
    async updateContactStats(senderId, recipientId, transaction) {
        try {
            // Check if contact exists
            const [[contact]] = await db.sequelize.query(
                `SELECT id FROM p2p_contacts
                 WHERE user_id = :senderId AND contact_id = :recipientId`,
                { replacements: { senderId, recipientId }, transaction }
            );

            if (contact) {
                // Update existing contact stats
                await db.sequelize.query(
                    `UPDATE p2p_contacts
                     SET transaction_count = transaction_count + 1,
                         last_transaction_at = CURRENT_TIMESTAMP,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id`,
                    { replacements: { id: contact.id }, transaction }
                );
            }
        } catch (error) {
            logger.error('Update contact stats error:', error);
            // Non-critical error, don't throw
        }
    }

    /**
     * Send transfer notifications
     */
    async sendTransferNotifications(transferId, senderId, recipientId, amount, isInstant) {
        try {
            // Get user details
            const [[sender]] = await db.sequelize.query(
                `SELECT username, first_name, last_name FROM users WHERE id = :senderId`,
                { replacements: { senderId } }
            );

            const [[recipient]] = await db.sequelize.query(
                `SELECT username, first_name, last_name FROM users WHERE id = :recipientId`,
                { replacements: { recipientId } }
            );

            const senderName = sender.username || `${sender.first_name} ${sender.last_name}`;
            const recipientName = recipient.username || `${recipient.first_name} ${recipient.last_name}`;

            // Notify sender
            await this.notificationService.sendNotification(senderId, {
                type: 'transfer_sent',
                title: 'Money Sent',
                message: `You sent $${amount.toFixed(2)} to ${recipientName}`,
                data: { transferId, amount, recipientId }
            });

            // Notify recipient
            await this.notificationService.sendNotification(recipientId, {
                type: 'transfer_received',
                title: 'Money Received',
                message: `You received $${amount.toFixed(2)} from ${senderName}`,
                data: { transferId, amount, senderId }
            });
        } catch (error) {
            logger.error('Send notifications error:', error);
            // Non-critical error, don't throw
        }
    }

    /**
     * Schedule reminder for money request
     */
    async scheduleRequestReminder(requestId, payerId, dueDate) {
        try {
            const reminderDate = new Date(dueDate);
            reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before

            if (reminderDate > new Date()) {
                // Schedule reminder (implement with your job queue)
                await publishToQueue('reminders', {
                    type: 'money_request_reminder',
                    requestId,
                    payerId,
                    scheduledFor: reminderDate.toISOString()
                });
            }
        } catch (error) {
            logger.error('Schedule reminder error:', error);
            // Non-critical error, don't throw
        }
    }

    /**
     * Get transfer history
     */
    async getTransferHistory(userId, options = {}) {
        try {
            const { limit = 50, offset = 0, type = 'all' } = options;

            let whereClause = '';
            switch (type) {
                case 'sent':
                    whereClause = 'pt.sender_id = :userId';
                    break;
                case 'received':
                    whereClause = 'pt.recipient_id = :userId';
                    break;
                default:
                    whereClause = '(pt.sender_id = :userId OR pt.recipient_id = :userId)';
            }

            const query = `
                SELECT
                    pt.*,
                    sender.username as sender_username,
                    sender.first_name as sender_first_name,
                    sender.last_name as sender_last_name,
                    sender.avatar_url as sender_avatar,
                    recipient.username as recipient_username,
                    recipient.first_name as recipient_first_name,
                    recipient.last_name as recipient_last_name,
                    recipient.avatar_url as recipient_avatar,
                    CASE
                        WHEN pt.sender_id = :userId THEN 'sent'
                        ELSE 'received'
                    END as direction
                FROM p2p_transfers pt
                JOIN users sender ON pt.sender_id = sender.id
                JOIN users recipient ON pt.recipient_id = recipient.id
                WHERE ${whereClause}
                ORDER BY pt.created_at DESC
                LIMIT :limit OFFSET :offset
            `;

            const [transfers] = await db.sequelize.query(query, {
                replacements: { userId, limit, offset }
            });

            return transfers;
        } catch (error) {
            logger.error('Get transfer history error:', error);
            throw error;
        }
    }

    /**
     * Get pending money requests
     */
    async getPendingRequests(userId, type = 'all') {
        try {
            let query = '';

            if (type === 'sent' || type === 'all') {
                query = `
                    SELECT
                        mr.*,
                        u.username,
                        u.first_name,
                        u.last_name,
                        u.avatar_url,
                        'sent' as request_type
                    FROM money_requests mr
                    JOIN users u ON mr.payer_id = u.id
                    WHERE mr.requester_id = :userId AND mr.status = 'pending'
                `;
            }

            if (type === 'received' || type === 'all') {
                if (query) query += ' UNION ALL ';
                query += `
                    SELECT
                        mr.*,
                        u.username,
                        u.first_name,
                        u.last_name,
                        u.avatar_url,
                        'received' as request_type
                    FROM money_requests mr
                    JOIN users u ON mr.requester_id = u.id
                    WHERE mr.payer_id = :userId AND mr.status = 'pending'
                `;
            }

            query += ' ORDER BY created_at DESC';

            const [requests] = await db.sequelize.query(query, {
                replacements: { userId }
            });

            return requests;
        } catch (error) {
            logger.error('Get pending requests error:', error);
            throw error;
        }
    }

    /**
     * Get active split bills
     */
    async getActiveSplitBills(userId) {
        try {
            const query = `
                SELECT
                    sb.*,
                    sp.amount_owed,
                    sp.status as participant_status,
                    sp.is_creator,
                    creator.username as creator_username,
                    creator.first_name as creator_first_name,
                    creator.last_name as creator_last_name,
                    (
                        SELECT COUNT(*)
                        FROM split_participants
                        WHERE split_bill_id = sb.id AND status = 'paid'
                    ) as paid_count,
                    (
                        SELECT COUNT(*)
                        FROM split_participants
                        WHERE split_bill_id = sb.id
                    ) as total_participants
                FROM split_bills sb
                JOIN split_participants sp ON sb.id = sp.split_bill_id
                JOIN users creator ON sb.creator_id = creator.id
                WHERE
                    sp.user_id = :userId AND
                    (sb.status = 'pending' OR
                     (sb.status = 'settled' AND sb.settled_at > CURRENT_DATE - INTERVAL '7 days'))
                ORDER BY sb.created_at DESC
            `;

            const [splitBills] = await db.sequelize.query(query, {
                replacements: { userId }
            });

            return splitBills;
        } catch (error) {
            logger.error('Get active split bills error:', error);
            throw error;
        }
    }
}

export default new P2PAdvancedService();