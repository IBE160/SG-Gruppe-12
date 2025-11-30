// src/validators/gdpr.validator.ts
import { z } from 'zod';

/**
 * Schema for delete account request.
 * Requires explicit confirmation.
 */
export const deleteAccountSchema = z.object({
  body: z.object({
    confirmDelete: z.literal(true, 'You must confirm deletion by setting confirmDelete to true'),
  }),
});

/**
 * Schema for updating consent preferences.
 */
export const updateConsentsSchema = z.object({
  body: z.object({
    aiTraining: z.boolean().optional(),
    marketing: z.boolean().optional(),
  }).refine(
    (data) => data.aiTraining !== undefined || data.marketing !== undefined,
    { message: 'At least one consent preference must be provided' }
  ),
});
