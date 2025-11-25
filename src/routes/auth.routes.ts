import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Define POST /register route
router.post(
  '/register',
  authLimiter, // Apply rate limiting
  validate(registerSchema), // Apply validation
  authController.register
);

// Define POST /login route
router.post(
  '/login',
  authLimiter, // Apply rate limiting to login as well
  validate(loginSchema), // Apply validation for login
  authController.login
);

// Define POST /logout route
router.post(
  '/logout',
  authController.logout
);

export default router;
