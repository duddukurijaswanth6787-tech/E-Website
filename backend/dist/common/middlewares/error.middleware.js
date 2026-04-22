"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.globalErrorHandler = void 0;
const errors_1 = require("../errors");
const logger_1 = require("../logger");
const env_1 = require("../../config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const globalErrorHandler = (err, req, res, _next) => {
    logger_1.logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });
    // Mongoose validation error
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        res.status(400).json({ success: false, message: 'Validation failed', errors, error: null });
        return;
    }
    // Mongoose cast error (invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}`, error: null });
        return;
    }
    // Mongoose duplicate key
    if (err.code === '11000') {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({ success: false, message: `${field} already exists`, error: null });
        return;
    }
    // Custom validation error
    if (err instanceof errors_1.ValidationError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            error: null,
        });
        return;
    }
    // Custom operational errors
    if (err instanceof errors_1.AppError && err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: env_1.env.isProduction ? null : err.code,
        });
        return;
    }
    // Unexpected errors — never expose internals in production
    res.status(500).json({
        success: false,
        message: env_1.env.isProduction ? 'An unexpected error occurred' : err.message,
        error: env_1.env.isProduction ? null : err.stack,
    });
};
exports.globalErrorHandler = globalErrorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: null,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map