const BaseRepository = require('../../infrastructure/database/base.repository');
const userModel = require('./user.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(userModel);
  }

  async findByEmail(email, projection = null) {
    if (!email) return null;
    return this.findOne({ email: email.toLowerCase().trim(), isDeleted: false }, projection);
  }

  async findByNumber(number, countryCode = null) {
    const filter = { number, isDeleted: false };
    if (countryCode) {
      filter.countryCode = countryCode;
    }
    return this.findOne(filter);
  }

  async findByAppleId(appleId) {
    return this.findOne({ appleId, isDeleted: false });
  }

  async findByGoogleId(googleId) {
    return this.findOne({ googleId, isDeleted: false });
  }

  async findActiveById(id, projection = null) {
    return this.findOne({ _id: id, isDeleted: false }, projection);
  }

  async softDelete(id) {
    return this.updateById(id, { isDeleted: true, status: 'banned' });
  }
}

module.exports = new UserRepository();

