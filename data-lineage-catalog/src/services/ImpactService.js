
// src/services/ImpactService.js
class ImpactService {
  constructor(nodeRepository, relationshipRepository) {
    this.nodeRepository = nodeRepository;
    this.relationshipRepository = relationshipRepository;
  }

  /**
   * Analyze downstream impact of changes to a node
   */
  async analyzeImpact(nodeId, changeType = 'schema_change') {
    const sourceNode = await this.nodeRepository.findByNodeId(nodeId);
    if (!sourceNode) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const downstreamRels = await this.relationshipRepository.findDownstreamRelationships(nodeId, 8);
    const impactedNodeIds = this.extractImpactedNodeIds(downstreamRels);
    const impactedNodes = await this.nodeRepository.findByNodeIds(impactedNodeIds);

    const impactAnalysis = {
      sourceNode: {
        nodeId: sourceNode.nodeId,
        name: sourceNode.name,
        system: sourceNode.system,
        nodeType: sourceNode.nodeType
      },
      changeType: changeType,
      impactAssessment: this.calculateImpactAssessment(downstreamRels, impactedNodes),
      detailedImpact: this.formatDetailedImpact(downstreamRels),
      recommendations: this.generateRecommendations(impactedNodes, changeType)
    };

    return impactAnalysis;
  }

  /**
   * Get impact summary for multiple nodes
   */
  async getBatchImpactSummary(nodeIds) {
    const summaries = [];
    
    for (const nodeId of nodeIds) {
      try {
        const impact = await this.analyzeImpact(nodeId);
        summaries.push({
          nodeId,
          totalImpactedNodes: impact.impactAssessment.totalImpactedNodes,
          highImpactNodes: impact.impactAssessment.highImpactNodes,
          systemsImpacted: impact.impactAssessment.systemsImpacted.length,
          reportsImpacted: impact.impactAssessment.reportsImpacted
        });
      } catch (error) {
        summaries.push({
          nodeId,
          error: error.message
        });
      }
    }
    
    return summaries;
  }

  // Helper methods
  extractImpactedNodeIds(downstreamRels) {
    const nodeIds = new Set();
    
    downstreamRels.forEach(result => {
      nodeIds.add(result.targetNodeId);
      if (result.downstream) {
        result.downstream.forEach(rel => nodeIds.add(rel.targetNodeId));
      }
    });
    
    return Array.from(nodeIds);
  }

  calculateImpactAssessment(downstreamRels, impactedNodes) {
    const highImpactCount = this.countHighImpactRelationships(downstreamRels);
    const maxDepth = this.calculateMaxImpactDepth(downstreamRels);
    const systemsSet = new Set(impactedNodes.map(n => n.system));
    const domainsSet = new Set(impactedNodes.map(n => n.businessMetadata.domain).filter(Boolean));
    const reportsCount = impactedNodes.filter(n => n.nodeType === 'report_field').length;

    return {
      totalImpactedNodes: impactedNodes.length,
      maxImpactDepth: maxDepth,
      highImpactNodes: highImpactCount,
      systemsImpacted: Array.from(systemsSet),
      businessDomainsImpacted: Array.from(domainsSet),
      reportsImpacted: reportsCount,
      riskLevel: this.calculateRiskLevel(impactedNodes.length, highImpactCount, reportsCount)
    };
  }

  countHighImpactRelationships(downstreamRels) {
    let count = 0;
    downstreamRels.forEach(result => {
      if (result.metadata?.impact === 'high') count++;
      if (result.downstream) {
        result.downstream.forEach(rel => {
          if (rel.metadata?.impact === 'high') count++;
        });
      }
    });
    return count;
  }

  calculateMaxImpactDepth(downstreamRels) {
    let maxDepth = 0;
    downstreamRels.forEach(result => {
      if (result.downstream) {
        result.downstream.forEach(rel => {
          maxDepth = Math.max(maxDepth, rel.impactDepth || 0);
        });
      }
    });
    return maxDepth;
  }

  calculateRiskLevel(totalNodes, highImpactNodes, reportsImpacted) {
    if (reportsImpacted > 5 || highImpactNodes > 10) return 'high';
    if (reportsImpacted > 2 || highImpactNodes > 5 || totalNodes > 20) return 'medium';
    return 'low';
  }

  formatDetailedImpact(downstreamRels) {
    const impacts = [];
    
    downstreamRels.forEach(result => {
      impacts.push({
        nodeId: result.targetNodeId,
        depth: 1,
        relationshipType: result.relationshipType,
        impact: result.metadata?.impact || 'medium',
        confidence: result.metadata?.confidence || 1.0
      });
      
      if (result.downstream) {
        result.downstream.forEach(rel => {
          impacts.push({
            nodeId: rel.targetNodeId,
            depth: (rel.impactDepth || 0) + 1,
            relationshipType: rel.relationshipType,
            impact: rel.metadata?.impact || 'medium',
            confidence: rel.metadata?.confidence || 1.0
          });
        });
      }
    });
    
    return impacts.sort((a, b) => a.depth - b.depth);
  }

  generateRecommendations(impactedNodes, changeType) {
    const recommendations = [];
    
    const reportsImpacted = impactedNodes.filter(n => n.nodeType === 'report_field').length;
    if (reportsImpacted > 0) {
      recommendations.push(`${reportsImpacted} report(s) will be affected. Plan for report updates and user communication.`);
    }
    
    const systems = new Set(impactedNodes.map(n => n.system));
    if (systems.size > 1) {
      recommendations.push(`Changes will affect ${systems.size} systems. Coordinate with multiple system owners.`);
    }
    
    const restrictedNodes = impactedNodes.filter(n => n.businessMetadata.isRestricted()).length;
    if (restrictedNodes > 0) {
      recommendations.push(`${restrictedNodes} sensitive/restricted nodes affected. Review compliance requirements.`);
    }
    
    if (changeType === 'schema_change') {
      recommendations.push('Test all downstream transformations and calculations after schema changes.');
    }
    
    return recommendations;
  }
}

module.exports = { ImpactService };
