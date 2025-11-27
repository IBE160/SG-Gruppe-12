import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../utils/errors.util';

/**
 * Extracts and validates the user ID from the authenticated request.
 * @throws UnauthorizedError if userId is missing or invalid
 */
function getUserId(req: AuthRequest): number {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
  const numericId = parseInt(userId, 10);
  if (isNaN(numericId)) {
    throw new UnauthorizedError('Invalid user ID');
  }
  return numericId;
}

/**
 * Maps user data to a safe profile response object.
 */
function toProfileResponse(user: { id: number; email: string; firstName: string | null; lastName: string | null; phoneNumber: string | null }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
  };
}

export const userController = {
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { firstName, lastName, phoneNumber } = req.body;

      const updatedUser = await userService.updateProfile(userId, { firstName, lastName, phoneNumber });

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: toProfileResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const profile = await userService.getProfile(userId);

      res.status(200).json({
        profile: toProfileResponse(profile),
      });
    } catch (error) {
      next(error);
    }
  },
};
