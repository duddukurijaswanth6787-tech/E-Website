import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../logger';

export const validateZod = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn(`Zod Validation failed: ${JSON.stringify(errors)}`);
        
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
