import { prisma } from '../config/database';
import { User } from '@prisma/client'; // Import generated Prisma User type

// Define the shape of user data for creation
interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string; // Changed from firstName/lastName
  emailVerificationToken?: string;
  emailVerified?: boolean;
  // Consent fields from schema.prisma
  consent_essential?: boolean;
  consent_ai_training?: boolean;
  consent_marketing?: boolean;
}

interface UpdateUserData {
  name?: string; // Changed from firstName/lastName
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordHash?: string;
  // Consent fields
  consent_essential?: boolean;
  consent_ai_training?: boolean;
  consent_marketing?: boolean;
}

export const userRepository = {
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        emailVerificationToken: data.emailVerificationToken,
        emailVerified: data.emailVerified,
        consent_essential: data.consent_essential,
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

  async findById(id: number): Promise<User | null> { // id is now number
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async update(id: number, data: UpdateUserData): Promise<User> { // id is now number
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        emailVerified: data.emailVerified,
        emailVerificationToken: data.emailVerificationToken,
        passwordResetToken: data.passwordResetToken,
        passwordHash: data.passwordHash,
        consent_essential: data.consent_essential,
        consent_ai_training: data.consent_ai_training,
        consent_marketing: data.consent_marketing,
      },
    });
  },

  async updateLastLogin(id: number): Promise<User> { // New method
    return prisma.user.update({
      where: { id },
      data: {
        // updated_at is automatically handled by Prisma with @updatedAt
      },
    });
  },
};
