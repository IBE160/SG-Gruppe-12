// src/tests/integration/job-analysis.integration.test.ts
/**
 * Job Analysis Integration Tests
 * Story 3.6: Data Schema Contract Enforcement
 */
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { jobController } from '../../controllers/job.controller';
import { jobAnalysisService } from '../../services/job-analysis.service';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { analyzeJobDescriptionSchema } from '../../validators/job.validator';
import { AppError } from '../../utils/errors.util';
import { JwtPayload } from '../../utils/jwt.util';

interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = { userId: 'mockUserId', role: 'USER' };
    next();
  }),
}));

// Use actual validation middleware
jest.mock('../../middleware/validate.middleware', () => {
  const originalModule = jest.requireActual('../../middleware/validate.middleware');
  return {
    validate: originalModule.validate,
    ValidationError: originalModule.ValidationError,
  };
});

// Mock jobAnalysisService
jest.mock('../../services/job-analysis.service');

// Mock rate limiter
jest.mock('../../middleware/rate-limit.middleware', () => ({
  aiLimiter: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}));

const app = express();
app.use(express.json());
app.use(authenticate);

// Setup routes
const { aiLimiter } = require('../../middleware/rate-limit.middleware');
app.post('/api/v1/jobs/analyze', aiLimiter, validate(analyzeJobDescriptionSchema), jobController.analyzeJob);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const { ValidationError } = require('../../middleware/validate.middleware');
  if (err instanceof ValidationError) {
    const validationError = err as any; // Type assertion for ValidationError
    return res.status(400).json({
      success: false,
      message: validationError.message,
      errors: validationError.errors || [],
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: 'An unexpected error occurred' });
});

describe('POST /api/v1/jobs/analyze - Job Analysis Endpoint', () => {
  const mockUserId = 'mockUserId';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Requests', () => {
    it('should accept valid job description analysis request', async () => {
      const mockResult = {
        matchScore: 78,
        presentKeywords: ['React', 'Node.js'],
        missingKeywords: ['TypeScript'],
        strengthsSummary: 'Good match',
        weaknessesSummary: 'Missing TypeScript',
        rawKeywords: ['React', 'Node.js', 'TypeScript'],
        jobRequirements: {
          keywords: ['React', 'Node.js'],
          skills: ['JavaScript'],
          qualifications: ['Bachelor\'s degree'],
          responsibilities: ['Develop features'],
        },
        submittedAt: '2025-12-03T10:30:00.000Z',
        atsScore: 82,
        atsSuggestions: ['Add TypeScript'],
        atsQualitativeRating: 'Good',
        atsBreakdown: {
          keywordDensityScore: 80,
          formattingScore: 100,
          sectionCompletenessScore: 100,
          quantifiableAchievementsScore: 50,
        },
      };

      (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'We are seeking a Senior Full-Stack Developer with 5+ years of experience in React and Node.js.',
          cvId: '42',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('matchScore');
      expect(response.body.data).toHaveProperty('atsScore');
      expect(response.body.data).toHaveProperty('jobRequirements');
    });

    it('should accept cvId as number', async () => {
      const mockResult = {
        matchScore: 75,
        presentKeywords: [],
        missingKeywords: [],
        strengthsSummary: 'Good',
        weaknessesSummary: 'None',
        rawKeywords: [],
        jobRequirements: {
          keywords: [],
          skills: [],
          qualifications: [],
          responsibilities: [],
        },
        submittedAt: '2025-12-03T10:30:00.000Z',
        atsScore: 80,
        atsSuggestions: [],
        atsQualitativeRating: 'Good',
      };

      (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue(mockResult);

      await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'Looking for a software developer with JavaScript experience.',
          cvId: 123,
        })
        .expect(200);
    });
  });

  describe('Validation Failures', () => {
    it('should return 400 if jobDescription is too short', async () => {
      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'short',
          cvId: '42',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.jobDescription',
            message: 'Job description must be at least 10 characters long.',
          }),
        ])
      );
    });

    it('should return 400 if jobDescription exceeds max length', async () => {
      const longDescription = 'a'.repeat(10001);

      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: longDescription,
          cvId: '42',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.jobDescription',
            message: 'Job description cannot exceed 10000 characters.',
          }),
        ])
      );
    });

    it('should return 400 if jobDescription is missing', async () => {
      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          cvId: '42',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.jobDescription',
          }),
        ])
      );
    });

    it('should return 400 if cvId is missing', async () => {
      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'This is a valid job description with sufficient length.',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.cvId',
          }),
        ])
      );
    });

    it('should return 400 if cvId is not a valid number', async () => {
      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'This is a valid job description with sufficient length.',
          cvId: 'not-a-number',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'body.cvId',
            message: 'CV ID must be a valid number',
          }),
        ])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      (jobAnalysisService.analyzeJobDescription as jest.Mock).mockRejectedValue(
        new AppError('CV not found', 404)
      );

      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'This is a valid job description with sufficient length.',
          cvId: '999',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('CV not found');
    });
  });

  describe('Response Validation', () => {
    it('should return data matching JobAnalysisResultSchema', async () => {
      const mockResult = {
        matchScore: 85,
        presentKeywords: ['JavaScript', 'React', 'TypeScript'],
        missingKeywords: ['GraphQL'],
        strengthsSummary: 'Strong frontend skills',
        weaknessesSummary: 'Missing backend experience',
        rawKeywords: ['JavaScript', 'React', 'TypeScript', 'GraphQL'],
        jobRequirements: {
          keywords: ['JavaScript', 'React', 'TypeScript', 'GraphQL'],
          skills: ['React', 'TypeScript'],
          qualifications: ['3+ years experience'],
          responsibilities: ['Develop React applications', 'Write clean code'],
        },
        submittedAt: '2025-12-03T11:00:00.000Z',
        atsScore: 88,
        atsSuggestions: ['Add GraphQL to your skills', 'Include quantifiable achievements'],
        atsQualitativeRating: 'Excellent',
        atsBreakdown: {
          keywordDensityScore: 90,
          formattingScore: 95,
          sectionCompletenessScore: 100,
          quantifiableAchievementsScore: 70,
        },
      };

      (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/jobs/analyze')
        .send({
          jobDescription: 'Seeking a React developer with TypeScript experience and 3+ years in frontend development.',
          cvId: '42',
        })
        .expect(200);

      expect(response.body.data).toMatchObject({
        matchScore: expect.any(Number),
        presentKeywords: expect.any(Array),
        missingKeywords: expect.any(Array),
        strengthsSummary: expect.any(String),
        weaknessesSummary: expect.any(String),
        rawKeywords: expect.any(Array),
        jobRequirements: expect.objectContaining({
          keywords: expect.any(Array),
          skills: expect.any(Array),
          qualifications: expect.any(Array),
          responsibilities: expect.any(Array),
        }),
        submittedAt: expect.any(String),
        atsScore: expect.any(Number),
        atsSuggestions: expect.any(Array),
        atsQualitativeRating: expect.stringMatching(/^(Excellent|Good|Fair|Poor)$/),
      });
    });
  });
});
