/**
 * Card Management Service
 * Consumer Wallet Phase 2 Day 10 Implementation
 * Handles advanced card controls, PIN management, analytics, and replacements
 */

import Stripe from 'stripe';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../models/index.js';
import virtualCardService from './virtual-card-service.js';
import realtimeNotificationsService from './realtime-notifications.js';
import logger from './enhanced-logger.js';
import redis from './redis.js';
import {
  ValidationError,
  SecurityError,
  PaymentError,
  RateLimitError
} from '../utils/error-handler.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

class CardManagementService {
  constructor() {
    this.maxPinAttempts = 3;
    this.pinLockDuration = 3600; // 1 hour in seconds

    // Merchant categories
    this.merchantCategories = {
      '5411': 'Grocery Stores',
      '5541': 'Gas Stations',
      '5812': 'Restaurants',
      '5814': 'Fast Food',
      '5912': 'Drug Stores',
      '5933': 'Pawn Shops',
      '5999': 'Miscellaneous Retail',
      '6011': 'Financial Institutions',
      '7011': 'Hotels',
      '7995': 'Gambling',
      '7800': 'Government Lottery',
      '8999': 'Professional Services'
    };
  }

  /**
   * Set or update card PIN
   */
  async setCardPin(cardId, userId, newPin, currentPin = null) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE id = :cardId AND user_id = :userId',
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

      // If PIN already set, verify current PIN
      if (cardData.pin_set && currentPin) {
        const isValid = await bcrypt.compare(currentPin, cardData.pin_encrypted);
        if (!isValid) {
          // Increment attempts
          await db.sequelize.query(
            `UPDATE virtual_cards
             SET pin_attempts = pin_attempts + 1
             WHERE id = :cardId`,
            {
              replacements: { cardId },
              type: db.sequelize.QueryTypes.UPDATE,
              transaction: t
            }
          );

          // Check if should lock
          if (cardData.pin_attempts >= this.maxPinAttempts - 1) {
            await this.lockCardPin(cardId, t);
            throw new SecurityError('PIN locked due to multiple failed attempts');
          }

          throw new ValidationError('Invalid current PIN');
        }
      }

      // Hash new PIN
      const hashedPin = await bcrypt.hash(newPin, 10);

