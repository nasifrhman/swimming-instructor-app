const BaseRepository = require('../../infrastructure/database/base.repository');
const serviceAndPricingModel = require('./serviceAndPricing.model');

class ServiceAndPricingRepository extends BaseRepository {
  constructor() {
    super(serviceAndPricingModel);
  }

  async findByInstructor(instructorId) {
    return this.findOne({ instructor: instructorId });
  }
}

module.exports = new ServiceAndPricingRepository();

