import { PrismaClient } from '@prisma/client'; // Import statement for type inference
import { prisma } from '../config/database'; // Assuming Prisma client is initialized here

// Define the shape of user data for creation
interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerificationToken?: string; // Add emailVerificationToken
  emailVerified?: boolean;        // Add emailVerified
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordHash?: string;
}

export const userRepository = {
  /**
   * Creates a new user in the database.
   * @param data The user data to create.
   * @returns The created user object.
   */
  async create(data: CreateUserData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        emailVerificationToken: data.emailVerificationToken,
        emailVerified: data.emailVerified,
      },
    });
    return user;
  },

  /**
   * Finds a user by their email address.
   * @param email The email address to search for.
   * @returns The user object if found, otherwise null.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Finds a user by their ID.
   * @param id The ID of the user to search for.
   * @returns The user object if found, otherwise null.
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Updates a user's information.
   * @param id The ID of the user to update.
   * @param data The data to update.
   * @returns The updated user object.
   */
  async update(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        emailVerified: data.emailVerified,
        emailVerificationToken: data.emailVerificationToken,
        passwordResetToken: data.passwordResetToken,
        passwordHash: data.passwordHash,
      },
    });
  },

  // Other user-related database operations will go here
};