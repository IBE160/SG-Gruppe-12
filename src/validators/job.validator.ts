import { z } from 'zod';

export const analyzeJobDescriptionSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long.'),
    cvId: z.string().uuid('Invalid CV ID format'),
  }),
});