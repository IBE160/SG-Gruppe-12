// src/routes/user.routes.ts
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { profileSchema } from '../validators/user.validator';

const router = Router();

// Protect all routes with authentication middleware
router.use(authenticate); // All routes below this will require authentication

// GET /api/v1/profile - Get user profile
router.get(
  '/',
  userController.getProfile
);

// POST /api/v1/profile - Update user profile
router.post(
  '/',
  validate(profileSchema), // profileSchema is already wrapped with {body, query, params}
  userController.updateProfile
);

export default router;
