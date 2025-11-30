// src/tests/integration/gdpr.routes.test.ts
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

// Mock JWT utility before importing anything that depends on it
jest.mock('../../utils/jwt.util', () => ({
  jwtService: {
    generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
    verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
  },
}));

// Mock gdprService
jest.mock('../../services/gdpr.service', () => ({
  gdprService: {
    exportUserData: jest.fn(),
    getDataSummary: jest.fn(),
    deleteUserAccount: jest.fn(),
    getConsents: jest.fn(),
    updateConsents: jest.fn(),
  },
}));

// Mock rate limiter
jest.mock('../../middleware/rate-limit.middleware', () => ({
  authLimiter: (req: any, res: any, next: any) => next(),
  aiLimiter: (req: any, res: any, next: any) => next(),
}));

// Now import after mocks are set up
import { gdprController } from '../../controllers/gdpr.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { deleteAccountSchema, updateConsentsSchema } from '../../validators/gdpr.validator';
import { errorMiddleware } from '../../middleware/error.middleware';
import { gdprService } from '../../services/gdpr.service';

// Setup a mock Express app to test the routes
const app = express();
app.use(express.json());
app.use(cookieParser());

// Manually set up the GDPR routes
const router = express.Router();

router.get('/export', authenticate, gdprController.exportData);
router.get('/data-summary', authenticate, gdprController.getDataSummary);
router.delete(
  '/delete-account',
  authenticate,
  validate(deleteAccountSchema),
  gdprController.deleteAccount
);
router.get('/consents', authenticate, gdprController.getConsents);
router.patch(
  '/consents',
  authenticate,
  validate(updateConsentsSchema),
  gdprController.updateConsents
);

app.use('/api/v1/gdpr', router);
app.use(errorMiddleware);

describe('GDPR Routes', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/gdpr/export', () => {
    const mockExportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: mockUserId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: null,
        emailVerified: true,
        createdAt: new Date(),
        consents: {
          essential: true,
          aiTraining: false,
          marketing: false,
        },
      },
      cvs: [],
      cvComponents: [],
      jobPostings: [],
      applications: [],
    };

    it('should export all user data successfully', async () => {
      (gdprService.exportUserData as jest.Mock).mockResolvedValue(mockExportData);

      const response = await request(app)
        .get('/api/v1/gdpr/export')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Data export successful');
      expect(response.body.data.user.email).toBe(mockExportData.user.email);
      expect(response.body.data.user.firstName).toBe(mockExportData.user.firstName);
      expect(gdprService.exportUserData).toHaveBeenCalledWith(mockUserId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/gdpr/export');

      expect(response.status).toBe(401);
      expect(gdprService.exportUserData).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/gdpr/data-summary', () => {
    const mockSummary = {
      userId: mockUserId,
      email: 'test@example.com',
      name: 'John Doe',
      memberSince: new Date(),
      dataCounts: {
        cvs: 2,
        cvComponents: 10,
        jobPostings: 5,
        applications: 3,
      },
    };

    it('should return data summary successfully', async () => {
      (gdprService.getDataSummary as jest.Mock).mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/api/v1/gdpr/data-summary')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Data summary retrieved');
      expect(response.body.data.userId).toBe(mockSummary.userId);
      expect(response.body.data.email).toBe(mockSummary.email);
      expect(response.body.data.dataCounts).toEqual(mockSummary.dataCounts);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/gdpr/data-summary');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/gdpr/delete-account', () => {
    it('should delete account with confirmation', async () => {
      (gdprService.deleteUserAccount as jest.Mock).mockResolvedValue({
        deleted: true,
        deletedAt: new Date().toISOString(),
      });

      const response = await request(app)
        .delete('/api/v1/gdpr/delete-account')
        .set('Cookie', ['access_token=mock-token'])
        .send({ confirmDelete: true });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Account and all associated data permanently deleted');
      expect(response.body.data.deleted).toBe(true);
      expect(gdprService.deleteUserAccount).toHaveBeenCalledWith(mockUserId);
    });

    it('should return 400 without confirmation', async () => {
      const response = await request(app)
        .delete('/api/v1/gdpr/delete-account')
        .set('Cookie', ['access_token=mock-token'])
        .send({ confirmDelete: false });

      expect(response.status).toBe(400);
      expect(gdprService.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('should return 400 with missing confirmDelete', async () => {
      const response = await request(app)
        .delete('/api/v1/gdpr/delete-account')
        .set('Cookie', ['access_token=mock-token'])
        .send({});

      expect(response.status).toBe(400);
      expect(gdprService.deleteUserAccount).not.toHaveBeenCalled();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/gdpr/delete-account')
        .send({ confirmDelete: true });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/gdpr/consents', () => {
    const mockConsents = {
      essential: true,
      aiTraining: false,
      marketing: true,
    };

    it('should return consent preferences', async () => {
      (gdprService.getConsents as jest.Mock).mockResolvedValue(mockConsents);

      const response = await request(app)
        .get('/api/v1/gdpr/consents')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Consent preferences retrieved');
      expect(response.body.data).toEqual(mockConsents);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/gdpr/consents');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/gdpr/consents', () => {
    it('should update AI training consent', async () => {
      const updatedConsents = {
        essential: true,
        aiTraining: true,
        marketing: false,
      };

      (gdprService.updateConsents as jest.Mock).mockResolvedValue(updatedConsents);

      const response = await request(app)
        .patch('/api/v1/gdpr/consents')
        .set('Cookie', ['access_token=mock-token'])
        .send({ aiTraining: true });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Consent preferences updated');
      expect(response.body.data).toEqual(updatedConsents);
      expect(gdprService.updateConsents).toHaveBeenCalledWith(mockUserId, {
        aiTraining: true,
        marketing: undefined,
      });
    });

    it('should update marketing consent', async () => {
      const updatedConsents = {
        essential: true,
        aiTraining: false,
        marketing: true,
      };

      (gdprService.updateConsents as jest.Mock).mockResolvedValue(updatedConsents);

      const response = await request(app)
        .patch('/api/v1/gdpr/consents')
        .set('Cookie', ['access_token=mock-token'])
        .send({ marketing: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedConsents);
    });

    it('should update multiple consents', async () => {
      const updatedConsents = {
        essential: true,
        aiTraining: true,
        marketing: true,
      };

      (gdprService.updateConsents as jest.Mock).mockResolvedValue(updatedConsents);

      const response = await request(app)
        .patch('/api/v1/gdpr/consents')
        .set('Cookie', ['access_token=mock-token'])
        .send({ aiTraining: true, marketing: true });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedConsents);
    });

    it('should return 400 with empty body', async () => {
      const response = await request(app)
        .patch('/api/v1/gdpr/consents')
        .set('Cookie', ['access_token=mock-token'])
        .send({});

      expect(response.status).toBe(400);
      expect(gdprService.updateConsents).not.toHaveBeenCalled();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/gdpr/consents')
        .send({ aiTraining: true });

      expect(response.status).toBe(401);
    });
  });
});
