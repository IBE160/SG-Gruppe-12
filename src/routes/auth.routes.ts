// src/routes/auth.routes.ts
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator'; // Import loginSchema

const router = Router();

router.post(
  '/register',
  authLimiter, // Apply rate limiting
  validate(registerSchema), // Validate request body
  authController.register
);

router.post(
  '/login',
  authLimiter, // Apply rate limiting to login
  validate(loginSchema), // Validate login credentials
  authController.login
);

router.post(
  '/logout',
  authController.logout // No validation or rate limiting needed for logout
);

export default router;