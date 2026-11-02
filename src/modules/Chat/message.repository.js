const BaseRepository = require('../../infrastructure/database/base.repository');
const messageModel = require('./message.model');

class MessageRepository extends BaseRepository {
  constructor() {
    super(messageModel);
  }

  async findChatMessages(chatId, options = {}) {
    return this.paginate({ chat: chatId }, options);
  }

  async markAsRead(chatId, recipientId) {
    return this.updateMany(
      { chat: chatId, sender: { $ne: recipientId }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }
}

module.exports = new MessageRepository();

