// src/tests/integration/cv.integration.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express'; // Import NextFunction here
import { cvController } from '../../controllers/cv.controller';
import { cvService } from '../../services/cv.service';
import { authenticate } from '../../middleware/auth.middleware'; // Mock this for integration tests
import { validate } from '../../middleware/validate.middleware'; // Mock this for integration tests
import { experienceEntrySchema } from '../../validators/cv.validator';
import { AppError } from '../../utils/errors.util'; // Import AppError
import { JwtPayload } from '../../utils/jwt.util'; // Import JwtPayload

// Define a local AuthRequest interface for testing purposes to extend Request
interface AuthRequest extends Request {
  user?: JwtPayload;
}


// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = { userId: 'mockUserId' }; // Mock authenticated user
    next();
  }),
}));

// Mock validation middleware
jest.mock('../../middleware/validate.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    next(); // Simply pass through for now, actual validation should be tested separately
  }),
}));

// Mock cvService
jest.mock('../../services/cv.service');

const app = express();
app.use(express.json()); // Enable json body parsing
app.use(authenticate); // Apply mock auth
app.post('/api/v1/cvs/:cvId/experience', validate(experienceEntrySchema), cvController.addExperience);
app.patch('/api/v1/cvs/:cvId/experience/:experienceIndex', validate(experienceEntrySchema.partial()), cvController.updateExperience);
app.delete('/api/v1/cvs/:cvId/experience/:experienceIndex', cvController.deleteExperience);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { // Error handling middleware for integration tests
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
});

describe('CV API - Work Experience Endpoints', () => {
  const mockCvId = 'mockCvId123';
  const mockUserId = 'mockUserId';
  const mockExperience = {
    title: 'Software Engineer',
    company: 'Tech Solutions',
    start_date: '2020-01-01', // Added missing field
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
    (cvService.getCVById as jest.Mock).mockResolvedValue(mockCV);
    (cvService.addWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCV,
      experience: [...mockCV.experience, mockExperience],
    });
    (cvService.updateWorkExperience as jest.Mock).mockResolvedValue({
      ...mockCV,
      experience: [mockExperience],
    });
    (cvService.deleteWorkExperience as jest.Mock).mockResolvedValue({
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
      expect(cvService.addWorkExperience).toHaveBeenCalledWith(mockUserId, parseInt(mockCvId, 10), mockExperience);
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            res.status(400).json({ success: false, message: 'Validation failed', errors: [{field: 'title', message: 'Title is required'}] });
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
      (authenticate as jest.Mock).mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
        next(new AppError('Unauthorized', 401)); // Simulate unauthorized using AppError
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
      expect(cvService.updateWorkExperience).toHaveBeenCalledWith(mockUserId, parseInt(mockCvId, 10), 0, updates);
    });

    it('should return 400 if validation fails', async () => {
        (validate as jest.Mock).mockImplementationOnce(() => (req: Request, res: Response, next: NextFunction) => {
            res.status(400).json({ success: false, message: 'Validation failed', errors: [{field: 'startDate', message: 'Invalid Date'}] });
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
      expect(cvService.deleteWorkExperience).toHaveBeenCalledWith(mockUserId, parseInt(mockCvId, 10), 0);
    });
  });
});

