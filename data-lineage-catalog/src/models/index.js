// src/models/index.js  
const { Node, TechnicalMetadata, BusinessMetadata, SourceInfo, QualityMetrics } = require('./Node');
const { Relationship, RelationshipMetadata } = require('./Relationship');

module.exports = {
  Node,
  Relationship, 
  TechnicalMetadata,
  BusinessMetadata,
  SourceInfo,
  QualityMetrics,
  RelationshipMetadata
};
