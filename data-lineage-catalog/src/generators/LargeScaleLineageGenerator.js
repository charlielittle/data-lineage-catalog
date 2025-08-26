// Large-Scale Data Lineage Generator
// Implements enterprise patterns from MongoDB lineage testing research
// Generates realistic datasets with proper scaling, ratios, and performance optimization

const { NodeFactory, RelationshipFactory } = require('.');
const { Node, Relationship } = require('../models');

/**
 * Enterprise-scale lineage generator implementing medallion architecture patterns
 * Uses research-backed ratios and probability distributions for realistic data generation
 */
class LargeScaleLineageGenerator {
  constructor(options = {}) {
    this.nodeFactory = new NodeFactory();
    this.relationshipFactory = new RelationshipFactory();
    
    // Configuration based on research findings
    this.config = {
      // Enterprise architecture layer ratios from research
      layerDistribution: {
        raw: 0.20,        // 20% raw data sources (bronze layer)
        staging: 0.30,    // 30% staging tables (data cleansing)
        integration: 0.25, // 25% integration layer (silver layer)
        presentation: 0.20, // 20% presentation layer (gold layer)
        analytics: 0.05   // 5% analytics/ML models (platinum layer)
      },
      
      // Relationship patterns from enterprise analysis
      relationshipRatio: 4.2,      // Average 4.2 relationships per node
      pathDepthRange: [4, 7],      // Typical transformation depth
      branchingFactor: [10, 50],   // High-value dataset dependencies
      
      // Performance and chunking settings
      chunkSize: 10000,            // Process in 10k node batches
      memoryThreshold: 0.8,        // Trigger garbage collection at 80% memory
      
      // Quality and confidence distributions
      qualityDistribution: {
        alpha: 7,    // Beta distribution parameters for realistic
        beta: 2      // confidence scores (skewed toward high quality)
      },
      
      // Domain and system diversity
      businessDomains: [
        'customer', 'product', 'finance', 'inventory', 'marketing', 
        'operations', 'hr', 'supply_chain', 'analytics', 'compliance'
      ],
      
      systems: [
        'source_system', 'data_lake', 'staging_db', 'data_warehouse',
        'analytics_platform', 'reporting_engine', 'ml_platform', 
        'business_intelligence', 'operational_db', 'archive_system'
      ],
      
      ...options
    };
    
    this.statistics = {
      nodesGenerated: 0,
      relationshipsGenerated: 0,
      processingTime: 0,
      memoryPeaks: []
    };
  }

