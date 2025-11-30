// src/routes/job.routes.ts
import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiLimiter } from '../middleware/rate-limit.middleware';
import { analyzeJobDescriptionSchema } from '../validators/job.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/jobs/analyze - Create job posting from description
router.post(
  '/analyze',
  aiLimiter,
  validate(analyzeJobDescriptionSchema),
  jobController.analyzeJob
);

// GET /api/v1/jobs - Get all user's job postings
router.get('/', jobController.getJobPostings);

// GET /api/v1/jobs/:id - Get specific job posting
router.get('/:id', jobController.getJobPosting);

export default router;
