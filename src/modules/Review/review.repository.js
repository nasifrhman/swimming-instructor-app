const BaseRepository = require('../../infrastructure/database/base.repository');
const reviewModel = require('./review.model');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(reviewModel);
  }

  async findByInstructor(instructorId, options = {}) {
    return this.paginate({ instructor: instructorId }, options);
  }

  async calculateAverageRating(instructorId) {
    const mongoose = require('mongoose');
    const result = await this.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
      {
        $group: {
          _id: '$instructor',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        }
      }
    ]);
    return result[0] || { avgRating: 0, totalReviews: 0 };
  }
}

module.exports = new ReviewRepository();

