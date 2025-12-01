import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './validate.middleware';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const responseBody: any = {
    success: false,
    message,
  };

  // Include validation errors if present
  if (err instanceof ValidationError && err.errors) {
    responseBody.errors = err.errors;
  }

  // Include stack in development mode
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
}
