import Joi from '@hapi/joi';

const paymentLinkSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
  description: Joi.string().required(),
  customerEmail: Joi.string().email().optional(),
  customerName: Joi.string().optional(),
  customerPhone: Joi.string().optional(),
  redirectUrl: Joi.string().uri().optional(),
  webhookUrl: Joi.string().uri().optional(),
  metadata: Joi.object().optional()
});

const cardPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP').default('USD'),
  cardNumber: Joi.string().creditCard().required(),
  expMonth: Joi.number().integer().min(1).max(12).required(),
  expYear: Joi.number().integer().min(new Date().getFullYear()).required(),
  cvv: Joi.string().length(3).pattern(/^\d+$/).required()
    .when('cardNumber', {
      is: Joi.string().pattern(/^3[47]/),
      then: Joi.string().length(4).pattern(/^\d+$/)
    }),
  cardHolderName: Joi.string().required(),
  billing: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    country: Joi.string().length(2).default('US')
  }).optional(),
  metadata: Joi.object().optional()
});

const achPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('USD').default('USD'),
  accountNumber: Joi.string().pattern(/^\d+$/).min(4).max(17).required(),
  routingNumber: Joi.string().pattern(/^\d{9}$/).required(),
  accountType: Joi.string().valid('checking', 'savings').default('checking'),
  accountHolderName: Joi.string().required(),
  customer: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    postalCode: Joi.string().optional(),
    country: Joi.string().length(2).default('US')
  }).optional(),
  metadata: Joi.object().optional()
});

const refundSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  reason: Joi.string().optional()
});

const captureSchema = Joi.object({
  amount: Joi.number().positive().optional()
});

const voidSchema = Joi.object({
  reason: Joi.string().optional()
});

const transactionHistorySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  limit: Joi.number().integer().min(1).max(500).default(100),
  offset: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'voided', 'captured', 'authorized').optional(),
  orderId: Joi.string().optional()
});

export const validatePaymentLink = (data) => {
  const { error, value } = paymentLinkSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateCardPayment = (data) => {
  const { error, value } = cardPaymentSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateACHPayment = (data) => {
  const { error, value } = achPaymentSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateRefund = (data) => {
  const { error, value } = refundSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateCapture = (data) => {
  const { error, value } = captureSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateVoid = (data) => {
  const { error, value } = voidSchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export const validateTransactionHistory = (data) => {
  const { error, value } = transactionHistorySchema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
  return value;
};

export default {
  validatePaymentLink,
  validateCardPayment,
  validateACHPayment,
  validateRefund,
  validateCapture,
  validateVoid,
  validateTransactionHistory
};