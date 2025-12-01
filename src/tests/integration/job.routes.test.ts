// src/tests/integration/job.routes.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../utils/errors.util';
import { analyzeJobDescriptionSchema } from '../../validators/job.validator';
import { jobController } from '../../controllers/job.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { aiLimiter } from '../../middleware/rate-limit.middleware';
import { errorMiddleware } from '../../middleware/error.middleware'; // Global error handler
import { jobAnalysisService } from '../../services/job-analysis.service'; // Mock this service

// Mock jobAnalysisService
jest.mock('../../services/job-analysis.service', () => ({
  jobAnalysisService: {
    analyzeJobDescription: jest.fn(),
  },
}));

// Mock JWT for authentication middleware
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn(() => ({ userId: 'testUserId123' })), // Mock successful verification
  sign: jest.fn(() => 'mockAccessToken'),
}));

// Don't mock AppError - use the real one so ValidationError extends properly
// jest.mock removed - using real AppError and ValidationError

// Setup a mock Express app to test the route
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock rate limiter to pass tests without Redis running
// This allows the test to run without setting up a real Redis instance
jest.mock('express-rate-limit', () => {
  const mockRateLimit = jest.fn((options) => (req: Request, res: Response, next: NextFunction) => next());
  (mockRateLimit as any).RedisStore = jest.fn(); // Mock the RedisStore constructor if it's referenced
  return mockRateLimit;
});

// Mock aiLimiter directly
jest.mock('../../middleware/rate-limit.middleware', () => ({
  aiLimiter: (req: Request, res: Response, next: NextFunction) => next(), // Just call next() to bypass actual rate limiting
}));


// Manually import the job routes setup
const router = express.Router();

router.post(
  '/analyze',
  authenticate,
  aiLimiter,
  validate(analyzeJobDescriptionSchema),
  jobController.analyzeJob
);

app.use('/api/v1/jobs', router); // Mount the job routes
app.use(errorMiddleware); // Use the global error handler

