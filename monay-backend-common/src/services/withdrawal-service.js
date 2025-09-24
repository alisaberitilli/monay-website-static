/**
 * Withdrawal Service
 * Consumer Wallet Phase 2 Day 8 Implementation
 * Handles bank withdrawals (ACH/Wire) and instant card payouts
 */

import Stripe from 'stripe';
import db from '../models/index.js';
import dwollaPaymentService from './dwolla-payment.js';
import walletBalanceService from './wallet-balance-service.js';
import realtimeNotificationsService from './realtime-notifications.js';
import logger from './enhanced-logger.js';
import redis from './redis.js';
import crypto from 'crypto';
import {
  ValidationError,
  InsufficientFundsError,
  PaymentError,
  ExternalServiceError,
  RateLimitError,
  SecurityError
} from '../utils/error-handler.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

class WithdrawalService {
  constructor() {
    // Fee structure
    this.fees = {
      bank_ach: {
        standard: { fixed: 0, percentage: 0 }, // Free
        same_day: { fixed: 1.00, percentage: 0 }
      },
      card_instant: {
        instant: { fixed: 0.25, percentage: 0.015, max: 10.00 } // 1.5% + $0.25, max $10
      },
      bank_wire: {
        wire: { fixed: 25.00, percentage: 0 }
      }
    };

    // Limits
    this.limits = {
      minimum: 10.00,
      bank_ach: { min: 10, max: 10000, daily: 10000 },
      card_instant: { min: 10, max: 2500, daily: 2500 },
      bank_wire: { min: 100, max: 100000, daily: 100000 }
    };

    // AML thresholds
    this.amlThresholds = {
      singleTransaction: 5000,
      dailyCumulative: 10000,
      monthlyCumulative: 50000
    };
  }

  /**
   * Create bank withdrawal (ACH)
   */
  async createBankWithdrawal(userId, withdrawalData) {
    const t = await db.sequelize.transaction();

    try {
      const { bankAccountId, amount, method = 'standard' } = withdrawalData;

      // Validate amount
      this.validateWithdrawalAmount(amount, 'bank_ach');

      // Get user's wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' },
        transaction: t
      });

      // Check balance
      const balance = await walletBalanceService.getBalance(wallet.id);
      if (balance.available < amount) {
        throw new InsufficientFundsError(balance.available, amount);
      }

      // Check withdrawal limits
      await this.checkWithdrawalLimits(userId, amount, 'bank_ach', t);

