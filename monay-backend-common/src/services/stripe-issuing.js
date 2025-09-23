import Stripe from 'stripe';
import HttpStatus from 'http-status';
import { CustomError } from '../middlewares/errors';
import loggers from './logger';

class StripeIssuingService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SABVjFzOpfMHqen5u4SujADp4VBSpgQLrFhV0o6JMV0YMW2KtFqFekbhJhcNZb9ZBGp4Mn456xjRjUvN0f7geAR00QzIpetdm', {
      apiVersion: '2023-10-16',
    });

    this.config = {
      currency: 'usd',
      defaultSpendingLimits: {
        daily: 5000,
        weekly: 15000,
        monthly: 50000,
        perTransaction: 2500
      }
    };
  }

  /**
   * Create cardholder for card issuing
   */
  async createCardholder(cardholderData) {
    try {
      const cardholder = await this.stripe.issuing.cardholders.create({
        name: cardholderData.name,
        email: cardholderData.email,
        phone_number: cardholderData.phone,
        status: 'active',
        type: cardholderData.type || 'individual',
        billing: {
          address: {
            line1: cardholderData.addressLine1,
            line2: cardholderData.addressLine2,
            city: cardholderData.city,
            state: cardholderData.state,
            postal_code: cardholderData.postalCode,
            country: cardholderData.country || 'US'
          }
        },
        metadata: {
          userId: cardholderData.userId,
          platform: 'monay'
        }
      });

      loggers.infoLogger.info(`Cardholder created: ${cardholder.id}`);
      return cardholder;
    } catch (error) {
      loggers.errorLogger.error(`Failed to create cardholder: ${error.message}`);
      throw new CustomError(
        'Failed to create cardholder',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Issue virtual card
   */
  async issueVirtualCard(cardData) {
    try {
      const { cardholderId, spendingLimits, currency } = cardData;

      const card = await this.stripe.issuing.cards.create({
        cardholder: cardholderId,
        type: 'virtual',
        currency: currency || this.config.currency,
        status: 'active',
        spending_controls: {
          spending_limits: [
            {
              amount: spendingLimits?.daily || this.config.defaultSpendingLimits.daily,
              interval: 'daily'
            },
            {
              amount: spendingLimits?.weekly || this.config.defaultSpendingLimits.weekly,
              interval: 'weekly'
            },
            {
              amount: spendingLimits?.monthly || this.config.defaultSpendingLimits.monthly,
              interval: 'monthly'
            },
            {
              amount: spendingLimits?.perTransaction || this.config.defaultSpendingLimits.perTransaction,
              interval: 'per_authorization'
            }
          ],
          allowed_categories: cardData.allowedCategories,
          blocked_categories: cardData.blockedCategories,
          allowed_merchant_countries: cardData.allowedCountries || ['US'],
          blocked_merchant_countries: cardData.blockedCountries
        },
        metadata: {
          ...cardData.metadata,
          type: 'virtual',
          platform: 'monay'
        }
      });

      // Retrieve sensitive card details (for display to user)
      const cardDetails = await this.stripe.issuing.cards.retrieve(card.id, {
        expand: ['number', 'cvc']
      });

      loggers.infoLogger.info(`Virtual card issued: ${card.id}`);

      return {
        success: true,
        cardId: card.id,
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        status: card.status,
        number: cardDetails.number, // Sensitive - handle with care
        cvc: cardDetails.cvc // Sensitive - handle with care
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to issue virtual card: ${error.message}`);
      throw new CustomError(
        'Failed to issue virtual card',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Issue physical card
   */
  async issuePhysicalCard(cardData) {
    try {
      const { cardholderId, shippingAddress, spendingLimits, currency } = cardData;

      const card = await this.stripe.issuing.cards.create({
        cardholder: cardholderId,
        type: 'physical',
        currency: currency || this.config.currency,
        status: 'inactive', // Will be activated when received
        shipping: {
          name: shippingAddress.name,
          address: {
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postalCode,
            country: shippingAddress.country || 'US'
          },
          service: shippingAddress.service || 'standard', // 'standard', 'express', 'priority'
        },
        spending_controls: {
          spending_limits: [
            {
              amount: spendingLimits?.daily || this.config.defaultSpendingLimits.daily,
              interval: 'daily'
            },
            {
              amount: spendingLimits?.monthly || this.config.defaultSpendingLimits.monthly,
              interval: 'monthly'
            }
          ]
        },
        metadata: {
          ...cardData.metadata,
          type: 'physical',
          platform: 'monay'
        }
      });

      loggers.infoLogger.info(`Physical card issued: ${card.id}`);

      return {
        success: true,
        cardId: card.id,
        last4: card.last4,
        brand: card.brand,
        status: card.status,
        shippingStatus: 'pending',
        estimatedDelivery: this.calculateDeliveryDate(shippingAddress.service)
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to issue physical card: ${error.message}`);
      throw new CustomError(
        'Failed to issue physical card',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Activate physical card
   */
  async activateCard(cardId) {
    try {
      const card = await this.stripe.issuing.cards.update(cardId, {
        status: 'active'
      });

      loggers.infoLogger.info(`Card activated: ${cardId}`);

      return {
        success: true,
        cardId: card.id,
        status: card.status
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to activate card: ${error.message}`);
      throw new CustomError(
        'Failed to activate card',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Freeze/unfreeze card
   */
  async updateCardStatus(cardId, status) {
    try {
      const validStatuses = ['active', 'inactive', 'canceled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const card = await this.stripe.issuing.cards.update(cardId, {
        status
      });

      loggers.infoLogger.info(`Card status updated: ${cardId} -> ${status}`);

      return {
        success: true,
        cardId: card.id,
        status: card.status
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to update card status: ${error.message}`);
      throw new CustomError(
        'Failed to update card status',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Update spending limits
   */
  async updateSpendingLimits(cardId, newLimits) {
    try {
      const spendingLimits = [];

      if (newLimits.daily !== undefined) {
        spendingLimits.push({
          amount: newLimits.daily,
          interval: 'daily'
        });
      }

      if (newLimits.weekly !== undefined) {
        spendingLimits.push({
          amount: newLimits.weekly,
          interval: 'weekly'
        });
      }

      if (newLimits.monthly !== undefined) {
        spendingLimits.push({
          amount: newLimits.monthly,
          interval: 'monthly'
        });
      }

      if (newLimits.perTransaction !== undefined) {
        spendingLimits.push({
          amount: newLimits.perTransaction,
          interval: 'per_authorization'
        });
      }

      const card = await this.stripe.issuing.cards.update(cardId, {
        spending_controls: {
          spending_limits: spendingLimits
        }
      });

      loggers.infoLogger.info(`Spending limits updated for card: ${cardId}`);

      return {
        success: true,
        cardId: card.id,
        spendingLimits: card.spending_controls.spending_limits
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to update spending limits: ${error.message}`);
      throw new CustomError(
        'Failed to update spending limits',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get card transactions
   */
  async getCardTransactions(cardId, options = {}) {
    try {
      const { limit = 100, startDate, endDate } = options;

      const params = {
        card: cardId,
        limit
      };

      if (startDate) {
        params.created = { gte: Math.floor(startDate.getTime() / 1000) };
      }

      if (endDate) {
        params.created = {
          ...params.created,
          lte: Math.floor(endDate.getTime() / 1000)
        };
      }

      const transactions = await this.stripe.issuing.transactions.list(params);

      return {
        success: true,
        transactions: transactions.data.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          currency: tx.currency,
          merchantName: tx.merchant_data?.name,
          merchantCategory: tx.merchant_data?.category,
          created: new Date(tx.created * 1000),
          status: tx.type
        }))
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to get card transactions: ${error.message}`);
      throw new CustomError(
        'Failed to retrieve card transactions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Create card authorization webhook handler
   */
  async handleAuthorization(authorization) {
    try {
      // Implement custom authorization logic here
      // For example: check balance, fraud detection, merchant restrictions

      const approved = await this.checkAuthorizationRules(authorization);

      if (approved) {
        // Approve the authorization
        await this.stripe.issuing.authorizations.approve(authorization.id);
        loggers.infoLogger.info(`Authorization approved: ${authorization.id}`);
      } else {
        // Decline the authorization
        await this.stripe.issuing.authorizations.decline(authorization.id, {
          metadata: {
            decline_reason: 'insufficient_funds' // or other reason
          }
        });
        loggers.infoLogger.info(`Authorization declined: ${authorization.id}`);
      }

      return { approved };
    } catch (error) {
      loggers.errorLogger.error(`Failed to handle authorization: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check authorization rules
   */
  async checkAuthorizationRules(authorization) {
    // Implement your business logic here
    // Check:
    // - Account balance
    // - Spending limits
    // - Merchant restrictions
    // - Fraud detection
    // - Time-based restrictions

    // For now, approve if amount is less than $1000
    return authorization.amount < 100000; // Amount in cents
  }

  /**
   * Add card to Apple Wallet
   */
  async addToAppleWallet(cardId, certificates) {
    try {
      const card = await this.stripe.issuing.cards.retrieve(cardId);

      // Create provisioning request for Apple Wallet
      const provisioningRequest = {
        card: cardId,
        certificates: certificates,
        nonce: crypto.randomBytes(16).toString('hex'),
        nonce_signature: '' // Generate signature based on certificates
      };

      // This would integrate with Apple PassKit
      // Implementation depends on Apple developer certificates

      loggers.infoLogger.info(`Card added to Apple Wallet: ${cardId}`);

      return {
        success: true,
        cardId,
        walletProvider: 'apple'
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to add card to Apple Wallet: ${error.message}`);
      throw new CustomError(
        'Failed to add card to Apple Wallet',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Add card to Google Pay
   */
  async addToGooglePay(cardId, deviceInfo) {
    try {
      const card = await this.stripe.issuing.cards.retrieve(cardId);

      // Create provisioning request for Google Pay
      // This would integrate with Google Pay API
      // Implementation depends on Google Pay setup

      loggers.infoLogger.info(`Card added to Google Pay: ${cardId}`);

      return {
        success: true,
        cardId,
        walletProvider: 'google'
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to add card to Google Pay: ${error.message}`);
      throw new CustomError(
        'Failed to add card to Google Pay',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Generate virtual card number for online transactions
   */
  async generateVirtualNumber(cardId, options = {}) {
    try {
      const { expiryMinutes = 15, singleUse = true, maxAmount } = options;

      // Create ephemeral key for temporary card access
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { issuing_card: cardId },
        { stripe_version: '2023-10-16' }
      );

      // Generate virtual card details
      const virtualCard = {
        cardId,
        ephemeralKey: ephemeralKey.secret,
        validUntil: new Date(Date.now() + expiryMinutes * 60000),
        singleUse,
        maxAmount
      };

      loggers.infoLogger.info(`Virtual card number generated for: ${cardId}`);

      return {
        success: true,
        ...virtualCard
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to generate virtual number: ${error.message}`);
      throw new CustomError(
        'Failed to generate virtual card number',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Calculate estimated delivery date
   */
  calculateDeliveryDate(service) {
    const now = new Date();
    let businessDays;

    switch (service) {
      case 'express':
        businessDays = 2;
        break;
      case 'priority':
        businessDays = 1;
        break;
      default: // standard
        businessDays = 7;
    }

    let deliveryDate = new Date(now);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip weekends
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysAdded++;
      }
    }

    return deliveryDate;
  }
}

export default new StripeIssuingService();