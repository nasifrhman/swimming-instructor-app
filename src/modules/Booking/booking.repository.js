const BaseRepository = require('../../infrastructure/database/base.repository');
const bookingModel = require('./booking.model');

class BookingRepository extends BaseRepository {
  constructor() {
    super(bookingModel);
  }

  async findByPaymentIntentId(paymentIntentId) {
    return this.findOne({ paymentIntentId });
  }

  async findBySessionId(sessionId) {
    return this.findOne({ stripeSessionId: sessionId });
  }

  async findUserBookings(userId, options = {}) {
    return this.paginate({ user: userId }, options);
  }

  async findInstructorBookings(instructorId, options = {}) {
    return this.paginate({ instructor: instructorId }, options);
  }
}

module.exports = new BookingRepository();

