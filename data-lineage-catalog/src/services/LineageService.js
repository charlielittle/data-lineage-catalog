// =============================================================================
// 4. SERVICE LAYER (Business Logic)
// =============================================================================

// src/services/LineageService.js
class LineageService {
  constructor(nodeRepository, relationshipRepository) {
    this.nodeRepository = nodeRepository;
    this.relationshipRepository = relationshipRepository;
  }

  /**
   * Find shortest path between two nodes
   */
  async findShortestPath(sourceNodeId, targetNodeId, maxDistance = 6) {
    const pipeline = [
      {
        $match: { 
          sourceNodeId: sourceNodeId,
          status: "active" 
        }
      },
      {
        $graphLookup: {
          from: "relationships",
          startWith: "$targetNodeId",
          connectFromField: "targetNodeId",
          connectToField: "sourceNodeId",
          as: "paths",
          maxDepth: maxDistance - 1,
          restrictSearchWithMatch: { status: "active" },
          depthField: "depth"
        }
      },
      {
        $addFields: {
          matchingPaths: {
            $filter: {
              input: "$paths",
              cond: { $eq: ["$$this.targetNodeId", targetNodeId] }
            }
          }
        }
      },
      { $match: { "matchingPaths.0": { $exists: true } } },
      {
        $project: {
          sourceNode: sourceNodeId,
          targetNode: targetNodeId,
          shortestPath: {
            $reduce: {
              input: "$matchingPaths",
              initialValue: { distance: 999, depth: 999 },
              in: {
                $cond: {
                  if: { $lt: ["$$this.depth", "$$value.depth"] },
                  then: {
                    distance: { $add: ["$$this.depth", 1] },
                    depth: "$$this.depth",
                    relationshipType: "$$this.relationshipType"
                  },
                  else: "$$value"
                }
              }
            }
          }
        }
      }
    ];
    console.log(`Finding shortest path from ${sourceNodeId} to ${targetNodeId} with max distance ${maxDistance}`);
    console.log(`Pipeline: ${JSON.stringify(pipeline)}`);
    return await this.relationshipRepository.aggregate(pipeline);
  }

