// src/tests/unit/auth.service.test.ts
import { authService } from '../../services/auth.service';
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
  // Mock user data (as it would be stored in DB)
  const mockUserStored: User = {
    id: 'clsy96f0100001a1d6n8u2g2t',
    name: 'John Doe',
    email: 'john.doe@example.com',
    passwordHash: 'hashed-password-123',
    emailVerified: false,
    emailVerificationToken: 'mock-uuid-token',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: null,
    consentEssential: true,
    consentAiTraining: false,
    consentMarketing: false,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  // Mock user data (as it would be returned by service, excluding passwordHash and token)
  const mockUserReturned = {
    id: mockUserStored.id,
    name: mockUserStored.name,
    email: mockUserStored.email,
    emailVerified: mockUserStored.emailVerified,
    firstName: mockUserStored.firstName,
    lastName: mockUserStored.lastName,
    phoneNumber: mockUserStored.phoneNumber,
    consentEssential: mockUserStored.consentEssential,
    consentAiTraining: mockUserStored.consentAiTraining,
    consentMarketing: mockUserStored.consentMarketing,
    createdAt: mockUserStored.createdAt,
    updatedAt: mockUserStored.updatedAt,
  };


  const validUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    consentAiTraining: false,
    consentMarketing: false,
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
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored); // Mock the stored user
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        // Execute
        const result = await authService.register(validUserData);

        // Assert - verify password was hashed
        expect(hashPassword).toHaveBeenCalledWith('SecurePassword123!');
        expect(hashPassword).toHaveBeenCalledTimes(1);

        // Assert - verify user was created with correct data
        expect(userRepository.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john.doe@example.com',
          passwordHash: 'hashed-password-123',
          consentEssential: true, // Always true
          consentAiTraining: false,
          consentMarketing: false,
          emailVerificationToken: 'mock-uuid-token',
          emailVerified: false,
        });
        expect(userRepository.create).toHaveBeenCalledTimes(1);

        // Assert - verify verification email was sent
        expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
          mockUserStored, // Pass the stored user here
          'mock-uuid-token'
        );
        expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);

        // Assert - verify returned user
        expect(result).toEqual(mockUserReturned); // Compare against returned user
      });

      it('should register user with AI training consent when provided', async () => {
        const userDataWithConsent = {
          ...validUserData,
          consentAiTraining: true,
          consentMarketing: true,
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue({
          ...mockUserStored,
          consentAiTraining: true,
          consentMarketing: true,
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        const result = await authService.register(userDataWithConsent);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consentAiTraining: true,
            consentMarketing: true,
          })
        );
        expect(result.consentAiTraining).toBe(true);
        expect(result.consentMarketing).toBe(true);
      });

      it('should register user with default consent values when not provided', async () => {
        const userDataMinimal = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        };

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-456');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(userDataMinimal);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consentEssential: true,
            consentAiTraining: false, // Default
            consentMarketing: false, // Default
          })
        );
      });
    });

    describe('email verification token generation', () => {
      it('should generate a unique email verification token for each user', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

        // Verify token was generated and stored
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            emailVerificationToken: 'mock-uuid-token',
          })
        );
      });

      it('should set emailVerified to false for new registrations', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

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
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

        expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
          mockUserStored, // Pass the stored user here
          'mock-uuid-token'
        );
      });

      it('should send verification email after user creation', async () => {
        const callOrder: string[] = [];

        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockImplementation(async () => {
          callOrder.push('userRepository.create');
          return mockUserStored;
        });
        (emailService.sendVerificationEmail as jest.Mock).mockImplementation(async () => {
          callOrder.push('emailService.sendVerificationEmail');
          return undefined; // Ensure mock returns something for async function
        });

        await authService.register(validUserData);

        expect(callOrder).toEqual(['userRepository.create', 'emailService.sendVerificationEmail']);
      });
    });

    describe('password security', () => {
      it('should hash the password before storing', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

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
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

        const createCallArgs = (userRepository.create as jest.Mock).mock.calls[0][0];

        expect(createCallArgs).not.toHaveProperty('password');
        expect(createCallArgs).toHaveProperty('passwordHash');
      });
    });

    describe('error handling', () => {
      it('should propagate password hashing errors', async () => {
        const hashError = new Error('Password hashing failed');
        (hashPassword as jest.Mock).mockRejectedValue(hashError);

        await expect(authService.register(validUserData)).rejects.toThrow('Password hashing failed');

        // Verify user creation was not attempted
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should propagate user repository errors', async () => {
        const dbError = new Error('Database connection failed');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockRejectedValue(dbError);

        await expect(authService.register(validUserData)).rejects.toThrow('Database connection failed');

        // Verify email was not sent if user creation failed
        expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
      });

      it('should propagate email service errors', async () => {
        const emailError = new Error('Email service unavailable');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(emailError);

        await expect(authService.register(validUserData)).rejects.toThrow('Email service unavailable');

        // Note: User was created but email failed - this is a business decision
        // In production, you might want to handle this differently (e.g., queue for retry)
        expect(userRepository.create).toHaveBeenCalled();
      });

      it('should handle duplicate email registration attempts', async () => {
        const duplicateError = new Error('Unique constraint failed on the fields: (`email`)');
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockRejectedValue(duplicateError);

        await expect(authService.register(validUserData)).rejects.toThrow(
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
          ...mockUserStored,
          name: 'John   Doe-Smith',
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(userDataWithFormatting);

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
          ...mockUserStored,
          email: 'John.Doe@Example.COM',
        });
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(userDataMixedCase);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'John.Doe@Example.COM',
          })
        );
      });
    });

    describe('essential consent handling', () => {
      it('should always set consentEssential to true regardless of input', async () => {
        (hashPassword as jest.Mock).mockResolvedValue('hashed-password-123');
        (userRepository.create as jest.Mock).mockResolvedValue(mockUserStored);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

        await authService.register(validUserData);

        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consentEssential: true,
          })
        );
      });
    });
  });
});
