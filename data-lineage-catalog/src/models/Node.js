// =============================================================================
// 2. MODELS LAYER
// =============================================================================

// src/models/Node.js
class Node {
  constructor(data) {
    this.nodeId = data.nodeId;
    this.nodeType = data.nodeType;
    this.name = data.name;
    this.description = data.description;
    this.system = data.system;
    
    this.technicalMetadata = new TechnicalMetadata(data.technicalMetadata || {});
    this.businessMetadata = new BusinessMetadata(data.businessMetadata || {});
    this.sourceInfo = new SourceInfo(data.sourceInfo || {});
    this.qualityMetrics = new QualityMetrics(data.qualityMetrics || {});
    
    this.transformationLogic = data.transformationLogic;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.version = data.version || 1;
    this.status = data.status || 'active';
    this.tags = data.tags || [];
  }

  isActive() {
    return this.status === 'active';
  }

  getOverallQuality() {
    return this.qualityMetrics.getOverallScore();
  }

  hasTransformation() {
    return ['calculation', 'transformation'].includes(this.nodeType);
  }

  toDocument() {
    return {
      nodeId: this.nodeId,
      nodeType: this.nodeType,
      name: this.name,
      description: this.description,
      system: this.system,
      technicalMetadata: this.technicalMetadata.toObject(),
      businessMetadata: this.businessMetadata.toObject(),
      sourceInfo: this.sourceInfo.toObject(),
      qualityMetrics: this.qualityMetrics.toObject(),
      transformationLogic: this.transformationLogic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      version: this.version,
      status: this.status,
      tags: this.tags
    };
  }

  static fromDocument(doc) {
    return new Node(doc);
  }
}

class TechnicalMetadata {
  constructor(data) {
    this.dataType = data.dataType;
    this.format = data.format;
    this.nullable = data.nullable || false;
    this.primaryKey = data.primaryKey || false;
    this.indexed = data.indexed || false;
    this.constraints = data.constraints || [];
  }

  toObject() {
    return {
      dataType: this.dataType,
      format: this.format,
      nullable: this.nullable,
      primaryKey: this.primaryKey,
      indexed: this.indexed,
      constraints: this.constraints
    };
  }
}

class BusinessMetadata {
  constructor(data) {
    this.businessName = data.businessName;
    this.businessDefinition = data.businessDefinition;
    this.dataOwner = data.dataOwner;
    this.domain = data.domain;
    this.sensitivity = data.sensitivity || 'public';
    this.retentionPeriod = data.retentionPeriod;
    this.complianceRules = data.complianceRules || [];
  }

  isRestricted() {
    return ['confidential', 'restricted'].includes(this.sensitivity);
  }

  toObject() {
    return {
      businessName: this.businessName,
      businessDefinition: this.businessDefinition,
      dataOwner: this.dataOwner,
      domain: this.domain,
      sensitivity: this.sensitivity,
      retentionPeriod: this.retentionPeriod,
      complianceRules: this.complianceRules
    };
  }
}

class SourceInfo {
  constructor(data) {
    this.database = data.database;
    this.schema = data.schema;
    this.table = data.table;
    this.column = data.column;
  }

  getFullPath() {
    return `${this.database}.${this.schema}.${this.table}.${this.column}`;
  }

  toObject() {
    return {
      database: this.database,
      schema: this.schema,
      table: this.table,
      column: this.column
    };
  }
}

class QualityMetrics {
  constructor(data) {
    this.completeness = data.completeness || 0;
    this.uniqueness = data.uniqueness || 0;
    this.validity = data.validity || 0;
    this.accuracy = data.accuracy || 0;
    this.lastQualityCheck = data.lastQualityCheck;
    this.qualityRules = data.qualityRules || [];
  }

  getOverallScore() {
    const metrics = [this.completeness, this.uniqueness, this.validity, this.accuracy];
    const validMetrics = metrics.filter(m => m > 0);
    return validMetrics.length > 0 
      ? Math.round(validMetrics.reduce((sum, m) => sum + m, 0) / validMetrics.length)
      : 0;
  }

  hasQualityIssues(threshold = 95) {
    return this.getOverallScore() < threshold;
  }

  toObject() {
    return {
      completeness: this.completeness,
      uniqueness: this.uniqueness,
      validity: this.validity,
      accuracy: this.accuracy,
      lastQualityCheck: this.lastQualityCheck,
      qualityRules: this.qualityRules
    };
  }
}

module.exports = {
  Node,
  TechnicalMetadata,
  BusinessMetadata,
  SourceInfo,
  QualityMetrics
};