  /**
   * Get complete lineage for a node
   */
  async getNodeLineage(nodeId, direction = 'both', maxDepth = 10) {
    const node = await this.nodeRepository.findByNodeId(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const lineageData = {
      sourceNode: node,
      upstreamNodes: [],
      downstreamNodes: [],
      upstreamRelationships: [],
      downstreamRelationships: []
    };

    if (direction === 'upstream' || direction === 'both') {
      const upstreamRels = await this.relationshipRepository.findUpstreamRelationships(nodeId, maxDepth);
      lineageData.upstreamRelationships = upstreamRels;
      
      const upstreamNodeIds = this.extractNodeIds(upstreamRels);
      lineageData.upstreamNodes = await this.nodeRepository.findByNodeIds(upstreamNodeIds);
    }

    if (direction === 'downstream' || direction === 'both') {
      const downstreamRels = await this.relationshipRepository.findDownstreamRelationships(nodeId, maxDepth);
      lineageData.downstreamRelationships = downstreamRels;
      
      const downstreamNodeIds = this.extractNodeIds(downstreamRels);
      lineageData.downstreamNodes = await this.nodeRepository.findByNodeIds(downstreamNodeIds);
    }

    return lineageData;
  }

  /**
   * Get lineage for multiple report fields
   */
  async getReportLineage(reportNodeIds, includeMetadata = true) {
    const reportNodes = await this.nodeRepository.findByNodeIds(reportNodeIds);
    const results = [];

    for (const reportNode of reportNodes) {
      if (reportNode.nodeType !== 'report_field') {
        continue;
      }

      const lineage = await this.getNodeLineage(reportNode.nodeId, 'upstream');
      
      const lineageInfo = {
        reportField: {
          nodeId: reportNode.nodeId,
          name: reportNode.name,
          description: reportNode.description,
          system: reportNode.system,
          nodeType: reportNode.nodeType
        },
        lineageSummary: this.generateLineageSummary(lineage),
        ...(includeMetadata && {
          upstreamNodes: this.formatNodesForOutput(lineage.upstreamNodes),
          lineageTree: this.formatRelationshipsForOutput(lineage.upstreamRelationships)
        })
      };

      results.push(lineageInfo);
    }

    return results;
  }

  /**
   * Helper methods
   */
  extractNodeIds(relationshipResults) {
    const nodeIds = new Set();
    
    relationshipResults.forEach(result => {
      nodeIds.add(result.sourceNodeId);
      nodeIds.add(result.targetNodeId);
      
      if (result.upstream) {
        result.upstream.forEach(rel => nodeIds.add(rel.sourceNodeId));
      }
      
      if (result.downstream) {
        result.downstream.forEach(rel => nodeIds.add(rel.targetNodeId));
      }
    });
    
    return Array.from(nodeIds);
  }

  generateLineageSummary(lineage) {
    const allNodes = [...lineage.upstreamNodes, ...lineage.downstreamNodes];
    const allRelationships = [...lineage.upstreamRelationships, ...lineage.downstreamRelationships];
    
    return {
      totalUpstreamNodes: lineage.upstreamNodes.length,
      totalDownstreamNodes: lineage.downstreamNodes.length,
      maxDepth: this.calculateMaxDepth(allRelationships),
      systemsInvolved: [...new Set(allNodes.map(n => n.system))],
      domainsInvolved: [...new Set(allNodes.map(n => n.businessMetadata.domain).filter(Boolean))],
      avgQualityScore: this.calculateAverageQuality(allNodes)
    };
  }

  calculateMaxDepth(relationships) {
    let maxDepth = 0;
    relationships.forEach(rel => {
      if (rel.upstream) {
        rel.upstream.forEach(upstream => {
          maxDepth = Math.max(maxDepth, upstream.depth || 0);
        });
      }
      if (rel.downstream) {
        rel.downstream.forEach(downstream => {
          maxDepth = Math.max(maxDepth, downstream.depth || 0);
        });
      }
    });
    return maxDepth;
  }

  calculateAverageQuality(nodes) {
    if (nodes.length === 0) return 0;
    const totalQuality = nodes.reduce((sum, node) => sum + node.getOverallQuality(), 0);
    return Math.round(totalQuality / nodes.length);
  }

  formatNodesForOutput(nodes) {
    return nodes.map(node => ({
      nodeId: node.nodeId,
      name: node.name,
      nodeType: node.nodeType,
      system: node.system,
      dataOwner: node.businessMetadata.dataOwner,
      domain: node.businessMetadata.domain,
      sensitivity: node.businessMetadata.sensitivity,
      qualityScore: node.getOverallQuality()
    }));
  }

  formatRelationshipsForOutput(relationships) {
    const formatted = [];
    
    relationships.forEach(result => {
      // Add the direct relationship
      formatted.push({
        sourceNodeId: result.sourceNodeId,
        targetNodeId: result.targetNodeId,
        relationshipType: result.relationshipType,
        depth: 0,
        confidence: result.metadata?.confidence,
        impact: result.metadata?.impact,
        transformationType: result.metadata?.transformationType
      });
      
      // Add upstream relationships
      if (result.upstream) {
        result.upstream.forEach(upstream => {
          formatted.push({
            sourceNodeId: upstream.sourceNodeId,
            targetNodeId: upstream.targetNodeId,
            relationshipType: upstream.relationshipType,
            depth: upstream.depth,
            confidence: upstream.metadata?.confidence,
            impact: upstream.metadata?.impact,
            transformationType: upstream.metadata?.transformationType
          });
        });
      }
    });
    
    return formatted.sort((a, b) => a.depth - b.depth);
  }
}

module.exports = { LineageService };
