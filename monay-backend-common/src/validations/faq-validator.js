import Joi from 'joi';

const createFaqSchema = Joi.object({
  question: Joi.string()
    .min(3)
    .max(200)
    .required(),
  answer: Joi.string()
    .min(3)
    .max(1000)
    .required(),
  userType: Joi.string()
    .valid('user', 'merchant')
    .required()
});

export default {
  createFaqSchema,
};
