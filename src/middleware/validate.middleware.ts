// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../utils/errors.util'; // Assuming AppError exists

export class ValidationError extends AppError {
  errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export const validate = (schema: z.ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};