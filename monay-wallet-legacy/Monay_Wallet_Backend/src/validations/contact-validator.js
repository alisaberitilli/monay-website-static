import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';

const Joi = BaseJoi.extend(Extension);

const contactSchema = Joi.object().keys({
  contacts: Joi.array()
    .required()
});

export default {
  contactSchema
};
