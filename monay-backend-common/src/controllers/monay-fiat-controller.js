import httpStatus from 'http-status';
import monayFiatService from '../services/monay-fiat.js';
import { Logger } from '../services/logger.js';
import Transaction from '../models/Transaction';
import User from '../models/User';

const logger = new Logger({
  logName: 'tillipay-controller',
  logFolder: 'controllers'
});

export const testConnection = async (req, res) => {
  try {
    const result = await monayFiatService.testConnection();
    
    return res.status(httpStatus.OK).json({
      success: result.success,
      message: result.message,
      data: {
        environment: result.environment,
        merchantId: result.merchantId
      }
    });
  } catch (error) {
    logger.logError('Test Connection Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to test TilliPay connection',
      error: error.message
    });
  }
};

export const createPaymentLink = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      amount,
      currency,
      description,
      customerEmail,
      customerName,
      customerPhone,
      redirectUrl,
      webhookUrl,
      metadata
    } = req.body;

    const orderId = `ORD_${userId}_${Date.now()}`;

    const paymentLink = await monayFiatService.createPaymentLink({
      amount,
      currency,
      orderId,
      description,
      customerEmail: customerEmail || req.user?.email,
      customerName: customerName || req.user?.name,
      customerPhone: customerPhone || req.user?.phone,
      redirectUrl,
      webhookUrl,
      metadata: {
        ...metadata,
        userId,
        source: 'monay-app'
      }
    });

    const transaction = await Transaction.create({
      userId,
      orderId: paymentLink.orderId,
      externalId: paymentLink.paymentLinkId,
      amount,
      currency: currency || 'USD',
      type: 'payment_link',
      status: 'pending',
      provider: 'tillipay',
      description,
      metadata: {
        paymentUrl: paymentLink.paymentUrl,
        expiresAt: paymentLink.expiresAt,
        ...metadata
      }
    });

    logger.logInfo('Payment Link Created', {
      userId,
      transactionId: transaction.id,
      orderId: paymentLink.orderId,
      paymentLinkId: paymentLink.paymentLinkId
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment link created successfully',
      data: {
        transactionId: transaction.id,
        paymentLinkId: paymentLink.paymentLinkId,
        paymentUrl: paymentLink.paymentUrl,
        orderId: paymentLink.orderId,
        expiresAt: paymentLink.expiresAt
      }
    });
  } catch (error) {
    logger.logError('Create Payment Link Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create payment link',
      error: error.message
    });
  }
};

export const processCardPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      amount,
      currency,
      cardNumber,
      expMonth,
      expYear,
      cvv,
      cardHolderName,
      billing,
      metadata
    } = req.body;

    const orderId = `CARD_${userId}_${Date.now()}`;

    const payment = await monayFiatService.processCardPayment({
      amount,
      currency,
      orderId,
      cardNumber,
      expMonth,
      expYear,
      cvv,
      cardHolderName,
      billingFirstName: billing?.firstName,
      billingLastName: billing?.lastName,
      billingEmail: billing?.email || req.user?.email,
      billingPhone: billing?.phone || req.user?.phone,
      billingAddress: billing?.address,
      billingCity: billing?.city,
      billingState: billing?.state,
      billingPostalCode: billing?.postalCode,
      billingCountry: billing?.country,
      metadata: {
        ...metadata,
        userId,
        source: 'monay-app'
      }
    });

    const transaction = await Transaction.create({
      userId,
      orderId: payment.orderId,
      externalId: payment.transactionId,
      amount,
      currency: currency || 'USD',
      type: 'card_payment',
      status: payment.status.toLowerCase(),
      provider: 'tillipay',
      authorizationCode: payment.authorizationCode,
      metadata: {
        cardLastFour: cardNumber.slice(-4),
        cardType: detectCardType(cardNumber),
        ...metadata
      }
    });

    logger.logInfo('Card Payment Processed', {
      userId,
      transactionId: transaction.id,
      orderId: payment.orderId,
      status: payment.status
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: payment.message || 'Payment processed successfully',
      data: {
        transactionId: transaction.id,
        externalTransactionId: payment.transactionId,
        orderId: payment.orderId,
        status: payment.status,
        authorizationCode: payment.authorizationCode
      }
    });
  } catch (error) {
    logger.logError('Process Card Payment Error', error);
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Card payment failed',
      error: error.message
    });
  }
};

