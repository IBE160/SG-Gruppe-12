// src/tests/integration/job.routes.test.ts
import request from 'supertest';
import express from 'express';
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

// Mock the AppError to simplify throwing in controller for testing error middleware
jest.mock('../../utils/errors.util', () => ({
  ...jest.requireActual('../../utils/errors.util'),
  AppError: jest.fn((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  }),
}));

// Setup a mock Express app to test the route
const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock rate limiter to pass tests without Redis running
// This allows the test to run without setting up a real Redis instance
jest.mock('express-rate-limit', () => {
  const mockRateLimit = jest.fn((options) => (req, res, next) => next());
  (mockRateLimit as any).RedisStore = jest.fn(); // Mock the RedisStore constructor if it's referenced
  return mockRateLimit;
});

// Mock aiLimiter directly
jest.mock('../../middleware/rate-limit.middleware', () => ({
  aiLimiter: (req, res, next) => next(), // Just call next() to bypass actual rate limiting
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
  const userId = 'testUserId123'; // Matches mocked JWT payload

  beforeEach(() => {
    jest.clearAllMocks();
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue({
      status: 'received',
      message: 'Job description received for AI analysis.',
    });
    // Ensure the mock sign function returns a token for the cookie
    (sign as jest.Mock).mockReturnValue('mockAccessToken');
  });

  it('should return 200 and success message for valid job description when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`auth-token=mockAccessToken`]) // Set mock cookie for authentication
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual('Job description received for analysis.');
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledWith(
      userId,
      validJobDescription
    );
  });

  it('should return 400 for invalid job description (too short)', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`auth-token=mockAccessToken`])
      .send({ jobDescription: 'short' });

    expect(response.statusCode).toEqual(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Validation failed');
    expect(response.body.errors[0].message).toEqual('Job description must be at least 10 characters long.');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 401 if no authentication token is provided', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('Invalid or expired token');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 500 if jobAnalysisService throws an unexpected error', async () => {
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockRejectedValue(
      new Error('Service internal error')
    );

    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', [`auth-token=mockAccessToken`])
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toEqual('An unexpected error occurred');
  });
});
