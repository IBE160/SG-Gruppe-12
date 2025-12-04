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
    passwordHash: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date(),
    consentEssential: true,
    consentAiTraining: false,
    consentMarketing: false,
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
    consentEssential: mockUser.consentEssential,
    consentAiTraining: mockUser.consentAiTraining,
    consentMarketing: mockUser.consentMarketing,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
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
        consentAiTraining: true,
        consentMarketing: false,
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
          passwordHash: hashedPassword,
          consentEssential: true,
          consentAiTraining: true,
          consentMarketing: false,
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
            consentAiTraining: false,
            consentMarketing: false,
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
      expect(comparePassword).toHaveBeenCalledWith(mockLoginData.password, mockUser.passwordHash);
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
      expect(comparePassword).toHaveBeenCalledWith(mockLoginData.password, mockUser.passwordHash);
      expect(jwtService.generateAccessToken).not.toHaveBeenCalled();
    });
  });
});
