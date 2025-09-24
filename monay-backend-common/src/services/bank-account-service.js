/**
 * Bank Account Management Service
 * Handles bank account linking, verification, and deposits
 * Consumer Wallet Phase 2 Day 6 Implementation
 */

import db from '../models/index.js';
import dwollaPaymentService from './dwolla-payment.js';
import walletBalanceService from './wallet-balance-service.js';
import realtimeNotifications from './realtime-notifications.js';
import logger from './enhanced-logger.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

class BankAccountService {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(text) {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Link a new bank account
   */
  async linkBankAccount(userId, bankData) {
    const t = await db.sequelize.transaction();

    try {
      // Get user and wallet
      const user = await db.User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' }
      });
      if (!wallet) throw new Error('Wallet not found');

      // Create or get Dwolla customer
      let dwollaCustomerId = user.dwolla_customer_id;

      if (!dwollaCustomerId) {
        const customerResult = await dwollaPaymentService.createCustomer({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          verified: user.kyc_status === 'verified',
          address1: user.address,
          city: user.city,
          state: user.state,
          postalCode: user.postal_code,
          dateOfBirth: user.date_of_birth,
          ssn: user.ssn_last_four
        });

        dwollaCustomerId = customerResult.customerId;

        // Update user with Dwolla customer ID
        await db.User.update(
          { dwolla_customer_id: dwollaCustomerId },
          { where: { id: userId }, transaction: t }
        );
      }

      // Add bank account to Dwolla
      const dwollaResult = await dwollaPaymentService.addBankAccount(
        dwollaCustomerId,
        {
          routingNumber: bankData.routingNumber,
          accountNumber: bankData.accountNumber,
          accountType: bankData.accountType || 'checking',
          accountName: bankData.accountName || `${user.firstName} ${user.lastName}`
        }
      );

