const { BaseVisualizer } = require('./BaseVisualizer');
const { HTMLFormatter } = require('./formatters/HTMLFormatter');

// src/visualizers/GraphVisualizer.js
class GraphVisualizer extends BaseVisualizer {
  constructor(nodeRepository, relationshipRepository, outputDir) {
    super(outputDir);
    this.nodeRepository = nodeRepository;
    this.relationshipRepository = relationshipRepository;
    this.htmlFormatter = new HTMLFormatter(outputDir);
  }

  async generateGraphData(focusNodeIds = null) {
    console.log('Generating graph data...');
    
    // Get nodes and relationships
    const nodes = focusNodeIds 
      ? await this.nodeRepository.findByNodeIds(focusNodeIds)
      : await this.nodeRepository.findAll({ status: 'active' });
    
    const relationships = focusNodeIds
      ? await this.relationshipRepository.findByNodes(focusNodeIds)
      : await this.relationshipRepository.findAll({ status: 'active' });

    console.log(`Found ${nodes.length} nodes and ${relationships.length} relationships`);
    console.log(`Node type is ${typeof nodes[0]}`);
    // Transform for visualization
    const graphNodes = nodes.map(node => ({
      id: node.nodeId,
      label: node.name,
      type: node.nodeType,
      system: node.system,
      domain: node.businessMetadata.domain,
      qualityScore: node.getOverallQuality(),
      title: this.generateNodeTooltip(node),
      color: this.getNodeColor(node.nodeType, node.businessMetadata.sensitivity),
      shape: this.getNodeShape(node.nodeType),
      size: this.getNodeSize(node.nodeType)
    }));

    const graphEdges = relationships.map(rel => ({
      from: rel.sourceNodeId,
      to: rel.targetNodeId,
      label: rel.relationshipType,
      type: rel.relationshipType,
      title: this.generateEdgeTooltip(rel),
      color: this.getEdgeColor(rel.relationshipType, rel.metadata.impact),
      width: this.getEdgeWidth(rel.metadata.impact),
      arrows: 'to'
    }));

    return {
      nodes: graphNodes,
      edges: graphEdges,
      metadata: {
        totalNodes: graphNodes.length,
        totalEdges: graphEdges.length,
        nodeTypes: [...new Set(graphNodes.map(n => n.type))],
        systems: [...new Set(graphNodes.map(n => n.system))],
        generatedAt: new Date().toISOString()
      }
    };
  }

  async generateInteractiveVisualization(graphData, title) {
    const htmlContent = this.htmlFormatter.generateInteractiveHTML(graphData, title);
    const filename = this.generateFileName('lineage-graph', 'html');
    const filePath = await this.writeFile(filename, htmlContent);
    
    console.log(`✓ Interactive visualization saved: ${filePath}`);
    return filePath;
  }

  async generateFocusedLineage(nodeId, depth = 5, direction = 'both') {
    console.log(`Generating focused lineage for ${nodeId}...`);
    
    const focusedNodeIds = await this.getFocusedNodeIds(nodeId, depth, direction);
    const graphData = await this.generateGraphData(focusedNodeIds);
    
    // Highlight the focus node
    graphData.nodes = graphData.nodes.map(node => ({
      ...node,
      ...(node.id === nodeId ? {
        borderWidth: 4,
        borderColor: '#ff4444',
        font: { size: 16, color: '#ff4444' }
      } : {})
    }));
    
    return graphData;
  }

  // Helper methods
  async getFocusedNodeIds(nodeId, depth, direction) {
    const nodeIds = new Set([nodeId]);
    
    if (direction === 'upstream' || direction === 'both') {
      const upstreamRels = await this.relationshipRepository.findUpstreamRelationships(nodeId, depth);
      upstreamRels.forEach(result => {
        nodeIds.add(result.sourceNodeId);
        if (result.upstream) {
          result.upstream.forEach(rel => nodeIds.add(rel.sourceNodeId));
        }
      });
    }
    
    if (direction === 'downstream' || direction === 'both') {
      const downstreamRels = await this.relationshipRepository.findDownstreamRelationships(nodeId, depth);
      downstreamRels.forEach(result => {
        nodeIds.add(result.targetNodeId);
        if (result.downstream) {
          result.downstream.forEach(rel => nodeIds.add(rel.targetNodeId));
        }
      });
    }
    
    return Array.from(nodeIds);
  }

  generateNodeTooltip(node) {
    return `${node.name}\\nType: ${node.nodeType}\\nSystem: ${node.system}\\nQuality: ${node.getOverallQuality()}%`;
  }

  generateEdgeTooltip(relationship) {
    return `${relationship.relationshipType}\\nImpact: ${relationship.metadata.impact}\\nConfidence: ${Math.round(relationship.metadata.confidence * 100)}%`;
  }

  getNodeShape(nodeType) {
    const shapes = {
      'source_field': 'box',
      'calculation': 'diamond',
      'report_field': 'star',
      'transformation': 'ellipse'
    };
    return shapes[nodeType] || 'dot';
  }

  getNodeSize(nodeType) {
    const sizes = {
      'source_field': 20,
      'calculation': 30,
      'report_field': 35,
      'transformation': 25
    };
    return sizes[nodeType] || 20;
  }

  getEdgeWidth(impact) {
    const widths = { 'low': 1, 'medium': 2, 'high': 3 };
    return widths[impact] || 2;
  }
}

module.exports = { GraphVisualizer };
