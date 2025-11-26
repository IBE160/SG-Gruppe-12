import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format') // E.164 format
    .optional()
    .or(z.literal('')), // Allow empty string for optional fields
});

export type ProfileInput = z.infer<typeof profileSchema>;