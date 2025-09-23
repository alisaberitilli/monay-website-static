import Stripe from 'stripe';
import crypto from 'crypto';
import HttpStatus from 'http-status';
import { CustomError } from '../middlewares/errors';
import loggers from './logger';

class StripePaymentService {
  constructor() {
    // Initialize Stripe with secret key
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SABVjFzOpfMHqen5u4SujADp4VBSpgQLrFhV0o6JMV0YMW2KtFqFekbhJhcNZb9ZBGp4Mn456xjRjUvN0f7geAR00QzIpetdm', {
      apiVersion: '2023-10-16',
    });

    // Configuration
    this.config = {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51SABVjFzOpfMHqenDYfNS4WChMmj4kekrpArfVjGUyDhTHxZGIRbFfQH4QHRY0YjSaRKA9cAHaiuUjEI7sBlj8c000d59i6OVI',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_5c9bea954c0c696ec8245730f76902cdcc6ffcf22b574cbb7fd520a5cee6904f',
      currency: 'usd',
      statementDescriptor: 'MONAY',
    };

    // Payment method types
    this.paymentMethods = {
      CARD: 'card',
      ACH: 'us_bank_account',
      WIRE: 'customer_balance',
      SEPA: 'sepa_debit',
      CRYPTO: 'crypto', // For USDC and other stablecoins
    };

    // Supported stablecoins
    this.supportedStablecoins = {
      USDC: 'usdc',
      USDT: 'usdt',
      DAI: 'dai',
    };
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(customerData) {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        description: customerData.description || 'Monay platform customer',
        metadata: {
          userId: customerData.userId,
          platform: 'monay',
          createdAt: new Date().toISOString(),
        },
      });

      loggers.infoLogger.info(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      loggers.errorLogger.error(`Failed to create Stripe customer: ${error.message}`);
      throw new CustomError(
        'Failed to create payment profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Process card payment
   */
  async processCardPayment(paymentData) {
    try {
      const { amount, currency, cardToken, customerId, description, metadata } = paymentData;

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || this.config.currency,
        customer: customerId,
        payment_method_types: ['card'],
        payment_method: cardToken,
        confirm: true,
        description: description || 'Monay wallet funding',
        statement_descriptor: this.config.statementDescriptor,
        metadata: {
          ...metadata,
          paymentType: 'card',
          platform: 'monay',
        },
      });

      loggers.infoLogger.info(`Card payment processed: ${paymentIntent.id}`);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      loggers.errorLogger.error(`Card payment failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Card payment processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Process ACH payment
   */
  async processACHPayment(achData) {
    try {
      const { amount, customerId, bankAccount, description, metadata } = achData;

      // Create ACH payment method if not provided
      let paymentMethod = bankAccount.paymentMethodId;

      if (!paymentMethod && bankAccount.accountNumber && bankAccount.routingNumber) {
        const method = await this.stripe.paymentMethods.create({
          type: 'us_bank_account',
          us_bank_account: {
            account_holder_type: bankAccount.accountType || 'individual',
            account_number: bankAccount.accountNumber,
            routing_number: bankAccount.routingNumber,
          },
          billing_details: {
            name: bankAccount.accountHolderName,
            email: bankAccount.email,
          },
        });
        paymentMethod = method.id;
      }

      // Create payment intent for ACH
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd', // ACH only supports USD
        customer: customerId,
        payment_method_types: ['us_bank_account'],
        payment_method: paymentMethod,
        confirm: true,
        description: description || 'Monay ACH transfer',
        statement_descriptor: this.config.statementDescriptor,
        metadata: {
          ...metadata,
          paymentType: 'ach',
          platform: 'monay',
        },
      });

      loggers.infoLogger.info(`ACH payment initiated: ${paymentIntent.id}`);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        estimatedArrival: this.calculateACHArrival(),
      };
    } catch (error) {
      loggers.errorLogger.error(`ACH payment failed: ${error.message}`);
      throw new CustomError(
        error.message || 'ACH transfer processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Process wire transfer
   */
  async processWireTransfer(wireData) {
    try {
      const { amount, customerId, description, metadata } = wireData;

      // Create a payment intent for wire transfer
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: wireData.currency || 'usd',
        customer: customerId,
        payment_method_types: ['customer_balance'],
        payment_method_data: {
          type: 'customer_balance',
        },
        payment_method_options: {
          customer_balance: {
            funding_type: 'bank_transfer',
            bank_transfer: {
              type: 'us_bank_transfer',
            },
          },
        },
        description: description || 'Monay wire transfer',
        metadata: {
          ...metadata,
          paymentType: 'wire',
          platform: 'monay',
        },
      });

      // Get wire instructions
      const instructions = await this.getWireInstructions(paymentIntent.id);

      loggers.infoLogger.info(`Wire transfer initiated: ${paymentIntent.id}`);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        wireInstructions: instructions,
      };
    } catch (error) {
      loggers.errorLogger.error(`Wire transfer failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Wire transfer processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Process USDC stablecoin payment
   */
  async processStablecoinPayment(cryptoData) {
    try {
      const { amount, stablecoin, customerId, walletAddress, description, metadata } = cryptoData;

      // Validate stablecoin type
      if (!this.supportedStablecoins[stablecoin.toUpperCase()]) {
        throw new Error(`Unsupported stablecoin: ${stablecoin}`);
      }

      // Create crypto onramp session for stablecoin
      const session = await this.stripe.cryptoOnrampSessions.create({
        customer: customerId,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${stablecoin.toUpperCase()} Purchase`,
              description: description || 'Stablecoin funding',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        payment_method_types: ['card', 'us_bank_account'],
        metadata: {
          ...metadata,
          stablecoin: stablecoin.toUpperCase(),
          walletAddress,
          platform: 'monay',
        },
      });

      loggers.infoLogger.info(`Stablecoin payment session created: ${session.id}`);

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        amount,
        stablecoin: stablecoin.toUpperCase(),
        status: 'pending',
      };
    } catch (error) {
      loggers.errorLogger.error(`Stablecoin payment failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Stablecoin payment processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Create payment link
   */
  async createPaymentLink(linkData) {
    try {
      const { amount, currency, description, successUrl, cancelUrl, metadata } = linkData;

      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [{
          price_data: {
            currency: currency || this.config.currency,
            product_data: {
              name: description || 'Monay Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        after_completion: {
          type: 'redirect',
          redirect: {
            url: successUrl || `${process.env.APP_URL}/payment/success`,
          },
        },
        metadata: {
          ...metadata,
          platform: 'monay',
        },
      });

      loggers.infoLogger.info(`Payment link created: ${paymentLink.id}`);

      return {
        success: true,
        paymentLinkId: paymentLink.id,
        url: paymentLink.url,
        amount,
        currency: currency || this.config.currency,
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to create payment link: ${error.message}`);
      throw new CustomError(
        error.message || 'Payment link creation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        created: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to get payment status: ${error.message}`);
      throw new CustomError(
        'Failed to retrieve payment status',
        HttpStatus.NOT_FOUND
      );
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundData) {
    try {
      const { paymentIntentId, amount, reason } = refundData;

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
        reason: reason || 'requested_by_customer',
      });

      loggers.infoLogger.info(`Refund processed: ${refund.id}`);

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency,
        created: new Date(refund.created * 1000),
      };
    } catch (error) {
      loggers.errorLogger.error(`Refund failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Refund processing failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Create subscription for recurring payments
   */
  async createSubscription(subscriptionData) {
    try {
      const { customerId, priceId, paymentMethodId, metadata } = subscriptionData;

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          ...metadata,
          platform: 'monay',
        },
      });

      loggers.infoLogger.info(`Subscription created: ${subscription.id}`);

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      };
    } catch (error) {
      loggers.errorLogger.error(`Subscription creation failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Subscription creation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.del(subscriptionId);

      loggers.infoLogger.info(`Subscription cancelled: ${subscription.id}`);

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        canceledAt: new Date(subscription.canceled_at * 1000),
      };
    } catch (error) {
      loggers.errorLogger.error(`Subscription cancellation failed: ${error.message}`);
      throw new CustomError(
        error.message || 'Subscription cancellation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );
      return event;
    } catch (error) {
      loggers.errorLogger.error(`Invalid webhook signature: ${error.message}`);
      throw new CustomError('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleRefundCompleted(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        default:
          loggers.infoLogger.info(`Unhandled webhook event type: ${event.type}`);
      }

      return { success: true, processed: true };
    } catch (error) {
      loggers.errorLogger.error(`Webhook processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSucceeded(paymentIntent) {
    // Update transaction status in database
    // Credit user wallet
    // Send confirmation email
    loggers.infoLogger.info(`Payment succeeded: ${paymentIntent.id}`);
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(paymentIntent) {
    // Update transaction status
    // Send failure notification
    loggers.infoLogger.info(`Payment failed: ${paymentIntent.id}`);
  }

  /**
   * Handle completed refund
   */
  async handleRefundCompleted(charge) {
    // Update transaction records
    // Debit user wallet if needed
    // Send refund confirmation
    loggers.infoLogger.info(`Refund completed for charge: ${charge.id}`);
  }

  /**
   * Handle subscription created
   */
  async handleSubscriptionCreated(subscription) {
    // Update user subscription status
    // Enable premium features
    loggers.infoLogger.info(`Subscription created: ${subscription.id}`);
  }

  /**
   * Handle subscription cancelled
   */
  async handleSubscriptionCancelled(subscription) {
    // Update user subscription status
    // Disable premium features
    loggers.infoLogger.info(`Subscription cancelled: ${subscription.id}`);
  }

  /**
   * Handle checkout session completed
   */
  async handleCheckoutCompleted(session) {
    // Process completed checkout
    // Update order status
    loggers.infoLogger.info(`Checkout completed: ${session.id}`);
  }

  /**
   * Get wire transfer instructions
   */
  async getWireInstructions(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['next_action.display_bank_transfer_instructions'],
      });

      if (paymentIntent.next_action?.display_bank_transfer_instructions) {
        const instructions = paymentIntent.next_action.display_bank_transfer_instructions;
        return {
          amount: instructions.amount_remaining / 100,
          currency: instructions.currency,
          bankName: instructions.financial_addresses[0]?.aba?.bank_name,
          accountNumber: instructions.financial_addresses[0]?.aba?.account_number,
          routingNumber: instructions.financial_addresses[0]?.aba?.routing_number,
          reference: instructions.reference,
        };
      }

      return null;
    } catch (error) {
      loggers.errorLogger.error(`Failed to get wire instructions: ${error.message}`);
      return null;
    }
  }

  /**
   * Calculate ACH arrival time
   */
  calculateACHArrival() {
    const now = new Date();
    const businessDays = 3; // Standard ACH processing time
    let arrivalDate = new Date(now);

    let daysAdded = 0;
    while (daysAdded < businessDays) {
      arrivalDate.setDate(arrivalDate.getDate() + 1);
      // Skip weekends
      if (arrivalDate.getDay() !== 0 && arrivalDate.getDay() !== 6) {
        daysAdded++;
      }
    }

    return arrivalDate;
  }

  /**
   * Get payment fees
   */
  getPaymentFees(amount, paymentMethod) {
    const fees = {
      [this.paymentMethods.CARD]: {
        percentage: 0.029, // 2.9%
        fixed: 0.30, // $0.30
      },
      [this.paymentMethods.ACH]: {
        percentage: 0.008, // 0.8%
        fixed: 0, // No fixed fee
        cap: 5.00, // $5.00 cap
      },
      [this.paymentMethods.WIRE]: {
        percentage: 0,
        fixed: 15.00, // $15 flat fee
      },
      [this.paymentMethods.CRYPTO]: {
        percentage: 0.01, // 1% for crypto
        fixed: 0,
      },
    };

    const fee = fees[paymentMethod];
    if (!fee) return 0;

    let calculatedFee = (amount * fee.percentage) + fee.fixed;

    // Apply cap if exists
    if (paymentMethod === this.paymentMethods.ACH && fee.cap) {
      calculatedFee = Math.min(calculatedFee, fee.cap);
    }

    return Math.round(calculatedFee * 100) / 100;
  }

  /**
   * Validate payment limits
   */
  validatePaymentLimits(amount, paymentMethod) {
    const limits = {
      [this.paymentMethods.CARD]: {
        min: 0.50,
        max: 999999.99,
      },
      [this.paymentMethods.ACH]: {
        min: 1.00,
        max: 100000.00,
      },
      [this.paymentMethods.WIRE]: {
        min: 100.00,
        max: 10000000.00,
      },
      [this.paymentMethods.CRYPTO]: {
        min: 10.00,
        max: 50000.00,
      },
    };

    const limit = limits[paymentMethod];
    if (!limit) return { valid: false, reason: 'Unsupported payment method' };

    if (amount < limit.min) {
      return { valid: false, reason: `Minimum amount is $${limit.min}` };
    }

    if (amount > limit.max) {
      return { valid: false, reason: `Maximum amount is $${limit.max}` };
    }

    return { valid: true };
  }
}

export default new StripePaymentService();