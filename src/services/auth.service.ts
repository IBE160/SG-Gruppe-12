// src/services/auth.service.ts
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { emailService } from './email.service';
import { jwtService } from '../utils/jwt.util';
import { UnauthorizedError, ConflictError } from '../utils/errors.util';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';

// Omit sensitive fields from user response
type SafeUser = Omit<User, 'passwordHash' | 'emailVerificationToken'>;

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  consent_ai_training?: boolean;
  consent_marketing?: boolean;
}

interface LoginUserDto {
  email: string;
  password: string;
}

// Helper to strip sensitive fields from user
function toSafeUser(user: User): SafeUser {
  const { passwordHash, emailVerificationToken, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  async register(userData: RegisterUserDto): Promise<SafeUser> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(userData.password);
    const emailVerificationToken = uuidv4();

    // Split name into firstName and lastName if provided
    const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || undefined;

    const user = await userRepository.create({
      name: userData.name,
      firstName,
      lastName,
      email: userData.email,
      passwordHash: hashedPassword,
      emailVerificationToken: emailVerificationToken,
      emailVerified: false,
      consent_ai_training: userData.consent_ai_training ?? false,
      consent_marketing: userData.consent_marketing ?? false,
    });
    await emailService.sendVerificationEmail(user, emailVerificationToken);
    return toSafeUser(user);
  },

  async login(loginData: LoginUserDto): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const { email, password } = loginData;

    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 2. Compare password
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 3. Generate JWT tokens (convert numeric id to string for JWT)
    const accessToken = jwtService.generateAccessToken(String(user.id));
    const refreshToken = jwtService.generateRefreshToken(String(user.id));

    // 4. Update last login time
    await userRepository.updateLastLogin(user.id);

    return { user: toSafeUser(user), accessToken, refreshToken };
  },
};