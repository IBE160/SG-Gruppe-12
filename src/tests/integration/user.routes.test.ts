// src/tests/integration/user.routes.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import userRoutes from '../../routes/user.routes';
import { userService } from '../../services/user.service';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { profileSchema } from '../../validators/user.validator';
import { errorMiddleware } from '../../middleware/error.middleware';
import { NotFoundError } from '../../utils/errors.util';
import cookieParser from 'cookie-parser';

// Mock dependencies
jest.mock('../../services/user.service');
jest.mock('../../middleware/validate.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: Request, res: Response, next: NextFunction) => {
    // Default: mock authenticated user
    req.user = { id: 'uuid-123-456', email: 'test@example.com' };
    next();
  }),
}));

// Setup express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/profile', userRoutes);
app.use(errorMiddleware);

describe('User Routes - /api/v1/profile', () => {
  const mockUserId = 'uuid-123-456';
  const mockProfile = {
    id: mockUserId,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset authenticate mock to default behavior
    (authenticate as jest.Mock).mockImplementation(
      (req: Request, res: Response, next: NextFunction) => {
        req.user = { id: mockUserId, email: 'test@example.com' };
        next();
      }
    );
  });

  describe('GET /', () => {
    it('should retrieve user profile and return 200', async () => {
      (userService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(200);

      expect(response.body.profile).toEqual(mockProfile);
      expect(userService.getProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('should retrieve profile with null optional fields', async () => {
      const profileWithNulls = {
        ...mockProfile,
        firstName: null,
        lastName: null,
        phoneNumber: null,
      };
      (userService.getProfile as jest.Mock).mockResolvedValue(profileWithNulls);

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(200);

      expect(response.body.profile).toEqual(profileWithNulls);
      expect(userService.getProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('should return 401 when user is not authenticated', async () => {
      (authenticate as jest.Mock).mockImplementationOnce(
        (req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      );

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(userService.getProfile).not.toHaveBeenCalled();
    });

    it('should return 404 when user profile does not exist', async () => {
      (userService.getProfile as jest.Mock).mockRejectedValue(
        new NotFoundError('User not found')
      );

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User not found');
      expect(userService.getProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('should return 500 on unexpected service errors', async () => {
      (userService.getProfile as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(userService.getProfile).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('POST /', () => {
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+9876543210',
    };

    it('should update user profile and return 200', async () => {
      const updatedProfile = {
        ...mockProfile,
        ...updateData,
      };
      (userService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .post('/api/v1/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.profile).toEqual(updatedProfile);
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('should update profile with partial data (only firstName)', async () => {
      const partialUpdate = { firstName: 'Jane' };
      const updatedProfile = { ...mockProfile, firstName: 'Jane' };
      (userService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .post('/api/v1/profile')
        .send(partialUpdate)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.profile.firstName).toBe('Jane');
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, partialUpdate);
    });

    it('should update profile with partial data (only phoneNumber)', async () => {
      const partialUpdate = { phoneNumber: '+9999999999' };
      const updatedProfile = { ...mockProfile, phoneNumber: '+9999999999' };
      (userService.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .post('/api/v1/profile')
        .send(partialUpdate)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.profile.phoneNumber).toBe('+9999999999');
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, partialUpdate);
    });

    it('should return 401 when user is not authenticated', async () => {
      (authenticate as jest.Mock).mockImplementationOnce(
        (req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      );

      const response = await request(app)
        .post('/api/v1/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails (invalid phone number)', async () => {
      (validate as jest.Mock).mockImplementationOnce(
        () => (req: Request, res: Response, next: NextFunction) => {
          res.status(400).json({
            success: false,
            error: { message: 'Validation failed', errors: [{ field: 'phoneNumber', message: 'Invalid phone number format' }] },
          });
        }
      );

      const invalidData = { ...updateData, phoneNumber: 'invalid-phone' };
      const response = await request(app)
        .post('/api/v1/profile')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation failed');
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails (empty required fields)', async () => {
      (validate as jest.Mock).mockImplementationOnce(
        () => (req: Request, res: Response, next: NextFunction) => {
          res.status(400).json({
            success: false,
            error: {
              message: 'Validation failed',
              errors: [
                { field: 'firstName', message: 'First name cannot be empty' },
                { field: 'lastName', message: 'Last name cannot be empty' }
              ]
            },
          });
        }
      );

      const invalidData = { firstName: '', lastName: '' };
      const response = await request(app)
        .post('/api/v1/profile')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.errors).toBeDefined();
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });

    it('should return 404 when user does not exist', async () => {
      (userService.updateProfile as jest.Mock).mockRejectedValue(
        new NotFoundError('User not found')
      );

      const response = await request(app)
        .post('/api/v1/profile')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User not found');
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('should return 500 on unexpected service errors', async () => {
      (userService.updateProfile as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/api/v1/profile')
        .send(updateData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('should handle empty update data (no changes)', async () => {
      const emptyUpdate = {};
      (userService.updateProfile as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/api/v1/profile')
        .send(emptyUpdate)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, emptyUpdate);
    });
  });

  describe('Authentication Enforcement', () => {
    it('should require authentication for GET /', async () => {
      (authenticate as jest.Mock).mockImplementationOnce(
        (req: Request, res: Response, next: NextFunction) => {
          // Simulate missing user from auth middleware
          req.user = undefined;
          next();
        }
      );

      const response = await request(app)
        .get('/api/v1/profile')
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(userService.getProfile).not.toHaveBeenCalled();
    });

    it('should require authentication for POST /', async () => {
      (authenticate as jest.Mock).mockImplementationOnce(
        (req: Request, res: Response, next: NextFunction) => {
          // Simulate missing user from auth middleware
          req.user = undefined;
          next();
        }
      );

      const response = await request(app)
        .post('/api/v1/profile')
        .send({ firstName: 'Jane' })
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });

    it('should not allow access without valid JWT cookie', async () => {
      (authenticate as jest.Mock).mockImplementationOnce(
        (req: Request, res: Response, next: NextFunction) => {
          res.status(401).json({ success: false, message: 'No token provided' });
        }
      );

      const response = await request(app)
        .get('/api/v1/profile')
        // No cookies sent
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(userService.getProfile).not.toHaveBeenCalled();
    });
  });
});
