// src/database/SchemaManager.js
class SchemaManager {
  constructor(db) {
    this.db = db;
    this.collections = {
      nodes: {
        name: 'nodes',
        indexes: [
          { fields: { nodeId: 1 }, options: { unique: true } },
          { fields: { nodeType: 1, status: 1 } },
          { fields: { system: 1, status: 1 } },
          { fields: { 'businessMetadata.domain': 1, status: 1 } },
          { fields: { 'businessMetadata.dataOwner': 1 } },
          { fields: { status: 1, updatedAt: -1 } }
        ]
      },
      relationships: {
        name: 'relationships',
        indexes: [
          { fields: { relationshipId: 1 }, options: { unique: true } },
          { fields: { sourceNodeId: 1, status: 1 } },
          { fields: { targetNodeId: 1, status: 1 } },
          { fields: { relationshipType: 1, status: 1 } },
          { fields: { sourceNodeId: 1, targetNodeId: 1, status: 1 } },
          { fields: { 'metadata.impact': 1, status: 1 } }
        ]
      }
    };
  }

  async setupCollections() {
    console.log('Setting up collections and indexes...');
    
    for (const [key, config] of Object.entries(this.collections)) {
      await this.createCollection(config);
      await this.createIndexes(config);
    }
    
    console.log('✓ Database schema setup completed');
  }

  async createCollection(config) {
    const exists = await this.db.listCollections({ name: config.name }).hasNext();
    
    if (!exists) {
      await this.db.createCollection(config.name);
      console.log(`  ✓ Created collection: ${config.name}`);
    } else {
      console.log(`  - Collection already exists: ${config.name}`);
    }
  }

  async createIndexes(config) {
    const collection = this.db.collection(config.name);
    
    for (const indexSpec of config.indexes) {
      try {
        await collection.createIndex(indexSpec.fields, indexSpec.options || {});
        const indexName = Object.keys(indexSpec.fields).join('_');
        console.log(`  ✓ Created index on ${config.name}: ${indexName}`);
      } catch (error) {
        if (error.code === 85) {
          // Index already exists
          continue;
        }
        throw error;
      }
    }
  }

  async validateSchema() {
    const issues = [];
    
    for (const [key, config] of Object.entries(this.collections)) {
      const collection = this.db.collection(config.name);
      
      // Check if collection exists
      const exists = await this.db.listCollections({ name: config.name }).hasNext();
      if (!exists) {
        issues.push(`Collection ${config.name} does not exist`);
        continue;
      }
      
      // Check indexes
      const existingIndexes = await collection.indexes();
      const expectedIndexes = config.indexes.map(idx => Object.keys(idx.fields).join('_'));
      
      for (const expectedIndex of expectedIndexes) {
        const found = existingIndexes.some(idx => 
          Object.keys(idx.key).join('_') === expectedIndex
        );
        if (!found) {
          issues.push(`Missing index ${expectedIndex} on collection ${config.name}`);
        }
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  async dropAllCollections() {
    console.log('Dropping all collections...');
    
    for (const config of Object.values(this.collections)) {
      try {
        await this.db.collection(config.name).drop();
        console.log(`  ✓ Dropped collection: ${config.name}`);
      } catch (error) {
        if (error.code === 26) {
          // Collection doesn't exist
          continue;
        }
        throw error;
      }
    }
  }
}

module.exports = { SchemaManager };
