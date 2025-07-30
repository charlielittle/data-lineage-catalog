// =============================================================================
// 6. DATA GENERATION LAYER
// =============================================================================
const { Node } = require('../models');

// src/generators/NodeFactory.js
class NodeFactory {
  constructor() {
    this.domains = ['customer', 'product', 'finance', 'inventory', 'marketing', 'operations'];
    this.systems = ['salesforce', 'data_warehouse', 'order_management', 'reporting_tool', 'analytics_platform'];
    this.owners = ['john.smith', 'jane.doe', 'mike.wilson', 'sarah.jones', 'david.brown'];
  }

  createSourceField(id, name, system, domain, owner) {
    return new Node({
      nodeId: id,
      nodeType: 'source_field',
      name: name,
      description: `Source field: ${name}`,
      system: system,
      technicalMetadata: {
        dataType: this.inferDataType(name),
        format: this.inferFormat(name),
        nullable: Math.random() > 0.8,
        primaryKey: name.toLowerCase().includes('id'),
        indexed: Math.random() > 0.3,
        constraints: this.generateConstraints(name)
      },
      businessMetadata: {
        businessName: name,
        businessDefinition: `Business definition for ${name}`,
        dataOwner: owner,
        domain: domain,
        sensitivity: this.inferSensitivity(name, domain),
        retentionPeriod: this.getRetentionPeriod(domain),
        complianceRules: this.getComplianceRules(name, domain)
      },
      sourceInfo: {
        database: `${system}_prod`,
        schema: domain,
        table: this.generateTableName(domain),
        column: name.toLowerCase()
      },
      qualityMetrics: {
        completeness: 85 + Math.random() * 15,
        uniqueness: 70 + Math.random() * 30,
        validity: 90 + Math.random() * 10,
        accuracy: 88 + Math.random() * 12,
        lastQualityCheck: new Date(),
        qualityRules: ['completeness_check', 'format_validation']
      },
      tags: this.generateTags(name, domain, 'source_field')
    });
  }

  createCalculation(id, name, system, domain, owner, transformationCode) {
    return new Node({
      nodeId: id,
      nodeType: 'calculation',
      name: name,
      description: `Calculated field: ${name}`,
      system: system,
      technicalMetadata: {
        dataType: 'decimal',
        format: 'standard',
        nullable: false,
        primaryKey: false,
        indexed: true,
        constraints: ['not_null']
      },
      businessMetadata: {
        businessName: name,
        businessDefinition: `Business calculation for ${name}`,
        dataOwner: owner,
        domain: domain,
        sensitivity: 'internal',
        retentionPeriod: this.getRetentionPeriod(domain),
        complianceRules: this.getComplianceRules(name, domain)
      },
      sourceInfo: {
        database: `${system}_prod`,
        schema: domain,
        table: `${domain}_metrics`,
        column: name.toLowerCase()
      },
      transformationLogic: {
        code: transformationCode,
        language: 'SQL',
        dependencies: [],
        version: '1.0',
        lastModified: new Date(),
        modifiedBy: owner
      },
      qualityMetrics: {
        completeness: 90 + Math.random() * 10,
        uniqueness: 80 + Math.random() * 20,
        validity: 92 + Math.random() * 8,
        accuracy: 90 + Math.random() * 10,
        lastQualityCheck: new Date(),
        qualityRules: ['calculation_accuracy', 'range_validation']
      },
      tags: this.generateTags(name, domain, 'calculation')
    });
  }

