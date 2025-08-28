import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility';

const Joi = BaseJoi.extend(Extension);

const addMoneyByCardSchema = Joi.object().keys({
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
    .empty()
    .allow('')
    .optional(),
  cardId: Joi.string()
    .empty()
    .allow('')
    .optional(),
  cardNumber: Joi.string()
    .min(2)
    .max(250)
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
  cardType: Joi.string()
    .empty()
    .allow('')
    .optional(),
  cvv: Joi.string()
    .regex(/^(?!0+$)[0-9]{3,4}$/)
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
  nameOnCard: Joi.string()
    .empty()
    .allow('')
    .optional(),
  saveCard: Joi.string()
    .empty()
    .allow('')
    .optional(),
  mpin: Joi.string()
    .regex(/^[0-9]{4}$/)
    .length(4)
    .required()
});

const addMoneyByBankSchema = Joi.object().keys({
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
  bankId: Joi.number().empty()
    .allow('').optional(),
  accountNumber: Joi.string()
    .max(250)
    .empty()
    .allow('')
    .optional(),
  bankName: Joi.string()
    .empty()
    .allow('')
    .optional(),
  routingNumber: Joi.string()
    .empty()
    .allow('')
    .optional(),
  mpin: Joi.string()
    .regex(/^[0-9]{4}$/)
    .length(4)
    .required()
});

export default {
  addMoneyByCardSchema,
  addMoneyByBankSchema
};
