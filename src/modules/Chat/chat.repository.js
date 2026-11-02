const BaseRepository = require('../../infrastructure/database/base.repository');
const chatModel = require('./chat.model');

class ChatRepository extends BaseRepository {
  constructor() {
    super(chatModel);
  }

  async findUserChats(userId, options = {}) {
    return this.paginate({ participants: userId }, options);
  }

  async findChatBetweenUsers(userA, userB) {
    return this.findOne({
      participants: { $all: [userA, userB] }
    });
  }
}

module.exports = new ChatRepository();

