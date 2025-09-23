import { validationResult } from 'express-validator';

/**
 * Validation middleware that checks express-validator results
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

export default validateRequest;