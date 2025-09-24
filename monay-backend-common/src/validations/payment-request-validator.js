import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility.js';

const Joi = BaseJoi.extend(Extension);

const paymentRequestSchema = Joi.object().keys({
  toUserId: Joi.number().required(),
  amount: Joi.string()
    .min(1)
    .regex(/^[1-9]\d*(\.\d{1,2})?$/)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'AMOUNT_REGEX'),
          }
        },
      },
    }),
  message: Joi.string()
    .max(500)
    .optional()
    .empty()
    .allow('')
});

const payRequestMoneySchema = Joi.object().keys({
  requestId: Joi.number().required(),
  toUserId: Joi.number().required(),
  amount: Joi.string()
    .min(1)
    .regex(/^[1-9]\d*(\.\d{1,2})?$/)
    .required()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'AMOUNT_REGEX'),
          }
        },
      },
    }),
  message: Joi.string()
    .optional()
    .empty()
    .allow(''),
  cardType: Joi.string()
    .optional()
    .empty()
    .allow(''),
  cardId: Joi.string()
    .optional()
    .empty()
    .allow(''),
  paymentMethod: Joi.string()
    .valid('card', 'wallet')
    .required(),
  cardNumber: Joi.string()
    .empty()
    .allow('')
    .optional(),
  nameOnCard: Joi.string()
    .empty()
    .allow('')
    .optional(),
  parentId: Joi.string()
    .empty()
    .allow('')
    .optional(),
  month: Joi.string()
    .empty()
    .allow('')
    .optional(),
  year: Joi.string()
    .empty()
    .allow('')
    .optional(),
  cvv: Joi.string()
    .regex(/^(?!0+$)[0-9]{3,4}$/)
    .empty()
    .allow('')
    .optional()
    .options({
      language: {
        string: {
          regex: {
            base: utility.getMessage({}, false, 'AMOUNT_REGEX'),
          }
        },
      },
    }),
  saveCard: Joi.string()
    .empty()
    .allow('')
    .optional(),
  mpin: Joi.string()
    .regex(/^[0-9]{4}$/)
    .length(4)
    .required()
});

const declineRequestSchema = Joi.object().keys({
  requestId: Joi.number().required(),
  declineReason: Joi.string()
    .max(500)
    .optional()
    .empty()
    .allow('')
});


export default {
  paymentRequestSchema,
  payRequestMoneySchema,
  declineRequestSchema
};
