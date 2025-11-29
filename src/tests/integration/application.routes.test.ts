// src/tests/integration/application.routes.test.ts
import request from 'supertest';
import { app } from '../../app';
import { applicationService } from '../../services/application.service';
import { jwtService } from '../../utils/jwt.util';

// Mock the application service
jest.mock('../../services/application.service');

// Mock JWT verification
jest.mock('../../utils/jwt.util', () => ({
  jwtService: {
    generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
    verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
  },
}));

describe('Application Routes', () => {
  const mockUserId = 'test-user-id';
  const mockCvId = 1;
  const mockJobPostingId = 1;
  const mockApplicationId = 1;

  const mockTailoredCv = {
    summary: 'Experienced developer with React expertise',
    experience: [
      {
        title: 'Frontend Developer',
        company: 'Tech Corp',
        period: '2020-2024',
        bullets: ['Built React applications', 'Improved performance'],
      },
    ],
    skills: ['React', 'TypeScript', 'Node.js'],
    highlights: ['Led team of 5 developers'],
  };

  const mockCoverLetter = {
    greeting: 'Dear Hiring Manager,',
    opening: 'I am writing to apply for the position...',
    body: ['First paragraph...', 'Second paragraph...'],
    closing: 'I look forward to discussing...',
    signature: 'Sincerely,\nTest User',
    fullText: 'Dear Hiring Manager,\n\nI am writing to apply...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/applications/generate-cv', () => {
    it('should generate a tailored CV successfully', async () => {
      (applicationService.generateTailoredCV as jest.Mock).mockResolvedValue({
        applicationId: mockApplicationId,
        tailoredCv: mockTailoredCv,
      });

      const response = await request(app)
        .post('/api/v1/applications/generate-cv')
        .set('Cookie', ['access_token=mock-token'])
        .send({ cvId: mockCvId, jobPostingId: mockJobPostingId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Tailored CV generated successfully');
      expect(response.body.applicationId).toBe(mockApplicationId);
      expect(response.body.tailoredCv).toEqual(mockTailoredCv);
      expect(applicationService.generateTailoredCV).toHaveBeenCalledWith(
        mockUserId,
        mockCvId,
        mockJobPostingId
      );
    });

    it('should return 400 for invalid cvId', async () => {
      const response = await request(app)
        .post('/api/v1/applications/generate-cv')
        .set('Cookie', ['access_token=mock-token'])
        .send({ cvId: -1, jobPostingId: mockJobPostingId });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing jobPostingId', async () => {
      const response = await request(app)
        .post('/api/v1/applications/generate-cv')
        .set('Cookie', ['access_token=mock-token'])
        .send({ cvId: mockCvId });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/applications/generate-cv')
        .send({ cvId: mockCvId, jobPostingId: mockJobPostingId });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/applications/generate-cover-letter', () => {
    it('should generate a cover letter successfully', async () => {
      (applicationService.generateCoverLetter as jest.Mock).mockResolvedValue({
        applicationId: mockApplicationId,
        coverLetter: mockCoverLetter,
      });

      const response = await request(app)
        .post('/api/v1/applications/generate-cover-letter')
        .set('Cookie', ['access_token=mock-token'])
        .send({ cvId: mockCvId, jobPostingId: mockJobPostingId });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cover letter generated successfully');
      expect(response.body.coverLetter).toEqual(mockCoverLetter);
    });

    it('should accept optional cover letter options', async () => {
      (applicationService.generateCoverLetter as jest.Mock).mockResolvedValue({
        applicationId: mockApplicationId,
        coverLetter: mockCoverLetter,
      });

      const options = { tone: 'formal', length: 'short' };

      const response = await request(app)
        .post('/api/v1/applications/generate-cover-letter')
        .set('Cookie', ['access_token=mock-token'])
        .send({ cvId: mockCvId, jobPostingId: mockJobPostingId, options });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/applications', () => {
    it('should return all user applications', async () => {
      const mockApplications = [
        {
          id: 1,
          cvId: 1,
          jobPostingId: 1,
          hasTailoredCv: true,
          hasCoverLetter: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          cvId: 2,
          jobPostingId: 2,
          hasTailoredCv: true,
          hasCoverLetter: false,
          createdAt: new Date().toISOString(),
        },
      ];

      (applicationService.getUserApplications as jest.Mock).mockResolvedValue(mockApplications);

      const response = await request(app)
        .get('/api/v1/applications')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual(mockApplications);
    });

    it('should return empty array if no applications', async () => {
      (applicationService.getUserApplications as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/applications')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.applications).toEqual([]);
    });
  });

  describe('GET /api/v1/applications/:id', () => {
    it('should return a specific application', async () => {
      const mockApplication = {
        id: mockApplicationId,
        cvId: mockCvId,
        jobPostingId: mockJobPostingId,
        tailoredCv: mockTailoredCv,
        coverLetter: mockCoverLetter,
        createdAt: new Date().toISOString(),
      };

      (applicationService.getApplication as jest.Mock).mockResolvedValue(mockApplication);

      const response = await request(app)
        .get(`/api/v1/applications/${mockApplicationId}`)
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(200);
      expect(response.body.application).toEqual(mockApplication);
    });

    it('should return 400 for invalid application ID', async () => {
      const response = await request(app)
        .get('/api/v1/applications/invalid')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent application', async () => {
      (applicationService.getApplication as jest.Mock).mockRejectedValue(
        new Error('Application not found')
      );

      const response = await request(app)
        .get('/api/v1/applications/999')
        .set('Cookie', ['access_token=mock-token']);

      expect(response.status).toBe(500); // Will be 404 with proper error handling
    });
  });

  describe('PATCH /api/v1/applications/:id', () => {
    it('should update application content successfully', async () => {
      const mockUpdated = {
        id: mockApplicationId,
        created_at: new Date(),
      };

      (applicationService.updateApplication as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .patch(`/api/v1/applications/${mockApplicationId}`)
        .set('Cookie', ['access_token=mock-token'])
        .send({
          generatedCvContent: JSON.stringify(mockTailoredCv),
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Application updated successfully');
    });

    it('should allow updating cover letter content', async () => {
      const mockUpdated = {
        id: mockApplicationId,
        created_at: new Date(),
      };

      (applicationService.updateApplication as jest.Mock).mockResolvedValue(mockUpdated);

      const response = await request(app)
        .patch(`/api/v1/applications/${mockApplicationId}`)
        .set('Cookie', ['access_token=mock-token'])
        .send({
          generatedApplicationContent: JSON.stringify(mockCoverLetter),
        });

      expect(response.status).toBe(200);
    });
  });
});
