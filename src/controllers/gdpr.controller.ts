// src/controllers/gdpr.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { gdprService } from '../services/gdpr.service';
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

export const gdprController = {
  /**
   * GET /api/v1/gdpr/export
   * Exports all user data for GDPR Right to Access.
   */
  async exportData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await gdprService.exportUserData(userId);

      res.status(200).json({
        message: 'Data export successful',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/gdpr/data-summary
   * Gets a summary of what data is stored for the user.
   */
  async getDataSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const summary = await gdprService.getDataSummary(userId);

      res.status(200).json({
        message: 'Data summary retrieved',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/gdpr/delete-account
   * Permanently deletes all user data (Right to be Forgotten).
   */
  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { confirmDelete } = req.body;

      // Require explicit confirmation
      if (confirmDelete !== true) {
        return res.status(400).json({
          message: 'Please confirm deletion by setting confirmDelete to true',
        });
      }

      const result = await gdprService.deleteUserAccount(userId);

      // Clear auth cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.status(200).json({
        message: 'Account and all associated data permanently deleted',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/gdpr/consents
   * Gets current consent preferences.
   */
  async getConsents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const consents = await gdprService.getConsents(userId);

      res.status(200).json({
        message: 'Consent preferences retrieved',
        data: consents,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/gdpr/consents
   * Updates consent preferences.
   */
  async updateConsents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { aiTraining, marketing } = req.body;

      const updatedConsents = await gdprService.updateConsents(userId, {
        aiTraining,
        marketing,
      });

      res.status(200).json({
        message: 'Consent preferences updated',
        data: updatedConsents,
      });
    } catch (error) {
      next(error);
    }
  },
};
