// src/tests/auth.service.test.ts

// Set env vars BEFORE any imports
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret_for_testing';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret_for_testing';

// Mock Prisma BEFORE imports
jest.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock Redis BEFORE imports
jest.mock('../config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    sadd: jest.fn(),
    expire: jest.fn(),
    on: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('../repositories/user.repository');
jest.mock('../utils/password.util');
jest.mock('../services/email.service');
jest.mock('../utils/jwt.util');

import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { emailService } from '../services/email.service';
import { jwtService } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/errors.util';
import { User } from '@prisma/client';

describe('Auth Service', () => {
  const mockUser: User = { // Define mockUser based on Prisma's User type
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password_hash: 'hashedPassword123',
    created_at: new Date(),
    updated_at: new Date(),
    consent_essential: true,
    consent_ai_training: false,
    consent_marketing: false,
    emailVerificationToken: null,
    emailVerified: true,
    firstName: null,
    lastName: null,
    phoneNumber: null,
  };

  const mockUserReturned = { // Define mock user as it would be returned by the service
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    emailVerified: mockUser.emailVerified,
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    phoneNumber: mockUser.phoneNumber,
    consent_essential: mockUser.consent_essential,
    consent_ai_training: mockUser.consent_ai_training,
    consent_marketing: mockUser.consent_marketing,
    created_at: mockUser.created_at,
    updated_at: mockUser.updated_at,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user, hash password, create user in repo, and send verification email', async () => {
      const mockUserData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        consent_ai_training: true,
        consent_marketing: false,
      };
      const hashedPassword = 'hashedPassword123';

      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(mockUserData);

      expect(hashPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockUserData.name,
          email: mockUserData.email,
          password_hash: hashedPassword,
          consent_essential: true,
          consent_ai_training: true,
          consent_marketing: false,
          emailVerificationToken: expect.any(String),
          emailVerified: false,
        })
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', email: mockUserData.email }),
        expect.any(String)
      );
      expect(result).toEqual(mockUserReturned);
    });

    it('should handle default consent values if not provided', async () => {
        const mockUserData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
        };
        const hashedPassword = 'hashedPassword123';

        (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        const result = await authService.register(mockUserData);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_ai_training: false,
            consent_marketing: false,
          })
        );
        expect(result).toEqual(mockUserReturned);
      });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'john.doe@example.com',
      password: 'Password123!',
    };
    const mockAccessToken = 'mockAccessToken';
    const mockRefreshToken = 'mockRefreshToken';

    it('should successfully log in a user and return tokens', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtService.generateAccessToken as jest.Mock).mockReturnValue(mockAccessToken);
      (jwtService.generateRefreshToken as jest.Mock).mockReturnValue(mockRefreshToken);
      (userRepository.updateLastLogin as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login(mockLoginData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockLoginData.email);
      expect(comparePassword).toHaveBeenCalledWith(mockLoginData.password, mockUser.password_hash);
      expect(jwtService.generateAccessToken).toHaveBeenCalledWith(mockUser.id, 'USER');
      expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(mockUser.id, 'USER');
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ user: mockUserReturned, accessToken: mockAccessToken, refreshToken: mockRefreshToken });
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockLoginData)).rejects.toThrow(UnauthorizedError);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockLoginData.email);
      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockLoginData)).rejects.toThrow(UnauthorizedError);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockLoginData.email);
      expect(comparePassword).toHaveBeenCalledWith(mockLoginData.password, mockUser.password_hash);
      expect(jwtService.generateAccessToken).not.toHaveBeenCalled();
    });
  });
});
