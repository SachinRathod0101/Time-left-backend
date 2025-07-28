/**
 * Utility functions for standardized API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object|Array} data - Response data
 */
exports.successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Array} errors - Array of validation errors
 */
exports.errorResponse = (res, statusCode = 500, message = 'Server Error', errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined
  });
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {String} message - Not found message
 */
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return exports.errorResponse(res, 404, message);
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Unauthorized message
 */
exports.unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return exports.errorResponse(res, 401, message);
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Forbidden message
 */
exports.forbiddenResponse = (res, message = 'Forbidden access') => {
  return exports.errorResponse(res, 403, message);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
exports.validationErrorResponse = (res, errors) => {
  return exports.errorResponse(res, 400, 'Validation Error', errors);
};