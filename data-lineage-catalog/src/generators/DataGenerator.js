const { NodeFactory } = require( './NodeFactory');
const { RelationshipFactory } = require('./RelationshipFactory');

// src/generators/DataGenerator.js - Enhanced version with deeper lineage chains
class DataGenerator {
  constructor() {
    this.nodeFactory = new NodeFactory();
    this.relationshipFactory = new RelationshipFactory();
  }

  /**
   * Generate a focused enterprise dataset with deeper lineage chains
   * This approach creates fewer source nodes but builds deeper transformation
   * paths to demonstrate rich lineage relationships and impact analysis
   */
  generateEnterpriseDataset() {
    const nodes = [];
    const relationships = [];

    // Create a smaller, focused set of source fields that will form the foundation
    // for deeper transformation chains leading to key business reports
    const sourceFields = this.generateFocusedSourceFields();
    nodes.push(...sourceFields);

    // Build multiple transformation layers between sources and final reports
    // Each layer represents a different stage of data processing and refinement
    const level1Transformations = this.generateLevel1Transformations(sourceFields);
    nodes.push(...level1Transformations);

    const level2Calculations = this.generateLevel2Calculations(level1Transformations);
    nodes.push(...level2Calculations);

    const level3Aggregations = this.generateLevel3Aggregations(level2Calculations);
    nodes.push(...level3Aggregations);

    const level4BusinessMetrics = this.generateLevel4BusinessMetrics(level3Aggregations);
    nodes.push(...level4BusinessMetrics);

    const level5DerivedKPIs = this.generateLevel5DerivedKPIs(level4BusinessMetrics);
    nodes.push(...level5DerivedKPIs);

    // Create final executive reports that aggregate multiple KPI streams
    // These represent the ultimate consumption points with 6-8 levels of depth
    const executiveReports = this.generateExecutiveReports(level5DerivedKPIs);
    nodes.push(...executiveReports);

    // Generate relationships that create coherent lineage paths from sources to reports
    // Each relationship represents a meaningful data transformation or aggregation step
    relationships.push(...this.generateLayeredRelationships(
      sourceFields, level1Transformations, level2Calculations, 
      level3Aggregations, level4BusinessMetrics, level5DerivedKPIs, executiveReports
    ));

    return { nodes, relationships };
  }

  /**
   * Generate a focused set of source fields that serve as foundation data
   * Fewer sources but each one feeds into multiple transformation chains
   * This creates the convergent lineage patterns common in real enterprises
   */
  generateFocusedSourceFields() {
    const sourceFields = [];
    
    // Customer core data - essential for most business analysis
    const customerSources = [
      'customer_id', 'customer_registration_date', 'customer_segment',
      'customer_lifetime_value', 'customer_acquisition_cost'
    ];

    // Transaction core data - fundamental for revenue analysis  
    const transactionSources = [
      'transaction_id', 'transaction_amount', 'transaction_date',
      'payment_method', 'transaction_fee'
    ];

    // Product core data - needed for product performance analysis
    const productSources = [
      'product_id', 'product_price', 'product_category',
      'product_cost', 'inventory_quantity'
    ];

    // Create source field nodes with rich metadata
    // Each source field includes comprehensive technical and business metadata
    // that will be inherited through the transformation chain
    [
      { domain: 'customer', fields: customerSources, system: 'crm_system' },
      { domain: 'finance', fields: transactionSources, system: 'payment_system' },
      { domain: 'product', fields: productSources, system: 'inventory_system' }
    ].forEach(({ domain, fields, system }) => {
      fields.forEach(fieldName => {
        const nodeId = fieldName;  // Simplified IDs for cleaner visualization
        const owner = this.nodeFactory.getRandomOwner();
        sourceFields.push(
          this.nodeFactory.createSourceField(nodeId, fieldName, system, domain, owner)
        );
      });
    });

    return sourceFields;
  }

