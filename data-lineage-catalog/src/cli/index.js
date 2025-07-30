// =============================================================================
// 10. CLI INTERFACE
// =============================================================================

// src/cli/index.js
const { Application } = require('../app/Application'); // Adjust the path as needed

class CLI {
  constructor() {
    this.app = null;
    this.commands = {
      'init': this.initializeDatabase.bind(this),
      'load-data': this.loadSampleData.bind(this),
      'start-server': this.startServer.bind(this),
      'generate-viz': this.generateVisualization.bind(this),
      'quality-report': this.generateQualityReport.bind(this),
      'impact-analysis': this.runImpactAnalysis.bind(this),
      'validate-schema': this.validateSchema.bind(this),
      'help': this.showHelp.bind(this)
    };
  }

  async run(args = process.argv.slice(2)) {
    const command = args[0] || 'help';
    try {
      
      if (!this.commands[command]) {
        console.error(`❌ Unknown command: ${command}`);
        this.showHelp();
        process.exit(1);
      }

      this.app = new Application();
      await this.app.initialize();
      
      await this.commands[command](args.slice(1));
      
    } catch (error) {
      console.error('❌ CLI Error:', error);
      process.exit(1);
    } finally {
      if (this.app && command !== 'start-server') {
        await this.app.shutdown();
      }
    }
  }

  async initializeDatabase(args) {
    console.log('🔧 Database initialization completed during app startup');
  }

  async loadSampleData(args) {
    const clear = args.includes('--clear');
    const result = await this.app.loadSampleData(clear);
    console.log(`✅ Loaded ${result.nodesInserted} nodes and ${result.relationshipsInserted} relationships`);
  }

  async startServer(args) {
    const loadData = args.includes('--load-data');
    
    if (loadData) {
      await this.loadSampleData(['--clear']);
    }
    
    console.log('🌐 Starting API server...');
    await this.app.startServer();
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n👋 Shutting down...');
      await this.app.shutdown();
      process.exit(0);
    });
  }

  async generateVisualization(args) {
    const nodeIds = args.length > 0 ? args : null;
    const graphVisualizer = this.app.getVisualizer('graphVisualizer');
    
    await graphVisualizer.initialize();
    const graphData = await graphVisualizer.generateGraphData(nodeIds);
    const filePath = await graphVisualizer.generateInteractiveVisualization(
      graphData, 
      'Data Lineage Graph'
    );
    
    console.log(`✅ Visualization generated: ${filePath}`);
  }

  async generateQualityReport(args) {
    const qualityService = this.app.getService('qualityService');
    const summary = await qualityService.getQualitySummary();
    
    console.log('\n📊 DATA QUALITY REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Nodes: ${summary.overallStats.totalNodes}`);
    console.log(`Average Completeness: ${summary.overallStats.avgCompleteness}%`);
    console.log(`Average Validity: ${summary.overallStats.avgValidity}%`);
    console.log(`Average Accuracy: ${summary.overallStats.avgAccuracy}%`);
    console.log(`Quality Issues Found: ${summary.qualityIssues.length}`);
    
    if (summary.qualityIssues.length > 0) {
      console.log('\n⚠️  Top Quality Issues:');
      summary.qualityIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.name} (${issue.nodeType}): ${issue.overallQuality}%`);
      });
    }
  }

  async runImpactAnalysis(args) {
    if (args.length === 0) {
      console.error('❌ Node ID required for impact analysis');
      console.log('Usage: npm run cli impact-analysis <nodeId>');
      return;
    }

    const nodeId = args[0];
    const impactService = this.app.getService('impactService');
    
    const impact = await impactService.analyzeImpact(nodeId);
    
    console.log('\n💥 IMPACT ANALYSIS REPORT');
    console.log('=' .repeat(50));
    console.log(`Source Node: ${impact.sourceNode.name} (${impact.sourceNode.nodeId})`);
    console.log(`Total Impacted Nodes: ${impact.impactAssessment.totalImpactedNodes}`);
    console.log(`High Impact Nodes: ${impact.impactAssessment.highImpactNodes}`);
    console.log(`Reports Impacted: ${impact.impactAssessment.reportsImpacted}`);
    console.log(`Risk Level: ${impact.impactAssessment.riskLevel.toUpperCase()}`);
    console.log(`Systems Impacted: ${impact.impactAssessment.systemsImpacted.join(', ')}`);
    
    if (impact.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      impact.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  async validateSchema(args) {
    const validation = await this.app.schemaManager.validateSchema();
    
    if (validation.valid) {
      console.log('✅ Database schema is valid');
    } else {
      console.log('❌ Database schema validation failed:');
      validation.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
  }

  showHelp() {
    console.log('\n📖 DATA LINEAGE CLI HELP');
    console.log('=' .repeat(50));
    console.log('Usage: npm run cli <command> [options]');
    console.log('\nCommands:');
    console.log('  init                     Initialize database and schema');
    console.log('  load-data [--clear]      Load sample data (optionally clear existing)');
    console.log('  start-server [--load-data] Start API server (optionally load data)');
    console.log('  generate-viz [nodeIds]   Generate visualization');
    console.log('  quality-report           Generate quality report');
    console.log('  impact-analysis <nodeId> Run impact analysis');
    console.log('  validate-schema          Validate database schema');
    console.log('  help                     Show this help message');
    console.log('\nExamples:');
    console.log('  npm run cli load-data --clear');
    console.log('  npm run cli start-server --load-data');
    console.log('  npm run cli impact-analysis customer_id_source');
    console.log('  npm run cli generate-viz node1 node2 node3');
  }
}

// Entry point
if (require.main === module) {
  const cli = new CLI();
  cli.run().catch(console.error);
}
