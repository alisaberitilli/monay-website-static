import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middlewares/auth-middleware';
import { User, Transaction, Wallet, Notification, sequelize } from '../models';
import { Op } from 'sequelize';
import utility from '../services/utility';

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

    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Search query is required'
        }
      });
    }

    let whereClause = {};

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

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'username', 'profileImage'],
      limit: 10
    });

    const results = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
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
    const recentTransactions = await Transaction.findAll({
      where: {
        senderId: userId,
        type: { [Op.in]: ['transfer', 'payment'] }
      },
      attributes: ['receiverId', 'createdAt'],
      include: [
        {
          model: User,
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
 * @route POST /api/p2p-transfer/initiate
 * @desc Initiate a P2P transfer
 * @access Private
 */
router.post('/initiate', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const senderId = req.user.id;
    const {
      recipientId,
      recipientIdentifier,
      amount,
      currency = 'USD',
      note,
      transferMethod = 'monay',
      schedule = 'now',
      scheduleDate
    } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Invalid transfer amount'
        }
      });
    }

    // Get sender's wallet
    const senderWallet = await Wallet.findOne({
      where: { userId: senderId, currency },
      transaction: t
    });

    if (!senderWallet || senderWallet.balance < amount) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance'
        }
      });
    }

    let receiver = null;
    let receiverWallet = null;

    // Find or invite recipient
    if (recipientId) {
      receiver = await User.findByPk(recipientId, { transaction: t });
    } else if (recipientIdentifier) {
      // Search by identifier
      receiver = await User.findOne({
        where: {
          [Op.or]: [
            { email: recipientIdentifier.toLowerCase() },
            { mobile: recipientIdentifier },
            { username: recipientIdentifier.toLowerCase() }
          ]
        },
        transaction: t
      });

      if (!receiver && (transferMethod === 'phone' || transferMethod === 'email')) {
        // Create pending transfer for non-Monay user
        const pendingTransfer = await Transaction.create({
          id: uuidv4(),
          type: 'transfer',
          senderId,
          receiverIdentifier: recipientIdentifier,
          amount,
          currency,
          status: 'pending_recipient',
          description: note || 'P2P Transfer',
          metadata: {
            transferMethod,
            inviteSent: true,
            inviteSentAt: new Date()
          }
        }, { transaction: t });

        // Send invitation (SMS or Email)
        // await utility.sendTransferInvite(recipientIdentifier, transferMethod, amount, senderId);

        await t.commit();
        return res.json({
          success: true,
          data: {
            transactionId: pendingTransfer.id,
            status: 'pending_recipient',
            message: `Invitation sent to ${recipientIdentifier}. Transfer will complete when they join Monay.`
          }
        });
      }
    }

    if (!receiver) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'RECIPIENT_NOT_FOUND',
          message: 'Recipient not found'
        }
      });
    }

    // Get or create receiver's wallet
    receiverWallet = await Wallet.findOne({
      where: { userId: receiver.id, currency },
      transaction: t
    });

    if (!receiverWallet) {
      receiverWallet = await Wallet.create({
        id: uuidv4(),
        userId: receiver.id,
        currency,
        balance: 0
      }, { transaction: t });
    }

    // Calculate fees
    const transferFee = transferMethod === 'bank' ? 2.50 : 0;
    const totalAmount = parseFloat(amount) + transferFee;

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTransfers = await Transaction.sum('amount', {
      where: {
        senderId,
        type: 'transfer',
        createdAt: { [Op.gte]: today }
      },
      transaction: t
    });

    const dailyLimit = 10000; // Default daily limit
    if ((dailyTransfers || 0) + totalAmount > dailyLimit) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'DAILY_LIMIT_EXCEEDED',
          message: `Daily transfer limit of ${utility.formatCurrency(dailyLimit)} exceeded`
        }
      });
    }

    // Process transfer
    const transferStatus = schedule === 'later' ? 'scheduled' : 'completed';

    // Deduct from sender
    senderWallet.balance -= totalAmount;
    await senderWallet.save({ transaction: t });

    // Add to receiver (if not scheduled)
    if (schedule === 'now') {
      receiverWallet.balance += parseFloat(amount);
      await receiverWallet.save({ transaction: t });
    }

    // Create transaction record
    const transaction = await Transaction.create({
      id: uuidv4(),
      type: 'transfer',
      senderId,
      receiverId: receiver.id,
      amount: parseFloat(amount),
      currency,
      fee: transferFee,
      status: transferStatus,
      description: note || 'P2P Transfer',
      metadata: {
        transferMethod,
        scheduleDate: schedule === 'later' ? scheduleDate : null
      }
    }, { transaction: t });

    // Create notifications
    if (schedule === 'now') {
      // Sender notification
      await Notification.create({
        id: uuidv4(),
        userId: senderId,
        type: 'transfer_sent',
        title: 'Transfer Sent',
        message: `You sent ${utility.formatCurrency(amount)} to ${receiver.firstName} ${receiver.lastName}`,
        data: { transactionId: transaction.id }
      }, { transaction: t });

      // Receiver notification
      await Notification.create({
        id: uuidv4(),
        userId: receiver.id,
        type: 'transfer_received',
        title: 'Money Received',
        message: `You received ${utility.formatCurrency(amount)} from ${req.user.firstName} ${req.user.lastName}`,
        data: { transactionId: transaction.id }
      }, { transaction: t });
    }

    await t.commit();

    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        amount: parseFloat(amount),
        fee: transferFee,
        totalAmount,
        status: transferStatus,
        receiver: {
          id: receiver.id,
          name: `${receiver.firstName} ${receiver.lastName}`,
          identifier: receiver.email || receiver.mobile || receiver.username
        },
        message: schedule === 'later' 
          ? `Transfer scheduled for ${scheduleDate}`
          : 'Transfer completed successfully'
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error processing transfer:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to process transfer'
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
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Invalid request amount'
        }
      });
    }

    // Find payer
    let payer = null;
    if (payerId) {
      payer = await User.findByPk(payerId);
    } else if (payerIdentifier) {
      payer = await User.findOne({
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
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYER_NOT_FOUND',
          message: 'Payer not found'
        }
      });
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
    await Notification.create({
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