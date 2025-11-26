// src/tests/integration/auth.routes.test.ts
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import { authService } from '../../src/services/auth.service';
import { validate } from '../../src/middleware/validate.middleware';
import { authLimiter } from '../../src/middleware/rate-limit.middleware';
import { registerSchema } from '../../src/validators/auth.validator';

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
app.use('/api/v1/auth', authRoutes);

describe('Auth Routes - /api/v1/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const mockRegisterData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    };
    const mockRegisteredUser = { id: 1, name: 'Test User', email: 'test@example.com' };

    it('should register a user and return 201', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockRegisteredUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(mockRegisterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRegisteredUser);
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockRegisterData.name,
          email: mockRegisterData.email,
          password: mockRegisterData.password,
        })
      );
    });

    it('should return 400 if validation fails', async () => {
      // Temporarily mock validate middleware to simulate a validation error
      (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
        next({ statusCode: 400, message: 'Validation failed', errors: [{ field: 'email', message: 'Invalid email' }] });
      });

      const invalidData = { ...mockRegisterData, email: 'invalid-email' };
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 429 if rate limit is exceeded', async () => {
      // Temporarily mock authLimiter to simulate rate limit exceeded
      (authLimiter as jest.Mock).mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
        res.status(429).send('Too many requests, please try again later');
      });

      await request(app)
        .post('/api/v1/auth/register')
        .send(mockRegisterData)
        .expect(429);
    });
  });
});
