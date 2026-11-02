const BaseRepository = require('../../infrastructure/database/base.repository');
const notificationModel = require('./notification.model');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(notificationModel);
  }

  async findUserNotifications(userId, options = {}) {
    return this.paginate({ receiver: userId }, options);
  }

  async markAllAsRead(userId) {
    return this.updateMany(
      { receiver: userId, read: false },
      { $set: { read: true } }
    );
  }
}

module.exports = new NotificationRepository();

