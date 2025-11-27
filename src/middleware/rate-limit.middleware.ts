import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';

// Configure the store for rate limiting
const store = new RedisStore({
  // @ts-expect-error - Known issue with rate-limit-redis and ioredis types
  sendCommand: (...args: string[]) => redis.call(...args),
});

// General rate limit (all endpoints)
export const generalLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limit (expensive operations)
export const aiLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'AI processing limit reached, please try again later',
});

// Auth rate limit (prevent brute force)
export const authLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});
