# Data Lineage Catalog - Sample Application

A sample application demonstrating MongoDB schema design for data lineage tracking using Node.js. This project serves as a practical example for implementing data lineage concepts with Node and Relationship document structures, along with comprehensive metadata management patterns.

## Overview

This sample application illustrates how to model and query data lineage information using MongoDB as the underlying storage system. The implementation demonstrates document schema design for tracking data flows from source systems through transformations to reporting destinations. The application includes sample data generation, query patterns for lineage analysis, and visualization capabilities to demonstrate the practical application of the schema design.

## Architecture

This sample application demonstrates a clean architecture pattern for data lineage applications with clear separation of concerns across multiple layers. The design showcases how to structure a MongoDB-based lineage system that remains maintainable and testable while providing practical examples of schema design and query patterns.

### Core Components

The application architecture illustrates several key patterns for lineage systems. The configuration layer demonstrates environment management for MongoDB connections and application settings. The models layer shows how to represent data lineage entities as MongoDB documents, including nodes that represent data elements and relationships that describe data flow connections.

The repository layer provides examples of data access patterns optimized for lineage queries. The service layer contains sample business logic for common lineage operations such as path finding, impact analysis, and quality assessment. The visualization layer demonstrates how to present lineage information through interactive web interfaces and diagram formats.

The API layer provides examples of REST endpoints for lineage operations. The application composition layer shows dependency injection patterns suitable for testing and modularity. The command-line interface demonstrates administrative operations for sample data management.

## Project Structure

```text
data-lineage-catalog/
├── src/
│   ├── config/              # Configuration management
│   │   ├── database.js      # Database connection settings
│   │   └── environment.js   # Environment variable handling
│   ├── models/              # Domain models and entities
│   │   ├── Node.js          # Node entity with metadata
│   │   ├── Relationship.js  # Relationship entity
│   │   └── index.js         # Model exports
│   ├── repositories/        # Data access layer
│   │   ├── BaseRepository.js     # Base repository with common operations
│   │   ├── NodeRepository.js     # Node-specific data access
│   │   ├── RelationshipRepository.js # Relationship data access
│   │   └── index.js         # Repository exports
│   ├── services/            # Business logic layer
│   │   ├── LineageService.js     # Core lineage analysis
│   │   ├── ImpactService.js      # Change impact assessment
│   │   ├── QualityService.js     # Data quality operations
│   │   └── index.js         # Service exports
│   ├── generators/          # Sample data generation
│   │   ├── NodeFactory.js        # Node creation factory
│   │   ├── RelationshipFactory.js # Relationship creation factory
│   │   ├── DataGenerator.js      # Enterprise dataset generation
│   │   └── index.js         # Generator exports
│   ├── visualizers/         # Visualization components
│   │   ├── BaseVisualizer.js     # Base visualization functionality
│   │   ├── GraphVisualizer.js    # Graph visualization generation
│   │   ├── formatters/           # Output format handlers
│   │   │   ├── HTMLFormatter.js  # Interactive HTML generation
│   │   │   ├── DOTFormatter.js   # Graphviz DOT format
│   │   │   └── MermaidFormatter.js # Mermaid diagram format
│   │   └── index.js         # Visualizer exports
│   ├── database/            # Database management
│   │   ├── DatabaseManager.js    # Connection and lifecycle management
│   │   ├── SchemaManager.js      # Collection and index management
│   │   └── migrations/           # Database migration scripts
│   ├── api/                 # REST API layer
│   │   ├── routes/               # API route definitions
│   │   │   ├── lineage.js        # Lineage analysis endpoints
│   │   │   ├── quality.js        # Quality monitoring endpoints
│   │   │   └── visualization.js  # Visualization endpoints
│   │   ├── middleware/           # Request processing middleware
│   │   │   ├── validation.js     # Input validation
│   │   │   └── errorHandler.js   # Error handling
│   │   └── server.js        # Express server configuration
│   ├── utils/               # Shared utilities
│   │   ├── logger.js        # Logging configuration
│   │   ├── constants.js     # Application constants
│   │   └── helpers.js       # Common helper functions
│   ├── cli/                 # Command-line interface
│   │   ├── commands/        # CLI command implementations
│   │   └── index.js         # CLI entry point
│   └── app/                 # Application composition
│       └── Application.js   # Main application class
├── tests/                   # Test suites
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── fixtures/            # Test data fixtures
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── visualizations/          # Generated visualization outputs
├── package.json             # Project configuration and dependencies
├── .env.example             # Environment variable template
└── README.md                # Project documentation
```