export const processACHPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      amount,
      currency,
      accountNumber,
      routingNumber,
      accountType,
      accountHolderName,
      customer,
      metadata
    } = req.body;

    const orderId = `ACH_${userId}_${Date.now()}`;

    const payment = await monayFiatService.processACHPayment({
      amount,
      currency,
      orderId,
      accountNumber,
      routingNumber,
      accountType,
      accountHolderName,
      customerFirstName: customer?.firstName || req.user?.firstName,
      customerLastName: customer?.lastName || req.user?.lastName,
      customerEmail: customer?.email || req.user?.email,
      customerPhone: customer?.phone || req.user?.phone,
      customerAddress: customer?.address,
      customerCity: customer?.city,
      customerState: customer?.state,
      customerPostalCode: customer?.postalCode,
      customerCountry: customer?.country,
      metadata: {
        ...metadata,
        userId,
        source: 'monay-app'
      }
    });

    const transaction = await Transaction.create({
      userId,
      orderId: payment.orderId,
      externalId: payment.transactionId,
      amount,
      currency: currency || 'USD',
      type: 'ach_payment',
      status: payment.status.toLowerCase(),
      provider: 'tillipay',
      metadata: {
        accountLastFour: accountNumber.slice(-4),
        accountType,
        estimatedSettlement: payment.estimatedSettlement,
        ...metadata
      }
    });

    logger.logInfo('ACH Payment Initiated', {
      userId,
      transactionId: transaction.id,
      orderId: payment.orderId,
      status: payment.status
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: payment.message || 'ACH payment initiated successfully',
      data: {
        transactionId: transaction.id,
        externalTransactionId: payment.transactionId,
        orderId: payment.orderId,
        status: payment.status,
        estimatedSettlement: payment.estimatedSettlement
      }
    });
  } catch (error) {
    logger.logError('Process ACH Payment Error', error);
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'ACH payment failed',
      error: error.message
    });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId,
        provider: 'tillipay'
      }
    });

    if (!transaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const status = await monayFiatService.getPaymentStatus(transaction.externalId);

    if (status.status !== transaction.status) {
      await transaction.update({
        status: status.status.toLowerCase(),
        metadata: {
          ...transaction.metadata,
          lastStatusCheck: new Date(),
          statusHistory: [
            ...(transaction.metadata?.statusHistory || []),
            {
              status: status.status,
              timestamp: new Date()
            }
          ]
        }
      });
    }

    logger.logInfo('Payment Status Retrieved', {
      userId,
      transactionId: transaction.id,
      status: status.status
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        transactionId: transaction.id,
        externalTransactionId: status.transactionId,
        status: status.status,
        amount: status.amount,
        currency: status.currency,
        orderId: status.orderId,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt
      }
    });
  } catch (error) {
    logger.logError('Get Payment Status Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId,
        provider: 'tillipay',
        status: ['completed', 'captured']
      }
    });

    if (!transaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Transaction not found or not eligible for refund'
      });
    }

    const refundAmount = amount || transaction.amount;
    
    if (refundAmount > transaction.amount) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Refund amount cannot exceed original transaction amount'
      });
    }

    const refund = await monayFiatService.refundPayment({
      transactionId: transaction.externalId,
      amount: refundAmount,
      reason,
      metadata: {
        originalTransactionId: transaction.id,
        userId
      }
    });

    const refundTransaction = await Transaction.create({
      userId,
      orderId: `REFUND_${transaction.orderId}`,
      externalId: refund.refundId,
      amount: refundAmount,
      currency: transaction.currency,
      type: 'refund',
      status: refund.status.toLowerCase(),
      provider: 'tillipay',
      metadata: {
        originalTransactionId: transaction.id,
        reason,
        processedAt: refund.processedAt
      }
    });

    await transaction.update({
      status: 'refunded',
      metadata: {
        ...transaction.metadata,
        refundTransactionId: refundTransaction.id,
        refundedAt: new Date()
      }
    });

    logger.logInfo('Payment Refunded', {
      userId,
      originalTransactionId: transaction.id,
      refundTransactionId: refundTransaction.id,
      refundId: refund.refundId,
      amount: refundAmount
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment refunded successfully',
      data: {
        refundTransactionId: refundTransaction.id,
        refundId: refund.refundId,
        originalTransactionId: transaction.id,
        amount: refundAmount,
        status: refund.status,
        processedAt: refund.processedAt
      }
    });
  } catch (error) {
    logger.logError('Refund Payment Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to refund payment',
      error: error.message
    });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount } = req.body;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId,
        provider: 'tillipay',
        status: 'authorized'
      }
    });

    if (!transaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Transaction not found or not eligible for capture'
      });
    }

    const captureAmount = amount || transaction.amount;

    const capture = await monayFiatService.capturePayment({
      transactionId: transaction.externalId,
      amount: captureAmount,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    await transaction.update({
      status: 'captured',
      amount: captureAmount,
      metadata: {
        ...transaction.metadata,
        capturedAt: capture.capturedAt,
        capturedAmount: captureAmount
      }
    });

    logger.logInfo('Payment Captured', {
      userId,
      transactionId: transaction.id,
      externalTransactionId: transaction.externalId,
      amount: captureAmount
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment captured successfully',
      data: {
        transactionId: transaction.id,
        externalTransactionId: transaction.externalId,
        amount: captureAmount,
        status: capture.status,
        capturedAt: capture.capturedAt
      }
    });
  } catch (error) {
    logger.logError('Capture Payment Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to capture payment',
      error: error.message
    });
  }
};

