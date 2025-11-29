// src/routes/application.routes.ts
import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  generateTailoredCvSchema,
  generateCoverLetterSchema,
  getApplicationSchema,
  updateApplicationSchema,
} from '../validators/application.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/applications/generate-cv - Generate tailored CV
router.post(
  '/generate-cv',
  validate(generateTailoredCvSchema),
  applicationController.generateTailoredCV
);

// POST /api/v1/applications/generate-cover-letter - Generate cover letter
router.post(
  '/generate-cover-letter',
  validate(generateCoverLetterSchema),
  applicationController.generateCoverLetter
);

// GET /api/v1/applications - Get all user applications
router.get('/', applicationController.getUserApplications);

// GET /api/v1/applications/:id - Get specific application
router.get(
  '/:id',
  validate(getApplicationSchema),
  applicationController.getApplication
);

// PATCH /api/v1/applications/:id - Update application content
router.patch(
  '/:id',
  validate(updateApplicationSchema),
  applicationController.updateApplication
);

export default router;
