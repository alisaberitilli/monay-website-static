/**
 * P2P Transfer Service Tests
 * Consumer Wallet Phase 1 Day 5 Implementation
 */

import { jest } from '@jest/globals';
import P2PTransferService from '../../services/p2p-transfer-service.js';
import db from '../../models/index.js';
import walletBalanceService from '../../services/wallet-balance-service.js';
import notificationService from '../../services/notification-service.js';
import Redis from 'ioredis';

// Mock dependencies
jest.mock('../../models/index.js');
jest.mock('../../services/wallet-balance-service.js');
jest.mock('../../services/notification-service.js');
jest.mock('ioredis');
jest.mock('../../services/logger.js');

describe('P2PTransferService', () => {
  let mockRedis;
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Redis mock
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn()
    };
    Redis.mockImplementation(() => mockRedis);

    // Setup transaction mock
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
      LOCK: { UPDATE: 'UPDATE' }
    };

    db.sequelize = {
      transaction: jest.fn().mockResolvedValue(mockTransaction),
      query: jest.fn(),
      QueryTypes: {
        SELECT: 'SELECT',
        UPDATE: 'UPDATE',
        INSERT: 'INSERT'
      }
    };

    // Setup models
    db.User = {
      findOne: jest.fn(),
      findByPk: jest.fn()
    };

    db.Wallet = {
      findOne: jest.fn(),
      create: jest.fn()
    };

    db.Transaction = {
      create: jest.fn()
    };
  });

  describe('validateRecipient', () => {
    it('should validate recipient by email', async () => {
      const recipientData = {
        recipientIdentifier: 'user@example.com',
        recipientType: 'email'
      };

      const user = {
        id: 'user_123',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'active'
      };

      const wallet = {
        id: 'wallet_123',
        user_id: 'user_123',
        status: 'active'
      };

      db.User.findOne.mockResolvedValue(user);
      db.Wallet.findOne.mockResolvedValue(wallet);

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' }
      });
      expect(result.isValid).toBe(true);
      expect(result.user).toEqual(user);
      expect(result.wallet).toEqual(wallet);
    });

    it('should validate recipient by phone', async () => {
      const recipientData = {
        recipientIdentifier: '+1234567890',
        recipientType: 'phone'
      };

      const user = {
        id: 'user_123',
        phone: '+1234567890',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'active'
      };

      const wallet = {
        id: 'wallet_456',
        user_id: 'user_123',
        status: 'active'
      };

      db.User.findOne.mockResolvedValue(user);
      db.Wallet.findOne.mockResolvedValue(wallet);

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { phone: '+1234567890' }
      });
      expect(result.isValid).toBe(true);
    });

    it('should auto-detect email format', async () => {
      const recipientData = {
        recipientIdentifier: 'user@example.com',
        recipientType: 'auto'
      };

      const user = {
        id: 'user_123',
        email: 'user@example.com',
        status: 'active'
      };

      db.User.findOne.mockResolvedValue(user);
      db.Wallet.findOne.mockResolvedValue({ id: 'wallet_123' });

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(db.User.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com' }
      });
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for non-existent user', async () => {
      const recipientData = {
        recipientIdentifier: 'nonexistent@example.com',
        recipientType: 'email'
      };

      db.User.findOne.mockResolvedValue(null);

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Recipient not found');
    });

    it('should return invalid for inactive user', async () => {
      const recipientData = {
        recipientIdentifier: 'user@example.com',
        recipientType: 'email'
      };

      const user = {
        id: 'user_123',
        email: 'user@example.com',
        status: 'inactive'
      };

      db.User.findOne.mockResolvedValue(user);

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Recipient account is not active');
    });

    it('should create wallet if not exists', async () => {
      const recipientData = {
        recipientIdentifier: 'user@example.com',
        recipientType: 'email'
      };

      const user = {
        id: 'user_123',
        email: 'user@example.com',
        status: 'active'
      };

      const newWallet = {
        id: 'wallet_new',
        user_id: 'user_123',
        balance: 0,
        status: 'active',
        type: 'primary'
      };

      db.User.findOne.mockResolvedValue(user);
      db.Wallet.findOne.mockResolvedValue(null);
      db.Wallet.create.mockResolvedValue(newWallet);

      const result = await P2PTransferService.validateRecipient(recipientData);

      expect(db.Wallet.create).toHaveBeenCalledWith({
        user_id: 'user_123',
        balance: 0,
        currency: 'USD',
        status: 'active',
        type: 'primary'
      });
      expect(result.wallet).toEqual(newWallet);
      expect(result.walletCreated).toBe(true);
    });
  });

  describe('createTransfer', () => {
    it('should create a new P2P transfer', async () => {
      const senderId = 'sender_123';
      const transferData = {
        recipientIdentifier: 'user@example.com',
        amount: 100,
        note: 'Test transfer'
      };

      const sender = {
        id: senderId,
        firstName: 'Alice',
        lastName: 'Sender'
      };

      const senderWallet = {
        id: 'wallet_sender',
        user_id: senderId,
        balance: 500
      };

      const recipient = {
        id: 'recipient_123',
        firstName: 'Bob',
        lastName: 'Receiver'
      };

      const recipientWallet = {
        id: 'wallet_recipient',
        user_id: 'recipient_123'
      };

      // Mock user and wallet lookups
      db.User.findByPk.mockResolvedValue(sender);
      db.Wallet.findOne
        .mockResolvedValueOnce(senderWallet)
        .mockResolvedValueOnce(recipientWallet);
      db.User.findOne.mockResolvedValue(recipient);

      // Mock validation
      P2PTransferService.validateRecipient = jest.fn().mockResolvedValue({
        isValid: true,
        user: recipient,
        wallet: recipientWallet
      });

      // Mock balance validation
      walletBalanceService.validateTransactionLimits = jest.fn().mockResolvedValue({
        isValid: true,
        errors: []
      });

      // Mock transfer creation
      db.sequelize.query.mockResolvedValue([{ insertId: 'transfer_123' }]);

      const result = await P2PTransferService.createTransfer(senderId, transferData);

      expect(result.success).toBe(true);
      expect(result.transferId).toBeDefined();
      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO p2p_transfers'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            sender_id: senderId,
            recipient_id: 'recipient_123',
            amount: 100,
            status: 'pending'
          })
        })
      );
    });

    it('should reject transfer with insufficient balance', async () => {
      const senderId = 'sender_123';
      const transferData = {
        recipientIdentifier: 'user@example.com',
        amount: 1000
      };

      const senderWallet = {
        id: 'wallet_sender',
        balance: 100 // Less than transfer amount
      };

      db.User.findByPk.mockResolvedValue({ id: senderId });
      db.Wallet.findOne.mockResolvedValue(senderWallet);

      await expect(
        P2PTransferService.createTransfer(senderId, transferData)
      ).rejects.toThrow('Insufficient balance');
    });

    it('should respect transaction limits', async () => {
      const senderId = 'sender_123';
      const transferData = {
        recipientIdentifier: 'user@example.com',
        amount: 5000
      };

      const senderWallet = {
        id: 'wallet_sender',
        balance: 10000
      };

      db.User.findByPk.mockResolvedValue({ id: senderId });
      db.Wallet.findOne.mockResolvedValue(senderWallet);

      walletBalanceService.validateTransactionLimits = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['Daily limit exceeded']
      });

      P2PTransferService.validateRecipient = jest.fn().mockResolvedValue({
        isValid: true,
        user: { id: 'recipient_123' },
        wallet: { id: 'wallet_recipient' }
      });

      await expect(
        P2PTransferService.createTransfer(senderId, transferData)
      ).rejects.toThrow('Daily limit exceeded');
    });
  });

  describe('processTransfer', () => {
    it('should process transfer successfully', async () => {
      const transferId = 'transfer_123';
      const transfer = [{
        id: transferId,
        sender_id: 'sender_123',
        recipient_id: 'recipient_123',
        sender_wallet_id: 'wallet_sender',
        recipient_wallet_id: 'wallet_recipient',
        amount: 100,
        status: 'validating'
      }];

      db.sequelize.query
        .mockResolvedValueOnce(transfer) // Get transfer
        .mockResolvedValueOnce([]) // Update status
        .mockResolvedValueOnce([]); // Update to completed

      walletBalanceService.updateBalance = jest.fn()
        .mockResolvedValueOnce({ newBalance: 400 }) // Debit sender
        .mockResolvedValueOnce({ newBalance: 600 }); // Credit recipient

      db.Transaction.create = jest.fn();
      notificationService.createNotification = jest.fn();

      const result = await P2PTransferService.processTransfer(transferId);

      expect(result.success).toBe(true);
      expect(walletBalanceService.updateBalance).toHaveBeenCalledTimes(2);
      expect(db.Transaction.create).toHaveBeenCalledTimes(2); // Sender and recipient records
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should handle processing failure', async () => {
      const transferId = 'transfer_123';
      const transfer = [{
        id: transferId,
        sender_wallet_id: 'wallet_sender',
        amount: 100,
        status: 'validating'
      }];

      db.sequelize.query.mockResolvedValueOnce(transfer);
      walletBalanceService.updateBalance = jest.fn()
        .mockRejectedValue(new Error('Balance update failed'));

      const result = await P2PTransferService.processTransfer(transferId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Balance update failed');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('updateTransferState', () => {
    it('should update transfer state successfully', async () => {
      const transferId = 'transfer_123';
      const currentTransfer = [{
        id: transferId,
        status: 'pending'
      }];

      db.sequelize.query
        .mockResolvedValueOnce(currentTransfer) // Get current status
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update status

      const result = await P2PTransferService.updateTransferState(
        transferId,
        'pending',
        'validating'
      );

      expect(result.success).toBe(true);
      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE p2p_transfers SET status = :newStatus'),
        expect.objectContaining({
          replacements: { transferId, newStatus: 'validating' }
        })
      );
    });

    it('should reject invalid state transition', async () => {
      const transferId = 'transfer_123';

      await expect(
        P2PTransferService.updateTransferState(transferId, 'completed', 'pending')
      ).rejects.toThrow('Invalid state transition');
    });
  });

  describe('getTransferHistory', () => {
    it('should get transfer history for user', async () => {
      const userId = 'user_123';
      const filters = {
        limit: 10,
        offset: 0,
        type: 'all'
      };

      const transfers = [
        {
          id: 'transfer_1',
          amount: 100,
          status: 'completed',
          created_at: '2025-01-23T10:00:00Z'
        },
        {
          id: 'transfer_2',
          amount: 50,
          status: 'completed',
          created_at: '2025-01-23T09:00:00Z'
        }
      ];

      db.sequelize.query.mockResolvedValue(transfers);

      const result = await P2PTransferService.getTransferHistory(userId, filters);

      expect(result).toEqual(transfers);
      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.objectContaining({
          replacements: expect.objectContaining({ userId })
        })
      );
    });

    it('should filter by type (sent/received)', async () => {
      const userId = 'user_123';
      const filters = {
        type: 'sent',
        limit: 10,
        offset: 0
      };

      db.sequelize.query.mockResolvedValue([]);

      await P2PTransferService.getTransferHistory(userId, filters);

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('sender_id = :userId'),
        expect.any(Object)
      );
    });
  });

  describe('cancelTransfer', () => {
    it('should cancel pending transfer', async () => {
      const transferId = 'transfer_123';
      const userId = 'user_123';
      const transfer = [{
        id: transferId,
        sender_id: userId,
        status: 'pending'
      }];

      db.sequelize.query
        .mockResolvedValueOnce(transfer) // Get transfer
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update status

      const result = await P2PTransferService.cancelTransfer(transferId, userId);

      expect(result.success).toBe(true);
      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE p2p_transfers SET status = 'cancelled'"),
        expect.any(Object)
      );
    });

    it('should not cancel non-pending transfer', async () => {
      const transferId = 'transfer_123';
      const userId = 'user_123';
      const transfer = [{
        id: transferId,
        sender_id: userId,
        status: 'completed'
      }];

      db.sequelize.query.mockResolvedValueOnce(transfer);

      await expect(
        P2PTransferService.cancelTransfer(transferId, userId)
      ).rejects.toThrow('can only be cancelled');
    });

    it('should not allow non-sender to cancel', async () => {
      const transferId = 'transfer_123';
      const userId = 'different_user';
      const transfer = [{
        id: transferId,
        sender_id: 'original_sender',
        status: 'pending'
      }];

      db.sequelize.query.mockResolvedValueOnce(transfer);

      await expect(
        P2PTransferService.cancelTransfer(transferId, userId)
      ).rejects.toThrow('not authorized');
    });
  });

  describe('retryTransfer', () => {
    it('should retry failed transfer', async () => {
      const transferId = 'transfer_123';
      const userId = 'user_123';
      const transfer = [{
        id: transferId,
        sender_id: userId,
        status: 'failed',
        retry_count: 1
      }];

      db.sequelize.query
        .mockResolvedValueOnce(transfer) // Get transfer
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update retry count

      P2PTransferService.processTransfer = jest.fn().mockResolvedValue({
        success: true
      });

      const result = await P2PTransferService.retryTransfer(transferId, userId);

      expect(result.success).toBe(true);
      expect(P2PTransferService.processTransfer).toHaveBeenCalledWith(transferId);
    });

    it('should not retry if max attempts reached', async () => {
      const transferId = 'transfer_123';
      const userId = 'user_123';
      const transfer = [{
        id: transferId,
        sender_id: userId,
        status: 'failed',
        retry_count: 3 // Max retries reached
      }];

      db.sequelize.query.mockResolvedValueOnce(transfer);

      await expect(
        P2PTransferService.retryTransfer(transferId, userId)
      ).rejects.toThrow('Maximum retry attempts');
    });
  });
});