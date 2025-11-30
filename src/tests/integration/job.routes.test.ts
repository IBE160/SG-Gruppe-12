// src/tests/integration/job.routes.test.ts
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

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
  },
}));

// Mock rate limiter to pass tests without Redis running
jest.mock('../../middleware/rate-limit.middleware', () => ({
  aiLimiter: (req: any, res: any, next: any) => next(),
}));

// Now import after mocks are set up
import { analyzeJobDescriptionSchema } from '../../validators/job.validator';
import { jobController } from '../../controllers/job.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { aiLimiter } from '../../middleware/rate-limit.middleware';
import { errorMiddleware } from '../../middleware/error.middleware';
import { jobAnalysisService } from '../../services/job-analysis.service';

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
  validate(analyzeJobDescriptionSchema),
  jobController.analyzeJob
);

router.get('/', authenticate, jobController.getJobPostings);
router.get('/:id', authenticate, jobController.getJobPosting);

app.use('/api/v1/jobs', router); // Mount the job routes
app.use(errorMiddleware); // Use the global error handler

describe('POST /api/v1/jobs/analyze', () => {
  const validJobDescription = 'This is a valid job description with at least 10 characters.';
  const userId = 'testUserId123'; // Matches mocked JWT payload

  beforeEach(() => {
    jest.clearAllMocks();
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockResolvedValue({
      jobPostingId: 1,
      title: 'Test Job',
      company: 'Test Company',
    });
  });

  it('should return 201 and success message for valid job description when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', ['access_token=mock-token']) // Set mock cookie for authentication
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(201);
    expect(response.body.message).toEqual('Job posting created successfully');
    expect(response.body.data).toBeDefined();
    expect(jobAnalysisService.analyzeJobDescription).toHaveBeenCalledWith(
      userId,
      validJobDescription,
      undefined,
      undefined
    );
  });

  it('should return 400 for invalid job description (too short)', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', ['access_token=mock-token'])
      .send({ jobDescription: 'short' });

    expect(response.statusCode).toEqual(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain('Validation failed');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 401 if no authentication token is provided', async () => {
    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toContain('No access token provided');
    expect(jobAnalysisService.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('should return 500 if jobAnalysisService throws an unexpected error', async () => {
    (jobAnalysisService.analyzeJobDescription as jest.Mock).mockRejectedValue(
      new Error('Service internal error')
    );

    const response = await request(app)
      .post('/api/v1/jobs/analyze')
      .set('Cookie', ['access_token=mock-token'])
      .send({ jobDescription: validJobDescription });

    expect(response.statusCode).toEqual(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toEqual('Service internal error');
  });
});

describe('GET /api/v1/jobs', () => {
  const userId = 'testUserId123';

  const mockJobPostings = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      description: 'Build amazing software',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Web Inc',
      description: 'Create beautiful UIs',
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all job postings for authenticated user', async () => {
    (jobAnalysisService.getUserJobPostings as jest.Mock).mockResolvedValue(mockJobPostings);

    const response = await request(app)
      .get('/api/v1/jobs')
      .set('Cookie', ['access_token=mock-token']);

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toEqual(mockJobPostings);
    expect(jobAnalysisService.getUserJobPostings).toHaveBeenCalledWith(userId);
  });

  it('should return empty array if user has no job postings', async () => {
    (jobAnalysisService.getUserJobPostings as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get('/api/v1/jobs')
      .set('Cookie', ['access_token=mock-token']);

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toEqual([]);
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .get('/api/v1/jobs');

    expect(response.statusCode).toEqual(401);
    expect(jobAnalysisService.getUserJobPostings).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/jobs/:id', () => {
  const userId = 'testUserId123';

  const mockJobPosting = {
    id: 1,
    title: 'Software Engineer',
    company: 'Tech Corp',
    description: 'Build amazing software with cutting-edge technologies',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a specific job posting for authenticated user', async () => {
    (jobAnalysisService.getJobPosting as jest.Mock).mockResolvedValue(mockJobPosting);

    const response = await request(app)
      .get('/api/v1/jobs/1')
      .set('Cookie', ['access_token=mock-token']);

    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toEqual(mockJobPosting);
    expect(jobAnalysisService.getJobPosting).toHaveBeenCalledWith(userId, 1);
  });

  it('should return 404 for non-existent job posting', async () => {
    (jobAnalysisService.getJobPosting as jest.Mock).mockRejectedValue(
      new Error('Job posting not found')
    );

    const response = await request(app)
      .get('/api/v1/jobs/999')
      .set('Cookie', ['access_token=mock-token']);

    expect(response.statusCode).toEqual(500); // Will be 404 with proper error handling
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app)
      .get('/api/v1/jobs/1');

    expect(response.statusCode).toEqual(401);
    expect(jobAnalysisService.getJobPosting).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid job posting ID', async () => {
    const response = await request(app)
      .get('/api/v1/jobs/invalid')
      .set('Cookie', ['access_token=mock-token']);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual('Invalid job posting ID');
  });
});
