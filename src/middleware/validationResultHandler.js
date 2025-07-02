import { validationResult } from 'express-validator';
import { UnprocessableEntityError } from '../utils/customErrors.js';

/**
 * Middleware to check for validation errors from express-validator.
 * If errors exist, it formats them and passes an UnprocessableEntityError to the next error handler.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to be more readable or structured if needed
    const extractedErrors = errors.array().map(err => ({
      field: err.path, // 'path' is the field name in newer versions
      message: err.msg,
      value: err.value, // The value that failed validation
    }));
    // Pass a custom error with the validation details
    return next(new UnprocessableEntityError('Validation failed', extractedErrors));
  }
  next();
};
