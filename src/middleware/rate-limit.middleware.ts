// src/middleware/rate-limit.middleware.ts
// Rate limiting middleware with Redis store and audit logging integration

import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Request, Response } from 'express';
import { redis } from '../config/redis';
import { auditService } from '../services/audit.service';
import { getClientIP, getUserAgent } from './audit.middleware';

// Factory to create store instances for rate limiting
// Each limiter needs its own store to avoid sharing issues
function createStore(prefix: string): RedisStore {
  return new RedisStore({
    // @ts-expect-error - Known issue with rate-limit-redis and ioredis types
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });
}

// Rate limit tiers (as per API contracts)
const RATE_LIMITS = {
  general: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 req/15min
  ai: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 req/15min
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 req/15min
};

/**
 * Create a JSON error response for rate limit exceeded (per API contracts)
 */
function createRateLimitResponse(retryAfterSeconds: number, message: string) {
  return {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `${message} Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      retry_after: retryAfterSeconds,
    },
  };
}

/**
 * Handler called when rate limit is exceeded
 * Logs to audit service and returns JSON error
 */
function createRateLimitHandler(limiterType: 'general' | 'ai' | 'auth') {
  return (req: Request, res: Response): void => {
    const retryAfter = Math.ceil(
      (res.getHeader('RateLimit-Reset') as number) || RATE_LIMITS[limiterType].windowMs / 1000
    );

    const ip = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Log rate limit event to audit service (don't await - fire and forget)
    auditService
      .logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        userId: (req as unknown as { user?: { userId?: string } }).user?.userId,
        ipAddress: ip,
        userAgent,
        reason: `${limiterType} rate limit exceeded`,
        endpoint: req.path,
      })
      .catch(() => {
        // Silently fail - don't block response for audit logging
      });

    const messages = {
      general: 'Too many requests.',
      ai: 'AI processing limit reached.',
      auth: 'Too many login attempts.',
    };

    res
      .status(429)
      .setHeader('Retry-After', retryAfter)
      .json(createRateLimitResponse(retryAfter, messages[limiterType]));
  };
}

/**
 * Key generator that uses IP + user ID for authenticated requests
 * This provides per-user rate limiting for authenticated endpoints
 */
function createKeyGenerator(prefix: string) {
  return (req: Request): string => {
    const ip = getClientIP(req);
    const userId = (req as unknown as { user?: { userId?: string } }).user?.userId;

    // Use combination of IP and user ID if authenticated
    if (userId) {
      return `${prefix}:${userId}:${ip}`;
    }

    // Fall back to IP-only for unauthenticated requests
    return `${prefix}:${ip}`;
  };
}

/**
 * Create common options for all rate limiters
 */
function createLimiterOptions(
  limiterType: 'general' | 'ai' | 'auth',
  overrides?: Partial<Options>
): Partial<Options> {
  return {
    store: createStore(limiterType),
    windowMs: RATE_LIMITS[limiterType].windowMs,
    max: RATE_LIMITS[limiterType].max,
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    keyGenerator: createKeyGenerator(limiterType),
    handler: createRateLimitHandler(limiterType),
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    ...overrides,
  };
}

// General rate limit (all endpoints) - 100 req/15min
export const generalLimiter: RateLimitRequestHandler = rateLimit(
  createLimiterOptions('general')
);

// AI endpoint rate limit (expensive operations) - 10 req/15min
export const aiLimiter: RateLimitRequestHandler = rateLimit(
  createLimiterOptions('ai')
);

// Auth rate limit (prevent brute force) - 5 req/15min
export const authLimiter: RateLimitRequestHandler = rateLimit(
  createLimiterOptions('auth')
);

/**
 * Skip rate limiting for certain conditions (e.g., admin users, health checks)
 */
export function createConditionalLimiter(
  limiterType: 'general' | 'ai' | 'auth',
  skipCondition: (req: Request) => boolean
): RateLimitRequestHandler {
  return rateLimit(
    createLimiterOptions(limiterType, {
      skip: skipCondition,
    })
  );
}

/**
 * Create a custom rate limiter with specific limits
 */
export function createCustomLimiter(
  windowMs: number,
  max: number,
  keyPrefix: string
): RateLimitRequestHandler {
  return rateLimit({
    store: createStore(keyPrefix),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: createKeyGenerator(keyPrefix),
    handler: (_req: Request, res: Response) => {
      const retryAfter = Math.ceil(windowMs / 1000);
      res
        .status(429)
        .setHeader('Retry-After', retryAfter)
        .json(createRateLimitResponse(retryAfter, 'Rate limit exceeded.'));
    },
  });
}

// Export rate limit configuration for reference
export const rateLimitConfig = RATE_LIMITS;
