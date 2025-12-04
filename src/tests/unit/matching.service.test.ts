/**
 * Unit tests for Matching Service
 * Story: 3-3 CV-Job Description Keyword Matching Algorithm
 */

import { matchingService } from '../../services/matching.service';
import { cvService } from '../../services/cv.service';
import { jobAnalysisService } from '../../services/job-analysis.service';
import { redis } from '../../config/redis';
import { CvData } from '../../types/cv.types';
import { ExtractedJobData } from '../../services/KeywordExtractionService';
import { NotFoundError } from '../../utils/errors.util';

// Mock dependencies
jest.mock('../../services/cv.service');
jest.mock('../../services/job-analysis.service');
jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}));
jest.mock('../../utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Matching Service', () => {
  const mockUserId = 'user-123';
  const mockCvId = '1';
  const mockJobId = '1';

  const mockCvData: CvData & { id: number } = {
    id: 1,
    personal_info: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    skills: [
      { name: 'JavaScript', proficiency: 'advanced' },
      { name: 'React', proficiency: 'expert' },
      { name: 'TypeScript', proficiency: 'intermediate' },
      { name: 'Node.js', proficiency: 'advanced' },
    ],
    experience: [
      {
        title: 'Frontend Developer',
        company: 'Tech Corp',
        start_date: '2020-01-01',
        description: 'Developed React applications with TypeScript and modern web technologies',
      },
    ],
    education: [
      {
        institution: 'University of Tech',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
      },
    ],
    summary: 'Experienced frontend developer with expertise in React and TypeScript',
  };

  const mockJobData: ExtractedJobData = {
    keywords: ['JavaScript', 'React', 'Frontend', 'Web Development', 'Agile'],
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Git'],
    qualifications: ['Bachelor degree in Computer Science'],
    responsibilities: ['Develop frontend features', 'Write tests', 'Code reviews'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('matchCVToJob', () => {
    it('should successfully match CV to job and return match result', async () => {
      // Mock service responses
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null); // No cached result
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Verify result structure
      expect(result).toHaveProperty('matchScore');
      expect(result).toHaveProperty('matchedKeywords');
      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingKeywords');
      expect(result).toHaveProperty('missingSkills');
      expect(result).toHaveProperty('gapAnalysis');
      expect(result).toHaveProperty('metadata');

      // Verify match score is calculated
      expect(result.matchScore).toBeGreaterThanOrEqual(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);

      // Verify matched keywords
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
      expect(result.matchedKeywords[0]).toHaveProperty('keyword');
      expect(result.matchedKeywords[0]).toHaveProperty('matchType');
      expect(result.matchedKeywords[0]).toHaveProperty('confidence');

      // Verify matched skills
      expect(result.matchedSkills.length).toBeGreaterThan(0);
      expect(result.matchedSkills[0]).toHaveProperty('skillName');
      expect(result.matchedSkills[0]).toHaveProperty('matchStrength');

      // Verify metadata
      expect(result.metadata.cvId).toBe(mockCvId);
      expect(result.metadata.jobId).toBe(mockJobId);
      expect(result.metadata.analyzedAt).toBeDefined();
      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);

      // Verify services were called
      expect(cvService.getCVById).toHaveBeenCalledWith(mockUserId, parseInt(mockCvId));
      expect(jobAnalysisService.getJobAnalysisById).toHaveBeenCalledWith(mockJobId, mockUserId);

      // Verify caching
      expect(redis.setex).toHaveBeenCalled();
    });

    it('should return cached result if available', async () => {
      const cachedResult = {
        matchScore: 75,
        matchedKeywords: [],
        matchedSkills: [],
        missingKeywords: [],
        missingSkills: [],
        gapAnalysis: {
          missingSkills: [],
          missingQualifications: [],
          recommendations: [],
        },
        metadata: {
          cvId: mockCvId,
          jobId: mockJobId,
          analyzedAt: new Date().toISOString(),
        },
      };

      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedResult));

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      expect(result.matchScore).toBe(75);
      expect(cvService.getCVById).not.toHaveBeenCalled();
      expect(jobAnalysisService.getJobAnalysisById).not.toHaveBeenCalled();
    });

    it('should match exact keywords correctly', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should match JavaScript, React, TypeScript (exact matches)
      const exactMatches = result.matchedKeywords.filter(k => k.matchType === 'exact');
      expect(exactMatches.length).toBeGreaterThan(0);

      // Verify JavaScript is matched
      const jsMatch = result.matchedKeywords.find(k =>
        k.keyword.toLowerCase() === 'javascript'
      );
      expect(jsMatch).toBeDefined();
    });

    it('should match synonym keywords correctly', async () => {
      const cvDataWithSynonyms = {
        ...mockCvData,
        skills: [
          { name: 'JS', proficiency: 'advanced' as const },
          { name: 'ReactJS', proficiency: 'expert' as const },
        ],
      };

      (cvService.getCVById as jest.Mock).mockResolvedValue(cvDataWithSynonyms);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should match JS with JavaScript as synonym
      const synonymMatches = result.matchedKeywords.filter(k => k.matchType === 'synonym');
      expect(synonymMatches.length).toBeGreaterThan(0);
    });

    it('should consider proficiency levels in skill matching', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Expert skills should have higher match strength
      const reactMatch = result.matchedSkills.find(s => s.skillName === 'React');
      const intermediateMatch = result.matchedSkills.find(s => s.skillName === 'TypeScript');

      if (reactMatch && intermediateMatch) {
        expect(reactMatch.matchStrength).toBeGreaterThan(intermediateMatch.matchStrength);
      }
    });

    it('should identify missing skills from job requirements', async () => {
      const jobDataWithExtraSkills = {
        ...mockJobData,
        skills: ['JavaScript', 'React', 'Python', 'Docker', 'Kubernetes'],
      };

      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: jobDataWithExtraSkills,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should identify Python, Docker, Kubernetes as missing
      expect(result.missingSkills.length).toBeGreaterThan(0);
      expect(result.missingSkills).toContain('Python');
      expect(result.missingSkills).toContain('Docker');
    });

    it('should identify missing keywords from job requirements', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should have some missing keywords
      expect(result.missingKeywords).toBeDefined();
      expect(Array.isArray(result.missingKeywords)).toBe(true);
    });

    it('should generate gap analysis with recommendations', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      expect(result.gapAnalysis).toBeDefined();
      expect(result.gapAnalysis.missingSkills).toBeDefined();
      expect(result.gapAnalysis.missingQualifications).toBeDefined();
      expect(result.gapAnalysis.recommendations).toBeDefined();
      expect(Array.isArray(result.gapAnalysis.recommendations)).toBe(true);
    });

    it('should handle edge case: empty CV data', async () => {
      const emptyCvData = {
        id: 1,
        skills: [],
        experience: [],
        education: [],
      };

      (cvService.getCVById as jest.Mock).mockResolvedValue(emptyCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should have low match score
      expect(result.matchScore).toBeLessThan(20);
      expect(result.matchedSkills.length).toBe(0);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should handle edge case: empty job data', async () => {
      const emptyJobData: ExtractedJobData = {
        keywords: [],
        skills: [],
        qualifications: [],
        responsibilities: [],
      };

      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: emptyJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should have match score of 0
      expect(result.matchScore).toBe(0);
      expect(result.matchedKeywords.length).toBe(0);
      expect(result.matchedSkills.length).toBe(0);
    });

    it('should handle edge case: no matches found', async () => {
      const cvDataNoMatches = {
        ...mockCvData,
        skills: [
          { name: 'COBOL', proficiency: 'expert' as const },
          { name: 'Assembly', proficiency: 'advanced' as const },
        ],
      };

      (cvService.getCVById as jest.Mock).mockResolvedValue(cvDataNoMatches);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);

      // Should have very low match score
      expect(result.matchScore).toBeLessThan(30);
      expect(result.missingSkills.length).toBe(mockJobData.skills.length);
    });

    it('should throw NotFoundError if CV not found', async () => {
      (cvService.getCVById as jest.Mock).mockRejectedValue(new NotFoundError('CV not found'));

      await expect(
        matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if job analysis not found', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockRejectedValue(
        new NotFoundError('Job analysis not found')
      );

      await expect(
        matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should complete within 2 seconds performance target', async () => {
      (cvService.getCVById as jest.Mock).mockResolvedValue(mockCvData);
      (jobAnalysisService.getJobAnalysisById as jest.Mock).mockResolvedValue({
        jobId: mockJobId,
        extractedData: mockJobData,
        createdAt: new Date().toISOString(),
      });
      (redis.get as jest.Mock).mockResolvedValue(null);
      (redis.setex as jest.Mock).mockResolvedValue('OK');

      const startTime = Date.now();
      const result = await matchingService.matchCVToJob(mockUserId, mockCvId, mockJobId);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify performance target
      expect(processingTime).toBeLessThan(2000);
      expect(result.metadata.processingTimeMs).toBeLessThan(2000);
    });
  });

  describe('invalidateCVCache', () => {
    it('should invalidate all cache entries for a CV', async () => {
      const cacheKeys = ['match:1:job1', 'match:1:job2', 'match:1:job3'];
      (redis.keys as jest.Mock).mockResolvedValue(cacheKeys);
      (redis.del as jest.Mock).mockResolvedValue(3);

      await matchingService.invalidateCVCache(mockCvId);

      expect(redis.keys).toHaveBeenCalledWith('match:1:*');
      expect(redis.del).toHaveBeenCalledWith(...cacheKeys);
    });

    it('should handle case when no cache entries exist', async () => {
      (redis.keys as jest.Mock).mockResolvedValue([]);

      await matchingService.invalidateCVCache(mockCvId);

      expect(redis.keys).toHaveBeenCalledWith('match:1:*');
      expect(redis.del).not.toHaveBeenCalled();
    });

    it('should not throw error if cache invalidation fails', async () => {
      (redis.keys as jest.Mock).mockRejectedValue(new Error('Redis error'));

      await expect(matchingService.invalidateCVCache(mockCvId)).resolves.not.toThrow();
    });
  });
});
