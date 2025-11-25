// src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';
import { AppError } from './errors.util'; // Assuming AppError for custom errors

// Define the shape of the JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'supersecretaccesskey'; // TODO: Use strong, unique keys
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'supersecretrefreshkey'; // TODO: Use strong, unique keys

export const signJWT = (payload: JWTPayload, expiresIn: string, type: 'access' | 'refresh' = 'access'): string => {
  const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJWT = (token: string, type: 'access' | 'refresh' = 'access'): JWTPayload => {
  const secret = type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};