  /**
   * Level 1: Basic transformations and cleansing operations
   * These represent initial data processing steps like formatting,
   * validation, and basic enrichment that prepare data for analysis
   */
  generateLevel1Transformations(sourceFields) {
    const transformations = [];
    const system = 'data_processing_engine';
    const owner = 'data.engineer';

    // Customer data standardization and enrichment
    // Transform raw customer data into standardized formats
    transformations.push(
      this.nodeFactory.createCalculation(
        'customer_segment_standardized',
        'Standardized Customer Segment',
        system, 'customer', owner,
        'CASE WHEN customer_segment IN ("premium", "gold") THEN "high_value" ELSE "standard" END'
      )
    );

    transformations.push(
      this.nodeFactory.createCalculation(
        'customer_tenure_days',
        'Customer Tenure in Days',
        system, 'customer', owner,
        'DATEDIFF(CURRENT_DATE, customer_registration_date)'
      )
    );

    // Transaction data cleansing and validation
    // Clean and validate transaction amounts, removing invalid entries
    transformations.push(
      this.nodeFactory.createCalculation(
        'validated_transaction_amount',
        'Validated Transaction Amount',
        system, 'finance', owner,
        'CASE WHEN transaction_amount > 0 AND transaction_amount < 1000000 THEN transaction_amount ELSE NULL END'
      )
    );

    transformations.push(
      this.nodeFactory.createCalculation(
        'net_transaction_amount',
        'Net Transaction Amount',
        system, 'finance', owner,
        'validated_transaction_amount - COALESCE(transaction_fee, 0)'
      )
    );

    // Product data enrichment and categorization
    // Calculate product margins and profitability indicators
    transformations.push(
      this.nodeFactory.createCalculation(
        'product_margin',
        'Product Margin',
        system, 'product', owner,
        '(product_price - product_cost) / product_price * 100'
      )
    );

    transformations.push(
      this.nodeFactory.createCalculation(
        'product_availability_status',
        'Product Availability Status',
        system, 'product', owner,
        'CASE WHEN inventory_quantity > 10 THEN "available" WHEN inventory_quantity > 0 THEN "limited" ELSE "out_of_stock" END'
      )
    );

    return transformations;
  }

  /**
   * Level 2: Intermediate calculations and business rule applications
   * These nodes combine multiple level 1 transformations to create
   * more sophisticated business metrics and derived attributes
   */
  generateLevel2Calculations(level1Nodes) {
    const calculations = [];
    const system = 'analytics_engine';
    const owner = 'business.analyst';

    // Customer value scoring based on multiple factors
    // Combines tenure, segment, and transaction history for comprehensive scoring
    calculations.push(
      this.nodeFactory.createCalculation(
        'customer_value_score',
        'Customer Value Score',
        system, 'customer', owner,
        'CASE WHEN customer_segment_standardized = "high_value" THEN customer_lifetime_value * 1.5 ELSE customer_lifetime_value END'
      )
    );

    calculations.push(
      this.nodeFactory.createCalculation(
        'customer_acquisition_roi',
        'Customer Acquisition ROI',
        system, 'customer', owner,
        '(customer_lifetime_value - customer_acquisition_cost) / customer_acquisition_cost * 100'
      )
    );

    // Transaction pattern analysis and categorization
    // Create sophisticated transaction classifications for business analysis
    calculations.push(
      this.nodeFactory.createCalculation(
        'transaction_risk_category',
        'Transaction Risk Category',
        system, 'finance', owner,
        'CASE WHEN net_transaction_amount > 5000 THEN "high_risk" WHEN net_transaction_amount > 1000 THEN "medium_risk" ELSE "low_risk" END'
      )
    );

    calculations.push(
      this.nodeFactory.createCalculation(
        'monthly_transaction_volume',
        'Monthly Transaction Volume',
        system, 'finance', owner,
        'SUM(net_transaction_amount) OVER (PARTITION BY customer_id, YEAR(transaction_date), MONTH(transaction_date))'
      )
    );

    // Product performance indicators based on margin and availability
    // Create comprehensive product scoring for inventory and pricing decisions
    calculations.push(
      this.nodeFactory.createCalculation(
        'product_performance_score',
        'Product Performance Score',
        system, 'product', owner,
        'CASE WHEN product_margin > 50 AND product_availability_status = "available" THEN 100 ELSE product_margin END'
      )
    );

    return calculations;
  }

