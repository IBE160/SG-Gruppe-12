// src/tests/auth.middleware.test.ts

// Set env vars BEFORE any imports
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret_for_testing';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_for_testing';

import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { jwtService } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/errors.util';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next with UnauthorizedError when no access token is provided', () => {
      mockRequest.cookies = {};

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('No access token provided');
    });

    it('should call next with UnauthorizedError when cookies object is missing', () => {
      mockRequest = {};

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with UnauthorizedError when access token is empty string', () => {
      mockRequest.cookies = { access_token: '' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should set user on request and call next() for valid token', () => {
      const validToken = jwtService.generateAccessToken('user-123');
      mockRequest.cookies = { access_token: validToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect((mockRequest as AuthRequest).user).toBeDefined();
      expect((mockRequest as AuthRequest).user?.userId).toBe('user-123');
    });

    it('should call next with error for invalid token format', () => {
      mockRequest.cookies = { access_token: 'invalid-token-format' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error for tampered token', () => {
      const validToken = jwtService.generateAccessToken('user-123');
      // Tamper with the token
      const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
      mockRequest.cookies = { access_token: tamperedToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error for token signed with wrong secret', () => {
      // Create a token with a different secret
      const jwt = require('jsonwebtoken');
      const wrongSecretToken = jwt.sign(
        { userId: 'user-123' },
        'wrong-secret',
        { expiresIn: '15m' }
      );
      mockRequest.cookies = { access_token: wrongSecretToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next with error for expired token', () => {
      // Create an already-expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'user-123' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '-1s' } // Already expired
      );
      mockRequest.cookies = { access_token: expiredToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject refresh token used as access token', () => {
      const refreshToken = jwtService.generateRefreshToken('user-123');
      mockRequest.cookies = { access_token: refreshToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      // Refresh tokens are signed with a different secret, so verification should fail
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle null cookie value', () => {
      mockRequest.cookies = { access_token: null as unknown as string };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should handle undefined cookie value', () => {
      mockRequest.cookies = { access_token: undefined as unknown as string };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should preserve other request properties after authentication', () => {
      const validToken = jwtService.generateAccessToken('user-123');
      mockRequest = {
        cookies: { access_token: validToken },
        body: { data: 'test' },
        params: { id: '1' },
        query: { search: 'test' },
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body).toEqual({ data: 'test' });
      expect(mockRequest.params).toEqual({ id: '1' });
      expect(mockRequest.query).toEqual({ search: 'test' });
    });

    it('should extract correct userId from token payload', () => {
      const testUserId = 'uuid-1234-5678-abcd';
      const validToken = jwtService.generateAccessToken(testUserId);
      mockRequest.cookies = { access_token: validToken };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect((mockRequest as AuthRequest).user?.userId).toBe(testUserId);
    });
  });
});
