// src/tests/email.service.test.ts
import { emailService } from '../services/email.service';
import { User } from '@prisma/client';

describe('Email Service', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.log to capture output
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore(); // Restore original console.log
  });

  const mockUser: User = {
    id: 'clsy96f0100001a1d6n8u2g2t',
    name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashedpassword',
    created_at: new Date(),
    updated_at: new Date(),
    consent_essential: true,
    consent_ai_training: false,
    consent_marketing: false,
    emailVerificationToken: null,
    emailVerified: false,
    firstName: null,
    lastName: null,
    phoneNumber: null,
  };
  const mockToken = 'mockVerificationToken';

  describe('sendVerificationEmail', () => {
    it('should log verification email details to console (mocked)', async () => {
      await emailService.sendVerificationEmail(mockUser, mockToken);

      expect(consoleSpy).toHaveBeenCalledWith('--- MOCK EMAIL SERVICE ---');
      expect(consoleSpy).toHaveBeenCalledWith(`Sending verification email to: ${mockUser.email}`);
      expect(consoleSpy).toHaveBeenCalledWith(`Verification link: http://your-app-domain/verify-email?token=${mockToken}`);
      expect(consoleSpy).toHaveBeenCalledWith('--- END MOCK EMAIL SERVICE ---');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should log password reset email details to console (mocked)', async () => {
      await emailService.sendPasswordResetEmail(mockUser, mockToken);

      expect(consoleSpy).toHaveBeenCalledWith('--- MOCK EMAIL SERVICE ---');
      expect(consoleSpy).toHaveBeenCalledWith(`Sending password reset email to: ${mockUser.email}`);
      expect(consoleSpy).toHaveBeenCalledWith(`Password reset link: http://your-app-domain/reset-password?token=${mockToken}`);
      expect(consoleSpy).toHaveBeenCalledWith('--- END MOCK EMAIL SERVICE ---');
    });
  });
});
