// src/validators/job.validator.ts
import { z } from 'zod';

export const analyzeJobDescriptionSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long.').max(10000, 'Job description cannot exceed 10000 characters.'),
  }),
});

export type AnalyzeJobDescriptionInput = z.infer<typeof analyzeJobDescriptionSchema>;
