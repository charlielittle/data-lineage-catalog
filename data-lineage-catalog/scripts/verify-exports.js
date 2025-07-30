// scripts/verify-exports.js
const modules = [
  '../src/config',
  '../src/models',
  '../src/repositories',
  '../src/services',
  '../src/generators',
  '../src/visualizers',
  '../src/database'
];

const moduleFiles = [
  '../src/config/environment',
  '../src/models/Node', 
  '../src/models/Relationship',
  '../src/repositories/BaseRepository',
  '../src/repositories/NodeRepository',
  '../src/repositories/RelationshipRepository',
  '../src/services/LineageService',
  '../src/services/ImpactService', 
  '../src/services/QualityService',
  '../src/generators/NodeFactory',
  '../src/generators/RelationshipFactory',
  '../src/generators/DataGenerator',
  '../src/visualizers/BaseVisualizer',
  '../src/visualizers/formatters/HTMLFormatter',
  '../src/visualizers/GraphVisualizer',
  '../src/database/DatabaseManager',
  '../src/database/SchemaManager'
];

moduleFiles.forEach(module => {
  try {
    console.log(`Verifying exports for: ${module}`);
    const imported = require(module);
    console.log(`✓ ${module}: ${Object.keys(imported).join(', ')}`);
  } catch (error) {
    console.error(`✗ ${module}: ${error.message}`);
  }
});
