// src/models/Relationship.js
class Relationship {
  constructor(data) {
    this.relationshipId = data.relationshipId;
    this.sourceNodeId = data.sourceNodeId;
    this.targetNodeId = data.targetNodeId;
    this.relationshipType = data.relationshipType;
    
    this.metadata = new RelationshipMetadata(data.metadata || {});
    this.aggregationDetails = data.aggregationDetails;
    this.joinDetails = data.joinDetails;
    this.validationRules = data.validationRules || [];
    this.qualityImpact = data.qualityImpact || {};
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.status = data.status || 'active';
    this.effectiveDate = data.effectiveDate || new Date();
  }

  isActive() {
    return this.status === 'active';
  }

  isHighImpact() {
    return this.metadata.impact === 'high';
  }

  toDocument() {
    return {
      relationshipId: this.relationshipId,
      sourceNodeId: this.sourceNodeId,
      targetNodeId: this.targetNodeId,
      relationshipType: this.relationshipType,
      metadata: this.metadata.toObject(),
      aggregationDetails: this.aggregationDetails,
      joinDetails: this.joinDetails,
      validationRules: this.validationRules,
      qualityImpact: this.qualityImpact,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      status: this.status,
      effectiveDate: this.effectiveDate
    };
  }

  static fromDocument(doc) {
    return new Relationship(doc);
  }
}

class RelationshipMetadata {
  constructor(data) {
    this.transformationType = data.transformationType;
    this.confidence = data.confidence || 1.0;
    this.impact = data.impact || 'medium';
    this.businessRule = data.businessRule;
    this.technicalRule = data.technicalRule;
    this.dataFlow = data.dataFlow || 'batch';
    this.frequency = data.frequency;
    this.latency = data.latency;
    this.volumeImpact = data.volumeImpact;
  }

  toObject() {
    return {
      transformationType: this.transformationType,
      confidence: this.confidence,
      impact: this.impact,
      businessRule: this.businessRule,
      technicalRule: this.technicalRule,
      dataFlow: this.dataFlow,
      frequency: this.frequency,
      latency: this.latency,
      volumeImpact: this.volumeImpact
    };
  }
}

module.exports = { Relationship, RelationshipMetadata };

