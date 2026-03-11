/**
 * Error handling utilities for Canvas Assistant
 */

/**
 * Custom error classes
 */
export class CanvasAssistantError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = "CanvasAssistantError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      error: true,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

export class ValidationError extends CanvasAssistantError {
  constructor(message, details = null) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class ToolExecutionError extends CanvasAssistantError {
  constructor(message, toolName, details = null) {
    super(message, "TOOL_EXECUTION_ERROR", 500, { toolName, ...details });
    this.name = "ToolExecutionError";
  }
}

export class OpenAIError extends CanvasAssistantError {
  constructor(message, details = null) {
    super(message, "OPENAI_ERROR", 500, details);
    this.name = "OpenAIError";
  }
}

export class DatabaseError extends CanvasAssistantError {
  constructor(message, details = null) {
    super(message, "DATABASE_ERROR", 500, details);
    this.name = "DatabaseError";
  }
}

/**
 * Error handler middleware for Express
 */
export function errorHandler(error, req, res, next) {
  console.error("[CanvasAssistant] Error:", {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (error instanceof CanvasAssistantError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Handle OpenAI API errors
  if (error.response) {
    const statusCode = error.response.status || 500;
    const message = error.response.data?.error?.message || error.message || "OpenAI API error";
    return res.status(statusCode).json({
      error: true,
      message,
      code: "OPENAI_API_ERROR",
    });
  }

  // Generic error
  return res.status(500).json({
    error: true,
    message: error.message || "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create a request ID for tracking
 */
export function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log with request context
 */
export function logWithContext(level, message, requestId, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    requestId,
    ...context,
  };

  if (level === "error") {
    console.error("[CanvasAssistant]", JSON.stringify(logEntry));
  } else if (level === "warn") {
    console.warn("[CanvasAssistant]", JSON.stringify(logEntry));
  } else {
    console.log("[CanvasAssistant]", JSON.stringify(logEntry));
  }
}
