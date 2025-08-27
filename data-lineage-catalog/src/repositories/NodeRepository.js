// src/repositories/NodeRepository.js
const { BaseRepository } = require('./BaseRepository');
const { Node } = require('../models/Node');
const { MongoBulkWriteError } = require('mongodb');

class NodeRepository extends BaseRepository {
  constructor(db) {
    super(db, 'nodes');
  }

  async findAll(filter = {}, options = {}) {
    let limit = 0;
    if (options.limit) {
      limit = options.limit;
    }
    let projection = {};
    if( options.onlyIds ) {
      projection = { _id: 0, nodeId: 1 };
    }
    const cursor = this.collection.find(filter, projection).limit(limit);
    if (options.onlyIds) {
      const ids = [];
      for await (const doc of cursor) {
        ids.push(doc.nodeId);
      }
      return ids;
    } else {
      const nodes = [];
      for await (const doc of cursor) {
        nodes.push(Node.fromDocument(doc));
      }
      return nodes;
    }
  }

  async findByNodeId(nodeId) {
    const doc = await this.findOne({ nodeId, status: 'active' });
    return doc ? Node.fromDocument(doc) : null;
  }

  async findByNodeIds(nodeIds) {
    const docs = await this.findAll({ 
      nodeId: { $in: nodeIds }, 
      status: 'active' 
    });
    return docs.map(doc => Node.fromDocument(doc));
  }

  async findByType(nodeType) {
    const docs = await this.findAll({ nodeType, status: 'active' });
    return docs.map(doc => Node.fromDocument(doc));
  }

  async findBySystem(system) {
    const docs = await this.findAll({ system, status: 'active' });
    return docs.map(doc => Node.fromDocument(doc));
  }

  async findByDomain(domain) {
    const docs = await this.findAll({ 
      'businessMetadata.domain': domain, 
      status: 'active' 
    });
    return docs.map(doc => Node.fromDocument(doc));
  }

  async findWithQualityIssues(threshold = 95) {
    const pipeline = [
      { $match: { status: 'active' } },
      {
        $addFields: {
          overallQuality: {
            $avg: [
              '$qualityMetrics.completeness',
              '$qualityMetrics.validity',
              '$qualityMetrics.accuracy'
            ]
          }
        }
      },
      { $match: { overallQuality: { $lt: threshold } } },
      { $sort: { overallQuality: 1 } }
    ];

    const docs = await this.aggregate(pipeline);
    return docs.map(doc => Node.fromDocument(doc));
  }

  async getQualityStatsByType() {
    const pipeline = [
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$nodeType',
          avgCompleteness: { $avg: '$qualityMetrics.completeness' },
          avgValidity: { $avg: '$qualityMetrics.validity' },
          avgAccuracy: { $avg: '$qualityMetrics.accuracy' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    return await this.aggregate(pipeline);
  }

  async getDomainCoverage() {
    const pipeline = [
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$businessMetadata.domain',
          nodeTypes: { $addToSet: '$nodeType' },
          systems: { $addToSet: '$system' },
          count: { $sum: 1 },
          dataOwners: { $addToSet: '$businessMetadata.dataOwner' },
          avgQuality: {
            $avg: {
              $avg: [
                '$qualityMetrics.completeness',
                '$qualityMetrics.validity',
                '$qualityMetrics.accuracy'
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ];

    return await this.aggregate(pipeline);
  }

  async saveNode(node) {
    const document = node.toDocument();
    document.updatedAt = new Date();
    
    const result = await this.updateOne(
      { nodeId: node.nodeId },
      { $set: document },
      { upsert: true }
    );
    console.log(`Upserted node with nodeId ${node.nodeId} result:`, result);
    return result;
  }

  async saveNodes(nodes) {
    const documents = nodes.map(node => {
      const doc = node.toDocument();
      doc.updatedAt = new Date();
      return doc;
    });

    try {
      let results = await this.insertMany(documents);
    } catch (error) {
      if (error.code === 11000) {
        console.log('Duplicate key error detected, attempting upsert for existing nodes...');
        for (let node of nodes) {
          await this.saveNode(node);
        }
      } else {
        console.error('Error saving nodes:', error);
      }
    }
  }
}

module.exports = { NodeRepository };
