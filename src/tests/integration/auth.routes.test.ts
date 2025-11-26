// src/tests/integration/auth.routes.test.ts
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import { authService } from '../../src/services/auth.service';
import { validate } from '../../src/middleware/validate.middleware';
import { authLimiter } from '../../src/middleware/rate-limit.middleware';
import { registerSchema, loginSchema } from '../../src/validators/auth.validator'; // Import loginSchema
import cookieParser from 'cookie-parser'; // Import cookie-parser

// Mock dependencies
jest.mock('../../src/services/auth.service');
jest.mock('../../src/middleware/validate.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()), // Pass-through for integration
}));
jest.mock('../../src/middleware/rate-limit.middleware', () => ({
  authLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()), // Pass-through for integration
}));

// Setup express app
const app = express();
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use('/api/v1/auth', authRoutes);

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
      (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
        next({ statusCode: 400, message: 'Validation failed' });
      });

      const invalidData = { ...mockLoginData, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
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

