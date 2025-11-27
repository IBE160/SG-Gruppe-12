// src/tests/user.service.test.ts
import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors.util';
import { User } from '@prisma/client';

// Mock dependencies
jest.mock('../repositories/user.repository');

describe('User Service', () => {
  const mockUser: User = {
    id: 'uuid-123-456',
    email: 'john.doe@example.com',
    passwordHash: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should successfully update user profile with all fields', async () => {
      const userId = 'uuid-123-456';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+9876543210',
      };
      const updatedUser = { ...mockUser, ...updateData };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should successfully update user profile with partial fields', async () => {
      const userId = 'uuid-123-456';
      const updateData = {
        firstName: 'Jane',
      };
      const updatedUser = { ...mockUser, firstName: 'Jane' };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should successfully update only phoneNumber', async () => {
      const userId = 'uuid-123-456';
      const updateData = {
        phoneNumber: '+9999999999',
      };
      const updatedUser = { ...mockUser, phoneNumber: '+9999999999' };

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = 'non-existent-uuid';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        NotFoundError
      );
      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'User not found'
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should handle empty update data', async () => {
      const userId = 'uuid-123-456';
      const updateData = {};

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(mockUser);
    });

    it('should propagate repository errors', async () => {
      const userId = 'uuid-123-456';
      const updateData = { firstName: 'Jane' };
      const dbError = new Error('Database connection failed');

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
      (userRepository.update as jest.Mock).mockRejectedValue(dbError);

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow(
        'Database connection failed'
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateData);
    });
  });

  describe('getProfile', () => {
    it('should successfully retrieve user profile', async () => {
      const userId = 'uuid-123-456';

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        phoneNumber: mockUser.phoneNumber,
      });
    });

    it('should retrieve profile with null optional fields', async () => {
      const userId = 'uuid-789';
      const userWithNullFields: User = {
        ...mockUser,
        id: userId,
        firstName: null,
        lastName: null,
        phoneNumber: null,
      };

      (userRepository.findById as jest.Mock).mockResolvedValue(userWithNullFields);

      const result = await userService.getProfile(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId,
        email: mockUser.email,
        firstName: null,
        lastName: null,
        phoneNumber: null,
      });
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = 'non-existent-uuid';

      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow(NotFoundError);
      await expect(userService.getProfile(userId)).rejects.toThrow('User not found');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should only return profile fields, not sensitive data', async () => {
      const userId = 'uuid-123-456';

      (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      // Should NOT include passwordHash, emailVerificationToken, passwordResetToken
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('emailVerificationToken');
      expect(result).not.toHaveProperty('passwordResetToken');
      expect(result).not.toHaveProperty('emailVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');

      // Should ONLY include public profile fields
      expect(Object.keys(result)).toEqual(['id', 'email', 'firstName', 'lastName', 'phoneNumber']);
    });

    it('should propagate repository errors', async () => {
      const userId = 'uuid-123-456';
      const dbError = new Error('Database connection failed');

      (userRepository.findById as jest.Mock).mockRejectedValue(dbError);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        'Database connection failed'
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
