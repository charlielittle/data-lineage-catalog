// src/api/middleware/validation.js
class ValidationMiddleware {
  static validateNodeId(req, res, next) {
    const nodeId = req.params.nodeId;
    if (!nodeId || typeof nodeId !== 'string' || nodeId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid nodeId parameter is required'
      });
    }
    next();
  }

  static validateArrayBody(fieldName) {
    return (req, res, next) => {
      const field = req.body[fieldName];
      if (!Array.isArray(field) || field.length === 0) {
        return res.status(400).json({
          success: false,
          error: `${fieldName} must be a non-empty array`
        });
      }
      next();
    };
  }

  static validateQueryParams(validParams) {
    return (req, res, next) => {
      const invalidParams = Object.keys(req.query).filter(param => !validParams.includes(param));
      if (invalidParams.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid query parameters: ${invalidParams.join(', ')}`,
          validParams
        });
      }
      next();
    };
  }
}
