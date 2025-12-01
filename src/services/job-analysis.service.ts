// src/services/job-analysis.service.ts
import { prisma } from '../config/database';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { AnalyzeJobDescriptionInput } from '../validators/job.validator';
import { KeywordExtractionService, ExtractedJobData } from './KeywordExtractionService'; // Import the new service and type
import { redis } from '../config/redis'; // Import Redis client
import crypto from 'crypto'; // For generating cache keys

// Define cache TTL (Time To Live) in seconds
const CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Helper function to generate a unique cache key for a job description
const generateCacheKey = (jobDescription: string): string => {
  return `job_analysis:${crypto.createHash('sha256').update(jobDescription).digest('hex')}`;
};

// Placeholder for CV data - in a real app, this would be fetched from a CV service
const getUserCVData = async (userId: string) => {
  // Mock CV data for now. In later stories, this will come from cv.service
  return {
    skills: ['TypeScript', 'React', 'Next.js', 'MongoDB', 'Agile'],
    experienceYears: 4,
    education: 'Bachelors degree in Computer Science or related field',
  };
};

export const jobAnalysisService = {
  async analyzeJobDescription(userId: string, jobDescription: string, cvId?: string) {
    if (!jobDescription || jobDescription.length < 10) {
      logger.warn(`User ${userId} submitted an invalid job description.`);
      throw new AppError('Invalid job description provided.', 400);
    }

    logger.info(`User ${userId} started job description analysis.`);

    const cacheKey = generateCacheKey(jobDescription);

    // 1. Check cache for existing analysis
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      logger.info(`Cache hit for job description analysis: ${cacheKey}`);
      // Return cached result after parsing
      return JSON.parse(cachedResult);
    }

    logger.info(`Cache miss for job description analysis: ${cacheKey}. Performing AI extraction.`);

    const userCV = await getUserCVData(userId);

    // Use the KeywordExtractionService to get structured job data
    const extractedJobData: ExtractedJobData = await KeywordExtractionService.extractKeywords(jobDescription);

    // For now, we'll use the 'keywords' array from the extracted data for matching
    // and a mock 'requiredExperience' and 'education' from extracted data
    const aiAnalysisKeywords = extractedJobData.keywords;
    const aiAnalysisSkills = extractedJobData.skills; // Might be used later
    const aiAnalysisQualifications = extractedJobData.qualifications; // Might be used later

    // --- Perform Analysis ---
    // 1. Match Score Calculation (simple example using extracted keywords)
    const matchingKeywords = userCV.skills.filter(skill => aiAnalysisKeywords.includes(skill));
    const matchScore = Math.min(100, Math.round((matchingKeywords.length / aiAnalysisKeywords.length) * 100));

    // 2. ATS Score Calculation (heuristic example using extracted keywords)
    let atsScore = 50; // Base score
    if (jobDescription.length > 500) atsScore += 10;
    if (aiAnalysisKeywords.length > 5) atsScore += 15;
    if (matchingKeywords.length > 3) atsScore += 25;
    atsScore = Math.min(100, atsScore);

    // 3. Gap Analysis
    const missingKeywords = aiAnalysisKeywords.filter(keyword => !userCV.skills.includes(keyword));
    const experienceGap = userCV.experienceYears < 3 ? 'Less than the required 3+ years of experience.' : null;
    const educationGap = userCV.education !== (aiAnalysisQualifications.find(q => q.toLowerCase().includes('degree')) || userCV.education)
      ? `Expected a different educational background: ${aiAnalysisQualifications.join(', ')}` : null;

    const gapAnalysis = {
      missingSkills: missingKeywords,
      experienceGap,
      educationGap,
      // Include all extracted data for more detailed gap analysis in future stories
      extractedSkills: aiAnalysisSkills,
      extractedQualifications: aiAnalysisQualifications,
      extractedResponsibilities: extractedJobData.responsibilities,
    };

    logger.info(`Analysis complete for user ${userId}. Match Score: ${matchScore}, ATS Score: ${atsScore}`);

    const result = {
      matchScore,
      atsScore,
      gapAnalysis,
      jobRequirements: extractedJobData, // Return the full extracted data
      submittedAt: new Date().toISOString(),
    };

    // 2. Store result in cache
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
    logger.info(`Job description analysis cached: ${cacheKey}`);

    return result;
  },
};
