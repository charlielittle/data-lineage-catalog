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
curl http://localhost:3000/api/lineage/impact/customer_id?changeType=schema_change
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
http://localhost:3000/api/visualization/html/focus/product_performance_score?depth=3&direction=both
```

## Key Demonstration Areas

### Schema Design Patterns

The application demonstrates MongoDB document structures suitable for lineage tracking, including embedded metadata patterns, relationship modeling approaches, and indexing strategies for efficient traversal operations.

### Query Pattern Examples

Sample queries illustrate common lineage operations including upstream dependency discovery, downstream impact assessment, and complete data journey reconstruction with performance considerations for large datasets.

### Metadata Management

The schema design shows how to incorporate technical metadata, business metadata, and quality metrics within lineage documents while maintaining query performance and data consistency.

### Visualization Integration

Multiple output formats demonstrate how lineage information can be transformed for different audiences, including technical diagrams for developers and interactive interfaces for business stakeholders.

## Development

### Testing the Schema Implementation

Execute the test suite to validate the MongoDB schema design and query patterns implemented in this sample application.

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode for development
npm run test:coverage   # Generate coverage reports
```

### Code Quality

Maintain consistent code formatting and structure throughout the sample implementation.

```bash
npm run lint           # Check code style
npm run lint:fix       # Automatically fix style issues
```

### Documentation

Generate technical documentation for the schema design and implementation patterns.

```bash
npm run docs          # Generate JSDoc documentation
```

## Sample Data Structure

This application demonstrates a MongoDB schema design that separates nodes and relationships into distinct collections while maintaining referential integrity through document references. The Node documents contain comprehensive metadata including technical specifications, business context, and quality metrics. The Relationship documents model the connections between nodes with transformation details, confidence levels, and impact assessments.

The schema design emphasizes query performance for common lineage operations through strategic indexing on frequently accessed fields such as node identifiers, relationship types, and status indicators. The document structure supports both simple lineage traversal and complex analytical queries while maintaining flexibility for different types of data sources and transformation processes.

## Contributing

This sample application welcomes contributions that enhance the demonstration of MongoDB lineage schema patterns. Contributions should maintain the educational focus of the project while illustrating best practices for document database design in lineage tracking scenarios. All modifications should include appropriate test coverage and documentation updates to maintain the sample's instructional value.

## License

This project is licensed under the MIT License as a sample application for educational and demonstration purposes.
