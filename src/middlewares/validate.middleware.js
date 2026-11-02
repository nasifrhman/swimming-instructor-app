const ApiError = require('../exceptions/ApiError');
const { status: httpStatus } = require('http-status');

/**
 * Request Validation Middleware
 * Validates request params, query, and body against provided schema rules.
 *
 * Example schema:
 * {
 *   body: {
 *     email: { required: true, type: 'string', match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
 *     password: { required: true, minLength: 6 }
 *   },
 *   params: {
 *     id: { required: true, match: /^[0-9a-fA-F]{24}$/ }
 *   }
 * }
 */
const validate = (schema) => (req, res, next) => {
  if (!schema) return next();

  const errors = [];
  const targets = ['params', 'query', 'body'];

  for (const target of targets) {
    if (schema[target]) {
      const rules = schema[target];
      const data = req[target] || {};

      for (const field of Object.keys(rules)) {
        const rule = rules[field];
        const val = data[field];

        // Required check
        if (rule.required && (val === undefined || val === null || val === '')) {
          errors.push(`'${field}' in ${target} is required.`);
          continue;
        }

        if (val !== undefined && val !== null && val !== '') {
          // Type check
          if (rule.type) {
            if (rule.type === 'array' && !Array.isArray(val)) {
              errors.push(`'${field}' in ${target} must be an array.`);
            } else if (rule.type === 'number' && (typeof val !== 'number' && isNaN(Number(val)))) {
              errors.push(`'${field}' in ${target} must be a number.`);
            } else if (rule.type !== 'array' && rule.type !== 'number' && typeof val !== rule.type) {
              errors.push(`'${field}' in ${target} must be of type ${rule.type}.`);
            }
          }

          // Min length
          if (rule.minLength !== undefined && typeof val === 'string' && val.length < rule.minLength) {
            errors.push(`'${field}' in ${target} must be at least ${rule.minLength} characters long.`);
          }

          // Max length
          if (rule.maxLength !== undefined && typeof val === 'string' && val.length > rule.maxLength) {
            errors.push(`'${field}' in ${target} must be at most ${rule.maxLength} characters long.`);
          }

          // Regex pattern
          if (rule.match instanceof RegExp && !rule.match.test(String(val))) {
            errors.push(`'${field}' in ${target} format is invalid.`);
          }

          // Enum check
          if (Array.isArray(rule.enum) && !rule.enum.includes(val)) {
            errors.push(`'${field}' in ${target} must be one of: ${rule.enum.join(', ')}.`);
          }

          // Custom validator function
          if (typeof rule.validator === 'function') {
            const customResult = rule.validator(val, data, req);
            if (customResult !== true) {
              errors.push(typeof customResult === 'string' ? customResult : `'${field}' in ${target} failed validation.`);
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(httpStatus.BAD_REQUEST, errors.join(' ')));
  }

  next();
};

module.exports = validate;

