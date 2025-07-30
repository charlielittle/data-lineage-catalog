// =============================================================================
// 5. DATABASE MANAGEMENT LAYER
// =============================================================================

// src/database/DatabaseManager.js
class DatabaseManager {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.client) {
        return this.db;
      }

      const { MongoClient } = require('mongodb');
      this.client = new MongoClient(this.config.database.uri, this.config.database.options);
      
      await this.client.connect();
      this.db = this.client.db(this.config.database.name);
      this.isConnected = true;
      
      console.log(`✓ Connected to MongoDB: ${this.config.database.name}`);
      return this.db;
    } catch (error) {
      console.error('✗ Database connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('✓ Disconnected from MongoDB');
    }
  }

  async ping() {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    
    try {
      await this.db.admin().ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getStats() {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const stats = await this.db.stats();
    return {
      collections: stats.collections,
      dataSize: Math.round(stats.dataSize / 1024), // KB
      indexSize: Math.round(stats.indexSize / 1024), // KB
      totalSize: Math.round((stats.dataSize + stats.indexSize) / 1024) // KB
    };
  }
}

module.exports = { DatabaseManager };
