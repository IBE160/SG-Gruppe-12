// Mock dependencies BEFORE imports

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
    options: {
      host: 'localhost',
      port: 6379,
      password: undefined,
    },
  },
}));

// Mock bull queue
jest.mock('../../jobs', () => ({
  cvParsingQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
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

// Mock audit service
jest.mock('../../services/audit.service', () => ({
  auditService: {
    logSecurityEvent: jest.fn().mockResolvedValue(undefined),
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import { jwtService } from '../../utils/jwt.util';

// Mock jwtService
jest.mock('../../utils/jwt.util', () => ({
  jwtService: {
    generateAccessToken: jest.fn(),
    verifyAccessToken: jest.fn(),
  },
}));

describe('User Profile API', () => {
  const mockUserId = 'clsy96f0100001a1d6n8u2g2t';
  const mockUser = {
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
    passwordResetToken: null,
  };

  let validToken: string;

  beforeAll(async () => {
    validToken = jwtService.generateAccessToken(mockUserId);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (jwtService.verifyAccessToken as jest.Mock).mockReturnValue({ userId: mockUserId });
    // Mock cookie-parser behavior for authenticated requests
    // This is a simplified mock; in a real scenario, you might mock the entire auth middleware
    app.use((req: any, res: any, next: any) => {
      req.cookies = { 'auth-token': validToken };
      next();
    });
  });

  describe('GET /api/v1/user/profile', () => {
    it('should return 200 and user profile if authenticated', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`]);

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
      (jwtService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Cookie', ['auth-token=invalid']);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`]);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PATCH /api/v1/user/profile', () => {
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
        .patch('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`])
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
      (jwtService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .patch('/api/v1/user/profile')
        .set('Cookie', ['auth-token=invalid'])
        .send(updateData);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 400 if validation fails', async () => {
      const invalidData = { ...updateData, firstName: '' }; // firstName cannot be empty
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .patch('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`])
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.firstName',
            message: 'String must contain at least 1 character(s)',
          }),
        ])
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`])
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
        .patch('/api/v1/user/profile')
        .set('Cookie', [`auth-token=${validToken}`])
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