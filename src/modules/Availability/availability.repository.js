const BaseRepository = require('../../infrastructure/database/base.repository');
const availabilityModel = require('./availability.model');

class AvailabilityRepository extends BaseRepository {
  constructor() {
    super(availabilityModel);
  }

  async findByInstructor(instructorId) {
    return this.findOne({ instructor: instructorId });
  }
}

module.exports = new AvailabilityRepository();

