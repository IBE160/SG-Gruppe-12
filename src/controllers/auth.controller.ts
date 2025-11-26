import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * Handles user registration requests.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next middleware function.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Call the auth service to register the user
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId: user.id, // Return the user ID (UUID)
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles user login requests.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next middleware function.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const { user, accessToken, refreshToken } = await authService.login({ email, password });

      // Set HTTP-only cookies for access and refresh tokens
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'lax', // Lax for CSRF protection
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: 'Login successful',
        userId: user.id, // Return user ID
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles user logout requests.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next middleware function.
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear HTTP-only cookies by setting them to expire immediately
      res.cookie('access_token', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.cookie('refresh_token', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

      await authService.logout(); // Call the service for any server-side logout logic

      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  },

  // Other authentication-related controllers will go here
};