// =============================================================================
// 9. APPLICATION COMPOSITION ROOT
// =============================================================================

const { APIServer } = require('../api/server');

// src/app/Application.js
class Application {
  constructor() {
    this.config = new (require('../config/environment').EnvironmentConfig)();
    this.databaseManager = null;
    this.schemaManager = null;
    this.repositories = {};
    this.services = {};
    this.generators = {};
    this.visualizers = {};
    this.apiServer = null;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Data Lineage Application...');
      
      // Validate configuration
      this.config.validate();
      
      // Initialize database
      await this.initializeDatabase();

      // Initialize repositories
      this.initializeRepositories();
      
      // Initialize services
      this.initializeServices();
      
      // Initialize generators and visualizers
      this.initializeGenerators();
      this.initializeVisualizers();
      
      // Initialize API server
      this.initializeAPIServer();
      
      console.log('✅ Application initialized successfully');
      return this;
    } catch (error) {
      console.error('❌ Application initialization failed:', error.message);
      throw error;
    }
  }

  async initializeDatabase() {
    const { DatabaseManager, SchemaManager } = require('../database');
    
    this.databaseManager = new DatabaseManager(this.config);
    const db = await this.databaseManager.connect();
    
    this.schemaManager = new SchemaManager(db);
    await this.schemaManager.setupCollections();
    
    console.log('✓ Database initialized');
    console.log(`Database config: ${db}`);
  }

  initializeRepositories() {
    const { NodeRepository, RelationshipRepository } = require('../repositories');
    
    this.repositories.nodeRepository = new NodeRepository(this.databaseManager.db);
    this.repositories.relationshipRepository = new RelationshipRepository(this.databaseManager.db);
    
    console.log('✓ Repositories initialized');
  }

  initializeServices() {
    const { LineageService, ImpactService, QualityService } = require('../services');
    
    this.services.lineageService = new LineageService(
      this.repositories.nodeRepository,
      this.repositories.relationshipRepository
    );
    
    this.services.impactService = new ImpactService(
      this.repositories.nodeRepository,
      this.repositories.relationshipRepository
    );
    
    this.services.qualityService = new QualityService(
      this.repositories.nodeRepository
    );
    
    console.log('✓ Services initialized');
  }

  initializeGenerators() {
    const { NodeFactory, RelationshipFactory, DataGenerator } = require('../generators');
    
    this.generators.nodeFactory = new NodeFactory();
    this.generators.relationshipFactory = new RelationshipFactory();
    this.generators.dataGenerator = new DataGenerator();
    
    console.log('✓ Generators initialized');
  }

  initializeVisualizers() {
    const { GraphVisualizer } = require('../visualizers');
    
    this.visualizers.graphVisualizer = new GraphVisualizer(
      this.repositories.nodeRepository,
      this.repositories.relationshipRepository,
      this.config.visualization.outputDir
    );
    
    console.log('✓ Visualizers initialized');
  }

  initializeAPIServer() {
    this.apiServer = new APIServer(this.config, {
      ...this.services,
      ...this.visualizers
    });
    
    console.log('✓ API Server initialized');
  }

  async loadSampleData(clear = false) {
    try {
      console.log('📊 Loading sample data...');
      
      if (clear) {
        await this.repositories.nodeRepository.deleteMany({});
        await this.repositories.relationshipRepository.deleteMany({});
        console.log('  ✓ Existing data cleared');
      }

      const { nodes, relationships } = this.generators.dataGenerator.generateEnterpriseDataset();
      
      await this.repositories.nodeRepository.saveNodes(nodes);
      console.log(`  ✓ Inserted ${nodes.length} nodes`);
      
      await this.repositories.relationshipRepository.saveRelationships(relationships);
      console.log(`  ✓ Inserted ${relationships.length} relationships`);
      
      console.log('✅ Sample data loaded successfully');
      return { nodesInserted: nodes.length, relationshipsInserted: relationships.length };
    } catch (error) {
      console.error('❌ Failed to load sample data:', error.message);
      throw error;
    }
  }

  async startServer() {
    try {
      await this.visualizers.graphVisualizer.initialize();
      return await this.apiServer.start();
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      throw error;
    }
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down application...');
      
      if (this.databaseManager) {
        await this.databaseManager.disconnect();
      }
      
      console.log('✅ Application shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error.message);
      throw error;
    }
  }

  // Utility methods for testing and CLI
  getService(serviceName) {
    return this.services[serviceName];
  }

  getRepository(repoName) {
    return this.repositories[repoName];
  }

  getGenerator(generatorName) {
    return this.generators[generatorName];
  }

  getVisualizer(visualizerName) {
    return this.visualizers[visualizerName];
  }
}

module.exports = { Application };