// src/tests/integration/cv.integration.test.ts
import request from 'supertest';
import express from 'express'; // Assuming express app setup
import { cvController } from '../../controllers/cv.controller';
import { cvRepository } from '../../repositories/cv.repository';
import { AuthRequest } from '../../middleware/auth.middleware';
import { authenticate } from '../../middleware/auth.middleware'; // Mock this for integration tests
import { validate } from '../../middleware/validate.middleware'; // Mock this for integration tests
import { experienceEntrySchema } from '../../validators/cv.validator';

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: AuthRequest, res, next) => {
    req.user = { userId: 'mockUserId', email: 'test@example.com' }; // Mock authenticated user
    next();
  }),
  AuthRequest: {}, // Mock the interface if needed
}));

// Mock validation middleware
jest.mock('../../middleware/validate.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    next(); // Simply pass through for now, actual validation should be tested separately
  }),
}));

// Mock cvRepository
jest.mock('../../repositories/cv.repository');

const app = express();
app.use(express.json()); // Enable json body parsing
app.use(authenticate); // Apply mock auth
app.post('/api/v1/cvs/:cvId/experience', validate(experienceEntrySchema), cvController.addExperience);
app.patch('/api/v1/cvs/:cvId/experience/:experienceIndex', validate(experienceEntrySchema.partial()), cvController.updateExperience);
app.delete('/api/v1/cvs/:cvId/experience/:experienceIndex', cvController.deleteExperience);

describe('CV API - Work Experience Endpoints', () => {
  const mockCvId = 'mockCvId123';
  const mockUserId = 'mockUserId';
  const mockExperience = {
    title: 'Software Engineer',
    company: 'Tech Solutions',
    startDate: '2020-01-01',
    description: 'Developed software solutions.',
  };
  const mockCV = {
    id: mockCvId,
    userId: mockUserId,
    personal_info: {},
    education: [],
    experience: [],
    skills: [],
    languages: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);
    (cvRepository.getLatestVersion as jest.Mock).mockResolvedValue({ version_number: 1 });
    (cvRepository.createVersion as jest.Mock).mockResolvedValue({});
    (cvRepository.addWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCV,
      experience: [...mockCV.experience, mockExperience],
    });
    (cvRepository.updateWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCV,
      experience: [mockExperience],
    });
    (cvRepository.deleteWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCV,
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
      expect(cvRepository.addWorkExperience).toHaveBeenCalledWith(mockCvId, mockExperience);
      expect(cvRepository.createVersion).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            next({ statusCode: 400, message: 'Validation failed' }); // Simulate validation error
        });
        const invalidExperience = { ...mockExperience, title: '' }; // Invalid title
        const response = await request(app)
          .post(`/api/v1/cvs/${mockCvId}/experience`)
          .send(invalidExperience)
          .expect(400);
      
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
    });

    it('should return 401 if not authenticated', async () => {
      (authenticate as jest.Mock).mockImplementationOnce((req: AuthRequest, res, next) => {
        next({ statusCode: 401, message: 'Unauthorized' }); // Simulate unauthorized
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
      expect(cvRepository.updateWorkExperience).toHaveBeenCalledWith(mockCvId, 0, updates);
      expect(cvRepository.createVersion).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            next({ statusCode: 400, message: 'Validation failed' }); // Simulate validation error
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
      expect(cvRepository.deleteWorkExperience).toHaveBeenCalledWith(mockCvId, 0);
      expect(cvRepository.createVersion).toHaveBeenCalled();
    });
  });
});
