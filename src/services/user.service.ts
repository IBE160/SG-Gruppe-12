// src/services/user.service.ts
import { prisma } from '../config/database'; // Assuming prisma client is initialized
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors.util';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export const userService = {
  /**
   * Updates the user's profile information.
   * @param userId The ID of the user to update.
   * @param data The profile data to update.
   * @returns The updated user profile.
   * @throws {NotFoundError} if the user is not found.
   */
  async updateProfile(userId: number, data: UpdateProfileData) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userRepository.update(userId, data);
    return updatedUser;
  },

  /**
   * Retrieves the user's profile information.
   * @param userId The ID of the user to retrieve.
   * @returns The user's profile information.
   * @throws {NotFoundError} if the user is not found.
   */
  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Return only relevant profile fields
    const { id, email, firstName, lastName, phoneNumber } = user;
    return { id, email, firstName, lastName, phoneNumber };
  },
};
