const BaseRepository = require('../../infrastructure/database/base.repository');
const otpModel = require('./otp.model');

class OtpRepository extends BaseRepository {
  constructor() {
    super(otpModel);
  }

  async findValidOtp(email, otp) {
    return this.findOne({ email, otp, status: 'pending' });
  }

  async invalidateOtps(email) {
    return this.updateMany({ email, status: 'pending' }, { $set: { status: 'expired' } });
  }
}

module.exports = new OtpRepository();