      // Update PIN
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET pin_encrypted = :hashedPin,
             pin_set = TRUE,
             pin_attempts = 0,
             pin_locked = FALSE,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: { hashedPin, cardId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Update Stripe metadata
      await stripe.issuing.cards.update(cardData.stripe_card_id, {
        metadata: {
          pinSet: 'true',
          pinUpdatedAt: new Date().toISOString()
        }
      });

      await t.commit();

      // Log security event
      logger.logSecurity('CARD_PIN_SET', {
        userId,
        cardId,
        action: cardData.pin_set ? 'updated' : 'created'
      });

      return { success: true, message: 'PIN successfully set' };
    } catch (error) {
      await t.rollback();

      logger.error('Error setting card PIN', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Verify card PIN
   */
  async verifyCardPin(cardId, userId, pin) {
    try {
      // Check if card is locked
      const lockKey = `card:pin:locked:${cardId}`;
      const isLocked = await redis.get(lockKey);

      if (isLocked) {
        throw new SecurityError('Card PIN is temporarily locked');
      }

      // Get card
      const card = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE id = :cardId AND user_id = :userId',
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      const cardData = card[0];

      if (!cardData.pin_set) {
        throw new ValidationError('PIN not set for this card');
      }

      if (cardData.pin_locked) {
        throw new SecurityError('Card PIN is locked');
      }

      // Verify PIN
      const isValid = await bcrypt.compare(pin, cardData.pin_encrypted);

      if (!isValid) {
        // Increment attempts
        await db.sequelize.query(
          `UPDATE virtual_cards
           SET pin_attempts = pin_attempts + 1
           WHERE id = :cardId`,
          {
            replacements: { cardId },
            type: db.sequelize.QueryTypes.UPDATE
          }
        );

        // Check if should lock
        if (cardData.pin_attempts >= this.maxPinAttempts - 1) {
          await this.lockCardPin(cardId);
          throw new SecurityError('PIN locked due to multiple failed attempts');
        }

        throw new ValidationError(`Invalid PIN. ${this.maxPinAttempts - cardData.pin_attempts - 1} attempts remaining`);
      }

      // Reset attempts on successful verification
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET pin_attempts = 0
         WHERE id = :cardId`,
        {
          replacements: { cardId },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      return { success: true, verified: true };
    } catch (error) {
      logger.error('Error verifying card PIN', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Lock card PIN
   */
  async lockCardPin(cardId, transaction = null) {
    await db.sequelize.query(
      `UPDATE virtual_cards
       SET pin_locked = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = :cardId`,
      {
        replacements: { cardId },
        type: db.sequelize.QueryTypes.UPDATE,
        transaction
      }
    );

    // Set Redis lock
    const lockKey = `card:pin:locked:${cardId}`;
    await redis.setex(lockKey, this.pinLockDuration, '1');

    logger.logSecurity('CARD_PIN_LOCKED', { cardId });
  }

  /**
   * Get spending controls
   */
  async getSpendingControls(cardId, userId) {
    try {
      const controls = await db.sequelize.query(
        `SELECT sc.*
         FROM card_spending_controls sc
         JOIN virtual_cards vc ON sc.card_id = vc.id
         WHERE sc.card_id = :cardId AND vc.user_id = :userId`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      if (!controls || controls.length === 0) {
        return {
          blockedCategories: [],
          allowedCategories: null,
          internationalEnabled: true,
          atmEnabled: true,
          onlineEnabled: true,
          contactlessEnabled: true
        };
      }

      const control = controls[0];
      return {
        blockedCategories: control.blocked_categories || [],
        allowedCategories: control.allowed_categories,
        internationalEnabled: control.international_enabled,
        allowedCountries: control.allowed_countries,
        blockedCountries: control.blocked_countries || [],
        atmEnabled: control.atm_enabled,
        onlineEnabled: control.online_enabled,
        contactlessEnabled: control.contactless_enabled,
        allowedDays: control.allowed_days,
        allowedHours: {
          start: control.allowed_hours_start,
          end: control.allowed_hours_end
        },
        maxTransactionsPerDay: control.max_transactions_per_day,
        blockedMerchants: control.blocked_merchants || []
      };
    } catch (error) {
      logger.error('Error getting spending controls', {
        cardId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Replace card
   */
  async replaceCard(cardId, userId, reason) {
    const t = await db.sequelize.transaction();

    try {
      // Get current card
      const currentCard = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE id = :cardId AND user_id = :userId',
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!currentCard || currentCard.length === 0) {
        throw new ValidationError('Card not found');
      }

      const oldCard = currentCard[0];

      // Cancel old Stripe card
      await stripe.issuing.cards.update(oldCard.stripe_card_id, {
        status: 'canceled',
        cancellation_reason: reason === 'lost' ? 'lost' : 'stolen'
      });

      // Mark old card as replaced
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET status = 'replaced',
             is_compromised = :compromised,
             compromised_at = CASE WHEN :compromised THEN CURRENT_TIMESTAMP ELSE NULL END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: {
            cardId,
            compromised: reason === 'stolen' || reason === 'compromised'
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Create new card with same settings
      const newCardData = {
        cardName: oldCard.card_name + ' (Replacement)',
        cardTier: oldCard.card_tier,
        designTemplate: oldCard.card_design_template,
        spendingLimits: {
          daily: parseFloat(oldCard.daily_spending_limit),
          monthly: parseFloat(oldCard.monthly_spending_limit),
          perTransaction: parseFloat(oldCard.transaction_limit)
        }
      };

      // Create replacement card (without transaction to avoid nested transaction)
      await t.commit();
      const newCard = await virtualCardService.createVirtualCard(userId, newCardData);

      // Update old card with replacement reference
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET replacement_card_id = :newCardId
         WHERE id = :oldCardId`,
        {
          replacements: {
            newCardId: newCard.id,
            oldCardId: cardId
          },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );

      // Copy spending controls
      await db.sequelize.query(
        `INSERT INTO card_spending_controls (
          card_id, blocked_categories, allowed_categories,
          international_enabled, allowed_countries, blocked_countries,
          atm_enabled, online_enabled, contactless_enabled,
          allowed_days, allowed_hours_start, allowed_hours_end,
          max_transactions_per_day, blocked_merchants
        )
        SELECT
          :newCardId, blocked_categories, allowed_categories,
          international_enabled, allowed_countries, blocked_countries,
          atm_enabled, online_enabled, contactless_enabled,
          allowed_days, allowed_hours_start, allowed_hours_end,
          max_transactions_per_day, blocked_merchants
        FROM card_spending_controls
        WHERE card_id = :oldCardId`,
        {
          replacements: {
            newCardId: newCard.id,
            oldCardId: cardId
          },
          type: db.sequelize.QueryTypes.INSERT
        }
      );

      // Send notification
      await realtimeNotificationsService.notifyCardActivity(userId, {
        transactionId: newCard.id,
        cardLast4: newCard.lastFour,
        type: 'card_replaced',
        status: 'active'
      });

      logger.info('Card replaced', {
        userId,
        oldCardId: cardId,
        newCardId: newCard.id,
        reason
      });

      return {
        success: true,
        newCard: {
          id: newCard.id,
          lastFour: newCard.lastFour,
          brand: newCard.brand
        }
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error replacing card', {
        cardId,
        reason,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Cancel card
   */
  async cancelCard(cardId, userId) {
    const t = await db.sequelize.transaction();

    try {
      // Get card
      const card = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE id = :cardId AND user_id = :userId',
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

      // Cancel Stripe card
      await stripe.issuing.cards.update(cardData.stripe_card_id, {
        status: 'canceled',
        cancellation_reason: 'other'
      });

      // Update database
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET status = 'cancelled',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: { cardId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Release any authorization holds
      await db.sequelize.query(
        `UPDATE card_authorization_holds
         SET status = 'released',
             released_at = CURRENT_TIMESTAMP
         WHERE card_id = :cardId AND status = 'active'`,
        {
          replacements: { cardId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      // Send notification
      await realtimeNotificationsService.notifyCardActivity(userId, {
        transactionId: cardId,
        cardLast4: cardData.last_four,
        type: 'card_cancelled',
        status: 'cancelled'
      });

      logger.info('Card cancelled', {
        userId,
        cardId
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error cancelling card', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Get authorization holds
   */
  async getAuthorizationHolds(cardId, userId) {
    try {
      const holds = await db.sequelize.query(
        `SELECT ah.*
         FROM card_authorization_holds ah
         JOIN virtual_cards vc ON ah.card_id = vc.id
         WHERE ah.card_id = :cardId AND vc.user_id = :userId
         AND ah.status = 'active'
         ORDER BY ah.held_at DESC`,
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return holds.map(hold => ({
        id: hold.id,
        amount: parseFloat(hold.amount),
        currency: hold.currency,
        merchantName: hold.merchant_name,
        status: hold.status,
        heldAt: hold.held_at,
        expiresAt: hold.expires_at
      }));
    } catch (error) {
      logger.error('Error getting authorization holds', {
        cardId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get card analytics
   */
  async getCardAnalytics(cardId, userId, period = '30d') {
    try {
      // Calculate date range
      const days = parseInt(period) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get transaction statistics
      const stats = await db.sequelize.query(
        `SELECT
          COUNT(*) as transaction_count,
          SUM(amount) as total_spent,
          AVG(amount) as average_transaction,
          MAX(amount) as largest_transaction,
          MIN(amount) as smallest_transaction,
          COUNT(DISTINCT merchant_name) as unique_merchants,
          COUNT(DISTINCT DATE(created_at)) as active_days
         FROM card_transactions
         WHERE card_id = :cardId
         AND status IN ('captured', 'settled')
         AND created_at >= :startDate`,
        {
          replacements: { cardId, startDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // Get spending by category
      const categorySpending = await db.sequelize.query(
        `SELECT
          merchant_category,
          merchant_category_code,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
         FROM card_transactions
         WHERE card_id = :cardId
         AND status IN ('captured', 'settled')
         AND created_at >= :startDate
         GROUP BY merchant_category, merchant_category_code
         ORDER BY total_amount DESC
         LIMIT 10`,
        {
          replacements: { cardId, startDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // Get spending by day
      const dailySpending = await db.sequelize.query(
        `SELECT
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
         FROM card_transactions
         WHERE card_id = :cardId
         AND status IN ('captured', 'settled')
         AND created_at >= :startDate
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        {
          replacements: { cardId, startDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // Get top merchants
      const topMerchants = await db.sequelize.query(
        `SELECT
          merchant_name,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
         FROM card_transactions
         WHERE card_id = :cardId
         AND status IN ('captured', 'settled')
         AND created_at >= :startDate
         GROUP BY merchant_name
         ORDER BY total_amount DESC
         LIMIT 10`,
        {
          replacements: { cardId, startDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      // Get declined transactions
      const declinedStats = await db.sequelize.query(
        `SELECT
          COUNT(*) as declined_count,
          SUM(amount) as declined_amount
         FROM card_transactions
         WHERE card_id = :cardId
         AND status = 'declined'
         AND created_at >= :startDate`,
        {
          replacements: { cardId, startDate },
          type: db.sequelize.QueryTypes.SELECT
        }
      );

      return {
        period,
        startDate,
        endDate: new Date(),
        overview: {
          transactionCount: parseInt(stats[0].transaction_count) || 0,
          totalSpent: parseFloat(stats[0].total_spent) || 0,
          averageTransaction: parseFloat(stats[0].average_transaction) || 0,
          largestTransaction: parseFloat(stats[0].largest_transaction) || 0,
          smallestTransaction: parseFloat(stats[0].smallest_transaction) || 0,
          uniqueMerchants: parseInt(stats[0].unique_merchants) || 0,
          activeDays: parseInt(stats[0].active_days) || 0,
          declinedCount: parseInt(declinedStats[0].declined_count) || 0,
          declinedAmount: parseFloat(declinedStats[0].declined_amount) || 0
        },
        categoryBreakdown: categorySpending.map(cat => ({
          category: cat.merchant_category,
          categoryCode: cat.merchant_category_code,
          transactionCount: parseInt(cat.transaction_count),
          totalAmount: parseFloat(cat.total_amount),
          categoryName: this.merchantCategories[cat.merchant_category_code] || 'Other'
        })),
        dailySpending: dailySpending.map(day => ({
          date: day.date,
          transactionCount: parseInt(day.transaction_count),
          totalAmount: parseFloat(day.total_amount)
        })),
        topMerchants: topMerchants.map(merchant => ({
          name: merchant.merchant_name,
          transactionCount: parseInt(merchant.transaction_count),
          totalAmount: parseFloat(merchant.total_amount)
        }))
      };
    } catch (error) {
      logger.error('Error getting card analytics', {
        cardId,
        period,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update card design
   */
  async updateCardDesign(cardId, userId, designTemplateId, customColor) {
    const t = await db.sequelize.transaction();

    try {
      // Verify card ownership
      const card = await db.sequelize.query(
        'SELECT * FROM virtual_cards WHERE id = :cardId AND user_id = :userId',
        {
          replacements: { cardId, userId },
          type: db.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!card || card.length === 0) {
        throw new ValidationError('Card not found');
      }

      // Update design
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET card_design_template = :designTemplateId,
             card_color = :customColor,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: {
            cardId,
            designTemplateId,
            customColor
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      logger.info('Card design updated', {
        userId,
        cardId,
        designTemplateId
      });

      return { success: true };
    } catch (error) {
      await t.rollback();

      logger.error('Error updating card design', {
        cardId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Report fraud
   */
  async reportFraud(cardId, userId, transactionId, description) {
    const t = await db.sequelize.transaction();

    try {
      // Mark transaction as fraudulent
      await db.sequelize.query(
        `UPDATE card_transactions
         SET fraud_detected = TRUE,
             metadata = jsonb_set(metadata, '{fraudReport}', :report)
         WHERE id = :transactionId AND card_id = :cardId`,
        {
          replacements: {
            transactionId,
            cardId,
            report: JSON.stringify({
              reportedAt: new Date(),
              description
            })
          },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Mark card as compromised
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET is_compromised = TRUE,
             compromised_at = CURRENT_TIMESTAMP
         WHERE id = :cardId`,
        {
          replacements: { cardId },
          type: db.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );

      // Freeze card immediately
      await virtualCardService.toggleCardFreeze(cardId, userId, true);

      await t.commit();

      // Log security event
      logger.logSecurity('FRAUD_REPORTED', {
        userId,
        cardId,
        transactionId,
        description
      });

      // Create case for manual review
      await this.createFraudCase(cardId, transactionId, description);

      return {
        success: true,
        message: 'Fraud report submitted. Card has been frozen for security.',
        caseId: `FRAUD_${Date.now()}`
      };
    } catch (error) {
      await t.rollback();

      logger.error('Error reporting fraud', {
        cardId,
        transactionId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Create fraud case for investigation
   */
  async createFraudCase(cardId, transactionId, description) {
    // This would integrate with fraud investigation system
    // For now, log and queue for manual review
    logger.logSecurity('FRAUD_CASE_CREATED', {
      cardId,
      transactionId,
      description,
      status: 'pending_investigation'
    });
  }

  /**
   * Get merchant categories
   */
  getMerchantCategories() {
    return Object.entries(this.merchantCategories).map(([code, name]) => ({
      code,
      name,
      restricted: ['5933', '7995', '7800'].includes(code)
    }));
  }

  /**
   * Handle Stripe webhook events
   */
  async handleAuthorizationCreated(authorization) {
    // Log authorization
    logger.info('Authorization created', {
      authId: authorization.id,
      amount: authorization.amount,
      merchant: authorization.merchant_data.name
    });
  }

  async handleAuthorizationUpdated(authorization) {
    // Update transaction status if captured
    if (authorization.status === 'closed' && authorization.approved) {
      await db.sequelize.query(
        `UPDATE card_transactions
         SET status = 'captured',
             captured_at = CURRENT_TIMESTAMP
         WHERE stripe_authorization_id = :authId`,
        {
          replacements: { authId: authorization.id },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
    }
  }

  async handleTransactionCreated(transaction) {
    // Update transaction to settled
    await db.sequelize.query(
      `UPDATE card_transactions
       SET status = 'settled',
           settlement_amount = :amount,
           settled_at = CURRENT_TIMESTAMP
       WHERE stripe_authorization_id = :authId`,
      {
        replacements: {
          authId: transaction.authorization,
          amount: transaction.amount / 100
        },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    // Release authorization hold
    await db.sequelize.query(
      `UPDATE card_authorization_holds
       SET status = 'captured',
           captured_at = CURRENT_TIMESTAMP
       WHERE authorization_code = :authId`,
      {
        replacements: { authId: transaction.authorization },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );
  }

  async handleCardCreated(card) {
    logger.info('Stripe card created', {
      cardId: card.id,
      last4: card.last4
    });
  }

  async handleCardUpdated(card) {
    // Sync card status
    if (card.status === 'inactive') {
      await db.sequelize.query(
        `UPDATE virtual_cards
         SET status = 'inactive'
         WHERE stripe_card_id = :stripeCardId`,
        {
          replacements: { stripeCardId: card.id },
          type: db.sequelize.QueryTypes.UPDATE
        }
      );
    }
  }
}

// Create singleton instance
const cardManagementService = new CardManagementService();

export default cardManagementService;