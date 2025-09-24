/**
 * Card Payment Service with Stripe Integration
 * Consumer Wallet Phase 2 Day 7 Implementation
 * Handles card tokenization, 3D Secure, and instant deposits
 */

import Stripe from 'stripe';
import db from '../models/index.js';
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
  RateLimitError
} from '../utils/error-handler.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
  timeout: 30000
});

class CardPaymentService {
  constructor() {
    this.feePercentage = 0.029; // 2.9%
    this.fixedFee = 0.30; // 30 cents
    this.maxFee = 10.00; // Cap at $10
    this.minDeposit = 10.00;
    this.maxDeposit = 2500.00;
  }

  /**
   * Create or retrieve Stripe customer for user
   */
  async ensureStripeCustomer(userId) {
    try {
      // Check if user already has Stripe customer ID
      const user = await db.User.findByPk(userId);

      if (user.stripe_customer_id) {
        return user.stripe_customer_id;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        metadata: { userId },
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone_number
      });

      // Save customer ID to database
      await db.User.update(
        { stripe_customer_id: customer.id },
        { where: { id: userId } }
      );

      logger.info('Stripe customer created', {
        userId,
        customerId: customer.id
      });

      return customer.id;
    } catch (error) {
      logger.error('Error ensuring Stripe customer', {
        userId,
        error: error.message
      });
      throw new ExternalServiceError('Failed to create payment profile', {
        service: 'Stripe',
        operation: 'customer_creation'
      });
    }
  }

  /**
   * Add a new card (tokenization)
   */
  async addCard(userId, cardData) {
    const t = await db.sequelize.transaction();

    try {
      // Ensure Stripe customer exists
      const stripeCustomerId = await this.ensureStripeCustomer(userId);

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardData.cardNumber,
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          cvc: cardData.cvc
        },
        billing_details: {
          name: cardData.cardholderName,
          address: {
            postal_code: cardData.billingZip
          }
        }
      });

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId
      });

      // Store tokenized card in database
      const cardToken = await db.sequelize.query(
        `INSERT INTO card_tokens (
          user_id, stripe_payment_method_id, stripe_customer_id,
          card_brand, card_last4, card_exp_month, card_exp_year,
          card_country, card_funding, card_nickname, cardholder_name,
          billing_zip, three_ds_supported, cvc_check, status
        ) VALUES (
          :userId, :paymentMethodId, :customerId,
          :brand, :last4, :expMonth, :expYear,
          :country, :funding, :nickname, :cardholderName,
          :billingZip, :threeDsSupported, :cvcCheck, 'active'
        ) RETURNING *`,
        {
          replacements: {
            userId,
            paymentMethodId: paymentMethod.id,
            customerId: stripeCustomerId,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
            country: paymentMethod.card.country,
            funding: paymentMethod.card.funding,
            nickname: cardData.nickname || `${paymentMethod.card.brand} ${paymentMethod.card.last4}`,
            cardholderName: cardData.cardholderName,
            billingZip: cardData.billingZip,
            threeDsSupported: paymentMethod.card.three_d_secure_usage?.supported || false,
            cvcCheck: paymentMethod.card.checks?.cvc_check || 'unchecked'
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Set as primary if first card
      const cardCount = await db.sequelize.query(
        'SELECT COUNT(*) as count FROM card_tokens WHERE user_id = :userId AND status = :status',
        {
          replacements: { userId, status: 'active' },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (parseInt(cardCount[0].count) === 1) {
        await db.sequelize.query(
          'UPDATE card_tokens SET is_primary = true WHERE id = :cardId',
          {
            replacements: { cardId: cardToken[0].id },
            type: db.sequelize.QueryTypes.UPDATE,
            transaction: t
          }
        );
      }

      // Log activity
      await this.logCardActivity(cardToken[0].id, userId, 'card_added', {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4
      }, t);

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyCardActivity(userId, {
        transactionId: cardToken[0].id,
        cardLast4: paymentMethod.card.last4,
        type: 'card_added',
        status: 'success'
      });

      logger.info('Card added successfully', {
        userId,
        cardId: cardToken[0].id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4
      });

      return {
        id: cardToken[0].id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        nickname: cardToken[0].card_nickname,
        isPrimary: cardToken[0].is_primary
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error adding card', {
        userId,
        error: error.message
      });

      if (error.type === 'StripeCardError') {
        throw new PaymentError('Card validation failed', {
          code: error.code,
          message: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Create card deposit with 3D Secure
   */
  async createCardDeposit(userId, depositData) {
    const t = await db.sequelize.transaction();

    try {
      const { cardTokenId, amount, saveCard } = depositData;

      // Validate amount
      if (amount < this.minDeposit || amount > this.maxDeposit) {
        throw new ValidationError(`Amount must be between $${this.minDeposit} and $${this.maxDeposit}`);
      }

      // Check deposit limits
      await this.checkDepositLimits(userId, amount);

      // Get card token
      const cardToken = await db.sequelize.query(
        'SELECT * FROM card_tokens WHERE id = :cardTokenId AND user_id = :userId AND status = :status',
        {
          replacements: { cardTokenId, userId, status: 'active' },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!cardToken || cardToken.length === 0) {
        throw new ValidationError('Card not found or inactive');
      }

      const card = cardToken[0];

      // Get user's wallet
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' }
      });

      // Calculate fees
      const fees = this.calculateFees(amount);

      // Create payment intent with 3D Secure
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: card.stripe_customer_id,
        payment_method: card.stripe_payment_method_id,
        confirmation_method: 'automatic',
        capture_method: 'automatic',
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic' // Stripe decides based on risk
          }
        },
        metadata: {
          userId,
          walletId: wallet.id,
          cardTokenId: card.id,
          depositType: 'card_instant'
        },
        description: `Deposit to wallet for user ${userId}`,
        statement_descriptor_suffix: 'DEPOSIT'
      });

      // Create deposit record
      const deposit = await db.sequelize.query(
        `INSERT INTO card_deposits (
          user_id, wallet_id, card_token_id,
          amount, currency, stripe_payment_intent_id,
          client_secret, status, fee_amount,
          fee_percentage, fixed_fee, net_amount,
          three_ds_status, metadata
        ) VALUES (
          :userId, :walletId, :cardTokenId,
          :amount, 'USD', :paymentIntentId,
          :clientSecret, :status, :feeAmount,
          :feePercentage, :fixedFee, :netAmount,
          :threeDsStatus, :metadata
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            cardTokenId: card.id,
            amount,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            status: paymentIntent.status === 'requires_action' ? 'requires_action' : 'processing',
            feeAmount: fees.totalFee,
            feePercentage: this.feePercentage,
            fixedFee: this.fixedFee,
            netAmount: fees.netAmount,
            threeDsStatus: paymentIntent.status === 'requires_action' ? 'processing' : 'not_required',
            metadata: JSON.stringify({ saveCard, ipAddress: depositData.ipAddress })
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Log activity
      await this.logCardActivity(card.id, userId, 'deposit_initiated', {
        amount,
        depositId: deposit[0].id
      }, t);

      await t.commit();

      // Process payment if no 3DS required
      if (paymentIntent.status !== 'requires_action') {
        await this.processPaymentCompletion(deposit[0].id, paymentIntent.id);
      }

      logger.info('Card deposit initiated', {
        userId,
        depositId: deposit[0].id,
        amount,
        requires3ds: paymentIntent.status === 'requires_action'
      });

      return {
        depositId: deposit[0].id,
        amount,
        fees: fees.totalFee,
        netAmount: fees.netAmount,
        status: deposit[0].status,
        requires3ds: paymentIntent.status === 'requires_action',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error creating card deposit', {
        userId,
        amount,
        error: error.message
      });

      if (error.type === 'StripeCardError') {
        throw new PaymentError('Payment failed', {
          code: error.code,
          declineCode: error.decline_code,
          message: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Handle 3D Secure authentication completion
   */
  async complete3DSAuthentication(depositId, userId) {
    const t = await db.sequelize.transaction();

    try {
      // Get deposit details
      const deposit = await db.sequelize.query(
        'SELECT * FROM card_deposits WHERE id = :depositId AND user_id = :userId',
        {
          replacements: { depositId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!deposit || deposit.length === 0) {
        throw new ValidationError('Deposit not found');
      }

      const depositData = deposit[0];

      // Check payment intent status
      const paymentIntent = await stripe.paymentIntents.retrieve(
        depositData.stripe_payment_intent_id
      );

      // Log 3DS authentication
      await db.sequelize.query(
        `INSERT INTO three_ds_authentications (
          card_deposit_id, user_id, version, method,
          status, authentication_id, liability_shift,
          completed_at
        ) VALUES (
          :depositId, :userId, '2.0', :method,
          :status, :authId, :liabilityShift,
          CURRENT_TIMESTAMP
        )`,
        {
          replacements: {
            depositId,
            userId,
            method: paymentIntent.charges?.data[0]?.payment_method_details?.card?.three_d_secure?.authentication_flow || 'none',
            status: paymentIntent.status === 'succeeded' ? 'authenticated' : 'failed',
            authId: paymentIntent.id,
            liabilityShift: paymentIntent.charges?.data[0]?.payment_method_details?.card?.three_d_secure?.succeeded || false
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Update deposit status
      await db.sequelize.query(
        `UPDATE card_deposits
         SET status = :status,
             three_ds_status = :threeDsStatus,
             authenticated_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :depositId`,
        {
          replacements: {
            depositId,
            status: paymentIntent.status === 'succeeded' ? 'processing' : 'failed',
            threeDsStatus: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed'
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      // Process successful payment
      if (paymentIntent.status === 'succeeded') {
        await this.processPaymentCompletion(depositId, paymentIntent.id);
      }

      logger.info('3DS authentication completed', {
        depositId,
        status: paymentIntent.status,
        authenticated: paymentIntent.status === 'succeeded'
      });

      return {
        success: paymentIntent.status === 'succeeded',
        depositId,
        status: depositData.status
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error completing 3DS authentication', {
        depositId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Process payment completion (after 3DS or direct)
   */
  async processPaymentCompletion(depositId, paymentIntentId) {
    const t = await db.sequelize.transaction();

    try {
      // Get payment intent details
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new PaymentError('Payment not completed');
      }

      // Get deposit details
      const deposit = await db.sequelize.query(
        'SELECT * FROM card_deposits WHERE id = :depositId',
        {
          replacements: { depositId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      const depositData = deposit[0];

      // Update wallet balance
      await walletBalanceService.updateBalance(
        depositData.wallet_id,
        depositData.net_amount,
        'card_deposit',
        t
      );

      // Update deposit status
      await db.sequelize.query(
        `UPDATE card_deposits
         SET status = 'succeeded',
             stripe_charge_id = :chargeId,
             processed_at = CURRENT_TIMESTAMP,
             completed_at = CURRENT_TIMESTAMP,
             processing_time_ms = :processingTime,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :depositId`,
        {
          replacements: {
            depositId,
            chargeId: paymentIntent.charges.data[0].id,
            processingTime: Date.now() - new Date(depositData.initiated_at).getTime()
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Update card usage stats
      await db.sequelize.query(
        `UPDATE card_tokens
         SET last_used_at = CURRENT_TIMESTAMP,
             use_count = use_count + 1,
             total_amount_processed = total_amount_processed + :amount
         WHERE id = :cardTokenId`,
        {
          replacements: {
            cardTokenId: depositData.card_token_id,
            amount: depositData.amount
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Update deposit limits usage
      await this.updateDepositLimitUsage(depositData.user_id, depositData.amount, t);

      await t.commit();

      // Send notifications
      await realtimeNotificationsService.notifyDeposit(depositData.user_id, {
        id: depositId,
        amount: depositData.amount,
        method: 'card',
        status: 'completed'
      });

      // Refresh balance
      await realtimeNotificationsService.refreshUserBalance(depositData.user_id);

      logger.info('Card deposit completed', {
        depositId,
        userId: depositData.user_id,
        amount: depositData.amount,
        netAmount: depositData.net_amount
      });

      return {
        success: true,
        depositId,
        amount: depositData.amount,
        netAmount: depositData.net_amount
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error processing payment completion', {
        depositId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get user's cards
   */
  async getUserCards(userId) {
    try {
      const cards = await db.sequelize.query(
        `SELECT
          id, card_brand, card_last4, card_exp_month, card_exp_year,
          card_nickname, is_primary, card_funding, last_used_at,
          created_at
         FROM card_tokens
         WHERE user_id = :userId AND status = 'active'
         ORDER BY is_primary DESC, created_at DESC`,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return cards.map(card => ({
        id: card.id,
        brand: card.card_brand,
        last4: card.card_last4,
        expMonth: card.card_exp_month,
        expYear: card.card_exp_year,
        nickname: card.card_nickname,
        isPrimary: card.is_primary,
        funding: card.card_funding,
        lastUsed: card.last_used_at,
        addedAt: card.created_at
      }));
    } catch (error) {
      logger.error('Error getting user cards', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove card
   */
  async removeCard(cardTokenId, userId) {
    const t = await db.sequelize.transaction();

    try {
      // Verify ownership
      const card = await db.sequelize.query(
        'SELECT * FROM card_tokens WHERE id = :cardTokenId AND user_id = :userId',
        {
          replacements: { cardTokenId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      // Detach from Stripe
      await stripe.paymentMethods.detach(card[0].stripe_payment_method_id);

      // Soft delete card
      await db.sequelize.query(
        `UPDATE card_tokens
         SET status = 'inactive',
             deleted_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardTokenId`,
        {
          replacements: { cardTokenId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Log activity
      await this.logCardActivity(cardTokenId, userId, 'card_removed', {
        brand: card[0].card_brand,
        last4: card[0].card_last4
      }, t);

      await t.commit();

      logger.info('Card removed', {
        userId,
        cardTokenId,
        brand: card[0].card_brand,
        last4: card[0].card_last4
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error removing card', {
        cardTokenId,
        userId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Set primary card
   */
  async setPrimaryCard(cardTokenId, userId) {
    const t = await db.sequelize.transaction();

    try {
      await db.sequelize.query(
        'SELECT set_primary_card(:userId::uuid, :cardTokenId::uuid)',
        {
          replacements: { userId, cardTokenId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      await t.commit();

      logger.info('Primary card updated', {
        userId,
        cardTokenId
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error setting primary card', {
        cardTokenId,
        userId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Calculate fees for card deposit
   */
  calculateFees(amount) {
    const percentageFee = amount * this.feePercentage;
    let totalFee = percentageFee + this.fixedFee;

    // Cap fee at maximum
    if (totalFee > this.maxFee) {
      totalFee = this.maxFee;
    }

    return {
      percentageFee: Math.round(percentageFee * 100) / 100,
      fixedFee: this.fixedFee,
      totalFee: Math.round(totalFee * 100) / 100,
      netAmount: Math.round((amount - totalFee) * 100) / 100
    };
  }

  /**
   * Check deposit limits
   */
  async checkDepositLimits(userId, amount) {
    // Get or create limits
    const limits = await db.sequelize.query(
      `INSERT INTO card_deposit_limits (user_id)
       VALUES (:userId)
       ON CONFLICT (user_id) DO UPDATE
       SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    const limit = limits[0];

    // Check daily limit
    if (limit.daily_used + amount > limit.daily_limit) {
      throw new RateLimitError('Daily deposit limit exceeded', {
        limit: limit.daily_limit,
        used: limit.daily_used,
        requested: amount
      });
    }

    // Check monthly limit
    if (limit.monthly_used + amount > limit.monthly_limit) {
      throw new RateLimitError('Monthly deposit limit exceeded', {
        limit: limit.monthly_limit,
        used: limit.monthly_used,
        requested: amount
      });
    }

    // Check transaction count
    if (limit.daily_count >= limit.daily_transaction_count_limit) {
      throw new RateLimitError('Daily transaction limit exceeded', {
        limit: limit.daily_transaction_count_limit,
        used: limit.daily_count
      });
    }

    return true;
  }

  /**
   * Update deposit limit usage
   */
  async updateDepositLimitUsage(userId, amount, transaction) {
    await db.sequelize.query(
      `UPDATE card_deposit_limits
       SET daily_used = daily_used + :amount,
           daily_count = daily_count + 1,
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
   * Get deposit limits
   */
  async getDepositLimits(userId) {
    const limits = await db.sequelize.query(
      `SELECT * FROM card_deposit_limits WHERE user_id = :userId`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    if (!limits || limits.length === 0) {
      // Return default limits
      return {
        daily: {
          limit: 5000.00,
          used: 0,
          remaining: 5000.00,
          transactionCount: 0,
          transactionLimit: 10
        },
        monthly: {
          limit: 25000.00,
          used: 0,
          remaining: 25000.00,
          transactionCount: 0,
          transactionLimit: 100
        },
        perTransaction: {
          min: this.minDeposit,
          max: this.maxDeposit
        }
      };
    }

    const limit = limits[0];
    return {
      daily: {
        limit: parseFloat(limit.daily_limit),
        used: parseFloat(limit.daily_used),
        remaining: parseFloat(limit.daily_limit) - parseFloat(limit.daily_used),
        transactionCount: limit.daily_count,
        transactionLimit: limit.daily_transaction_count_limit
      },
      monthly: {
        limit: parseFloat(limit.monthly_limit),
        used: parseFloat(limit.monthly_used),
        remaining: parseFloat(limit.monthly_limit) - parseFloat(limit.monthly_used),
        transactionCount: limit.monthly_count,
        transactionLimit: limit.monthly_transaction_count_limit
      },
      perTransaction: {
        min: parseFloat(limit.per_transaction_min),
        max: parseFloat(limit.per_transaction_max)
      }
    };
  }

  /**
   * Get deposit history
   */
  async getDepositHistory(userId, options = {}) {
    const { limit = 50, offset = 0, status, startDate, endDate } = options;

    let query = `
      SELECT
        cd.id, cd.amount, cd.fee_amount, cd.net_amount,
        cd.status, cd.three_ds_status, cd.initiated_at,
        cd.completed_at, cd.processing_time_ms,
        ct.card_brand, ct.card_last4
      FROM card_deposits cd
      JOIN card_tokens ct ON cd.card_token_id = ct.id
      WHERE cd.user_id = :userId
    `;

    const replacements = { userId, limit, offset };

    if (status) {
      query += ' AND cd.status = :status';
      replacements.status = status;
    }

    if (startDate) {
      query += ' AND cd.initiated_at >= :startDate';
      replacements.startDate = startDate;
    }

    if (endDate) {
      query += ' AND cd.initiated_at <= :endDate';
      replacements.endDate = endDate;
    }

    query += ' ORDER BY cd.initiated_at DESC LIMIT :limit OFFSET :offset';

    const deposits = await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    return deposits.map(deposit => ({
      id: deposit.id,
      amount: parseFloat(deposit.amount),
      feeAmount: parseFloat(deposit.fee_amount),
      netAmount: parseFloat(deposit.net_amount),
      status: deposit.status,
      card: {
        brand: deposit.card_brand,
        last4: deposit.card_last4
      },
      required3ds: deposit.three_ds_status !== 'not_required',
      initiatedAt: deposit.initiated_at,
      completedAt: deposit.completed_at,
      processingTimeMs: deposit.processing_time_ms
    }));
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;
        case 'charge.dispute.created':
          await this.handleChargeDispute(event.data.object);
          break;
        default:
          logger.debug('Unhandled webhook event', { type: event.type });
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook', {
        eventType: event.type,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    const depositId = paymentIntent.metadata.depositId;
    if (depositId) {
      await this.processPaymentCompletion(depositId, paymentIntent.id);
    }
  }

  /**
   * Handle failed payment intent
   */
  async handlePaymentIntentFailed(paymentIntent) {
    const depositId = paymentIntent.metadata.depositId;

    if (depositId) {
      await db.sequelize.query(
        `UPDATE card_deposits
         SET status = 'failed',
             failure_reason = :reason,
             failure_code = :code,
             failed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :depositId`,
        {
          replacements: {
            depositId,
            reason: paymentIntent.last_payment_error?.message || 'Payment failed',
            code: paymentIntent.last_payment_error?.code || 'unknown'
          },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Notify user
      const deposit = await db.sequelize.query(
        'SELECT user_id, amount FROM card_deposits WHERE id = :depositId',
        {
          replacements: { depositId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (deposit && deposit[0]) {
        await realtimeNotificationsService.notifyDeposit(deposit[0].user_id, {
          id: depositId,
          amount: deposit[0].amount,
          method: 'card',
          status: 'failed'
        });
      }
    }
  }

  /**
   * Handle charge dispute
   */
  async handleChargeDispute(dispute) {
    logger.warn('Charge dispute created', {
      disputeId: dispute.id,
      chargeId: dispute.charge,
      amount: dispute.amount / 100,
      reason: dispute.reason
    });

    // TODO: Implement dispute handling logic
  }

  /**
   * Log card activity
   */
  async logCardActivity(cardTokenId, userId, action, metadata = {}, transaction = null) {
    await db.sequelize.query(
      `INSERT INTO card_activity (
        card_token_id, user_id, action, description, metadata
      ) VALUES (
        :cardTokenId, :userId, :action, :description, :metadata
      )`,
      {
        replacements: {
          cardTokenId,
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
      card_added: `Card ending in ${metadata.last4} added`,
      card_removed: `Card ending in ${metadata.last4} removed`,
      deposit_initiated: `Deposit of $${metadata.amount} initiated`,
      deposit_completed: `Deposit of $${metadata.amount} completed`,
      deposit_failed: `Deposit of $${metadata.amount} failed`,
      primary_set: `Card set as primary payment method`
    };

    return descriptions[action] || action;
  }

  /**
   * Run fraud detection
   */
  async runFraudDetection(userId, depositData) {
    try {
      // Get active fraud rules
      const rules = await db.sequelize.query(
        `SELECT * FROM fraud_detection_rules
         WHERE is_active = true
         ORDER BY priority DESC`,
        {
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      let riskScore = 0;
      let action = 'allow';

      for (const rule of rules) {
        const triggered = await this.evaluateFraudRule(rule, userId, depositData);

        if (triggered) {
          riskScore += rule.risk_score_impact;

          if (rule.action === 'block') {
            action = 'block';
            break;
          } else if (rule.action === 'challenge' && action !== 'block') {
            action = 'challenge';
          } else if (rule.action === 'review' && action === 'allow') {
            action = 'review';
          }

          // Update rule statistics
          await db.sequelize.query(
            `UPDATE fraud_detection_rules
             SET triggers_count = triggers_count + 1,
                 last_triggered_at = CURRENT_TIMESTAMP
             WHERE id = :ruleId`,
            {
              replacements: { ruleId: rule.id },
              type: db.sequelize.QueryTypes.UPDATE
            }
          );
        }
      }

      return {
        riskScore: Math.min(riskScore, 100),
        action,
        riskLevel: riskScore > 70 ? 'high' : riskScore > 30 ? 'medium' : 'low'
      };
    } catch (error) {
      logger.error('Error running fraud detection', {
        userId,
        error: error.message
      });

      // Default to allow with monitoring
      return {
        riskScore: 0,
        action: 'allow',
        riskLevel: 'low'
      };
    }
  }

  /**
   * Evaluate single fraud rule
   */
  async evaluateFraudRule(rule, userId, depositData) {
    try {
      const conditions = rule.conditions;

      switch (rule.rule_type) {
        case 'velocity':
          // Check transaction velocity
          const recentCount = await db.sequelize.query(
            `SELECT COUNT(*) as count
             FROM card_deposits
             WHERE user_id = :userId
             AND initiated_at > NOW() - INTERVAL :minutes MINUTE`,
            {
              replacements: {
                userId,
                minutes: rule.time_window_minutes || 60
              },
              type: db.sequelize.QueryTypes.SELECT
            }
          );

          return recentCount[0].count >= (conditions.transaction_count || 5);

        case 'amount':
          // Check amount thresholds
          if (conditions.first_transaction && depositData.isFirstTransaction) {
            return depositData.amount > (conditions.amount_gt || 1000);
          }
          return depositData.amount > (rule.threshold_value || 5000);

        case 'location':
          // Check for unusual location
          // TODO: Implement geolocation checks
          return false;

        case 'device':
          // Check device fingerprint
          // TODO: Implement device fingerprinting
          return false;

        default:
          return false;
      }
    } catch (error) {
      logger.error('Error evaluating fraud rule', {
        ruleId: rule.id,
        error: error.message
      });
      return false;
    }
  }
}

// Create singleton instance
const cardPaymentService = new CardPaymentService();

export default cardPaymentService;