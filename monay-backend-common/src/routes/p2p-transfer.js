import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware-app/auth-middleware.js';
import db from '../models/index.js';
import pkg from 'sequelize';
const { Op } = pkg;
import utility from '../services/utility.js';
import p2pTransferService from '../services/p2p-transfer-service.js';
import { body, param, query, validationResult } from 'express-validator';
import { errorLogger } from '../services/logger.js';

const router = express.Router();

/**
 * @route POST /api/p2p-transfer/search
 * @desc Search for users by phone, email, or username
 * @access Private
 */
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { query, type } = req.body;
    const userId = req.user.id;

    let whereClause = {};

    // If no query provided, return all consumer users (excluding current user)
    if (!query || query.trim() === '') {
      whereClause = {
        id: { [Op.ne]: userId }
      };
    } else {
      // Search based on type
      if (type === 'phone') {
        whereClause.mobile = query;
      } else if (type === 'email') {
        whereClause.email = query.toLowerCase();
      } else if (type === 'username') {
        whereClause.username = query.toLowerCase();
      } else {
        // Search in all fields
        whereClause = {
          [Op.or]: [
            { mobile: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query.toLowerCase()}%` } },
            { username: { [Op.like]: `%${query.toLowerCase()}%` } },
            { firstName: { [Op.like]: `%${query}%` } },
            { lastName: { [Op.like]: `%${query}%` } }
          ]
        };
      }

      // Exclude current user from results
      whereClause.id = { [Op.ne]: userId };
    }

    const users = await db.User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'username', 'profileImage'],
      limit: query && query.trim() !== '' ? 10 : 50, // Show more users when returning all
      order: [['firstName', 'ASC'], ['lastName', 'ASC']] // Alphabetical order
    });

    const results = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.mobile || 'Unknown User',
      identifier: user.email || user.mobile || user.username,
      type: user.email ? 'email' : user.mobile ? 'phone' : 'username',
      avatar: user.profileImage,
      isMonayUser: true
    }));

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to search users'
      }
    });
  }
});

/**
 * @route GET /api/p2p-transfer/recent-contacts
 * @desc Get recent transfer contacts
 * @access Private
 */
router.get('/recent-contacts', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent unique recipients
    const recentTransactions = await db.Transaction.findAll({
      where: {
        senderId: userId,
        type: { [Op.in]: ['transfer', 'payment'] }
      },
      attributes: ['receiverId', 'createdAt'],
      include: [
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'username', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    // Remove duplicates and get top 10
    const uniqueContacts = [];
    const seenIds = new Set();

    for (const tx of recentTransactions) {
      if (!seenIds.has(tx.receiverId) && tx.receiver) {
        seenIds.add(tx.receiverId);
        uniqueContacts.push({
          id: tx.receiver.id,
          name: `${tx.receiver.firstName} ${tx.receiver.lastName}`,
          identifier: tx.receiver.email || tx.receiver.mobile || tx.receiver.username,
          type: tx.receiver.email ? 'email' : tx.receiver.mobile ? 'phone' : 'username',
          avatar: tx.receiver.profileImage,
          isMonayUser: true,
          lastTransaction: tx.createdAt
        });

        if (uniqueContacts.length >= 10) break;
      }
    }

    res.json({
      success: true,
      data: uniqueContacts
    });
  } catch (error) {
    console.error('Error fetching recent contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch recent contacts'
      }
    });
  }
});

/**
 * @route POST /api/p2p-transfer/validate
 * @desc Validate a recipient before sending
 * @access Private
 */
router.post('/validate',
  authenticateToken,
  [
    body('recipientIdentifier').notEmpty().withMessage('Recipient identifier is required'),
    body('recipientType').optional().isIn(['email', 'phone', 'username', 'id', 'auto'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { recipientIdentifier, recipientType = 'auto' } = req.body;

      const validation = await p2pTransferService.validateRecipient(
        recipientIdentifier,
        recipientType
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      errorLogger.error('Error validating recipient:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Failed to validate recipient'
        }
      });
    }
  }
);

/**
 * @route POST /api/p2p-transfer/send
 * @desc Send money via P2P transfer
 * @access Private
 */
router.post('/send',
  authenticateToken,
  [
    body('recipientIdentifier').notEmpty().withMessage('Recipient is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('note').optional().isString().isLength({ max: 500 }),
    body('category').optional().isIn(['personal', 'business', 'rent', 'bills', 'other']),
    body('transferMethod').optional().isIn(['instant', 'standard', 'scheduled']),
    body('scheduledDate').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const senderId = req.user.id;
      const {
        recipientIdentifier,
        amount,
        note,
        category,
        transferMethod,
        scheduledDate
      } = req.body;

      // First validate the recipient
      const recipientData = await p2pTransferService.validateRecipient(recipientIdentifier);

      if (!recipientData.isValid && recipientData.isMonayUser) {
        return res.status(400).json({ success: false, error: 'Invalid recipient' });
      }

      // Create the transfer
      const result = await p2pTransferService.createTransfer(
        senderId,
        recipientData,
        parseFloat(amount),
        {
          note,
          category,
          transferMethod,
          scheduledDate
        }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      errorLogger.error('Error creating transfer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TRANSFER_ERROR',
          message: error.message || 'Failed to create transfer'
        }
      });
    }
  }
);

/**
 * @route GET /api/p2p-transfer/status/:transferId
 * @desc Get transfer status
 * @access Private
 */
router.get('/status/:transferId',
  authenticateToken,
  param('transferId').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { transferId } = req.params;
      const userId = req.user.id;

      const status = await p2pTransferService.getTransferStatus(transferId, userId);

      if (!status) {
        return res.status(404).json({ success: false, error: 'Transfer not found' });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      errorLogger.error('Error getting transfer status:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: error.message || 'Failed to get transfer status'
        }
      });
    }
  }
);

/**
 * @route POST /api/p2p-transfer/cancel/:transferId
 * @desc Cancel a pending transfer
 * @access Private
 */
router.post('/cancel/:transferId',
  authenticateToken,
  param('transferId').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { transferId } = req.params;
      const userId = req.user.id;

      const result = await p2pTransferService.cancelTransfer(transferId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      errorLogger.error('Error cancelling transfer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CANCEL_ERROR',
          message: error.message || 'Failed to cancel transfer'
        }
      });
    }
  }
);

/**
 * @route POST /api/p2p-transfer/retry/:transferId
 * @desc Retry a failed transfer
 * @access Private
 */
router.post('/retry/:transferId',
  authenticateToken,
  param('transferId').isUUID(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { transferId } = req.params;
      const userId = req.user.id;

      const result = await p2pTransferService.retryTransfer(transferId, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      errorLogger.error('Error retrying transfer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RETRY_ERROR',
          message: error.message || 'Failed to retry transfer'
        }
      });
    }
  }
);

/**
 * @route GET /api/p2p-transfer/history
 * @desc Get transfer history
 * @access Private
 */
router.get('/history',
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']),
    query('type').optional().isIn(['sent', 'received', 'all']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const filters = {
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0,
        status: req.query.status,
        type: req.query.type || 'all',
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const history = await p2pTransferService.getTransferHistory(userId, filters);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      errorLogger.error('Error getting transfer history:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: error.message || 'Failed to get transfer history'
        }
      });
    }
  }
);

/**
 * @route POST /api/p2p-transfer/initiate
 * @desc Initiate a P2P transfer (legacy endpoint - maps to /send)
 * @access Private
 */
router.post('/initiate',
  authenticateToken,
  [
    body('recipientId').optional().isString(),
    body('recipientIdentifier').notEmpty().withMessage('Recipient identifier is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('note').optional().isString().isLength({ max: 500 }),
    body('currency').optional().isString(),
    body('transferMethod').optional().isString(),
    body('schedule').optional().isString(),
    body('scheduleDate').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const senderId = req.user.id;
      const {
        recipientId,
        recipientIdentifier,
        amount,
        note,
        currency = 'USD',
        transferMethod = 'instant',
        schedule,
        scheduleDate
      } = req.body;

      // Use recipientIdentifier or recipientId
      const targetRecipient = recipientIdentifier || recipientId;

      if (!targetRecipient) {
        return res.status(400).json({
          success: false,
          error: 'Recipient identifier is required'
        });
      }

      // First validate the recipient
      const recipientData = await p2pTransferService.validateRecipient(targetRecipient);

      if (!recipientData.isValid && recipientData.isMonayUser) {
        return res.status(400).json({ success: false, error: 'Invalid recipient' });
      }

      // Create the transfer
      const result = await p2pTransferService.createTransfer(
        senderId,
        recipientData,
        parseFloat(amount),
        {
          note,
          category: 'personal',
          transferMethod,
          scheduledDate: scheduleDate
        }
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      errorLogger.error('Error creating transfer:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TRANSFER_ERROR',
          message: error.message || 'Failed to create transfer'
        }
      });
    }
  }
);


/**
 * @route GET /api/p2p-transfer/frequent
 * @desc Get frequently used contacts
 * @access Private
 */
router.get('/frequent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get frequently used contacts from user_contacts table
    const frequentContacts = await sequelize.query(
      `SELECT
        contact_user_id,
        contact_name,
        contact_email,
        contact_phone,
        transaction_count,
        last_transaction_date
       FROM user_contacts
       WHERE user_id = :userId
       AND is_blocked = false
       AND transaction_count > 0
       ORDER BY transaction_count DESC, last_transaction_date DESC
       LIMIT 10`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    const results = frequentContacts.map(contact => ({
      id: contact.contact_user_id,
      name: contact.contact_name,
      email: contact.contact_email,
      phone: contact.contact_phone,
      transactionCount: contact.transaction_count,
      lastTransaction: contact.last_transaction_date
    }));

    res.status(200).json({
      success: true,
      data: {
        contacts: results,
        total: results.length
      }
    });
  } catch (error) {
    console.error('Error fetching frequent contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch frequent contacts'
      }
    });
  }
});

/**
 * @route GET /api/p2p-transfer/limits
 * @desc Get user's transfer limits and usage
 * @access Private
 */
router.get('/limits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get today's transfers
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTransfers = await Transaction.sum('amount', {
      where: {
        senderId: userId,
        type: 'transfer',
        createdAt: { [Op.gte]: today }
      }
    });

    // Get this month's transfers
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransfers = await Transaction.sum('amount', {
      where: {
        senderId: userId,
        type: 'transfer',
        createdAt: { [Op.gte]: thisMonth }
      }
    });

    // Default limits (these could be fetched from user settings)
    const limits = {
      daily: 10000,
      weekly: 25000,
      monthly: 50000,
      perTransaction: 5000
    };

    res.json({
      success: true,
      data: {
        limits,
        usage: {
          daily: dailyTransfers || 0,
          monthly: monthlyTransfers || 0,
          dailyRemaining: Math.max(0, limits.daily - (dailyTransfers || 0)),
          monthlyRemaining: Math.max(0, limits.monthly - (monthlyTransfers || 0))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transfer limits:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch transfer limits'
      }
    });
  }
});

/**
 * @route POST /api/p2p-transfer/request
 * @desc Request money from another user
 * @access Private
 */
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const {
      payerId,
      payerIdentifier,
      amount,
      currency = 'USD',
      note,
      dueDate
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Find payer
    let payer = null;
    if (payerId) {
      payer = await db.User.findByPk(payerId);
    } else if (payerIdentifier) {
      payer = await db.User.findOne({
        where: {
          [Op.or]: [
            { email: payerIdentifier.toLowerCase() },
            { mobile: payerIdentifier },
            { username: payerIdentifier.toLowerCase() }
          ]
        }
      });
    }

    if (!payer) {
      return res.status(404).json({ success: false, error: 'Payer not found' });
    }

    // Create payment request
    const paymentRequest = await PaymentRequest.create({
      id: uuidv4(),
      requesterId,
      payerId: payer.id,
      amount,
      currency,
      note,
      dueDate,
      status: 'pending'
    });

    // Create notification for payer
    await db.Notification.create({
      id: uuidv4(),
      userId: payer.id,
      type: 'payment_request',
      title: 'Payment Request',
      message: `${req.user.firstName} ${req.user.lastName} requested ${utility.formatCurrency(amount)}`,
      data: { paymentRequestId: paymentRequest.id }
    });

    res.json({
      success: true,
      data: {
        requestId: paymentRequest.id,
        amount,
        payer: {
          id: payer.id,
          name: `${payer.firstName} ${payer.lastName}`,
          identifier: payer.email || payer.mobile || payer.username
        },
        status: 'pending',
        message: 'Payment request sent successfully'
      }
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create payment request'
      }
    });
  }
});

export default router;
