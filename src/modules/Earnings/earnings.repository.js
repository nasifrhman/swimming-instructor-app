const BaseRepository = require('../../infrastructure/database/base.repository');
const transactionModel = require('./transaction.model');

class EarningsRepository extends BaseRepository {
  constructor() {
    super(transactionModel);
  }

  async findUserTransactions(userId, options = {}) {
    return this.paginate({ user: userId }, options);
  }

  async findInstructorTransactions(instructorId, options = {}) {
    return this.paginate({ instructor: instructorId }, options);
  }
}

module.exports = new EarningsRepository();