      // Get bank account
      const bankAccount = await db.sequelize.query(
        'SELECT * FROM bank_accounts WHERE id = :bankAccountId AND user_id = :userId AND status = :status',
        {
          replacements: { bankAccountId, userId, status: 'active' },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!bankAccount || bankAccount.length === 0) {
        throw new ValidationError('Bank account not found or inactive');
      }

      const bank = bankAccount[0];

      // Verify bank account is verified
      if (bank.verification_status !== 'verified') {
        throw new ValidationError('Bank account must be verified for withdrawals');
      }

      // Calculate fees
      const fees = this.calculateWithdrawalFees(amount, 'bank_ach', method);

      // Check AML thresholds
      const amlCheck = await this.performAMLCheck(userId, amount);

      // Hold funds in wallet
      await walletBalanceService.holdFunds(wallet.id, amount, t);

      // Create withdrawal record
      const withdrawal = await db.sequelize.query(
        `INSERT INTO withdrawals (
          user_id, wallet_id, amount, currency, type, method,
          destination_type, destination_id, destination_details,
          status, fee_amount, net_amount, risk_score, risk_level,
          aml_check_status, requires_verification, metadata
        ) VALUES (
          :userId, :walletId, :amount, 'USD', 'bank_ach', :method,
          'bank_account', :bankAccountId, :destinationDetails,
          :status, :feeAmount, :netAmount, :riskScore, :riskLevel,
          :amlStatus, :requiresVerification, :metadata
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            amount,
            method,
            bankAccountId,
            destinationDetails: JSON.stringify({
              bankName: bank.bank_name,
              accountType: bank.account_type,
              last4: bank.last_four
            }),
            status: amlCheck.requiresReview ? 'under_review' : 'pending',
            feeAmount: fees.totalFee,
            netAmount: fees.netAmount,
            riskScore: amlCheck.riskScore,
            riskLevel: amlCheck.riskLevel,
            amlStatus: amlCheck.requiresReview ? 'manual_review' : 'passed',
            requiresVerification: amount > 1000, // Require verification for large amounts
            metadata: JSON.stringify({
              ipAddress: withdrawalData.ipAddress,
              userAgent: withdrawalData.userAgent
            })
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Generate verification code if required
      if (withdrawal[0].requires_verification) {
        const verificationCode = this.generateVerificationCode();
        await db.sequelize.query(
          `UPDATE withdrawals
           SET verification_code = :code,
               verification_expires_at = NOW() + INTERVAL '15 minutes'
           WHERE id = :withdrawalId`,
          {
            replacements: { code: verificationCode, withdrawalId: withdrawal[0].id },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );

        // Send verification code via email/SMS
        await this.sendVerificationCode(userId, verificationCode);
      }

      // Log activity
      await this.logWithdrawalActivity(
        withdrawal[0].id,
        userId,
        'withdrawal_initiated',
        { amount, method, bankLast4: bank.last_four },
        t
      );

      await t.commit();

      // Process withdrawal if no review needed and no verification required
      if (!amlCheck.requiresReview && !withdrawal[0].requires_verification) {
        await this.processWithdrawal(withdrawal[0].id);
      }

      // Send notification
      await realtimeNotificationsService.notifyWithdrawal(userId, {
        id: withdrawal[0].id,
        amount,
        method: 'bank',
        status: withdrawal[0].status
      });

      logger.info('Bank withdrawal created', {
        userId,
        withdrawalId: withdrawal[0].id,
        amount,
        requiresReview: amlCheck.requiresReview
      });

      return {
        withdrawalId: withdrawal[0].id,
        amount,
        fees: fees.totalFee,
        netAmount: fees.netAmount,
        status: withdrawal[0].status,
        requiresVerification: withdrawal[0].requires_verification,
        requiresReview: amlCheck.requiresReview,
        estimatedArrival: this.getEstimatedArrival('bank_ach', method)
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error creating bank withdrawal', {
        userId,
        amount: withdrawalData.amount,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Create instant card payout
   */
  async createInstantPayout(userId, payoutData) {
    const t = await db.sequelize.transaction();

    try {
      const { cardTokenId, amount } = payoutData;

      // Validate amount
      this.validateWithdrawalAmount(amount, 'card_instant');

      // Get user's wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' },
        transaction: t
      });

      // Check balance
      const balance = await walletBalanceService.getBalance(wallet.id);
      if (balance.available < amount) {
        throw new InsufficientFundsError(balance.available, amount);
      }

      // Check withdrawal limits
      await this.checkWithdrawalLimits(userId, amount, 'card_instant', t);

      // Get debit card
      const card = await db.sequelize.query(
        `SELECT * FROM card_tokens
         WHERE id = :cardTokenId AND user_id = :userId
         AND status = 'active' AND card_funding = 'debit'`,
        {
          replacements: { cardTokenId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Debit card not found or not eligible for payouts');
      }

      const debitCard = card[0];

      // Calculate fees
      const fees = this.calculateWithdrawalFees(amount, 'card_instant', 'instant');

      // Hold funds
      await walletBalanceService.holdFunds(wallet.id, amount, t);

      // Create Stripe payout
      const payout = await stripe.payouts.create({
        amount: Math.round(fees.netAmount * 100), // Convert to cents
        currency: 'usd',
        destination: debitCard.stripe_payment_method_id,
        method: 'instant',
        metadata: {
          userId,
          walletId: wallet.id
        }
      });

      // Create withdrawal record
      const withdrawal = await db.sequelize.query(
        `INSERT INTO withdrawals (
          user_id, wallet_id, amount, currency, type, method,
          destination_type, destination_id, destination_details,
          status, stripe_payout_id, fee_amount, net_amount,
          metadata
        ) VALUES (
          :userId, :walletId, :amount, 'USD', 'card_instant', 'instant',
          'debit_card', :cardTokenId, :destinationDetails,
          :status, :stripePayoutId, :feeAmount, :netAmount, :metadata
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            amount,
            cardTokenId,
            destinationDetails: JSON.stringify({
              brand: debitCard.card_brand,
              last4: debitCard.card_last4
            }),
            status: payout.status === 'paid' ? 'completed' : 'processing',
            stripePayoutId: payout.id,
            feeAmount: fees.totalFee,
            netAmount: fees.netAmount,
            metadata: JSON.stringify({
              stripePayoutStatus: payout.status,
              ipAddress: payoutData.ipAddress
            })
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Deduct from wallet if instant payout succeeded
      if (payout.status === 'paid') {
        await walletBalanceService.releaseFunds(wallet.id, amount, t);
        await walletBalanceService.updateBalance(wallet.id, -amount, 'withdrawal', t);

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'completed',
               completed_at = CURRENT_TIMESTAMP
           WHERE id = :withdrawalId`,
          {
            replacements: { withdrawalId: withdrawal[0].id },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );
      }

      // Log activity
      await this.logWithdrawalActivity(
        withdrawal[0].id,
        userId,
        'instant_payout_created',
        { amount, cardLast4: debitCard.card_last4 },
        t
      );

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyWithdrawal(userId, {
        id: withdrawal[0].id,
        amount,
        method: 'instant',
        status: withdrawal[0].status
      });

      logger.info('Instant payout created', {
        userId,
        withdrawalId: withdrawal[0].id,
        amount,
        status: payout.status
      });

      return {
        withdrawalId: withdrawal[0].id,
        amount,
        fees: fees.totalFee,
        netAmount: fees.netAmount,
        status: withdrawal[0].status,
        instant: true,
        arrivalTime: payout.status === 'paid' ? 'Completed' : '30 minutes'
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error creating instant payout', {
        userId,
        amount: payoutData.amount,
        error: error.message
      });

      if (error.type === 'StripeInvalidRequestError') {
        throw new PaymentError('Payout failed', {
          code: error.code,
          message: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Verify withdrawal with code
   */
  async verifyWithdrawal(withdrawalId, userId, verificationCode) {
    const t = await db.sequelize.transaction();

    try {
      // Get withdrawal
      const withdrawal = await db.sequelize.query(
        `SELECT * FROM withdrawals
         WHERE id = :withdrawalId AND user_id = :userId
         AND requires_verification = true
         AND status = 'pending'`,
        {
          replacements: { withdrawalId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!withdrawal || withdrawal.length === 0) {
        throw new ValidationError('Withdrawal not found or already processed');
      }

      const withdrawalData = withdrawal[0];

      // Check verification code
      if (withdrawalData.verification_code !== verificationCode) {
        // Increment attempts
        await db.sequelize.query(
          `UPDATE withdrawals
           SET verification_attempts = verification_attempts + 1
           WHERE id = :withdrawalId`,
          {
            replacements: { withdrawalId },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );

        // Check max attempts
        if (withdrawalData.verification_attempts >= 2) {
          // Cancel withdrawal
          await this.cancelWithdrawal(withdrawalId, userId, 'Max verification attempts exceeded');
        }

        throw new ValidationError('Invalid verification code');
      }

      // Check expiration
      if (new Date(withdrawalData.verification_expires_at) < new Date()) {
        throw new ValidationError('Verification code expired');
      }

      // Mark as verified
      await db.sequelize.query(
        `UPDATE withdrawals
         SET verified_at = CURRENT_TIMESTAMP,
             status = 'processing'
         WHERE id = :withdrawalId`,
        {
          replacements: { withdrawalId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      // Process withdrawal
      await this.processWithdrawal(withdrawalId);

      logger.info('Withdrawal verified', {
        withdrawalId,
        userId
      });

      return { success: true, status: 'processing' };
    } catch (error) {
      await t.rollback();

      logger.error('Error verifying withdrawal', {
        withdrawalId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Process withdrawal (execute transfer)
   */
  async processWithdrawal(withdrawalId) {
    const t = await db.sequelize.transaction();

    try {
      // Get withdrawal details
      const withdrawal = await db.sequelize.query(
        'SELECT * FROM withdrawals WHERE id = :withdrawalId',
        {
          replacements: { withdrawalId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!withdrawal || withdrawal.length === 0) {
        throw new ValidationError('Withdrawal not found');
      }

      const withdrawalData = withdrawal[0];

      // Update status to processing
      await db.sequelize.query(
        `UPDATE withdrawals
         SET status = 'processing',
             processing_started_at = CURRENT_TIMESTAMP
         WHERE id = :withdrawalId`,
        {
          replacements: { withdrawalId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Process based on type
      let transferResult;
      if (withdrawalData.type === 'bank_ach') {
        transferResult = await this.processACHWithdrawal(withdrawalData, t);
      } else if (withdrawalData.type === 'bank_wire') {
        transferResult = await this.processWireWithdrawal(withdrawalData, t);
      } else if (withdrawalData.type === 'card_instant') {
        // Already processed during creation for instant payouts
        transferResult = { success: true, transferId: withdrawalData.stripe_payout_id };
      }

      if (transferResult.success) {
        // Deduct from wallet
        await walletBalanceService.releaseFunds(withdrawalData.wallet_id, withdrawalData.amount, t);
        await walletBalanceService.updateBalance(
          withdrawalData.wallet_id,
          -withdrawalData.amount,
          'withdrawal',
          t
        );

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'sent',
               sent_at = CURRENT_TIMESTAMP,
               dwolla_transfer_id = :transferId
           WHERE id = :withdrawalId`,
          {
            replacements: {
              withdrawalId,
              transferId: transferResult.transferId
            },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );

        // Update withdrawal limits
        await this.updateWithdrawalLimitUsage(withdrawalData.user_id, withdrawalData.amount, t);
      }

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyWithdrawal(withdrawalData.user_id, {
        id: withdrawalId,
        amount: withdrawalData.amount,
        method: withdrawalData.type,
        status: 'sent'
      });

      logger.info('Withdrawal processed', {
        withdrawalId,
        amount: withdrawalData.amount,
        type: withdrawalData.type
      });

      return transferResult;
    } catch (error) {
      await t.rollback();

      logger.error('Error processing withdrawal', {
        withdrawalId,
        error: error.message
      });

      // Update withdrawal status to failed
      await db.sequelize.query(
        `UPDATE withdrawals
         SET status = 'failed',
             failed_at = CURRENT_TIMESTAMP,
             failure_reason = :reason
         WHERE id = :withdrawalId`,
        {
          replacements: {
            withdrawalId,
            reason: error.message
          },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      throw error;
    }
  }

  /**
   * Process ACH withdrawal via Dwolla
   */
  async processACHWithdrawal(withdrawalData, transaction) {
    try {
      // Get bank account details
      const bankAccount = await db.sequelize.query(
        'SELECT * FROM bank_accounts WHERE id = :bankAccountId',
        {
          replacements: { bankAccountId: withdrawalData.destination_id },
          type: db.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!bankAccount || bankAccount.length === 0) {
        throw new ValidationError('Bank account not found');
      }

      const bank = bankAccount[0];

      // Create Dwolla transfer
      const transfer = await dwollaPaymentService.createTransfer({
        amount: withdrawalData.net_amount,
        sourceFundingSourceUrl: process.env.DWOLLA_MASTER_FUNDING_SOURCE,
        destinationFundingSourceUrl: bank.dwolla_funding_source_id,
        metadata: {
          withdrawalId: withdrawalData.id,
          userId: withdrawalData.user_id
        }
      });

      logger.info('ACH withdrawal initiated via Dwolla', {
        withdrawalId: withdrawalData.id,
        transferId: transfer.id
      });

      return {
        success: true,
        transferId: transfer.id,
        status: transfer.status
      };
    } catch (error) {
      logger.error('Error processing ACH withdrawal', {
        withdrawalId: withdrawalData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process wire withdrawal
   */
  async processWireWithdrawal(withdrawalData, transaction) {
    try {
      // Wire transfers require manual processing
      // Create a task for operations team
      await db.sequelize.query(
        `INSERT INTO manual_processing_queue (
          type, reference_id, user_id, amount, priority, data
        ) VALUES (
          'wire_withdrawal', :withdrawalId, :userId, :amount, 'high', :data
        )`,
        {
          replacements: {
            withdrawalId: withdrawalData.id,
            userId: withdrawalData.user_id,
            amount: withdrawalData.amount,
            data: JSON.stringify(withdrawalData)
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      logger.info('Wire withdrawal queued for manual processing', {
        withdrawalId: withdrawalData.id
      });

      return {
        success: true,
        transferId: `wire_${withdrawalData.id}`,
        status: 'manual_processing'
      };
    } catch (error) {
      logger.error('Error processing wire withdrawal', {
        withdrawalId: withdrawalData.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Cancel withdrawal
   */
  async cancelWithdrawal(withdrawalId, userId, reason) {
    const t = await db.sequelize.transaction();

    try {
      // Get withdrawal
      const withdrawal = await db.sequelize.query(
        `SELECT * FROM withdrawals
         WHERE id = :withdrawalId AND user_id = :userId
         AND status IN ('pending', 'verifying', 'under_review')`,
        {
          replacements: { withdrawalId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!withdrawal || withdrawal.length === 0) {
        throw new ValidationError('Withdrawal not found or cannot be cancelled');
      }

      const withdrawalData = withdrawal[0];

      // Release held funds
      await walletBalanceService.releaseFunds(withdrawalData.wallet_id, withdrawalData.amount, t);

      // Update withdrawal status
      await db.sequelize.query(
        `UPDATE withdrawals
         SET status = 'cancelled',
             failure_reason = :reason,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :withdrawalId`,
        {
          replacements: { withdrawalId, reason },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Log activity
      await this.logWithdrawalActivity(
        withdrawalId,
        userId,
        'withdrawal_cancelled',
        { reason },
        t
      );

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyWithdrawal(userId, {
        id: withdrawalId,
        amount: withdrawalData.amount,
        status: 'cancelled'
      });

      logger.info('Withdrawal cancelled', {
        withdrawalId,
        userId,
        reason
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error cancelling withdrawal', {
        withdrawalId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(userId, options = {}) {
    const { limit = 50, offset = 0, status, type, startDate, endDate } = options;

    let query = `
      SELECT
        w.id, w.amount, w.fee_amount, w.net_amount,
        w.type, w.method, w.status, w.destination_type,
        w.destination_details, w.requested_at, w.completed_at,
        w.estimated_arrival_date
      FROM withdrawals w
      WHERE w.user_id = :userId
    `;

    const replacements = { userId, limit, offset };

    if (status) {
      query += ' AND w.status = :status';
      replacements.status = status;
    }

    if (type) {
      query += ' AND w.type = :type';
      replacements.type = type;
    }

    if (startDate) {
      query += ' AND w.requested_at >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      query += ' AND w.requested_at <= :endDate';
      replacements.endDate = endDate;
    }

    query += ' ORDER BY w.requested_at DESC LIMIT :limit OFFSET :offset';

    const withdrawals = await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    return withdrawals.map(w => ({
      id: w.id,
      amount: parseFloat(w.amount),
      fees: parseFloat(w.fee_amount),
      netAmount: parseFloat(w.net_amount),
      type: w.type,
      method: w.method,
      status: w.status,
      destination: {
        type: w.destination_type,
        details: w.destination_details
      },
      requestedAt: w.requested_at,
      completedAt: w.completed_at,
      estimatedArrival: w.estimated_arrival_date
    }));
  }

  /**
   * Get withdrawal limits
   */
  async getWithdrawalLimits(userId) {
    const limits = await db.sequelize.query(
      `SELECT * FROM withdrawal_limits WHERE user_id = :userId`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!limits || limits.length === 0) {
      // Return default limits
      return {
        daily: {
          bank: { limit: 10000, used: 0, remaining: 10000 },
          instant: { limit: 2500, used: 0, remaining: 2500 },
          total: { limit: 10000, used: 0, remaining: 10000 }
        },
        weekly: {
          limit: 25000,
          used: 0,
          remaining: 25000
        },
        monthly: {
          limit: 50000,
          used: 0,
          remaining: 50000
        },
        perTransaction: {
          bankACH: { min: 10, max: 10000 },
          instant: { min: 10, max: 2500 },
          wire: { min: 100, max: 100000 }
        }
      };
    }

    const limit = limits[0];
    return {
      daily: {
        bank: {
          limit: parseFloat(limit.daily_bank_limit),
          used: parseFloat(limit.daily_used),
          remaining: parseFloat(limit.daily_bank_limit) - parseFloat(limit.daily_used)
        },
        instant: {
          limit: parseFloat(limit.daily_instant_limit),
          used: parseFloat(limit.daily_used),
          remaining: parseFloat(limit.daily_instant_limit) - parseFloat(limit.daily_used)
        },
        total: {
          limit: parseFloat(limit.daily_total_limit),
          used: parseFloat(limit.daily_used),
          remaining: parseFloat(limit.daily_total_limit) - parseFloat(limit.daily_used)
        }
      },
      weekly: {
        limit: parseFloat(limit.weekly_limit),
        used: parseFloat(limit.weekly_used),
        remaining: parseFloat(limit.weekly_limit) - parseFloat(limit.weekly_used)
      },
      monthly: {
        limit: parseFloat(limit.monthly_limit),
        used: parseFloat(limit.monthly_used),
        remaining: parseFloat(limit.monthly_limit) - parseFloat(limit.monthly_used)
      },
      perTransaction: {
        bankACH: {
          min: parseFloat(limit.minimum_withdrawal),
          max: parseFloat(limit.per_bank_ach_limit)
        },
        instant: {
          min: parseFloat(limit.minimum_withdrawal),
          max: parseFloat(limit.per_instant_limit)
        },
        wire: {
          min: 100,
          max: parseFloat(limit.per_wire_limit)
        }
      }
    };
  }

  /**
   * Validate withdrawal amount
   */
  validateWithdrawalAmount(amount, type) {
    const limits = this.limits[type];

    if (!limits) {
      throw new ValidationError('Invalid withdrawal type');
    }

    if (amount < limits.min) {
      throw new ValidationError(`Minimum withdrawal amount is $${limits.min}`);
    }

    if (amount > limits.max) {
      throw new ValidationError(`Maximum withdrawal amount is $${limits.max}`);
    }

    return true;
  }

  /**
   * Calculate withdrawal fees
   */
  calculateWithdrawalFees(amount, type, method) {
    const feeStructure = this.fees[type]?.[method];

    if (!feeStructure) {
      return { totalFee: 0, netAmount: amount };
    }

    let totalFee = feeStructure.fixed;

    if (feeStructure.percentage) {
      totalFee += amount * feeStructure.percentage;
    }

    if (feeStructure.max && totalFee > feeStructure.max) {
      totalFee = feeStructure.max;
    }

    return {
      fixedFee: feeStructure.fixed,
      percentageFee: amount * (feeStructure.percentage || 0),
      totalFee: Math.round(totalFee * 100) / 100,
      netAmount: Math.round((amount - totalFee) * 100) / 100
    };
  }

  /**
   * Check withdrawal limits
   */
  async checkWithdrawalLimits(userId, amount, type, transaction) {
    // Get or create limits
    const limits = await db.sequelize.query(
      `INSERT INTO withdrawal_limits (user_id)
       VALUES (:userId)
       ON CONFLICT (user_id) DO UPDATE
       SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    const limit = limits[0];

    // Check daily limit
    if (limit.daily_used + amount > limit.daily_total_limit) {
      throw new RateLimitError('Daily withdrawal limit exceeded', {
        limit: limit.daily_total_limit,
        used: limit.daily_used,
        requested: amount
      });
    }

    // Check weekly limit
    if (limit.weekly_used + amount > limit.weekly_limit) {
      throw new RateLimitError('Weekly withdrawal limit exceeded', {
        limit: limit.weekly_limit,
        used: limit.weekly_used,
        requested: amount
      });
    }

    // Check monthly limit
    if (limit.monthly_used + amount > limit.monthly_limit) {
      throw new RateLimitError('Monthly withdrawal limit exceeded', {
        limit: limit.monthly_limit,
        used: limit.monthly_used,
        requested: amount
      });
    }

    return true;
  }

  /**
   * Update withdrawal limit usage
   */
  async updateWithdrawalLimitUsage(userId, amount, transaction) {
    await db.sequelize.query(
      `UPDATE withdrawal_limits
       SET daily_used = daily_used + :amount,
           daily_count = daily_count + 1,
           weekly_used = weekly_used + :amount,
           weekly_count = weekly_count + 1,
           monthly_used = monthly_used + :amount,
           monthly_count = monthly_count + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = :userId`,
      {
        replacements: { userId, amount },
        type: db.sequelize.QueryTypes.UPDATE,
        transaction
      }
    );
  }

  /**
   * Perform AML check
   */
  async performAMLCheck(userId, amount) {
    try {
      const result = await db.sequelize.query(
        'SELECT * FROM check_aml_threshold(:userId::uuid, :amount, NULL::uuid)',
        {
          replacements: { userId, amount },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      const amlResult = result[0];

      logger.info('AML check performed', {
        userId,
        amount,
        requiresReview: amlResult.requires_review,
        riskLevel: amlResult.risk_level
      });

      return {
        requiresReview: amlResult.requires_review,
        riskLevel: amlResult.risk_level,
        riskScore: amlResult.risk_score
      };
    } catch (error) {
      logger.error('Error performing AML check', {
        userId,
        amount,
        error: error.message
      });

      // Default to cautious approach
      return {
        requiresReview: amount > this.amlThresholds.singleTransaction,
        riskLevel: 'medium',
        riskScore: 50
      };
    }
  }

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code
   */
  async sendVerificationCode(userId, code) {
    try {
      // Get user contact info
      const user = await db.User.findByPk(userId);

      // Send via email or SMS
      // TODO: Implement actual sending via email/SMS service

      logger.info('Verification code sent', {
        userId,
        method: user.phone_verified ? 'sms' : 'email'
      });

      return true;
    } catch (error) {
      logger.error('Error sending verification code', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get estimated arrival
   */
  getEstimatedArrival(type, method) {
    const estimates = {
      bank_ach: {
        standard: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        same_day: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      },
      card_instant: {
        instant: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      },
      bank_wire: {
        wire: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      }
    };

    return estimates[type]?.[method] || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  /**
   * Log withdrawal activity
   */
  async logWithdrawalActivity(withdrawalId, userId, action, metadata = {}, transaction = null) {
    await db.sequelize.query(
      `INSERT INTO withdrawal_activity (
        withdrawal_id, user_id, action, description, metadata
      ) VALUES (
        :withdrawalId, :userId, :action, :description, :metadata
      )`,
      {
        replacements: {
          withdrawalId,
          userId,
          action,
          description: this.getActivityDescription(action, metadata),
          metadata: JSON.stringify(metadata)
        },
        type: db.sequelize.QueryTypes.INSERT,
        transaction
      }
    );
  }

  /**
   * Get activity description
   */
  getActivityDescription(action, metadata) {
    const descriptions = {
      withdrawal_initiated: `Withdrawal of $${metadata.amount} initiated`,
      withdrawal_verified: `Withdrawal verified`,
      withdrawal_processing: `Withdrawal processing started`,
      withdrawal_completed: `Withdrawal completed`,
      withdrawal_failed: `Withdrawal failed: ${metadata.reason}`,
      withdrawal_cancelled: `Withdrawal cancelled: ${metadata.reason}`,
      instant_payout_created: `Instant payout of $${metadata.amount} to card ending in ${metadata.cardLast4}`
    };

    return descriptions[action] || action;
  }

  /**
   * Handle Dwolla webhook
   */
  async handleDwollaWebhook(event) {
    try {
      if (event.topic === 'transfer_completed') {
        const transferId = event.resourceId;

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'completed',
               completed_at = CURRENT_TIMESTAMP,
               actual_processing_days = EXTRACT(DAY FROM CURRENT_TIMESTAMP - sent_at)
           WHERE dwolla_transfer_id = :transferId`,
          {
            replacements: { transferId },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );

        // Get withdrawal details for notification
        const withdrawal = await db.sequelize.query(
          'SELECT * FROM withdrawals WHERE dwolla_transfer_id = :transferId',
          {
            replacements: { transferId },
            type: db.sequelize.QueryTypes.SELECT
          }
        );

        if (withdrawal && withdrawal[0]) {
          await realtimeNotificationsService.notifyWithdrawal(withdrawal[0].user_id, {
            id: withdrawal[0].id,
            amount: withdrawal[0].amount,
            status: 'completed'
          });
        }
      } else if (event.topic === 'transfer_failed') {
        const transferId = event.resourceId;

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'failed',
               failed_at = CURRENT_TIMESTAMP,
               failure_reason = 'Transfer failed'
           WHERE dwolla_transfer_id = :transferId`,
          {
            replacements: { transferId },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
      }
    } catch (error) {
      logger.error('Error handling Dwolla webhook for withdrawal', {
        event: event.topic,
        error: error.message
      });
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event) {
    try {
      if (event.type === 'payout.paid') {
        const payout = event.data.object;

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'completed',
               completed_at = CURRENT_TIMESTAMP
           WHERE stripe_payout_id = :payoutId`,
          {
            replacements: { payoutId: payout.id },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
      } else if (event.type === 'payout.failed') {
        const payout = event.data.object;

        // Update withdrawal status
        await db.sequelize.query(
          `UPDATE withdrawals
           SET status = 'failed',
               failed_at = CURRENT_TIMESTAMP,
               failure_reason = :reason
           WHERE stripe_payout_id = :payoutId`,
          {
            replacements: {
              payoutId: payout.id,
              reason: payout.failure_message || 'Payout failed'
            },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook for withdrawal', {
        event: event.type,
        error: error.message
      });
    }
  }
}

// Create singleton instance
const withdrawalService = new WithdrawalService();

export default withdrawalService;