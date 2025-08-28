import Joi from 'joi';

const rolePermissionSchema = Joi.object({
  roleId: Joi.number()
    .optional()
    .empty()
    .allow(''),
  role: Joi.string().required(),
  rolePermission: Joi.array().items(Joi.object().required()).min(1).required()
});

export default {
  rolePermissionSchema
};
