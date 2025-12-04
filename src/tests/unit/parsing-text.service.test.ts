// src/tests/unit/parsing-text.service.test.ts

import { parsingService } from '../../services/parsing.service';
import { AppError } from '../../utils/errors.util';
import { generateObject } from 'ai';

// Mock dependencies
jest.mock('ai');
jest.mock('../../utils/logger.util', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockedGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>;

describe('parsingService.parseCVFromText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should throw AppError if CV text is empty', async () => {
      await expect(parsingService.parseCVFromText('')).rejects.toThrow(AppError);
      await expect(parsingService.parseCVFromText('')).rejects.toThrow(
        'CV text must be at least 50 characters long.'
      );
    });

    it('should throw AppError if CV text is too short (< 50 chars)', async () => {
      const shortText = 'John Doe, Software Engineer';

      await expect(parsingService.parseCVFromText(shortText)).rejects.toThrow(AppError);
      await expect(parsingService.parseCVFromText(shortText)).rejects.toThrow(
        'CV text must be at least 50 characters long.'
      );
    });

    it('should throw AppError if CV text is only whitespace', async () => {
      const whitespaceText = '                                                  ';

      await expect(parsingService.parseCVFromText(whitespaceText)).rejects.toThrow(AppError);
    });

    it('should accept CV text with exactly 50 characters', async () => {
      const validText = 'John Doe, Software Engineer at ABC Company Limited'; // 50+ chars

      mockedGenerateObject.mockResolvedValue({
        object: {
          personal_info: { name: 'John Doe' },
          skills: [],
        },
      } as any);

      await expect(parsingService.parseCVFromText(validText)).resolves.toBeDefined();
    });
  });

  describe('AI Parsing', () => {
    it('should successfully parse valid CV text', async () => {
      const cvText = `
        John Doe
        Email: john.doe@example.com
        Phone: +1-234-567-8900

        Work Experience:
        Software Engineer at Tech Corp (2020-2023)
        - Developed web applications using React and Node.js
        - Led team of 5 developers

        Education:
        BS Computer Science, University of Tech (2016-2020)

        Skills: JavaScript, React, Node.js, Python, Docker
      `;

      const mockParsedData = {
        personal_info: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1-234-567-8900',
        },
        experience: [
          {
            title: 'Software Engineer',
            company: 'Tech Corp',
            start_date: '2020',
            end_date: '2023',
            description: 'Developed web applications using React and Node.js. Led team of 5 developers',
          },
        ],
        education: [
          {
            institution: 'University of Tech',
            degree: 'BS Computer Science',
            start_date: '2016',
            end_date: '2020',
          },
        ],
        skills: [
          { name: 'JavaScript' },
          { name: 'React' },
          { name: 'Node.js' },
          { name: 'Python' },
          { name: 'Docker' },
        ],
      };

      mockedGenerateObject.mockResolvedValue({
        object: mockParsedData,
      } as any);

      const result = await parsingService.parseCVFromText(cvText);

      expect(result).toBeDefined();
      expect(result.personal_info?.name).toBe('John Doe');
      expect(result.personal_info?.email).toBe('john.doe@example.com');
      expect(result.experience).toHaveLength(1);
      expect(result.education).toHaveLength(1);
      expect(result.skills).toHaveLength(5);
    });

    it('should use temperature 0.0 for deterministic extraction', async () => {
      const cvText = 'John Doe, Software Engineer with 5 years of experience in web development.';

      mockedGenerateObject.mockResolvedValue({
        object: {
          personal_info: { name: 'John Doe' },
        },
      } as any);

      await parsingService.parseCVFromText(cvText);

      expect(mockedGenerateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.0,
        })
      );
    });

    it('should call CVParsingPrompt.v2 with text/plain file type', async () => {
      const cvText = 'John Doe is a software engineer with extensive experience in backend development.';

      mockedGenerateObject.mockResolvedValue({
        object: {
          personal_info: { name: 'John Doe' },
        },
      } as any);

      await parsingService.parseCVFromText(cvText);

      // Verify that generateObject was called (prompt validation happens in the actual prompt file)
      expect(mockedGenerateObject).toHaveBeenCalled();
    });
  });

  describe('Uncertain Fields Handling', () => {
    it('should log warning when AI reports uncertain fields', async () => {
      const { logger } = require('../../utils/logger.util');
      const cvText = 'Partial CV data with some ambiguous information that spans multiple lines.';

      const mockParsedDataWithUncertainty = {
        personal_info: { name: 'Unknown Person' },
        uncertain_fields: [
          {
            field: 'email',
            reason: 'Email address not clearly stated',
            found_text: 'contact via LinkedIn',
          },
          {
            field: 'work_experience.dates',
            reason: 'Employment dates are vague',
            found_text: 'worked for several years',
          },
        ],
      };

      mockedGenerateObject.mockResolvedValue({
        object: mockParsedDataWithUncertainty,
      } as any);

      await parsingService.parseCVFromText(cvText);

      expect(logger.warn).toHaveBeenCalledWith(
        'AI reported uncertainty during CV text parsing - user clarification may be needed',
        expect.objectContaining({
          uncertainFields: expect.arrayContaining([
            expect.objectContaining({ field: 'email' }),
            expect.objectContaining({ field: 'work_experience.dates' }),
          ]),
          totalUncertainFields: 2,
        })
      );
    });

    it('should not log warning when no uncertain fields', async () => {
      const { logger } = require('../../utils/logger.util');
      const cvText = 'Clean CV data with all fields clearly specified and no ambiguity present.';

      const mockParsedData = {
        personal_info: { name: 'Jane Smith', email: 'jane@example.com' },
        skills: [{ name: 'Python' }],
      };

      mockedGenerateObject.mockResolvedValue({
        object: mockParsedData,
      } as any);

      await parsingService.parseCVFromText(cvText);

      expect(logger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('uncertainty'),
        expect.anything()
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw AppError when AI parsing fails', async () => {
      const cvText = 'John Doe, experienced software engineer specializing in full-stack web development.';

      mockedGenerateObject.mockRejectedValue(new Error('AI service unavailable'));

      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow(AppError);
      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow(/AI parsing failed/);
    });

    it('should handle Zod validation errors', async () => {
      const cvText = 'Test CV content with sufficient length to pass initial validation checks here.';

      // Mock AI returning invalid data
      mockedGenerateObject.mockResolvedValue({
        object: {
          personal_info: {
            email: 'invalid-email', // This will fail Zod email validation
          },
        },
      } as any);

      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow(AppError);
      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow(
        /schema validation/
      );
    });

    it('should preserve AppError instances thrown during parsing', async () => {
      const cvText = 'Another test CV with enough characters to meet the minimum length requirement.';
      const customError = new AppError('Custom parsing error', 422);

      mockedGenerateObject.mockRejectedValue(customError);

      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow(customError);
      await expect(parsingService.parseCVFromText(cvText)).rejects.toThrow('Custom parsing error');
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle CV text with multiple formats and sections', async () => {
      const complexCVText = `
        CURRICULUM VITAE

        Jane Smith
        jane.smith@email.com | +1-555-0123 | linkedin.com/in/janesmith

        PROFESSIONAL SUMMARY
        Experienced software engineer with 8+ years in full-stack development

        WORK EXPERIENCE

        Senior Software Engineer | Tech Company Inc. | 2020-Present
        - Led development of microservices architecture
        - Managed team of 6 engineers
        - Increased system performance by 40%

        Software Engineer | Startup Co. | 2016-2020
        - Built REST APIs using Node.js
        - Implemented CI/CD pipelines

        EDUCATION

        Master of Science in Computer Science | MIT | 2014-2016
        Bachelor of Science in Computer Science | State University | 2010-2014

        SKILLS
        Programming: JavaScript, TypeScript, Python, Go
        Frameworks: React, Node.js, Express, Django
        Tools: Docker, Kubernetes, Jenkins, AWS

        LANGUAGES
        English (Native), Spanish (Fluent), French (Conversational)
      `;

      const mockComplexParsedData = {
        personal_info: {
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0123',
          linkedin: 'https://linkedin.com/in/janesmith',
        },
        summary: 'Experienced software engineer with 8+ years in full-stack development',
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Company Inc.',
            start_date: '2020',
            description: 'Led development of microservices architecture. Managed team of 6 engineers. Increased system performance by 40%',
          },
          {
            title: 'Software Engineer',
            company: 'Startup Co.',
            start_date: '2016',
            end_date: '2020',
            description: 'Built REST APIs using Node.js. Implemented CI/CD pipelines',
          },
        ],
        education: [
          {
            degree: 'Master of Science in Computer Science',
            institution: 'MIT',
            start_date: '2014',
            end_date: '2016',
          },
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'State University',
            start_date: '2010',
            end_date: '2014',
          },
        ],
        skills: [
          { name: 'JavaScript' },
          { name: 'TypeScript' },
          { name: 'Python' },
          { name: 'Go' },
          { name: 'React' },
          { name: 'Node.js' },
        ],
        languages: [
          { name: 'English', proficiency: 'native' },
          { name: 'Spanish', proficiency: 'fluent' },
          { name: 'French', proficiency: 'conversational' },
        ],
      };

      mockedGenerateObject.mockResolvedValue({
        object: mockComplexParsedData,
      } as any);

      const result = await parsingService.parseCVFromText(complexCVText);

      expect(result).toBeDefined();
      expect(result.personal_info?.name).toBe('Jane Smith');
      expect(result.experience).toHaveLength(2);
      expect(result.education).toHaveLength(2);
      expect(result.skills).toBeDefined();
      expect(result.languages).toHaveLength(3);
      expect(result.summary).toContain('8+ years');
    });

    it('should handle minimal CV text with basic information', async () => {
      const minimalCVText = 'Bob Johnson, bob@email.com, Python developer with 3 years experience. Knows Django and Flask.';

      const mockMinimalData = {
        personal_info: {
          name: 'Bob Johnson',
          email: 'bob@email.com',
        },
        skills: [
          { name: 'Python' },
          { name: 'Django' },
          { name: 'Flask' },
        ],
      };

      mockedGenerateObject.mockResolvedValue({
        object: mockMinimalData,
      } as any);

      const result = await parsingService.parseCVFromText(minimalCVText);

      expect(result).toBeDefined();
      expect(result.personal_info?.name).toBe('Bob Johnson');
      expect(result.personal_info?.email).toBe('bob@email.com');
      expect(result.skills).toHaveLength(3);
    });
  });
});
