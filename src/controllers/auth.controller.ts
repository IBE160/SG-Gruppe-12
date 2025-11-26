// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, consent_ai_training, consent_marketing } = req.body;

      const newUser = await authService.register({
        name,
        email,
        password,
        consent_ai_training,
        consent_marketing,
      });

      // Respond with success and basic user info (exclude password hash)
      res.status(201).json({
        success: true,
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        message: 'User registered successfully. Please check your email for verification (if enabled).',
      });
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  },
};
