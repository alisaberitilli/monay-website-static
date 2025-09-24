/**
 * Virtual Card Service with Stripe Issuing
 * Consumer Wallet Phase 2 Day 9 Implementation
 * Handles virtual card creation, management, and digital wallet integration
 */

import Stripe from 'stripe';
import crypto from 'crypto';
import db from '../models/index.js';
import walletBalanceService from './wallet-balance-service.js';
import realtimeNotificationsService from './realtime-notifications.js';
import logger from './enhanced-logger.js';
import redis from './redis.js';
import {
  ValidationError,
  PaymentError,
  ExternalServiceError,
  SecurityError,
  RateLimitError
} from '../utils/error-handler.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

class VirtualCardService {
  constructor() {
    this.encryptionKey = process.env.CARD_ENCRYPTION_KEY;
    this.algorithm = 'aes-256-gcm';

    // Card limits
    this.maxCardsPerUser = 5;
    this.defaultSpendingLimits = {
      daily: 5000,
      monthly: 25000,
      perTransaction: 2500
    };

    // Digital wallet providers
    this.walletProviders = {
      APPLE: 'apple_pay',
      GOOGLE: 'google_pay',
      SAMSUNG: 'samsung_pay'
    };
  }

  /**
   * Create a new virtual card
   */
  async createVirtualCard(userId, cardData = {}) {
    const t = await db.sequelize.transaction();

    try {
      const { cardName, cardTier = 'standard', designTemplate, spendingLimits } = cardData;

      // Check card limit
      const cardCount = await this.getUserCardCount(userId);
      if (cardCount >= this.maxCardsPerUser) {
        throw new ValidationError(`Maximum ${this.maxCardsPerUser} cards allowed per user`);
      }

      // Get user and wallet
      const user = await db.User.findByPk(userId);
      const wallet = await db.Wallet.findOne({
        where: { user_id: userId, type: 'primary' }
      });

      // Ensure Stripe cardholder exists
      const cardholderId = await this.ensureStripeCardholder(user);

      // Create Stripe Issuing card
      const stripeCard = await stripe.issuing.cards.create({
        cardholder: cardholderId,
        type: 'virtual',
        currency: 'usd',
        status: 'active',
        spending_controls: {
          spending_limits: [
            {
              amount: (spendingLimits?.daily || this.defaultSpendingLimits.daily) * 100,
              interval: 'daily'
            },
            {
              amount: (spendingLimits?.monthly || this.defaultSpendingLimits.monthly) * 100,
              interval: 'monthly'
            }
          ],
          allowed_categories: null, // All categories allowed by default
          blocked_categories: ['5933', '7995'], // Block gambling and betting
        },
        metadata: {
          userId,
          walletId: wallet.id,
          cardTier
        }
      });

      // Retrieve sensitive card details
      const cardDetails = await stripe.issuing.cards.retrieve(stripeCard.id, {
        expand: ['number', 'cvc']
      });

      // Encrypt sensitive data
      const encryptedNumber = this.encryptData(cardDetails.number);
      const encryptedCvv = this.encryptData(cardDetails.cvc);

      // Calculate expiry
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);

      // Create card record
      const virtualCard = await db.sequelize.query(
        `INSERT INTO virtual_cards (
          user_id, wallet_id, stripe_card_id, stripe_cardholder_id,
          card_number_encrypted, last_four, cvv_encrypted,
          expiry_month, expiry_year, card_brand, card_type, card_tier,
          card_name, cardholder_name, status, activation_status,
          spending_limit_enabled, daily_spending_limit,
          monthly_spending_limit, transaction_limit,
          card_design_template, expires_at
        ) VALUES (
          :userId, :walletId, :stripeCardId, :stripeCardholderId,
          :cardNumberEncrypted, :lastFour, :cvvEncrypted,
          :expiryMonth, :expiryYear, :cardBrand, 'virtual', :cardTier,
          :cardName, :cardholderName, 'active', 'activated',
          :spendingLimitEnabled, :dailyLimit, :monthlyLimit, :transactionLimit,
          :designTemplate, :expiresAt
        ) RETURNING *`,
        {
          replacements: {
            userId,
            walletId: wallet.id,
            stripeCardId: stripeCard.id,
            stripeCardholderId: cardholderId,
            cardNumberEncrypted: encryptedNumber,
            lastFour: stripeCard.last4,
            cvvEncrypted: encryptedCvv,
            expiryMonth: stripeCard.exp_month,
            expiryYear: stripeCard.exp_year,
            cardBrand: stripeCard.brand,
            cardTier,
            cardName: cardName || `${stripeCard.brand} *${stripeCard.last4}`,
            cardholderName: `${user.first_name} ${user.last_name}`.toUpperCase(),
            spendingLimitEnabled: !!spendingLimits,
            dailyLimit: spendingLimits?.daily || this.defaultSpendingLimits.daily,
            monthlyLimit: spendingLimits?.monthly || this.defaultSpendingLimits.monthly,
            transactionLimit: spendingLimits?.perTransaction || this.defaultSpendingLimits.perTransaction,
            designTemplate: designTemplate || 'classic_black',
            expiresAt: expiryDate
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Create default spending controls
      await this.createDefaultSpendingControls(virtualCard[0].id, t);

      // Log card creation
      await this.logCardActivity(virtualCard[0].id, userId, 'card_created', {
        cardTier,
        lastFour: stripeCard.last4
      }, t);

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyCardActivity(userId, {
        transactionId: virtualCard[0].id,
        cardLast4: stripeCard.last4,
        type: 'virtual_card_created',
        status: 'active'
      });

      // Cache card data
      await this.cacheCardData(virtualCard[0].id, virtualCard[0]);

      logger.info('Virtual card created', {
        userId,
        cardId: virtualCard[0].id,
        lastFour: stripeCard.last4
      });

      // Return sanitized card data
      return {
        id: virtualCard[0].id,
        lastFour: virtualCard[0].last_four,
        brand: virtualCard[0].card_brand,
        expiryMonth: virtualCard[0].expiry_month,
        expiryYear: virtualCard[0].expiry_year,
        cardName: virtualCard[0].card_name,
        cardTier: virtualCard[0].card_tier,
        status: virtualCard[0].status
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error creating virtual card', {
        userId,
        error: error.message
      });

      if (error.type === 'StripeInvalidRequestError') {
        throw new ExternalServiceError('Failed to create card', {
          service: 'Stripe Issuing',
          error: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Get card details (decrypted)
   */
  async getCardDetails(cardId, userId, includesSensitive = false) {
    try {
      // Get card from database
      const card = await db.sequelize.query(
        `SELECT * FROM virtual_cards
         WHERE id = :cardId AND user_id = :userId`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      const cardData = card[0];

      // Basic details
      const details = {
        id: cardData.id,
        lastFour: cardData.last_four,
        brand: cardData.card_brand,
        expiryMonth: cardData.expiry_month,
        expiryYear: cardData.expiry_year,
        cardName: cardData.card_name,
        cardTier: cardData.card_tier,
        status: cardData.status,
        spendingLimits: {
          daily: parseFloat(cardData.daily_spending_limit),
          monthly: parseFloat(cardData.monthly_spending_limit),
          perTransaction: parseFloat(cardData.transaction_limit)
        },
        digitalWallets: {
          apple: cardData.apple_wallet_status,
          google: cardData.google_wallet_status,
          samsung: cardData.samsung_wallet_status
        },
        usage: {
          totalSpent: parseFloat(cardData.total_spent),
          transactionCount: cardData.transaction_count,
          lastUsed: cardData.last_used_at
        }
      };

      // Include sensitive data if requested and authorized
      if (includesSensitive) {
        // Verify user authorization (could add 2FA here)
        const decryptedNumber = this.decryptData(cardData.card_number_encrypted);
        const decryptedCvv = this.decryptData(cardData.cvv_encrypted);

        details.cardNumber = decryptedNumber;
        details.cvv = decryptedCvv;

        // Log sensitive data access
        logger.logSecurity('CARD_DETAILS_ACCESSED', {
          userId,
          cardId,
          includesSensitive: true
        });
      }

      return details;
    } catch (error) {
      logger.error('Error getting card details', {
        cardId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Freeze/Unfreeze card
   */
  async toggleCardFreeze(cardId, userId, freeze = true) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await db.sequelize.query(
        `SELECT * FROM virtual_cards
         WHERE id = :cardId AND user_id = :userId`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      const cardData = card[0];
      const newStatus = freeze ? 'frozen' : 'active';

      // Update Stripe card status
      await stripe.issuing.cards.update(cardData.stripe_card_id, {
        status: freeze ? 'inactive' : 'active'
      });

      // Update database
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET status = :status,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: { status: newStatus, cardId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Log activity
      await this.logCardActivity(cardId, userId, freeze ? 'card_frozen' : 'card_unfrozen', {}, t);

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyCardActivity(userId, {
        transactionId: cardId,
        cardLast4: cardData.last_four,
        type: freeze ? 'card_frozen' : 'card_activated',
        status: newStatus
      });

      logger.info(`Card ${freeze ? 'frozen' : 'unfrozen'}`, {
        userId,
        cardId,
        newStatus
      });

      return { success: true, status: newStatus };
    } catch (error) {
      await t.rollback();

      logger.error('Error toggling card freeze', {
        cardId,
        freeze,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Add card to Apple Wallet
   */
  async addToAppleWallet(cardId, userId, deviceData) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await this.getCardDetails(cardId, userId, true);

      // Generate provisioning data for Apple Wallet
      const provisioningData = await this.generateAppleWalletProvisioningData(card, deviceData);

      // Create digital wallet token record
      await db.sequelize.query(
        `INSERT INTO digital_wallet_tokens (
          card_id, user_id, token_type, token_reference_id,
          device_id, device_name, device_type, status,
          provisioning_request_id, metadata
        ) VALUES (
          :cardId, :userId, 'apple_pay', :tokenRef,
          :deviceId, :deviceName, :deviceType, 'pending',
          :provisioningId, :metadata
        )`,
        {
          replacements: {
            cardId,
            userId,
            tokenRef: provisioningData.tokenReferenceId,
            deviceId: deviceData.deviceId,
            deviceName: deviceData.deviceName || 'iPhone',
            deviceType: 'ios',
            provisioningId: provisioningData.provisioningRequestId,
            metadata: JSON.stringify(provisioningData)
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Update card status
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET apple_wallet_status = 'pending',
             apple_wallet_token = :token,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: {
            token: provisioningData.activationData,
            cardId
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      logger.info('Apple Wallet provisioning initiated', {
        userId,
        cardId
      });

      return {
        success: true,
        activationData: provisioningData.activationData,
        encryptedPassData: provisioningData.encryptedPassData,
        ephemeralPublicKey: provisioningData.ephemeralPublicKey
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error adding to Apple Wallet', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Add card to Google Wallet
   */
  async addToGoogleWallet(cardId, userId, deviceData) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await this.getCardDetails(cardId, userId, true);

      // Generate provisioning data for Google Wallet
      const provisioningData = await this.generateGoogleWalletProvisioningData(card, deviceData);

      // Create digital wallet token record
      await db.sequelize.query(
        `INSERT INTO digital_wallet_tokens (
          card_id, user_id, token_type, token_reference_id,
          device_account_number, device_id, device_name,
          device_type, status, provisioning_request_id, metadata
        ) VALUES (
          :cardId, :userId, 'google_pay', :tokenRef,
          :dpan, :deviceId, :deviceName, :deviceType,
          'pending', :provisioningId, :metadata
        )`,
        {
          replacements: {
            cardId,
            userId,
            tokenRef: provisioningData.tokenReferenceId,
            dpan: provisioningData.deviceAccountNumber,
            deviceId: deviceData.deviceId,
            deviceName: deviceData.deviceName || 'Android Device',
            deviceType: 'android',
            provisioningId: provisioningData.provisioningRequestId,
            metadata: JSON.stringify(provisioningData)
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Update card status
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET google_wallet_status = 'pending',
             google_wallet_token = :token,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: {
            token: provisioningData.opaquePaymentCard,
            cardId
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      logger.info('Google Wallet provisioning initiated', {
        userId,
        cardId
      });

      return {
        success: true,
        opaquePaymentCard: provisioningData.opaquePaymentCard,
        userAddress: provisioningData.userAddress,
        tokenizationSpecification: provisioningData.tokenizationSpecification
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error adding to Google Wallet', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Update spending limits
   */
  async updateSpendingLimits(cardId, userId, limits) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await db.sequelize.query(
        `SELECT * FROM virtual_cards
         WHERE id = :cardId AND user_id = :userId`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      const cardData = card[0];

      // Update Stripe spending controls
      await stripe.issuing.cards.update(cardData.stripe_card_id, {
        spending_controls: {
          spending_limits: [
            {
              amount: (limits.daily || cardData.daily_spending_limit) * 100,
              interval: 'daily'
            },
            {
              amount: (limits.monthly || cardData.monthly_spending_limit) * 100,
              interval: 'monthly'
            }
          ]
        }
      });

      // Update database
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET spending_limit_enabled = TRUE,
             daily_spending_limit = :daily,
             monthly_spending_limit = :monthly,
             transaction_limit = :perTransaction,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: {
            daily: limits.daily || cardData.daily_spending_limit,
            monthly: limits.monthly || cardData.monthly_spending_limit,
            perTransaction: limits.perTransaction || cardData.transaction_limit,
            cardId
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Log activity
      await this.logCardActivity(cardId, userId, 'spending_limits_updated', limits, t);

      await t.commit();

      logger.info('Spending limits updated', {
        userId,
        cardId,
        limits
      });

      return { success: true, limits };
    } catch (error) {
      await t.rollback();

      logger.error('Error updating spending limits', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Update spending controls (merchant categories, geographic restrictions, etc.)
   */
  async updateSpendingControls(cardId, userId, controls) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await db.sequelize.query(
        `SELECT * FROM virtual_cards
         WHERE id = :cardId AND user_id = :userId`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      // Update or create spending controls
      await db.sequelize.query(
        `INSERT INTO card_spending_controls (
          card_id, blocked_categories, allowed_categories,
          international_enabled, allowed_countries, blocked_countries,
          atm_enabled, online_enabled, contactless_enabled,
          allowed_days, allowed_hours_start, allowed_hours_end,
          max_transactions_per_day, blocked_merchants
        ) VALUES (
          :cardId, :blockedCategories, :allowedCategories,
          :internationalEnabled, :allowedCountries, :blockedCountries,
          :atmEnabled, :onlineEnabled, :contactlessEnabled,
          :allowedDays, :allowedHoursStart, :allowedHoursEnd,
          :maxTransactionsPerDay, :blockedMerchants
        )
        ON CONFLICT (card_id) DO UPDATE SET
          blocked_categories = EXCLUDED.blocked_categories,
          allowed_categories = EXCLUDED.allowed_categories,
          international_enabled = EXCLUDED.international_enabled,
          allowed_countries = EXCLUDED.allowed_countries,
          blocked_countries = EXCLUDED.blocked_countries,
          atm_enabled = EXCLUDED.atm_enabled,
          online_enabled = EXCLUDED.online_enabled,
          contactless_enabled = EXCLUDED.contactless_enabled,
          allowed_days = EXCLUDED.allowed_days,
          allowed_hours_start = EXCLUDED.allowed_hours_start,
          allowed_hours_end = EXCLUDED.allowed_hours_end,
          max_transactions_per_day = EXCLUDED.max_transactions_per_day,
          blocked_merchants = EXCLUDED.blocked_merchants,
          updated_at = CURRENT_TIMESTAMP`,
        {
          replacements: {
            cardId,
            blockedCategories: controls.blockedCategories || [],
            allowedCategories: controls.allowedCategories || null,
            internationalEnabled: controls.internationalEnabled !== false,
            allowedCountries: controls.allowedCountries || null,
            blockedCountries: controls.blockedCountries || [],
            atmEnabled: controls.atmEnabled !== false,
            onlineEnabled: controls.onlineEnabled !== false,
            contactlessEnabled: controls.contactlessEnabled !== false,
            allowedDays: controls.allowedDays || null,
            allowedHoursStart: controls.allowedHoursStart || null,
            allowedHoursEnd: controls.allowedHoursEnd || null,
            maxTransactionsPerDay: controls.maxTransactionsPerDay || null,
            blockedMerchants: controls.blockedMerchants || []
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      // Update Stripe card with category restrictions
      const stripeControls = {};
      if (controls.blockedCategories) {
        stripeControls.blocked_categories = controls.blockedCategories;
      }
      if (controls.allowedCategories) {
        stripeControls.allowed_categories = controls.allowedCategories;
      }

      if (Object.keys(stripeControls).length > 0) {
        await stripe.issuing.cards.update(card[0].stripe_card_id, {
          spending_controls: stripeControls
        });
      }

      await t.commit();

      logger.info('Spending controls updated', {
        userId,
        cardId,
        controls
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error updating spending controls', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get user's virtual cards
   */
  async getUserCards(userId) {
    try {
      const cards = await db.sequelize.query(
        `SELECT
          id, last_four, card_brand, card_type, card_tier,
          card_name, status, expiry_month, expiry_year,
          daily_spending_limit, monthly_spending_limit,
          total_spent, transaction_count, last_used_at,
          apple_wallet_status, google_wallet_status,
          created_at
         FROM virtual_cards
         WHERE user_id = :userId AND status NOT IN ('cancelled', 'expired')
         ORDER BY created_at DESC`,
        {
          replacements: { userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return cards.map(card => ({
        id: card.id,
        lastFour: card.last_four,
        brand: card.card_brand,
        type: card.card_type,
        tier: card.card_tier,
        name: card.card_name,
        status: card.status,
        expiryMonth: card.expiry_month,
        expiryYear: card.expiry_year,
        spendingLimits: {
          daily: parseFloat(card.daily_spending_limit),
          monthly: parseFloat(card.monthly_spending_limit)
        },
        usage: {
          totalSpent: parseFloat(card.total_spent),
          transactionCount: card.transaction_count,
          lastUsed: card.last_used_at
        },
        digitalWallets: {
          apple: card.apple_wallet_status,
          google: card.google_wallet_status
        },
        createdAt: card.created_at
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
   * Get card transactions
   */
  async getCardTransactions(cardId, userId, options = {}) {
    const { limit = 50, offset = 0, startDate, endDate } = options;

    try {
      let query = `
        SELECT
          ct.id, ct.amount, ct.currency, ct.type, ct.status,
          ct.merchant_name, ct.merchant_category,
          ct.merchant_category_code, ct.created_at
        FROM card_transactions ct
        JOIN virtual_cards vc ON ct.card_id = vc.id
        WHERE ct.card_id = :cardId AND vc.user_id = :userId
      `;

      const replacements = { cardId, userId, limit, offset };

      if (startDate) {
        query += ' AND ct.created_at >= :startDate';
        replacements.startDate = startDate;
      }

      if (endDate) {
        query += ' AND ct.created_at <= :endDate';
        replacements.endDate = endDate;
      }

      query += ' ORDER BY ct.created_at DESC LIMIT :limit OFFSET :offset';

      const transactions = await db.sequelize.query(query, {
        replacements,
        type: db.sequelize.QueryTypes.SELECT
      });

      return transactions.map(tx => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        currency: tx.currency,
        type: tx.type,
        status: tx.status,
        merchant: {
          name: tx.merchant_name,
          category: tx.merchant_category,
          categoryCode: tx.merchant_category_code
        },
        createdAt: tx.created_at
      }));
    } catch (error) {
      logger.error('Error getting card transactions', {
        cardId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Handle authorization webhook from Stripe
   */
  async handleAuthorizationWebhook(authorization) {
    const t = await db.sequelize.transaction();

    try {
      const { card: stripeCardId, amount, merchant_data, status } = authorization;

      // Get card by Stripe ID
      const card = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE stripe_card_id = :stripeCardId',
        {
          replacements: { stripeCardId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!card || card.length === 0) {
        logger.warn('Card not found for authorization', { stripeCardId });
        return;
      }

      const cardData = card[0];

      // Check spending limits
      const withinLimits = await db.sequelize.query(
        'SELECT check_card_spending_limit(:cardId::uuid, :amount)',
        {
          replacements: { cardId: cardData.id, amount: amount / 100 },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!withinLimits[0].check_card_spending_limit) {
        // Decline due to spending limit
        await stripe.issuing.authorizations.decline(authorization.id);

        // Log declined transaction
        await db.sequelize.query(
          `INSERT INTO card_transactions (
            card_id, user_id, wallet_id, stripe_authorization_id,
            amount, type, status, merchant_name,
            merchant_category_code, declined_at
          ) VALUES (
            :cardId, :userId, :walletId, :authId,
            :amount, 'purchase', 'declined', :merchantName,
            :mcc, CURRENT_TIMESTAMP
          )`,
          {
            replacements: {
              cardId: cardData.id,
              userId: cardData.user_id,
              walletId: cardData.wallet_id,
              authId: authorization.id,
              amount: amount / 100,
              merchantName: merchant_data.name,
              mcc: merchant_data.category
            },
            type: db.sequelize.QueryTypes.INSERT,
            transaction: t
          }
        );

        await t.commit();
        return { approved: false, reason: 'spending_limit_exceeded' };
      }

      // Check wallet balance
      const balance = await walletBalanceService.getBalance(cardData.wallet_id);
      if (balance.available < amount / 100) {
        // Decline due to insufficient funds
        await stripe.issuing.authorizations.decline(authorization.id);

        await t.commit();
        return { approved: false, reason: 'insufficient_funds' };
      }

      // Approve authorization
      await stripe.issuing.authorizations.approve(authorization.id);

      // Create authorization hold
      await db.sequelize.query(
        'SELECT process_authorization_hold(:cardId::uuid, :amount, :merchantName)',
        {
          replacements: {
            cardId: cardData.id,
            amount: amount / 100,
            merchantName: merchant_data.name
          },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      // Create transaction record
      await db.sequelize.query(
        `INSERT INTO card_transactions (
          card_id, user_id, wallet_id, stripe_authorization_id,
          amount, authorization_amount, type, status,
          merchant_name, merchant_category, merchant_category_code,
          merchant_city, merchant_country, authorized_at
        ) VALUES (
          :cardId, :userId, :walletId, :authId,
          :amount, :authAmount, 'purchase', 'authorized',
          :merchantName, :merchantCategory, :mcc,
          :merchantCity, :merchantCountry, CURRENT_TIMESTAMP
        )`,
        {
          replacements: {
            cardId: cardData.id,
            userId: cardData.user_id,
            walletId: cardData.wallet_id,
            authId: authorization.id,
            amount: amount / 100,
            authAmount: amount / 100,
            merchantName: merchant_data.name,
            merchantCategory: merchant_data.category_code,
            mcc: merchant_data.category,
            merchantCity: merchant_data.city,
            merchantCountry: merchant_data.country
          },
          type: db.sequelize.QueryTypes.INSERT,
          transaction: t
        }
      );

      await t.commit();

      // Send real-time notification
      await realtimeNotificationsService.notifyCardActivity(cardData.user_id, {
        transactionId: authorization.id,
        cardLast4: cardData.last_four,
        amount: amount / 100,
        merchant: merchant_data.name,
        status: 'authorized'
      });

      return { approved: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error handling authorization webhook', {
        authorizationId: authorization.id,
        error: error.message
      });

      // Decline on error
      try {
        await stripe.issuing.authorizations.decline(authorization.id);
      } catch (declineError) {
        logger.error('Error declining authorization', {
          error: declineError.message
        });
      }

      return { approved: false, reason: 'processing_error' };
    }
  }

  /**
   * Ensure Stripe cardholder exists
   */
  async ensureStripeCardholder(user) {
    try {
      // Check if cardholder already exists
      if (user.stripe_cardholder_id) {
        return user.stripe_cardholder_id;
      }

      // Create new cardholder
      const cardholder = await stripe.issuing.cardholders.create({
        type: 'individual',
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone_number: user.phone_number,
        billing: {
          address: {
            line1: user.address_line1 || '123 Main St',
            city: user.city || 'San Francisco',
            state: user.state || 'CA',
            postal_code: user.postal_code || '94102',
            country: 'US'
          }
        },
        status: 'active',
        metadata: {
          userId: user.id
        }
      });

      // Save cardholder ID
      await db.User.update(
        { stripe_cardholder_id: cardholder.id },
        { where: { id: user.id } }
      );

      return cardholder.id;
    } catch (error) {
      logger.error('Error ensuring Stripe cardholder', {
        userId: user.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get user card count
   */
  async getUserCardCount(userId) {
    const result = await db.sequelize.query(
      `SELECT COUNT(*) as count
       FROM virtual_cards
       WHERE user_id = :userId AND status NOT IN ('cancelled', 'expired')`,
      {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    return parseInt(result[0].count);
  }

  /**
   * Create default spending controls
   */
  async createDefaultSpendingControls(cardId, transaction) {
    await db.sequelize.query(
      `INSERT INTO card_spending_controls (
        card_id, blocked_categories, international_enabled,
        atm_enabled, online_enabled, contactless_enabled
      ) VALUES (
        :cardId, :blockedCategories, TRUE, TRUE, TRUE, TRUE
      )`,
      {
        replacements: {
          cardId,
          blockedCategories: ['5933', '7995', '7800'] // Gambling, betting, lottery
        },
        type: db.sequelize.QueryTypes.INSERT,
        transaction
      }
    );
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'hex'), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate Apple Wallet provisioning data
   */
  async generateAppleWalletProvisioningData(card, deviceData) {
    // This would integrate with Apple's provisioning API
    // Simplified for demonstration
    return {
      tokenReferenceId: crypto.randomBytes(16).toString('hex'),
      provisioningRequestId: crypto.randomBytes(16).toString('hex'),
      activationData: Buffer.from(JSON.stringify({
        cardNumber: card.cardNumber,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear
      })).toString('base64'),
      encryptedPassData: crypto.randomBytes(256).toString('base64'),
      ephemeralPublicKey: crypto.randomBytes(65).toString('base64')
    };
  }

  /**
   * Generate Google Wallet provisioning data
   */
  async generateGoogleWalletProvisioningData(card, deviceData) {
    // This would integrate with Google's provisioning API
    // Simplified for demonstration
    return {
      tokenReferenceId: crypto.randomBytes(16).toString('hex'),
      provisioningRequestId: crypto.randomBytes(16).toString('hex'),
      deviceAccountNumber: '4' + crypto.randomBytes(7).toString('hex').substring(0, 15),
      opaquePaymentCard: Buffer.from(JSON.stringify({
        cardNumber: card.cardNumber,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        cvv: card.cvv
      })).toString('base64'),
      userAddress: {
        name: card.cardholderName,
        phoneNumber: deviceData.phoneNumber
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2023-10-16',
          'stripe:publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
        }
      }
    };
  }

  /**
   * Cache card data
   */
  async cacheCardData(cardId, cardData) {
    const cacheKey = `card:${cardId}`;
    await redis.setex(cacheKey, 3600, JSON.stringify(cardData));
  }

  /**
   * Log card activity
   */
  async logCardActivity(cardId, userId, action, metadata = {}, transaction = null) {
    logger.info('Card activity', {
      cardId,
      userId,
      action,
      metadata
    });
  }
}

// Create singleton instance
const virtualCardService = new VirtualCardService();

export default virtualCardService;