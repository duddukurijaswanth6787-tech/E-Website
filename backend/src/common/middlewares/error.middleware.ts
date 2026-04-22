import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors';
import { logger } from '../logger';
import { env } from '../../config/env';
import mongoose from 'mongoose';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(400).json({ success: false, message: 'Validation failed', errors, error: null });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}`, error: null });
    return;
  }

  // Mongoose duplicate key
  if ((err as NodeJS.ErrnoException).code === '11000') {
    const field = Object.keys((err as unknown as Record<string, unknown>).keyValue as Record<string, unknown>)[0];
    res.status(409).json({ success: false, message: `${field} already exists`, error: null });
    return;
  }

  // Custom validation error
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      error: null,
    });
    return;
  }

  // Custom operational errors
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: env.isProduction ? null : err.code,
    });
    return;
  }

  // Unexpected errors — never expose internals in production
  res.status(500).json({
    success: false,
    message: env.isProduction ? 'An unexpected error occurred' : err.message,
    error: env.isProduction ? null : err.stack,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: null,
  });
};
