import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import { jwtService } from '../../utils/jwt.util';
import { hashPassword } from '../../utils/password.util';
import { User } from '@prisma/client'; // Import User type
import { Request, Response, NextFunction } from 'express';

// Mock Prisma client
jest.mock('../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));



// Mock jwtService
jest.mock('../../utils/jwt.util', () => ({
  jwtService: {
    generateAccessToken: jest.fn(),
    verifyAccessToken: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: any, res: Response, next: NextFunction) => {
    req.user = { userId: 'clsy96f0100001a1d6n8u2g2t' };
    next();
  }),
}));

describe('User Profile API', () => {
  const mockUserId = 'clsy96f0100001a1d6n8u2g2t';
  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    emailVerificationToken: null,
    // Removed passwordResetToken as it might not be directly on the User type or should be mocked differently
    name: 'John Doe',
    consentEssential: true, // Assuming this is part of your extended User type in actual schema
    consentAiTraining: false,
    consentMarketing: false,
  };

  let validToken: string;

  beforeAll(async () => {
    validToken = jwtService.generateAccessToken(mockUserId);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (jwtService.verifyAccessToken as jest.Mock).mockReturnValue({ userId: mockUserId });
  });

  describe('GET /api/v1/profile', () => {
    it('should return 200 and user profile if authenticated', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`]);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phoneNumber: mockUser.phoneNumber,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockUserId } });
    });

    it('should return 401 if not authenticated', async () => {
      const { authenticate } = require('../../middleware/auth.middleware');
      (authenticate as jest.Mock).mockImplementationOnce((req: any, res: Response, next: NextFunction) => {
        next({ statusCode: 401, message: 'Invalid or expired token' });
      });

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Cookie', ['access_token=invalid']);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`]);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/v1/profile', () => {
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1122334455',
    };

    it('should return 200 and updated profile if authenticated and valid data', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .post('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`])
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateData,
      });
    });

    it('should return 401 if not authenticated', async () => {
      const { authenticate } = require('../../middleware/auth.middleware');
      (authenticate as jest.Mock).mockImplementationOnce((req: any, res: Response, next: NextFunction) => {
        next({ statusCode: 401, message: 'Invalid or expired token' });
      });

      const response = await request(app)
        .post('/api/v1/profile')
        .set('Cookie', ['access_token=invalid'])
        .send(updateData);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 400 if validation fails', async () => {
      const invalidData = { ...updateData, firstName: '' }; // firstName cannot be empty
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`])
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Request validation failed. Please check your input.');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.firstName',
            message: 'First name cannot be empty',
          }),
        ])
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`])
        .send(updateData);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should not allow updating email field', async () => {
      const dataWithEmail = { ...updateData, email: 'newemail@example.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, ...updateData });

      const response = await request(app)
        .post('/api/v1/profile')
        .set('Cookie', [`access_token=${validToken}`])
        .send(dataWithEmail);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(mockUser.email); // Email should not change
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ email: expect.anything() }),
        })
      );
    });
  });
});