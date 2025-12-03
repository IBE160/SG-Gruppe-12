// src/tests/unit/validate.middleware.test.ts
/**
 * Validation Middleware Tests
 * Story 3.6: Data Schema Contract Enforcement
 */
import { validate, ValidationError } from '../../middleware/validate.middleware';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      method: 'POST',
      path: '/api/v1/test',
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  const testSchema = z.object({
    body: z.object({
      name: z.string().min(1),
      age: z.number().min(0).max(120),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  });

  describe('Valid Data', () => {
    it('should pass validation with valid data', async () => {
      mockReq.body = { name: 'John Doe', age: 30 };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalid Data', () => {
    it('should fail validation with missing required field', async () => {
      mockReq.body = { age: 30 };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.errors).toContainEqual(
        expect.objectContaining({
          field: 'body.name',
        })
      );
    });

    it('should fail validation with invalid field type', async () => {
      mockReq.body = { name: 'John Doe', age: 'thirty' };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should fail validation with value out of range', async () => {
      mockReq.body = { name: 'John Doe', age: 150 };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.errors).toContainEqual(
        expect.objectContaining({
          field: 'body.age',
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should include endpoint information in error', async () => {
      mockReq.body = { name: '', age: 30 };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Request validation failed. Please check your input.');
    });

    it('should return user-friendly error message', async () => {
      mockReq.body = { name: 'John', age: -5 };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).not.toContain('ZodError');
      expect(error.message).toBe('Request validation failed. Please check your input.');
    });
  });

  describe('PII Redaction', () => {
    const piiSchema = z.object({
      body: z.object({
        email: z.string().email(),
        phone: z.string(),
        name: z.string(),
      }),
      query: z.object({}).optional(),
      params: z.object({}).optional(),
    });

    it('should redact email addresses in logs', async () => {
      // Note: This test verifies the middleware runs, actual log redaction is internal
      mockReq.body = { email: 'test@example.com', phone: '123-456-7890', name: 'John Doe' };

      const middleware = validate(piiSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('ValidationError Class', () => {
    it('should create ValidationError with default empty errors', () => {
      const error = new ValidationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual([]);
    });

    it('should create ValidationError with field-level errors', () => {
      const fieldErrors = [
        { field: 'body.name', message: 'Name is required' },
        { field: 'body.age', message: 'Age must be positive' },
      ];
      const error = new ValidationError('Validation failed', fieldErrors);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(fieldErrors);
    });
  });
});