## Installation and Setup

This sample application requires Node.js version 16 or higher and access to a MongoDB instance for demonstrating the lineage schema patterns.

```bash
git clone https://github.com/your-org/data-lineage-catalog.git
cd data-lineage-catalog
npm install
```

Configure the environment variables by copying the example file and updating the MongoDB connection settings for your local development environment.

```bash
cp .env.example .env
# Edit .env with your MongoDB configuration
```

The application includes sample data generators that create realistic lineage scenarios for testing the schema design and query patterns.

## Database Configuration

The sample application demonstrates MongoDB schema initialization for lineage tracking. The schema includes collections for nodes and relationships with appropriate indexes for common lineage query patterns.

```bash
npm run migrate
```

This command creates the sample collections and demonstrates index strategies optimized for lineage traversal operations, path finding queries, and impact analysis patterns.

## Usage Examples

### Running the Sample Application

Start the application with generated sample data to explore the lineage schema and query capabilities.

```bash
npm run start:dev
```

This command initializes the MongoDB collections, generates realistic sample lineage data, and starts the demonstration API server.

For exploring just the core functionality without development features, use the standard start command.

```bash
npm start
```

### Command-Line Examples

The CLI demonstrates various lineage operations and data management patterns for the sample schema.

Generate a sample data quality report that shows how quality metrics can be stored and queried within the lineage schema.

```bash
npm run quality-report
```

Demonstrate impact analysis capabilities by tracing downstream dependencies from a sample node.

```bash
npm run cli impact-analysis transaction_id
```

Load fresh sample data to reset the demonstration environment or test different data patterns.

```bash
npm run cli load-data --clear
```

Generate sample visualizations to demonstrate how lineage information can be presented to users.

```bash
npm run cli generate-viz
npm run cli generate-viz node1 node2 node3
```

### Large-Scale Data Generation

The application includes enterprise-scale data generation capabilities that create realistic datasets for performance testing and MongoDB schema validation. These generators implement research-backed patterns from enterprise data lineage systems, creating datasets that mirror real-world complexity and scale.

Generate an enterprise-scale dataset with 150,000 nodes using realistic architectural patterns.

```bash
npm run cli generate-large-scale 150000
```

This command creates a multi-layered data architecture following the medallion pattern used in modern data platforms. The generator distributes nodes across raw data sources, staging transformations, integration operations, presentation layers, and analytics models using enterprise ratios discovered through industry research.

Create a smaller demonstration dataset suitable for development and testing scenarios.

```bash
npm run generate-demo
```

Generate a production-scale dataset with half a million nodes for comprehensive performance testing.

```bash
npm run generate-enterprise
```

The large-scale generator includes several advanced features that make it valuable for understanding enterprise data lineage patterns. Each generated node includes realistic transformation code that reflects actual data processing logic used in business systems. The relationships between nodes follow probability distributions based on real enterprise architectures, creating authentic data flow patterns.

Run comprehensive performance testing across multiple dataset sizes to understand MongoDB scaling characteristics.

```bash
npm run performance-test
```

This command executes the generator at three different scales, measuring generation time, memory usage, and relationship complexity. The testing provides insights into how the MongoDB schema performs as data volume increases, helping you understand scaling considerations for production deployments.

### Advanced Generation Options

The large-scale generator supports various options that allow you to customize the generated dataset for specific testing scenarios.

Control memory usage during generation by adjusting the processing chunk size for very large datasets.

```bash
npm run cli generate-large-scale 500000 --chunk-size 5000 --clear
```

Skip the analytics layer generation if you want to focus testing on operational data flows without machine learning components.

```bash
npm run cli generate-large-scale 100000 --skip-analytics --clear
```

The chunk size parameter becomes particularly important when generating datasets with hundreds of thousands of nodes, as it controls memory usage and provides progress feedback during the generation process. Smaller chunk sizes use less memory but may increase generation time, while larger chunks process faster but require more available RAM.

### API Examples

The sample API demonstrates common lineage query patterns and response structures for MongoDB-based lineage systems.

Explore path-finding capabilities between sample nodes to understand relationship traversal patterns.

