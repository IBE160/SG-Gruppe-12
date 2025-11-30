// src/controllers/job.controller.ts
import { Response, NextFunction } from 'express';
import { jobAnalysisService } from '../services/job-analysis.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const jobController = {
  /**
   * POST /api/v1/jobs/analyze
   * Creates a job posting from a job description.
   */
  async analyzeJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobDescription, title, company } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      const result = await jobAnalysisService.analyzeJobDescription(userId, jobDescription, title, company);

      res.status(201).json({
        message: 'Job posting created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/jobs
   * Gets all job postings for the authenticated user.
   */
  async getJobPostings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      const jobPostings = await jobAnalysisService.getUserJobPostings(userId);

      res.status(200).json({
        data: jobPostings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/jobs/:id
   * Gets a specific job posting by ID.
   */
  async getJobPosting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const jobPostingId = parseInt(req.params.id, 10);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      if (isNaN(jobPostingId)) {
        return res.status(400).json({ message: 'Invalid job posting ID' });
      }

      const jobPosting = await jobAnalysisService.getJobPosting(userId, jobPostingId);

      res.status(200).json({
        data: jobPosting,
      });
    } catch (error) {
      next(error);
    }
  },
};
