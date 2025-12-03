// src/services/job-analysis.service.ts
import { prisma } from '../config/database';
import { JobAnalysisResult, ATSAssessment } from '../types/job.types';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import {
  AnalyzeJobDescriptionInput,
  ExtractedJobDataSchema,
  JobAnalysisResultSchema
} from '../validators/job.validator';
import { KeywordExtractionService, ExtractedJobData } from './KeywordExtractionService';
import { redis } from '../config/redis';
import crypto from 'crypto';
import { MatchScoringService } from './MatchScoringService';
import { cvRepository } from '../repositories/cv.repository';
import { CvData, ExperienceEntry } from '../types/cv.types';
import { jobUrlFetcherService } from './job-url-fetcher.service';

// Define cache TTL (Time To Live) in seconds
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Helper function to generate a unique cache key for a job description
const generateCacheKey = (jobDescription: string): string => {
  return `job_analysis:${crypto.createHash('sha256').update(jobDescription).digest('hex')}`;
};

export const jobAnalysisService = {
  /**
   * Calculates the ATS (Applicant Tracking System) compatibility score.
   * @param presentKeywords Keywords from job description found in CV.
   * @param missingKeywords Keywords from job description missing in CV.
   * @param userCV The full CV data of the user.
   * @returns An ATSAssessment object containing score, suggestions, and qualitative rating.
   */
  calculateATSScore(presentKeywords: string[], missingKeywords: string[], userCV: CvData): ATSAssessment {
    let score = 0;
    const suggestions: string[] = [];

    // Individual breakdown scores (raw percentages, not weighted yet)
    let keywordDensityRawScore = 0;
    let formattingRawScore = 0;
    let sectionCompletenessRawScore = 0;
    let quantifiableAchievementsRawScore = 0;

    // 1. Keyword Presence (40% weight)
    const totalJobKeywords = presentKeywords.length + missingKeywords.length;
    if (totalJobKeywords > 0) {
      keywordDensityRawScore = (presentKeywords.length / totalJobKeywords) * 100;
    }
    score += keywordDensityRawScore * 0.40; // Apply weight
    if (missingKeywords.length > 0) {
      suggestions.push(`Add or rephrase experience to include keywords like: ${missingKeywords.slice(0, 3).join(', ')}`);
    }

    // 2. Formatting Simplicity (30% weight)
    // Proxy: assume good if common sections are present and non-empty.
    if (userCV.personal_info?.name && userCV.personal_info?.email && // At least name and email
        (userCV.education?.length || 0) > 0 && (userCV.experience?.length || 0) > 0 && (userCV.skills?.length || 0) > 0) {
      formattingRawScore = 100; // Perfect score if basic structure is complete
    } else {
      formattingRawScore = 50; // Assume 50% if not all key sections are present/well-formed
      suggestions.push("Ensure all key sections (Personal Info, Education, Experience, Skills) are complete and well-structured.");
    }
    score += formattingRawScore * 0.30; // Apply weight
    
    // 3. Section Completeness (20% weight)
    const totalSections = 4; // personal_info, education, experience, skills
    let presentSections = 0;

    if (userCV.personal_info && Object.keys(userCV.personal_info).length > 0) presentSections++;
    if ((userCV.education?.length || 0) > 0) presentSections++;
    if ((userCV.experience?.length || 0) > 0) presentSections++;
    if ((userCV.skills?.length || 0) > 0) presentSections++;
    
    sectionCompletenessRawScore = (presentSections / totalSections) * 100;
    score += sectionCompletenessRawScore * 0.20; // Apply weight
    if (presentSections < totalSections) {
        suggestions.push("Fill out all relevant sections of your CV (e.g., summary, awards) for higher completeness.");
    }

    // 4. Quantifiable Achievements (10% weight)
    // Proxy: Check for numbers in experience descriptions as an indicator of quantifiable achievements.
    const hasQuantifiable = (userCV.experience || []).some((exp: ExperienceEntry) => /\d+/.test(exp.description || ''));
    if (hasQuantifiable) {
      quantifiableAchievementsRawScore = 100;
    } else {
      suggestions.push("Include quantifiable achievements (e.g., 'increased sales by 15%') in your experience descriptions.");
    }
    score += quantifiableAchievementsRawScore * 0.10; // Apply weight

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    let qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (score >= 90) qualitativeRating = 'Excellent';
    else if (score >= 75) qualitativeRating = 'Good';
    else if (score >= 60) qualitativeRating = 'Fair';
    else qualitativeRating = 'Poor';

    return { 
      score, 
      suggestions, 
      qualitativeRating,
      breakdown: {
        keywordDensityScore: Math.round(keywordDensityRawScore),
        formattingScore: Math.round(formattingRawScore),
        sectionCompletenessScore: Math.round(sectionCompletenessRawScore),
        quantifiableAchievementsScore: Math.round(quantifiableAchievementsRawScore),
      }
    };
  },

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

  async analyzeJobDescription(userId: string, jobDescriptionOrUrl: string, cvId: string) {
    // Check if input is a URL and fetch content if needed
    let jobDescription = jobDescriptionOrUrl;
    if (jobUrlFetcherService.isUrl(jobDescriptionOrUrl)) {
      logger.info(`Input detected as URL, fetching content for user ${userId}...`);
      jobDescription = await jobUrlFetcherService.fetchJobPosting(jobDescriptionOrUrl);
      logger.info(`Successfully fetched job description from URL (${jobDescription.length} characters)`);
    }

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

    const userCVEntity = await cvRepository.findById(parseInt(cvId, 10)); // Get the full CV entity from DB

    if (!userCVEntity) {
      throw new AppError('CV not found', 404);
    }
    if (userCVEntity.user_id !== userId) {
        throw new AppError('Unauthorized to access this CV', 403);
    }

    // Convert the Prisma CV entity to the CvData type expected by calculateATSScore
    const userCV: CvData = {
        personal_info: userCVEntity.personal_info as any,
        education: userCVEntity.education as any,
        experience: userCVEntity.experience as any,
        skills: userCVEntity.skills as any,
        languages: userCVEntity.languages as any,
        summary: userCVEntity.summary || undefined,
        title: userCVEntity.title || undefined,
        file_path: userCVEntity.file_path || undefined,
    };

    const cvDataForMatching = { skills: userCV.skills?.map(s => s.name) || [] }; // Pass skill names for matching
    const extractedJobData = await KeywordExtractionService.extractKeywords(jobDescription);

    // Story 3.6: Validate AI extraction output at service boundary
    const validatedExtractedData = ExtractedJobDataSchema.parse(extractedJobData);

    const { presentKeywords, missingKeywords } = MatchScoringService.compareCvToJob(cvDataForMatching, validatedExtractedData);
    const matchScore = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
    
    // Calculate ATS Score
    const atsAssessment = this.calculateATSScore(presentKeywords, missingKeywords, userCV);

    // Placeholder for summaries
    const strengthsSummary = "Your skills in " + presentKeywords.slice(0,2).join(', ') + " are a great match.";
    const weaknessesSummary = "Consider highlighting experience with " + missingKeywords.slice(0,2).join(', ') + ".";

    logger.info(`Analysis complete for user ${userId}. Match Score: ${matchScore}, ATS Score: ${atsAssessment.score}`);

    const result: JobAnalysisResult = {
      matchScore,
      presentKeywords,
      missingKeywords,
      strengthsSummary,
      weaknessesSummary,
      rawKeywords: validatedExtractedData.keywords,
      jobRequirements: validatedExtractedData, // Return the validated extracted data
      submittedAt: new Date().toISOString(),
      atsScore: atsAssessment.score,
      atsSuggestions: atsAssessment.suggestions,
      atsQualitativeRating: atsAssessment.qualitativeRating,
      atsBreakdown: atsAssessment.breakdown,
    };

    // Story 3.6: Validate output at service boundary before caching/returning
    const validatedResult = JobAnalysisResultSchema.parse(result);

    // 2. Store result in cache
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(validatedResult));
    logger.info(`Job description analysis cached: ${cacheKey}`);

    return validatedResult;
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


