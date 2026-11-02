const Stripe = require('stripe');
const envConfig = require('../../config/env.config');
const ApiError = require('../../exceptions/ApiError');
const { status: httpStatus } = require('http-status');

let stripeInstance = null;
let currentKey = null;

const getStripe = () => {
  const secretKey = envConfig.stripe.secretKey;
  if (!secretKey) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe secret key is not configured. Please set STRIPE_SK in environment.'
    );
  }

  if (!stripeInstance || currentKey !== secretKey) {
    stripeInstance = new Stripe(secretKey);
    currentKey = secretKey;
  }

  return stripeInstance;
};

module.exports = {
  getStripe,
};

