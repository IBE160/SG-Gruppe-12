// src/tests/auth.service.test.ts
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password.util';
import { emailService } from '../services/email.service';

// Mock dependencies
jest.mock('../repositories/user.repository');
jest.mock('../utils/password.util');
jest.mock('../services/email.service');

describe('Auth Service', () => {
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
      const mockCreatedUser = { id: 1, ...mockUserData, passwordHash: hashedPassword };

      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register(mockUserData);

      expect(hashPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockUserData.name,
          email: mockUserData.email,
          passwordHash: hashedPassword,
          consent_essential: true,
          consent_ai_training: true,
          consent_marketing: false,
          emailVerificationToken: expect.any(String), // Expect a generated token
          emailVerified: false,
        })
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, email: mockUserData.email }), // Pass created user object
        expect.any(String) // Pass the generated token
      );
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle default consent values if not provided', async () => {
        const mockUserData = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'Password123!',
        };
        const hashedPassword = 'hashedPassword123';
        const mockCreatedUser = { id: 1, ...mockUserData, passwordHash: hashedPassword, consent_ai_training: false, consent_marketing: false };
  
        (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
        (userRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);
        (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);
  
        await authService.register(mockUserData);
  
        expect(userRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_ai_training: false,
            consent_marketing: false,
          })
        );
      });
  });
});
