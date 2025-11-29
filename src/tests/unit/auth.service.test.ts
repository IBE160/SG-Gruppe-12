// src/tests/unit/auth.service.test.ts
import * as myAuthService from '../../services/auth.service';
import { userRepository } from '../../repositories/user.repository';
import { hashPassword } from '../../utils/password.util';
import { emailService } from '../../services/email.service';
import { User } from '@prisma/client';

// Mock all dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/password.util');
jest.mock('../../services/email.service');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-token'),
}));
jest.mock('../../config/redis', () => ({
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

describe('Auth Service', () => {
  // Mock user data
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: 'hashed-password-123',
    emailVerified: false,
    emailVerificationToken: 'mock-uuid-token',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: null,
    consent_essential: true,
    consent_ai_training: false,
    consent_marketing: false,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  };

  const validUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    consent_ai_training: false,
    consent_marketing: false,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    describe('successful registration', () => {
      it('should successfully register a new user with all required fields', async () => {
        // Setup mocks
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        // Execute
        const result = await myAuthService.authService.register(validUserData);

        // Assert - verify password was hashed
        expect(hashPassword).toHaveBeenCalledWith('SecurePassword123!');
        expect(hashPassword).toHaveBeenCalledTimes(1);

        // Assert - verify user was created with correct data
        expect(userRepository.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashed-password-123',
          consent_essential: true, // Always true
          consent_ai_training: false,
          consent_marketing: false,
          emailVerificationToken: 'mock-uuid-token',
          emailVerified: false,
        });
        expect(userRepository.create).toHaveBeenCalledTimes(1);

        // Assert - verify verification email was sent
        expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
          mockUser,
          'mock-uuid-token'
        );
        expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);

        // Assert - verify returned user (SafeUser omits passwordHash and emailVerificationToken)
        expect(result.email).toBe(mockUser.email);
        expect(result.emailVerified).toBe(false);
        // Note: emailVerificationToken is intentionally omitted from SafeUser for security
      });

      it('should register user with AI training consent when provided', async () => {
        const userDataWithConsent = {
          ...validUserData,
          consent_ai_training: true,
          consent_marketing: true,
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue({
          ...mockUser,
          consent_ai_training: true,
          consent_marketing: true,
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        const result = await myAuthService.authService.register(userDataWithConsent);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_ai_training: true,
            consent_marketing: true,
          })
        );
        expect(result.consent_ai_training).toBe(true);
        expect(result.consent_marketing).toBe(true);
      });

      it('should register user with default consent values when not provided', async () => {
        const userDataMinimal = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-456');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(userDataMinimal);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_essential: true,
            consent_ai_training: false, // Default
            consent_marketing: false, // Default
          })
        );
      });
    });

    describe('email verification token generation', () => {
      it('should generate a unique email verification token for each user', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        // Verify token was generated and stored
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            emailVerificationToken: 'mock-uuid-token',
          })
        );
      });

      it('should set emailVerified to false for new registrations', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            emailVerified: false,
          })
        );
      });
    });

    describe('email verification service integration', () => {
      it('should send verification email with correct user and token', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
          mockUser,
          'mock-uuid-token'
        );
      });

      it('should send verification email after user creation', async () => {
        const callOrder: string[] = [];

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockImplementation(async () => {
          callOrder.push('userRepository.create');
          return mockUser;
        });
        (emailService.sendVerificationEmail as jest.Mock).mockImplementation(async () => {
          callOrder.push('emailService.sendVerificationEmail');
        });

        await myAuthService.authService.register(validUserData);

        expect(callOrder).toEqual(['userRepository.create', 'emailService.sendVerificationEmail']);
      });
    });

    describe('password security', () => {
      it('should hash the password before storing', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        // Verify password was hashed
        expect(hashPassword).toHaveBeenCalledWith('SecurePassword123!');

        // Verify the hashed password was passed to repository
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            passwordHash: 'hashed-password-123',
          })
        );

        // Verify plain password was NOT stored
        expect(userRepository.create).not.toHaveBeenCalledWith(
          expect.objectContaining({
            password: expect.anything(),
          })
        );
      });

      it('should not store plain text password', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        const createCallArgs = (userRepository.create as jest.Mock).mock.calls[0][0];

        expect(createCallArgs).not.toHaveProperty('password');
        expect(createCallArgs).toHaveProperty('passwordHash');
      });
    });

    describe('error handling', () => {
      it('should propagate password hashing errors', async () => {
        const hashError = new Error('Password hashing failed');
        (hashPassword as jest.Mock).mockRejectedValue(hashError);

        await expect(myAuthService.authService.register(validUserData)).rejects.toThrow('Password hashing failed');

        // Verify user creation was not attempted
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should propagate user repository errors', async () => {
        const dbError = new Error('Database connection failed');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockRejectedValue(dbError);

        await expect(myAuthService.authService.register(validUserData)).rejects.toThrow('Database connection failed');

        // Verify email was not sent if user creation failed
        expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should propagate email service errors', async () => {
        const emailError = new Error('Email service unavailable');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(emailError);

        await expect(myAuthService.authService.register(validUserData)).rejects.toThrow('Email service unavailable');

        // Note: User was created but email failed - this is a business decision
        // In production, you might want to handle this differently (e.g., queue for retry)
        expect(userRepository.create).toHaveBeenCalled();
      });

      it('should handle duplicate email registration attempts', async () => {
        const duplicateError = new Error('Unique constraint failed on the fields: (`email`)');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockRejectedValue(duplicateError);

        await expect(myAuthService.authService.register(validUserData)).rejects.toThrow(
          'Unique constraint failed on the fields: (`email`)'
        );
      });
    });

    describe('data validation and sanitization', () => {
      it('should preserve exact name formatting', async () => {
        const userDataWithFormatting = {
          ...validUserData,
          name: 'John   Doe-Smith',
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue({
          ...mockUser,
          name: 'John   Doe-Smith',
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(userDataWithFormatting);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'John   Doe-Smith',
          })
        );
      });

      it('should preserve email case as provided', async () => {
        const userDataMixedCase = {
          ...validUserData,
          email: 'John.Doe@Example.COM',
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue({
          ...mockUser,
          email: 'John.Doe@Example.COM',
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(userDataMixedCase);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'John.Doe@Example.COM',
          })
        );
      });
    });

    describe('essential consent handling', () => {
      it('should always set consent_essential to true regardless of input', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await myAuthService.authService.register(validUserData);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_essential: true,
          })
        );
      });
    });
  });
});