export const voidPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId,
        provider: 'tillipay',
        status: ['authorized', 'pending']
      }
    });

    if (!transaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Transaction not found or not eligible for void'
      });
    }

    const voidResult = await monayFiatService.voidPayment({
      transactionId: transaction.externalId,
      reason,
      metadata: {
        transactionId: transaction.id,
        userId
      }
    });

    await transaction.update({
      status: 'voided',
      metadata: {
        ...transaction.metadata,
        voidedAt: voidResult.voidedAt,
        voidReason: reason
      }
    });

    logger.logInfo('Payment Voided', {
      userId,
      transactionId: transaction.id,
      externalTransactionId: transaction.externalId,
      reason
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Payment voided successfully',
      data: {
        transactionId: transaction.id,
        externalTransactionId: transaction.externalId,
        status: voidResult.status,
        voidedAt: voidResult.voidedAt
      }
    });
  } catch (error) {
    logger.logError('Void Payment Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to void payment',
      error: error.message
    });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      status,
      orderId
    } = req.query;

    const history = await monayFiatService.getTransactionHistory({
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      orderId
    });

    const userTransactions = await Transaction.findAll({
      where: {
        userId,
        provider: 'tillipay',
        externalId: history.transactions.map(t => t.transactionId)
      },
      attributes: ['id', 'externalId']
    });

    const transactionMap = userTransactions.reduce((acc, t) => {
      acc[t.externalId] = t.id;
      return acc;
    }, {});

    const enrichedTransactions = history.transactions.map(t => ({
      ...t,
      internalTransactionId: transactionMap[t.transactionId]
    }));

    logger.logInfo('Transaction History Retrieved', {
      userId,
      count: enrichedTransactions.length,
      totalCount: history.totalCount
    });

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions: enrichedTransactions,
        totalCount: history.totalCount,
        hasMore: history.hasMore,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    logger.logError('Get Transaction History Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get transaction history',
      error: error.message
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-tillipay-signature'] || req.headers['x-signature'];
    const payload = req.body;

    const result = await monayFiatService.handleWebhook(payload, signature);

    if (!result.success) {
      logger.logError('Webhook Validation Failed', { signature });
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const transaction = await Transaction.findOne({
      where: {
        externalId: result.transactionId,
        provider: 'tillipay'
      }
    });

    if (transaction) {
      await transaction.update({
        status: result.status.toLowerCase(),
        metadata: {
          ...transaction.metadata,
          webhookData: result.data,
          lastWebhookAt: new Date()
        }
      });

      logger.logInfo('Webhook Processed', {
        transactionId: transaction.id,
        externalTransactionId: result.transactionId,
        eventType: result.eventType,
        status: result.status
      });
    }

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.logError('Handle Webhook Error', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};

function detectCardType(cardNumber) {
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanNumber)) {
      return type;
    }
  }
  
  return 'unknown';
}

export default {
  testConnection,
  createPaymentLink,
  processCardPayment,
  processACHPayment,
  getPaymentStatus,
  refundPayment,
  capturePayment,
  voidPayment,
  getTransactionHistory,
  handleWebhook
};