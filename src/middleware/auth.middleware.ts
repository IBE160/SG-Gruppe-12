import { Request, Response, NextFunction } from 'express';
import { verifyJWT, JWTPayload } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/errors.util'; // Assuming UnauthorizedError exists

// Extend Express Request interface to include user property
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from HTTP-only cookie
    const token = req.cookies.access_token; // Assumes access_token cookie is set

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify JWT
    const payload = verifyJWT(token, 'access');

    // Attach user payload to the request
    req.user = payload;

    next();
  } catch (error) {
    // If token verification fails, or token is missing, pass an UnauthorizedError
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
