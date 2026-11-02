const mongoose = require('mongoose');
const { status: httpStatus } = require('http-status');
const ApiError = require('../exceptions/ApiError');
const response = require('../utils/response');
const logger = require('../utils/logger');
const unlinkFile = require('../infrastructure/storage/fileCleanup.util');

function errorConverter(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message || 'An unexpected error occurred';

    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = Object.values(error.errors).map((e) => e.message).join(', ');
    } else if (error instanceof mongoose.Error.CastError) {
      statusCode = httpStatus.BAD_REQUEST;
      message = `Invalid ${error.path}: ${error.value}`;
    } else if (error.code === 11000) {
      statusCode = httpStatus.CONFLICT;
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `Duplicate key error: ${field} already exists`;
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = httpStatus.UNAUTHORIZED;
      message = 'Invalid authentication token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = httpStatus.UNAUTHORIZED;
      message = 'Authentication token expired';
    }

    error = new ApiError(statusCode, message, err.stack);
  }

  next(error);
}

function notFoundHandler(req, res, next) {
  const message = `Requested API not found: ${req.method} ${req.originalUrl}`;
  next(new ApiError(httpStatus.NOT_FOUND, message));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && typeof err.statusCode === 'number' ? err.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
  const responseMessage = err.message || 'An unexpected error occurred';

  logger.error({
    message: responseMessage,
    status: statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  // Cleanup files on disk if an error occurred during request processing
  if (req.file && req.file.path) {
    unlinkFile(req.file.path);
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach((f) => f?.path && unlinkFile(f.path));
    } else if (typeof req.files === 'object') {
      Object.values(req.files).forEach((val) => {
        if (Array.isArray(val)) val.forEach((f) => f?.path && unlinkFile(f.path));
        else if (val?.path) unlinkFile(val.path);
      });
    }
  }

  res.status(statusCode).json(response({
    status: 'Error',
    statusCode,
    type: err.name || 'Error',
    message: responseMessage,
    data: null,
  }));
}

module.exports = {
  errorConverter,
  notFoundHandler,
  errorHandler,
};

