// src/services/user.service.ts
import { prisma } from '../config/database'; // Assuming prisma client is initialized
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors.util';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string; // Allow email as an optional property for the interface
}

export const userService = {
  /**
   * Updates the user's profile information.
   * @param userId The ID of the user to update.
   * @param data The profile data to update.
   * @returns The updated user profile.
   * @throws {NotFoundError} if the user is not found.
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent email from being updated via this method
    const { email, ...updates } = data;

    const updatedUser = await userRepository.update(userId, updates);
    return updatedUser;
  },

  /**
   * Retrieves the user's profile information.
   * @param userId The ID of the user to retrieve.
   * @returns The user's profile information.
   * @throws {NotFoundError} if the user is not found.
   */
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return only relevant profile fields
    const { id, email, firstName, lastName, phoneNumber } = user;
    return { id, email, firstName, lastName, phoneNumber };
  },
};
