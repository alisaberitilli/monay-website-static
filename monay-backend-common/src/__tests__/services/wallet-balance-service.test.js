/**
 * Wallet Balance Service Tests
 * Consumer Wallet Phase 1 Day 5 Implementation
 */

import { jest } from '@jest/globals';
import WalletBalanceService from '../../services/wallet-balance-service.js';
import db from '../../models/index.js';
import Redis from 'ioredis';

// Mock dependencies
jest.mock('../../models/index.js');
jest.mock('ioredis');
jest.mock('../../services/logger.js');

describe('WalletBalanceService', () => {
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
  });

  describe('getWalletBalance', () => {
    it('should return cached balance if available', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';
      const cachedData = {
        walletId,
        availableBalance: 1000,
        pendingDebit: 50,
        pendingCredit: 100,
        totalBalance: 1050,
        currency: 'USD',
        status: 'active'
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await WalletBalanceService.getWalletBalance(walletId, userId);

      expect(mockRedis.get).toHaveBeenCalledWith(`balance:${walletId}`);
      expect(result).toEqual(cachedData);
      expect(db.Wallet.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database if cache miss', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';
      const walletData = {
        id: walletId,
        balance: '1000.00',
        currency: 'USD',
        status: 'active',
        type: 'primary'
      };

      mockRedis.get.mockResolvedValue(null);
      db.Wallet = {
        findOne: jest.fn().mockResolvedValue(walletData)
      };
      db.Transaction = {
        findAll: jest.fn().mockResolvedValue([
          { amount: '50.00', type: 'debit' },
          { amount: '100.00', type: 'credit' }
        ])
      };

      const result = await WalletBalanceService.getWalletBalance(walletId, userId);

      expect(db.Wallet.findOne).toHaveBeenCalledWith({
        where: { id: walletId, user_id: userId },
        attributes: ['id', 'balance', 'currency', 'status', 'type']
      });
      expect(mockRedis.setex).toHaveBeenCalled();
      expect(result.availableBalance).toBe(1000);
      expect(result.pendingDebit).toBe(50);
      expect(result.pendingCredit).toBe(100);
    });

    it('should throw error if wallet not found', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';

      mockRedis.get.mockResolvedValue(null);
      db.Wallet = {
        findOne: jest.fn().mockResolvedValue(null)
      };

      await expect(
        WalletBalanceService.getWalletBalance(walletId, userId)
      ).rejects.toThrow('Wallet not found');
    });
  });

  describe('updateBalance', () => {
    it('should credit balance successfully', async () => {
      const walletId = 'wallet_123';
      const amount = 100;
      const wallet = {
        id: walletId,
        balance: '500.00',
        update: jest.fn()
      };

      db.Wallet = {
        findOne: jest.fn().mockResolvedValue(wallet)
      };
      db.sequelize.query.mockResolvedValue([]);

      const result = await WalletBalanceService.updateBalance(
        walletId,
        amount,
        'credit'
      );

      expect(wallet.update).toHaveBeenCalledWith(
        { balance: 600 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.previousBalance).toBe(500);
      expect(result.newBalance).toBe(600);
    });

    it('should debit balance successfully', async () => {
      const walletId = 'wallet_123';
      const amount = 100;
      const wallet = {
        id: walletId,
        balance: '500.00',
        update: jest.fn()
      };

      db.Wallet = {
        findOne: jest.fn().mockResolvedValue(wallet)
      };
      db.sequelize.query.mockResolvedValue([]);

      const result = await WalletBalanceService.updateBalance(
        walletId,
        amount,
        'debit'
      );

      expect(wallet.update).toHaveBeenCalledWith(
        { balance: 400 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.previousBalance).toBe(500);
      expect(result.newBalance).toBe(400);
    });

    it('should throw error for insufficient balance', async () => {
      const walletId = 'wallet_123';
      const amount = 600;
      const wallet = {
        id: walletId,
        balance: '500.00'
      };

      db.Wallet = {
        findOne: jest.fn().mockResolvedValue(wallet)
      };

      await expect(
        WalletBalanceService.updateBalance(walletId, amount, 'debit')
      ).rejects.toThrow('Insufficient balance');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const walletId = 'wallet_123';
      const amount = 100;

      db.Wallet = {
        findOne: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      await expect(
        WalletBalanceService.updateBalance(walletId, amount, 'credit')
      ).rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('validateTransactionLimits', () => {
    beforeEach(() => {
      // Mock getWalletLimits
      WalletBalanceService.getWalletLimits = jest.fn();
    });

    it('should validate within limits', async () => {
      const walletId = 'wallet_123';
      const amount = 100;
      const transactionType = 'p2p';

      WalletBalanceService.getWalletLimits.mockResolvedValue({
        limits: {
          perTransaction: 500,
          daily: { p2p: 1000 },
          monthly: { p2p: 5000 }
        },
        remaining: {
          daily: { p2p: 900, transactions: 10 },
          monthly: { p2p: 4500, transactions: 100 }
        }
      });

      const result = await WalletBalanceService.validateTransactionLimits(
        walletId,
        amount,
        transactionType
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect per transaction limit exceeded', async () => {
      const walletId = 'wallet_123';
      const amount = 600;
      const transactionType = 'p2p';

      WalletBalanceService.getWalletLimits.mockResolvedValue({
        limits: {
          perTransaction: 500,
          daily: { p2p: 1000 },
          monthly: { p2p: 5000 }
        },
        remaining: {
          daily: { p2p: 900, transactions: 10 },
          monthly: { p2p: 4500, transactions: 100 }
        }
      });

      const result = await WalletBalanceService.validateTransactionLimits(
        walletId,
        amount,
        transactionType
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount exceeds per transaction limit of 500');
    });

    it('should detect daily limit exceeded', async () => {
      const walletId = 'wallet_123';
      const amount = 100;
      const transactionType = 'p2p';

      WalletBalanceService.getWalletLimits.mockResolvedValue({
        limits: {
          perTransaction: 500,
          daily: { p2p: 150 },
          monthly: { p2p: 5000 }
        },
        remaining: {
          daily: { p2p: 50, transactions: 10 },
          monthly: { p2p: 4500, transactions: 100 }
        }
      });

      const result = await WalletBalanceService.validateTransactionLimits(
        walletId,
        amount,
        transactionType
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount exceeds daily P2P limit. Remaining: 50');
    });
  });

  describe('createDefaultLimits', () => {
    it('should create basic tier limits', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';
      const tier = 'basic';

      db.sequelize.query.mockResolvedValue([]);

      await WalletBalanceService.createDefaultLimits(walletId, userId, tier);

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO wallet_limits'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            walletId,
            userId,
            tier,
            daily_spending_limit: 1000,
            daily_p2p_limit: 500,
            daily_withdrawal_limit: 300
          })
        })
      );
    });

    it('should create verified tier limits', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';
      const tier = 'verified';

      db.sequelize.query.mockResolvedValue([]);

      await WalletBalanceService.createDefaultLimits(walletId, userId, tier);

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO wallet_limits'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            walletId,
            userId,
            tier,
            daily_spending_limit: 5000,
            daily_p2p_limit: 2500,
            daily_withdrawal_limit: 1000
          })
        })
      );
    });

    it('should create premium tier limits', async () => {
      const walletId = 'wallet_123';
      const userId = 'user_456';
      const tier = 'premium';

      db.sequelize.query.mockResolvedValue([]);

      await WalletBalanceService.createDefaultLimits(walletId, userId, tier);

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO wallet_limits'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            walletId,
            userId,
            tier,
            daily_spending_limit: 25000,
            daily_p2p_limit: 10000,
            daily_withdrawal_limit: 5000
          })
        })
      );
    });
  });

  describe('updateLimitUsage', () => {
    it('should update limit usage for debit transaction', async () => {
      const walletId = 'wallet_123';
      const amount = 100;

      db.sequelize.query.mockResolvedValue([]);

      await WalletBalanceService.updateLimitUsage(
        walletId,
        amount,
        'debit',
        mockTransaction
      );

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE wallet_limits'),
        expect.objectContaining({
          replacements: { walletId, amount },
          transaction: mockTransaction
        })
      );
    });

    it('should not update limits for credit transaction', async () => {
      const walletId = 'wallet_123';
      const amount = 100;

      await WalletBalanceService.updateLimitUsage(
        walletId,
        amount,
        'credit',
        mockTransaction
      );

      expect(db.sequelize.query).not.toHaveBeenCalled();
    });
  });

  describe('checkAndResetLimits', () => {
    it('should reset daily limits when needed', async () => {
      const walletId = 'wallet_123';
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      db.sequelize.query.mockResolvedValue([1]); // 1 row updated

      await WalletBalanceService.checkAndResetLimits(walletId);

      expect(db.sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE wallet_limits'),
        expect.objectContaining({
          replacements: expect.objectContaining({
            walletId
          })
        })
      );
    });
  });
});