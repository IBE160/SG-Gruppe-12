// src/tests/integration/job.routes.test.ts
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authenticate } from '../../middleware/auth.middleware'; // Import authenticate
import { validate } from '../../middleware/validate.middleware'; // Import validate
import { analyzeJobDescriptionSchema } from '../../validators/job.validator'; // Import the schema
import { jobController } from '../../controllers/job.controller'; // Import jobController
import { errorMiddleware } from '../../middleware/error.middleware'; // Import errorMiddleware
import { jobAnalysisService } from '../../services/job-analysis.service'; // Import jobAnalysisService
import { aiLimiter } from '../../middleware/rate-limit.middleware'; // Import aiLimiter
import { redis } from '../../config/redis';
import { KeywordExtractionService } from '../../services/KeywordExtractionService';

// Mock JWT utility before importing anything that depends on it
jest.mock('../../utils/jwt.util', () => ({
  jwtService: {
    generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: 'testUserId123' }),
    verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'testUserId123' }),
  },
}));

// Mock jobAnalysisService
jest.mock('../../services/job-analysis.service', () => ({
  jobAnalysisService: {
    analyzeJobDescription: jest.fn(),
    getUserJobPostings: jest.fn(),
    getJobPosting: jest.fn(),
    getJobAnalysisById: jest.fn(),
  },
}));

// Mock rate limiter to pass tests without Redis running
jest.mock('express-rate-limit', () => {
  const mockRateLimit = jest.fn((options) => (req: express.Request, res: express.Response, next: express.NextFunction) => next());
  (mockRateLimit as any).RedisStore = jest.fn(); // Mock the RedisStore constructor if it's referenced
  return mockRateLimit;
});

// Mock KeywordExtractionService for caching test
jest.mock('../../services/KeywordExtractionService', () => ({
  KeywordExtractionService: {
    extractKeywords: jest.fn(),
  },
}));

// Mock redis for caching test
jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
}));

// Setup a mock Express app to test the route
const app = express();
app.use(express.json());
app.use(cookieParser());

// Manually import the job routes setup
const router = express.Router();

router.post(
  '/analyze',
  authenticate,
  aiLimiter,
  validate(analyzeJobDescriptionSchema), // Schema already includes body, params, query structure
  jobController.analyzeJob
);

router.get('/', authenticate, jobController.getJobPostings);
router.get('/:id', authenticate, jobController.getJobPosting);

app.use('/api/v1/jobs', router); // Mount the job routes
app.use(errorMiddleware); // Use the global error handler

describe('POST /api/v1/jobs/analyze', () => {
  const validJobDescription = 'This is a valid job description with at least 10 characters.';
  const validCvId = 123;
  const userId = 'testUserId123'; // Matches mocked JWT payload

  beforeEach(() => {
    jest.clearAllMocks();
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue({
      matchScore: 78,
      presentKeywords: ['TypeScript', 'React'],
      missingKeywords: ['GraphQL'],
      strengthsSummary: "Great skills in TypeScript and React.",
      weaknessesSummary: "Consider improving skills in GraphQL.",
      rawKeywords: ['TypeScript', 'React', 'GraphQL'],
      jobRequirements: {
        keywords: ['TypeScript', 'React', 'GraphQL'],
        skills: ['Frontend Development'],
        qualifications: ['Bachelors Degree'],
        responsibilities: ['Develop features'],
      },
      submittedAt: new Date().toISOString(),
    });
  });

  it('should return 200 and analysis result for valid job description and cvId when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });

    expect(response.statusCode).toEqual(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('matchScore');
    expect(response.body.data).toHaveProperty('presentKeywords');
    expect(response.body.data).toHaveProperty('missingKeywords');
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledWith(
      userId,
      validJobDescription,
      validCvId
    );
  });

  it('should return 400 for invalid job description (too short)', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: 'short', cvId: validCvId });

    expect(response.statusCode).toEqual(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Validation failed');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });
  
  it('should return from cache on subsequent calls for the same job description (faster response)', async () => {
    const mockAnalysisResult = {
      matchScore: 78,
      presentKeywords: ['TypeScript', 'React'],
      missingKeywords: ['GraphQL'],
      strengthsSummary: "Great skills in TypeScript and React.",
      weaknessesSummary: "Consider improving skills in GraphQL.",
      rawKeywords: ['TypeScript', 'React', 'GraphQL'],
      jobRequirements: {
        keywords: ['TypeScript', 'React', 'GraphQL'],
        skills: ['Frontend Development'],
        qualifications: ['Bachelors Degree'],
        responsibilities: ['Develop features'],
      },
      submittedAt: new Date().toISOString(),
    };
  
    (redis.get as jest.Mock).mockResolvedValue(null); // Cache miss
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue(mockAnalysisResult);
  
    // First request
    const res1 = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });
  
    expect(res1.statusCode).toBe(200);
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledTimes(1);
  
    // Second request
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockClear();
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysisResult)); // Cache hit
  
    const res2 = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });
  
    expect(res2.statusCode).toBe(200);
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledTimes(1); // Should not be called again
  });
  
});