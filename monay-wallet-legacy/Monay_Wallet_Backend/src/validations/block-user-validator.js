import Joi from 'joi';

const blockUserSchema = Joi.object({
  blockUserId: Joi.string()
    .required(),
});

export default {
  blockUserSchema,
};
