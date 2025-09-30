import express from 'express';
import * as stripeController from '../controllers/stripe-controller.js';
import auth from '../middleware-app/auth-middleware.js';
import rateLimiter from '../middleware-app/rate-limiter-middleware.js';
import { validateRequest } from '../middleware-app/validate-middleware.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation schemas
const customerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
];

const cardPaymentValidation = [
  body('amount').isNumeric().isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('cardToken').notEmpty().withMessage('Card token is required'),
  body('customerId').optional().isString(),
  body('description').optional().isString(),
  body('saveCard').optional().isBoolean()
];

const achPaymentValidation = [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('bankAccount.accountNumber').notEmpty().withMessage('Account number is required'),
  body('bankAccount.routingNumber').isLength({ min: 9, max: 9 }).withMessage('Routing number must be 9 digits'),
  body('bankAccount.accountHolderName').notEmpty().withMessage('Account holder name is required'),
  body('bankAccount.accountType').optional().isIn(['checking', 'savings']).withMessage('Invalid account type')
];

const wireTransferValidation = [
  body('amount').isNumeric().isFloat({ min: 100 }).withMessage('Minimum wire amount is $100'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('description').optional().isString()
];

const stablecoinPaymentValidation = [
  body('amount').isNumeric().isFloat({ min: 10 }).withMessage('Minimum amount is $10'),
  body('stablecoin').isIn(['USDC', 'USDT', 'DAI']).withMessage('Invalid stablecoin'),
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('walletAddress').notEmpty().withMessage('Wallet address is required'),
  body('description').optional().isString()
];

const paymentLinkValidation = [
  body('amount').isNumeric().isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('description').notEmpty().withMessage('Description is required'),
  body('successUrl').optional().isURL().withMessage('Invalid success URL'),
  body('cancelUrl').optional().isURL().withMessage('Invalid cancel URL')
];

const refundValidation = [
  param('paymentIntentId').notEmpty().withMessage('Payment Intent ID is required'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().isString()
];

const subscriptionValidation = [
  body('customerId').notEmpty().withMessage('Customer ID is required'),
  body('priceId').notEmpty().withMessage('Price ID is required'),
  body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
];

// Test connection
router.get(
  '/test-connection',
  auth,
  stripeController.testConnection
);

// Customer management
router.post(
  '/customer',
  auth,
  customerValidation,
  validateRequest,
  stripeController.createCustomer
);

// Payment processing
router.post(
  '/payment/card',
  auth,
  rateLimiter.paymentRateLimit,
  cardPaymentValidation,
  validateRequest,
  stripeController.processCardPayment
);

router.post(
  '/payment/ach',
  auth,
  rateLimiter.paymentRateLimit,
  achPaymentValidation,
  validateRequest,
  stripeController.processACHPayment
);

router.post(
  '/payment/wire',
  auth,
  rateLimiter.paymentRateLimit,
  wireTransferValidation,
  validateRequest,
  stripeController.processWireTransfer
);

router.post(
  '/payment/stablecoin',
  auth,
  rateLimiter.paymentRateLimit,
  stablecoinPaymentValidation,
  validateRequest,
  stripeController.processStablecoinPayment
);

// Payment link
router.post(
  '/payment-link',
  auth,
  paymentLinkValidation,
  validateRequest,
  stripeController.createPaymentLink
);

// Payment status
router.get(
  '/payment/status/:paymentIntentId',
  auth,
  param('paymentIntentId').notEmpty(),
  validateRequest,
  stripeController.getPaymentStatus
);

// Refunds
router.post(
  '/payment/refund/:paymentIntentId',
  auth,
  refundValidation,
  validateRequest,
  stripeController.processRefund
);

// Subscriptions
router.post(
  '/subscription',
  auth,
  subscriptionValidation,
  validateRequest,
  stripeController.createSubscription
);

router.delete(
  '/subscription/:subscriptionId',
  auth,
  param('subscriptionId').notEmpty(),
  validateRequest,
  stripeController.cancelSubscription
);

// Payment fees calculator
router.get(
  '/fees',
  auth,
  query('amount').isNumeric().withMessage('Amount is required'),
  query('paymentMethod').isIn(['card', 'us_bank_account', 'customer_balance', 'crypto']).withMessage('Invalid payment method'),
  validateRequest,
  stripeController.getPaymentFees
);

// Payment limits validation
router.post(
  '/validate-limits',
  auth,
  body('amount').isNumeric().withMessage('Amount is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  validateRequest,
  stripeController.validatePaymentLimits
);

// Webhook endpoint (no auth required, Stripe signature validation instead)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

export default router;