const BaseRepository = require('../../infrastructure/database/base.repository');
const platformSettingModel = require('./platformSetting.model');

class PlatformSettingRepository extends BaseRepository {
  constructor() {
    super(platformSettingModel);
  }

  async getLatestSettings() {
    return this.findOne({}, null, { sort: { createdAt: -1 } });
  }
}

module.exports = new PlatformSettingRepository();

