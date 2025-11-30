// src/tests/integration/cv.integration.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { cvController } from '../../controllers/cv.controller';
import { cvService } from '../../services/cv.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { experienceEntrySchema } from '../../validators/cv.validator';

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = { userId: 'mockUserId', role: 'USER' };
    next();
  }),
  AuthRequest: {},
}));

// Mock validation middleware
jest.mock('../../middleware/validate.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
}));

// Mock cvService instead of cvRepository (service has the CRUD methods)
jest.mock('../../services/cv.service');

const app = express();
app.use(express.json());
app.use(authenticate);
app.post('/api/v1/cvs/:cvId/experience', validate(experienceEntrySchema), cvController.addExperience);
app.patch('/api/v1/cvs/:cvId/experience/:experienceIndex', validate(experienceEntrySchema.partial()), cvController.updateExperience);
app.delete('/api/v1/cvs/:cvId/experience/:experienceIndex', cvController.deleteExperience);

describe('CV API - Work Experience Endpoints', () => {
  const mockCvId = '123';
  const mockUserId = 'mockUserId';
  const mockExperience = {
    title: 'Software Engineer',
    company: 'Tech Solutions',
    startDate: '2020-01-01',
    description: 'Developed software solutions.',
  };
  const mockCvData = {
    personal_info: { firstName: 'Test', lastName: 'User' },
    education: [],
    experience: [],
    skills: [],
    languages: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
    (cvService.addWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCvData,
      experience: [mockExperience],
    });
    (cvService.updateWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCvData,
      experience: [{ ...mockExperience, title: 'Senior Software Engineer' }],
    });
    (cvService.deleteWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCvData,
      experience: [],
    });
  });

  describe('POST /api/v1/cvs/:cvId/experience', () => {
    it('should add new work experience', async () => {
      const response = await request(app)
        .post(`/api/v1/cvs/${mockCvId}/experience`)
        .send(mockExperience)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(cvService.addWorkExperience).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            next({ statusCode: 400, message: 'Validation failed' });
        });
        const invalidExperience = { ...mockExperience, title: '' };
        const response = await request(app)
          .post(`/api/v1/cvs/${mockCvId}/experience`)
          .send(invalidExperience)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      (authenticate as jest.Mock).mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
        next({ statusCode: 401, message: 'Unauthorized' });
      });

      await request(app)
        .post(`/api/v1/cvs/${mockCvId}/experience`)
        .send(mockExperience)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/cvs/:cvId/experience/:experienceIndex', () => {
    const updates = { title: 'Senior Software Engineer' };

    it('should update an existing work experience', async () => {
      const response = await request(app)
        .patch(`/api/v1/cvs/${mockCvId}/experience/0`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(cvService.updateWorkExperience).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            next({ statusCode: 400, message: 'Validation failed' });
        });
        const invalidUpdates = { startDate: 'invalid-date' };
        const response = await request(app)
          .patch(`/api/v1/cvs/${mockCvId}/experience/0`)
          .send(invalidUpdates)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('DELETE /api/v1/cvs/:cvId/experience/:experienceIndex', () => {
    it('should delete a work experience', async () => {
      const response = await request(app)
        .delete(`/api/v1/cvs/${mockCvId}/experience/0`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(cvService.deleteWorkExperience).toHaveBeenCalled();
    });
  });
});
