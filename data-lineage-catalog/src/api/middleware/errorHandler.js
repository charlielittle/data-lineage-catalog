// src/api/middleware/errorHandler.js
class ErrorHandler {
  static handle(error, req, res, next) {
    console.error('API Error:', error);

    // MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message
      });
    }

    // Custom application errors
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  static notFound(req, res) {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.path} not found`
    });
  }
}
module.exports = { ErrorHandler };