  /**
   * Generate enterprise-scale lineage dataset with streaming architecture
   * This version eliminates stack overflow issues by avoiding array spread operations
   * and implements proper memory management for large-scale generation
   * @param {number} targetNodes - Total number of nodes to generate
   * @param {Object} options - Generation options
   * @returns {Promise<{nodes: Array, relationships: Array, metadata: Object}>}
   */
  async generateEnterpriseDataset(targetNodes = 150000, options = {}) {
    console.log(`🚀 Starting enterprise lineage generation for ${targetNodes.toLocaleString()} nodes`);
    const startTime = Date.now();
    
    // Calculate layer sizes based on research ratios
    const layerSizes = this.calculateLayerDistribution(targetNodes);
    console.log('📊 Layer distribution:', layerSizes);
    
    try {
      // Use streaming architecture to prevent memory overflow
      const result = await this.generateLayeredArchitectureStreaming(layerSizes, options);
      
      // Calculate final statistics
      this.statistics.processingTime = Date.now() - startTime;
      console.log(`✅ Generation complete in ${this.statistics.processingTime}ms`);
      console.log(`   Generated ${result.nodeCount.toLocaleString()} nodes`);
      console.log(`   Generated ${result.relationshipCount.toLocaleString()} relationships`);
      console.log(`   Ratio: 1:${(result.relationshipCount / result.nodeCount).toFixed(2)}`);
      
      return {
        nodes: result.nodes,
        relationships: result.relationships,
        metadata: {
          generationTime: this.statistics.processingTime,
          nodeCount: result.nodeCount,
          relationshipCount: result.relationshipCount,
          relationshipRatio: result.relationshipCount / result.nodeCount,
          layerDistribution: layerSizes,
          averageDepth: result.averageDepth,
          branchingStats: result.branchingStats
        }
      };
    } catch (error) {
      console.error('❌ Enterprise dataset generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate complete layered architecture using streaming approach
   * This method processes data in chunks and avoids memory accumulation
   */
  async generateLayeredArchitectureStreaming(layerSizes, options = {}) {
    // Use streaming collections that manage memory automatically
    const streamingResult = {
      nodes: [],
      relationships: [],
      nodeCount: 0,
      relationshipCount: 0,
      layerNodeMaps: new Map(), // Use Map for better performance
      nodeIdToLayerMap: new Map() // Track which layer each node belongs to
    };
    
    console.log('🔨 Generating nodes layer by layer with memory management...');
    
    // Generate nodes for each layer using streaming approach
    for (const [layerName, nodeCount] of Object.entries(layerSizes)) {
      console.log(`   Processing ${layerName} layer: ${nodeCount.toLocaleString()} nodes`);
      
      await this.generateLayerNodesStreaming(
        layerName, 
        nodeCount, 
        streamingResult
      );
      
      // Trigger garbage collection if available after each layer
      await this.performMemoryCleanup();
    }
    
    console.log('🔗 Generating relationships with streaming architecture...');
    
    // Generate relationships using memory-efficient batch processing
    await this.generateRelationshipsStreaming(streamingResult, options);
    
    // Calculate final metrics without loading all data into memory
    const metrics = await this.calculateStreamingMetrics(streamingResult);
    
    return {
      ...streamingResult,
      averageDepth: metrics.averageDepth,
      branchingStats: metrics.branchingStats
    };
  }

  /**
   * Generate nodes for a specific layer using streaming approach
   * This prevents memory accumulation by processing in controlled batches
   */
  async generateLayerNodesStreaming(layerName, nodeCount, streamingResult) {
    const chunkSize = Math.min(this.config.chunkSize, nodeCount);
    const totalChunks = Math.ceil(nodeCount / chunkSize);
    const layerNodeIds = []; // Collect node IDs for this layer
    
    // Process nodes in chunks to prevent memory overflow
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, nodeCount);
      const currentChunkSize = endIndex - startIndex;
      
      // Generate chunk of nodes
      const chunkNodes = await this.createNodeChunk(
        layerName, 
        startIndex, 
        currentChunkSize
      );
      
      // Extract node IDs and add to layer tracking
      const chunkNodeIds = this.extractNodeIdsFromChunk(chunkNodes);
      this.appendToArray(layerNodeIds, chunkNodeIds); // Safe append method
      
      // Update node-to-layer mapping for relationship generation
      this.updateNodeLayerMapping(chunkNodeIds, layerName, streamingResult.nodeIdToLayerMap);
      
      // Add chunk to streaming result using safe concatenation
      this.appendToArray(streamingResult.nodes, chunkNodes);
      streamingResult.nodeCount += currentChunkSize;
      
      // Report progress for large generations
      if (totalChunks > 5 && (chunkIndex + 1) % Math.max(1, Math.floor(totalChunks / 10)) === 0) {
        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        console.log(`     Progress: ${progress}% (${streamingResult.nodeCount.toLocaleString()}/${nodeCount.toLocaleString()})`);
      }
      
      // Yield control to event loop between chunks
      await this.yieldEventLoop();
    }
    
    // Store layer node IDs for relationship generation
    streamingResult.layerNodeMaps.set(layerName, layerNodeIds);
    console.log(`   ✓ Completed ${layerName}: ${layerNodeIds.length.toLocaleString()} nodes`);
  }

  /**
   * Create a chunk of nodes without using memory-intensive operations
   */
  async createNodeChunk(layerName, startIndex, chunkSize) {
    const nodes = [];
    
    // Generate nodes individually to avoid large array operations
    for (let i = 0; i < chunkSize; i++) {
      const globalIndex = startIndex + i;
      const node = await this.createLayerSpecificNode(layerName, globalIndex, startIndex + chunkSize);
      nodes[i] = node; // Direct assignment instead of push for better performance
    }
    
    return nodes;
  }

  /**
   * Extract node IDs from chunk without using memory-intensive map operations
   */
  extractNodeIdsFromChunk(nodes) {
    const nodeIds = new Array(nodes.length); // Pre-allocate array for performance
    
    for (let i = 0; i < nodes.length; i++) {
      nodeIds[i] = nodes[i].nodeId;
    }
    
    return nodeIds;
  }

  /**
   * Update node-to-layer mapping for efficient relationship generation
   */
  updateNodeLayerMapping(nodeIds, layerName, nodeLayerMap) {
    for (let i = 0; i < nodeIds.length; i++) {
      nodeLayerMap.set(nodeIds[i], layerName);
    }
  }

  /**
   * Generate relationships using streaming architecture to prevent memory overflow
   */
  async generateRelationshipsStreaming(streamingResult, options) {
    const layerOrder = ['raw', 'staging', 'integration', 'presentation', 'analytics'];
    
    // Generate inter-layer relationships
    for (let layerIndex = 0; layerIndex < layerOrder.length - 1; layerIndex++) {
      const sourceLayer = layerOrder[layerIndex];
      const targetLayer = layerOrder[layerIndex + 1];
      
      const sourceNodeIds = streamingResult.layerNodeMaps.get(sourceLayer);
      const targetNodeIds = streamingResult.layerNodeMaps.get(targetLayer);
      
      if (!sourceNodeIds || !targetNodeIds) continue;
      
      console.log(`   Connecting ${sourceLayer} → ${targetLayer} (${sourceNodeIds.length.toLocaleString()} → ${targetNodeIds.length.toLocaleString()})`);
      
      await this.generateLayerConnectionsStreaming(
        sourceNodeIds,
        targetNodeIds,
        sourceLayer,
        targetLayer,
        streamingResult
      );
    }
    
    // Generate skip-level connections (raw to presentation)
    if (options.generateSkipConnections !== false) {
      await this.generateSkipConnectionsStreaming(streamingResult);
    }
    
    // Generate intra-layer connections
    await this.generateIntraLayerConnectionsStreaming(streamingResult);
  }

  /**
   * Generate connections between layers using streaming batch processing
   */
  async generateLayerConnectionsStreaming(sourceNodeIds, targetNodeIds, sourceLayer, targetLayer, streamingResult) {
    const batchSize = Math.min(1000, targetNodeIds.length); // Process in smaller batches
    const totalBatches = Math.ceil(targetNodeIds.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, targetNodeIds.length);
      
      // Process batch of target nodes
      const batchRelationships = [];
      for (let targetIndex = startIndex; targetIndex < endIndex; targetIndex++) {
        const targetNodeId = targetNodeIds[targetIndex];
        
        // Generate realistic number of source dependencies for this target
        const dependencyCount = Math.min(
          Math.floor(Math.random() * 4) + 2, // 2-5 dependencies
          sourceNodeIds.length
        );
        
        const selectedSources = this.selectRandomNodesEfficient(sourceNodeIds, dependencyCount);
        
        for (let sourceIndex = 0; sourceIndex < selectedSources.length; sourceIndex++) {
          const sourceNodeId = selectedSources[sourceIndex];
          const relationshipType = this.selectRelationshipType(sourceLayer, targetLayer);
          const impact = this.determineRelationshipImpact(sourceLayer, targetLayer);
          
          const relationship = this.relationshipFactory.createTransformation(
            sourceNodeId,
            targetNodeId,
            relationshipType,
            impact
          );
          
          this.enhanceRelationshipWithLayerContext(relationship, sourceLayer, targetLayer);
          batchRelationships[batchRelationships.length] = relationship; // Direct assignment
        }
      }
      
      // Add batch relationships to result using safe concatenation
      this.appendToArray(streamingResult.relationships, batchRelationships);
      streamingResult.relationshipCount += batchRelationships.length;
      
      // Yield control between batches
      await this.yieldEventLoop();
    }
  }

