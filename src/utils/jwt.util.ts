// src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';
import { AppError } from './errors.util'; // Assuming AppError exists

// Require JWT secrets - fail fast if not configured
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET environment variable is not set');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('FATAL: REFRESH_TOKEN_SECRET environment variable is not set');
}

export interface JwtPayload {
  userId: string; // UUID from database
}

export const jwtService = {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // 15 minutes
  },

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // 7 days
  },

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired access token', 401);
    }
  },

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  },
};