  /**
   * Level 3: Cross-domain aggregations and period-based metrics
   * These calculations combine data across different business domains
   * and create time-based aggregations for trend analysis
   */
  generateLevel3Aggregations(level2Nodes) {
    const aggregations = [];
    const system = 'data_warehouse';
    const owner = 'data.analyst';

    // Customer cohort analysis combining value scores with transaction patterns
    // Sophisticated customer segmentation for targeted marketing and retention
    aggregations.push(
      this.nodeFactory.createCalculation(
        'customer_cohort_value',
        'Customer Cohort Value Analysis',
        system, 'customer', owner,
        'AVG(customer_value_score) OVER (PARTITION BY customer_segment_standardized, QUARTER(customer_registration_date))'
      )
    );

    aggregations.push(
      this.nodeFactory.createCalculation(
        'customer_retention_indicator',
        'Customer Retention Indicator',
        system, 'customer', owner,
        'CASE WHEN customer_acquisition_roi > 200 AND monthly_transaction_volume > 1000 THEN "high_retention" ELSE "at_risk" END'
      )
    );

    // Revenue aggregations that span multiple time periods and risk categories
    // Create comprehensive revenue analysis across different business dimensions
    aggregations.push(
      this.nodeFactory.createCalculation(
        'quarterly_revenue_by_risk',
        'Quarterly Revenue by Risk Category',
        system, 'finance', owner,
        'SUM(net_transaction_amount) OVER (PARTITION BY transaction_risk_category, QUARTER(transaction_date))'
      )
    );

    aggregations.push(
      this.nodeFactory.createCalculation(
        'revenue_growth_rate',
        'Revenue Growth Rate',
        system, 'finance', owner,
        '(quarterly_revenue_by_risk - LAG(quarterly_revenue_by_risk, 1) OVER (ORDER BY QUARTER(transaction_date))) / LAG(quarterly_revenue_by_risk, 1) OVER (ORDER BY QUARTER(transaction_date)) * 100'
      )
    );

    // Product portfolio analysis combining performance with customer segments
    // Strategic product insights for portfolio optimization and pricing strategy
    aggregations.push(
      this.nodeFactory.createCalculation(
        'product_portfolio_performance',
        'Product Portfolio Performance',
        system, 'product', owner,
        'SUM(product_performance_score * net_transaction_amount) / SUM(net_transaction_amount)'
      )
    );

    return aggregations;
  }

  /**
   * Level 4: Strategic business metrics and KPI foundations
   * These represent key business indicators that combine multiple
   * lower-level metrics into strategic decision-making tools
   */
  generateLevel4BusinessMetrics(level3Nodes) {
    const metrics = [];
    const system = 'business_intelligence';
    const owner = 'strategy.analyst';

    // Comprehensive customer lifetime value optimization metrics
    // Strategic customer analysis for long-term business planning
    metrics.push(
      this.nodeFactory.createCalculation(
        'optimized_customer_ltv',
        'Optimized Customer Lifetime Value',
        system, 'customer', owner,
        'customer_cohort_value * CASE WHEN customer_retention_indicator = "high_retention" THEN 1.3 ELSE 0.8 END'
      )
    );

    metrics.push(
      this.nodeFactory.createCalculation(
        'customer_portfolio_health',
        'Customer Portfolio Health Score',
        system, 'customer', owner,
        'AVG(CASE WHEN customer_retention_indicator = "high_retention" THEN 100 ELSE 25 END)'
      )
    );

    // Advanced revenue optimization and forecasting metrics
    // Financial metrics that drive strategic revenue management decisions
    metrics.push(
      this.nodeFactory.createCalculation(
        'revenue_quality_index',
        'Revenue Quality Index',
        system, 'finance', owner,
        'quarterly_revenue_by_risk * (1 + revenue_growth_rate / 100) * CASE WHEN transaction_risk_category = "low_risk" THEN 1.2 ELSE 0.9 END'
      )
    );

    metrics.push(
      this.nodeFactory.createCalculation(
        'predictive_revenue_score',
        'Predictive Revenue Score',
        system, 'finance', owner,
        'revenue_quality_index + (customer_portfolio_health * 0.3)'
      )
    );

    // Strategic product optimization combining performance with market dynamics
    // Product strategy metrics for portfolio management and development priorities
    metrics.push(
      this.nodeFactory.createCalculation(
        'strategic_product_value',
        'Strategic Product Value Index',
        system, 'product', owner,
        'product_portfolio_performance * customer_portfolio_health / 100'
      )
    );

    return metrics;
  }

