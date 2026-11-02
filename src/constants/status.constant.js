const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
  REJECTED: 'rejected',
});

const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DECLINED: 'declined',
  DISPUTED: 'disputed',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
});

module.exports = {
  USER_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
};

