import { hashPassword, comparePassword } from '../utils/password.util';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedError } from '../utils/errors.util';
import { signJWT, JWTPayload } from '../utils/jwt.util';

// Define the shape of data for registration
interface RegisterUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

// Define the shape of data for login
interface LoginUserData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Registers a new user.
   * @param data User registration data including email, password, and optional profile info.
   * @returns The newly created user object, excluding sensitive info like password hash.
   */
  async register(data: RegisterUserData) {
    // Hash the password
    const passwordHash = await hashPassword(data.password);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerified = false; // User is not verified until they click the link

    // Create the user in the database
    const user = await userRepository.create({
      email: data.email,
      passwordHash: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailVerificationToken: emailVerificationToken,
      emailVerified: emailVerified,
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await emailService.sendVerificationEmail(user.email, verificationLink);

    // Return the user object, omitting the passwordHash for security
    const { passwordHash: _, emailVerificationToken: __, ...userWithoutSensitiveInfo } = user;
    return userWithoutSensitiveInfo;
  },

  /**
   * Authenticates a user with provided credentials.
   * @param data User login data including email and password.
   * @returns The authenticated user object (without password hash) and JWTs.
   * @throws {UnauthorizedError} if credentials are invalid.
   */
  async login(data: LoginUserData) {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordIsValid = await comparePassword(data.password, user.passwordHash);

    if (!passwordIsValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT tokens
    const payload: JWTPayload = { userId: user.id, email: user.email };
    const accessToken = signJWT(payload, '15m', 'access'); // Access token: 15 minutes
    const refreshToken = signJWT(payload, '7d', 'refresh'); // Refresh token: 7 days

    const { passwordHash: _, emailVerificationToken: __, ...userWithoutSensitiveInfo } = user;

    return { user: userWithoutSensitiveInfo, accessToken, refreshToken };
  },

  /**
   * Performs the logout operation.
   * For HTTP-only cookies, actual clearing happens in the controller.
   */
  async logout() {
    // No specific server-side logic needed here for HTTP-only cookies revocation for now.
    // Future: Invalidate refresh token if stored in DB/Redis.
    return { message: 'Logout successful' };
  }
};
