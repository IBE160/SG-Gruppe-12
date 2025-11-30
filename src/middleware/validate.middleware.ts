// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type ZodSchema = z.ZodType<unknown>;
type ZodIssue = z.ZodIssue;
import { AppError } from '../utils/errors.util';

export class ValidationError extends AppError {
  errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};