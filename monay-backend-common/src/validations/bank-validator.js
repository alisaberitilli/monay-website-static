import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility.js';

const Joi = BaseJoi.extend(Extension);

const createRequestSchema = Joi.object().keys({
  accountHolderName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'accountHolderName'),
      };
    }),
  accountNumber: Joi.string()
    .regex(/^[0-9]*$/)
    .min(2)
    .max(30)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'accountNumber'),
      };
    }),
  bankName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'bankName'),
      };
    }),
  routingNumber: Joi.string()
    .min(2)
    .max(25)
    .required(),
  swiftCode: Joi.string()
    .optional()
    .empty()
    .allow('')
});

export default {
  createRequestSchema
};
