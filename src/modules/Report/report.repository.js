const BaseRepository = require('../../infrastructure/database/base.repository');
const reportModel = require('./report.model');

class ReportRepository extends BaseRepository {
  constructor() {
    super(reportModel);
  }

  async findReports(filter = {}, options = {}) {
    return this.paginate(filter, options);
  }
}

module.exports = new ReportRepository();

