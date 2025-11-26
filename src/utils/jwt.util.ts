// src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';
import { AppError } from './errors.util'; // Assuming AppError exists

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

export interface JwtPayload {
  userId: number;
}

export const jwtService = {
  generateAccessToken(userId: number): string {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // 15 minutes
  },

  generateRefreshToken(userId: number): string {
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