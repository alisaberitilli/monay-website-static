import httpStatus from 'http-status';
import stripePaymentService from '../services/stripe-payment';
import { Logger } from '../services/logger';
import db from '../models';

const logger = new Logger({
  logName: 'stripe-controller',
  logFolder: 'stripe',
});

/**
 * Create or get Stripe customer
 */
export const createCustomer = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;
    const userId = req.user.id;

    const customer = await stripePaymentService.createCustomer({
      email,
      name,
      phone,
      userId,
      description: `User ${userId} - ${name}`
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        customerId: customer.id,
        email: customer.email,
        created: customer.created
      }
    });
  } catch (error) {
    logger.logError('Create customer failed', error);
    next(error);
  }
};

/**
 * Process card payment
 */
export const processCardPayment = async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      cardToken,
      customerId,
      description,
      saveCard
    } = req.body;

    const userId = req.user.id;

    // Create transaction record
    const transaction = await db.Transaction.create({
      userId,
      type: 'deposit',
      amount,
      currency: currency || 'usd',
      status: 'pending',
      provider: 'stripe',
      paymentMethod: 'card',
      metadata: { customerId, description }
    });

    // Process payment with Stripe
    const result = await stripePaymentService.processCardPayment({
      amount,
      currency,
      cardToken,
      customerId,
      description,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    // Update transaction status
    await transaction.update({
      status: result.status === 'succeeded' ? 'completed' : result.status,
      externalId: result.paymentIntentId,
      completedAt: result.status === 'succeeded' ? new Date() : null
    });

    // If payment succeeded, credit wallet
    if (result.status === 'succeeded') {
      const wallet = await db.Wallet.findOne({ where: { userId } });
      if (wallet) {
        await wallet.increment('balance', { by: amount });
      }
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Card payment failed', error);
    next(error);
  }
};

/**
 * Process ACH payment
 */
export const processACHPayment = async (req, res, next) => {
  try {
    const {
      amount,
      customerId,
      bankAccount,
      description
    } = req.body;

    const userId = req.user.id;

    // Create transaction record
    const transaction = await db.Transaction.create({
      userId,
      type: 'deposit',
      amount,
      currency: 'usd',
      status: 'pending',
      provider: 'stripe',
      paymentMethod: 'ach',
      metadata: { customerId, description }
    });

    // Process ACH payment
    const result = await stripePaymentService.processACHPayment({
      amount,
      customerId,
      bankAccount,
      description,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    // Update transaction
    await transaction.update({
      status: result.status,
      externalId: result.paymentIntentId,
      estimatedArrival: result.estimatedArrival
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('ACH payment failed', error);
    next(error);
  }
};

/**
 * Process wire transfer
 */
export const processWireTransfer = async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      customerId,
      description
    } = req.body;

    const userId = req.user.id;

    // Create transaction record
    const transaction = await db.Transaction.create({
      userId,
      type: 'deposit',
      amount,
      currency: currency || 'usd',
      status: 'pending',
      provider: 'stripe',
      paymentMethod: 'wire',
      metadata: { customerId, description }
    });

    // Process wire transfer
    const result = await stripePaymentService.processWireTransfer({
      amount,
      currency,
      customerId,
      description,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    // Update transaction
    await transaction.update({
      status: result.status,
      externalId: result.paymentIntentId,
      wireInstructions: result.wireInstructions
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Wire transfer failed', error);
    next(error);
  }
};

/**
 * Process USDC stablecoin payment
 */
export const processStablecoinPayment = async (req, res, next) => {
  try {
    const {
      amount,
      stablecoin,
      customerId,
      walletAddress,
      description
    } = req.body;

    const userId = req.user.id;

    // Create transaction record
    const transaction = await db.Transaction.create({
      userId,
      type: 'deposit',
      amount,
      currency: stablecoin.toLowerCase(),
      status: 'pending',
      provider: 'stripe',
      paymentMethod: 'crypto',
      metadata: { customerId, walletAddress, description }
    });

    // Process stablecoin payment
    const result = await stripePaymentService.processStablecoinPayment({
      amount,
      stablecoin,
      customerId,
      walletAddress,
      description,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    // Update transaction
    await transaction.update({
      status: result.status,
      externalId: result.sessionId,
      sessionUrl: result.sessionUrl
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Stablecoin payment failed', error);
    next(error);
  }
};

/**
 * Create payment link
 */
export const createPaymentLink = async (req, res, next) => {
  try {
    const {
      amount,
      currency,
      description,
      successUrl,
      cancelUrl
    } = req.body;

    const userId = req.user.id;

    const result = await stripePaymentService.createPaymentLink({
      amount,
      currency,
      description,
      successUrl,
      cancelUrl,
      metadata: {
        userId
      }
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Payment link creation failed', error);
    next(error);
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;

    const result = await stripePaymentService.getPaymentStatus(paymentIntentId);

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Get payment status failed', error);
    next(error);
  }
};

/**
 * Process refund
 */
export const processRefund = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;

    // Find original transaction
    const transaction = await Transaction.findOne({
      where: {
        externalId: paymentIntentId,
        userId
      }
    });

    if (!transaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Process refund
    const result = await stripePaymentService.processRefund({
      paymentIntentId,
      amount,
      reason
    });

    // Create refund transaction
    await db.Transaction.create({
      userId,
      type: 'refund',
      amount: result.amount,
      currency: result.currency,
      status: result.status === 'succeeded' ? 'completed' : result.status,
      provider: 'stripe',
      paymentMethod: transaction.paymentMethod,
      externalId: result.refundId,
      relatedTransactionId: transaction.id,
      metadata: { reason }
    });

    // If refund succeeded, debit wallet
    if (result.status === 'succeeded') {
      const wallet = await db.Wallet.findOne({ where: { userId } });
      if (wallet) {
        await wallet.decrement('balance', { by: result.amount });
      }
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Refund failed', error);
    next(error);
  }
};

/**
 * Create subscription
 */
export const createSubscription = async (req, res, next) => {
  try {
    const {
      customerId,
      priceId,
      paymentMethodId
    } = req.body;

    const userId = req.user.id;

    const result = await stripePaymentService.createSubscription({
      customerId,
      priceId,
      paymentMethodId,
      metadata: {
        userId
      }
    });

    // Store subscription info in database
    // You may want to create a Subscription model for this

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Subscription creation failed', error);
    next(error);
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const result = await stripePaymentService.cancelSubscription(subscriptionId);

    // Update subscription status in database

    res.status(httpStatus.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.logError('Subscription cancellation failed', error);
    next(error);
  }
};

/**
 * Handle Stripe webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];

    // Verify webhook signature and get event
    const event = stripePaymentService.verifyWebhookSignature(
      req.body,
      signature
    );

    // Process webhook event
    await stripePaymentService.handleWebhookEvent(event);

    // Acknowledge receipt of webhook
    res.status(httpStatus.OK).json({ received: true });
  } catch (error) {
    logger.logError('Webhook processing failed', error);
    // Important: Return 200 OK even on error to prevent Stripe from retrying
    res.status(httpStatus.OK).json({
      received: true,
      error: 'Webhook processing failed'
    });
  }
};

/**
 * Get payment fees
 */
export const getPaymentFees = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.query;

    const fees = stripePaymentService.getPaymentFees(
      parseFloat(amount),
      paymentMethod
    );

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        amount: parseFloat(amount),
        paymentMethod,
        fee: fees,
        total: parseFloat(amount) + fees
      }
    });
  } catch (error) {
    logger.logError('Get payment fees failed', error);
    next(error);
  }
};

/**
 * Validate payment limits
 */
export const validatePaymentLimits = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;

    const validation = stripePaymentService.validatePaymentLimits(
      amount,
      paymentMethod
    );

    res.status(httpStatus.OK).json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.logError('Payment limit validation failed', error);
    next(error);
  }
};

/**
 * Test Stripe connection
 */
export const testConnection = async (req, res, next) => {
  try {
    // Test by retrieving account info
    const stripe = stripePaymentService.stripe;
    const account = await stripe.accounts.retrieve();

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Stripe connection successful',
      data: {
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled
      }
    });
  } catch (error) {
    logger.logError('Stripe connection test failed', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Stripe connection failed',
      message: error.message
    });
  }
};