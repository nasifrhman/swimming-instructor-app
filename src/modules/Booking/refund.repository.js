const BaseRepository = require('../../infrastructure/database/base.repository');
const refundModel = require('./refund.model');

class RefundRepository extends BaseRepository {
  constructor() {
    super(refundModel);
  }

  async findByBookingId(bookingId) {
    return this.find({ booking: bookingId });
  }

  async findByStripeRefundId(stripeRefundId) {
    return this.findOne({ stripeRefundId });
  }
}

module.exports = new RefundRepository();

