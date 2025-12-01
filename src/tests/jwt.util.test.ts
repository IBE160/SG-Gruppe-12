// src/tests/jwt.util.test.ts
import * as jwt from 'jsonwebtoken';
import { jwtService, JwtPayload } from '@/utils/jwt.util';
import { AppError } from '../utils/errors.util';

// Mock environment variables
const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...ORIGINAL_ENV };
  process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
  process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('JWT Utility', () => {
  const mockUserId = 'clsy96f0100001a1d6n8u2g2t';

  describe('generateAccessToken', () => {
    it('should generate a valid access token with 15 minute expiry', () => {
      const token = jwtService.generateAccessToken(mockUserId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      // Verify expiry is approximately 15 minutes (900 seconds)
      const expiryDuration = decoded.exp - decoded.iat;
      expect(expiryDuration).toBe(900);
    });

    it('should create unique tokens for different user IDs', () => {
      const token1 = jwtService.generateAccessToken('clsy96f0100001a1d6n8u2g2t');
      const token2 = jwtService.generateAccessToken('clsy96f0100001a1d6n8u2g2u');
      expect(token1).not.toBe(token2);

      const decoded1 = jwt.decode(token1) as any;
      const decoded2 = jwt.decode(token2) as any;
      expect(decoded1.userId).toBe('clsy96f0100001a1d6n8u2g2t');
      expect(decoded2.userId).toBe('clsy96f0100001a1d6n8u2g2u');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token with 7 day expiry', () => {
      const token = jwtService.generateRefreshToken(mockUserId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      // Verify expiry is approximately 7 days (604800 seconds)
      const expiryDuration = decoded.exp - decoded.iat;
      expect(expiryDuration).toBe(604800);
    });

    it('should create unique tokens for different user IDs', () => {
      const token1 = jwtService.generateRefreshToken('1');
      const token2 = jwtService.generateRefreshToken('2');
      expect(token1).not.toBe(token2);

      const decoded1 = jwt.decode(token1) as any;
      const decoded2 = jwt.decode(token2) as any;
      expect(decoded1.userId).toBe('1');
      expect(decoded2.userId).toBe('2');
    });
  });

  describe('verifyAccessToken', () => {
    it('should successfully verify a valid access token', () => {
      const token = jwtService.generateAccessToken(mockUserId);
      const payload = jwtService.verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(mockUserId);
    });

    it('should throw AppError for invalid token signature', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxNzAwMDAwMDAwfQ.invalid_signature';

      expect(() => {
        jwtService.verifyAccessToken(invalidToken);
      }).toThrow(AppError);

      expect(() => {
        jwtService.verifyAccessToken(invalidToken);
      }).toThrow('Invalid or expired access token');
    });

    it('should throw AppError for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt';

      expect(() => {
        jwtService.verifyAccessToken(malformedToken);
      }).toThrow(AppError);
    });

    it('should throw AppError for expired token', () => {
      // Generate token with past expiry
      const expiredToken = jwt.sign(
        { userId: mockUserId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '-1s' } // Already expired
      );

      expect(() => {
        jwtService.verifyAccessToken(expiredToken);
      }).toThrow(AppError);

      expect(() => {
        jwtService.verifyAccessToken(expiredToken);
      }).toThrow('Invalid or expired access token');
    });

    it('should throw AppError for token signed with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: mockUserId },
        'wrong_secret',
        { expiresIn: '15m' }
      );

      expect(() => {
        jwtService.verifyAccessToken(tokenWithWrongSecret);
      }).toThrow(AppError);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should successfully verify a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockUserId);
      const payload = jwtService.verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(mockUserId);
    });

    it('should throw AppError for invalid token signature', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiZXhwIjoxNzAwMDAwMDAwfQ.invalid_signature';

      expect(() => {
        jwtService.verifyRefreshToken(invalidToken);
      }).toThrow(AppError);

      expect(() => {
        jwtService.verifyRefreshToken(invalidToken);
      }).toThrow('Invalid or expired refresh token');
    });

    it('should throw AppError for expired refresh token', () => {
      // Generate token with past expiry
      const expiredToken = jwt.sign(
        { userId: mockUserId },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '-1s' } // Already expired
      );

      expect(() => {
        jwtService.verifyRefreshToken(expiredToken);
      }).toThrow(AppError);

      expect(() => {
        jwtService.verifyRefreshToken(expiredToken);
      }).toThrow('Invalid or expired refresh token');
    });

    it('should throw AppError for token signed with wrong secret', () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: mockUserId },
        'wrong_secret',
        { expiresIn: '7d' }
      );

      expect(() => {
        jwtService.verifyRefreshToken(tokenWithWrongSecret);
      }).toThrow(AppError);
    });

    it('should throw AppError for access token used as refresh token', () => {
      // Generate access token but try to verify as refresh token
      const accessToken = jwtService.generateAccessToken(mockUserId);

      expect(() => {
        jwtService.verifyRefreshToken(accessToken);
      }).toThrow(AppError);
    });
  });

  describe('Token payload structure', () => {
    it('should have correct payload structure for access tokens', () => {
      const token = jwtService.generateAccessToken(mockUserId);
      const decoded = jwt.decode(token) as JwtPayload & { exp: number; iat: number };

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.userId).toBe(mockUserId);
    });

    it('should have correct payload structure for refresh tokens', () => {
      const token = jwtService.generateRefreshToken(mockUserId);
      const decoded = jwt.decode(token) as JwtPayload & { exp: number; iat: number };

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.userId).toBe(mockUserId);
    });
  });
});
