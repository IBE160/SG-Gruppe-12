import { Router } from 'express';
import { cvController } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware'; // Assuming this exists
import { cvUploadMiddleware } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware'; // Assuming validate middleware exists
import { createCVInputSchema as createCVSchema, experienceEntrySchema, educationEntrySchema, skillEntrySchema, languageEntrySchema } from '../validators/cv.validator'; // Import all Zod schemas
import { z } from 'zod'; // Import z from zod for custom schemas

const router = Router();

// Route for AI-powered CV parsing from file upload
router.post(
  '/parse',
  authenticate, // Authenticate user
  cvUploadMiddleware, // Handle file upload with Multer
  cvController.parseAndCreate // Process the uploaded file
);

// Example routes for other CV operations (from architecture docs)
router.post(
  '/',
  authenticate,
  validate(z.object({ body: createCVSchema })), // Validate body for creating a full CV
  cvController.create
);

// GET /api/v1/cvs - Get all user's CVs
router.get(
  '/',
  authenticate,
  cvController.getAll
);

router.get(
  '/:id',
  authenticate,
  cvController.getById
);

// Routes for Work Experience management
router.post(
  '/:cvId/experience',
  authenticate,
  validate(z.object({ body: experienceEntrySchema })), // Validate new experience entry
  cvController.addExperience
);

router.patch(
  '/:cvId/experience/:experienceIndex',
  authenticate,
  validate(z.object({ body: experienceEntrySchema.partial() })), // Allow partial updates for experience entry
  cvController.updateExperience
);

router.delete(
  '/:cvId/experience/:experienceIndex',
  authenticate,
  cvController.deleteExperience
);

// Routes for Education management
router.post(
  '/:cvId/education',
  authenticate,
  validate(z.object({ body: educationEntrySchema })),
  cvController.addEducation
);

router.patch(
  '/:cvId/education/:educationIndex',
  authenticate,
  validate(z.object({ body: educationEntrySchema.partial() })),
  cvController.updateEducation
);

router.delete(
  '/:cvId/education/:educationIndex',
  authenticate,
  cvController.deleteEducation
);

// Routes for Skills management
const skillBodySchema = z.object({
  body: skillEntrySchema,
});

router.post(
  '/:cvId/skills',
  authenticate,
  validate(skillBodySchema),
  cvController.addSkill
);

router.patch(
  '/:cvId/skills/:skillIndex',
  authenticate,
  validate(skillBodySchema), // When updating, the new skill string is provided
  cvController.updateSkill
);

router.delete(
  '/:cvId/skills/:skillIndex',
  authenticate,
  cvController.deleteSkill
);

// Routes for Languages management
router.post(
  '/:cvId/languages',
  authenticate,
  validate(z.object({ body: languageEntrySchema })),
  cvController.addLanguage
);

router.patch(
  '/:cvId/languages/:languageIndex',
  authenticate,
  validate(z.object({ body: languageEntrySchema.partial() })),
  cvController.updateLanguage
);

router.delete(
  '/:cvId/languages/:languageIndex',
  authenticate,
  cvController.deleteLanguage
);

// --- Document Generation Routes ---

// Route to trigger the document generation job
router.get(
  '/:cvId/download/:format',
  authenticate,
  validate(z.object({
    params: z.object({
      cvId: z.string().transform(v => parseInt(v, 10)),
      format: z.enum(['pdf', 'docx']),
    }),
  })),
  cvController.requestDocument
);

// Route to check the status of a generation job
router.get(
  '/download/status/:jobId',
  authenticate,
  validate(z.object({
    params: z.object({
      jobId: z.string(),
    }),
  })),
  cvController.getJobStatus
);

// Route to download the generated file
router.get(
  '/download/file/:jobId',
  authenticate,
  validate(z.object({
    params: z.object({
      jobId: z.string(),
    }),
  })),
  cvController.downloadFile
);

// --- CV Versioning Routes ---
router.get(
  '/:cvId/versions',
  authenticate,
  validate(z.object({
    params: z.object({
      cvId: z.string().transform(v => parseInt(v, 10)),
    }),
  })),
  cvController.listCvVersions
);

router.get(
  '/:cvId/versions/:versionNumber',
  authenticate,
  validate(z.object({
    params: z.object({
      cvId: z.string().transform(v => parseInt(v, 10)),
      versionNumber: z.string().transform(v => parseInt(v, 10)),
    }),
  })),
  cvController.getCvVersionDetails
);

router.post(
  '/:cvId/restore-version/:versionNumber',
  authenticate,
  validate(z.object({
    params: z.object({
      cvId: z.string().transform(v => parseInt(v, 10)),
      versionNumber: z.string().transform(v => parseInt(v, 10)),
    }),
  })),
  cvController.restoreCvVersion
);

export default router;
