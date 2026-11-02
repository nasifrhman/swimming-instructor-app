const userRepository = require('../User/user.repository');

class AuthRepository {
  async findByEmail(email) {
    return userRepository.findByEmail(email);
  }

  async findById(id) {
    return userRepository.findById(id);
  }

  async findByPhone(number, countryCode) {
    return userRepository.findByNumber(number, countryCode);
  }

  async findByAppleId(appleId) {
    return userRepository.findByAppleId(appleId);
  }

  async findByGoogleId(googleId) {
    return userRepository.findByGoogleId(googleId);
  }

  async createUser(data) {
    return userRepository.create(data);
  }

  async updateUser(id, updateData) {
    return userRepository.updateById(id, updateData);
  }
}

module.exports = new AuthRepository();

