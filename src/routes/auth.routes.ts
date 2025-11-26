// src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { registerSchema } from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  authLimiter, // Apply rate limiting
  validate(registerSchema), // Validate request body
  authController.register
);

export default router;