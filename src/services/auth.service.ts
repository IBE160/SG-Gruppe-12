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

import { redis } from '../config/redis';



// ... (existing code) ...



export const authService = {



  async register(data: RegisterUserDto): Promise<User> {



    const { name, email, password, consent_ai_training, consent_marketing } = data;



    const passwordHash = await hashPassword(password);



    const emailVerificationToken = uuidv4();







    const user = await userRepository.create({



      name,



      email,



      passwordHash,



      consent_essential: true,



      consent_ai_training: consent_ai_training || false,



      consent_marketing: consent_marketing || false,



      emailVerificationToken,



      emailVerified: false,



    });







    await emailService.sendVerificationEmail(user, emailVerificationToken);







    return user;



  },







  async login(data: LoginUserDto): Promise<{ user: User; accessToken: string; refreshToken: string }> {



    const { email, password } = data;



    const user = await userRepository.findByEmail(email);







    if (!user) {



      throw new UnauthorizedError('Invalid credentials');



    }







    const isPasswordValid = await comparePassword(password, user.passwordHash);







    if (!isPasswordValid) {



      throw new UnauthorizedError('Invalid credentials');



    }







    await userRepository.updateLastLogin(user.id);







    const accessToken = jwtService.generateAccessToken(user.id);



    const refreshToken = jwtService.generateRefreshToken(user.id);







    return { user, accessToken, refreshToken };



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















    // 4. Generate new tokens







    const accessToken = jwtService.generateAccessToken(user.id);







    const refreshToken = jwtService.generateRefreshToken(user.id);















    // 5. Blacklist the old refresh token (with 7-day expiry to match token lifetime)







    await redis.set(`blacklist:${oldRefreshToken}`, 'true', 'EX', 7 * 24 * 60 * 60);















    return { user, accessToken, refreshToken };







  },







};
