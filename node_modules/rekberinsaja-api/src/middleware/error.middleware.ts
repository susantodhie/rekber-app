import type { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  // Multer file size error
  if (err.message?.includes("File too large")) {
    res.status(413).json({
      success: false,
      error: "File too large — max 5MB",
    });
    return;
  }

  // Multer file type error
  if (err.message?.includes("not supported") || err.message?.includes("Only image")) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Generic server error
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
}
