// src/services/job-analysis.service.ts
import { prisma } from '../config/database';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

export const jobAnalysisService = {
  /**
   * Creates a job posting from a job description and returns its ID.
   * This is the first step before generating tailored applications.
   */
  async analyzeJobDescription(userId: string, jobDescription: string, title?: string, company?: string) {
    if (!jobDescription || jobDescription.length < 10) {
      logger.warn(`User ${userId} submitted an invalid job description length.`);
      throw new AppError('Invalid job description provided.', 400);
    }

    logger.info(`User ${userId} submitted job description for analysis. Length: ${jobDescription.length}`);

    // Extract title from first line if not provided
    const extractedTitle = title || this.extractTitle(jobDescription);
    const extractedCompany = company || this.extractCompany(jobDescription);

    // Create job posting in database
    const jobPosting = await prisma.jobPosting.create({
      data: {
        user_id: userId,
        title: extractedTitle,
        company: extractedCompany,
        description: jobDescription,
      },
    });

    logger.info(`Job posting created with ID: ${jobPosting.id} for user ${userId}`);

    return {
      jobPostingId: jobPosting.id,
      title: jobPosting.title,
      company: jobPosting.company,
      createdAt: jobPosting.created_at.toISOString(),
    };
  },

  /**
   * Gets a job posting by ID.
   */
  async getJobPosting(userId: string, jobPostingId: number) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });

    if (!jobPosting) {
      throw new AppError('Job posting not found', 404);
    }

    // Check ownership if user_id is set
    if (jobPosting.user_id && jobPosting.user_id !== userId) {
      throw new AppError('Access denied', 403);
    }

    return jobPosting;
  },

  /**
   * Gets all job postings for a user.
   */
  async getUserJobPostings(userId: string) {
    return prisma.jobPosting.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  },

  /**
   * Extracts a title from the job description (first line or first 50 chars).
   */
  extractTitle(description: string): string {
    const firstLine = description.split('\n')[0].trim();
    if (firstLine.length > 0 && firstLine.length <= 100) {
      return firstLine;
    }
    return description.substring(0, 50).trim() + '...';
  },

  /**
   * Attempts to extract company name from job description.
   */
  extractCompany(description: string): string | undefined {
    // Simple heuristic: look for common patterns
    const patterns = [
      /(?:at|for|with)\s+([A-Z][A-Za-z\s&]+?)(?:\s+is|\s+are|\s+-|,|\.|$)/,
      /([A-Z][A-Za-z\s&]+?)\s+(?:is looking|is hiring|seeks)/,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  },
};
