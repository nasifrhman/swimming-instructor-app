const { getStripe } = require('../infrastructure/payment/stripe.client');
const StripeService = require('../infrastructure/payment/stripe.service');

module.exports = {
  getStripe,
  createPaymentIntent: StripeService.createPaymentIntent,
  retrievePaymentIntent: StripeService.retrievePaymentIntent,
  cancelPaymentIntent: StripeService.cancelPaymentIntent,
  createRefund: StripeService.createRefund,
  createCheckoutSession: StripeService.createCheckoutSession,
  retrieveCheckoutSession: StripeService.retrieveCheckoutSession,
  expireCheckoutSession: StripeService.expireCheckoutSession,
  constructWebhookEvent: StripeService.constructWebhookEvent,
};
