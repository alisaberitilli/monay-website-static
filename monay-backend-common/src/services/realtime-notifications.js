/**
 * Real-time Notifications Service
 * Handles transaction notifications and balance updates via WebSocket
 * Consumer Wallet Phase 1 Day 4 Implementation
 */

import websocketService from './websocket-service.js';
import logger from './enhanced-logger.js';
import redis from './redis.js';
import db from '../models/index.js';

class RealtimeNotificationsService {
  /**
   * Send balance update notification
   */
  async notifyBalanceUpdate(userId, walletId, balanceData) {
    try {
      // Prepare balance update data
      const updateData = {
        walletId,
        available_balance: balanceData.available_balance || balanceData.availableBalance,
        pending_balance: balanceData.pending_balance || balanceData.pendingBalance || 0,
        total_balance: balanceData.total_balance || balanceData.totalBalance,
        currency: balanceData.currency || 'USD',
        timestamp: new Date().toISOString()
      };

      // Update cache
      const cacheKey = `balance:${userId}`;
      await redis.setex(cacheKey, 30, JSON.stringify(updateData));

      // Emit via WebSocket
      websocketService.emitBalanceUpdate(userId, updateData);

      logger.debug('Balance update notification sent', {
        userId,
        walletId,
        balance: updateData.available_balance
      });
    } catch (error) {
      logger.error('Error sending balance update', {
        userId,
        walletId,
        error: error.message
      });
    }
  }

  /**
   * Send transaction notification
   */
  async notifyTransaction(transaction, type = 'new') {
    try {
      const { sender_id, recipient_id, amount, status, id } = transaction;

      // Notify sender
      if (sender_id) {
        const senderNotification = {
          id,
          type: 'p2p_send',
          amount,
          status,
          direction: 'outgoing',
          timestamp: new Date().toISOString()
        };

        websocketService.emitTransactionNotification(sender_id, senderNotification);

        // Update sender balance
        await this.refreshUserBalance(sender_id);
      }

      // Notify recipient
      if (recipient_id) {
        const recipientNotification = {
          id,
          type: 'p2p_receive',
          amount,
          status,
          direction: 'incoming',
          timestamp: new Date().toISOString()
        };

        websocketService.emitTransactionNotification(recipient_id, recipientNotification);

        // Update recipient balance
        await this.refreshUserBalance(recipient_id);
      }

      // Store notification in database
      await this.storeNotification(transaction);

      logger.info('Transaction notification sent', {
        transactionId: id,
        senderId: sender_id,
        recipientId: recipient_id,
        type
      });
    } catch (error) {
      logger.error('Error sending transaction notification', {
        transactionId: transaction.id,
        error: error.message
      });
    }
  }

