// This file contains the command-line interface for large-scale generation
// Update the path below to the correct location of LargeScaleLineageGenerator.js
const { LargeScaleLineageGenerator } = require('../../generators/LargeScaleLineageGenerator');

class GenerateLargeScaleCommand {
  constructor(application) {
    this.application = application;
    this.generator = new LargeScaleLineageGenerator();
  }

  async execute(args) {
    const targetSize = parseInt(args[0]) || 150000;
    const options = this.parseOptions(args.slice(1));
    
    console.log(`🚀 Starting large-scale generation of ${targetSize.toLocaleString()} nodes`);
    
    try {
      const result = await this.generator.generateEnterpriseDataset(targetSize, options);
      
      // Save to database using existing repositories
      const nodeRepository = this.application.getRepository('nodeRepository');
      const relationshipRepository = this.application.getRepository('relationshipRepository');
      
      console.log('💾 Saving to database...');
      await nodeRepository.saveNodes(result.nodes);
      await relationshipRepository.saveRelationships(result.relationships);
      
      console.log('✅ Large-scale dataset generated and saved successfully');
      console.log(`   Nodes: ${result.metadata.nodeCount.toLocaleString()}`);
      console.log(`   Relationships: ${result.metadata.relationshipCount.toLocaleString()}`);
      console.log(`   Generation time: ${result.metadata.generationTime}ms`);
      
    } catch (error) {
      console.error('❌ Large-scale generation failed:', error.message);
      throw error;
    }
  }

  parseOptions(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i += 2) {
      const option = args[i];
      const value = args[i + 1];
      
      switch (option) {
        case '--chunk-size':
          options.chunkSize = parseInt(value);
          break;
        case '--clear':
          options.clearExisting = true;
          i--; // No value for this flag
          break;
        case '--skip-analytics':
          options.includeAnalytics = false;
          i--; // No value for this flag
          break;
      }
    }
    
    return options;
  }

  showHelp() {
    console.log('Large-Scale Lineage Generation Command');
    console.log('Usage: npm run cli generate-large-scale [size] [options]');
    console.log('');
    console.log('Arguments:');
    console.log('  size              Number of nodes to generate (default: 150000)');
    console.log('');
    console.log('Options:');
    console.log('  --chunk-size N    Process in chunks of N nodes (default: 10000)');
    console.log('  --clear           Clear existing data before generation');
    console.log('  --skip-analytics  Skip analytics layer generation');
    console.log('');
    console.log('Examples:');
    console.log('  npm run cli generate-large-scale 50000');
    console.log('  npm run cli generate-large-scale 200000 --chunk-size 5000 --clear');
  }
}

module.exports = { GenerateLargeScaleCommand };
