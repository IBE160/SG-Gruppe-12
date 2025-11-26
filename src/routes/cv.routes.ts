import { Router } from 'express';
import { cvController } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware'; // Assuming this exists
import { cvUploadMiddleware } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware'; // Assuming validate middleware exists
import { createCVSchema, updateCVSchema, experienceEntrySchema, educationEntrySchema, skillEntrySchema, languageEntrySchema } from '../validators/cv.validator'; // Import all Zod schemas
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
  validate(createCVSchema), // Validate body for creating a full CV
  cvController.create
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
  validate(experienceEntrySchema), // Validate new experience entry
  cvController.addExperience
);

router.patch(
  '/:cvId/experience/:experienceIndex',
  authenticate,
  validate(experienceEntrySchema.partial()), // Allow partial updates for experience entry
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
  validate(educationEntrySchema),
  cvController.addEducation
);

router.patch(
  '/:cvId/education/:educationIndex',
  authenticate,
  validate(educationEntrySchema.partial()),
  cvController.updateEducation
);

router.delete(
  '/:cvId/education/:educationIndex',
  authenticate,
  cvController.deleteEducation
);

// Routes for Skills management
// For skills, the body is expected to be a simple string, e.g., { "skill": "JavaScript" }
const skillBodySchema = z.object({
  skill: skillEntrySchema,
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
  validate(languageEntrySchema),
  cvController.addLanguage
);

router.patch(
  '/:cvId/languages/:languageIndex',
  authenticate,
  validate(languageEntrySchema.partial()),
  cvController.updateLanguage
);

router.delete(
  '/:cvId/languages/:languageIndex',
  authenticate,
  cvController.deleteLanguage
);

export default router;
