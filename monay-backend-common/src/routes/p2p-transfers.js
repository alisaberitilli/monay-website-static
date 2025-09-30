/**
 * P2P Transfer Routes
 * Consumer Wallet Phase 3 Day 13 Implementation
 */

import express from 'express';
import Joi from 'joi';
import { authenticateJWT } from '../middleware-app/authenticate.js';
import p2pAdvancedService from '../services/p2p-advanced-service.js';
import logger from '../services/logger.js';

const router = express.Router();

// ==================== VALIDATION SCHEMAS ====================

const searchSchema = Joi.object({
    query: Joi.string().min(1).max(100).required(),
    type: Joi.string().valid('email', 'phone', 'username', 'name', 'auto').default('auto')
});

const transferSchema = Joi.object({
    recipientId: Joi.string().uuid().required(),
    amount: Joi.number().positive().max(10000).required(),
    note: Joi.string().max(500).optional(),
    isInstant: Joi.boolean().default(true),
    transferMethod: Joi.string().valid('instant', 'standard', 'scheduled').default('instant')
});

const moneyRequestSchema = Joi.object({
    payerId: Joi.string().uuid().required(),
    amount: Joi.number().positive().max(10000).required(),
    note: Joi.string().max(500).optional(),
    dueDate: Joi.date().min('now').optional()
});

const splitBillSchema = Joi.object({
    totalAmount: Joi.number().positive().max(50000).required(),
    participants: Joi.array().items(Joi.string().uuid()).min(1).max(20).required(),
    description: Joi.string().max(500).optional(),
    splitMethod: Joi.string().valid('equal', 'percentage', 'custom').default('equal'),
    customAmounts: Joi.object().optional(),
    dueDate: Joi.date().min('now').optional()
});

const contactSchema = Joi.object({
    contactId: Joi.string().uuid().required(),
    nickname: Joi.string().max(100).optional()
});

const limitSchema = Joi.object({
    dailyLimit: Joi.number().positive().max(100000).optional(),
    weeklyLimit: Joi.number().positive().max(500000).optional(),
    monthlyLimit: Joi.number().positive().max(1000000).optional(),
    perTransactionLimit: Joi.number().positive().max(50000).optional()
});

// ==================== USER SEARCH & DISCOVERY ====================

/**
 * Search users
 * GET /api/p2p/search
 */
router.get('/search', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = searchSchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const users = await p2pAdvancedService.searchUsers(
            value.query,
            req.user.id
        );

        res.json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        logger.error('User search error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
});

/**
 * Get user contacts
 * GET /api/p2p/contacts
 */
router.get('/contacts', authenticateJWT, async (req, res) => {
    try {
        const { limit = 50, offset = 0, includeRecent = true } = req.query;

        const contacts = await p2pAdvancedService.getUserContacts(
            req.user.id,
            { limit: parseInt(limit), offset: parseInt(offset), includeRecent }
        );

        res.json({
            success: true,
            contacts,
            count: contacts.length
        });
    } catch (error) {
        logger.error('Get contacts error:', error);
        res.status(500).json({ error: 'Failed to get contacts' });
    }
});

/**
 * Add contact
 * POST /api/p2p/contacts
 */
router.post('/contacts', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const contact = await p2pAdvancedService.addContact(
            req.user.id,
            value.contactId,
            value.nickname
        );

        res.json({
            success: true,
            contact
        });
    } catch (error) {
        logger.error('Add contact error:', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }
});

/**
 * Update contact
 * PUT /api/p2p/contacts/:contactId
 */
