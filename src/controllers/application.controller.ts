// src/controllers/application.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { applicationService } from '../services/application.service';
import { UnauthorizedError } from '../utils/errors.util';

/**
 * Extracts and validates the user ID from the authenticated request.
 */
function getUserId(req: AuthRequest): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return userId;
}

export const applicationController = {
  /**
   * POST /api/v1/applications/generate-cv
   * Generates a tailored CV based on user's CV and job posting.
   */
  async generateTailoredCV(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { cvId, jobPostingId } = req.body;

      const result = await applicationService.generateTailoredCV(userId, cvId, jobPostingId);

      res.status(200).json({
        message: 'Tailored CV generated successfully',
        applicationId: result.applicationId,
        tailoredCv: result.tailoredCv,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/applications/generate-cover-letter
   * Generates a personalized cover letter.
   */
  async generateCoverLetter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { cvId, jobPostingId, options } = req.body;

      const result = await applicationService.generateCoverLetter(
        userId,
        cvId,
        jobPostingId,
        options
      );

      res.status(200).json({
        message: 'Cover letter generated successfully',
        applicationId: result.applicationId,
        coverLetter: result.coverLetter,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/applications/:id
   * Retrieves a specific application by ID.
   */
  async getApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const applicationId = parseInt(req.params.id, 10);

      if (isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
      }

      const application = await applicationService.getApplication(userId, applicationId);

      res.status(200).json({
        application,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/applications
   * Retrieves all applications for the authenticated user.
   */
  async getUserApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);

      const applications = await applicationService.getUserApplications(userId);

      res.status(200).json({
        applications,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/applications/:id
   * Updates user-edited content for an application.
   */
  async updateApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const applicationId = parseInt(req.params.id, 10);

      if (isNaN(applicationId)) {
        return res.status(400).json({ message: 'Invalid application ID' });
      }

      const { generatedCvContent, generatedApplicationContent } = req.body;

      const updated = await applicationService.updateApplication(userId, applicationId, {
        generatedCvContent,
        generatedApplicationContent,
      });

      res.status(200).json({
        message: 'Application updated successfully',
        application: {
          id: updated.id,
          updatedAt: updated.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
