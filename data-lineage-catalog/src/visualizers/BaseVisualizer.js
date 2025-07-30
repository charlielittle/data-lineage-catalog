// =============================================================================
// 7. VISUALIZATION LAYER
// =============================================================================

// src/visualizers/BaseVisualizer.js
class BaseVisualizer {
  constructor(outputDir = './visualizations') {
    this.outputDir = outputDir;
    this.fs = require('fs').promises;
    this.path = require('path');
  }

  async initialize() {
    try {
      await this.fs.mkdir(this.outputDir, { recursive: true });
      console.log(`✓ Visualization directory ready: ${this.outputDir}`);
    } catch (error) {
      console.error('Error initializing visualizer:', error.message);
      throw error;
    }
  }

  async writeFile(filename, content) {
    const filePath = this.path.join(this.outputDir, filename);
    await this.fs.writeFile(filePath, content);
    return filePath;
  }

  generateFileName(prefix, extension) {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}.${extension}`;
  }

  // Color and styling utilities
  getNodeColor(nodeType, sensitivity = 'public') {
    const baseColors = {
      'source_field': '#e3f2fd',
      'transformation': '#fff3e0',
      'calculation': '#f3e5f5',
      'derived_field': '#e8f6f3',
      'report_field': '#e8f5e8'
    };

    const sensitivityAlpha = {
      'public': '1.0',
      'internal': '0.9',
      'confidential': '0.8',
      'restricted': '0.7'
    };

    const baseColor = baseColors[nodeType] || '#f5f5f5';
    const alpha = sensitivityAlpha[sensitivity] || '1.0';
    
    return baseColor;
  }

  getEdgeColor(relationshipType, impact = 'medium') {
    const baseColors = {
      'transforms_to': '#2196f3',
      'aggregates': '#4caf50',
      'joins': '#ff9800',
      'derives_from': '#9c27b0',
      'filters': '#f44336',
      'copies': '#607d8b'
    };

    return baseColors[relationshipType] || '#666666';
  }

  calculateOverallQuality(qualityMetrics) {
    if (!qualityMetrics) return 0;
    const { completeness = 0, validity = 0, accuracy = 0 } = qualityMetrics;
    return Math.round((completeness + validity + accuracy) / 3);
  }
}

module.exports = { BaseVisualizer };
