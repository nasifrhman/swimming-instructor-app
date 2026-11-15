/**
 * Standard API response formatter
 * @param {Object} response
 * @param {string|boolean} [response.status]
 * @param {number} [response.statusCode]
 * @param {string} [response.message]
 * @param {string} [response.type]
 * @param {any} [response.data]
 * @param {string} [response.accessToken]
 * @param {string} [response.refreshToken]
 * @param {string} [response.signUpToken]
 * @param {string} [response.passcodeToken]
 * @param {string} [response.forgetPasswordToken]
 * @param {Object} [response.pagination]
 * @param {Array} [response.errors]
 * @returns {Object}
 */
const response = (response = {}) => {
  const responseObject = {
    status: response.status !== undefined ? response.status : true,
    statusCode: response.statusCode || 200,
    message: response.message || 'Success',
    data: {},
    errors: response.errors || []
  };

  if (response.type) {
    responseObject.data.type = response.type;
  }
  if (response.data !== undefined && response.data !== null) {
    responseObject.data.attributes = response.data;
  }
  if (response.accessToken) {
    responseObject.data.accessToken = response.accessToken;
  }
  if (response.refreshToken) {
    responseObject.data.refreshToken = response.refreshToken;
  }
  if (response.signUpToken) {
    responseObject.data.signUpToken = response.signUpToken;
  }
  if (response.passcodeToken) {
    responseObject.data.passcodeToken = response.passcodeToken;
  }
  if (response.forgetPasswordToken) {
    responseObject.data.forgetPasswordToken = response.forgetPasswordToken;
  }
  if (response.pagination) {
    responseObject.pagination = response.pagination;
  }

  return responseObject;
};

module.exports = response;