router.put('/contacts/:contactId', authenticateJWT, async (req, res) => {
    try {
        const { nickname, isFavorite } = req.body;

        await db.sequelize.query(
            `UPDATE p2p_contacts
             SET nickname = COALESCE(:nickname, nickname),
                 is_favorite = COALESCE(:isFavorite, is_favorite),
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = :userId AND contact_id = :contactId`,
            {
                replacements: {
                    userId: req.user.id,
                    contactId: req.params.contactId,
                    nickname,
                    isFavorite
                }
            }
        );

        res.json({
            success: true,
            message: 'Contact updated'
        });
    } catch (error) {
        logger.error('Update contact error:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
});

/**
 * Remove contact
 * DELETE /api/p2p/contacts/:contactId
 */
router.delete('/contacts/:contactId', authenticateJWT, async (req, res) => {
    try {
        // Soft delete - set status to archived
        await db.sequelize.query(
            `UPDATE p2p_contacts
             SET status = 'archived',
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = :userId AND contact_id = :contactId`,
            {
                replacements: {
                    userId: req.user.id,
                    contactId: req.params.contactId
                }
            }
        );

        res.json({
            success: true,
            message: 'Contact removed'
        });
    } catch (error) {
        logger.error('Remove contact error:', error);
        res.status(500).json({ error: 'Failed to remove contact' });
    }
});

/**
 * Block user
 * POST /api/p2p/contacts/:contactId/block
 */
router.post('/contacts/:contactId/block', authenticateJWT, async (req, res) => {
    try {
        await db.sequelize.query(
            `UPDATE p2p_contacts
             SET is_blocked = true,
                 status = 'blocked',
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = :userId AND contact_id = :contactId`,
            {
                replacements: {
                    userId: req.user.id,
                    contactId: req.params.contactId
                }
            }
        );

        res.json({
            success: true,
            message: 'User blocked'
        });
    } catch (error) {
        logger.error('Block user error:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
});

// ==================== INSTANT TRANSFERS ====================

/**
 * Create P2P transfer
 * POST /api/p2p/transfers
 */
router.post('/transfers', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = transferSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const transfer = await p2pAdvancedService.createTransfer(
            req.user.id,
            value.recipientId,
            value.amount,
            {
                note: value.note,
                isInstant: value.isInstant,
                transferMethod: value.transferMethod
            }
        );

        res.json({
            success: true,
            transfer
        });
    } catch (error) {
        logger.error('Create transfer error:', error);
        res.status(500).json({ error: error.message || 'Failed to create transfer' });
    }
});

/**
 * Get transfer history
 * GET /api/p2p/transfers
 */
router.get('/transfers', authenticateJWT, async (req, res) => {
    try {
        const { limit = 50, offset = 0, type = 'all' } = req.query;

        const transfers = await p2pAdvancedService.getTransferHistory(
            req.user.id,
            { limit: parseInt(limit), offset: parseInt(offset), type }
        );

        res.json({
            success: true,
            transfers,
            count: transfers.length
        });
    } catch (error) {
        logger.error('Get transfer history error:', error);
        res.status(500).json({ error: 'Failed to get transfer history' });
    }
});

/**
 * Get transfer details
 * GET /api/p2p/transfers/:transferId
 */
router.get('/transfers/:transferId', authenticateJWT, async (req, res) => {
    try {
        const [[transfer]] = await db.sequelize.query(
            `SELECT
                pt.*,
                sender.username as sender_username,
                sender.first_name as sender_first_name,
                sender.last_name as sender_last_name,
                recipient.username as recipient_username,
                recipient.first_name as recipient_first_name,
                recipient.last_name as recipient_last_name
             FROM p2p_transfers pt
             JOIN users sender ON pt.sender_id = sender.id
             JOIN users recipient ON pt.recipient_id = recipient.id
             WHERE pt.id = :transferId
             AND (pt.sender_id = :userId OR pt.recipient_id = :userId)`,
            {
                replacements: {
                    transferId: req.params.transferId,
                    userId: req.user.id
                }
            }
        );

        if (!transfer) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        res.json({
            success: true,
            transfer
        });
    } catch (error) {
        logger.error('Get transfer details error:', error);
        res.status(500).json({ error: 'Failed to get transfer details' });
    }
});

// ==================== MONEY REQUESTS ====================

/**
 * Create money request
 * POST /api/p2p/requests
 */
router.post('/requests', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = moneyRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const request = await p2pAdvancedService.createMoneyRequest(
            req.user.id,
            value.payerId,
            value.amount,
            {
                note: value.note,
                dueDate: value.dueDate
            }
        );

        res.json({
            success: true,
            request
        });
    } catch (error) {
        logger.error('Create money request error:', error);
        res.status(500).json({ error: 'Failed to create money request' });
    }
});

/**
 * Get pending requests
 * GET /api/p2p/requests
 */
router.get('/requests', authenticateJWT, async (req, res) => {
    try {
        const { type = 'all' } = req.query;

        const requests = await p2pAdvancedService.getPendingRequests(
            req.user.id,
            type
        );

        res.json({
            success: true,
            requests,
            count: requests.length
        });
    } catch (error) {
        logger.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Failed to get pending requests' });
    }
});

/**
 * Accept money request
 * POST /api/p2p/requests/:requestId/accept
 */
