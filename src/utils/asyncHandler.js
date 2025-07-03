/**
 * @desc Wraps asynchronous route handlers to catch errors and pass them to the global error handler.
 * @param {Function} fn - The asynchronous route handler function.
 * @returns {Function} A new function that handles promise rejections.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
