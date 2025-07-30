// =============================================================================
// 3. REPOSITORY LAYER (Data Access)
// =============================================================================

// src/repositories/BaseRepository.js
class BaseRepository {
  constructor(db, collectionName) {
    this.db = db;
    this.collectionName = collectionName;
    this.collection = db.collection(collectionName);
  }

  async findById(id) {
    return await this.collection.findOne({ _id: id });
  }

  async findByIds(ids) {
    return await this.collection.find({ _id: { $in: ids } }).toArray();
  }

  async findAll(filter = {}, options = {}) {
    return await this.collection.find(filter, options).toArray();
  }

  async findOne(filter, options = {}) {
    return await this.collection.findOne(filter, options);
  }

  async insertOne(document) {
    const result = await this.collection.insertOne(document);
    return result.insertedId;
  }

  async insertMany(documents) {
    const result = await this.collection.insertMany(documents);
    return result.insertedIds;
  }

  async updateOne(filter, update, options = {}) {
    return await this.collection.updateOne(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return await this.collection.updateMany(filter, update, options);
  }

  async deleteOne(filter, options = {}) {
    return await this.collection.deleteOne(filter, options);
  }

  async deleteMany(filter, options = {}) {
    return await this.collection.deleteMany(filter, options);
  }

  async count(filter = {}) {
    return await this.collection.countDocuments(filter);
  }

  async aggregate(pipeline, options={}) {
    return await this.collection.aggregate(pipeline, options).toArray();
  }

  async distinct(field, filter = {}) {
    return await this.collection.distinct(field, filter);
  }
}

module.exports = { BaseRepository };
