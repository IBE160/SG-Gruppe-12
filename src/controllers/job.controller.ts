// src/controllers/job.controller.ts
import { Request, Response, NextFunction } from 'express';
import { jobAnalysisService } from '../services/job-analysis.service'; // Will be created in a later step
import { AuthRequest } from '../middleware/auth.middleware'; // Assuming AuthRequest is defined here

export const jobController = {
  async analyzeJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobDescription } = req.body;
      const userId = req.user?.id; // Assuming user is authenticated

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
      }

      // For now, just acknowledge receipt. Actual analysis will be in jobAnalysisService.
      const analysisResult = await jobAnalysisService.analyzeJobDescription(userId, jobDescription);

      res.status(200).json({
        success: true,
        message: 'Job description received for analysis.',
        data: analysisResult,
      });
    } catch (error) {
      next(error);
    }
  },
};
