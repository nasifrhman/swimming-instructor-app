const BaseRepository = require('../../infrastructure/database/base.repository');
const staticContentModel = require('./staticContent.model');

class StaticContentRepository extends BaseRepository {
  constructor() {
    super(staticContentModel);
  }

  async findByType(type) {
    return this.findOne({ type });
  }
}

module.exports = new StaticContentRepository();