  createReportField(id, name, system, domain, owner) {
    return new Node({
      nodeId: id,
      nodeType: 'report_field',
      name: name,
      description: `Report field: ${name}`,
      system: system,
      technicalMetadata: {
        dataType: this.inferDataType(name),
        format: this.inferFormat(name),
        nullable: false,
        primaryKey: false,
        indexed: false,
        constraints: []
      },
      businessMetadata: {
        businessName: name,
        businessDefinition: `Report field for ${name}`,
        dataOwner: owner,
        domain: domain,
        sensitivity: 'internal',
        retentionPeriod: this.getRetentionPeriod(domain),
        complianceRules: this.getComplianceRules(name, domain)
      },
      sourceInfo: {
        database: `${system}_prod`,
        schema: domain,
        table: `${domain}_reports`,
        column: name.toLowerCase()
      },
      qualityMetrics: {
        completeness: 95 + Math.random() * 5,
        uniqueness: 100,
        validity: 95 + Math.random() * 5,
        accuracy: 92 + Math.random() * 8,
        lastQualityCheck: new Date(),
        qualityRules: ['report_consistency_check']
      },
      tags: this.generateTags(name, domain, 'report_field')
    });
  }

  // Helper methods
  inferDataType(name) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('id')) return 'string';
    if (lowerName.includes('date') || lowerName.includes('time')) return 'date';
    if (lowerName.includes('amount') || lowerName.includes('price') || lowerName.includes('cost')) return 'decimal';
    if (lowerName.includes('count') || lowerName.includes('quantity')) return 'integer';
    if (lowerName.includes('flag') || lowerName.includes('is_')) return 'boolean';
    return 'string';
  }

  inferFormat(name) {
    const dataType = this.inferDataType(name);
    const lowerName = name.toLowerCase();
    
    if (dataType === 'date') return 'YYYY-MM-DD';
    if (dataType === 'decimal' && (lowerName.includes('amount') || lowerName.includes('price'))) return 'currency';
    if (dataType === 'decimal' && lowerName.includes('rate')) return 'percentage';
    if (lowerName.includes('email')) return 'email';
    return 'standard';
  }

  inferSensitivity(name, domain) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('email') || lowerName.includes('phone')) return 'restricted';
    if (domain === 'finance' || lowerName.includes('revenue')) return 'confidential';
    if (domain === 'customer') return 'internal';
    return 'public';
  }

  generateConstraints(name) {
    const constraints = [];
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('id')) constraints.push('not_null', 'unique');
    if (lowerName.includes('amount') || lowerName.includes('price')) constraints.push('positive_value');
    if (lowerName.includes('email')) constraints.push('email_format');
    
    return constraints;
  }

  getRetentionPeriod(domain) {
    const retentionMap = {
      'finance': '10_years',
      'customer': '7_years',
      'product': '5_years',
      'inventory': '3_years',
      'marketing': '5_years',
      'operations': '5_years'
    };
    return retentionMap[domain] || '5_years';
  }

  getComplianceRules(name, domain) {
    const rules = [];
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('email') || lowerName.includes('personal') || domain === 'customer') {
      rules.push('GDPR');
    }
    if (domain === 'finance') {
      rules.push('SOX');
    }
    return rules;
  }

  generateTableName(domain) {
    const tableMap = {
      'customer': 'customers',
      'product': 'products',
      'finance': 'transactions',
      'inventory': 'inventory',
      'marketing': 'campaigns',
      'operations': 'operations'
    };
    return tableMap[domain] || `${domain}_data`;
  }

  generateTags(name, domain, nodeType) {
    const tags = [domain, nodeType];
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('revenue')) tags.push('financial', 'kpi');
    if (lowerName.includes('customer')) tags.push('customer', 'crm');
    if (lowerName.includes('product')) tags.push('product', 'catalog');
    if (lowerName.includes('report')) tags.push('reporting', 'executive');
    
    return tags;
  }

  // Utility methods for random selection
  getRandomDomain() {
    return this.domains[Math.floor(Math.random() * this.domains.length)];
  }

  getRandomSystem() {
    return this.systems[Math.floor(Math.random() * this.systems.length)];
  }

  getRandomOwner() {
    return this.owners[Math.floor(Math.random() * this.owners.length)];
  }
}

module.exports = { NodeFactory };
