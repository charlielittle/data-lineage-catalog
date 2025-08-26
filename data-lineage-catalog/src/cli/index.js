// =============================================================================
// 10. CLI INTERFACE
// =============================================================================



// src/cli/index.js
const { Application } = require('../app/Application'); // Adjust the path as needed
const { GenerateLargeScaleCommand } = require('./commands/generateLargeScale');

class CLI {

  async runLineageQueryPerformanceTest(args) {
    // Usage: npm run cli lineage-query-performance-test [depth] [iterations] [concurrency]
    const depth = parseInt(args[0]) || 5;
    const iterations = parseInt(args[1]) || 10;
    const concurrency = parseInt(args[2]) || 4;
    const nodeRepository = this.app.getRepository('nodeRepository');
    const lineageService = this.app.getService('lineageService');

    // Get all nodeIds
    const nodeIds = await nodeRepository.findAll({ status: 'active' }, { onlyIds: true });
    if (nodeIds.length === 0) {
      console.log('No nodes found for lineage query test.');
      return;
    }

    let totalTime = 0;
    let minTime = Number.POSITIVE_INFINITY;
    let maxTime = 0;
    let totalResults = 0;
    const times = [];

    console.log(`Running ${iterations} lineage queries (depth=${depth}, concurrency=${concurrency}) from ${nodeIds.length} active nodes...`);
    const testStart = Date.now();

    // Helper to run a single query
    const runQuery = async (i) => {
      const randomIndex = Math.floor(Math.random() * nodeIds.length);
      const randomNodeId = nodeIds[randomIndex];
      const start = Date.now();
      const lineage = await lineageService.getNodeLineage(randomNodeId, 'both', depth);
      const end = Date.now();
      const relCount = (lineage.upstreamRelationships?.length || 0) + (lineage.downstreamRelationships?.length || 0);
      const elapsed = end - start;
      times[i] = elapsed;
      totalTime += elapsed;
      minTime = Math.min(minTime, elapsed);
      maxTime = Math.max(maxTime, elapsed);
      totalResults += relCount;
      return { i, nodeId: randomNodeId, relCount, elapsed };
    };

    // Run queries in batches for concurrency
    let completed = 0;
    let batch = [];
    let total_tests = iterations * concurrency // iterations per task
    while (completed < total_tests ) {
      batch = [];
      for (let j = 0; j < concurrency && completed + j < total_tests; j++) {
        batch.push(runQuery(completed + j));
      }
      const results = await Promise.all(batch);
      results.forEach(r => {
        console.log(`Iteration ${r.i + 1}: nodeId=${r.nodeId}, relationships=${r.relCount}, time=${(r.elapsed / 1000).toFixed(3)}s`);
      });
      completed += results.length;
    }

    const testEnd = Date.now();
    const avgTime = totalTime / total_tests;
    const queriesPerSec = total_tests / ((testEnd - testStart) / 1000);
    console.log('\nLineage Query Performance Summary:');
    console.log(`  Iterations: ${iterations}`);
    console.log(`  Concurrency: ${concurrency}`);
    console.log(`  Total relationships returned: ${totalResults}`);
    console.log(`  Avg response time: ${(avgTime / 1000).toFixed(3)}s`);
    console.log(`  Min response time: ${(minTime / 1000).toFixed(3)}s`);
    console.log(`  Max response time: ${(maxTime / 1000).toFixed(3)}s`);
    console.log(`  Queries/sec: ${queriesPerSec.toFixed(2)}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

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
      'generate-large-scale': this.generateLargeScale.bind(this), // New command
      'performance-test': this.runPerformanceTest.bind(this),     // New command
      'lineage-query-performance-test': this.runLineageQueryPerformanceTest.bind(this), // New command
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

  async generateLargeScale(args) {
    const command = new GenerateLargeScaleCommand(this.app);
    await command.execute(args);
  }

  async runPerformanceTest(args) {
    // Usage: npm run cli performance-test [write|read|both]
    const mode = args[0] || 'both';
    const testSizes = [10000, 50000, 150000];
    const command = new GenerateLargeScaleCommand(this.app);
    const nodeRepository = this.app.getRepository('nodeRepository');
    const relationshipRepository = this.app.getRepository('relationshipRepository');

    if (mode === 'write' || mode === 'both') {
      console.log('📝 Running WRITE performance tests across multiple scales\n');
      for (const size of testSizes) {
        console.log(`Writing ${size.toLocaleString()} nodes:`);
        const writeStart = Date.now();
        await command.execute([size.toString(), '--clear']);
        const writeEnd = Date.now();
        console.log(`Write completed in ${(writeEnd - writeStart) / 1000}s`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (mode === 'read' || mode === 'both') {
      console.log('📖 Running READ performance tests across multiple scales\n');
      for (const size of testSizes) {
        console.log(`Reading lineage data for ${size.toLocaleString()} nodes (IDs only):`);
        const readStart = Date.now();
        const nodeIds = await nodeRepository.findAll({ status: 'active' }, { onlyIds: true, limit: size });
        const relationshipIds = await relationshipRepository.findAll({ status: 'active' }, { onlyIds: true, limit: size });
        const readEnd = Date.now();
        console.log(`Read ${nodeIds.length} nodeIds and ${relationshipIds.length} relationshipIds in ${(readEnd - readStart) / 1000}s`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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
    console.log('  generate-large-scale [size] [options] Generate enterprise-scale dataset');
    console.log('  performance-test         Run performance tests at multiple scales');
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
