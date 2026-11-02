const BaseRepository = require('../../infrastructure/database/base.repository');
const tokenModel = require('./token.model');

class TokenRepository extends BaseRepository {
  constructor() {
    super(tokenModel);
  }

  async isTokenBlacklisted(token) {
    const exists = await this.exists({ token });
    return Boolean(exists);
  }
}

module.exports = new TokenRepository();