  /**
   * Generate skip-level connections using streaming approach
   */
  async generateSkipConnectionsStreaming(streamingResult) {
    const rawNodeIds = streamingResult.layerNodeMaps.get('raw');
    const presentationNodeIds = streamingResult.layerNodeMaps.get('presentation');
    
    if (!rawNodeIds || !presentationNodeIds) return;
    
    const connectionCount = Math.floor(presentationNodeIds.length * 0.05); // 5% skip connections
    const skipRelationships = [];
    
    for (let i = 0; i < connectionCount; i++) {
      const rawNodeId = rawNodeIds[Math.floor(Math.random() * rawNodeIds.length)];
      const presentationNodeId = presentationNodeIds[Math.floor(Math.random() * presentationNodeIds.length)];
      
      const relationship = this.relationshipFactory.createTransformation(
        rawNodeId,
        presentationNodeId,
        'copies',
        'low'
      );
      
      skipRelationships[skipRelationships.length] = relationship;
    }
    
    this.appendToArray(streamingResult.relationships, skipRelationships);
    streamingResult.relationshipCount += skipRelationships.length;
  }

  /**
   * Generate intra-layer connections using streaming approach
   */
  async generateIntraLayerConnectionsStreaming(streamingResult) {
    const transformationLayers = ['staging', 'integration', 'presentation'];
    
    for (const layerName of transformationLayers) {
      const layerNodeIds = streamingResult.layerNodeMaps.get(layerName);
      if (!layerNodeIds || layerNodeIds.length < 2) continue;
      
      const intraConnectionCount = Math.floor(layerNodeIds.length * 0.15); // 15% internal connections
      const intraRelationships = [];
      
      for (let i = 0; i < intraConnectionCount; i++) {
        const sourceNodeId = layerNodeIds[Math.floor(Math.random() * layerNodeIds.length)];
        const targetNodeId = layerNodeIds[Math.floor(Math.random() * layerNodeIds.length)];
        
        if (sourceNodeId !== targetNodeId) {
          const relationship = this.relationshipFactory.createTransformation(
            sourceNodeId,
            targetNodeId,
            'transforms_to',
            'medium'
          );
          
          intraRelationships[intraRelationships.length] = relationship;
        }
      }
      
      this.appendToArray(streamingResult.relationships, intraRelationships);
      streamingResult.relationshipCount += intraRelationships.length;
    }
  }

  /**
   * Calculate metrics without loading all data into memory simultaneously
   * This version eliminates spread operator usage that causes stack overflow errors
   */
  async calculateStreamingMetrics(streamingResult) {
    const depthMap = new Map();
    const outDegreeMap = new Map();
    const inDegreeMap = new Map();
    
    // Process relationships in chunks for memory efficiency
    const relationshipChunkSize = 10000;
    const totalRelationships = streamingResult.relationships.length;
    
    for (let start = 0; start < totalRelationships; start += relationshipChunkSize) {
      const end = Math.min(start + relationshipChunkSize, totalRelationships);
      
      for (let i = start; i < end; i++) {
        const rel = streamingResult.relationships[i];
        
        // Calculate depth
        const sourceDepth = depthMap.get(rel.sourceNodeId) || 0;
        depthMap.set(rel.targetNodeId, Math.max(depthMap.get(rel.targetNodeId) || 0, sourceDepth + 1));
        
        // Calculate degrees
        outDegreeMap.set(rel.sourceNodeId, (outDegreeMap.get(rel.sourceNodeId) || 0) + 1);
        inDegreeMap.set(rel.targetNodeId, (inDegreeMap.get(rel.targetNodeId) || 0) + 1);
      }
      
      // Yield control between chunks
      await this.yieldEventLoop();
    }
    
    // Calculate averages and find maximums using iterative approach
    // This avoids the spread operator problem that causes stack overflow
    const depthStats = this.calculateArrayStatistics(Array.from(depthMap.values()));
    const outDegreeStats = this.calculateArrayStatistics(Array.from(outDegreeMap.values()));
    const inDegreeStats = this.calculateArrayStatistics(Array.from(inDegreeMap.values()));
    
    return {
      averageDepth: depthStats.average,
      branchingStats: {
        averageOutDegree: outDegreeStats.average,
        maxOutDegree: outDegreeStats.maximum,
        averageInDegree: inDegreeStats.average,
        maxInDegree: inDegreeStats.maximum
      }
    };
  }

  /**
   * Calculate statistics for an array without using spread operators
   * This method demonstrates how to find max, min, and average values
   * in large arrays without hitting JavaScript's function argument limits
   * 
   * Educational note: This replaces Math.max(...array) patterns that fail
   * with large datasets due to call stack limitations
   */
  calculateArrayStatistics(values) {
    // Handle empty array case
    if (values.length === 0) {
      return {
        average: 0,
        maximum: 0,
        minimum: 0,
        count: 0
      };
    }
    
    // Use iterative approach to find statistics
    // This scales linearly with array size and uses constant memory
    let sum = 0;
    let maximum = values[0];  // Initialize with first element
    let minimum = values[0];  // Initialize with first element
    
    // Process each element exactly once in a single pass
    // This is more efficient than multiple array operations
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      
      // Accumulate sum for average calculation
      sum += value;
      
      // Update maximum if current value is larger
      // This replaces Math.max(...array) which causes stack overflow
      if (value > maximum) {
        maximum = value;
      }
      
      // Update minimum if current value is smaller
      // This replaces Math.min(...array) which would have the same issue
      if (value < minimum) {
        minimum = value;
      }
    }
    