router.post('/requests/:requestId/accept', authenticateJWT, async (req, res) => {
    try {
        const result = await p2pAdvancedService.acceptMoneyRequest(
            req.params.requestId,
            req.user.id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Accept money request error:', error);
        res.status(500).json({ error: error.message || 'Failed to accept request' });
    }
});

/**
 * Decline money request
 * POST /api/p2p/requests/:requestId/decline
 */
router.post('/requests/:requestId/decline', authenticateJWT, async (req, res) => {
    try {
        const { reason } = req.body;

        const result = await p2pAdvancedService.declineMoneyRequest(
            req.params.requestId,
            req.user.id,
            reason
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Decline money request error:', error);
        res.status(500).json({ error: 'Failed to decline request' });
    }
});

/**
 * Cancel money request
 * POST /api/p2p/requests/:requestId/cancel
 */
router.post('/requests/:requestId/cancel', authenticateJWT, async (req, res) => {
    try {
        await db.sequelize.query(
            `UPDATE money_requests
             SET status = 'cancelled',
                 cancelled_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :requestId AND requester_id = :userId AND status = 'pending'`,
            {
                replacements: {
                    requestId: req.params.requestId,
                    userId: req.user.id
                }
            }
        );

        res.json({
            success: true,
            message: 'Request cancelled'
        });
    } catch (error) {
        logger.error('Cancel money request error:', error);
        res.status(500).json({ error: 'Failed to cancel request' });
    }
});

// ==================== SPLIT BILLS ====================

/**
 * Create split bill
 * POST /api/p2p/splits
 */
router.post('/splits', authenticateJWT, async (req, res) => {
    try {
        const { error, value } = splitBillSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const splitBill = await p2pAdvancedService.createSplitBill(
            req.user.id,
            value.totalAmount,
            value.participants,
            {
                description: value.description,
                splitMethod: value.splitMethod,
                customAmounts: value.customAmounts,
                dueDate: value.dueDate
            }
        );

        res.json({
            success: true,
            splitBill
        });
    } catch (error) {
        logger.error('Create split bill error:', error);
        res.status(500).json({ error: 'Failed to create split bill' });
    }
});

/**
 * Get active split bills
 * GET /api/p2p/splits
 */
router.get('/splits', authenticateJWT, async (req, res) => {
    try {
        const splitBills = await p2pAdvancedService.getActiveSplitBills(req.user.id);

        res.json({
            success: true,
            splitBills,
            count: splitBills.length
        });
    } catch (error) {
        logger.error('Get split bills error:', error);
        res.status(500).json({ error: 'Failed to get split bills' });
    }
});

/**
 * Get split bill details
 * GET /api/p2p/splits/:splitId
 */
router.get('/splits/:splitId', authenticateJWT, async (req, res) => {
    try {
        const query = `
            SELECT
                sb.*,
                creator.username as creator_username,
                creator.first_name as creator_first_name,
                creator.last_name as creator_last_name
            FROM split_bills sb
            JOIN users creator ON sb.creator_id = creator.id
            WHERE sb.id = :splitId
        `;

        const [[splitBill]] = await db.sequelize.query(query, {
            replacements: { splitId: req.params.splitId }
        });

        if (!splitBill) {
            return res.status(404).json({ error: 'Split bill not found' });
        }

        // Get participants
        const [participants] = await db.sequelize.query(
            `SELECT
                sp.*,
                u.username,
                u.first_name,
                u.last_name,
                u.avatar_url
             FROM split_participants sp
             JOIN users u ON sp.user_id = u.id
             WHERE sp.split_bill_id = :splitId
             ORDER BY sp.is_creator DESC, sp.created_at ASC`,
            { replacements: { splitId: req.params.splitId } }
        );

        res.json({
            success: true,
            splitBill: {
                ...splitBill,
                participants
            }
        });
    } catch (error) {
        logger.error('Get split bill details error:', error);
        res.status(500).json({ error: 'Failed to get split bill details' });
    }
});

/**
 * Pay split bill
 * POST /api/p2p/splits/:splitId/pay
 */
router.post('/splits/:splitId/pay', authenticateJWT, async (req, res) => {
    try {
        const result = await p2pAdvancedService.paySplitBill(
            req.params.splitId,
            req.user.id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Pay split bill error:', error);
        res.status(500).json({ error: error.message || 'Failed to pay split bill' });
    }
});

/**
 * Remind split participants
 * POST /api/p2p/splits/:splitId/remind
 */
router.post('/splits/:splitId/remind', authenticateJWT, async (req, res) => {
    try {
        // Get unpaid participants
        const [participants] = await db.sequelize.query(
            `SELECT
                sp.user_id,
                sp.amount_owed,
                u.email,
                u.first_name
             FROM split_participants sp
             JOIN users u ON sp.user_id = u.id
             WHERE sp.split_bill_id = :splitId
             AND sp.status = 'pending'
             AND sp.user_id != :userId`,
            {
                replacements: {
                    splitId: req.params.splitId,
                    userId: req.user.id
                }
            }
        );

        // Send reminders
        for (const participant of participants) {
            await notificationService.sendNotification(participant.user_id, {
                type: 'split_reminder',
                title: 'Split Bill Reminder',
                message: `Reminder: You owe $${participant.amount_owed.toFixed(2)} for a split bill`,
                data: { splitId: req.params.splitId }
            });
        }

        res.json({
            success: true,
            message: `Reminders sent to ${participants.length} participants`
        });
    } catch (error) {
        logger.error('Remind participants error:', error);
        res.status(500).json({ error: 'Failed to send reminders' });
    }
});

// ==================== TRANSFER LIMITS ====================

/**
 * Get transfer limits
 * GET /api/p2p/limits
 */
router.get('/limits', authenticateJWT, async (req, res) => {
    try {
        const [[limits]] = await db.sequelize.query(
            `SELECT * FROM p2p_transfer_limits WHERE user_id = :userId`,
            { replacements: { userId: req.user.id } }
        );

        if (!limits) {
            // Return default limits
            const [[defaultLimits]] = await db.sequelize.query(
                `SELECT * FROM p2p_transfer_limits WHERE is_default = true`
            );

            return res.json({
                success: true,
                limits: defaultLimits || {
                    daily_limit: 10000,
                    weekly_limit: 50000,
                    monthly_limit: 100000,
                    per_transaction_limit: 5000
                },
                isDefault: true
            });
        }

        res.json({
            success: true,
            limits,
            isDefault: false
        });
    } catch (error) {
        logger.error('Get transfer limits error:', error);
        res.status(500).json({ error: 'Failed to get transfer limits' });
    }
});

/**
 * Get transfer usage
 * GET /api/p2p/usage
 */
router.get('/usage', authenticateJWT, async (req, res) => {
    try {
        // Get daily usage
        const [[dailyUsage]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= CURRENT_DATE`,
            { replacements: { userId: req.user.id } }
        );

        // Get weekly usage
        const [[weeklyUsage]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
            { replacements: { userId: req.user.id } }
        );

        // Get monthly usage
        const [[monthlyUsage]] = await db.sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            usage: {
                daily: parseFloat(dailyUsage.total),
                weekly: parseFloat(weeklyUsage.total),
                monthly: parseFloat(monthlyUsage.total)
            }
        });
    } catch (error) {
        logger.error('Get transfer usage error:', error);
        res.status(500).json({ error: 'Failed to get transfer usage' });
    }
});

// ==================== ANALYTICS ====================

/**
 * Get P2P analytics
 * GET /api/p2p/analytics
 */
router.get('/analytics', authenticateJWT, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let dateFilter = 'CURRENT_DATE - INTERVAL \'30 days\'';
        if (period === '7d') {
            dateFilter = 'CURRENT_DATE - INTERVAL \'7 days\'';
        } else if (period === '90d') {
            dateFilter = 'CURRENT_DATE - INTERVAL \'90 days\'';
        }

        // Total sent
        const [[sent]] = await db.sequelize.query(
            `SELECT
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE sender_id = :userId
             AND status = 'completed'
             AND created_at >= ${dateFilter}`,
            { replacements: { userId: req.user.id } }
        );

        // Total received
        const [[received]] = await db.sequelize.query(
            `SELECT
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total
             FROM p2p_transfers
             WHERE recipient_id = :userId
             AND status = 'completed'
             AND created_at >= ${dateFilter}`,
            { replacements: { userId: req.user.id } }
        );

        // Top contacts
        const [topContacts] = await db.sequelize.query(
            `WITH transfer_partners AS (
                SELECT
                    CASE
                        WHEN sender_id = :userId THEN recipient_id
                        ELSE sender_id
                    END as partner_id,
                    COUNT(*) as transaction_count,
                    SUM(amount) as total_amount
                FROM p2p_transfers
                WHERE (sender_id = :userId OR recipient_id = :userId)
                AND status = 'completed'
                AND created_at >= ${dateFilter}
                GROUP BY partner_id
            )
            SELECT
                tp.*,
                u.username,
                u.first_name,
                u.last_name,
                u.avatar_url
            FROM transfer_partners tp
            JOIN users u ON tp.partner_id = u.id
            ORDER BY tp.transaction_count DESC
            LIMIT 5`,
            { replacements: { userId: req.user.id } }
        );

        res.json({
            success: true,
            analytics: {
                sent: {
                    count: parseInt(sent.count),
                    total: parseFloat(sent.total)
                },
                received: {
                    count: parseInt(received.count),
                    total: parseFloat(received.total)
                },
                topContacts,
                period
            }
        });
    } catch (error) {
        logger.error('Get P2P analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

export default router;