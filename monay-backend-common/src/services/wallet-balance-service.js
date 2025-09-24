/**
 * Wallet Balance Management Service
 * Handles real-time balance operations, limits, and validation
 * Part of Consumer Wallet Phase 1 Implementation
 */

import db from '../models/index.js';
import { Op } from 'sequelize';
import Redis from 'ioredis';
import logger from './logger.js';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

class WalletBalanceService {
  /**
   * Get real-time wallet balance with caching
   */
  async getWalletBalance(walletId, userId) {
    try {
      // Try cache first
      const cacheKey = `balance:${walletId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      const wallet = await db.Wallet.findOne({
        where: { 
          id: walletId,
          user_id: userId
        },
        attributes: ['id', 'balance', 'currency', 'status', 'type']
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Calculate pending amounts
      const pendingTransactions = await db.Transaction.findAll({
        where: {
          wallet_id: walletId,
          status: 'pending',
          created_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        attributes: ['amount', 'type']
      });

      let pendingDebit = 0;
      let pendingCredit = 0;

      pendingTransactions.forEach(tx => {
        if (tx.type === 'debit') {
          pendingDebit += parseFloat(tx.amount);
        } else {
          pendingCredit += parseFloat(tx.amount);
        }
      });

      const balanceData = {
        walletId: wallet.id,
        availableBalance: parseFloat(wallet.balance),
        pendingDebit,
        pendingCredit,
        totalBalance: parseFloat(wallet.balance) + pendingCredit - pendingDebit,
        currency: wallet.currency || 'USD',
        status: wallet.status,
        type: wallet.type,
        lastUpdated: new Date().toISOString()
      };

      // Cache for 30 seconds
      await redis.setex(cacheKey, 30, JSON.stringify(balanceData));

      return balanceData;
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet limits and current usage
   */
  async getWalletLimits(walletId, userId) {
    try {
      // Check if limits exist
      let limits = await db.sequelize.query(
        `SELECT * FROM wallet_limits WHERE wallet_id = :walletId AND user_id = :userId`,
        {
          replacements: { walletId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!limits || limits.length === 0) {
        // Create default limits based on user tier
        const user = await db.User.findByPk(userId);
        const tier = user?.kyc_status === 'verified' ? 'verified' : 'basic';
        
        await this.createDefaultLimits(walletId, userId, tier);
        
        limits = await db.sequelize.query(
          `SELECT * FROM wallet_limits WHERE wallet_id = :walletId`,
          {
            replacements: { walletId },
            type: db.sequelize.QueryTypes.SELECT
          }
        );
      }

      const walletLimits = limits[0];

      // Check if daily/monthly limits need reset
      await this.checkAndResetLimits(walletId);

      // Calculate remaining limits
      const remaining = {
        daily: {
          spending: walletLimits.daily_spending_limit - walletLimits.daily_spent_amount,
          p2p: walletLimits.daily_p2p_limit - walletLimits.daily_p2p_amount,
          withdrawal: walletLimits.daily_withdrawal_limit - walletLimits.daily_withdrawal_amount,
          transactions: walletLimits.daily_transaction_count_limit - walletLimits.daily_transaction_count
        },
        monthly: {
          spending: walletLimits.monthly_spending_limit - walletLimits.monthly_spent_amount,
          p2p: walletLimits.monthly_p2p_limit - walletLimits.monthly_p2p_amount,
          withdrawal: walletLimits.monthly_withdrawal_limit - walletLimits.monthly_withdrawal_amount,
          transactions: walletLimits.monthly_transaction_count_limit - walletLimits.monthly_transaction_count
        },
        perTransaction: walletLimits.per_transaction_limit
      };

      return {
        limits: {
          daily: {
            spending: walletLimits.daily_spending_limit,
            p2p: walletLimits.daily_p2p_limit,
            withdrawal: walletLimits.daily_withdrawal_limit,
            transactions: walletLimits.daily_transaction_count_limit
          },
          monthly: {
            spending: walletLimits.monthly_spending_limit,
            p2p: walletLimits.monthly_p2p_limit,
            withdrawal: walletLimits.monthly_withdrawal_limit,
            transactions: walletLimits.monthly_transaction_count_limit
          },
          perTransaction: walletLimits.per_transaction_limit,
          minimumBalance: walletLimits.minimum_balance
        },
        usage: {
          daily: {
            spending: walletLimits.daily_spent_amount,
            p2p: walletLimits.daily_p2p_amount,
            withdrawal: walletLimits.daily_withdrawal_amount,
            transactions: walletLimits.daily_transaction_count
          },
          monthly: {
            spending: walletLimits.monthly_spent_amount,
            p2p: walletLimits.monthly_p2p_amount,
            withdrawal: walletLimits.monthly_withdrawal_amount,
            transactions: walletLimits.monthly_transaction_count
          }
        },
        remaining,
        tier: walletLimits.user_tier,
        nextDailyReset: walletLimits.daily_reset_at,
        nextMonthlyReset: walletLimits.monthly_reset_at
      };
    } catch (error) {
      logger.error('Error getting wallet limits:', error);
      throw error;
    }
  }

  /**
   * Update wallet limits
   */
  async updateWalletLimits(walletId, userId, updates) {
    try {
      const allowedFields = [
        'daily_spending_limit',
        'daily_p2p_limit',
        'daily_withdrawal_limit',
        'monthly_spending_limit',
        'monthly_p2p_limit',
        'monthly_withdrawal_limit',
        'per_transaction_limit',
        'minimum_balance'
      ];

      // Filter only allowed fields
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Build UPDATE query
      const setClause = Object.keys(filteredUpdates)
        .map(key => `${key} = :${key}`)
        .join(', ');

      await db.sequelize.query(
        `UPDATE wallet_limits SET ${setClause}, updated_at = NOW() 
         WHERE wallet_id = :walletId AND user_id = :userId`,
        {
          replacements: { ...filteredUpdates, walletId, userId },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Clear cache
      await redis.del(`limits:${walletId}`);

      return await this.getWalletLimits(walletId, userId);
    } catch (error) {
      logger.error('Error updating wallet limits:', error);
      throw error;
    }
  }

  /**
   * Validate transaction against limits
   */
  async validateTransactionLimits(walletId, amount, transactionType) {
    try {
      const limits = await this.getWalletLimits(walletId);
      const errors = [];

      // Check per transaction limit
      if (amount > limits.limits.perTransaction) {
        errors.push(`Amount exceeds per transaction limit of ${limits.limits.perTransaction}`);
      }

      // Check daily limits based on transaction type
      if (transactionType === 'p2p') {
        if (amount > limits.remaining.daily.p2p) {
          errors.push(`Amount exceeds daily P2P limit. Remaining: ${limits.remaining.daily.p2p}`);
        }
        if (amount > limits.remaining.monthly.p2p) {
          errors.push(`Amount exceeds monthly P2P limit. Remaining: ${limits.remaining.monthly.p2p}`);
        }
      } else if (transactionType === 'withdrawal') {
        if (amount > limits.remaining.daily.withdrawal) {
          errors.push(`Amount exceeds daily withdrawal limit. Remaining: ${limits.remaining.daily.withdrawal}`);
        }
        if (amount > limits.remaining.monthly.withdrawal) {
          errors.push(`Amount exceeds monthly withdrawal limit. Remaining: ${limits.remaining.monthly.withdrawal}`);
        }
      } else {
        // General spending
        if (amount > limits.remaining.daily.spending) {
          errors.push(`Amount exceeds daily spending limit. Remaining: ${limits.remaining.daily.spending}`);
        }
        if (amount > limits.remaining.monthly.spending) {
          errors.push(`Amount exceeds monthly spending limit. Remaining: ${limits.remaining.monthly.spending}`);
        }
      }

      // Check transaction count limits
      if (limits.remaining.daily.transactions <= 0) {
        errors.push('Daily transaction count limit reached');
      }
      if (limits.remaining.monthly.transactions <= 0) {
        errors.push('Monthly transaction count limit reached');
      }

      return {
        isValid: errors.length === 0,
        errors,
        limits: limits.remaining
      };
    } catch (error) {
      logger.error('Error validating transaction limits:', error);
      throw error;
    }
  }

  /**
   * Update balance atomically
   */
  async updateBalance(walletId, amount, type, transaction) {
    try {
      const t = transaction || await db.sequelize.transaction();
      
      try {
        // Lock the wallet row for update
        const wallet = await db.Wallet.findOne({
          where: { id: walletId },
          lock: t.LOCK.UPDATE,
          transaction: t
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        const currentBalance = parseFloat(wallet.balance);
        let newBalance;

        if (type === 'credit') {
          newBalance = currentBalance + parseFloat(amount);
        } else if (type === 'debit') {
          newBalance = currentBalance - parseFloat(amount);
          if (newBalance < 0) {
            throw new Error('Insufficient balance');
          }
        } else {
          throw new Error('Invalid transaction type');
        }

        // Update wallet balance
        await wallet.update(
          { balance: newBalance },
          { transaction: t }
        );

        // Update limit usage
        await this.updateLimitUsage(walletId, amount, type, t);

        // Clear balance cache
        await redis.del(`balance:${walletId}`);

        if (!transaction) {
          await t.commit();
        }

        return {
          previousBalance: currentBalance,
          newBalance,
          walletId
        };
      } catch (error) {
        if (!transaction) {
          await t.rollback();
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error updating balance:', error);
      throw error;
    }
  }

  /**
   * Create default limits for a wallet
   */
  async createDefaultLimits(walletId, userId, tier = 'basic') {
    const tierLimits = {
      basic: {
        daily_spending_limit: 1000,
        daily_p2p_limit: 500,
        daily_withdrawal_limit: 300,
        monthly_spending_limit: 5000,
        monthly_p2p_limit: 2500,
        monthly_withdrawal_limit: 3000,
        per_transaction_limit: 500
      },
      verified: {
        daily_spending_limit: 5000,
        daily_p2p_limit: 2500,
        daily_withdrawal_limit: 1000,
        monthly_spending_limit: 50000,
        monthly_p2p_limit: 25000,
        monthly_withdrawal_limit: 10000,
        per_transaction_limit: 5000
      },
      premium: {
        daily_spending_limit: 25000,
        daily_p2p_limit: 10000,
        daily_withdrawal_limit: 5000,
        monthly_spending_limit: 250000,
        monthly_p2p_limit: 100000,
        monthly_withdrawal_limit: 50000,
        per_transaction_limit: 25000
      }
    };

    const limits = tierLimits[tier] || tierLimits.basic;

    await db.sequelize.query(
      `INSERT INTO wallet_limits (
        wallet_id, user_id, user_tier,
        daily_spending_limit, daily_p2p_limit, daily_withdrawal_limit,
        monthly_spending_limit, monthly_p2p_limit, monthly_withdrawal_limit,
        per_transaction_limit, daily_transaction_count_limit, monthly_transaction_count_limit
      ) VALUES (
        :walletId, :userId, :tier,
        :daily_spending_limit, :daily_p2p_limit, :daily_withdrawal_limit,
        :monthly_spending_limit, :monthly_p2p_limit, :monthly_withdrawal_limit,
        :per_transaction_limit, 100, 1000
      )`,
      {
        replacements: { walletId, userId, tier, ...limits },
        type: db.sequelize.QueryTypes.INSERT
      }
    );
  }

  /**
   * Check and reset daily/monthly limits if needed
   */
  async checkAndResetLimits(walletId) {
    const now = new Date();
    
    // Check daily reset
    await db.sequelize.query(
      `UPDATE wallet_limits 
       SET daily_spent_amount = 0, 
           daily_p2p_amount = 0,
           daily_withdrawal_amount = 0,
           daily_transaction_count = 0,
           daily_reset_at = :tomorrow
       WHERE wallet_id = :walletId 
       AND daily_reset_at < :now`,
      {
        replacements: {
          walletId,
          now,
          tomorrow: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Check monthly reset
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db.sequelize.query(
      `UPDATE wallet_limits 
       SET monthly_spent_amount = 0,
           monthly_p2p_amount = 0,
           monthly_withdrawal_amount = 0,
           monthly_transaction_count = 0,
           monthly_reset_at = :nextMonth
       WHERE wallet_id = :walletId 
       AND monthly_reset_at < :now`,
      {
        replacements: { walletId, now, nextMonth },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
  }

  /**
   * Update limit usage after a transaction
   */
  async updateLimitUsage(walletId, amount, type, transaction) {
    if (type !== 'debit') return; // Only track debits against limits

    const updateQuery = `
      UPDATE wallet_limits 
      SET daily_spent_amount = daily_spent_amount + :amount,
          monthly_spent_amount = monthly_spent_amount + :amount,
          daily_transaction_count = daily_transaction_count + 1,
          monthly_transaction_count = monthly_transaction_count + 1
      WHERE wallet_id = :walletId
    `;

    await db.sequelize.query(updateQuery, {
      replacements: { walletId, amount },
      type: db.sequelize.QueryTypes.UPDATE,
      transaction
    });
  }
}

export default new WalletBalanceService();