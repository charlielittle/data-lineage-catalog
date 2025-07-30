const { BaseVisualizer } = require('../BaseVisualizer');

// src/visualizers/formatters/HTMLFormatter.js
class HTMLFormatter extends BaseVisualizer {
  generateInteractiveHTML(graphData, title = 'Data Lineage Graph') {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .controls {
            padding: 15px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        #network {
            height: 700px;
            width: 100%;
        }
        
        .stats {
            padding: 15px 20px;
            background: #f8f9fa;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        
        <div class="controls">
            <select id="layoutSelect">
                <option value="hierarchical">Hierarchical</option>
                <option value="force">Force-directed</option>
            </select>
            <button onclick="network.fit()">Fit to Screen</button>
        </div>
        
        <div id="network"></div>
        
        <div class="stats">
            <div class="stat-item">
                <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">
                    ${graphData.metadata.totalNodes}
                </div>
                <div>Total Nodes</div>
            </div>
            <div class="stat-item">
                <div style="font-size: 1.5rem; font-weight: bold; color: #007bff;">
                    ${graphData.metadata.totalEdges}
                </div>
                <div>Total Relationships</div>
            </div>
        </div>
    </div>

    <script>
        const nodes = new vis.DataSet(${JSON.stringify(graphData.nodes)});
        const edges = new vis.DataSet(${JSON.stringify(graphData.edges)});
        const data = { nodes: nodes, edges: edges };
        
        const options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'LR',
                    sortMethod: 'directed'
                }
            },
            physics: { enabled: false },
            nodes: {
                font: { size: 12 },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                font: { size: 10 },
                shadow: true,
                arrows: 'to',
                smooth: { type: 'continuous' }
            }
        };
        
        const container = document.getElementById('network');
        const network = new vis.Network(container, data, options);
        
        document.getElementById('layoutSelect').addEventListener('change', function(e) {
            const layoutType = e.target.value;
            let newOptions = {...options};
            
            if (layoutType === 'force') {
                newOptions.layout = { hierarchical: { enabled: false } };
                newOptions.physics = { enabled: true, stabilization: { iterations: 100 } };
            } else {
                newOptions.layout = { hierarchical: { enabled: true, direction: 'LR' } };
                newOptions.physics = { enabled: false };
            }
            
            network.setOptions(newOptions);
        });
        
        network.once('stabilizationIterationsDone', function() {
            network.fit();
        });
    </script>
</body>
</html>`;

    return htmlTemplate;
  }
}

module.exports = { HTMLFormatter };
