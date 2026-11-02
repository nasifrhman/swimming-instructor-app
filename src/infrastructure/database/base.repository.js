class BaseRepository {
  /**
   * @param {import('mongoose').Model} model
   */
  constructor(model) {
    if (!model) {
      throw new Error('BaseRepository requires a Mongoose Model instance');
    }
    this.model = model;
  }

  async create(data, options = {}) {
    if (Array.isArray(data)) {
      return this.model.insertMany(data, options);
    }
    const doc = new this.model(data);
    return doc.save(options);
  }

  async findById(id, projection = null, options = {}) {
    return this.model.findById(id, projection, options);
  }

  async findOne(filter = {}, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  async find(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options);
  }

  async updateById(id, updateData, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, updateData, options);
  }

  async updateOne(filter, updateData, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, updateData, options);
  }

  async updateMany(filter, updateData, options = {}) {
    return this.model.updateMany(filter, updateData, options);
  }

  async deleteById(id, options = {}) {
    return this.model.findByIdAndDelete(id, options);
  }

  async deleteOne(filter, options = {}) {
    return this.model.findOneAndDelete(filter, options);
  }

  async deleteMany(filter, options = {}) {
    return this.model.deleteMany(filter, options);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async exists(filter = {}) {
    return this.model.exists(filter);
  }

  async paginate(filter = {}, { page = 1, limit = 10, sort = { createdAt: -1 }, populate = null, select = null } = {}) {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);

    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }

    const [docs, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      docs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    };
  }

  async aggregate(pipeline = []) {
    return this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;

