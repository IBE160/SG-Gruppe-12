// src/routes/job.routes.ts
import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiLimiter } from '../middleware/rate-limit.middleware';
import { analyzeJobDescriptionSchema } from '../validators/job.validator'; // Will be created in a later step

const router = Router();

router.post(
  '/analyze',
  authenticate,
  aiLimiter,
  validate(analyzeJobDescriptionSchema),
  jobController.analyzeJob
);

export default router;
