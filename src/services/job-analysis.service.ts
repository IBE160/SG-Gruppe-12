// src/services/job-analysis.service.ts
import { prisma } from '../config/database';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { AnalyzeJobDescriptionInput } from '../validators/job.validator';
import { KeywordExtractionService, ExtractedJobData } from './KeywordExtractionService'; // Import the new service and type
import { redis } from '../config/redis'; // Import Redis client
import crypto from 'crypto'; // For generating cache keys
import { MatchScoringService } from './MatchScoringService';
import { cvRepository } from '../repositories/cv.repository';

// Define cache TTL (Time To Live) in seconds
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Helper function to generate a unique cache key for a job description
const generateCacheKey = (jobDescription: string): string => {
  return `job_analysis:${crypto.createHash('sha256').update(jobDescription).digest('hex')}`;
};

export const jobAnalysisService = {
  /**
   * Retrieves all job postings for a specific user.
   * @param userId The ID of the user.
   * @returns Array of job postings.
   */
  async getJobPostings(userId: string) {
    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        OR: [
          { user_id: userId },
          { user_id: null }, // Include public job postings
        ],
      },
      orderBy: { created_at: 'desc' },
    });

    return jobPostings;
  },

  /**
   * Retrieves a job posting by ID for a specific user.
   * @param userId The ID of the user.
   * @param jobPostingId The ID of the job posting.
   * @returns The job posting data.
   */
  async getJobPosting(userId: string, jobPostingId: number) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      throw new AppError('Job posting not found', 404);
    }

    // Check if the job posting belongs to the user (if user_id is set)
    if (jobPosting.user_id && jobPosting.user_id !== userId) {
      throw new AppError('Unauthorized to access this job posting', 403);
    }

    return jobPosting;
  },

  async analyzeJobDescription(userId: string, jobDescription: string, cvId: string) {
    if (!jobDescription || jobDescription.length < 10) {
      logger.warn(`User ${userId} submitted an invalid job description.`);
      throw new AppError('Invalid job description provided.', 400);
    }

    logger.info(`User ${userId} started job description analysis for CV ${cvId}.`);

    const cacheKey = generateCacheKey(`${jobDescription}:${cvId}`);

    // 1. Check cache for existing analysis
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      logger.info(`Cache hit for job description analysis: ${cacheKey}`);
      return JSON.parse(cachedResult);
    }

    logger.info(`Cache miss for job description analysis: ${cacheKey}. Performing AI extraction.`);

    const [userCV, extractedJobData] = await Promise.all([
      cvRepository.findById(parseInt(cvId, 10)),
      KeywordExtractionService.extractKeywords(jobDescription)
    ]);

    if (!userCV) {
      throw new AppError('CV not found', 404);
    }
    if (userCV.user_id !== userId) {
        throw new AppError('Unauthorized to access this CV', 403);
    }

    const cvDataForMatching = { skills: userCV.skills as string[] };
    const { presentKeywords, missingKeywords } = MatchScoringService.compareCvToJob(cvDataForMatching, extractedJobData);
    const matchScore = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
    
    // Placeholder for summaries
    const strengthsSummary = "Your skills in " + presentKeywords.slice(0,2).join(', ') + " are a great match.";
    const weaknessesSummary = "Consider highlighting experience with " + missingKeywords.slice(0,2).join(', ') + ".";

    logger.info(`Analysis complete for user ${userId}. Match Score: ${matchScore}`);

    const result = {
      matchScore,
      presentKeywords,
      missingKeywords,
      strengthsSummary,
      weaknessesSummary,
      rawKeywords: extractedJobData.keywords,
      jobRequirements: extractedJobData, // Return the full extracted data
      submittedAt: new Date().toISOString(),
    };

    // 2. Store result in cache
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
    logger.info(`Job description analysis cached: ${cacheKey}`);

    return result;
  },

  /**
   * Retrieves a job analysis by job posting ID.
   * This fetches the job posting and returns its extracted data.
   * @param jobId The ID of the job posting.
   * @param userId The ID of the user requesting the analysis.
   * @returns The job analysis data including extracted job data.
   */
  async getJobAnalysisById(jobId: string, userId: string) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: parseInt(jobId) },
    });

    if (!jobPosting) {
      throw new AppError('Job posting not found', 404);
    }

    // Check if the job posting belongs to the user (if user_id is set)
    if (jobPosting.user_id && jobPosting.user_id !== userId) {
      throw new AppError('Unauthorized to access this job posting', 403);
    }

    // If extracted data exists, return it
    if (jobPosting.extracted_data) {
      return {
        jobId,
        extractedData: jobPosting.extracted_data as ExtractedJobData,
        createdAt: jobPosting.created_at.toISOString(),
      };
    }

    // If no extracted data, extract it now
    if (jobPosting.description) {
      const extractedData = await KeywordExtractionService.extractKeywords(jobPosting.description);

      // Update job posting with extracted data
      await prisma.jobPosting.update({
        where: { id: parseInt(jobId) },
        data: { extracted_data: extractedData as any },
      });

      return {
        jobId,
        extractedData,
        createdAt: jobPosting.created_at.toISOString(),
      };
    }

    throw new AppError('Job posting has no description to analyze', 400);
  },
};
