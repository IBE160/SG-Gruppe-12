import { userService } from '../services/user.service';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors.util';

jest.mock('../repositories/user.repository');

const mockUser = {
  id: 1,
  email: 'test@test.com',
  passwordHash: 'hashedpassword',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '1234567890',
  emailVerified: false,
  emailVerificationToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
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

      const profile = await userService.getProfile(1);

      expect(profile).toEqual({
        id: 1,
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(1)).rejects.toThrow(NotFoundError);
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

      const result = await userService.updateProfile(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundError if user is not found', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateProfile(1, {})).rejects.toThrow(NotFoundError);
    });
  });
});