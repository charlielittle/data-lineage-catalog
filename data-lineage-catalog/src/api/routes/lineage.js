// =============================================================================
// 8. API LAYER
// =============================================================================

// src/api/routes/lineage.js
class LineageRoutes {
  constructor(lineageService, impactService) {
    this.lineageService = lineageService;
    this.impactService = impactService;
    this.router = require('express').Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get shortest path between two nodes
    this.router.get('/path/:sourceId/:targetId', async (req, res, next) => {
      try {
        const { sourceId, targetId } = req.params;
        const maxDistance = parseInt(req.query.maxDistance) || 6;
        
        const result = await this.lineageService.findShortestPath(sourceId, targetId, maxDistance);
        res.json({
          success: true,
          data: result,
          metadata: {
            sourceId,
            targetId,
            maxDistance,
            pathsFound: result.length
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Get complete lineage for a node
    this.router.get('/node/:nodeId', async (req, res, next) => {
      try {
        const { nodeId } = req.params;
        const direction = req.query.direction || 'both';
        const maxDepth = parseInt(req.query.maxDepth) || 10;
        
        const lineage = await this.lineageService.getNodeLineage(nodeId, direction, maxDepth);
        res.json({
          success: true,
          data: lineage,
          metadata: {
            nodeId,
            direction,
            maxDepth,
            upstreamCount: lineage.upstreamNodes.length,
            downstreamCount: lineage.downstreamNodes.length
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Get report lineage
    this.router.post('/reports', async (req, res, next) => {
      try {
        const { reportNodeIds, includeMetadata = true } = req.body;
        
        if (!Array.isArray(reportNodeIds) || reportNodeIds.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'reportNodeIds must be a non-empty array'
          });
        }
        
        const lineage = await this.lineageService.getReportLineage(reportNodeIds, includeMetadata);
        res.json({
          success: true,
          data: lineage,
          metadata: {
            reportsAnalyzed: reportNodeIds.length,
            totalUpstreamNodes: lineage.reduce((sum, r) => sum + r.lineageSummary.totalUpstreamNodes, 0)
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Get impact analysis
    this.router.get('/impact/:nodeId', async (req, res, next) => {
      try {
        const { nodeId } = req.params;
        const changeType = req.query.changeType || 'schema_change';
        
        const impact = await this.impactService.analyzeImpact(nodeId, changeType);
        res.json({
          success: true,
          data: impact,
          metadata: {
            nodeId,
            changeType,
            totalImpactedNodes: impact.impactAssessment.totalImpactedNodes,
            riskLevel: impact.impactAssessment.riskLevel
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Batch impact analysis
    this.router.post('/impact/batch', async (req, res, next) => {
      try {
        const { nodeIds } = req.body;
        
        if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'nodeIds must be a non-empty array'
          });
        }
        
        const impacts = await this.impactService.getBatchImpactSummary(nodeIds);
        res.json({
          success: true,
          data: impacts,
          metadata: {
            nodesAnalyzed: nodeIds.length,
            successfulAnalyses: impacts.filter(i => !i.error).length
          }
        });
      } catch (error) {
        next(error);
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = { LineageRoutes };
