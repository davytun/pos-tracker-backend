import AppError from '../utils/customErrors.js';
import dotenv from 'dotenv';

dotenv.config();

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // Or use BadRequestError
};

const handleDuplicateFieldsDB = (err) => {
  // Extract value from error message (regex might be needed for robustness)
  let value = "Unknown";
  if (err.errmsg && err.errmsg.match(/(["'])(\\?.)*?\1/)) {
    value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  } else if (err.keyValue) {
    value = Object.values(err.keyValue).join(', ');
  }
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400); // Or use ConflictError / BadRequestError
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  // Consider using UnprocessableEntityError for this if you want to send back 'errors' array
  return new AppError(message, 400); // Or use UnprocessableEntityError
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401); // UnauthorizedError
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401); // UnauthorizedError


const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    ...(err.errors && { errors: err.errors }), // Include validation errors if present
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }), // Include validation errors if present for UnprocessableEntityError
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // 1) Log error
    console.error('ERROR 💥:', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};


const errorHandlerMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name }; // Avoid modifying original err object directly initially

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error); // MongoDB duplicate key error
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error); // Mongoose validation
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    // Add more specific error handlers here as needed

    sendErrorProd(error, res);
  } else { // Default to development if NODE_ENV is not set
    sendErrorDev(err,res);
  }
};

export default errorHandlerMiddleware;
