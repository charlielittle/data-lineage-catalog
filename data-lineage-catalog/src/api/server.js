const { LineageRoutes, QualityRoutes, VisualizationRoutes } = require('./routes');
const { ErrorHandler } = require('./middleware/errorHandler');

// src/api/server.js
class APIServer {
  constructor(config, services) {
    this.config = config;
    this.services = services;
    this.express = require('express');
    this.app = this.express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(this.express.json({ limit: '10mb' }));
    this.app.use(this.express.urlencoded({ extended: true }));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    const lineageRoutes = new LineageRoutes(this.services.lineageService, this.services.impactService);
    const qualityRoutes = new QualityRoutes(this.services.qualityService);
    const visualizationRoutes = new VisualizationRoutes(this.services.graphVisualizer);

    this.app.use('/api/lineage', lineageRoutes.getRouter());
    this.app.use('/api/quality', qualityRoutes.getRouter());
    this.app.use('/api/visualization', visualizationRoutes.getRouter());

    // Serve static visualization files
    this.app.use('/visualizations', this.express.static(this.config.visualization.outputDir));

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        name: 'Data Lineage API',
        version: '1.0.0',
        endpoints: {
          lineage: {
            'GET /api/lineage/path/:sourceId/:targetId': 'Find shortest path between nodes',
            'GET /api/lineage/node/:nodeId': 'Get complete lineage for a node',
            'POST /api/lineage/reports': 'Get lineage for report fields',
            'GET /api/lineage/impact/:nodeId': 'Analyze impact of changes',
            'POST /api/lineage/impact/batch': 'Batch impact analysis'
          },
          quality: {
            'GET /api/quality/summary': 'Get quality summary',
            'GET /api/quality/trends': 'Get quality trends',
            'GET /api/quality/validate/:nodeId': 'Validate node quality'
          },
          visualization: {
            'GET /api/visualization/data': 'Get graph data',
            'GET /api/visualization/focus/:nodeId': 'Get focused lineage data',
            'GET /api/visualization/html': 'Generate interactive HTML',
            'GET /api/visualization/html/focus/:nodeId': 'Generate focused HTML'
          }
        }
      });
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(ErrorHandler.notFound);
    
    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  async start() {
    try {
      const server = this.app.listen(this.config.server.port, this.config.server.host, () => {
        console.log(`✓ API Server running at http://${this.config.server.host}:${this.config.server.port}`);
        console.log(`✓ API Documentation: http://${this.config.server.host}:${this.config.server.port}/api`);
        console.log(`✓ Health Check: http://${this.config.server.host}:${this.config.server.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully...');
        server.close(() => {
          console.log('✓ API Server stopped');
          process.exit(0);
        });
      });

      return server;
    } catch (error) {
      console.error('✗ Failed to start API server:', error.message);
      throw error;
    }
  }
}
module.exports = { APIServer };
