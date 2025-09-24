/**
 * P2P Transfer Service with State Machine
 * Handles peer-to-peer money transfers with complete transaction lifecycle
 * Consumer Wallet Phase 1 Day 2 Implementation
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import { Op } from 'sequelize';
import walletBalanceService from './wallet-balance-service.js';
import logger from './logger.js';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Transfer state machine states
const TransferStates = {
  PENDING: 'pending',
  VALIDATING: 'validating',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REVERSED: 'reversed',
  CANCELLED: 'cancelled'
};

// Valid state transitions
const StateTransitions = {
  [TransferStates.PENDING]: [TransferStates.VALIDATING, TransferStates.CANCELLED],
  [TransferStates.VALIDATING]: [TransferStates.PROCESSING, TransferStates.FAILED],
  [TransferStates.PROCESSING]: [TransferStates.COMPLETED, TransferStates.FAILED],
  [TransferStates.FAILED]: [TransferStates.PENDING], // Allow retry
  [TransferStates.COMPLETED]: [TransferStates.REVERSED],
  [TransferStates.REVERSED]: [],
  [TransferStates.CANCELLED]: []
};

class P2PTransferService {
  /**
   * Validate recipient and return recipient details
   */
  async validateRecipient(recipientIdentifier, recipientType = 'auto') {
    try {
      let whereClause = {};
      
      // Determine search criteria based on type
      if (recipientType === 'email') {
        whereClause.email = recipientIdentifier.toLowerCase();
      } else if (recipientType === 'phone') {
        whereClause.mobile = recipientIdentifier;
      } else if (recipientType === 'username') {
        whereClause.username = recipientIdentifier.toLowerCase();
      } else if (recipientType === 'id') {
        whereClause.id = recipientIdentifier;
      } else {
        // Auto-detect type
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[+]?[0-9]{10,15}$/;
        
        if (emailRegex.test(recipientIdentifier)) {
          whereClause.email = recipientIdentifier.toLowerCase();
        } else if (phoneRegex.test(recipientIdentifier)) {
          whereClause.mobile = recipientIdentifier;
        } else {
          whereClause.username = recipientIdentifier.toLowerCase();
        }
      }

      const recipient = await db.User.findOne({
        where: whereClause,
        attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'username', 'kyc_status', 'status']
      });

      if (!recipient) {
        return {
          isValid: false,
          isMonayUser: false,
          identifier: recipientIdentifier,
          error: 'Recipient not found'
        };
      }

      // Check if recipient account is active
      if (recipient.status !== 'active') {
        return {
          isValid: false,
          isMonayUser: true,
          recipientId: recipient.id,
          error: 'Recipient account is not active'
        };
      }

      // Get or create recipient wallet
      let recipientWallet = await db.Wallet.findOne({
        where: { 
          user_id: recipient.id,
          currency: 'USD',
          type: 'personal'
        }
      });

      if (!recipientWallet) {
        recipientWallet = await db.Wallet.create({
          id: uuidv4(),
          user_id: recipient.id,
          currency: 'USD',
          balance: 0,
          type: 'personal',
          name: 'Primary Wallet',
          status: 'active'
        });
      }

      return {
        isValid: true,
        isMonayUser: true,
        recipientId: recipient.id,
        recipientWalletId: recipientWallet.id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientIdentifier: recipient.email || recipient.mobile || recipient.username,
        kycStatus: recipient.kyc_status
      };
    } catch (error) {
      logger.error('Error validating recipient:', error);
      throw error;
    }
  }

  /**
   * Create a new P2P transfer with state machine
   */
  async createTransfer(senderId, recipientData, amount, options = {}) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const {
        note = '',
        category = 'personal',
        transferMethod = 'instant',
        scheduledDate = null,
        isRecurring = false,
        recurringFrequency = null
      } = options;

      // Get sender wallet
      const senderWallet = await db.Wallet.findOne({
        where: { 
          user_id: senderId,
          status: 'active',
          type: 'personal'
        },
        transaction
      });

      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      // Validate balance
      const balanceCheck = await walletBalanceService.getWalletBalance(
        senderWallet.id,
        senderId
      );

      if (balanceCheck.availableBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Validate transaction limits
      const limitValidation = await walletBalanceService.validateTransactionLimits(
        senderWallet.id,
        amount,
        'p2p'
      );

      if (!limitValidation.isValid) {
        throw new Error(limitValidation.errors.join(', '));
      }

      // Calculate fees (free for instant, small fee for scheduled)
      const feeAmount = scheduledDate ? 0.50 : 0;
      const totalAmount = parseFloat(amount) + feeAmount;

      // Create P2P transfer record
      const transferId = uuidv4();
      const p2pTransfer = await db.sequelize.query(
        `INSERT INTO p2p_transfers (
          id, sender_user_id, sender_wallet_id,
          recipient_user_id, recipient_wallet_id, recipient_identifier,
          amount, fee_amount, total_amount, currency,
          status, transfer_method, note, category,
          scheduled_date, is_recurring, recurring_frequency,
          initiated_at, created_at, updated_at
        ) VALUES (
          :id, :senderId, :senderWalletId,
          :recipientId, :recipientWalletId, :recipientIdentifier,
          :amount, :feeAmount, :totalAmount, 'USD',
          :status, :transferMethod, :note, :category,
          :scheduledDate, :isRecurring, :recurringFrequency,
          NOW(), NOW(), NOW()
        ) RETURNING *`,
        {
          replacements: {
            id: transferId,
            senderId,
            senderWalletId: senderWallet.id,
            recipientId: recipientData.recipientId || null,
            recipientWalletId: recipientData.recipientWalletId || null,
            recipientIdentifier: recipientData.recipientIdentifier,
            amount,
            feeAmount,
            totalAmount,
            status: TransferStates.PENDING,
            transferMethod,
            note,
            category,
            scheduledDate,
            isRecurring,
            recurringFrequency
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      // If scheduled for later, don't process now
      if (scheduledDate && new Date(scheduledDate) > new Date()) {
        await transaction.commit();
        return {
          transferId,
          status: TransferStates.PENDING,
          message: `Transfer scheduled for ${scheduledDate}`,
          scheduledDate
        };
      }

      // Move to validating state
      await this.updateTransferState(transferId, TransferStates.VALIDATING, transaction);

      // For non-Monay users, create pending transfer
      if (!recipientData.isMonayUser) {
        await this.createPendingTransfer(transferId, recipientData, transaction);
        await transaction.commit();
        return {
          transferId,
          status: 'pending_recipient',
          message: `Invitation sent to ${recipientData.recipientIdentifier}. Transfer will complete when they join Monay.`
        };
      }

      // Process the transfer immediately
      await this.processTransfer(transferId, transaction);
      
      await transaction.commit();

      return {
        transferId,
        status: TransferStates.COMPLETED,
        message: 'Transfer completed successfully',
        amount,
        fee: feeAmount,
        recipient: recipientData.recipientName
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating transfer:', error);
      throw error;
    }
  }

  /**
   * Process a transfer (move money between wallets)
   */
  async processTransfer(transferId, existingTransaction = null) {
    const transaction = existingTransaction || await db.sequelize.transaction();
    
    try {
      // Get transfer details
      const [transfer] = await db.sequelize.query(
        `SELECT * FROM p2p_transfers WHERE id = :transferId FOR UPDATE`,
        {
          replacements: { transferId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      if (transfer.status !== TransferStates.VALIDATING) {
        throw new Error(`Invalid transfer state: ${transfer.status}`);
      }

      // Update to processing state
      await this.updateTransferState(transferId, TransferStates.PROCESSING, transaction);

      // Debit sender's wallet
      await walletBalanceService.updateBalance(
        transfer.sender_wallet_id,
        transfer.total_amount,
        'debit',
        transaction
      );

      // Create sender transaction record
      const senderTxId = uuidv4();
      await db.Transaction.create({
        id: senderTxId,
        wallet_id: transfer.sender_wallet_id,
        user_id: transfer.sender_user_id,
        type: 'debit',
        amount: transfer.total_amount,
        currency: 'USD',
        status: 'completed',
        description: `P2P Transfer to ${transfer.recipient_identifier}`,
        reference_id: transferId,
        reference_type: 'p2p_transfer',
        metadata: {
          transferId,
          recipientId: transfer.recipient_user_id,
          note: transfer.note,
          fee: transfer.fee_amount
        }
      }, { transaction });

      // Credit recipient's wallet
      await walletBalanceService.updateBalance(
        transfer.recipient_wallet_id,
        transfer.amount, // Credit only the amount, not fees
        'credit',
        transaction
      );

      // Create recipient transaction record
      const recipientTxId = uuidv4();
      await db.Transaction.create({
        id: recipientTxId,
        wallet_id: transfer.recipient_wallet_id,
        user_id: transfer.recipient_user_id,
        type: 'credit',
        amount: transfer.amount,
        currency: 'USD',
        status: 'completed',
        description: `P2P Transfer from User`,
        reference_id: transferId,
        reference_type: 'p2p_transfer',
        metadata: {
          transferId,
          senderId: transfer.sender_user_id,
          note: transfer.note
        }
      }, { transaction });

      // Update transfer with transaction IDs
      await db.sequelize.query(
        `UPDATE p2p_transfers 
         SET status = :status,
             sender_transaction_id = :senderTxId,
             recipient_transaction_id = :recipientTxId,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = :transferId`,
        {
          replacements: {
            status: TransferStates.COMPLETED,
            senderTxId,
            recipientTxId,
            transferId
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction
        }
      );

      // Send notifications
      await this.sendTransferNotifications(transfer, transaction);

      // Clear cache
      await redis.del(`balance:${transfer.sender_wallet_id}`);
      await redis.del(`balance:${transfer.recipient_wallet_id}`);

      if (!existingTransaction) {
        await transaction.commit();
      }

      return {
        success: true,
        transferId,
        senderTransactionId: senderTxId,
        recipientTransactionId: recipientTxId
      };
    } catch (error) {
      if (!existingTransaction) {
        await transaction.rollback();
      }
      
      // Update transfer to failed state
      await this.updateTransferState(transferId, TransferStates.FAILED);
      
      logger.error('Error processing transfer:', error);
      throw error;
    }
  }

  /**
   * Update transfer state with validation
   */
  async updateTransferState(transferId, newState, transaction = null) {
    try {
      // Get current state
      const [transfer] = await db.sequelize.query(
        `SELECT status FROM p2p_transfers WHERE id = :transferId`,
        {
          replacements: { transferId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!transfer) {
        throw new Error('Transfer not found');
      }

      const currentState = transfer.status;
      
      // Validate state transition
      if (!StateTransitions[currentState]?.includes(newState)) {
        throw new Error(`Invalid state transition from ${currentState} to ${newState}`);
      }

      // Update state
      await db.sequelize.query(
        `UPDATE p2p_transfers 
         SET status = :newState,
             updated_at = NOW(),
             ${newState === TransferStates.FAILED ? 'failed_at = NOW(),' : ''}
             ${newState === TransferStates.COMPLETED ? 'completed_at = NOW(),' : ''}
             retry_count = CASE 
               WHEN :newState = 'failed' THEN retry_count + 1 
               ELSE retry_count 
             END
         WHERE id = :transferId`,
        {
          replacements: { transferId, newState },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction
        }
      );

      // Log state change
      logger.info(`Transfer ${transferId} state changed from ${currentState} to ${newState}`);

      return true;
    } catch (error) {
      logger.error('Error updating transfer state:', error);
      throw error;
    }
  }

  /**
   * Get transfer status and details
   */
  async getTransferStatus(transferId, userId) {
    try {
      const [transfer] = await db.sequelize.query(
        `SELECT 
          t.*,
          su.firstName as sender_first_name,
          su.lastName as sender_last_name,
          ru.firstName as recipient_first_name,
          ru.lastName as recipient_last_name
         FROM p2p_transfers t
         LEFT JOIN users su ON t.sender_user_id = su.id
         LEFT JOIN users ru ON t.recipient_user_id = ru.id
         WHERE t.id = :transferId 
         AND (t.sender_user_id = :userId OR t.recipient_user_id = :userId)`,
        {
          replacements: { transferId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!transfer) {
        return null;
      }

      // Format response
      const isSender = transfer.sender_user_id === userId;
      
      return {
        transferId: transfer.id,
        role: isSender ? 'sender' : 'recipient',
        status: transfer.status,
        amount: transfer.amount,
        fee: transfer.fee_amount,
        totalAmount: transfer.total_amount,
        currency: transfer.currency,
        sender: {
          id: transfer.sender_user_id,
          name: `${transfer.sender_first_name} ${transfer.sender_last_name}`
        },
        recipient: {
          id: transfer.recipient_user_id,
          name: transfer.recipient_first_name ? 
            `${transfer.recipient_first_name} ${transfer.recipient_last_name}` : 
            transfer.recipient_identifier
        },
        note: transfer.note,
        category: transfer.category,
        transferMethod: transfer.transfer_method,
        initiatedAt: transfer.initiated_at,
        completedAt: transfer.completed_at,
        failedAt: transfer.failed_at,
        failureReason: transfer.failure_reason,
        retryCount: transfer.retry_count
      };
    } catch (error) {
      logger.error('Error getting transfer status:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending transfer
   */
  async cancelTransfer(transferId, userId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const [transfer] = await db.sequelize.query(
        `SELECT * FROM p2p_transfers 
         WHERE id = :transferId 
         AND sender_user_id = :userId
         AND status = :status
         FOR UPDATE`,
        {
          replacements: { 
            transferId, 
            userId,
            status: TransferStates.PENDING 
          },
          type: db.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!transfer) {
        throw new Error('Transfer not found or cannot be cancelled');
      }

      // Update to cancelled state
      await this.updateTransferState(transferId, TransferStates.CANCELLED, transaction);

      await transaction.commit();

      return {
        success: true,
        message: 'Transfer cancelled successfully'
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error cancelling transfer:', error);
      throw error;
    }
  }

  /**
   * Retry a failed transfer
   */
  async retryTransfer(transferId, userId) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const [transfer] = await db.sequelize.query(
        `SELECT * FROM p2p_transfers 
         WHERE id = :transferId 
         AND sender_user_id = :userId
         AND status = :status
         AND retry_count < max_retries`,
        {
          replacements: { 
            transferId, 
            userId,
            status: TransferStates.FAILED
          },
          type: db.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!transfer) {
        throw new Error('Transfer not found or cannot be retried');
      }

      // Reset to pending state
      await this.updateTransferState(transferId, TransferStates.PENDING, transaction);
      
      // Move to validating
      await this.updateTransferState(transferId, TransferStates.VALIDATING, transaction);
      
      // Process again
      await this.processTransfer(transferId, transaction);

      await transaction.commit();

      return {
        success: true,
        message: 'Transfer retried successfully'
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error retrying transfer:', error);
      throw error;
    }
  }

  /**
   * Get transfer history for a user
   */
  async getTransferHistory(userId, filters = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        status = null,
        startDate = null,
        endDate = null,
        type = 'all' // 'sent', 'received', 'all'
      } = filters;

      let whereClause = '';
      const replacements = { userId, limit, offset };

      // Build where clause
      if (type === 'sent') {
        whereClause += ' AND t.sender_user_id = :userId';
      } else if (type === 'received') {
        whereClause += ' AND t.recipient_user_id = :userId';
      } else {
        whereClause += ' AND (t.sender_user_id = :userId OR t.recipient_user_id = :userId)';
      }

      if (status) {
        whereClause += ' AND t.status = :status';
        replacements.status = status;
      }

      if (startDate) {
        whereClause += ' AND t.created_at >= :startDate';
        replacements.startDate = startDate;
      }

      if (endDate) {
        whereClause += ' AND t.created_at <= :endDate';
        replacements.endDate = endDate;
      }

      const transfers = await db.sequelize.query(
        `SELECT 
          t.*,
          su.firstName as sender_first_name,
          su.lastName as sender_last_name,
          ru.firstName as recipient_first_name,
          ru.lastName as recipient_last_name
         FROM p2p_transfers t
         LEFT JOIN users su ON t.sender_user_id = su.id
         LEFT JOIN users ru ON t.recipient_user_id = ru.id
         WHERE 1=1 ${whereClause}
         ORDER BY t.created_at DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements,
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // Format transfers
      const formattedTransfers = transfers.map(t => ({
        transferId: t.id,
        type: t.sender_user_id === userId ? 'sent' : 'received',
        amount: t.amount,
        fee: t.fee_amount,
        status: t.status,
        counterparty: t.sender_user_id === userId ? 
          `${t.recipient_first_name || 'Unknown'} ${t.recipient_last_name || ''}`.trim() :
          `${t.sender_first_name} ${t.sender_last_name}`,
        note: t.note,
        category: t.category,
        createdAt: t.created_at,
        completedAt: t.completed_at
      }));

      return formattedTransfers;
    } catch (error) {
      logger.error('Error getting transfer history:', error);
      throw error;
    }
  }

  /**
   * Send transfer notifications
   */
  async sendTransferNotifications(transfer, transaction) {
    try {
      // Create notification for sender
      await db.Notification.create({
        id: uuidv4(),
        user_id: transfer.sender_user_id,
        type: 'transfer_sent',
        title: 'Transfer Sent',
        message: `Your transfer of $${transfer.amount} has been sent successfully`,
        data: {
          transferId: transfer.id,
          amount: transfer.amount,
          recipientId: transfer.recipient_user_id
        },
        is_read: false
      }, { transaction });

      // Create notification for recipient
      if (transfer.recipient_user_id) {
        await db.Notification.create({
          id: uuidv4(),
          user_id: transfer.recipient_user_id,
          type: 'transfer_received',
          title: 'Money Received',
          message: `You received $${transfer.amount} from a transfer`,
          data: {
            transferId: transfer.id,
            amount: transfer.amount,
            senderId: transfer.sender_user_id
          },
          is_read: false
        }, { transaction });
      }

      // TODO: Send push notifications, SMS, email based on user preferences
      
      return true;
    } catch (error) {
      logger.error('Error sending notifications:', error);
      // Don't throw - notifications are non-critical
      return false;
    }
  }

  /**
   * Create pending transfer for non-Monay users
   */
  async createPendingTransfer(transferId, recipientData, transaction) {
    try {
      // TODO: Send invitation via email/SMS
      // TODO: Create claim link
      // TODO: Set expiration date
      
      await db.sequelize.query(
        `UPDATE p2p_transfers 
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}')::jsonb,
           '{inviteSent}',
           'true'::jsonb
         ),
         updated_at = NOW()
         WHERE id = :transferId`,
        {
          replacements: { transferId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction
        }
      );

      return true;
    } catch (error) {
      logger.error('Error creating pending transfer:', error);
      throw error;
    }
  }
}

export default new P2PTransferService();