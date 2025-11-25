import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes'; // Import user routes

const router = Router();

// Define API routes
router.use('/auth', authRoutes); // All auth routes will be under /api/v1/auth
router.use('/profile', userRoutes); // All user profile routes will be under /api/v1/profile

export default router;