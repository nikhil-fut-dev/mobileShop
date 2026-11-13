import { logger } from "../config/logger.js";

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Internal server error";
  let errors = error.errors || [];

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";
    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  if (message === "Origin not allowed by CORS") {
    statusCode = 403;
    message = "Origin not allowed";
  }

  if (statusCode >= 500) {
    logger.error({ err: error }, "Internal server error");
    message = "Internal server error";
  } else {
    logger.warn(
      { statusCode, message, path: req.originalUrl },
      "Request error",
    );
  }

  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
}
