import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service'; // Assuming userService exists

// Extend Request type to include user, from auth middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string }; // Minimal user info from JWT payload
}

export const userController = {
  /**
   * Handles updating a user's profile information.
   * @param req The Express request object with user ID from authentication.
   * @param res The Express response object.
   * @param next The Express next middleware function.
   */
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { firstName, lastName, phoneNumber } = req.body;
      const updatedUser = await userService.updateProfile(userId, { firstName, lastName, phoneNumber });

      res.status(200).json({
        message: 'Profile updated successfully',
        profile: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phoneNumber: updatedUser.phoneNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles retrieving a user's profile information.
   * @param req The Express request object with user ID from authentication.
   * @param res The Express response object.
   * @param next The Express next middleware function.
   */
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const profile = await userService.getProfile(userId);

      res.status(200).json({
        profile,
      });
    } catch (error) {
      next(error);
    }
  },
};
