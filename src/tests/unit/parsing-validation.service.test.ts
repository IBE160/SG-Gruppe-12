// src/tests/unit/parsing-validation.service.test.ts

import { parsingValidationService } from '../../services/parsing-validation.service';
import { CvData } from '../../types/cv.types';

// Mock logger
jest.mock('../../utils/logger.util', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('parsingValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateExtraction', () => {
    describe('Name Validation', () => {
      it('should pass when name is found in original text', () => {
        const originalText = 'John Doe\nEmail: john@example.com\nPhone: 123-456-7890';
        const parsedData: CvData = {
          personalInfo: {
            name: 'John Doe',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn when name is not found in original text', () => {
        const originalText = 'Software Engineer with experience in web development';
        const parsedData: CvData = {
          personalInfo: {
            name: 'Jane Smith',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('Jane')
        );
        expect(result.warnings).toContainEqual(
          expect.stringContaining('Smith')
        );
      });

      it('should skip very short name components (initials)', () => {
        const originalText = 'John A. Doe\nEmail: john@example.com';
        const parsedData: CvData = {
          personalInfo: {
            name: 'John A. Doe',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('Company Validation', () => {
      it('should pass when company name is found in original text', () => {
        const originalText = 'Worked at Google Inc. as a Software Engineer from 2020-2023';
        const parsedData: CvData = {
          experience: [
            {
              company: 'Google Inc.',
              title: 'Software Engineer',
              start_date: '2020',
              end_date: '2023',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn when company is not found in original text', () => {
        const originalText = 'Software Engineer with 5 years of experience';
        const parsedData: CvData = {
          experience: [
            {
              company: 'Fake Company Ltd',
              title: 'Software Engineer',
              start_date: '2018',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('Fake Company Ltd')
        );
      });

      it('should handle company names with significant parts', () => {
        const originalText = 'Senior Developer at Microsoft Corporation, Redmond, WA';
        const parsedData: CvData = {
          experience: [
            {
              company: 'Microsoft Corporation',
              title: 'Senior Developer',
              start_date: '2021',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });
    });

    describe('Institution Validation', () => {
      it('should pass when institution is found in original text', () => {
        const originalText = 'BS Computer Science from MIT, graduated 2020';
        const parsedData: CvData = {
          education: [
            {
              institution: 'MIT',
              degree: 'BS Computer Science',
              start_date: '2016',
              end_date: '2020',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn when institution is not found in original text', () => {
        const originalText = 'Bachelor degree in Computer Science';
        const parsedData: CvData = {
          education: [
            {
              institution: 'Harvard University',
              degree: 'BS Computer Science',
              start_date: '2016',
              end_date: '2020',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('Harvard University')
        );
      });
    });

    describe('Generic Phrases Detection', () => {
      it('should pass when generic phrases in description are found in original text', () => {
        const originalText = 'Developed features and fixed bugs for the web application';
        const parsedData: CvData = {
          experience: [
            {
              company: 'Tech Corp',
              title: 'Developer',
              start_date: '2020',
              description: 'Developed features and fixed bugs',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        // Should not warn about generic phrases because they're in the original text
        const genericWarnings = result.warnings.filter(w => w.includes('Generic phrase'));
        expect(genericWarnings).toHaveLength(0);
      });

      it('should warn when generic phrases are added but not in original text', () => {
        const originalText = 'Built REST API using Node.js and Express';
        const parsedData: CvData = {
          experience: [
            {
              company: 'Startup Inc',
              title: 'Backend Engineer',
              start_date: '2021',
              description: 'Worked with team to develop features',
            },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings.some(w => w.includes('Generic phrase'))).toBe(true);
      });
    });

    describe('Skills Validation', () => {
      it('should pass when all skills are found in original text', () => {
        const originalText = 'Proficient in JavaScript, Python, and Docker. Experience with React and Node.js';
        const parsedData: CvData = {
          skills: [
            { name: 'JavaScript' },
            { name: 'Python' },
            { name: 'Docker' },
            { name: 'React' },
            { name: 'Node.js' },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should warn when skills are not found in original text', () => {
        const originalText = 'Experience with JavaScript and React';
        const parsedData: CvData = {
          skills: [
            { name: 'JavaScript' },
            { name: 'Kubernetes' }, // Not in original
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('Kubernetes')
        );
      });

      it('should handle skill name variations (e.g., Node.js vs Nodejs)', () => {
        const originalText = 'Experienced with Nodejs backend development';
        const parsedData: CvData = {
          skills: [{ name: 'Node.js' }],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        // Should pass because we check variations without dots
        expect(result.isValid).toBe(true);
      });
    });

    describe('Email Validation', () => {
      it('should pass when email is found in original text', () => {
        const originalText = 'Contact: john.doe@example.com';
        const parsedData: CvData = {
          personalInfo: {
            email: 'john.doe@example.com',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
      });

      it('should warn when email is not found in original text', () => {
        const originalText = 'Software Engineer at Tech Company';
        const parsedData: CvData = {
          personalInfo: {
            email: 'fake@example.com',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('fake@example.com')
        );
      });

      it('should handle case-insensitive email matching', () => {
        const originalText = 'Email: JOHN.DOE@EXAMPLE.COM';
        const parsedData: CvData = {
          personalInfo: {
            email: 'john.doe@example.com',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
      });
    });

    describe('Phone Number Validation', () => {
      it('should pass when phone number digits are found in original text', () => {
        const originalText = 'Phone: +1 (123) 456-7890';
        const parsedData: CvData = {
          personalInfo: {
            phone: '+1-123-456-7890',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
      });

      it('should warn when phone number is not found in original text', () => {
        const originalText = 'Software Engineer based in New York';
        const parsedData: CvData = {
          personalInfo: {
            phone: '123-456-7890',
          },
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual(
          expect.stringContaining('123-456-7890')
        );
      });
    });

    describe('Complex Real-World Scenarios', () => {
      it('should validate complete CV with all fields present', () => {
        const originalText = `
          Jane Smith
          jane.smith@email.com | 555-123-4567

          EXPERIENCE
          Senior Software Engineer at Google Inc. (2020-Present)
          - Led team in developing microservices architecture
          - Implemented CI/CD pipelines using Docker and Kubernetes

          Software Engineer at Microsoft (2018-2020)
          - Built REST APIs using Node.js and Express

          EDUCATION
          Master of Science in Computer Science - Stanford University (2016-2018)
          Bachelor of Science in Computer Science - MIT (2012-2016)

          SKILLS
          JavaScript, TypeScript, Python, React, Node.js, Docker, Kubernetes
        `;

        const parsedData: CvData = {
          personalInfo: {
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '555-123-4567',
          },
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Google Inc.',
              start_date: '2020',
              description: 'Led team in developing microservices architecture. Implemented CI/CD pipelines using Docker and Kubernetes',
            },
            {
              title: 'Software Engineer',
              company: 'Microsoft',
              start_date: '2018',
              end_date: '2020',
              description: 'Built REST APIs using Node.js and Express',
            },
          ],
          education: [
            {
              degree: 'Master of Science in Computer Science',
              institution: 'Stanford University',
              start_date: '2016',
              end_date: '2018',
            },
            {
              degree: 'Bachelor of Science in Computer Science',
              institution: 'MIT',
              start_date: '2012',
              end_date: '2016',
            },
          ],
          skills: [
            { name: 'JavaScript' },
            { name: 'TypeScript' },
            { name: 'Python' },
            { name: 'React' },
            { name: 'Node.js' },
            { name: 'Docker' },
            { name: 'Kubernetes' },
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should detect multiple hallucinations in fabricated CV', () => {
        const originalText = 'John Doe, software developer with some programming experience.';

        const parsedData: CvData = {
          personalInfo: {
            name: 'John Doe',
            email: 'fake@example.com', // Not in original
            phone: '999-888-7777', // Not in original
          },
          experience: [
            {
              title: 'Lead Architect',
              company: 'Fake Tech Corp', // Not in original
              start_date: '2015',
              description: 'Worked with team to develop features', // Generic phrase not in original
            },
          ],
          education: [
            {
              degree: 'PhD Computer Science',
              institution: 'Fake University', // Not in original
              start_date: '2010',
              end_date: '2015',
            },
          ],
          skills: [
            { name: 'Quantum Computing' }, // Not in original
            { name: 'AI/ML' }, // Not in original
          ],
        };

        const result = parsingValidationService.validateExtraction(parsedData, originalText);

        expect(result.isValid).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(5); // Multiple warnings expected
        expect(result.warnings.some(w => w.includes('fake@example.com'))).toBe(true);
        expect(result.warnings.some(w => w.includes('Fake Tech Corp'))).toBe(true);
        expect(result.warnings.some(w => w.includes('Fake University'))).toBe(true);
      });
    });
  });

  describe('getValidationSummary', () => {
    it('should return success message when validation passes', () => {
      const validResult = {
        isValid: true,
        warnings: [],
      };

      const summary = parsingValidationService.getValidationSummary(validResult);

      expect(summary).toBe('All extracted information was verified against your CV text.');
    });

    it('should return warning message with count for single issue', () => {
      const invalidResult = {
        isValid: false,
        warnings: ['Email not found'],
      };

      const summary = parsingValidationService.getValidationSummary(invalidResult);

      expect(summary).toContain('1 potential issue');
    });

    it('should return warning message with count for multiple issues', () => {
      const invalidResult = {
        isValid: false,
        warnings: ['Email not found', 'Company not found', 'Skill not found'],
      };

      const summary = parsingValidationService.getValidationSummary(invalidResult);

      expect(summary).toContain('3 potential issues');
    });
  });
});
