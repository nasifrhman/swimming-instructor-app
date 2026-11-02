class ApiError extends Error {
  constructor(statusCode = 500, message = 'An unexpected error occurred', stack = '') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.isOperational = true;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;

