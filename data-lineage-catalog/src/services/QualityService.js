// src/services/QualityService.js
class QualityService {
  constructor(nodeRepository) {
    this.nodeRepository = nodeRepository;
  }

  /**
   * Get comprehensive quality summary
   */
  async getQualitySummary() {
    const [qualityByType, qualityIssues, domainCoverage] = await Promise.all([
      this.nodeRepository.getQualityStatsByType(),
      this.nodeRepository.findWithQualityIssues(95),
      this.nodeRepository.getDomainCoverage()
    ]);

    return {
      overallStats: this.calculateOverallQualityStats(qualityByType),
      qualityByType,
      qualityIssues: qualityIssues.map(node => ({
        nodeId: node.nodeId,
        name: node.name,
        nodeType: node.nodeType,
        system: node.system,
        overallQuality: node.getOverallQuality(),
        completeness: node.qualityMetrics.completeness,
        validity: node.qualityMetrics.validity,
        accuracy: node.qualityMetrics.accuracy
      })),
      domainQuality: domainCoverage.map(domain => ({
        domain: domain._id,
        nodeCount: domain.count,
        avgQuality: Math.round(domain.avgQuality || 0),
        systems: domain.systems,
        nodeTypes: domain.nodeTypes
      }))
    };
  }

  /**
   * Get quality trends over time
   */
  async getQualityTrends(days = 30) {
    // This would require historical quality data
    // For now, return placeholder structure
    return {
      period: `${days} days`,
      trends: [
        { date: new Date(), avgCompleteness: 85, avgValidity: 92, avgAccuracy: 88 }
      ]
    };
  }

  /**
   * Validate node quality rules
   */
  async validateNodeQuality(nodeId) {
    const node = await this.nodeRepository.findByNodeId(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const validationResults = [];
    
    // Check completeness
    if (node.qualityMetrics.completeness < 90) {
      validationResults.push({
        rule: 'completeness_threshold',
        status: 'failed',
        expected: '>=90%',
        actual: `${node.qualityMetrics.completeness}%`,
        severity: 'warning'
      });
    }

    // Check validity
    if (node.qualityMetrics.validity < 95) {
      validationResults.push({
        rule: 'validity_threshold',
        status: 'failed',
        expected: '>=95%',
        actual: `${node.qualityMetrics.validity}%`,
        severity: 'error'
      });
    }

    // Check if quality check is recent (within 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (!node.qualityMetrics.lastQualityCheck || node.qualityMetrics.lastQualityCheck < weekAgo) {
      validationResults.push({
        rule: 'quality_check_freshness',
        status: 'failed',
        expected: 'Within 7 days',
        actual: node.qualityMetrics.lastQualityCheck ? 
          `${Math.floor((Date.now() - node.qualityMetrics.lastQualityCheck) / (24 * 60 * 60 * 1000))} days ago` : 
          'Never',
        severity: 'warning'
      });
    }

    return {
      nodeId: node.nodeId,
      name: node.name,
      overallQuality: node.getOverallQuality(),
      validationResults,
      passed: validationResults.filter(r => r.status === 'failed').length === 0
    };
  }

  // Helper methods
  calculateOverallQualityStats(qualityByType) {
    if (qualityByType.length === 0) {
      return { avgCompleteness: 0, avgValidity: 0, avgAccuracy: 0, totalNodes: 0 };
    }

    const totalNodes = qualityByType.reduce((sum, type) => sum + type.count, 0);
    const weightedCompleteness = qualityByType.reduce((sum, type) => 
      sum + (type.avgCompleteness * type.count), 0) / totalNodes;
    const weightedValidity = qualityByType.reduce((sum, type) => 
      sum + (type.avgValidity * type.count), 0) / totalNodes;
    const weightedAccuracy = qualityByType.reduce((sum, type) => 
      sum + (type.avgAccuracy * type.count), 0) / totalNodes;

    return {
      avgCompleteness: Math.round(weightedCompleteness),
      avgValidity: Math.round(weightedValidity),
      avgAccuracy: Math.round(weightedAccuracy),
      totalNodes
    };
  }
}

module.exports = { QualityService };
