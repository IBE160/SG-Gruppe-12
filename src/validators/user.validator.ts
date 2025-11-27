import { z } from 'zod';

// Schema for profile data
const profileDataSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format') // E.164 format
    .optional()
    .or(z.literal('')), // Allow empty string for optional fields
});

// Schema for user profile update validation (wrapped for middleware)
export const profileSchema = z.object({
  body: profileDataSchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Type for the profile update input data
export type ProfileInput = z.infer<typeof profileDataSchema>;