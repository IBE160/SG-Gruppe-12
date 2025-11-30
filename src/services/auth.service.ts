// src/services/auth.service.ts
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { emailService } from './email.service';
import { jwtService, UserRole } from '../utils/jwt.util';
import { UnauthorizedError, ConflictError } from '../utils/errors.util';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';
import { redis } from '../config/redis';

// Omit sensitive fields from user response
type SafeUser = Omit<User, 'passwordHash' | 'emailVerificationToken'>;

interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  firstName?: string; // Assuming these are added from remote's perspective
  lastName?: string;  // Assuming these are added from remote's perspective
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

    const user = await userRepository.create({
      name: userData.name,
      firstName: userData.firstName, // Assuming these fields are passed
      lastName: userData.lastName,   // Assuming these fields are passed
      email: userData.email,
      passwordHash: hashedPassword,
      emailVerificationToken: emailVerificationToken,
      emailVerified: false,
      consent_essential: true, // Always true for basic platform use
      consent_ai_training: userData.consent_ai_training ?? false,
      consent_marketing: userData.consent_marketing ?? false,
    });

    await emailService.sendVerificationEmail(user, emailVerificationToken);
    return toSafeUser(user);
  },

  async login(loginData: LoginUserDto): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    const { email, password } = loginData;

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await userRepository.updateLastLogin(user.id);

    // Generate JWT tokens with role
    const userRole = (user.role as UserRole) || 'USER';
    const accessToken = jwtService.generateAccessToken(String(user.id), userRole);
    const refreshToken = jwtService.generateRefreshToken(String(user.id), userRole);

    return { user: toSafeUser(user), accessToken, refreshToken };
  },

  async refreshToken(oldRefreshToken: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // 1. Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${oldRefreshToken}`);

    if (isBlacklisted) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // 2. Verify the old refresh token
    const payload = jwtService.verifyRefreshToken(oldRefreshToken);

    // 3. Find user
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // 4. Generate new tokens with role
    const userRole = (user.role as UserRole) || 'USER';
    const accessToken = jwtService.generateAccessToken(user.id, userRole);
    const refreshToken = jwtService.generateRefreshToken(user.id, userRole);

    // 5. Blacklist the old refresh token (with 7-day expiry to match token lifetime)
    await redis.set(`blacklist:${oldRefreshToken}`, 'true', 'EX', 7 * 24 * 60 * 60);

    return { user, accessToken, refreshToken };
  },
};