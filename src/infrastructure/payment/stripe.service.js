const { getStripe } = require('./stripe.client');
const ApiError = require('../../exceptions/ApiError');
const { status: httpStatus } = require('http-status');

class StripeService {
  /**
   * Create Stripe PaymentIntent
   */
  static async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    receiptEmail,
    metadata = {},
    description = 'Swimletes Swimming Lesson Booking'
  }) {
    const stripe = getStripe();
    const amountInCents = Math.round(Number(amount) * 100);

    if (!amountInCents || amountInCents <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
    }

    const params = {
      amount: amountInCents,
      currency: String(currency || 'usd').toLowerCase(),
      automatic_payment_methods: {
        enabled: true
      },
      metadata,
      description
    };

    if (customerId) params.customer = customerId;
    if (receiptEmail) params.receipt_email = receiptEmail;

    return stripe.paymentIntents.create(params);
  }

  static async retrievePaymentIntent(paymentIntentId) {
    const stripe = getStripe();
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }

  static async cancelPaymentIntent(paymentIntentId) {
    const stripe = getStripe();
    return stripe.paymentIntents.cancel(paymentIntentId);
  }

  static async createRefund({ paymentIntentId, amount, reason, metadata = {} }) {
    const stripe = getStripe();
    const refundParams = {
      payment_intent: paymentIntentId,
      metadata
    };

    if (amount && Number(amount) > 0) {
      refundParams.amount = Math.round(Number(amount) * 100);
    }
    if (reason) {
      refundParams.reason = reason;
    }

    return stripe.refunds.create(refundParams);
  }

  static async createCheckoutSession({
    amount,
    currency = 'usd',
    customerEmail,
    clientReferenceId,
    successUrl,
    cancelUrl,
    metadata = {},
    description = 'Swimletes Swimming Lesson Booking',
    lineItems
  }) {
    const stripe = getStripe();
    const amountInCents = Math.round(Number(amount) * 100);

    if (!amountInCents || amountInCents <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid payment amount');
    }

    const items = lineItems || [
      {
        price_data: {
          currency: String(currency || 'usd').toLowerCase(),
          product_data: {
            name: description,
            description: metadata.lessonType ? String(metadata.lessonType) : 'Swimletes Swimming Lesson'
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }
    ];

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl
    };

    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }
    if (clientReferenceId) {
      sessionParams.client_reference_id = String(clientReferenceId);
    }

    return stripe.checkout.sessions.create(sessionParams);
  }

  static async retrieveCheckoutSession(sessionId) {
    const stripe = getStripe();
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });
  }

  static async expireCheckoutSession(sessionId) {
    const stripe = getStripe();
    return stripe.checkout.sessions.expire(sessionId);
  }

  static constructWebhookEvent(rawBody, signature, webhookSecret) {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
}

module.exports = StripeService;

