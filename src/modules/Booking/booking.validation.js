const bookingValidation = {
  createBooking: {
    body: {
      instructor: { required: true },
      date: { required: true },
      startTime: { required: true },
    }
  },
  bookingIdParam: {
    params: {
      id: { required: true, match: /^[0-9a-fA-F]{24}$/ }
    }
  },
  cancelBooking: {
    params: {
      id: { required: true, match: /^[0-9a-fA-F]{24}$/ }
    },
    body: {
      reason: { type: 'string' }
    }
  }
};

module.exports = bookingValidation;

