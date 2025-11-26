// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { jwtService, JwtPayload } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/errors.util';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.access_token;
    if (!accessToken) {
      throw new UnauthorizedError('No access token provided');
    }

    const payload = jwtService.verifyAccessToken(accessToken);
    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};