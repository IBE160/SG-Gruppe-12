import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { UnauthorizedError } from '../utils/errors.util';

/**
 * Extracts and validates the user ID from the authenticated request.
 * @throws UnauthorizedError if userId is missing or invalid
 */
function getUserId(req: AuthRequest): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return userId;
}

/**
 * Maps user data to a safe profile response object.
 */
function toProfileResponse(user: { id: string; email: string; firstName: string | null; lastName: string | null; phoneNumber: string | null }) {
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
        success: true,
        message: 'Profile updated successfully',
        data: toProfileResponse(updatedUser),
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
        success: true,
        data: toProfileResponse(profile),
      });
    } catch (error) {
      next(error);
    }
  },
};
