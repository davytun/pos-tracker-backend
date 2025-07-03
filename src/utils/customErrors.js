/**
 * @desc Base class for custom application errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Differentiates operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * @desc Error for bad requests (e.g., invalid input)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * @desc Error for unauthorized access
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * @desc Error for forbidden access
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * @desc Error for resources not found
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * @desc Error for conflicts (e.g., resource already exists)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * @desc Error for unprocessable entity (e.g., validation errors from a library)
 */
export class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable Entity', errors) {
        super(message, 422);
        if (errors) {
            this.errors = errors; // To hold detailed validation errors
        }
    }
}

export default AppError;
