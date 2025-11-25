import { z } from 'zod';

// Schema for user registration input validation
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character (!@#$%^&*)'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// Type for the registration input data
export type RegisterInput = z.infer<typeof registerSchema>;


// Schema for user login input validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // Password just needs to be present for login
});

// Type for the login input data
export type LoginInput = z.infer<typeof loginSchema>;
