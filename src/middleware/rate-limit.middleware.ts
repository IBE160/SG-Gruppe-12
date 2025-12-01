import rateLimit, { MemoryStore, Store, LegacyStore } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { SendCommandFn } from 'rate-limit-redis';

// Helper function to create a new store instance based on the environment
const createStore = (): Store | LegacyStore => {
  if (process.env.NODE_ENV === 'test') {
    return new MemoryStore();
  } else {
    return new RedisStore({
      sendCommand: redis.call.bind(redis) as SendCommandFn,
    });
  }
};

// General rate limit (all endpoints)
export const generalLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limit (expensive operations)
export const aiLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'AI processing limit reached, please try again later',
});

// Auth rate limit (prevent brute force)
export const authLimiter = rateLimit({
  store: createStore(),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});
