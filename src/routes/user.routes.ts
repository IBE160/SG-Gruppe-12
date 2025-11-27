// src/routes/user.routes.ts
import { z } from 'zod';
import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware'; // Will create this middleware soon
import { validate } from '../middleware/validate.middleware'; // Assuming validate middleware exists
import { profileSchema } from '../validators/user.validator'; // Will create this validator soon

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
  validate(z.object({ body: profileSchema })), // Correctly wrap schema for body validation
  userController.updateProfile
);

export default router;
