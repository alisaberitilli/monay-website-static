import Joi from 'joi';

const createCmsSchema = Joi.object({
  pageName: Joi.string()
    .min(2)
    .max(100)
    .required(),
  pageContent: Joi.string().required()
});

export default {
  createCmsSchema,
};
