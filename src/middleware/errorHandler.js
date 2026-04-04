const ApiError = require("../utils/ApiError");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    const body = {
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
    };
    return res.status(err.statusCode).json(body);
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid identifier or value",
      details: err.message,
    });
  }

  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate key",
      message: "A record with this unique field already exists",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

module.exports = errorHandler;