  /**
   * Level 5: Executive KPIs and derived strategic indicators
   * These represent the highest-level business indicators that
   * executives use for strategic decision making and performance monitoring
   */
  generateLevel5DerivedKPIs(level4Nodes) {
    const kpis = [];
    const system = 'executive_analytics';
    const owner = 'executive.team';

    // Ultimate customer value optimization combining all customer insights
    // Executive-level customer strategy indicators for board reporting
    kpis.push(
      this.nodeFactory.createCalculation(
        'enterprise_customer_value',
        'Enterprise Customer Value Index',
        system, 'customer', owner,
        'optimized_customer_ltv * customer_portfolio_health / 100'
      )
    );

    // Comprehensive business performance index combining revenue and strategy
    // Top-level financial performance indicator for executive dashboards
    kpis.push(
      this.nodeFactory.createCalculation(
        'business_performance_index',
        'Business Performance Index',
        system, 'finance', owner,
        '(predictive_revenue_score + enterprise_customer_value + strategic_product_value) / 3'
      )
    );

    // Strategic growth potential indicator for investment decisions
    // Forward-looking metric that guides strategic planning and resource allocation
    kpis.push(
      this.nodeFactory.createCalculation(
        'growth_potential_score',
        'Strategic Growth Potential Score',
        system, 'strategy', owner,
        'business_performance_index * 1.2 + (strategic_product_value * 0.8)'
      )
    );

    return kpis;
  }

  /**
   * Generate final executive reports that represent the ultimate consumption
   * points of the lineage chains. These reports aggregate multiple KPI streams
   * and represent real business reporting scenarios with 6-8 levels of depth
   */
  generateExecutiveReports(level5Nodes) {
    const reports = [];
    const system = 'executive_reporting';
    const owner = 'chief.executive';

    // Comprehensive executive dashboard combining all strategic indicators
    // This report represents the culmination of 6-7 transformation layers
    reports.push(
      this.nodeFactory.createReportField(
        'ceo_dashboard_monthly',
        'CEO Monthly Business Performance Dashboard',
        system, 'executive', owner
      )
    );

    // Strategic planning report that combines growth potential with current performance
    // Board-level reporting that demonstrates the full depth of data transformation
    reports.push(
      this.nodeFactory.createReportField(
        'board_strategic_report',
        'Board Strategic Performance Report',
        system, 'executive', owner
      )
    );

    // Investor relations report that showcases business health and growth trajectory
    // External reporting that represents the ultimate value of the lineage chain
    reports.push(
      this.nodeFactory.createReportField(
        'investor_performance_report',
        'Investor Performance and Growth Report',
        system, 'executive', owner
      )
    );

    return reports;
  }

