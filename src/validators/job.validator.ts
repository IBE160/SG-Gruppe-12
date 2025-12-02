import { z } from 'zod';

export const analyzeJobDescriptionSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long.').max(10000, 'Job description cannot exceed 10000 characters.'),
    cvId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/, 'CV ID must be a valid number')]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type AnalyzeJobDescriptionInput = z.infer<typeof analyzeJobDescriptionSchema>['body'];