// =============================================================================
// 1. CONFIGURATION LAYER
// =============================================================================

// src/config/environment.js
class EnvironmentConfig {
  constructor() {
    this.load();
  }

  load() {
    require('dotenv').config();
    
    this.database = {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      name: process.env.MONGODB_DB_NAME || 'data_lineage',
      options: {
        retryWrites: true,
        writeConcern: { w: 'majority' }
      }
    };

    this.server = {
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || 'localhost'
    };

    this.logging = {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'combined'
    };

    this.visualization = {
      outputDir: process.env.VIZ_OUTPUT_DIR || './visualizations',
      maxNodes: parseInt(process.env.VIZ_MAX_NODES) || 1000
    };
  }

  validate() {
    const required = ['database.uri', 'database.name'];
    const missing = required.filter(key => {
      const value = key.split('.').reduce((obj, k) => obj?.[k], this);
      return !value;
    });

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
  }
}

module.exports = { EnvironmentConfig };