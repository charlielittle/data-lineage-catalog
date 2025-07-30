const { Relationship } = require('../models');

// src/generators/RelationshipFactory.js
class RelationshipFactory {
  constructor() {
    this.relationshipTypes = ['transforms_to', 'aggregates', 'joins', 'derives_from', 'filters', 'copies'];
  }

  createTransformation(sourceNodeId, targetNodeId, relType = 'transforms_to', impact = 'medium') {
    return new Relationship({
      relationshipId: `rel_${sourceNodeId}_${targetNodeId}`,
      sourceNodeId: sourceNodeId,
      targetNodeId: targetNodeId,
      relationshipType: relType,
      metadata: {
        transformationType: this.getTransformationType(relType),
        confidence: 0.9 + Math.random() * 0.1,
        impact: impact,
        businessRule: this.generateBusinessRule(relType),
        technicalRule: this.generateTechnicalRule(relType),
        dataFlow: 'batch',
        frequency: this.getFrequency(impact),
        latency: this.getLatency(impact),
        volumeImpact: impact
      },
      aggregationDetails: relType === 'aggregates' ? {
        groupByFields: [sourceNodeId],
        aggregateFunction: this.getRandomAggregateFunction(),
        filterCondition: this.generateFilterCondition()
      } : undefined,
      joinDetails: relType === 'joins' ? {
        joinType: this.getRandomJoinType(),
        joinCondition: `${sourceNodeId} = ${targetNodeId}`,
        keyFields: [sourceNodeId, targetNodeId]
      } : undefined,
      validationRules: this.generateValidationRules(relType),
      qualityImpact: {
        propagatesErrors: impact === 'high',
        qualityThreshold: 0.9 - (impact === 'high' ? 0.05 : 0),
        alertOnFailure: impact === 'high'
      },
      createdBy: 'data_engineer',
      updatedBy: 'data_analyst'
    });
  }

  // Helper methods
  getTransformationType(relType) {
    const typeMap = {
      'transforms_to': 'calculation',
      'aggregates': 'aggregation',
      'joins': 'join',
      'derives_from': 'derivation',
      'filters': 'filter',
      'copies': 'direct_copy'
    };
    return typeMap[relType] || 'transformation';
  }

  generateBusinessRule(relType) {
    const ruleMap = {
      'transforms_to': 'Data transformation based on business logic',
      'aggregates': 'Aggregation of detailed records to summary level',
      'joins': 'Data combination from multiple sources',
      'derives_from': 'Derived field calculation from source data',
      'filters': 'Data filtering based on business criteria',
      'copies': 'Direct copy of source data without transformation'
    };
    return ruleMap[relType] || 'Standard data processing rule';
  }

  generateTechnicalRule(relType) {
    const ruleMap = {
      'transforms_to': 'CASE/WHEN logic or mathematical operation',
      'aggregates': 'GROUP BY with aggregate functions',
      'joins': 'INNER/LEFT/RIGHT JOIN operation',
      'derives_from': 'Column expression or function',
      'filters': 'WHERE clause condition',
      'copies': 'SELECT column AS alias'
    };
    return ruleMap[relType] || 'Standard SQL operation';
  }

  getFrequency(impact) {
    const frequencyMap = {
      'high': 'hourly',
      'medium': 'daily',
      'low': 'weekly'
    };
    return frequencyMap[impact] || 'daily';
  }

  getLatency(impact) {
    const latencyMap = {
      'high': '1_hour',
      'medium': '4_hours',
      'low': '24_hours'
    };
    return latencyMap[impact] || '4_hours';
  }

  getRandomAggregateFunction() {
    const functions = ['sum', 'count', 'avg', 'max', 'min'];
    return functions[Math.floor(Math.random() * functions.length)];
  }

  getRandomJoinType() {
    const types = ['inner', 'left', 'right', 'full'];
    return types[Math.floor(Math.random() * types.length)];
  }

  generateFilterCondition() {
    const conditions = [
      'status = "active"',
      'amount > 0',
      'date >= current_date - 30',
      'is_valid = true',
      'category IS NOT NULL'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  generateValidationRules(relType) {
    const baseRules = ['data_type_validation', 'not_null_check'];
    const additionalRules = {
      'transforms_to': ['calculation_logic_check'],
      'aggregates': ['group_by_validation', 'aggregate_function_check'],
      'joins': ['referential_integrity', 'join_key_validation'],
      'derives_from': ['source_availability_check'],
      'filters': ['filter_condition_validation'],
      'copies': ['source_target_compatibility']
    };
    
    return [...baseRules, ...(additionalRules[relType] || [])];
  }
}

module.exports = { RelationshipFactory };
