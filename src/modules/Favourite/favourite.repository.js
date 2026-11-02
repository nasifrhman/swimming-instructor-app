const BaseRepository = require('../../infrastructure/database/base.repository');
const favouriteModel = require('./favourite.model');

class FavouriteRepository extends BaseRepository {
  constructor() {
    super(favouriteModel);
  }

  async findByUserAndInstructor(userId, instructorId) {
    return this.findOne({ user: userId, instructor: instructorId });
  }

  async findUserFavourites(userId, options = {}) {
    return this.paginate({ user: userId }, options);
  }
}

module.exports = new FavouriteRepository();

