import express from 'express';
import * as monayFiatController from '../controllers/monay-fiat-controller.js';
import auth from '../middleware-app/auth-middleware.js';
import rateLimiter from '../middleware-app/rate-limiter-middleware.js';
import { validateRequest } from '../middleware-app/validate-middleware.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

const paymentLinkValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('description').notEmpty().withMessage('Description is required'),
  body('customerEmail').optional().isEmail().withMessage('Invalid email'),
  body('customerName').optional().isString(),
  body('customerPhone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('redirectUrl').optional().isURL().withMessage('Invalid redirect URL'),
  body('webhookUrl').optional().isURL().withMessage('Invalid webhook URL'),
];

const cardPaymentValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('cardNumber').isCreditCard().withMessage('Invalid card number'),
  body('expMonth').isInt({ min: 1, max: 12 }).withMessage('Invalid expiry month'),
  body('expYear').isInt({ min: new Date().getFullYear() }).withMessage('Invalid expiry year'),
  body('cvv').isLength({ min: 3, max: 4 }).isNumeric().withMessage('Invalid CVV'),
  body('cardHolderName').notEmpty().withMessage('Card holder name is required'),
  body('billing.email').optional().isEmail().withMessage('Invalid billing email'),
  body('billing.phone').optional().isMobilePhone().withMessage('Invalid billing phone'),
  body('billing.postalCode').optional().isPostalCode('any').withMessage('Invalid postal code'),
];

const achPaymentValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isIn(['USD']).withMessage('ACH only supports USD'),
  body('accountNumber').isNumeric().isLength({ min: 4, max: 17 }).withMessage('Invalid account number'),
  body('routingNumber').isNumeric().isLength({ min: 9, max: 9 }).withMessage('Routing number must be 9 digits'),
  body('accountType').isIn(['checking', 'savings']).withMessage('Account type must be checking or savings'),
  body('accountHolderName').notEmpty().withMessage('Account holder name is required'),
  body('customer.email').optional().isEmail().withMessage('Invalid customer email'),
  body('customer.phone').optional().isMobilePhone().withMessage('Invalid customer phone'),
];

const refundValidation = [
  param('transactionId').isUUID().withMessage('Invalid transaction ID'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
];

const captureValidation = [
  param('transactionId').isUUID().withMessage('Invalid transaction ID'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
];

const voidValidation = [
  param('transactionId').isUUID().withMessage('Invalid transaction ID'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
];

const transactionHistoryValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded', 'voided']).withMessage('Invalid status'),
];

router.get(
  '/test-connection',
  auth,
  monayFiatController.testConnection
);

router.post(
  '/payment-link',
  auth,
  rateLimiter.paymentRateLimit,
  paymentLinkValidation,
  validateRequest,
  monayFiatController.createPaymentLink
);

router.post(
  '/payment/card',
  auth,
  rateLimiter.paymentRateLimit,
  cardPaymentValidation,
  validateRequest,
  monayFiatController.processCardPayment
);

router.post(
  '/payment/ach',
  auth,
  rateLimiter.paymentRateLimit,
  achPaymentValidation,
  validateRequest,
  monayFiatController.processACHPayment
);

router.get(
  '/payment/status/:transactionId',
  auth,
  param('transactionId').isUUID().withMessage('Invalid transaction ID'),
  validateRequest,
  monayFiatController.getPaymentStatus
);

router.post(
  '/payment/refund/:transactionId',
  auth,
  refundValidation,
  validateRequest,
  monayFiatController.refundPayment
);

router.post(
  '/payment/capture/:transactionId',
  auth,
  captureValidation,
  validateRequest,
  monayFiatController.capturePayment
);

router.post(
  '/payment/void/:transactionId',
  auth,
  voidValidation,
  validateRequest,
  monayFiatController.voidPayment
);

router.get(
  '/transactions',
  auth,
  transactionHistoryValidation,
  validateRequest,
  monayFiatController.getTransactionHistory
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  monayFiatController.handleWebhook
);

export default router;