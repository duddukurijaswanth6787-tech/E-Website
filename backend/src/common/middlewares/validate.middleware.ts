import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors';

export const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: (e as unknown as { path: string }).path || 'unknown',
      message: e.msg,
    }));
    throw new ValidationError(formatted);
  }
  next();
};
