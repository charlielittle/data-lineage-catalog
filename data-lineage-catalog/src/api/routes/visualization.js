// src/api/routes/visualization.js
class VisualizationRoutes {
  constructor(graphVisualizer) {
    this.graphVisualizer = graphVisualizer;
    this.router = require('express').Router();
    this.path = require('path');
    this.setupRoutes();
  }

  setupRoutes() {
    // Generate complete lineage graph data
    this.router.get('/data', async (req, res, next) => {
      try {
        // @ts-ignore
        const nodeIds = req.query.nodeIds ? req.query.nodeIds.split(',') : null;
        const graphData = await this.graphVisualizer.generateGraphData(nodeIds);
        res.json({
          success: true,
          data: graphData
        });
      } catch (error) {
        next(error);
      }
    });

    // Generate focused lineage data
    this.router.get('/focus/:nodeId', async (req, res, next) => {
      try {
        const { nodeId } = req.params;
        // @ts-ignore
        const depth = parseInt(req.query.depth) || 3;
        const direction = req.query.direction || 'both';
        
        const graphData = await this.graphVisualizer.generateFocusedLineage(nodeId, depth, direction);
        res.json({
          success: true,
          data: graphData,
          metadata: {
            focusNode: nodeId,
            depth,
            direction,
            nodesIncluded: graphData.nodes.length
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Generate and serve interactive HTML visualization
    this.router.get('/html', async (req, res, next) => {
      try {
        // @ts-ignore
        const nodeIds = req.query.nodeIds ? req.query.nodeIds.split(',') : null;
        const title = req.query.title || 'Data Lineage Graph';
        
        const graphData = await this.graphVisualizer.generateGraphData(nodeIds);
        const filePath = await this.graphVisualizer.generateInteractiveVisualization(graphData, title);
        
        res.sendFile(this.path.resolve(filePath));
      } catch (error) {
        next(error);
      }
    });

    // Generate focused HTML visualization
    this.router.get('/html/focus/:nodeId', async (req, res, next) => {
      try {
        const { nodeId } = req.params;
        // @ts-ignore
        const depth = parseInt(req.query.depth) || 3;
        const direction = req.query.direction || 'both';
        const title = req.query.title || `Lineage Focus: ${nodeId}`;
        
        const graphData = await this.graphVisualizer.generateFocusedLineage(nodeId, depth, direction);
        const filePath = await this.graphVisualizer.generateInteractiveVisualization(graphData, title);
        
        res.sendFile(this.path.resolve(filePath));
      } catch (error) {
        next(error);
      }
    });
  }

  getRouter() {
    return this.router;
  }
}

module.exports = { VisualizationRoutes };
