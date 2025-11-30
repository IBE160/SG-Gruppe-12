// src/tests/error.middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../middleware/error.middleware';
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalServerError,
} from '../utils/errors.util';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('errorMiddleware function', () => {
    it('should handle AppError with correct status code', () => {
      const error = new AppError('Test error', 400);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Test error',
        },
      });
    });

    it('should handle UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Invalid credentials');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid credentials',
        },
      });
    });

    it('should handle ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Access denied',
        },
      });
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('User not found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User not found',
        },
      });
    });

    it('should handle BadRequestError with 400 status', () => {
      const error = new BadRequestError('Invalid input');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid input',
        },
      });
    });

    it('should handle ConflictError with 409 status', () => {
      const error = new ConflictError('Email already exists');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Email already exists',
        },
      });
    });

    it('should handle InternalServerError with 500 status', () => {
      const error = new InternalServerError('Database connection failed');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Database connection failed',
        },
      });
    });

    it('should default to 500 status for generic errors without statusCode', () => {
      const error = new Error('Something went wrong');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Something went wrong',
        },
      });
    });

    it('should use error.status if statusCode is not present', () => {
      const error = { status: 422, message: 'Validation failed' };

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation failed',
        },
      });
    });

    it('should default message to "Internal Server Error" when no message provided', () => {
      const error = {};

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
        },
      });
    });

    it('should log error to console', () => {
      const error = new AppError('Test error', 400);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new AppError('Test error', 400);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String),
          details: error,
        }),
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test error', 400);

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Test error',
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors with null message', () => {
      const error = { statusCode: 400, message: null };

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
        },
      });
    });

    it('should handle errors with undefined message', () => {
      const error = { statusCode: 400, message: undefined };

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal Server Error',
        },
      });
    });
  });
});

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default status code 500', () => {
      const error = new AppError('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Test error');
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Test error', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test error');
      expect(error).toBeInstanceOf(Error);
    });

    it('should have stack trace', () => {
      const error = new AppError('Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with 401 status code', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
    });

    it('should be instance of AppError', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ForbiddenError', () => {
    it('should create error with 403 status code', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Admin access required');
      expect(error.message).toBe('Admin access required');
    });

    it('should be instance of AppError', () => {
      const error = new ForbiddenError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with 404 status code', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });

    it('should be instance of AppError', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('BadRequestError', () => {
    it('should create error with 400 status code', () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
    });

    it('should accept custom message', () => {
      const error = new BadRequestError('Invalid email format');
      expect(error.message).toBe('Invalid email format');
    });

    it('should be instance of AppError', () => {
      const error = new BadRequestError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    it('should create error with 409 status code', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Email already registered');
      expect(error.message).toBe('Email already registered');
    });

    it('should be instance of AppError', () => {
      const error = new ConflictError();
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('InternalServerError', () => {
    it('should create error with 500 status code', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });

    it('should accept custom message', () => {
      const error = new InternalServerError('Database connection lost');
      expect(error.message).toBe('Database connection lost');
    });

    it('should be instance of AppError', () => {
      const error = new InternalServerError();
      expect(error).toBeInstanceOf(AppError);
    });
  });
});
