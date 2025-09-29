/**
 * Consumer Wallet Service
 * Provides consumer-focused wallet operations using Tempo as primary provider
 * with Circle as fallback and future Monay rails support
 */

import { v4 as uuidv4 } from 'uuid';
import stablecoinProviderFactoryModule from './stablecoin-provider-factory.js';
import db from '../models/index.js';

class ConsumerWalletService {
  constructor() {
    this.factory = stablecoinProviderFactoryModule.getInstance();
    this.initializeProviders();
  }

  async initializeProviders() {
    try {
      // Providers are already initialized in the factory
      console.log('Using initialized stablecoin providers');
    } catch (error) {
      console.error('Failed to initialize providers:', error);
    }
  }

  /**
   * Create consumer wallet with progressive KYC
   */
  async createConsumerWallet(userData) {
    const { email, phone, kycLevel = 1 } = userData;

    try {
      // Start transaction
      await db.query('BEGIN');

      // Create user with consumer defaults
      const userResult = await db.query(
        `INSERT INTO users (
          email, phone, type,
          consumer_kyc_level,
          consumer_daily_limit,
          consumer_monthly_limit,
          preferred_provider,
          created_at
        ) VALUES ($1, $2, 'consumer', $3, $4, $5, 'tempo', NOW())
        RETURNING *`,
        [
          email,
          phone,
          kycLevel,
          this.getKYCLimits(kycLevel).daily,
          this.getKYCLimits(kycLevel).monthly
        ]
      );

      const user = userResult.rows[0];

      // Create wallet via Tempo (primary)
      let primaryWallet;
      try {
        primaryWallet = await this.factory.executeWithFallback(
          'createWallet',
          [user.id, 'consumer'],
          { preferredProvider: 'tempo' }
        );

        // Store wallet info
        await db.query(
          `INSERT INTO wallets (
            user_id, type, provider, is_primary,
            address, metadata, status
          ) VALUES ($1, 'consumer', 'tempo', true, $2, $3, 'active')
          RETURNING *`,
          [user.id, primaryWallet.address, { tempoWalletId: primaryWallet.id }]
        );
      } catch (error) {
        console.error('Tempo wallet creation failed, trying Circle:', error);

        // Fallback to Circle
        primaryWallet = await this.factory.getProvider('circle').createWallet(user.id);

        await db.query(
          `INSERT INTO wallets (
            user_id, type, provider, is_primary,
            metadata, status
          ) VALUES ($1, 'consumer', 'circle', true, $2, 'active')
          RETURNING *`,
          [user.id, { circleWalletId: primaryWallet.id }]
        );
      }

      // Create consumer preferences
      await db.query(
        `INSERT INTO consumer_preferences (
          user_id, preferred_currency, auto_balance,
          smart_routing, instant_notifications
        ) VALUES ($1, 'USDC', false, true, true)
        ON CONFLICT (user_id) DO NOTHING`,
        [user.id]
      );

      await db.query('COMMIT');

      return {
        user,
        wallet: primaryWallet,
        kycLevel,
        limits: this.getKYCLimits(kycLevel),
        provider: primaryWallet.provider || 'tempo'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Smart deposit routing based on amount and urgency
   */
  async deposit(userId, amount, options = {}) {
    const { method = 'ach', urgency = 'standard' } = options;

    // Select optimal route
    const route = this.selectDepositRoute(amount, urgency);

    try {
      // Execute deposit via provider
      const result = await this.factory.executeWithFallback(
        'deposit',
        [userId, amount, method],
        { preferredProvider: route.provider }
      );

      // Update user balance
      await this.updateBalance(userId, amount, 'USDC', 'add');

      // Record transaction
      await db.query(
        `INSERT INTO transactions (
          user_id, type, amount, status,
          provider, settlement_time_ms, metadata
        ) VALUES ($1, 'deposit', $2, 'completed', $3, $4, $5)`,
        [
          userId,
          amount,
          result.provider || route.provider,
          result.settlementTimeMs || 100,
          { method, urgency, fee: route.fee }
        ]
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount,
        currency: 'USDC',
        provider: result.provider || route.provider,
        fee: route.fee,
        settlementTime: route.provider === 'tempo' ? '<100ms' : '2-3s'
      };
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    }
  }

  /**
   * Instant withdrawal with Tempo, fallback to Circle
   */
  async withdraw(userId, amount, destination, options = {}) {
    const { speed = 'instant' } = options;

    // Check balance
    const balance = await this.getBalance(userId);
    if (balance.total < amount) {
      throw new Error('Insufficient balance');
    }

    try {
      const result = await this.factory.executeWithFallback(
        'withdraw',
        [userId, amount, destination],
        { preferredProvider: 'tempo' }
      );

      // Update balance
      await this.updateBalance(userId, amount, 'USDC', 'subtract');

      // Record transaction
      await db.query(
        `INSERT INTO transactions (
          user_id, type, amount, status,
          provider, settlement_time_ms, metadata
        ) VALUES ($1, 'withdrawal', $2, 'completed', $3, $4, $5)`,
        [
          userId,
          amount,
          result.provider || 'tempo',
          result.settlementTimeMs || 100,
          { destination, speed, fee: result.fee }
        ]
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount,
        fee: result.fee || 0.0001,
        arrivalTime: speed === 'instant' ? 'Instant' : '1-3 days',
        provider: result.provider || 'tempo'
      };
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    }
  }

  /**
   * P2P transfer leveraging Tempo's speed
   */
  async transfer(fromUserId, toAddress, amount, currency = 'USDC') {
    try {
      const result = await this.factory.executeWithFallback(
        'transfer',
        [fromUserId, toAddress, amount, currency],
        { preferredProvider: 'tempo' }
      );

      // Update sender balance
      await this.updateBalance(fromUserId, amount, currency, 'subtract');

      // Record transaction
      await db.query(
        `INSERT INTO transactions (
          user_id, type, amount, currency, status,
          provider, settlement_time_ms, metadata
        ) VALUES ($1, 'transfer', $2, $3, 'completed', $4, $5, $6)`,
        [
          fromUserId,
          amount,
          currency,
          result.provider || 'tempo',
          result.settlementTimeMs || 100,
          { to: toAddress, fee: 0.0001 }
        ]
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount,
        currency,
        fee: 0.0001, // Tempo fee
        settlementTime: '<100ms',
        provider: result.provider || 'tempo'
      };
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Batch transfer - Tempo's killer feature
   */
  async batchTransfer(fromUserId, recipients) {
    const batchId = uuidv4();

    try {
      // Check if Tempo is available for batch
      const tempo = this.factory.getProvider('tempo');
      if (tempo && await tempo.isHealthy()) {
        // Use Tempo's native batch transfer
        const result = await tempo.batchTransfer(fromUserId, recipients);

        // Record batch transaction
        const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);

        await db.query(
          `INSERT INTO transactions (
            user_id, type, amount, batch_id,
            provider, settlement_time_ms, metadata
          ) VALUES ($1, 'batch_transfer', $2, $3, 'tempo', $4, $5)`,
          [
            fromUserId,
            totalAmount,
            batchId,
            100, // Tempo is fast!
            { recipients: recipients.length, fee: 0.0001 }
          ]
        );

        return {
          success: true,
          batchId,
          transfers: result.transfers,
          totalFee: 0.0001, // Single fee for all!
          provider: 'tempo'
        };
      }

      // Fallback to individual transfers
      const results = [];
      for (const recipient of recipients) {
        const result = await this.transfer(
          fromUserId,
          recipient.address,
          recipient.amount,
          recipient.currency || 'USDC'
        );
        results.push(result);
      }

      return {
        success: true,
        batchId,
        transfers: results,
        totalFee: results.length * 0.0001,
        provider: 'fallback'
      };
    } catch (error) {
      console.error('Batch transfer failed:', error);
      throw error;
    }
  }

  /**
   * Get multi-stablecoin portfolio
   */
  async getPortfolio(userId) {
    try {
      // Get balances from database
      const balances = await db.query(
        `SELECT currency, SUM(amount) as total, provider
         FROM stablecoin_balances
         WHERE user_id = $1
         GROUP BY currency, provider
         ORDER BY currency`,
        [userId]
      );

      // Try to sync with Tempo for latest balances
      try {
        const tempo = this.factory.getProvider('tempo');
        if (tempo && await tempo.isHealthy()) {
          const liveBalances = await tempo.getMultiCurrencyBalance(userId);

          // Update database with latest
          for (const [currency, amount] of Object.entries(liveBalances)) {
            await db.query(
              `INSERT INTO stablecoin_balances (user_id, currency, amount, provider)
               VALUES ($1, $2, $3, 'tempo')
               ON CONFLICT (user_id, currency, provider)
               DO UPDATE SET amount = $3, last_synced = NOW()`,
              [userId, currency, amount]
            );
          }
        }
      } catch (error) {
        console.warn('Could not sync with Tempo, using cached balances');
      }

      const totalUSD = balances.rows.reduce((sum, b) => sum + parseFloat(b.total), 0);

      return {
        totalUSD,
        breakdown: balances.rows,
        primaryProvider: 'tempo',
        lastSynced: new Date()
      };
    } catch (error) {
      console.error('Failed to get portfolio:', error);
      throw error;
    }
  }

  /**
   * Instant swap between stablecoins (Tempo native)
   */
  async swapStablecoins(userId, from, to, amount) {
    try {
      const tempo = this.factory.getProvider('tempo');
      if (!tempo || !(await tempo.isHealthy())) {
        throw new Error('Swap currently unavailable (Tempo required)');
      }

      const result = await tempo.swap(userId, from, to, amount);

      // Update balances
      await this.updateBalance(userId, amount, from, 'subtract');
      await this.updateBalance(userId, result.outputAmount, to, 'add');

      // Record transaction
      await db.query(
        `INSERT INTO transactions (
          user_id, type, amount, currency, status,
          provider, settlement_time_ms, metadata
        ) VALUES ($1, 'swap', $2, $3, 'completed', 'tempo', $4, $5)`,
        [
          userId,
          amount,
          from,
          100,
          { from, to, outputAmount: result.outputAmount, rate: result.rate }
        ]
      );

      return {
        success: true,
        transactionId: result.transactionId,
        inputAmount: amount,
        outputAmount: result.outputAmount,
        from,
        to,
        rate: result.rate,
        fee: 0.0001,
        executionTime: '<100ms'
      };
    } catch (error) {
      console.error('Swap failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Get KYC limits based on level
   */
  getKYCLimits(level) {
    const limits = {
      1: { daily: 1000, monthly: 30000 },
      2: { daily: 50000, monthly: 500000 },
      3: { daily: 250000, monthly: 5000000 }
    };
    return limits[level] || limits[1];
  }

  /**
   * Helper: Select optimal deposit route
   */
  selectDepositRoute(amount, urgency) {
    if (urgency === 'instant') {
      if (amount <= 5000) {
        return { method: 'card', provider: 'tempo', fee: '2.9%' };
      }
      if (amount <= 10000) {
        return { method: 'apple_pay', provider: 'tempo', fee: '2.9%' };
      }
      return { method: 'wire', provider: 'tempo', fee: '$15' };
    }

    // Standard deposits
    if (amount <= 50000) {
      return { method: 'ach', provider: 'tempo', fee: '0.5%' };
    }
    return { method: 'wire', provider: 'tempo', fee: '$15' };
  }

  /**
   * Helper: Update user balance
   */
  async updateBalance(userId, amount, currency, operation) {
    const amountChange = operation === 'add' ? amount : -amount;

    await db.query(
      `INSERT INTO stablecoin_balances (user_id, currency, amount, provider)
       VALUES ($1, $2, $3, 'tempo')
       ON CONFLICT (user_id, currency, provider)
       DO UPDATE SET
         amount = stablecoin_balances.amount + $3,
         last_synced = NOW()`,
      [userId, currency, amountChange]
    );
  }

  /**
   * Helper: Get user balance
   */
  async getBalance(userId) {
    const result = await db.query(
      `SELECT currency, SUM(amount) as total
       FROM stablecoin_balances
       WHERE user_id = $1
       GROUP BY currency`,
      [userId]
    );

    const balances = {};
    let total = 0;

    for (const row of result.rows) {
      balances[row.currency] = parseFloat(row.total);
      total += parseFloat(row.total);
    }

    return { balances, total };
  }
}

// Export singleton instance
let instance;
export default {
  getInstance() {
    if (!instance) {
      instance = new ConsumerWalletService();
    }
    return instance;
  }
};