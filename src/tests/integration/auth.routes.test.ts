// src/tests/integration/auth.routes.test.ts

// Set env vars BEFORE imports
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret_for_testing';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_for_testing';

// Mock dependencies BEFORE imports

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));

// Mock Redis
jest.mock('../../config/redis', () => ({
  redis: {
    call: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    sadd: jest.fn(),
    expire: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  },
}));

// Mock rate-limit-redis
jest.mock('rate-limit-redis', () => {
  return {
    __esModule: true,
    default: class RedisStore {
      constructor() {}
      increment() { return Promise.resolve({ totalHits: 1, resetTime: new Date() }); }
      decrement() { return Promise.resolve(); }
      resetKey() { return Promise.resolve(); }
    },
  };
});

// Mock audit service
jest.mock('../../services/audit.service', () => ({
  auditService: {
    logSecurityEvent: jest.fn().mockResolvedValue(undefined),
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock auth service
jest.mock('../../services/auth.service');

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from '../../routes/auth.routes';
import { authService } from '../../services/auth.service';
import { validate } from '../../middleware/validate.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import { registerSchema, loginSchema } from '../../validators/auth.validator';
import cookieParser from 'cookie-parser';
import { UnauthorizedError } from '../../utils/errors.util';
import { errorMiddleware } from '../../middleware/error.middleware';

// Mock dependencies
jest.mock('../../services/auth.service');
// jest.mock('../../middleware/validate.middleware', () => ({
//   validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()), // Pass-through for integration
// }));
jest.mock('../../middleware/rate-limit.middleware', () => ({
  authLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()), // Pass-through for integration
}));

// Setup express app
const app = express();
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use('/api/v1/auth', authRoutes);
app.use(errorMiddleware); // Add error handling middleware

describe('Auth Routes - /api/v1/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... existing tests for POST /register ...

  describe('POST /login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'StrongPassword123!',
    };
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockAccessToken = 'mockAccessToken';
    const mockRefreshToken = 'mockRefreshToken';

    it('should log in a user and return 200 with tokens in cookies', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(mockLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token');
      expect(response.headers['set-cookie'][1]).toContain('refresh_token');
      expect(authService.login).toHaveBeenCalledWith(mockLoginData);
    });

    it('should return 401 for invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new UnauthorizedError('Invalid credentials'));

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(mockLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      const invalidData = { ...mockLoginData, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Request validation failed');
    });
  });

  describe('POST /logout', () => {
    it('should clear cookies and return 200', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('access_token=;'); // Expect cookie to be cleared
      expect(response.headers['set-cookie'][1]).toContain('refresh_token=;'); // Expect cookie to be cleared
    });
  });
});