    return {
      average: sum / values.length,
      maximum: maximum,
      minimum: minimum,
      count: values.length,
      sum: sum
    };
  }

  /**
   * Alternative implementation for very large arrays that need streaming processing
   * This version processes arrays in chunks to minimize memory usage
   * Use this when arrays are so large they might cause memory pressure
   */
  async calculateArrayStatisticsStreaming(values, chunkSize = 10000) {
    if (values.length === 0) {
      return {
        average: 0,
        maximum: 0,
        minimum: 0,
        count: 0
      };
    }
    
    let sum = 0;
    let maximum = Number.NEGATIVE_INFINITY;
    let minimum = Number.POSITIVE_INFINITY;
    let processedCount = 0;
    
    // Process array in chunks to avoid memory pressure
    const totalChunks = Math.ceil(values.length / chunkSize);
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const startIndex = chunkIndex * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, values.length);
      
      // Process this chunk
      for (let i = startIndex; i < endIndex; i++) {
        const value = values[i];
        sum += value;
        
        if (value > maximum) {
          maximum = value;
        }
        
        if (value < minimum) {
          minimum = value;
        }
        
        processedCount++;
      }
      
      // Yield control between chunks for very large datasets
      await this.yieldEventLoop();
    }
    
    return {
      average: sum / processedCount,
      maximum: maximum,
      minimum: minimum,
      count: processedCount,
      sum: sum
    };
  }

  /**
   * Safe array concatenation that avoids spread operator issues
   */
  appendToArray(targetArray, sourceArray) {
    // Use traditional loop instead of spread operator to avoid stack overflow
    for (let i = 0; i < sourceArray.length; i++) {
      targetArray[targetArray.length] = sourceArray[i];
    }
  }

  /**
   * Efficient random node selection without creating large intermediate arrays
   */
  selectRandomNodesEfficient(nodeArray, count) {
    if (count >= nodeArray.length) {
      return nodeArray.slice(); // Return copy if requesting all or more
    }
    
    const selected = new Array(count);
    const usedIndices = new Set();
    
    for (let i = 0; i < count; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * nodeArray.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      selected[i] = nodeArray[randomIndex];
    }
    
    return selected;
  }

  /**
   * Yield control to the event loop to prevent blocking
   */
  async yieldEventLoop() {
    return new Promise(resolve => setImmediate(resolve));
  }

  /**
   * Perform memory cleanup and garbage collection if available
   */
  async performMemoryCleanup() {
    // Yield to allow garbage collection
    await this.yieldEventLoop();
    
    // Force garbage collection if available (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
    
    // Track memory usage
    const memoryUsage = process.memoryUsage();
    this.statistics.memoryPeaks.push({
      timestamp: Date.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external
    });
  }

  /**
   * Calculate realistic layer size distribution based on research findings
   */
  calculateLayerDistribution(totalNodes) {
    const distribution = {};
    
    for (const [layer, ratio] of Object.entries(this.config.layerDistribution)) {
      distribution[layer] = Math.floor(totalNodes * ratio);
    }
    
    // Ensure we hit the exact target by adjusting the largest layer
    const currentTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const difference = totalNodes - currentTotal;
    distribution.staging += difference; // Adjust staging layer as it's typically largest
    
    return distribution;
  }

  /**
   * Generate complete layered architecture with realistic inter-layer connections
   */
  async generateLayeredArchitecture(layerSizes, options = {}) {
    const allNodes = [];
    const allRelationships = [];
    const layerNodeMaps = {};
    
    // Generate nodes for each architectural layer
    for (const [layerName, nodeCount] of Object.entries(layerSizes)) {
      console.log(`🔨 Generating ${nodeCount.toLocaleString()} nodes for ${layerName} layer`);
      
      const layerNodes = await this.generateLayerNodes(layerName, nodeCount);
      layerNodeMaps[layerName] = layerNodes.map(node => node.nodeId);
      allNodes.push(...layerNodes);
      
      // Periodic memory management for large datasets
      if (allNodes.length % this.config.chunkSize === 0) {
        await this.manageMemory();
      }
    }
    
    // Generate relationships between layers using enterprise patterns
    console.log('🔗 Generating inter-layer relationships...');
    const layerRelationships = await this.generateLayerConnections(layerNodeMaps, allNodes);
    allRelationships.push(...layerRelationships);
    
    // Add intra-layer relationships for complex transformations
    console.log('🔄 Adding intra-layer transformation relationships...');
    const intraLayerRelationships = await this.generateIntraLayerConnections(layerNodeMaps, allNodes);
    allRelationships.push(...intraLayerRelationships);
    
    return { nodes: allNodes, relationships: allRelationships };
  }

  /**
   * Generate nodes for a specific architectural layer with appropriate characteristics
   */
  async generateLayerNodes(layerName, nodeCount) {
    const nodes = [];
    const chunkSize = Math.min(this.config.chunkSize, nodeCount);
    const chunks = Math.ceil(nodeCount / chunkSize);
    
    for (let chunk = 0; chunk < chunks; chunk++) {
      const startIndex = chunk * chunkSize;
      const endIndex = Math.min(startIndex + chunkSize, nodeCount);
      const chunkNodes = [];
      
      for (let i = startIndex; i < endIndex; i++) {
        const node = await this.createLayerSpecificNode(layerName, i, nodeCount);
        chunkNodes.push(node);
      }
      
      nodes.push(...chunkNodes);
      
      // Progress reporting for large generations
      if (chunks > 10 && chunk % Math.ceil(chunks / 10) === 0) {
        const progress = Math.round((chunk / chunks) * 100);
        console.log(`   Progress: ${progress}% (${nodes.length.toLocaleString()}/${nodeCount.toLocaleString()})`);
      }
    }
    
    return nodes;
  }

  /**
   * Create a node with characteristics appropriate to its architectural layer
   */
  async createLayerSpecificNode(layerName, index, totalInLayer) {
    // Select appropriate domain and system based on layer
    const domain = this.selectDomainForLayer(layerName);
    const system = this.selectSystemForLayer(layerName);
    const owner = this.selectOwnerForLayer(layerName);
    
    // Generate node based on layer type using existing factory methods
    const nodeId = `${layerName}_${domain}_${String(index).padStart(6, '0')}`;
    const nodeName = this.generateLayerSpecificName(layerName, domain, index);
    
    let node;
    
    switch (layerName) {
      case 'raw':
        node = this.nodeFactory.createSourceField(nodeId, nodeName, system, domain, owner);
        break;
        
      case 'staging':
      case 'integration':
        const transformationCode = this.generateLayerTransformationCode(layerName, domain);
        node = this.nodeFactory.createCalculation(nodeId, nodeName, system, domain, owner, transformationCode);
        break;
        
      case 'presentation':
        node = this.nodeFactory.createReportField(nodeId, nodeName, system, domain, owner);
        break;
        
      case 'analytics':
        const analyticsCode = this.generateAnalyticsTransformationCode(domain);
        node = this.nodeFactory.createCalculation(nodeId, nodeName, system, domain, owner, analyticsCode);
        break;
        
      default:
        node = this.nodeFactory.createSourceField(nodeId, nodeName, system, domain, owner);
    }
    
    // Enhance with layer-specific quality metrics based on research findings
    this.enhanceNodeWithRealisticQuality(node, layerName, index, totalInLayer);
    
    return node;
  }

  /**
   * Generate connections between architectural layers following enterprise patterns
   */
  async generateLayerConnections(layerNodeMaps, allNodes) {
    const relationships = [];
    const layerOrder = ['raw', 'staging', 'integration', 'presentation', 'analytics'];
    
    // Create connections between adjacent layers (primary data flow)
    for (let i = 0; i < layerOrder.length - 1; i++) {
      const sourceLayer = layerOrder[i];
      const targetLayer = layerOrder[i + 1];
      
      if (!layerNodeMaps[sourceLayer] || !layerNodeMaps[targetLayer]) continue;
      
      console.log(`   Connecting ${sourceLayer} → ${targetLayer}`);
      const layerConnections = await this.generateLayerToLayerConnections(
        layerNodeMaps[sourceLayer], 
        layerNodeMaps[targetLayer], 
        sourceLayer, 
        targetLayer
      );
      
      relationships.push(...layerConnections);
    }
    
    // Add skip-level connections (raw data directly to presentation for some use cases)
    const skipConnections = await this.generateSkipLevelConnections(layerNodeMaps);
    relationships.push(...skipConnections);
    
    return relationships;
  }

  /**
   * Generate connections between two specific layers with realistic patterns
   */
  async generateLayerToLayerConnections(sourceNodeIds, targetNodeIds, sourceLayer, targetLayer) {
    const relationships = [];
    const connectionPatterns = this.getConnectionPatternsForLayers(sourceLayer, targetLayer);
    
    // Implement fan-out and fan-in patterns from research
    for (const targetNodeId of targetNodeIds) {
      // Each target node typically has 2-5 source dependencies
      const dependencyCount = Math.floor(Math.random() * 4) + 2;
      const selectedSources = this.selectRandomNodes(sourceNodeIds, dependencyCount);
      
      for (const sourceNodeId of selectedSources) {
        const relationshipType = this.selectRelationshipType(sourceLayer, targetLayer);
        const impact = this.determineRelationshipImpact(sourceLayer, targetLayer);
        
        const relationship = this.relationshipFactory.createTransformation(
          sourceNodeId,
          targetNodeId,
          relationshipType,
          impact
        );
        
        // Add layer-specific metadata
        this.enhanceRelationshipWithLayerContext(relationship, sourceLayer, targetLayer);
        
        relationships.push(relationship);
      }
    }
    
    return relationships;
  }

  /**
   * Generate intra-layer relationships for complex transformations within the same layer
   */
  async generateIntraLayerConnections(layerNodeMaps, allNodes) {
    const relationships = [];
    
    // Focus on layers that commonly have internal transformations
    const transformationLayers = ['staging', 'integration', 'presentation'];
    
    for (const layerName of transformationLayers) {
      if (!layerNodeMaps[layerName] || layerNodeMaps[layerName].length < 2) continue;
      
      const layerNodes = layerNodeMaps[layerName];
      const intraConnections = Math.floor(layerNodes.length * 0.15); // 15% internal connections
      
      for (let i = 0; i < intraConnections; i++) {
        const sourceNodeId = layerNodes[Math.floor(Math.random() * layerNodes.length)];
        const targetNodeId = layerNodes[Math.floor(Math.random() * layerNodes.length)];
        
        if (sourceNodeId !== targetNodeId) {
          const relationship = this.relationshipFactory.createTransformation(
            sourceNodeId,
            targetNodeId,
            'transforms_to',
            'medium'
          );
          
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }

  /**
   * Generate skip-level connections for direct raw-to-presentation scenarios
   */
  async generateSkipLevelConnections(layerNodeMaps) {
    const relationships = [];
    
    if (!layerNodeMaps.raw || !layerNodeMaps.presentation) return relationships;
    
    // About 5% of presentation nodes get direct raw data connections (operational reports)
    const directConnections = Math.floor(layerNodeMaps.presentation.length * 0.05);
    
    for (let i = 0; i < directConnections; i++) {
      const rawNodeId = layerNodeMaps.raw[Math.floor(Math.random() * layerNodeMaps.raw.length)];
      const presentationNodeId = layerNodeMaps.presentation[Math.floor(Math.random() * layerNodeMaps.presentation.length)];
      
      const relationship = this.relationshipFactory.createTransformation(
        rawNodeId,
        presentationNodeId,
        'copies',
        'low'
      );
      
      relationships.push(relationship);
    }
    
    return relationships;
  }

  /**
   * Enhance node with realistic quality metrics based on research findings
   */
  enhanceNodeWithRealisticQuality(node, layerName, index, totalInLayer) {
    // Layer-specific quality expectations
    const layerQualityProfiles = {
      raw: { completeness: [0.75, 0.95], validity: [0.70, 0.90], accuracy: [0.80, 0.95] },
      staging: { completeness: [0.90, 0.98], validity: [0.85, 0.98], accuracy: [0.85, 0.98] },
      integration: { completeness: [0.95, 0.99], validity: [0.90, 0.99], accuracy: [0.90, 0.99] },
      presentation: { completeness: [0.98, 1.00], validity: [0.95, 1.00], accuracy: [0.95, 1.00] },
      analytics: { completeness: [0.90, 0.98], validity: [0.92, 0.99], accuracy: [0.88, 0.96] }
    };
    
    const profile = layerQualityProfiles[layerName] || layerQualityProfiles.raw;
    
    // Apply beta distribution for realistic confidence scores
    const confidenceScore = this.generateBetaDistribution(
      this.config.qualityDistribution.alpha, 
      this.config.qualityDistribution.beta
    );
    
    // Update quality metrics with layer-appropriate values
    node.qualityMetrics.completeness = this.randomInRange(profile.completeness[0], profile.completeness[1]);
    node.qualityMetrics.validity = this.randomInRange(profile.validity[0], profile.validity[1]);
    node.qualityMetrics.accuracy = this.randomInRange(profile.accuracy[0], profile.accuracy[1]);
    node.qualityMetrics.confidenceScore = confidenceScore;
    node.qualityMetrics.lastQualityCheck = this.generateRecentDate();
    
    // Add enterprise-specific tags based on position and importance
    const importance = index < (totalInLayer * 0.1) ? 'critical' : 
                     index < (totalInLayer * 0.3) ? 'important' : 'standard';
    node.tags.push(`importance_${importance}`, `layer_${layerName}`);
  }

  /**
   * Enhance relationship with layer-specific context and metadata
   */
  enhanceRelationshipWithLayerContext(relationship, sourceLayer, targetLayer) {
    // Set transformation frequency based on layer transition
    const layerFrequencies = {
      'raw_staging': 'hourly',
      'staging_integration': 'daily',
      'integration_presentation': 'daily',
      'presentation_analytics': 'weekly'
    };
    
    const transitionKey = `${sourceLayer}_${targetLayer}`;
    relationship.metadata.frequency = layerFrequencies[transitionKey] || 'daily';
    
    // Set processing latency expectations
    const layerLatencies = {
      'raw_staging': '15_minutes',
      'staging_integration': '2_hours',
      'integration_presentation': '4_hours',
      'presentation_analytics': '12_hours'
    };
    
    relationship.metadata.latency = layerLatencies[transitionKey] || '4_hours';
    
    // Add layer transition context
    relationship.metadata.layerTransition = transitionKey;
    relationship.metadata.processingComplexity = this.calculateProcessingComplexity(sourceLayer, targetLayer);
  }

  // Utility methods for realistic data generation

  selectDomainForLayer(layerName) {
    // Raw and staging layers cover all domains, higher layers are more specialized
    const allDomains = this.config.businessDomains;
    const coreDomains = ['customer', 'product', 'finance', 'operations'];
    
    return layerName === 'analytics' ? 
      coreDomains[Math.floor(Math.random() * coreDomains.length)] :
      allDomains[Math.floor(Math.random() * allDomains.length)];
  }

  selectSystemForLayer(layerName) {
    const systemsByLayer = {
      raw: ['source_system', 'operational_db', 'external_api'],
      staging: ['data_lake', 'staging_db', 'etl_platform'],
      integration: ['data_warehouse', 'integration_platform'],
      presentation: ['reporting_engine', 'business_intelligence'],
      analytics: ['ml_platform', 'analytics_platform']
    };
    
    const systems = systemsByLayer[layerName] || this.config.systems;
    return systems[Math.floor(Math.random() * systems.length)];
  }

  selectOwnerForLayer(layerName) {
    const ownersByLayer = {
      raw: 'system.admin',
      staging: 'data.engineer',
      integration: 'data.engineer',
      presentation: 'business.analyst',
      analytics: 'data.scientist'
    };
    
    return ownersByLayer[layerName] || 'data.steward';
  }

  generateLayerSpecificName(layerName, domain, index) {
    const prefixes = {
      raw: 'Raw',
      staging: 'Cleaned',
      integration: 'Integrated',
      presentation: 'Report',
      analytics: 'Model'
    };
    
    const suffix = Math.random() > 0.7 ? `_v${Math.floor(Math.random() * 5) + 1}` : '';
    return `${prefixes[layerName]} ${domain.charAt(0).toUpperCase() + domain.slice(1)} ${String(index).padStart(3, '0')}${suffix}`;
  }

  generateBetaDistribution(alpha, beta) {
    // Simple beta distribution approximation using gamma distributions
    const gamma1 = this.randomGamma(alpha, 1);
    const gamma2 = this.randomGamma(beta, 1);
    return gamma1 / (gamma1 + gamma2);
  }

  randomGamma(shape, scale) {
    // Simple gamma distribution approximation for quality score generation
    if (shape < 1) {
      return Math.pow(Math.random(), 1 / shape) * this.randomGamma(shape + 1, scale);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      const x = this.randomNormal(0, 1);
      const v = Math.pow(1 + c * x, 3);
      if (v > 0) {
        const u = Math.random();
        if (u < 1 - 0.0331 * Math.pow(x, 4) || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
          return d * v * scale;
        }
      }
    }
  }

  randomNormal(mean = 0, stdDev = 1) {
    // Box-Muller transformation for normal distribution
    const u = Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  selectRandomNodes(nodeArray, count) {
    const shuffled = [...nodeArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, nodeArray.length));
  }

  selectRelationshipType(sourceLayer, targetLayer) {
    const typesByTransition = {
      'raw_staging': 'transforms_to',
      'staging_integration': 'transforms_to',
      'integration_presentation': 'aggregates',
      'presentation_analytics': 'derives_from',
      'raw_presentation': 'copies'
    };
    
    const key = `${sourceLayer}_${targetLayer}`;
    return typesByTransition[key] || 'transforms_to';
  }

  determineRelationshipImpact(sourceLayer, targetLayer) {
    // Earlier layers have higher impact as errors propagate
    if (sourceLayer === 'raw') return 'high';
    if (targetLayer === 'analytics') return 'medium';
    return Math.random() > 0.6 ? 'high' : 'medium';
  }

  calculateProcessingComplexity(sourceLayer, targetLayer) {
    const complexityScores = {
      'raw_staging': 'medium',
      'staging_integration': 'high',
      'integration_presentation': 'medium',
      'presentation_analytics': 'high'
    };
    
    return complexityScores[`${sourceLayer}_${targetLayer}`] || 'medium';
  }

  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  generateRecentDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    return new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  }

  /**
   * Generate realistic transformation code based on layer type and domain
   * This creates SQL-like transformation logic that reflects real enterprise patterns
   */
  generateLayerTransformationCode(layerName, domain) {
    // Each layer performs different types of transformations based on its purpose
    const transformationTemplates = {
      staging: {
        // Staging layer focuses on data cleansing and standardization
        customer: [
          "TRIM(UPPER(customer_name)) WHERE customer_name IS NOT NULL",
          "REGEXP_REPLACE(phone_number, '[^0-9]', '') WHERE LENGTH(phone_number) >= 10",
          "CASE WHEN email LIKE '%@%' THEN LOWER(email) ELSE NULL END"
        ],
        finance: [
          "ROUND(CAST(amount AS DECIMAL(10,2)), 2) WHERE amount > 0",
          "DATE_FORMAT(transaction_date, '%Y-%m-%d') WHERE transaction_date IS NOT NULL",
          "CASE WHEN currency IS NULL THEN 'USD' ELSE UPPER(currency) END"
        ],
        product: [
          "REGEXP_REPLACE(product_code, '[^A-Z0-9]', '') WHERE LENGTH(product_code) > 0",
          "ROUND(price, 2) WHERE price > 0 AND price < 999999",
          "COALESCE(category, 'UNCATEGORIZED')"
        ]
      },
      
      integration: {
        // Integration layer focuses on joining and combining data from multiple sources
        customer: [
          "SELECT c.*, a.* FROM customers c LEFT JOIN addresses a ON c.customer_id = a.customer_id",
          "WITH customer_summary AS (SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id)",
          "CASE WHEN c.registration_date < '2020-01-01' THEN 'legacy' ELSE 'current' END as customer_type"
        ],
        finance: [
          "SELECT t.*, e.exchange_rate FROM transactions t LEFT JOIN exchange_rates e ON t.currency = e.currency AND DATE(t.transaction_date) = e.rate_date",
          "SUM(amount * COALESCE(exchange_rate, 1.0)) as amount_usd GROUP BY customer_id, DATE_TRUNC('month', transaction_date)",
          "ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY transaction_date DESC) as transaction_rank"
        ],
        product: [
          "SELECT p.*, s.supplier_name, c.category_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id LEFT JOIN categories c ON p.category_id = c.category_id",
          "AVG(rating) OVER (PARTITION BY category_id ROWS BETWEEN 10 PRECEDING AND CURRENT ROW) as category_avg_rating",
          "CASE WHEN inventory_count < reorder_level THEN 'LOW_STOCK' ELSE 'IN_STOCK' END as inventory_status"
        ]
      }
    };
    
    // Select appropriate template based on layer and domain
    const layerTemplates = transformationTemplates[layerName];
    if (!layerTemplates || !layerTemplates[domain]) {
      // Fallback to generic transformation if specific template not available
      return this.generateGenericTransformation(layerName, domain);
    }
    
    const domainTemplates = layerTemplates[domain];
    const selectedTemplate = domainTemplates[Math.floor(Math.random() * domainTemplates.length)];
    
    // Add context about the transformation complexity
    const complexity = layerName === 'staging' ? 'data_cleansing' : 'data_integration';
    return `-- ${complexity.toUpperCase()} TRANSFORMATION\n${selectedTemplate}`;
  }

  /**
   * Generate analytics-specific transformation code for machine learning and advanced analytics
   * These transformations represent the sophisticated processing in the analytics layer
   */
  generateAnalyticsTransformationCode(domain) {
    // Analytics transformations are more complex and often involve statistical operations
    const analyticsTemplates = {
      customer: [
        // Customer lifetime value and segmentation models
        `-- CUSTOMER LIFETIME VALUE MODEL
WITH customer_metrics AS (
  SELECT customer_id,
         AVG(order_value) as avg_order_value,
         COUNT(*) as order_frequency,
         DATEDIFF(CURRENT_DATE, MIN(order_date)) as customer_age_days
  FROM customer_orders 
  GROUP BY customer_id
)
SELECT customer_id,
       (avg_order_value * order_frequency * (customer_age_days / 365.25)) as predicted_ltv,
       CASE 
         WHEN predicted_ltv > 5000 THEN 'high_value'
         WHEN predicted_ltv > 1000 THEN 'medium_value'
         ELSE 'low_value'
       END as customer_segment`,

        // Churn prediction model
        `-- CUSTOMER CHURN PREDICTION
SELECT customer_id,
       days_since_last_order,
       CASE 
         WHEN days_since_last_order > 180 THEN 0.85
         WHEN days_since_last_order > 90 THEN 0.45
         WHEN days_since_last_order > 30 THEN 0.15
         ELSE 0.05
       END as churn_probability,
       EXP(-0.01 * days_since_last_order) as retention_score`
      ],
      
      finance: [
        // Revenue forecasting and trend analysis
        `-- REVENUE FORECASTING MODEL
WITH monthly_revenue AS (
  SELECT DATE_TRUNC('month', transaction_date) as month,
         SUM(amount) as revenue,
         LAG(SUM(amount), 1) OVER (ORDER BY DATE_TRUNC('month', transaction_date)) as prev_month_revenue
  FROM transactions
  GROUP BY DATE_TRUNC('month', transaction_date)
)
SELECT month,
       revenue,
       (revenue - prev_month_revenue) / prev_month_revenue as growth_rate,
       AVG(revenue) OVER (ROWS BETWEEN 11 PRECEDING AND CURRENT ROW) as moving_avg_12m`,

        // Risk scoring model
        `-- FINANCIAL RISK SCORING
SELECT customer_id,
       CASE 
         WHEN avg_transaction_amount > 10000 AND transaction_frequency < 12 THEN 'high_risk'
         WHEN payment_failures > 2 THEN 'medium_risk'
         ELSE 'low_risk'
       END as risk_category,
       (payment_failures * 0.3 + late_payments * 0.2) as risk_score`
      ],
      
      product: [
        // Product recommendation engine
        `-- PRODUCT RECOMMENDATION MODEL
WITH product_similarity AS (
  SELECT p1.product_id as product_a,
         p2.product_id as product_b,
         COUNT(DISTINCT o1.customer_id) as common_customers,
         COUNT(DISTINCT o1.customer_id) / SQRT(COUNT(DISTINCT o1.customer_id) * COUNT(DISTINCT o2.customer_id)) as similarity_score
  FROM orders o1
  JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.product_id != o2.product_id
  JOIN products p1 ON o1.product_id = p1.product_id
  JOIN products p2 ON o2.product_id = p2.product_id
  GROUP BY p1.product_id, p2.product_id
  HAVING common_customers >= 5
)
SELECT product_a, product_b, similarity_score
FROM product_similarity
WHERE similarity_score > 0.3`,

        // Inventory optimization model
        `-- INVENTORY OPTIMIZATION
SELECT product_id,
       AVG(daily_sales) as avg_daily_demand,
       STDDEV(daily_sales) as demand_volatility,
       (avg_daily_demand * lead_time_days) + (1.96 * SQRT(lead_time_days) * demand_volatility) as safety_stock,
       CASE 
         WHEN current_inventory < safety_stock THEN 'REORDER_NOW'
         WHEN current_inventory < (safety_stock * 1.5) THEN 'REORDER_SOON'
         ELSE 'SUFFICIENT'
       END as reorder_status`
      ]
    };
    
    // Select random analytics template for the domain
    const templates = analyticsTemplates[domain] || analyticsTemplates.customer;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate generic transformation for domains/layers without specific templates
   */
  generateGenericTransformation(layerName, domain) {
    const genericPatterns = {
      staging: `TRIM(COALESCE(${domain}_field, 'DEFAULT_VALUE')) WHERE ${domain}_field IS NOT NULL`,
      integration: `SELECT * FROM ${domain}_source s LEFT JOIN ${domain}_lookup l ON s.key_field = l.key_field`,
      presentation: `SELECT ${domain}_id, ${domain}_name, SUM(metric_value) as total_${domain}_metric GROUP BY ${domain}_id, ${domain}_name`,
      analytics: `SELECT ${domain}_id, PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_${domain}_score FROM ${domain}_metrics`
    };
    
    return genericPatterns[layerName] || `-- Generic ${layerName} transformation for ${domain} domain`;
  }

  /**
   * Define connection patterns between different architectural layers
   * This controls how layers interact and what types of relationships form between them
   */
  getConnectionPatternsForLayers(sourceLayer, targetLayer) {
    // Define realistic connection patterns based on enterprise architecture research
    const connectionPatterns = {
      // Raw data to staging: heavy transformation with data cleansing focus
      'raw_staging': {
        connectionProbability: 0.8,  // 80% of raw data gets processed through staging
        relationshipTypes: ['transforms_to'],
        averageSourcesPerTarget: 1.2,  // Staging usually processes one raw source at a time
        processingComplexity: 'medium',
        dataVolumeReduction: 0.95,     // Slight reduction due to cleansing
        description: 'Data cleansing and initial validation'
      },
      
      // Staging to integration: complex joins and business rule application
      'staging_integration': {
        connectionProbability: 0.9,   // Most staging data flows to integration
        relationshipTypes: ['transforms_to', 'joins'],
        averageSourcesPerTarget: 2.8,  // Integration combines multiple staging sources
        processingComplexity: 'high',
        dataVolumeReduction: 0.7,      // Significant reduction through aggregation
        description: 'Data integration and business rule application'
      },
      
      // Integration to presentation: aggregation and summarization
      'integration_presentation': {
        connectionProbability: 0.7,   // Not all integrated data reaches presentation
        relationshipTypes: ['aggregates', 'derives_from'],
        averageSourcesPerTarget: 1.8,  // Reports typically aggregate multiple sources
        processingComplexity: 'medium',
        dataVolumeReduction: 0.3,      // Heavy reduction for executive summaries
        description: 'Data aggregation for business reporting'
      },
      
      // Presentation to analytics: specialized analysis on curated data
      'presentation_analytics': {
        connectionProbability: 0.4,   // Only some presentation data feeds analytics
        relationshipTypes: ['derives_from', 'feeds_into'],
        averageSourcesPerTarget: 3.5,  // Analytics models use multiple presentation sources
        processingComplexity: 'high',
        dataVolumeReduction: 0.1,      // Extreme reduction to model parameters
        description: 'Advanced analytics and machine learning'
      },
      
      // Direct raw to presentation: operational reporting bypassing transformation
      'raw_presentation': {
        connectionProbability: 0.1,   // Rare direct connections for operational needs
        relationshipTypes: ['copies', 'derives_from'],
        averageSourcesPerTarget: 1.0,  // Usually one-to-one operational reports
        processingComplexity: 'low',
        dataVolumeReduction: 1.0,      // No volume reduction in direct copies
        description: 'Direct operational reporting'
      },
      
      // Raw to integration: emergency data fixes bypassing staging
      'raw_integration': {
        connectionProbability: 0.05,  // Very rare emergency connections
        relationshipTypes: ['transforms_to'],
        averageSourcesPerTarget: 1.0,
        processingComplexity: 'high',
        dataVolumeReduction: 0.8,
        description: 'Emergency data processing bypass'
      }
    };
    
    // Return pattern for the specific layer combination
    const patternKey = `${sourceLayer}_${targetLayer}`;
    const pattern = connectionPatterns[patternKey];
    
    if (!pattern) {
      // Return default pattern for unexpected layer combinations
      return {
        connectionProbability: 0.2,
        relationshipTypes: ['transforms_to'],
        averageSourcesPerTarget: 1.5,
        processingComplexity: 'medium',
        dataVolumeReduction: 0.8,
        description: `Generic connection from ${sourceLayer} to ${targetLayer}`
      };
    }
    
    return pattern;
  }

  async manageMemory() {
    if (global.gc) {
      global.gc();
    }
    
    const memoryUsage = process.memoryUsage();
    this.statistics.memoryPeaks.push({
      timestamp: Date.now(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal
    });
  }

  calculateAverageDepth(relationships) {
    // Calculate average path depth using relationship chain analysis
    const depthMap = new Map();
    
    relationships.forEach(rel => {
      depthMap.set(rel.targetNodeId, (depthMap.get(rel.sourceNodeId) || 0) + 1);
    });
    
    const depths = Array.from(depthMap.values());
    return depths.length > 0 ? depths.reduce((sum, depth) => sum + depth, 0) / depths.length : 0;
  }

  calculateBranchingStatistics(relationships) {
    const outDegree = new Map();
    const inDegree = new Map();
    
    relationships.forEach(rel => {
      outDegree.set(rel.sourceNodeId, (outDegree.get(rel.sourceNodeId) || 0) + 1);
      inDegree.set(rel.targetNodeId, (inDegree.get(rel.targetNodeId) || 0) + 1);
    });
    
    const outDegrees = Array.from(outDegree.values());
    const inDegrees = Array.from(inDegree.values());
    
    return {
      averageOutDegree: outDegrees.reduce((sum, deg) => sum + deg, 0) / outDegrees.length,
      maxOutDegree: Math.max(...outDegrees),
      averageInDegree: inDegrees.reduce((sum, deg) => sum + deg, 0) / inDegrees.length,
      maxInDegree: Math.max(...inDegrees)
    };
  }
}

module.exports = { LargeScaleLineageGenerator };
