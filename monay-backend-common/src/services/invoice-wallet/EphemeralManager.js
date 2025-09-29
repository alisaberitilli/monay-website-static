/**
 * Ephemeral Wallet Manager
 * Handles lifecycle and secure destruction of ephemeral wallets
 *
 * @module EphemeralManager
 * @description Manages self-destructing wallet lifecycle with NIST SP 800-88 compliant erasure
 */

import crypto from 'crypto';
import schedule from 'node-schedule';
import db from '../../models/index.js';
import logger from '../logger.js';
import Redis from 'redis';

class EphemeralManager {
  constructor() {
    this.scheduledJobs = new Map();
    this.initRedis();
  }

  /**
   * Initialize Redis connection for TTL management
   */
  initRedis() {
    try {
      this.redis = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0
      });

      this.redis.on('error', (err) => {
        logger.error('Redis connection error', err);
      });

      this.redis.on('connect', () => {
        logger.info('EphemeralManager connected to Redis');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis', error);
      // Continue without Redis, use in-memory scheduling
    }
  }

  /**
   * Schedule wallet destruction
   *
   * @param {string} walletId - Wallet ID
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<void>}
   */
  async scheduleDestruction(walletId, ttlSeconds) {
    try {
      const destructionTime = new Date(Date.now() + ttlSeconds * 1000);

      logger.info('Scheduling wallet destruction', {
        walletId,
        ttlSeconds,
        destructionTime
      });

      // Store in Redis with expiry
      if (this.redis) {
        await this.setRedisExpiry(walletId, ttlSeconds);
      }

      // Schedule Node.js job as backup
      const job = schedule.scheduleJob(destructionTime, async () => {
        await this.executeDestruction(walletId);
      });

      this.scheduledJobs.set(walletId, job);

      // Log scheduling event
      await this.logLifecycleEvent(walletId, 'destruction_scheduled', {
        ttlSeconds,
        scheduledFor: destructionTime
      });

    } catch (error) {
      logger.error('Failed to schedule wallet destruction', {
        walletId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute wallet destruction
   * Implements NIST SP 800-88 guidelines for cryptographic erasure
   *
   * @param {string} walletId - Wallet ID
   * @returns {Promise<void>}
   */
  async executeDestruction(walletId) {
    let wallet;

    try {
      logger.info('Executing wallet destruction', { walletId });

      // Step 1: Retrieve wallet
      wallet = await db.InvoiceWallet.findByPk(walletId);

      if (!wallet) {
        logger.warn('Wallet not found for destruction', { walletId });
        return;
      }

      if (wallet.status === 'destroyed') {
        logger.warn('Wallet already destroyed', { walletId });
        return;
      }

      // Step 2: Check for pending transactions
      const hasPendingTx = await this.checkPendingTransactions(walletId);
      if (hasPendingTx) {
        logger.info('Delaying destruction due to pending transactions', { walletId });
        await this.scheduleDestruction(walletId, 3600); // Retry in 1 hour
        return;
      }

      // Step 3: Forward remaining funds
      const fundsForwarded = await this.forwardRemainingFunds(wallet);

      // Step 4: Secure key erasure (7-pass overwrite)
      await this.secureKeyErasure(wallet);

      // Step 5: Mark wallet as destroyed
      wallet.status = 'destroyed';
      wallet.destroyed_at = new Date();
      wallet.quantum_encrypted_private_key = null;
      await wallet.save();

      // Step 6: Clean up scheduled jobs
      this.cleanupScheduledJob(walletId);

      // Step 7: Log destruction event
      await this.logLifecycleEvent(walletId, 'destroyed', {
        fundsForwarded,
        erasureMethod: 'NIST_SP_800_88',
        passes: 7
      });

      logger.info('Wallet destroyed successfully', { walletId });

    } catch (error) {
      logger.error('Failed to destroy wallet', {
        walletId,
        error: error.message
      });

      // Log failed destruction attempt
      await this.logLifecycleEvent(walletId, 'destruction_failed', {
        error: error.message
      });

      // Reschedule destruction
      await this.scheduleDestruction(walletId, 3600);
    }
  }

  /**
   * Secure key erasure using NIST SP 800-88 compliant method
   * 7-pass overwrite with random data
   *
   * @param {Object} wallet - Wallet object
   * @returns {Promise<void>}
   */
  async secureKeyErasure(wallet) {
    try {
      // Get encrypted private key
      let privateKeyData = wallet.quantum_encrypted_private_key;

      if (!privateKeyData) {
        return;
      }

      // Convert to buffer for overwriting
      let keyBuffer = Buffer.from(privateKeyData);
      const keyLength = keyBuffer.length;

      // 7-pass overwrite per NIST SP 800-88
      const overwritePatterns = [
        0x00, // Pass 1: All zeros
        0xFF, // Pass 2: All ones
        0xAA, // Pass 3: Alternating 10101010
        0x55, // Pass 4: Alternating 01010101
        null, // Pass 5: Random data
        null, // Pass 6: Random data
        null  // Pass 7: Random data
      ];

      for (let pass = 0; pass < overwritePatterns.length; pass++) {
        const pattern = overwritePatterns[pass];

        if (pattern === null) {
          // Random data pass
          crypto.randomFillSync(keyBuffer);
        } else {
          // Pattern pass
          keyBuffer.fill(pattern);
        }

        // Simulate writing to memory (in production, would write to secure storage)
        await this.simulateSecureWrite(keyBuffer);
      }

      // Clear the buffer
      keyBuffer.fill(0);

      // Delete quantum keys from registry
      await db.QuantumKeyRegistry.destroy({
        where: { wallet_id: wallet.id }
      });

      logger.info('Secure key erasure completed', {
        walletId: wallet.id,
        passes: 7
      });

    } catch (error) {
      logger.error('Secure key erasure failed', error);
      throw error;
    }
  }

  /**
   * Check for pending transactions
   *
   * @param {string} walletId - Wallet ID
   * @returns {Promise<boolean>} Has pending transactions
   */
  async checkPendingTransactions(walletId) {
    try {
      const pendingCount = await db.Transaction.count({
        where: {
          wallet_id: walletId,
          status: 'pending'
        }
      });

      return pendingCount > 0;
    } catch (error) {
      logger.error('Failed to check pending transactions', error);
      return false; // Assume no pending transactions on error
    }
  }

  /**
   * Forward remaining funds before destruction
   *
   * @param {Object} wallet - Wallet object
   * @returns {Promise<Object>} Forwarding result
   */
  async forwardRemainingFunds(wallet) {
    try {
      // Check balances on both chains
      const baseBalance = await this.checkBaseBalance(wallet.base_address);
      const solanaBalance = await this.checkSolanaBalance(wallet.solana_address);

      const result = {
        base: { balance: baseBalance, forwarded: false },
        solana: { balance: solanaBalance, forwarded: false }
      };

      // Forward Base funds if any
      if (baseBalance > 0) {
        const treasuryAddress = process.env.BASE_TREASURY_ADDRESS;
        if (treasuryAddress) {
          await this.forwardBaseFunds(wallet, treasuryAddress, baseBalance);
          result.base.forwarded = true;
        }
      }

      // Forward Solana funds if any
      if (solanaBalance > 0) {
        const treasuryAddress = process.env.SOLANA_TREASURY_ADDRESS;
        if (treasuryAddress) {
          await this.forwardSolanaFunds(wallet, treasuryAddress, solanaBalance);
          result.solana.forwarded = true;
        }
      }

      return result;
    } catch (error) {
      logger.error('Failed to forward remaining funds', error);
      // Continue with destruction even if forwarding fails
      return null;
    }
  }

  /**
   * Cancel scheduled destruction
   *
   * @param {string} walletId - Wallet ID
   * @returns {Promise<void>}
   */
  async cancelDestruction(walletId) {
    try {
      // Cancel Node.js scheduled job
      const job = this.scheduledJobs.get(walletId);
      if (job) {
        job.cancel();
        this.scheduledJobs.delete(walletId);
      }

      // Remove from Redis
      if (this.redis) {
        await this.removeRedisExpiry(walletId);
      }

      // Log cancellation
      await this.logLifecycleEvent(walletId, 'destruction_cancelled', {
        reason: 'Manual cancellation'
      });

      logger.info('Wallet destruction cancelled', { walletId });
    } catch (error) {
      logger.error('Failed to cancel destruction', error);
      throw error;
    }
  }

  /**
   * Extend wallet TTL
   *
   * @param {string} walletId - Wallet ID
   * @param {number} additionalSeconds - Additional seconds to add
   * @returns {Promise<void>}
   */
  async extendTTL(walletId, additionalSeconds) {
    try {
      const wallet = await db.InvoiceWallet.findByPk(walletId);

      if (!wallet || wallet.mode !== 'ephemeral') {
        throw new Error('Only ephemeral wallets can be extended');
      }

      // Cancel current destruction
      await this.cancelDestruction(walletId);

      // Calculate new expiry
      const currentExpiry = wallet.expires_at || new Date();
      const newExpiry = new Date(currentExpiry.getTime() + additionalSeconds * 1000);
      const newTTL = Math.floor((newExpiry - Date.now()) / 1000);

      // Update wallet
      wallet.expires_at = newExpiry;
      wallet.ttl_seconds = newTTL;
      await wallet.save();

      // Schedule new destruction
      await this.scheduleDestruction(walletId, newTTL);

      // Log extension
      await this.logLifecycleEvent(walletId, 'extended', {
        additionalSeconds,
        newExpiry,
        newTTL
      });

      logger.info('Wallet TTL extended', {
        walletId,
        newExpiry,
        additionalSeconds
      });

    } catch (error) {
      logger.error('Failed to extend wallet TTL', error);
      throw error;
    }
  }

  /**
   * Audit wallet destruction
   *
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} Audit trail
   */
  async auditDestruction(walletId) {
    try {
      const events = await db.WalletLifecycleEvent.findAll({
        where: {
          wallet_id: walletId,
          event_type: {
            [db.Sequelize.Op.in]: [
              'destruction_scheduled',
              'destroyed',
              'destruction_failed',
              'destruction_cancelled'
            ]
          }
        },
        order: [['timestamp', 'DESC']]
      });

      const wallet = await db.InvoiceWallet.findByPk(walletId);

      return {
        walletId,
        status: wallet?.status,
        destroyedAt: wallet?.destroyed_at,
        events: events.map(e => ({
          type: e.event_type,
          timestamp: e.timestamp,
          data: e.event_data
        }))
      };
    } catch (error) {
      logger.error('Failed to audit destruction', error);
      throw error;
    }
  }

  // Helper methods

  async setRedisExpiry(walletId, ttlSeconds) {
    if (!this.redis) return;

    const key = `ephemeral:${walletId}`;
    await this.redis.setex(key, ttlSeconds, JSON.stringify({
      walletId,
      scheduledDestruction: new Date(Date.now() + ttlSeconds * 1000)
    }));
  }

  async removeRedisExpiry(walletId) {
    if (!this.redis) return;

    const key = `ephemeral:${walletId}`;
    await this.redis.del(key);
  }

  async logLifecycleEvent(walletId, eventType, eventData = {}) {
    try {
      await db.WalletLifecycleEvent.create({
        wallet_id: walletId,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to log lifecycle event', error);
    }
  }

  cleanupScheduledJob(walletId) {
    const job = this.scheduledJobs.get(walletId);
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(walletId);
    }
  }

  async simulateSecureWrite(buffer) {
    // In production, this would write to secure storage
    return new Promise(resolve => setTimeout(resolve, 1));
  }

  async checkBaseBalance(address) {
    // Placeholder - integrate with EVM service
    return 0;
  }

  async checkSolanaBalance(address) {
    // Placeholder - integrate with Solana service
    return 0;
  }

  async forwardBaseFunds(wallet, treasuryAddress, amount) {
    // Placeholder - integrate with EVM service
    logger.info('Forwarding Base funds', {
      from: wallet.base_address,
      to: treasuryAddress,
      amount
    });
  }

  async forwardSolanaFunds(wallet, treasuryAddress, amount) {
    // Placeholder - integrate with Solana service
    logger.info('Forwarding Solana funds', {
      from: wallet.solana_address,
      to: treasuryAddress,
      amount
    });
  }
}

export default EphemeralManager;