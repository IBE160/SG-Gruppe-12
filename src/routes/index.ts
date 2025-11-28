import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes'; // Import user routes
import cvRoutes from './cv.routes'; // Import cv routes
import jobRoutes from './job.routes'; // Import job routes

const router = Router();

// Define API routes
router.use('/auth', authRoutes); // All auth routes will be under /api/v1/auth
router.use('/profile', userRoutes); // All user profile routes will be under /api/v1/profile
router.use('/cvs', cvRoutes); // All CV routes will be under /api/v1/cvs
router.use('/jobs', jobRoutes); // All job routes will be under /api/v1/jobs

export default router;