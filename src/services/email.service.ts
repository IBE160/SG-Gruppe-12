// src/services/email.service.ts
import { User } from '@prisma/client';

export const emailService = {
  async sendVerificationEmail(user: User, token: string): Promise<void> {
    // For MVP, this is a mock implementation.
    // In a real application, this would integrate with an email sending service
    // like SendGrid, AWS SES, or a custom SMTP server.
    console.log(`--- MOCK EMAIL SERVICE ---`);
    console.log(`Sending verification email to: ${user.email}`);
    console.log(`Verification link: http://your-app-domain/verify-email?token=${token}`);
    console.log(`--- END MOCK EMAIL SERVICE ---`);

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 500)); 
  },

  async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    console.log(`--- MOCK EMAIL SERVICE ---`);
    console.log(`Sending password reset email to: ${user.email}`);
    console.log(`Password reset link: http://your-app-domain/reset-password?token=${token}`);
    console.log(`--- END MOCK EMAIL SERVICE ---`);
    await new Promise(resolve => setTimeout(resolve, 500)); 
  }
};