```bash
curl http://localhost:3000/api/lineage/path/source_node/target_node
```

Examine complete lineage context for sample nodes with configurable traversal depth.

```bash
curl http://localhost:3000/api/lineage/node/customer_id?direction=both&maxDepth=5
```

Test impact analysis endpoints that demonstrate downstream dependency calculation.

```bash
curl http://localhost:3000/api/lineage/impact/order_line_quantity?changeType=schema_change
```

Review quality assessment capabilities that show how metadata can support data governance workflows.

```bash
curl http://localhost:3000/api/quality/summary
```

Access sample visualization interfaces that demonstrate presentation options for lineage information.

```bash
# Complete sample lineage graph
http://localhost:3000/api/visualization/html

# Focused lineage demonstration
http://localhost:3000/api/visualization/html/focus/product_performance_score?depth=5&direction=both
```

When testing with large-scale generated datasets, these API endpoints provide insight into MongoDB query performance characteristics. The path-finding operations demonstrate how the document schema handles graph traversal queries, while impact analysis shows aggregation pipeline performance across complex relationship networks. Quality summary endpoints reveal how metadata queries scale with dataset size, providing practical experience with production-scale data lineage system performance.

## Key Demonstration Areas

### Schema Design Patterns

The application demonstrates MongoDB document structures suitable for lineage tracking, including embedded metadata patterns, relationship modeling approaches, and indexing strategies for efficient traversal operations.

### Query Pattern Examples

Sample queries illustrate common lineage operations including upstream dependency discovery, downstream impact assessment, and complete data journey reconstruction with performance considerations for large datasets.

### Metadata Management

The schema design shows how to incorporate technical metadata, business metadata, and quality metrics within lineage documents while maintaining query performance and data consistency.

### Visualization Integration

Multiple output formats demonstrate how lineage information can be transformed for different audiences, including technical diagrams for developers and interactive interfaces for business stakeholders.

### Enterprise-Scale Performance Testing

The large-scale generator enables comprehensive testing of MongoDB performance characteristics under realistic enterprise workloads. By generating datasets ranging from thousands to millions of nodes, you can observe how query response times, memory usage, and indexing strategies perform as data volume increases. This testing reveals practical scaling thresholds and helps validate schema design decisions before production deployment.

The performance testing framework creates datasets that follow enterprise architectural patterns, including realistic relationship densities, transformation depth, and metadata complexity. This approach provides more accurate performance insights than simple synthetic data because it reflects the query patterns and data distributions found in actual enterprise data lineage systems.

## Development

### Testing the Schema Implementation

Execute the test suite to validate the MongoDB schema design and query patterns implemented in this sample application.

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage reports
```

### Performance and Scale Testing

The application includes comprehensive performance testing capabilities that help you understand how the MongoDB lineage schema behaves under different load conditions. These tests provide practical experience with the scaling characteristics of document-based lineage systems.

#### Write Performance Testing

Test database write performance with large-scale data generation across multiple dataset sizes:

```bash
# Test write performance only
npm run cli performance-test write
```

This command generates datasets at three different scales (10,000, 50,000, and 150,000 nodes) and measures:
- Data generation time
- Insert operations per second
- Memory usage during bulk operations
- Relationship creation performance

**Example Output:**
```
🚀 Starting write performance test...
Testing with 10,000 nodes...
✅ Generated 10,000 nodes in 2.456s
Testing with 50,000 nodes...
✅ Generated 50,000 nodes in 12.234s
Testing with 150,000 nodes...
✅ Generated 150,000 nodes in 45.678s
```

#### Read Performance Testing

Test database read performance with memory-efficient streaming operations:

```bash
# Test read performance only
npm run cli performance-test read
```

This command performs streaming reads of all active nodes and relationships, measuring:
- Query execution time for large collections
- Memory efficiency through cursor-based streaming
- Network transfer performance
- Index utilization effectiveness

The read test uses optimized MongoDB cursors to stream only nodeIds and relationshipIds, preventing out-of-memory errors with large datasets while providing realistic performance metrics.

**Example Output:**
```
📖 Starting read performance test...
Reading all active nodes (streaming nodeIds only)...
✅ Read 150,000 nodes in 1.234s
Reading all active relationships (streaming relationshipIds only)...
✅ Read 487,000 relationships in 2.567s
```

#### Combined Performance Testing

Run both write and read tests sequentially to get comprehensive performance insights:

```bash
# Run both write and read tests
npm run cli performance-test both
# or simply
npm run cli performance-test
```

#### Lineage Query Performance Testing

Test lineage query performance with configurable parameters for realistic workload simulation:

```bash
# Basic test with default settings (depth=5, iterations=10, concurrency=4)
npm run cli lineage-query-performance-test