  /**
   * Generate layered relationships that create coherent lineage paths
   * This method creates relationships between each transformation layer
   * ensuring that the final reports have 6-8 levels of lineage depth
   */
  generateLayeredRelationships(sourceFields, level1, level2, level3, level4, level5, reports) {
    const relationships = [];

    // Layer 0 -> Layer 1: Source fields to initial transformations
    // Each source field feeds into relevant transformations based on domain matching
    this.connectLayers(sourceFields, level1, relationships, 'transforms_to', 'high');

    // Layer 1 -> Layer 2: Initial transformations to intermediate calculations
    // Build upon cleaned data to create more sophisticated business logic
    this.connectLayers(level1, level2, relationships, 'transforms_to', 'high');

    // Layer 2 -> Layer 3: Intermediate calculations to cross-domain aggregations
    // Combine multiple business metrics into comprehensive analytical views
    this.connectLayers(level2, level3, relationships, 'aggregates', 'high');

    // Layer 3 -> Layer 4: Aggregations to strategic business metrics
    // Transform analytical views into strategic decision-making indicators
    this.connectLayers(level3, level4, relationships, 'transforms_to', 'high');

    // Layer 4 -> Layer 5: Business metrics to executive KPIs
    // Synthesize strategic indicators into executive-level performance measures
    this.connectLayers(level4, level5, relationships, 'aggregates', 'high');

    // Layer 5 -> Reports: Executive KPIs to final reporting destinations
    // Multiple KPIs feed into each executive report for comprehensive reporting
    this.connectKPIsToReports(level5, reports, relationships);

    return relationships;
  }

  /**
   * Connect nodes between adjacent transformation layers
   * Uses domain matching and logical relationships to create meaningful connections
   */
  connectLayers(sourceLayer, targetLayer, relationships, relType, impact) {
    sourceLayer.forEach(sourceNode => {
      targetLayer.forEach(targetNode => {
        // Create connections based on domain relationships and naming patterns
        // This ensures that the lineage paths make business sense
        if (this.shouldConnectNodes(sourceNode, targetNode)) {
          relationships.push(
            this.relationshipFactory.createTransformation(
              sourceNode.nodeId,
              targetNode.nodeId,
              relType,
              impact
            )
          );
        }
      });
    });
  }

  /**
   * Connect executive KPIs to final reports with multiple convergent paths
   * Each report receives input from multiple KPIs to demonstrate the convergent
   * nature of executive reporting where many data streams feed into summary reports
   */
  connectKPIsToReports(kpiNodes, reportNodes, relationships) {
    reportNodes.forEach(report => {
      // Each executive report aggregates multiple KPIs
      // This creates the convergent lineage pattern common in executive reporting
      kpiNodes.forEach(kpi => {
        relationships.push(
          this.relationshipFactory.createTransformation(
            kpi.nodeId,
            report.nodeId,
            'aggregates',
            'high'
          )
        );
      });
    });
  }

  /**
   * Determine if two nodes should be connected based on business logic
   * Uses domain matching, naming patterns, and transformation logic
   * to create realistic lineage connections
   */
  shouldConnectNodes(sourceNode, targetNode) {
    const sourceDomain = sourceNode.businessMetadata.domain;
    const targetDomain = targetNode.businessMetadata.domain;
    const sourceName = sourceNode.name.toLowerCase();
    const targetName = targetNode.name.toLowerCase();

    // Direct domain matches always connect
    if (sourceDomain === targetDomain) {
      return true;
    }

    // Cross-domain connections based on business logic
    const crossDomainMappings = {
      'customer': ['finance', 'strategy', 'executive'],
      'finance': ['strategy', 'executive'],
      'product': ['finance', 'strategy', 'executive'],
      'strategy': ['executive']
    };

    if (crossDomainMappings[sourceDomain]?.includes(targetDomain)) {
      return true;
    }

    // Semantic connections based on naming patterns
    // Connect nodes that have related business concepts in their names
    if (this.hasSemanticConnection(sourceName, targetName)) {
      return true;
    }

    return false;
  }

  /**
   * Check for semantic connections between node names
   * Identifies related business concepts that should be connected
   * even across different domains
   */
  hasSemanticConnection(sourceName, targetName) {
    const semanticMappings = [
      ['customer', 'value', 'retention', 'cohort', 'ltv'],
      ['transaction', 'revenue', 'payment', 'financial', 'growth'],
      ['product', 'performance', 'portfolio', 'strategic'],
      ['business', 'executive', 'strategic', 'performance', 'growth']
    ];

    return semanticMappings.some(group => {
      const sourceInGroup = group.some(term => sourceName.includes(term));
      const targetInGroup = group.some(term => targetName.includes(term));
      return sourceInGroup && targetInGroup;
    });
  }
}

module.exports = { DataGenerator };