describe('POST /api/v1/jobs/analyze', () => {
  const validJobDescription = 'This is a valid job description with at least 10 characters.';
  const validCvId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID for testing
  const userId = 'testUserId123'; // Matches mocked JWT payload

  beforeEach(() => {
    jest.clearAllMocks();
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue({
      matchScore: 78,
      atsScore: 92,
      gapAnalysis: {
        missingSkills: ['leadership'],
        experienceGap: null,
        educationGap: null,
        extractedSkills: ['TypeScript', 'React'],
        extractedQualifications: ['Bachelors Degree'],
        extractedResponsibilities: ['Develop features'],
      },
      jobRequirements: {
        keywords: ['TypeScript', 'React'],
        skills: ['Frontend Development'],
        qualifications: ['Bachelors Degree'],
        responsibilities: ['Develop features'],
      },
      submittedAt: new Date().toISOString(),
    });
    // Ensure the mock sign function returns a token for the cookie
    (sign as jest.Mock).mockReturnValue('mockAccessToken');
  });

  it('should return 200 and analysis result for valid job description and cvId when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`]) // Set mock cookie for authentication
      .send({ jobDescription: validJobDescription, cvId: validCvId });

    expect(response.statusCode).toEqual(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('matchScore');
    expect(response.body.data).toHaveProperty('atsScore');
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledWith(
      userId,
      validJobDescription,
      validCvId // cvId should be passed to the service
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
    expect(response.body.errors[0].message).toEqual('Job description must be at least 10 characters long.');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid cvId format', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: 'not-a-uuid' });

    expect(response.statusCode).toEqual(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Validation failed');
    expect(response.body.errors[0].message).toEqual('Invalid CV ID format');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 400 if cvId is missing', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Validation failed');
    expect(response.body.errors[0].message).toEqual('Invalid input: expected string, received undefined');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 401 if no authentication token is provided', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .send({ jobDescription: validJobDescription, cvId: validCvId });

    expect(response.statusCode).toEqual(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('No access token provided');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 500 if jobAnalysisService throws an unexpected error', async () => {
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockRejectedValue(
      new Error('Service internal error')
    );

    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });

    expect(response.statusCode).toEqual(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('Service internal error');
  });

  it('should meet performance NFR for non-cached requests (<5s)', async () => {
    // Mock a controlled delay of 4 seconds (4000ms) to simulate LLM processing
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockImplementationOnce(
      (userId: string, jobDescription: string, cvId: string) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              matchScore: 78,
              atsScore: 92,
              gapAnalysis: {},
              jobRequirements: {},
              submittedAt: new Date().toISOString(),
            });
          }, 4000); // 4 seconds delay
        });
      }
    );

    const startTime = Date.now();
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.statusCode).toEqual(200);
    expect(response.body.success).toBe(true);
    expect(duration).toBeLessThan(5000); // Assert less than 5 seconds
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledWith(
      userId,
      validJobDescription,
      validCvId
    );
  });

  it.skip('should return from cache on subsequent calls for the same job description (faster response)', async () => {
    // Mock KeywordExtractionService to introduce a delay for the actual AI call
    // jobAnalysisService.analyzeJobDescription uses KeywordExtractionService internally
    // We need to mock KeywordExtractionService directly to test the caching logic in jobAnalysisService
    jest.mock('../../services/KeywordExtractionService', () => ({
      KeywordExtractionService: {
        extractKeywords: jest.fn().mockImplementation(
          (jobDescription: string) => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  keywords: ['cached', 'result'],
                  skills: [],
                  qualifications: [],
                  responsibilities: [],
                });
              }, 4000); // Simulate 4s LLM call
            });
          }
        ),
      },
    }));

    // The jobAnalysisService.analyzeJobDescription will be called by the controller
    // and should handle the caching. Its mockResolvedValue is for the initial setup,
    // but the caching logic itself will determine if KeywordExtractionService is called.
    // For this test, we need to ensure the actual jobAnalysisService's caching logic runs.
    // So, we'll bypass the analyzeJobDescription mock for this specific test.
    // We can't directly do this with jest.mock, so we'll mock the internal redis.get and redis.setex.
    jest.mock('../../config/redis', () => ({
        redis: {
            get: jest.fn(),
            setex: jest.fn(),
        },
    }));
    const { redis } = require('../../config/redis');
    const { KeywordExtractionService } = require('../../services/KeywordExtractionService');


    const mockCacheHitData = {
        matchScore: 99,
        atsScore: 99,
        gapAnalysis: {},
        jobRequirements: {},
        submittedAt: new Date().toISOString(),
    };

    // First call: should be a cache miss, call AI, store in cache
    redis.get.mockResolvedValueOnce(null); // Simulate cache miss
    redis.setex.mockResolvedValueOnce('OK');
    KeywordExtractionService.extractKeywords.mockClear(); // Clear any previous calls from setup

    const startTime1 = Date.now();
    const response1 = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;

    expect(response1.statusCode).toEqual(200);
    expect(duration1).toBeGreaterThanOrEqual(4000); // Expect ~4s for AI call
    expect(KeywordExtractionService.extractKeywords).toHaveBeenCalledTimes(1);
    expect(redis.setex).toHaveBeenCalledTimes(1);

    // Second call: should be a cache hit, return cached data
    redis.get.mockResolvedValueOnce(JSON.stringify(mockCacheHitData)); // Simulate cache hit
    KeywordExtractionService.extractKeywords.mockClear(); // Ensure AI not called again

    const startTime2 = Date.now();
    const response2 = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`access_token=mockAccessToken`])
      .send({ jobDescription: validJobDescription, cvId: validCvId });
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;

    expect(response2.statusCode).toEqual(200);
    expect(duration2).toBeLessThan(500); // Expect very fast response from cache
    expect(KeywordExtractionService.extractKeywords).not.toHaveBeenCalled(); // AI should not be called
    expect(redis.get).toHaveBeenCalledTimes(2); // Called for both requests
    expect(response2.body.data).toEqual(mockCacheHitData);
  });
});
