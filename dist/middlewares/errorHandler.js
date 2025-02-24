"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
// Custom error interface
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
// Express error-handling middleware
const errorHandler = (error, req, res, next) => {
    console.error(`❌ Error: ${error.message}`);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};
exports.errorHandler = errorHandler;