# Test with custom depth (traverse 3 levels of lineage)
npm run cli lineage-query-performance-test 3

# Test with custom iterations (run 50 queries)
npm run cli lineage-query-performance-test 5 50

# Test with custom concurrency (run 8 queries simultaneously)
npm run cli lineage-query-performance-test 5 100 8
```

**Parameters:**
- `depth`: How many levels of lineage to traverse (default: 5)
- `iterations`: Number of lineage queries to execute (default: 10)
- `concurrency`: Number of simultaneous queries (default: 4)

**Example Output:**
```
Running 100 lineage queries (depth=5, concurrency=8) from 15000 active nodes...
Iteration 1: nodeId=node_12345, relationships=23, time=0.045s
Iteration 2: nodeId=node_67890, relationships=18, time=0.032s
...

Lineage Query Performance Summary:
  Iterations: 100
  Concurrency: 8
  Total relationships returned: 2,045
  Avg response time: 0.038s
  Min response time: 0.015s
  Max response time: 0.125s
  Queries/sec: 26.32
```

#### Performance Testing Scenarios

**Memory Efficiency Validation:**
```bash
# Test read performance with large datasets to validate streaming approach
npm run cli generate-large-scale 500000
npm run cli performance-test read
```

**Write Throughput Analysis:**
```bash
# Test write performance across different scales
npm run cli performance-test write
```

**High Throughput Query Testing:**
```bash
# Test with high concurrency for throughput measurement
npm run cli lineage-query-performance-test 3 200 16
```

**Deep Lineage Performance:**
```bash
# Test deep lineage traversal performance
npm run cli lineage-query-performance-test 10 50 4
```

**Comprehensive Stress Testing:**
```bash
# Generate large dataset and run all performance tests
npm run cli generate-large-scale 150000
npm run cli performance-test both
npm run cli lineage-query-performance-test 7 500 12
```

#### Performance Insights and Scaling Characteristics

The performance testing reveals several key characteristics of the MongoDB lineage schema:

**Write Performance:**
- Bulk insert operations scale linearly with dataset size
- Relationship creation becomes the primary bottleneck at large scales
- Memory usage remains constant due to chunked processing
- Index creation time increases significantly above 100,000 nodes

**Read Performance:**
- Streaming queries maintain constant memory usage regardless of dataset size
- Index utilization critical for sub-second response times on large collections
- Network transfer becomes limiting factor for very large result sets
- Cursor-based iteration prevents memory exhaustion

**Lineage Query Performance:**
- Response time correlates with relationship density rather than total dataset size
- Concurrent queries show good horizontal scaling up to connection pool limits
- Deep traversal (>7 levels) shows exponential performance degradation
- Proper indexing on relationship fields essential for production performance

These insights help validate the MongoDB schema design under realistic enterprise workloads and guide optimization decisions for production deployments.

## Performance Characteristics and Scaling Insights

Understanding how the MongoDB lineage schema performs at different scales provides valuable insights for production system design. The comprehensive performance testing suite reveals practical scaling thresholds and optimization opportunities across multiple operation types.

**Small Scale (< 10,000 nodes):**
- Write operations complete in under 5 seconds
- Read queries execute in milliseconds with minimal indexing
- Lineage traversal performs well even without optimization
- Memory usage remains negligible during all operations

**Medium Scale (10,000 - 100,000 nodes):**
- Write performance scales linearly with proper chunking
- Read performance requires strategic indexing for optimal response times
- Lineage query optimization becomes important for user experience
- Memory management through streaming becomes beneficial

**Large Scale (> 100,000 nodes):**
- Bulk write operations require careful memory management and progress monitoring
- Read operations must use cursor-based streaming to prevent memory exhaustion
- Lineage queries benefit significantly from concurrent processing
- Database configuration tuning becomes critical for acceptable performance

The performance testing framework provides quantitative data on these scaling transitions, helping you plan capacity requirements and optimization strategies for production MongoDB lineage systems.
