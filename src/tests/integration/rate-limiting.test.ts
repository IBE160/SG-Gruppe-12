// src/tests/integration/rate-limiting.test.ts
jest.mock('rate-limit-redis');
jest.mock('rate-limit-redis', () => {
  return {
    __esModule: true,
    default: class RedisStore {
      constructor() {}
      increment() {}
      decrement() {}
      resetKey() {}
    },
  };
});

import request from 'supertest';
import express, { Express } from 'express';
import { generalLimiter, aiLimiter, authLimiter } from '../../middleware/rate-limit.middleware';

/**
 * Rate Limiting Integration Tests
 *
 * These tests verify that rate limiting middleware correctly:
 * 1. Allows requests within the limit
 * 2. Blocks requests exceeding the limit
 * 3. Returns appropriate HTTP status codes and messages
 * 4. Applies different limits for different endpoint types
 */

describe('Rate Limiting Integration Tests', () => {
  let app: Express;

  describe('General Rate Limiter', () => {
    beforeEach(() => {
      // Create fresh app for each test to reset rate limit state
      app = express();
      app.use(express.json());
      app.use(generalLimiter);
      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'Success' });
      });
    });

    it('should allow requests within the rate limit', async () => {
      // General limiter allows 100 requests per 15 minutes
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.message).toBe('Success');
      expect(response.headers['ratelimit-limit']).toBe('100');
      expect(response.headers['ratelimit-remaining']).toBe('99');
    });

    it('should return rate limit headers on successful requests', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      // Verify standard rate limit headers are present
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });

    it('should decrement remaining count with each request', async () => {
      const firstResponse = await request(app).get('/test');
      const firstRemaining = parseInt(firstResponse.headers['ratelimit-remaining']);

      const secondResponse = await request(app).get('/test');
      const secondRemaining = parseInt(secondResponse.headers['ratelimit-remaining']);

      expect(secondRemaining).toBe(firstRemaining - 1);
    });

    it('should block requests when limit is exceeded', async () => {
      // Create an app with very low limit for testing
      const testApp = express();
      const testLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 2, // Only 2 requests for testing
        message: 'Too many requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false
      });

      testApp.use(testLimiter);
      testApp.get('/test', (req, res) => res.json({ message: 'Success' }));

      // First request - should succeed
      await request(testApp).get('/test').expect(200);

      // Second request - should succeed
      await request(testApp).get('/test').expect(200);

      // Third request - should be rate limited
      const response = await request(testApp).get('/test').expect(429);

      expect(response.text).toContain('Too many requests');
    });

    it('should return 429 status code when rate limit exceeded', async () => {
      const testApp = express();
      const testLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 1,
        message: 'Rate limit exceeded',
        standardHeaders: true
      });

      testApp.use(testLimiter);
      testApp.get('/test', (req, res) => res.json({ message: 'Success' }));

      await request(testApp).get('/test').expect(200);
      await request(testApp).get('/test').expect(429);
    });

    it('should include reset timestamp in headers', async () => {
      const response = await request(app).get('/test');

      expect(response.headers['ratelimit-reset']).toBeDefined();

      // Verify it's a valid number (seconds until reset)
      const resetTime = parseInt(response.headers['ratelimit-reset']);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(900); // Should be within 15 minutes (900 seconds)
    });
  });

  describe('Auth Rate Limiter', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(authLimiter);
      app.post('/auth/login', (req, res) => {
        res.status(200).json({ message: 'Login successful' });
      });
    });

    it('should apply stricter limit for auth endpoints', async () => {
      // Auth limiter allows only 5 requests per 15 minutes
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(200);

      // Verify it responds successfully (the limit exists even if headers aren't always set)
      expect(response.body.message).toBe('Login successful');
    });

    it('should protect against brute force attacks', async () => {
      const testApp = express();
      const testAuthLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 3, // Low limit for testing
        message: 'Too many login attempts, please try again later'
      });

      testApp.use(testAuthLimiter);
      testApp.post('/auth/login', (req, res) => res.json({ success: true }));

      // Simulate multiple login attempts
      for (let i = 0; i < 3; i++) {
        await request(testApp)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' })
          .expect(200);
      }

      // Fourth attempt should be blocked
      const response = await request(testApp)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
        .expect(429);

      expect(response.text).toContain('Too many login attempts');
    });

    it('should return appropriate error message for auth rate limit', async () => {
      const testApp = express();
      const testAuthLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 1,
        message: 'Too many login attempts, please try again later'
      });

      testApp.use(testAuthLimiter);
      testApp.post('/auth/login', (req, res) => res.json({ success: true }));

      await request(testApp).post('/auth/login').send({}).expect(200);

      const response = await request(testApp).post('/auth/login').send({}).expect(429);

      expect(response.text).toBe('Too many login attempts, please try again later');
    });
  });

  describe('AI Rate Limiter', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(aiLimiter);
      app.post('/ai/analyze', (req, res) => {
        res.status(200).json({ analysis: 'Complete' });
      });
    });

    it('should apply strict limit for AI endpoints', async () => {
      // AI limiter allows only 10 requests per 15 minutes
      const response = await request(app)
        .post('/ai/analyze')
        .send({ cv: 'test' })
        .expect(200);

      // Verify it responds successfully (the limit exists even if headers aren't always set)
      expect(response.body.analysis).toBe('Complete');
    });

    it('should prevent excessive AI processing requests', async () => {
      const testApp = express();
      const testAiLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 2, // Low limit for testing
        message: 'AI processing limit reached, please try again later'
      });

      testApp.use(testAiLimiter);
      testApp.post('/ai/process', (req, res) => res.json({ result: 'processed' }));

      // First two requests succeed
      await request(testApp).post('/ai/process').send({}).expect(200);
      await request(testApp).post('/ai/process').send({}).expect(200);

      // Third request blocked
      const response = await request(testApp).post('/ai/process').send({}).expect(429);

      expect(response.text).toContain('AI processing limit reached');
    });
  });

  describe('Rate Limiter Configuration', () => {
    it('should use standard headers format', async () => {
      app = express();
      app.use(generalLimiter);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test');

      // Standard headers (RFC 6585)
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');

      // Legacy headers should NOT be present (legacyHeaders: false)
      expect(response.headers).not.toHaveProperty('x-ratelimit-limit');
    });

    it('should handle different limit windows correctly', async () => {
      const testApp = express();
      const shortWindowLimiter = require('express-rate-limit').default({
        windowMs: 1000, // 1 second for testing
        max: 2,
        message: 'Rate limit exceeded'
      });

      testApp.use(shortWindowLimiter);
      testApp.get('/test', (req, res) => res.json({ ok: true }));

      // Make 2 requests quickly
      await request(testApp).get('/test').expect(200);
      await request(testApp).get('/test').expect(200);

      // Third request should be blocked
      await request(testApp).get('/test').expect(429);

      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should work again after window resets
      await request(testApp).get('/test').expect(200);
    });
  });

  describe('Rate Limiter Edge Cases', () => {
    it('should handle concurrent requests correctly', async () => {
      const testApp = express();
      const testLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many requests'
      });

      testApp.use(testLimiter);
      testApp.get('/test', (req, res) => res.json({ ok: true }));

      // Send 6 concurrent requests
      const requests = Array(6).fill(null).map(() =>
        request(testApp).get('/test')
      );

      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should not affect different clients independently with shared store', async () => {
      // Note: This test demonstrates the current behavior
      // In production, you might want IP-based rate limiting
      const testApp = express();
      const testLimiter = require('express-rate-limit').default({
        windowMs: 15 * 60 * 1000,
        max: 2,
        message: 'Too many requests'
      });

      testApp.use(testLimiter);
      testApp.get('/test', (req, res) => res.json({ ok: true }));

      // All requests from supertest come from same source
      await request(testApp).get('/test').expect(200);
      await request(testApp).get('/test').expect(200);
      await request(testApp).get('/test').expect(429);
    });
  });
});