  /**
   * Send transfer status update
   */
  async notifyTransferStatusUpdate(transferId, status, details = {}) {
    try {
      // Get transfer details
      const transfer = await db.sequelize.query(
        `SELECT * FROM p2p_transfers WHERE id = :transferId`,
        {
          replacements: { transferId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!transfer || transfer.length === 0) {
        throw new Error('Transfer not found');
      }

      const transferData = transfer[0];

      // Emit status update to tracking room
      websocketService.emitTransferStatusUpdate(transferId, status, {
        amount: transferData.amount,
        senderId: transferData.sender_id,
        recipientId: transferData.recipient_id,
        ...details
      });

      // Notify both parties
      const notification = {
        transferId,
        status,
        amount: transferData.amount,
        timestamp: new Date().toISOString()
      };

      if (transferData.sender_id) {
        websocketService.sendToUser(transferData.sender_id, 'transfer:update', notification);
      }

      if (transferData.recipient_id) {
        websocketService.sendToUser(transferData.recipient_id, 'transfer:update', notification);
      }

      logger.debug('Transfer status update sent', {
        transferId,
        status
      });
    } catch (error) {
      logger.error('Error sending transfer status update', {
        transferId,
        status,
        error: error.message
      });
    }
  }

  /**
   * Send payment notification
   */
  async notifyPayment(userId, paymentData) {
    try {
      const notification = {
        id: paymentData.id,
        type: paymentData.type || 'payment',
        amount: paymentData.amount,
        merchant: paymentData.merchant,
        status: paymentData.status,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'payment:notification', notification);

      // Update notification count
      await this.incrementNotificationCount(userId);

      // Refresh balance
      await this.refreshUserBalance(userId);

      logger.info('Payment notification sent', {
        userId,
        paymentId: paymentData.id,
        amount: paymentData.amount
      });
    } catch (error) {
      logger.error('Error sending payment notification', {
        userId,
        paymentId: paymentData.id,
        error: error.message
      });
    }
  }

  /**
   * Send deposit notification
   */
  async notifyDeposit(userId, depositData) {
    try {
      const notification = {
        id: depositData.id,
        type: 'deposit',
        amount: depositData.amount,
        method: depositData.method,
        status: depositData.status,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'deposit:notification', notification);

      // Update notification count
      await this.incrementNotificationCount(userId);

      // Refresh balance if completed
      if (depositData.status === 'completed') {
        await this.refreshUserBalance(userId);
      }

      logger.info('Deposit notification sent', {
        userId,
        depositId: depositData.id,
        amount: depositData.amount
      });
    } catch (error) {
      logger.error('Error sending deposit notification', {
        userId,
        depositId: depositData.id,
        error: error.message
      });
    }
  }

  /**
   * Send withdrawal notification
   */
  async notifyWithdrawal(userId, withdrawalData) {
    try {
      const notification = {
        id: withdrawalData.id,
        type: 'withdrawal',
        amount: withdrawalData.amount,
        method: withdrawalData.method,
        status: withdrawalData.status,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'withdrawal:notification', notification);

      // Update notification count
      await this.incrementNotificationCount(userId);

      // Refresh balance
      await this.refreshUserBalance(userId);

      logger.info('Withdrawal notification sent', {
        userId,
        withdrawalId: withdrawalData.id,
        amount: withdrawalData.amount
      });
    } catch (error) {
      logger.error('Error sending withdrawal notification', {
        userId,
        withdrawalId: withdrawalData.id,
        error: error.message
      });
    }
  }

  /**
   * Send security alert
   */
  async notifySecurityAlert(userId, alertData) {
    try {
      const alert = {
        id: `alert_${Date.now()}`,
        type: 'security_alert',
        severity: alertData.severity || 'medium',
        message: alertData.message,
        action: alertData.action,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket with priority
      websocketService.sendToUser(userId, 'security:alert', alert);

      // Store in database
      await this.storeSecurityAlert(userId, alert);

      // Log security event
      logger.logSecurity('SECURITY_ALERT', {
        userId,
        alert: alertData
      });

      logger.warn('Security alert sent', {
        userId,
        severity: alert.severity,
        message: alert.message
      });
    } catch (error) {
      logger.error('Error sending security alert', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send limit exceeded notification
   */
  async notifyLimitExceeded(userId, limitData) {
    try {
      const notification = {
        id: `limit_${Date.now()}`,
        type: 'limit_exceeded',
        limitType: limitData.limitType,
        currentUsage: limitData.currentUsage,
        limit: limitData.limit,
        message: `You've reached your ${limitData.limitType} limit`,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'limit:exceeded', notification);

      logger.info('Limit exceeded notification sent', {
        userId,
        limitType: limitData.limitType
      });
    } catch (error) {
      logger.error('Error sending limit notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send KYC status update
   */
  async notifyKYCStatusUpdate(userId, kycData) {
    try {
      const notification = {
        id: `kyc_${Date.now()}`,
        type: 'kyc_update',
        status: kycData.status,
        message: this.getKYCStatusMessage(kycData.status),
        nextSteps: kycData.nextSteps,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'kyc:update', notification);

      // Store notification
      await this.storeNotification({
        user_id: userId,
        type: 'kyc_update',
        data: notification
      });

      logger.info('KYC status update sent', {
        userId,
        status: kycData.status
      });
    } catch (error) {
      logger.error('Error sending KYC update', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send card activity notification
   */
  async notifyCardActivity(userId, cardData) {
    try {
      const notification = {
        id: cardData.transactionId,
        type: 'card_activity',
        cardLast4: cardData.cardLast4,
        amount: cardData.amount,
        merchant: cardData.merchant,
        status: cardData.status,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'card:activity', notification);

      // Update balance if approved
      if (cardData.status === 'approved') {
        await this.refreshUserBalance(userId);
      }

      logger.info('Card activity notification sent', {
        userId,
        transactionId: cardData.transactionId
      });
    } catch (error) {
      logger.error('Error sending card activity', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Refresh user balance
   */
  async refreshUserBalance(userId) {
    try {
      // Get user's primary wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' }
      });

      if (!wallet) {
        return;
      }

      // Get updated balance
      const balance = await db.Wallet.findByPk(wallet.id);

      const balanceData = {
        walletId: wallet.id,
        available_balance: parseFloat(balance.balance),
        currency: balance.currency || 'USD'
      };

      // Send balance update
      await this.notifyBalanceUpdate(userId, wallet.id, balanceData);
    } catch (error) {
      logger.error('Error refreshing user balance', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Store notification in database
   */
  async storeNotification(transaction) {
    try {
      const notification = {
        user_id: transaction.sender_id || transaction.user_id,
        type: transaction.type || 'transaction',
        title: this.getNotificationTitle(transaction),
        message: this.getNotificationMessage(transaction),
        data: JSON.stringify(transaction),
        status: 'unread',
        created_at: new Date()
      };

      await db.Notification.create(notification);

      // Also store for recipient if P2P
      if (transaction.recipient_id && transaction.type === 'p2p') {
        await db.Notification.create({
          ...notification,
          user_id: transaction.recipient_id,
          title: `Payment received from ${transaction.sender_name || 'a user'}`,
          message: `You received $${transaction.amount}`
        });
      }
    } catch (error) {
      logger.error('Error storing notification', {
        error: error.message
      });
    }
  }

  /**
   * Store security alert
   */
  async storeSecurityAlert(userId, alert) {
    try {
      await db.Notification.create({
        user_id: userId,
        type: 'security_alert',
        title: 'Security Alert',
        message: alert.message,
        data: JSON.stringify(alert),
        status: 'unread',
        priority: alert.severity === 'high' ? 'high' : 'normal',
        created_at: new Date()
      });
    } catch (error) {
      logger.error('Error storing security alert', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Increment unread notification count
   */
  async incrementNotificationCount(userId) {
    try {
      const countKey = `notifications:unread:${userId}`;
      const current = await redis.get(countKey);
      const newCount = (parseInt(current || '0') + 1).toString();
      await redis.set(countKey, newCount);

      // Emit count update
      websocketService.sendToUser(userId, 'notifications:count', { count: parseInt(newCount) });
    } catch (error) {
      logger.error('Error incrementing notification count', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Get notification title
   */
  getNotificationTitle(transaction) {
    const typeMap = {
      p2p_send: 'Payment Sent',
      p2p_receive: 'Payment Received',
      deposit: 'Deposit Received',
      withdrawal: 'Withdrawal Processed',
      payment: 'Payment Completed',
      card_activity: 'Card Transaction'
    };
    return typeMap[transaction.type] || 'Transaction Update';
  }

  /**
   * Get notification message
   */
  getNotificationMessage(transaction) {
    const { type, amount, status } = transaction;

    switch (type) {
      case 'p2p_send':
        return `You sent $${amount}`;
      case 'p2p_receive':
        return `You received $${amount}`;
      case 'deposit':
        return `Deposit of $${amount} ${status}`;
      case 'withdrawal':
        return `Withdrawal of $${amount} ${status}`;
      default:
        return `Transaction of $${amount} ${status}`;
    }
  }

  /**
   * Get KYC status message
   */
  getKYCStatusMessage(status) {
    const messages = {
      pending: 'Your identity verification is in progress',
      approved: 'Your identity has been verified successfully',
      rejected: 'Your identity verification was unsuccessful',
      needs_info: 'Additional information is required for verification'
    };
    return messages[status] || 'Your verification status has been updated';
  }

  /**
   * Send bank account linked notification
   */
  async notifyBankAccountLinked(userId, bankAccountData) {
    try {
      const notification = {
        id: `bank_${Date.now()}`,
        type: 'bank_account_linked',
        bankName: bankAccountData.bankName,
        lastFour: bankAccountData.lastFour,
        verificationRequired: bankAccountData.verificationRequired,
        message: `Bank account ending in ${bankAccountData.lastFour} has been linked`,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'bank:linked', notification);

      // Update notification count
      await this.incrementNotificationCount(userId);

      logger.info('Bank account linked notification sent', {
        userId,
        bankAccountId: bankAccountData.bankAccountId
      });
    } catch (error) {
      logger.error('Error sending bank account linked notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send bank account verified notification
   */
  async notifyBankAccountVerified(userId, bankAccountData) {
    try {
      const notification = {
        id: `bank_verify_${Date.now()}`,
        type: 'bank_account_verified',
        bankAccountId: bankAccountData.bankAccountId,
        message: 'Your bank account has been verified successfully',
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'bank:verified', notification);

      logger.info('Bank account verified notification sent', {
        userId,
        bankAccountId: bankAccountData.bankAccountId
      });
    } catch (error) {
      logger.error('Error sending bank account verified notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send card added notification
   */
  async notifyCardAdded(userId, cardData) {
    try {
      const notification = {
        id: `card_add_${Date.now()}`,
        type: 'card_added',
        brand: cardData.brand,
        last4: cardData.last4,
        message: `${cardData.brand} card ending in ${cardData.last4} has been added`,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'card:added', notification);

      // Update notification count
      await this.incrementNotificationCount(userId);

      logger.info('Card added notification sent', {
        userId,
        cardId: cardData.cardId
      });
    } catch (error) {
      logger.error('Error sending card added notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send card deposit notification with 3DS status
   */
  async notifyCardDeposit(userId, depositData) {
    try {
      const notification = {
        id: depositData.depositId,
        type: 'card_deposit',
        amount: depositData.amount,
        feeAmount: depositData.feeAmount,
        netAmount: depositData.netAmount,
        status: depositData.status,
        requires3ds: depositData.requires3ds,
        cardLast4: depositData.cardLast4,
        message: depositData.requires3ds
          ? `Card deposit of $${depositData.amount} requires verification`
          : `Card deposit of $${depositData.amount} ${depositData.status}`,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'card:deposit', notification);

      // Update balance if completed
      if (depositData.status === 'succeeded') {
        await this.refreshUserBalance(userId);
      }

      logger.info('Card deposit notification sent', {
        userId,
        depositId: depositData.depositId,
        amount: depositData.amount
      });
    } catch (error) {
      logger.error('Error sending card deposit notification', {
        userId,
        depositId: depositData.depositId,
        error: error.message
      });
    }
  }

  /**
   * Send 3DS authentication required notification
   */
  async notify3DSRequired(userId, authData) {
    try {
      const notification = {
        id: `3ds_${Date.now()}`,
        type: '3ds_authentication',
        depositId: authData.depositId,
        amount: authData.amount,
        clientSecret: authData.clientSecret,
        message: 'Your bank requires additional verification',
        action: 'complete_authentication',
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket with priority
      websocketService.sendToUser(userId, '3ds:required', notification);

      logger.info('3DS authentication notification sent', {
        userId,
        depositId: authData.depositId
      });
    } catch (error) {
      logger.error('Error sending 3DS notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send card removed notification
   */
  async notifyCardRemoved(userId, cardData) {
    try {
      const notification = {
        id: `card_remove_${Date.now()}`,
        type: 'card_removed',
        brand: cardData.brand,
        last4: cardData.last4,
        message: `${cardData.brand} card ending in ${cardData.last4} has been removed`,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'card:removed', notification);

      logger.info('Card removed notification sent', {
        userId,
        cardLast4: cardData.last4
      });
    } catch (error) {
      logger.error('Error sending card removed notification', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Send card deposit fee preview
   */
  async notifyDepositFeePreview(userId, feeData) {
    try {
      const notification = {
        id: `fee_preview_${Date.now()}`,
        type: 'fee_preview',
        amount: feeData.amount,
        feeAmount: feeData.totalFee,
        netAmount: feeData.netAmount,
        feePercentage: feeData.percentageFee,
        fixedFee: feeData.fixedFee,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket
      websocketService.sendToUser(userId, 'deposit:fee_preview', notification);

      logger.debug('Deposit fee preview sent', {
        userId,
        amount: feeData.amount
      });
    } catch (error) {
      logger.error('Error sending fee preview', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Broadcast system announcement
   */
  async broadcastAnnouncement(announcement) {
    try {
      const message = {
        id: `announce_${Date.now()}`,
        type: 'system_announcement',
        title: announcement.title,
        message: announcement.message,
        severity: announcement.severity || 'info',
        timestamp: new Date().toISOString()
      };

      // Broadcast to all connected users
      websocketService.broadcast('system:announcement', message);

      logger.info('System announcement broadcasted', {
        title: announcement.title
      });
    } catch (error) {
      logger.error('Error broadcasting announcement', {
        error: error.message
      });
    }
  }
}

// Create singleton instance
const realtimeNotificationsService = new RealtimeNotificationsService();

export default realtimeNotificationsService;