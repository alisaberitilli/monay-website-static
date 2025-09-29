import pool from '../models/index.js';
import Redis from 'redis';
import EventEmitter from 'events';

class BenefitBalanceTracker extends EventEmitter {
  constructor() {
    super();
    this.redisClient = null;
    this.balanceCache = new Map();
    this.subscriptions = new Map();
    this.pendingTransactions = new Map();
    this.updateQueue = [];
    this.processing = false;
  }

  /**
   * Initialize the balance tracker
   */
  async initialize() {
    try {
      // Connect to Redis for caching
      this.redisClient = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });

      this.redisClient.on('connect', () => {
        console.log('Connected to Redis for balance tracking');
      });

      // Start the update processor
      this.startUpdateProcessor();

      // Initialize balance snapshot job
      this.scheduleBalanceSnapshots();

      console.log('Benefit Balance Tracker initialized');

    } catch (error) {
      console.error('Failed to initialize Balance Tracker:', error);
      // Continue without Redis caching
      this.redisClient = null;
    }
  }

  /**
   * Get real-time balance for a benefit
   */
  async getBalance(benefitId, userId) {
    try {
      // Check cache first
      const cached = await this.getCachedBalance(benefitId);
      if (cached && cached.age < 5000) { // Cache valid for 5 seconds
        return cached.data;
      }

      // Get from database
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT
            gb.id,
            gb.program_type,
            gb.balance_amount as current_balance,
            gb.last_disbursement_date,
            gb.next_disbursement_date,
            gb.last_disbursement_amount,
            gb.total_disbursed,
            COALESCE(
              (SELECT SUM(amount)
               FROM benefit_transactions
               WHERE benefit_id = gb.id
                 AND transaction_type = 'DEBIT'
                 AND status = 'PENDING'),
              0
            ) as pending_debits,
            COALESCE(
              (SELECT SUM(amount)
               FROM benefit_transactions
               WHERE benefit_id = gb.id
                 AND transaction_type = 'CREDIT'
                 AND status = 'PENDING'),
              0
            ) as pending_credits,
            COALESCE(
              (SELECT SUM(amount)
               FROM benefit_transactions
               WHERE benefit_id = gb.id
                 AND transaction_type = 'DEBIT'
                 AND transaction_date >= DATE_TRUNC('day', CURRENT_DATE)),
              0
            ) as daily_spent,
            COALESCE(
              (SELECT SUM(amount)
               FROM benefit_transactions
               WHERE benefit_id = gb.id
                 AND transaction_type = 'DEBIT'
                 AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)),
              0
            ) as monthly_spent,
            COALESCE(
              (SELECT COUNT(*)
               FROM benefit_transactions
               WHERE benefit_id = gb.id
                 AND transaction_date >= DATE_TRUNC('day', CURRENT_DATE)),
              0
            ) as daily_transaction_count
           FROM government_benefits gb
           WHERE gb.id = $1 AND gb.user_id = $2`,
          [benefitId, userId]
        );

        if (result.rows.length === 0) {
          throw new Error('Benefit not found');
        }

        const balance = result.rows[0];

        // Calculate available balance
        balance.available_balance = balance.current_balance - balance.pending_debits;

        // Get velocity limits
        const limits = await this.getVelocityLimits(balance.program_type, client);
        balance.limits = limits;

        // Check if approaching limits
        balance.warnings = this.checkBalanceWarnings(balance, limits);

        // Get recent transactions
        const transactionsResult = await client.query(
          `SELECT
            id,
            transaction_type,
            amount,
            merchant_info,
            status,
            transaction_date
           FROM benefit_transactions
           WHERE benefit_id = $1
           ORDER BY transaction_date DESC
           LIMIT 5`,
          [benefitId]
        );

        balance.recent_transactions = transactionsResult.rows;

        // Cache the balance
        await this.cacheBalance(benefitId, balance);

        return balance;

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get aggregated balance across all benefits for a user
   */
  async getAggregatedBalance(userId) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          gb.program_type,
          gb.balance_amount,
          gb.status,
          COALESCE(
            (SELECT SUM(amount)
             FROM benefit_transactions
             WHERE benefit_id = gb.id
               AND status = 'PENDING'),
            0
          ) as pending_amount
         FROM government_benefits gb
         WHERE gb.user_id = $1 AND gb.status = 'ACTIVE'`,
        [userId]
      );

      const aggregated = {
        total_balance: 0,
        total_available: 0,
        total_pending: 0,
        programs: {}
      };

      for (const row of result.rows) {
        aggregated.total_balance += parseFloat(row.balance_amount);
        aggregated.total_available += parseFloat(row.balance_amount) - parseFloat(row.pending_amount);
        aggregated.total_pending += parseFloat(row.pending_amount);

        aggregated.programs[row.program_type] = {
          balance: row.balance_amount,
          available: parseFloat(row.balance_amount) - parseFloat(row.pending_amount),
          pending: row.pending_amount
        };
      }

      return aggregated;

    } finally {
      client.release();
    }
  }

  /**
   * Track a pending transaction
   */
  async trackPendingTransaction(benefitId, transactionId, amount, type = 'DEBIT') {
    const key = `${benefitId}:${transactionId}`;

    this.pendingTransactions.set(key, {
      benefit_id: benefitId,
      transaction_id: transactionId,
      amount: amount,
      type: type,
      created_at: Date.now(),
      status: 'PENDING'
    });

    // Update available balance immediately
    await this.updateAvailableBalance(benefitId, amount, type);

    // Emit event for real-time updates
    this.emit('pending_transaction', {
      benefit_id: benefitId,
      transaction_id: transactionId,
      amount: amount,
      type: type
    });

    // Set timeout to auto-release if not confirmed
    setTimeout(() => {
      this.releasePendingTransaction(benefitId, transactionId);
    }, 300000); // 5 minutes timeout
  }

  /**
   * Confirm a pending transaction
   */
  async confirmTransaction(benefitId, transactionId, finalAmount = null) {
    const key = `${benefitId}:${transactionId}`;
    const pending = this.pendingTransactions.get(key);

    if (!pending) {
      console.warn(`No pending transaction found: ${key}`);
      return;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update transaction status
      await client.query(
        `UPDATE benefit_transactions
         SET status = 'COMPLETED',
             amount = COALESCE($1, amount),
             completed_at = NOW()
         WHERE id = $2`,
        [finalAmount, transactionId]
      );

      // Update benefit balance if amount changed
      if (finalAmount && finalAmount !== pending.amount) {
        const difference = finalAmount - pending.amount;
        await client.query(
          `UPDATE government_benefits
           SET balance_amount = balance_amount + $1
           WHERE id = $2`,
          [pending.type === 'DEBIT' ? -difference : difference, benefitId]
        );
      }

      await client.query('COMMIT');

      // Remove from pending
      this.pendingTransactions.delete(key);

      // Clear cache to force refresh
      await this.invalidateCache(benefitId);

      // Emit confirmation event
      this.emit('transaction_confirmed', {
        benefit_id: benefitId,
        transaction_id: transactionId,
        amount: finalAmount || pending.amount
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error confirming transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Release a pending transaction (timeout or cancellation)
   */
  async releasePendingTransaction(benefitId, transactionId) {
    const key = `${benefitId}:${transactionId}`;
    const pending = this.pendingTransactions.get(key);

    if (!pending) {
      return;
    }

    const client = await pool.connect();
    try {
      // Check if transaction was completed
      const result = await client.query(
        `SELECT status FROM benefit_transactions WHERE id = $1`,
        [transactionId]
      );

      if (result.rows.length > 0 && result.rows[0].status === 'COMPLETED') {
        // Transaction was completed, just clean up
        this.pendingTransactions.delete(key);
        return;
      }

      // Cancel the transaction
      await client.query(
        `UPDATE benefit_transactions
         SET status = 'CANCELLED',
             cancelled_at = NOW(),
             cancellation_reason = 'TIMEOUT'
         WHERE id = $1 AND status = 'PENDING'`,
        [transactionId]
      );

      // Restore available balance
      await this.updateAvailableBalance(benefitId, -pending.amount, pending.type);

      // Remove from pending
      this.pendingTransactions.delete(key);

      // Emit cancellation event
      this.emit('transaction_cancelled', {
        benefit_id: benefitId,
        transaction_id: transactionId,
        reason: 'TIMEOUT'
      });

    } catch (error) {
      console.error('Error releasing pending transaction:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Update available balance for pending transactions
   */
  async updateAvailableBalance(benefitId, amount, type) {
    const cached = await this.getCachedBalance(benefitId);
    if (cached) {
      if (type === 'DEBIT') {
        cached.data.available_balance -= amount;
        cached.data.pending_debits += amount;
      } else {
        cached.data.available_balance += amount;
        cached.data.pending_credits += amount;
      }
      await this.cacheBalance(benefitId, cached.data);
    }

    // Queue database update
    this.queueBalanceUpdate({
      benefit_id: benefitId,
      amount: amount,
      type: type,
      timestamp: Date.now()
    });
  }

  /**
   * Queue balance update for batch processing
   */
  queueBalanceUpdate(update) {
    this.updateQueue.push(update);

    // Process immediately if not already processing
    if (!this.processing) {
      this.processUpdateQueue();
    }
  }

  /**
   * Process queued balance updates
   */
  async processUpdateQueue() {
    if (this.processing || this.updateQueue.length === 0) {
      return;
    }

    this.processing = true;
    const client = await pool.connect();

    try {
      while (this.updateQueue.length > 0) {
        const batch = this.updateQueue.splice(0, 100); // Process in batches of 100

        await client.query('BEGIN');

        for (const update of batch) {
          // Update database balance
          await client.query(
            `INSERT INTO balance_updates
             (benefit_id, amount, update_type, processed_at)
             VALUES ($1, $2, $3, NOW())`,
            [update.benefit_id, update.amount, update.type]
          );
        }

        await client.query('COMMIT');
      }

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing balance updates:', error);
      // Re-queue failed updates
      this.updateQueue.unshift(...batch);
    } finally {
      this.processing = false;
      client.release();
    }
  }

  /**
   * Start continuous update processor
   */
  startUpdateProcessor() {
    setInterval(() => {
      if (this.updateQueue.length > 0) {
        this.processUpdateQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Subscribe to balance updates via WebSocket
   */
  subscribeToBalance(benefitId, userId, socketId) {
    const key = `${benefitId}:${userId}`;

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }

    this.subscriptions.get(key).add(socketId);

    // Send initial balance
    this.getBalance(benefitId, userId).then(balance => {
      this.emit('balance_update', {
        socket_id: socketId,
        benefit_id: benefitId,
        balance: balance
      });
    });

    return () => this.unsubscribeFromBalance(benefitId, userId, socketId);
  }

  /**
   * Unsubscribe from balance updates
   */
  unsubscribeFromBalance(benefitId, userId, socketId) {
    const key = `${benefitId}:${userId}`;
    const sockets = this.subscriptions.get(key);

    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.subscriptions.delete(key);
      }
    }
  }

  /**
   * Broadcast balance update to subscribers
   */
  async broadcastBalanceUpdate(benefitId) {
    // Get all subscriptions for this benefit
    for (const [key, sockets] of this.subscriptions) {
      if (key.startsWith(`${benefitId}:`)) {
        const [, userId] = key.split(':');
        const balance = await this.getBalance(benefitId, userId);

        for (const socketId of sockets) {
          this.emit('balance_update', {
            socket_id: socketId,
            benefit_id: benefitId,
            balance: balance
          });
        }
      }
    }
  }

  /**
   * Get velocity limits for a program
   */
  async getVelocityLimits(programType, client) {
    const result = await client.query(
      `SELECT * FROM program_velocity_limits WHERE program_type = $1`,
      [programType]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Default limits
    const defaults = {
      SNAP: {
        daily_limit: 200,
        monthly_limit: null,
        transaction_limit: 50,
        daily_transaction_count: 10
      },
      TANF: {
        daily_limit: 500,
        monthly_limit: null,
        transaction_limit: 500,
        daily_transaction_count: 20
      },
      WIC: {
        daily_limit: 100,
        monthly_limit: null,
        transaction_limit: 100,
        daily_transaction_count: 5
      },
      UI: {
        daily_limit: null,
        monthly_limit: null,
        transaction_limit: null,
        daily_transaction_count: null
      }
    };

    return defaults[programType] || {
      daily_limit: 1000,
      monthly_limit: null,
      transaction_limit: 500,
      daily_transaction_count: 50
    };
  }

  /**
   * Check for balance warnings
   */
  checkBalanceWarnings(balance, limits) {
    const warnings = [];

    // Low balance warning
    if (balance.current_balance < 50) {
      warnings.push({
        type: 'LOW_BALANCE',
        message: 'Balance is running low',
        severity: 'medium'
      });
    }

    // Near daily limit
    if (limits.daily_limit && balance.daily_spent > limits.daily_limit * 0.8) {
      warnings.push({
        type: 'NEAR_DAILY_LIMIT',
        message: `Approaching daily spending limit ($${balance.daily_spent}/$${limits.daily_limit})`,
        severity: 'high'
      });
    }

    // High transaction velocity
    if (limits.daily_transaction_count && balance.daily_transaction_count > limits.daily_transaction_count * 0.8) {
      warnings.push({
        type: 'HIGH_VELOCITY',
        message: 'Unusually high transaction activity',
        severity: 'medium'
      });
    }

    // Pending transactions
    if (balance.pending_debits > balance.available_balance * 0.5) {
      warnings.push({
        type: 'HIGH_PENDING',
        message: 'Large amount in pending transactions',
        severity: 'low'
      });
    }

    return warnings;
  }

  /**
   * Schedule balance snapshots for reporting
   */
  scheduleBalanceSnapshots() {
    // Take snapshots every hour
    setInterval(async () => {
      await this.takeBalanceSnapshot();
    }, 3600000); // 1 hour
  }

  /**
   * Take a snapshot of all balances
   */
  async takeBalanceSnapshot() {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO balance_snapshots (benefit_id, balance_amount, snapshot_date)
         SELECT id, balance_amount, NOW()
         FROM government_benefits
         WHERE status = 'ACTIVE'`
      );

      console.log('Balance snapshot taken');

    } catch (error) {
      console.error('Error taking balance snapshot:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Get balance history
   */
  async getBalanceHistory(benefitId, days = 30) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          DATE_TRUNC('day', snapshot_date) as date,
          AVG(balance_amount) as average_balance,
          MIN(balance_amount) as min_balance,
          MAX(balance_amount) as max_balance
         FROM balance_snapshots
         WHERE benefit_id = $1
           AND snapshot_date >= CURRENT_DATE - INTERVAL '%s days'
         GROUP BY DATE_TRUNC('day', snapshot_date)
         ORDER BY date DESC`,
        [benefitId, days]
      );

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Cache balance data
   */
  async cacheBalance(benefitId, balance) {
    if (!this.redisClient) {
      // Use in-memory cache if Redis not available
      this.balanceCache.set(benefitId, {
        data: balance,
        age: Date.now()
      });
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        this.redisClient.setex(
          `balance:${benefitId}`,
          10, // TTL 10 seconds
          JSON.stringify(balance),
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } catch (error) {
      console.error('Error caching balance:', error);
    }
  }

  /**
   * Get cached balance
   */
  async getCachedBalance(benefitId) {
    if (!this.redisClient) {
      // Use in-memory cache
      const cached = this.balanceCache.get(benefitId);
      if (cached) {
        return {
          data: cached.data,
          age: Date.now() - cached.age
        };
      }
      return null;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        this.redisClient.get(`balance:${benefitId}`, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      if (data) {
        return {
          data: JSON.parse(data),
          age: 0 // Redis handles TTL
        };
      }
    } catch (error) {
      console.error('Error getting cached balance:', error);
    }

    return null;
  }

  /**
   * Invalidate cached balance
   */
  async invalidateCache(benefitId) {
    if (!this.redisClient) {
      this.balanceCache.delete(benefitId);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        this.redisClient.del(`balance:${benefitId}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }

    // Also broadcast update to subscribers
    await this.broadcastBalanceUpdate(benefitId);
  }

  /**
   * Shutdown the balance tracker
   */
  shutdown() {
    if (this.redisClient) {
      this.redisClient.quit();
    }
    this.balanceCache.clear();
    this.subscriptions.clear();
    this.pendingTransactions.clear();
    this.updateQueue = [];
  }
}

// Export singleton instance
export default new BenefitBalanceTracker();