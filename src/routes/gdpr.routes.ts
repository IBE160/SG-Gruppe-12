// src/routes/gdpr.routes.ts
import { Router } from 'express';
import { gdprController } from '../controllers/gdpr.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { deleteAccountSchema, updateConsentsSchema } from '../validators/gdpr.validator';

const router = Router();

// All GDPR routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/gdpr/export
 * Export all user data (GDPR Right to Access)
 */
router.get('/export', gdprController.exportData);

/**
 * GET /api/v1/gdpr/data-summary
 * Get summary of stored data
 */
router.get('/data-summary', gdprController.getDataSummary);

/**
 * DELETE /api/v1/gdpr/delete-account
 * Permanently delete account and all data (GDPR Right to be Forgotten)
 */
router.delete(
  '/delete-account',
  validate(deleteAccountSchema),
  gdprController.deleteAccount
);

/**
 * GET /api/v1/gdpr/consents
 * Get current consent preferences
 */
router.get('/consents', gdprController.getConsents);

/**
 * PATCH /api/v1/gdpr/consents
 * Update consent preferences
 */
router.patch(
  '/consents',
  validate(updateConsentsSchema),
  gdprController.updateConsents
);

export default router;
