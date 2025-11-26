// frontend/src/lib/schemas/cv.test.ts
import {
  personalInfoSchema,
  educationEntrySchema,
  experienceEntrySchema,
  skillEntrySchema,
  languageEntrySchema,
  createCVSchema,
  updateCVSchema,
} from './cv';

describe('CV Schemas', () => {
  describe('personalInfoSchema', () => {
    it('should validate a correct personal info object', () => {
      const validPersonalInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };
      expect(() => personalInfoSchema.parse(validPersonalInfo)).not.toThrow();
    });

    it('should invalidate personal info with missing required fields', () => {
      const invalidPersonalInfo = {
        email: 'john.doe@example.com',
      };
      expect(() => personalInfoSchema.parse(invalidPersonalInfo)).toThrow();
    });

    it('should invalidate personal info with an invalid email', () => {
      const invalidPersonalInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      };
      expect(() => personalInfoSchema.parse(invalidPersonalInfo)).toThrow();
    });
  });

  describe('educationEntrySchema', () => {
    it('should validate a correct education entry', () => {
      const validEducation = {
        institution: 'University A',
        degree: 'B.Sc. Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-06-30',
      };
      expect(() => educationEntrySchema.parse(validEducation)).not.toThrow();
    });

    it('should invalidate education entry with missing required fields', () => {
      const invalidEducation = {
        degree: 'B.Sc. Computer Science',
      };
      expect(() => educationEntrySchema.parse(invalidEducation)).toThrow();
    });

    it('should invalidate education entry with invalid date format', () => {
      const invalidEducation = {
        institution: 'University A',
        degree: 'B.Sc. Computer Science',
        startDate: '01/09/2015',
      };
      expect(() => educationEntrySchema.parse(invalidEducation)).toThrow();
    });
  });

  describe('experienceEntrySchema', () => {
    it('should validate a correct experience entry', () => {
      const validExperience = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        startDate: '2019-07-01',
        endDate: '2023-12-31',
      };
      expect(() => experienceEntrySchema.parse(validExperience)).not.toThrow();
    });

    it('should invalidate experience entry with missing required fields', () => {
      const invalidExperience = {
        company: 'Tech Corp',
        startDate: '2019-07-01',
      };
      expect(() => experienceEntrySchema.parse(invalidExperience)).toThrow();
    });

    it('should invalidate experience entry with invalid date format', () => {
      const invalidExperience = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        startDate: '07/01/2019',
      };
      expect(() => experienceEntrySchema.parse(invalidExperience)).toThrow();
    });
  });

  describe('skillEntrySchema', () => {
    it('should validate a correct skill entry', () => {
      expect(() => skillEntrySchema.parse('JavaScript')).not.toThrow();
    });

    it('should invalidate an empty skill entry', () => {
      expect(() => skillEntrySchema.parse('')).toThrow();
    });
  });

  describe('languageEntrySchema', () => {
    it('should validate a correct language entry', () => {
      const validLanguage = { name: 'English', level: 'Fluent' };
      expect(() => languageEntrySchema.parse(validLanguage)).not.toThrow();
    });

    it('should invalidate language entry with missing required fields', () => {
      const invalidLanguage = { level: 'Native' };
      expect(() => languageEntrySchema.parse(invalidLanguage)).toThrow();
    });
  });

  describe('createCVSchema', () => {
    const validCV = {
      personal_info: { firstName: 'John', lastName: 'Doe' },
      education: [{ institution: 'Uni', degree: 'CS', startDate: '2020-01-01' }],
      experience: [{ title: 'Dev', company: 'Comp', startDate: '2022-01-01' }],
      skills: ['JS'],
      languages: [{ name: 'English' }],
    };

    it('should validate a complete and correct CV object', () => {
      expect(() => createCVSchema.parse(validCV)).not.toThrow();
    });

    it('should invalidate a CV with missing required top-level fields', () => {
      const incompleteCV = {
        personal_info: { firstName: 'John', lastName: 'Doe' },
        education: [],
        experience: [],
      };
      expect(() => createCVSchema.parse(incompleteCV)).toThrow();
    });

    it('should invalidate a CV with invalid nested personal info', () => {
      const invalidNestedCV = {
        ...validCV,
        personal_info: { firstName: 'John' }, // Missing lastName
      };
      expect(() => createCVSchema.parse(invalidNestedCV)).toThrow();
    });
  });

  describe('updateCVSchema', () => {
    const partialUpdate = {
      personal_info: { firstName: 'Jane' },
      skills: ['TypeScript'],
    };

    it('should validate a partial update object', () => {
      expect(() => updateCVSchema.parse(partialUpdate)).not.toThrow();
    });

    it('should invalidate a partial update with invalid nested data', () => {
      const invalidPartialUpdate = {
        personal_info: { email: 'invalid-email' },
      };
      expect(() => updateCVSchema.parse(invalidPartialUpdate)).toThrow();
    });

    it('should validate an empty update object', () => {
      expect(() => updateCVSchema.parse({})).not.toThrow();
    });
  });
});
