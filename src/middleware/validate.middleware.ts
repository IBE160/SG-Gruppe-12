// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { AuthRequest } from './auth.middleware';

export class ValidationError extends AppError {
  errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Redacts PII from field values for logging
 * Story 3.6: Data Schema Contract Enforcement - Task 4
 */
function redactPII(value: any): any {
  if (typeof value === 'string') {
    // Redact email addresses
    if (value.includes('@')) {
      return '[REDACTED_EMAIL]';
    }
    // Redact phone numbers (simple pattern)
    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(value)) {
      return '[REDACTED_PHONE]';
    }
    // Redact long text that might contain personal info (>100 chars)
    if (value.length > 100) {
      return '[REDACTED_LONG_TEXT]';
    }
  }
  if (typeof value === 'object' && value !== null) {
    const redacted: any = Array.isArray(value) ? [] : {};
    for (const key in value) {
      // Redact known PII fields
      if (['email', 'phone', 'address', 'name', 'firstName', 'lastName', 'linkedin', 'portfolio'].includes(key)) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPII(value[key]);
      }
    }
    return redacted;
  }
  return value;
}

/**
 * Generic validation middleware using Zod schemas
 * Story 3.6: Data Schema Contract Enforcement - Tasks 3 & 4
 */
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
        // Extract request context for logging
        const authReq = req as AuthRequest;
        const userId = authReq.user?.userId || 'unauthenticated';
        const endpoint = `${req.method} ${req.path}`;

        // Format validation errors for response
        const errors = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Log validation failure with redacted data
        logger.warn('Validation failed', {
          endpoint,
          userId,
          method: req.method,
          path: req.path,
          errors: errors.map(e => ({ field: e.field, message: e.message })),
          invalidData: redactPII({
            body: req.body,
            query: req.query,
            params: req.params,
          }),
        });

        // Return user-friendly error message
        next(new ValidationError('Request validation failed. Please check your input.', errors));
      } else {
        next(error);
      }
    }
  };
};