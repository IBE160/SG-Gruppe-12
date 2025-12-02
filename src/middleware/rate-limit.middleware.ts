import rateLimit, { Store } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { SendCommandFn } from 'rate-limit-redis';

// Rate limit configuration values
export const rateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  ai: {
    windowMs: 15 * 60 * 1000,
    max: 10,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
};

// Helper function to create a new store instance based on the environment
const createStore = (): Store | undefined => {
  if (process.env.NODE_ENV === 'test') {
    return undefined;
  }
  return new RedisStore({
    sendCommand: (...args: string[]) => (redis as any).call(...args),
  });
};

// General rate limit (all endpoints)
export const generalLimiter = rateLimit({
  store: createStore(),
  windowMs: rateLimitConfig.general.windowMs,
  max: rateLimitConfig.general.max,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limit (expensive operations)
export const aiLimiter = rateLimit({
  store: createStore(),
  windowMs: rateLimitConfig.ai.windowMs,
  max: rateLimitConfig.ai.max,
  message: 'AI processing limit reached, please try again later',
});

// Auth rate limit (prevent brute force)
export const authLimiter = rateLimit({
  store: createStore(),
  windowMs: rateLimitConfig.auth.windowMs,
  max: rateLimitConfig.auth.max,
  message: 'Too many login attempts, please try again later',
});
