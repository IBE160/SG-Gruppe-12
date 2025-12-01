// src/tests/unit/job.validator.test.ts
import { analyzeJobDescriptionSchema } from '../../validators/job.validator';
import { z } from 'zod';

describe('analyzeJobDescriptionSchema', () => {
  // Mock a valid UUID for cvId
  const validCvId = '123e4567-e89b-12d3-a456-426614174000';

  it('should validate successfully with valid jobDescription and cvId', () => {
    const validData = {
      body: {
        jobDescription: 'This is a valid job description with at least 10 characters for testing.',
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation if jobDescription is too short', () => {
    const invalidData = {
      body: {
        jobDescription: 'short',
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Job description must be at least 10 characters long.',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if jobDescription is missing', () => {
    const invalidData = {
      body: {
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid input: expected string, received undefined',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if jobDescription is too long', () => {
    const longJobDescription = 'a'.repeat(10001); // 10001 characters
    const invalidData = {
      body: {
        jobDescription: longJobDescription,
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Job description cannot exceed 10000 characters.',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if cvId is missing', () => {
    const invalidData = {
      body: {
        jobDescription: 'This is a valid job description.',
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid input: expected string, received undefined',
            path: ['body', 'cvId'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if cvId is not a valid UUID', () => {
    const invalidData = {
      body: {
        jobDescription: 'This is a valid job description.',
        cvId: 'not-a-uuid',
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid CV ID format',
            path: ['body', 'cvId'],
          }),
        ]),
      })
    );
  });
});
