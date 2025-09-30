import Joi from 'joi';
import HttpStatus from 'http-status';
import { validationResult } from 'express-validator';

/**
 * Joi-based validate request (legacy)
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
*/
const joiValidateRequest = options => async (req, res, next) => {
  const joiOptions = {
    abortEarly: false,
    language: {
      key: '{{key}} ',
    },
  };
  try {
    let objIn = req.body
    if (options.type === 'query') {
      objIn = req.query
    }
    await Joi.validate(objIn, options.schema, joiOptions);
    next();
  } catch (error) {
    const errors = [];
    if (error.isJoi) {
      error.details.forEach((errorData) => {
        const errorObject = {
          message: errorData.message,
          field: errorData.path.join('_'),
          type: errorData.type,
        };

        errors.push(errorObject);
      });
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        data: [],
        error: errors,
        message: '',
      });
    }
  }
};

/**
 * Express-validator middleware for validating request
 * Used by routes that use express-validator (like TilliPay)
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      data: [],
      error: errors.array(),
      message: 'Validation failed'
    });
  }
  next();
};

// Default export for Joi-based validation (legacy)
export default joiValidateRequest;
