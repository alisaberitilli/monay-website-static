import BaseJoi from '@hapi/joi';
import Extension from '@hapi/joi-date';

const Joi = BaseJoi.extend(Extension);

const uploadSchema = Joi.object({
  mediaType: Joi.string()
    .valid('image', 'icon', 'audio', 'video', 'pdf')
    .required(),
  mediaFor: Joi.string()
    .valid('user', 'user-kyc', 'message')
    .required(),
  apiName: Joi.string()
    .optional()
    .empty()
    .allow(''),
});

export default {
  uploadSchema,
};
