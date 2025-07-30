// src/api/routes/quality.js
class QualityRoutes {
  constructor(qualityService) {
    this.qualityService = qualityService;
    this.router = require('express').Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get comprehensive quality summary
    this.router.get('/summary', async (req, res, next) => {
      try {
        const summary = await this.qualityService.getQualitySummary();
        res.json({
          success: true,
          data: summary,
          metadata: {
            totalNodes: summary.overallStats.totalNodes,
            averageQuality: Math.round((
              summary.overallStats.avgCompleteness + 
              summary.overallStats.avgValidity + 
              summary.overallStats.avgAccuracy
            ) / 3),
            issuesFound: summary.qualityIssues.length
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Get quality trends
    this.router.get('/trends', async (req, res, next) => {
      try {
        const days = parseInt(req.query.days) || 30;
        const trends = await this.qualityService.getQualityTrends(days);
        res.json({
          success: true,
          data: trends,
          metadata: { period: `${days} days` }
        });
      } catch (error) {
        next(error);
      }
    });

    // Validate specific node quality
    this.router.get('/validate/:nodeId', async (req, res, next) => {
      try {
        const { nodeId } = req.params;
        const validation = await this.qualityService.validateNodeQuality(nodeId);
        res.json({
          success: true,
          data: validation,
          metadata: {
            nodeId,
            passed: validation.passed,
            rulesChecked: validation.validationResults.length
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

module.exports = { QualityRoutes };
