import Joi from 'joi';
import HttpStatus from 'http-status';

/**
 * validate request 
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
*/
const validateRequest = options => async (req, res, next) => {
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

export default validateRequest;
