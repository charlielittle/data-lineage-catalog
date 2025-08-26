const { BaseRepository } = require('./BaseRepository');
const { Relationship } = require('../models/Relationship');

// src/repositories/RelationshipRepository.js
class RelationshipRepository extends BaseRepository {
  async findAll(filter = {}, options = {}) {
    let limit = 0;
    if (options.limit) {
      limit = options.limit;
    }
    const cursor = this.collection.find(filter).limit(limit);
    if (options.onlyIds) {
      const ids = [];
      for await (const doc of cursor) {
        ids.push(doc.relationshipId);
      }
      return ids;
    } else {
      const relationships = [];
      for await (const doc of cursor) {
        relationships.push(Relationship.fromDocument(doc));
      }
      return relationships;
    }
  }
  constructor(db) {
    super(db, 'relationships');
  }

  async findByRelationshipId(relationshipId) {
    const doc = await this.findOne({ relationshipId, status: 'active' });
    return doc ? Relationship.fromDocument(doc) : null;
  }

  async findByType(relationshipType) {
    const docs = await this.findAll({ relationshipType, status: 'active' });
    return docs.map(doc => Relationship.fromDocument(doc));
  }

  async findBySourceNode(sourceNodeId) {
    const docs = await this.findAll({ sourceNodeId, status: 'active' });
    return docs.map(doc => Relationship.fromDocument(doc));
  }

  async findByTargetNode(targetNodeId) {
    const docs = await this.findAll({ targetNodeId, status: 'active' });
    return docs.map(doc => Relationship.fromDocument(doc));
  }

  async findByNodes(nodeIds) {
    const docs = await this.findAll({
      $or: [
        { sourceNodeId: { $in: nodeIds } },
        { targetNodeId: { $in: nodeIds } }
      ],
      status: 'active'
    });
    return docs.map(doc => Relationship.fromDocument(doc));
  }

  async findUpstreamRelationships(nodeId, maxDepth = 10) {
    const pipeline = [
      { $match: { targetNodeId: nodeId, status: 'active' } },
      {
        $graphLookup: {
          from: 'relationships',
          startWith: '$sourceNodeId',
          connectFromField: 'sourceNodeId',
          connectToField: 'targetNodeId',
          as: 'upstream',
          maxDepth: maxDepth - 1,
          restrictSearchWithMatch: { status: 'active' },
          depthField: 'depth'
        }
      }
    ];
    console.log( `upstream pipeline: ${JSON.stringify(pipeline)}`);
    console.log(`Finding upstream relationships for node ${nodeId} with max depth ${maxDepth}`);
    return await this.aggregate(pipeline);
  }

  async findDownstreamRelationships(nodeId, maxDepth = 10) {
    const pipeline = [
      { $match: { sourceNodeId: nodeId, status: 'active' } },
      {
        $graphLookup: {
          from: 'relationships',
          startWith: '$targetNodeId',
          connectFromField: 'targetNodeId',
          connectToField: 'sourceNodeId',
          as: 'downstream',
          maxDepth: maxDepth - 1,
          restrictSearchWithMatch: { status: 'active' },
          depthField: 'depth'
        }
      }
    ];
    console.log( `downstream pipeline: ${JSON.stringify(pipeline)}`);
    console.log(`Finding downstream relationships for node ${nodeId} with max depth ${maxDepth}`);
    return await this.aggregate(pipeline);
  }

  async saveRelationship(relationship) {
    const document = relationship.toDocument();
    document.updatedAt = new Date();
    
    const result = await this.updateOne(
      { relationshipId: relationship.relationshipId },
      { $set: document },
      { upsert: true }
    );
    
    return result;
  }

  async saveRelationships(relationships) {
    const documents = relationships.map(rel => {
      const doc = rel.toDocument();
      doc.updatedAt = new Date();
      return doc;
    });

    return await this.insertMany(documents);
  }
}

module.exports = { RelationshipRepository };
