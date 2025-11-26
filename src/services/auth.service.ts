// src/services/auth.service.ts
import { userRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password.util';
import { emailService } from './email.service'; // Import email service
import { v4 as uuidv4 } from 'uuid'; // Import uuid for token generation
import { User } from '@prisma/client'; // Import Prisma's User type

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  consent_ai_training?: boolean;
  consent_marketing?: boolean;
}

export const authService = {
  async register(userData: RegisterUserDto): Promise<User> {
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();

    // Create the user in the database
    const user = await userRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      consent_essential: true, // Essential consent is always true
      consent_ai_training: userData.consent_ai_training || false,
      consent_marketing: userData.consent_marketing || false,
      emailVerificationToken: emailVerificationToken, // Store token
      emailVerified: false, // User is not verified initially
    });

    // Send verification email (mocked for MVP)
    await emailService.sendVerificationEmail(user, emailVerificationToken);

    return user;
  },
};