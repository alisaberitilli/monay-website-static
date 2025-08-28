import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';
import utility from '../services/utility';

const Joi = BaseJoi.extend(Extension);

const withdrawalMoneyToBankSchema = Joi.object().keys({
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
  bankId: Joi.number().min(1).required(),
  mpin: Joi.string()
    .regex(/^[0-9]{4}$/)
    .length(4)
    .required()
});

const changeStatusSchema = Joi.object({
  status: Joi.string()
    .valid('completed', 'cancelled', 'failed')
    .required(),
});

export default {
  withdrawalMoneyToBankSchema,
  changeStatusSchema
}