      // Store bank account in database
      const bankAccount = await db.sequelize.query(
        `INSERT INTO bank_accounts (
          user_id, wallet_id, dwolla_customer_id, dwolla_funding_source_id,
          bank_name, account_name, account_type, last_four,
          routing_number_encrypted, verification_status, verification_method,
          supports_instant, supports_ach, channels, status
        ) VALUES (
          :userId, :walletId, :dwollaCustomerId, :dwollaFundingSourceId,
          :bankName, :accountName, :accountType, :lastFour,
          :routingNumberEncrypted, :verificationStatus, :verificationMethod,
          :supportsInstant, :supportsAch, :channels, :status
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            dwollaCustomerId,
            dwollaFundingSourceId: dwollaResult.fundingSourceId,
            bankName: bankData.bankName || 'Bank',
            accountName: bankData.accountName,
            accountType: bankData.accountType || 'checking',
            lastFour: bankData.accountNumber.slice(-4),
            routingNumberEncrypted: this.encrypt(bankData.routingNumber),
            verificationStatus: 'pending',
            verificationMethod: bankData.verificationMethod || 'micro_deposits',
            supportsInstant: dwollaResult.supportsInstant || false,
            supportsAch: true,
            channels: JSON.stringify(dwollaResult.channels || ['ACH']),
            status: 'active'
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Create deposit limits for user if not exists
      await db.sequelize.query(
        `INSERT INTO deposit_limits (user_id)
         VALUES (:userId)
         ON CONFLICT (user_id) DO NOTHING`,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // If this is the first bank account, make it primary
      const existingAccounts = await db.sequelize.query(
        `SELECT COUNT(*) as count FROM bank_accounts
         WHERE user_id = :userId AND id != :accountId`,
        {
          replacements: { userId, accountId: bankAccount[0].id },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (existingAccounts[0].count === 0) {
        await db.sequelize.query(
          `UPDATE bank_accounts SET is_primary = true WHERE id = :accountId`,
          {
            replacements: { accountId: bankAccount[0].id },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );
      }

      // Log activity
      await this.logBankAccountActivity(
        bankAccount[0].id,
        userId,
        'ACCOUNT_LINKED',
        'Bank account linked successfully',
        { method: bankData.verificationMethod },
        t
      );

      await t.commit();

      // Start verification process
      if (bankData.verificationMethod === 'micro_deposits') {
        await this.initiateMicroDeposits(bankAccount[0].id);
      }

      // Send notification
      await realtimeNotifications.notifyBankAccountLinked(userId, {
        bankAccountId: bankAccount[0].id,
        bankName: bankAccount[0].bank_name,
        lastFour: bankAccount[0].last_four,
        verificationRequired: bankData.verificationMethod === 'micro_deposits'
      });

      logger.info('Bank account linked successfully', {
        userId,
        bankAccountId: bankAccount[0].id,
        supportsInstant: dwollaResult.supportsInstant
      });

      return {
        success: true,
        bankAccount: {
          id: bankAccount[0].id,
          bankName: bankAccount[0].bank_name,
          accountName: bankAccount[0].account_name,
          accountType: bankAccount[0].account_type,
          lastFour: bankAccount[0].last_four,
          verificationStatus: bankAccount[0].verification_status,
          supportsInstant: bankAccount[0].supports_instant,
          isPrimary: bankAccount[0].is_primary
        },
        verificationRequired: bankData.verificationMethod === 'micro_deposits'
      };

    } catch (error) {
      await t.rollback();
      logger.error('Error linking bank account', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Initiate micro deposit verification
   */
  async initiateMicroDeposits(bankAccountId) {
    try {
      // Generate random micro deposit amounts (1-10 cents)
      const amount1 = Math.floor(Math.random() * 10) + 1;
      const amount2 = Math.floor(Math.random() * 10) + 1;

      // Store micro deposits
      await db.sequelize.query(
        `INSERT INTO micro_deposits (
          bank_account_id, amount_1, amount_2,
          status, sent_at, expires_at
        ) VALUES (
          :bankAccountId, :amount1, :amount2,
          'sent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days'
        )`,
        {
          replacements: { bankAccountId, amount1, amount2 },
          type: db.sequelize.QueryTypes.INSERT
        }
      );

      // Update bank account status
      await db.sequelize.query(
        `UPDATE bank_accounts
         SET verification_status = 'micro_deposits_sent'
         WHERE id = :bankAccountId`,
        {
          replacements: { bankAccountId },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // In production, trigger actual micro deposits via Dwolla
      // For now, we'll simulate it
      logger.info('Micro deposits initiated', {
        bankAccountId,
        amounts: [amount1, amount2]
      });

      return { amount1, amount2 };

    } catch (error) {
      logger.error('Error initiating micro deposits', {
        bankAccountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify micro deposits
   */
  async verifyMicroDeposits(bankAccountId, userId, amounts) {
    try {
      // Get micro deposit record
      const microDeposit = await db.sequelize.query(
        `SELECT * FROM micro_deposits
         WHERE bank_account_id = :bankAccountId
         AND status = 'sent'
         AND expires_at > CURRENT_TIMESTAMP`,
        {
          replacements: { bankAccountId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!microDeposit || microDeposit.length === 0) {
        throw new Error('No pending micro deposits found');
      }

      const deposit = microDeposit[0];

      // Increment attempts
      await db.sequelize.query(
        `UPDATE micro_deposits
         SET verification_attempts = verification_attempts + 1
         WHERE id = :id`,
        {
          replacements: { id: deposit.id },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Check if amounts match
      if (amounts.amount1 === deposit.amount_1 && amounts.amount2 === deposit.amount_2) {
        // Mark as verified
        await db.sequelize.query(
          `UPDATE micro_deposits
           SET status = 'verified', verified = true, verified_at = CURRENT_TIMESTAMP
           WHERE id = :id`,
          {
            replacements: { id: deposit.id },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );

        // Update bank account status
        await db.sequelize.query(
          `UPDATE bank_accounts
           SET verification_status = 'verified', verified_at = CURRENT_TIMESTAMP
           WHERE id = :bankAccountId`,
          {
            replacements: { bankAccountId },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );

        // Log activity
        await this.logBankAccountActivity(
          bankAccountId,
          userId,
          'ACCOUNT_VERIFIED',
          'Bank account verified via micro deposits'
        );

        // Send notification
        await realtimeNotifications.notifyBankAccountVerified(userId, {
          bankAccountId
        });

        logger.info('Bank account verified', { bankAccountId, userId });

        return {
          success: true,
          message: 'Bank account verified successfully'
        };
      } else {
        // Check if max attempts reached
        if (deposit.verification_attempts + 1 >= deposit.max_attempts) {
          await db.sequelize.query(
            `UPDATE micro_deposits SET status = 'failed' WHERE id = :id`,
            {
              replacements: { id: deposit.id },
              type: db.sequelize.QueryTypes.UPDATE
            }
          );

          await db.sequelize.query(
            `UPDATE bank_accounts
             SET verification_status = 'failed'
             WHERE id = :bankAccountId`,
            {
              replacements: { bankAccountId },
              type: db.sequelize.QueryTypes.UPDATE
            }
          );

          throw new Error('Maximum verification attempts exceeded');
        }

        throw new Error('Incorrect amounts. Please try again.');
      }

    } catch (error) {
      logger.error('Error verifying micro deposits', {
        bankAccountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create ACH deposit
   */
  async createDeposit(userId, depositData) {
    const t = await db.sequelize.transaction();

    try {
      // Validate bank account
      const bankAccount = await this.getBankAccount(depositData.bankAccountId, userId);
      if (!bankAccount) {
        throw new Error('Bank account not found');
      }

      if (bankAccount.verification_status !== 'verified') {
        throw new Error('Bank account not verified');
      }

      // Check deposit limits
      const limitCheck = await this.checkDepositLimits(userId, depositData.amount, depositData.type || 'ach');
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason);
      }

      // Get wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' }
      });

      // Determine deposit type and network
      const depositType = depositData.instant && bankAccount.supports_instant ? 'instant' : 'ach';
      const network = depositType === 'instant' ? 'RTP' : 'ACH';

      // Calculate fees
      const feeAmount = this.calculateDepositFee(depositData.amount, depositType);
      const netAmount = depositData.amount - feeAmount;

      // Create deposit record
      const deposit = await db.sequelize.query(
        `INSERT INTO deposits (
          user_id, wallet_id, bank_account_id,
          amount, currency, type, status,
          processing_method, network_used,
          fee_amount, net_amount,
          estimated_completion_at, metadata
        ) VALUES (
          :userId, :walletId, :bankAccountId,
          :amount, :currency, :type, :status,
          :processingMethod, :networkUsed,
          :feeAmount, :netAmount,
          :estimatedCompletionAt, :metadata
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            bankAccountId: bankAccount.id,
            amount: depositData.amount,
            currency: 'USD',
            type: depositType,
            status: 'pending',
            processingMethod: depositType,
            networkUsed: network,
            feeAmount,
            netAmount,
            estimatedCompletionAt: this.getEstimatedCompletionTime(depositType),
            metadata: JSON.stringify(depositData.metadata || {})
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Create Dwolla transfer
      const dwollaTransfer = depositType === 'instant' ?
        await dwollaPaymentService.processInstantPayment({
          sourceFundingSourceId: bankAccount.dwolla_funding_source_id,
          destinationFundingSourceId: wallet.dwolla_funding_source_id,
          amount: netAmount * 100, // Convert to cents
          metadata: { depositId: deposit[0].id },
          correlationId: deposit[0].id
        }) :
        await dwollaPaymentService.processACHPayment({
          sourceFundingSourceId: bankAccount.dwolla_funding_source_id,
          destinationFundingSourceId: wallet.dwolla_funding_source_id,
          amount: netAmount * 100,
          metadata: { depositId: deposit[0].id },
          clearing: depositData.sameDayACH ? 'same-day' : 'standard',
          correlationId: deposit[0].id
        });

      // Update deposit with Dwolla transfer ID
      await db.sequelize.query(
        `UPDATE deposits
         SET dwolla_transfer_id = :transferId,
             dwolla_correlation_id = :correlationId,
             status = 'processing',
             processing_started_at = CURRENT_TIMESTAMP
         WHERE id = :depositId`,
        {
          replacements: {
            transferId: dwollaTransfer.transferId,
            correlationId: dwollaTransfer.correlationId || deposit[0].id,
            depositId: deposit[0].id
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      // Send real-time notification
      await realtimeNotifications.notifyDeposit(userId, {
        id: deposit[0].id,
        amount: depositData.amount,
        method: depositType,
        status: 'processing'
      });

      logger.info('Deposit created', {
        userId,
        depositId: deposit[0].id,
        amount: depositData.amount,
        type: depositType
      });

      return {
        success: true,
        deposit: {
          id: deposit[0].id,
          amount: depositData.amount,
          feeAmount,
          netAmount,
          type: depositType,
          status: 'processing',
          estimatedCompletion: deposit[0].estimated_completion_at,
          dwollaTransferId: dwollaTransfer.transferId
        }
      };

    } catch (error) {
      await t.rollback();
      logger.error('Error creating deposit', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process deposit webhook from Dwolla
   */
  async processDepositWebhook(transferId, status, metadata) {
    const t = await db.sequelize.transaction();

    try {
      // Find deposit by Dwolla transfer ID
      const deposit = await db.sequelize.query(
        `SELECT * FROM deposits WHERE dwolla_transfer_id = :transferId`,
        {
          replacements: { transferId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!deposit || deposit.length === 0) {
        logger.warn('Deposit not found for transfer', { transferId });
        return;
      }

      const depositRecord = deposit[0];

      if (status === 'processed' || status === 'completed') {
        // Update deposit status
        await db.sequelize.query(
          `UPDATE deposits
           SET status = 'completed',
               completed_at = CURRENT_TIMESTAMP,
               actual_completion_time_ms = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - initiated_at)) * 1000
           WHERE id = :depositId`,
          {
            replacements: { depositId: depositRecord.id },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );

        // Update wallet balance
        await walletBalanceService.updateBalance(
          depositRecord.wallet_id,
          depositRecord.net_amount,
          'credit',
          t
        );

        await t.commit();

        // Send notification
        await realtimeNotifications.notifyDeposit(depositRecord.user_id, {
          id: depositRecord.id,
          amount: depositRecord.amount,
          status: 'completed'
        });

        logger.info('Deposit completed', {
          depositId: depositRecord.id,
          amount: depositRecord.amount
        });

      } else if (status === 'failed' || status === 'cancelled') {
        // Update deposit status
        await db.sequelize.query(
          `UPDATE deposits
           SET status = 'failed',
               failed_at = CURRENT_TIMESTAMP,
               failure_reason = :reason
           WHERE id = :depositId`,
          {
            replacements: {
              depositId: depositRecord.id,
              reason: metadata?.failureReason || 'Transfer failed'
            },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );

        await t.commit();

        // Send notification
        await realtimeNotifications.notifyDeposit(depositRecord.user_id, {
          id: depositRecord.id,
          amount: depositRecord.amount,
          status: 'failed'
        });

        logger.error('Deposit failed', {
          depositId: depositRecord.id,
          reason: metadata?.failureReason
        });
      }

    } catch (error) {
      await t.rollback();
      logger.error('Error processing deposit webhook', {
        transferId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user's bank accounts
   */
  async getUserBankAccounts(userId) {
    try {
      const accounts = await db.sequelize.query(
        `SELECT id, bank_name, account_name, account_type, last_four,
                verification_status, supports_instant, is_primary,
                created_at
         FROM bank_accounts
         WHERE user_id = :userId AND status = 'active'
         ORDER BY is_primary DESC, created_at DESC`,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return accounts;

    } catch (error) {
      logger.error('Error getting bank accounts', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get single bank account
   */
  async getBankAccount(bankAccountId, userId) {
    try {
      const account = await db.sequelize.query(
        `SELECT * FROM bank_accounts
         WHERE id = :bankAccountId AND user_id = :userId`,
        {
          replacements: { bankAccountId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return account[0] || null;

    } catch (error) {
      logger.error('Error getting bank account', {
        bankAccountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove bank account
   */
  async removeBankAccount(bankAccountId, userId) {
    try {
      const result = await db.sequelize.query(
        `UPDATE bank_accounts
         SET status = 'removed', removed_at = CURRENT_TIMESTAMP
         WHERE id = :bankAccountId AND user_id = :userId`,
        {
          replacements: { bankAccountId, userId },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      await this.logBankAccountActivity(
        bankAccountId,
        userId,
        'ACCOUNT_REMOVED',
        'Bank account removed'
      );

      logger.info('Bank account removed', { bankAccountId, userId });

      return { success: true };

    } catch (error) {
      logger.error('Error removing bank account', {
        bankAccountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Set primary bank account
   */
  async setPrimaryBankAccount(bankAccountId, userId) {
    try {
      const result = await db.sequelize.query(
        `SELECT set_primary_bank_account(:userId, :bankAccountId) as success`,
        {
          replacements: { userId, bankAccountId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return { success: result[0].success };

    } catch (error) {
      logger.error('Error setting primary bank account', {
        bankAccountId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check deposit limits
   */
  async checkDepositLimits(userId, amount, type) {
    try {
      const limits = await db.sequelize.query(
        `SELECT * FROM deposit_limits WHERE user_id = :userId`,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!limits || limits.length === 0) {
        // Create default limits
        await db.sequelize.query(
          `INSERT INTO deposit_limits (user_id) VALUES (:userId)`,
          {
            replacements: { userId },
            type: db.sequelize.QueryTypes.INSERT
          }
        );
        return { allowed: true };
      }

      const limit = limits[0];

      // Check per transaction limit
      if (type === 'ach' && amount > parseFloat(limit.per_ach_limit)) {
        return {
          allowed: false,
          reason: `Amount exceeds per ACH transaction limit of $${limit.per_ach_limit}`
        };
      }

      if (type === 'instant' && amount > parseFloat(limit.per_instant_limit)) {
        return {
          allowed: false,
          reason: `Amount exceeds per instant deposit limit of $${limit.per_instant_limit}`
        };
      }

      // Check daily limits
      const dailyUsed = type === 'ach' ?
        parseFloat(limit.daily_ach_used) :
        parseFloat(limit.daily_instant_used);

      const dailyLimit = type === 'ach' ?
        parseFloat(limit.daily_ach_limit) :
        parseFloat(limit.daily_instant_limit);

      if (dailyUsed + amount > dailyLimit) {
        return {
          allowed: false,
          reason: `Daily ${type} limit would be exceeded. Remaining: $${dailyLimit - dailyUsed}`
        };
      }

      // Check monthly limits
      const monthlyUsed = type === 'ach' ?
        parseFloat(limit.monthly_ach_used) :
        parseFloat(limit.monthly_instant_used);

      const monthlyLimit = type === 'ach' ?
        parseFloat(limit.monthly_ach_limit) :
        parseFloat(limit.monthly_instant_limit);

      if (monthlyUsed + amount > monthlyLimit) {
        return {
          allowed: false,
          reason: `Monthly ${type} limit would be exceeded. Remaining: $${monthlyLimit - monthlyUsed}`
        };
      }

      return { allowed: true };

    } catch (error) {
      logger.error('Error checking deposit limits', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get deposit history
   */
  async getDepositHistory(userId, filters = {}) {
    try {
      const { limit = 50, offset = 0, status, startDate, endDate } = filters;

      let query = `
        SELECT d.*, ba.bank_name, ba.last_four
        FROM deposits d
        JOIN bank_accounts ba ON d.bank_account_id = ba.id
        WHERE d.user_id = :userId
      `;

      const replacements = { userId, limit, offset };

      if (status) {
        query += ` AND d.status = :status`;
        replacements.status = status;
      }

      if (startDate) {
        query += ` AND d.created_at >= :startDate`;
        replacements.startDate = startDate;
      }

      if (endDate) {
        query += ` AND d.created_at <= :endDate`;
        replacements.endDate = endDate;
      }

      query += ` ORDER BY d.created_at DESC LIMIT :limit OFFSET :offset`;

      const deposits = await db.sequelize.query(query, {
        replacements,
        type: db.sequelize.QueryTypes.SELECT
      });

      return deposits;

    } catch (error) {
      logger.error('Error getting deposit history', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Calculate deposit fee
   */
  calculateDepositFee(amount, type) {
    if (type === 'instant') {
      // 1% fee for instant deposits, min $0.25, max $5
      const fee = amount * 0.01;
      return Math.min(Math.max(fee, 0.25), 5);
    } else if (type === 'ach') {
      // Free for standard ACH
      return 0;
    }
    return 0;
  }

  /**
   * Get estimated completion time
   */
  getEstimatedCompletionTime(type) {
    const now = new Date();
    if (type === 'instant') {
      // Add 1 minute for instant
      return new Date(now.getTime() + 60 * 1000);
    } else if (type === 'ach') {
      // Add 3 business days for ACH
      const days = 3;
      let completionDate = new Date(now);
      let addedDays = 0;

      while (addedDays < days) {
        completionDate.setDate(completionDate.getDate() + 1);
        // Skip weekends
        if (completionDate.getDay() !== 0 && completionDate.getDay() !== 6) {
          addedDays++;
        }
      }

      return completionDate;
    }
    return now;
  }

  /**
   * Log bank account activity
   */
  async logBankAccountActivity(bankAccountId, userId, action, description, metadata = {}, transaction = null) {
    try {
      await db.sequelize.query(
        `INSERT INTO bank_account_activity (
          bank_account_id, user_id, action, description, metadata
        ) VALUES (
          :bankAccountId, :userId, :action, :description, :metadata
        )`,
        {
          replacements: {
            bankAccountId,
            userId,
            action,
            description,
            metadata: JSON.stringify(metadata)
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction
        }
      );
    } catch (error) {
      logger.error('Error logging bank account activity', {
        bankAccountId,
        action,
        error: error.message
      });
    }
  }
}

export default new BankAccountService();