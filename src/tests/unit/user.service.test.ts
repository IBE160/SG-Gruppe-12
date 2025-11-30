import { userService } from '../../services/user.service';
import { userRepository } from '../../repositories/user.repository';
import { User } from '@prisma/client';
import { NotFoundError } from '../../utils/errors.util';

// Mock dependencies
jest.mock('../../repositories/user.repository');

describe('User Service', () => {
  const mockUserId = 'clsy96f0100001a1d6n8u2g2t'; // Example UUID
  const mockUser: User = {
    id: mockUserId,
    name: 'John Doe',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    role: 'USER',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    created_at: new Date(),
    updated_at: new Date(),
    emailVerified: true,
    emailVerificationToken: null,
    consent_essential: true,
    consent_ai_training: false,
    consent_marketing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile if user is found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const profile = await userService.getProfile(mockUserId);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(profile).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phoneNumber: mockUser.phoneNumber,
      });
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(mockUserId)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '+1122334455',
    };

    it('should update the user profile if found and return updated data', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const profile = await userService.updateProfile(mockUserId, updateData);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).toHaveBeenCalledWith(mockUserId, updateData);
      expect(profile).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
      });
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateProfile(mockUserId, updateData)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should not update email field if provided', async () => {
      const invalidUpdateData = { ...updateData, email: 'new@example.com' };
      const updatedUser = { ...mockUser, ...updateData };
      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const profile = await userService.updateProfile(mockUserId, invalidUpdateData);

      // Verify that email was not passed to the update method
      expect(userRepository.update).toHaveBeenCalledWith(mockUserId, expect.not.objectContaining({ email: expect.anything() }));
      expect(profile.email).toBe(mockUser.email);
    });
  });
});