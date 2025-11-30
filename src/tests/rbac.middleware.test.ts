// src/tests/rbac.middleware.test.ts
import { Request, Response, NextFunction } from 'express';
import {
  requireRole,
  requireAdmin,
  requireUser,
  requireOwnerOrAdmin,
  hasRole,
  isAdmin,
} from '../middleware/rbac.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { ForbiddenError } from '../utils/errors.util';

describe('RBAC Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: undefined,
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('requireRole', () => {
    it('should call next() when user has the required role', () => {
      mockRequest.user = { userId: 'test-user', role: 'ADMIN' };

      const middleware = requireRole('ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() when user has one of the allowed roles', () => {
      mockRequest.user = { userId: 'test-user', role: 'USER' };

      const middleware = requireRole('USER', 'ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next with ForbiddenError when user lacks required role', () => {
      mockRequest.user = { userId: 'test-user', role: 'USER' };

      const middleware = requireRole('ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next with ForbiddenError when no user is authenticated', () => {
      mockRequest.user = undefined;

      const middleware = requireRole('ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should default to USER role when role is not specified in token', () => {
      mockRequest.user = { userId: 'test-user', role: undefined as unknown as 'USER' };

      const middleware = requireRole('USER', 'ADMIN');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin users', () => {
      mockRequest.user = { userId: 'admin-user', role: 'ADMIN' };

      requireAdmin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny regular users', () => {
      mockRequest.user = { userId: 'regular-user', role: 'USER' };

      requireAdmin(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requireUser', () => {
    it('should allow regular users', () => {
      mockRequest.user = { userId: 'regular-user', role: 'USER' };

      requireUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should allow admin users', () => {
      mockRequest.user = { userId: 'admin-user', role: 'ADMIN' };

      requireUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny unauthenticated requests', () => {
      mockRequest.user = undefined;

      requireUser(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('requireOwnerOrAdmin', () => {
    it('should allow admin to access any resource', () => {
      mockRequest.user = { userId: 'admin-user', role: 'ADMIN' };
      mockRequest.params = { userId: 'other-user' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should allow user to access their own resource', () => {
      mockRequest.user = { userId: 'user-123', role: 'USER' };
      mockRequest.params = { userId: 'user-123' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny user access to other users resource', () => {
      mockRequest.user = { userId: 'user-123', role: 'USER' };
      mockRequest.params = { userId: 'user-456' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should allow access when no owner ID is specified', () => {
      mockRequest.user = { userId: 'user-123', role: 'USER' };
      mockRequest.params = {};

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should check body for owner ID when not in params', () => {
      mockRequest.user = { userId: 'user-123', role: 'USER' };
      mockRequest.params = {};
      mockRequest.body = { userId: 'user-123' };

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny unauthenticated requests', () => {
      mockRequest.user = undefined;

      const middleware = requireOwnerOrAdmin('userId');
      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });

  describe('hasRole helper', () => {
    it('should return true when user has the required role', () => {
      expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
    });

    it('should return false when user lacks the required role', () => {
      expect(hasRole('USER', 'ADMIN')).toBe(false);
    });

    it('should return true for USER role check with any authenticated user', () => {
      expect(hasRole('USER', 'USER')).toBe(true);
      expect(hasRole('ADMIN', 'USER')).toBe(true);
    });

    it('should return false when role is undefined', () => {
      expect(hasRole(undefined, 'ADMIN')).toBe(false);
    });
  });

  describe('isAdmin helper', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('ADMIN')).toBe(true);
    });

    it('should return false for user role', () => {
      expect(isAdmin('USER')).toBe(false);
    });

    it('should return false for undefined role', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });
});
