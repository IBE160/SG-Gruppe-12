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

jest.mock('../repositories/user.repository');

import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors.util';

const mockUser = {
  id: 'clsy96f0100001a1d6n8u2g2t', // Use a string UUID
  email: 'test@test.com',
  passwordHash: 'hashedpassword',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: false,
  emailVerificationToken: 'mock-email-verification-token', // Add this as it's in the User model
  created_at: new Date(), // Use created_at
  updated_at: new Date(), // Use updated_at
  consent_ai_training: false,
  consent_essential: true,
  consent_marketing: false,
};

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile if user is found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const profile = await userService.getProfile(mockUser.id);

      expect(profile).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(mockUser.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    it('should update and return user profile if user is found', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
      };
      const updatedUser = { ...mockUser, ...updateData };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateData);
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateProfile(mockUser.id, {})).rejects.toThrow(NotFoundError);
    });
  });
});