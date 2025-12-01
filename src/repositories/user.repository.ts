import { prisma } from '../config/database';
import { User } from '@prisma/client'; // Import generated Prisma User type

// Define the shape of user data for creation
interface CreateUserData {
  email: string;
  password_hash: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerificationToken?: string;
  emailVerified?: boolean;
  consent_essential?: boolean;
  consent_ai_training?: boolean;
  consent_marketing?: boolean;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  password_hash?: string;
}

export const userRepository = {
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        emailVerificationToken: data.emailVerificationToken,
        emailVerified: data.emailVerified,
        consent_ai_training: data.consent_ai_training,
        consent_marketing: data.consent_marketing,
      },
    });
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        emailVerified: data.emailVerified,
        emailVerificationToken: data.emailVerificationToken,
        password_hash: data.password_hash,
      },
    });
  },

  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        // updated_at is automatically handled by Prisma with @updatedAt
      },
    });
  },
};
