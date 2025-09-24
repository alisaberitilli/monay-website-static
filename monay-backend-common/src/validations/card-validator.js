import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility.js';

const Joi = BaseJoi.extend(Extension);

const createRequestSchema = Joi.object().keys({
  cardNumber: Joi.string()
    .regex(/^[0-9]*$/)
    .min(2)
    .max(20)
    .required(),
  nameOnCard: Joi.string()
    .max(50)
    .required()
    .error(() => {
      return {
        message: utility.getMessage({}, false, 'nameOnCard'),
      };
    }),
  month: Joi.string()
    .regex(/^(0?[1-9]|1[012])$/)
    .min(2)
    .max(2)
    .required(),
  year: Joi.string()
    .regex(/^\d{4}$/)
    .min(4)
    .max(4)
    .required(),
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
});

export default {
  createRequestSchema
};
