import { Request, Response, NextFunction } from "express";

// Custom error interface
class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Express error-handling middleware
const errorHandler = (error: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ Error: ${error.message}`);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export { ApiError, errorHandler };
