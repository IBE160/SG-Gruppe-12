// src/services/auth.service.ts
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util'; // Import comparePassword
import { emailService } from './email.service';
import { jwtService } from '../utils/jwt.util'; // Import jwtService
import { UnauthorizedError } from '../utils/errors.util'; // Import UnauthorizedError
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';

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

export const authService = {
  async register(userData: RegisterUserDto): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const emailVerificationToken = uuidv4();
    const user = await userRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash: hashedPassword,
      consent_essential: true,
      consent_ai_training: userData.consent_ai_training || false,
      consent_marketing: userData.consent_marketing || false,
      emailVerificationToken: emailVerificationToken,
      emailVerified: false,
    });
    await emailService.sendVerificationEmail(user, emailVerificationToken);
    return user;
  },

  async login(loginData: LoginUserDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {
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

    // 3. Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(user.id);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // 4. Update last login time
    await userRepository.updateLastLogin(user.id);

    return { user, accessToken, refreshToken };
  },
};