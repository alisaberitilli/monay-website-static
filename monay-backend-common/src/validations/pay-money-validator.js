import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility.js';

const Joi = BaseJoi.extend(Extension);

const payMoneySchema = Joi.object().keys({
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
    .allow(''),
  cardId: Joi.string()
    .optional()
    .empty()
    .allow(''),
  paymentMethod: Joi.string()
    .valid('card', 'wallet', 'Card', 'Wallet')
    .required(),
  cardType: Joi.string()
    .empty()
    .allow('')
    .optional(),
  cardNumber: Joi.string()
    .empty()
    .allow('')
    .optional(),
  nameOnCard: Joi.string()
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
    .required(),
  parentId: Joi.allow()
});

export default {
  payMoneySchema
};