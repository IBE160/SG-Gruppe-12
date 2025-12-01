// src/tests/unit/parsing.service.test.ts
import { parsingService } from '../../services/parsing.service';
import { storageService } from '../../services/storage.service';
import { gemini } from '../../config/ai-providers'; // Changed from genAI to gemini
import { logger } from '../../utils/logger.util';
import { AppError } from '../../utils/errors.util';
import { cvDataSchema } from '../../validators/cv.validator';

// Mock dependencies
jest.mock('../../services/storage.service');
jest.mock('../../config/ai-providers');
jest.mock('../../utils/logger.util');

const mockedStorageService = storageService as jest.Mocked<typeof storageService>;
const mockedGemini = gemini as jest.Mocked<typeof gemini>; // Changed from mockedGenAI to mockedGemini
const mockedLogger = logger as jest.Mocked<typeof logger>;

describe('Parsing Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('parseCV', () => {
        it('should download, parse, validate, and return CV data on success', async () => {
            // Arrange
            const supabaseFilePath = 'user-id/12345-cv.pdf';
            const fileType = 'application/pdf';
            const fileContent = 'This is the content of the CV.';
            const aiResponse = {
                personal_info: { name: 'John Doe', email: 'john.doe@example.com' },
                experience: [{ title: 'Software Engineer', company: 'Tech Corp', start_date: '2020-01-01', description: 'Developed stuff.' }],
                education: [{ institution: 'State University', degree: 'B.S. in Computer Science', start_date: '2016-08-01', end_date: '2020-05-01' }],
                skills: [{ name: 'TypeScript' }, { name: 'React' }],
            };

            mockedStorageService.downloadFile.mockResolvedValue(Buffer.from(fileContent));
            
            // Mock the generateObject function from the ai-sdk
            (mockedGemini as any).generateObject = jest.fn().mockResolvedValue({
                object: aiResponse,
            });


            // Act
            const result = await parsingService.parseCV(supabaseFilePath, fileType);

            // Assert
            expect(mockedStorageService.downloadFile).toHaveBeenCalledWith(supabaseFilePath);
            expect(mockedGemini.getGenerativeModel).not.toHaveBeenCalled(); // Should not call getGenerativeModel directly
            expect((mockedGemini as any).generateObject).toHaveBeenCalledWith(expect.objectContaining({ model: expect.any(Function) }));
            expect(result).toEqual(cvDataSchema.parse(aiResponse)); // Ensure result matches schema
            expect(mockedLogger.error).not.toHaveBeenCalled();
        });

        it('should throw an AppError if file download fails', async () => {
            // Arrange
            const supabaseFilePath = 'user-id/12345-cv.pdf';
            const fileType = 'application/pdf';
            const downloadError = new Error('Supabase download failed');
            mockedStorageService.downloadFile.mockRejectedValue(downloadError);

            // Act & Assert
            await expect(parsingService.parseCV(supabaseFilePath, fileType)).rejects.toThrow(
                new AppError('Failed to download CV from storage: Supabase download failed', 500)
            );
            expect(mockedLogger.error).toHaveBeenCalledWith('Error downloading CV from Supabase: Supabase download failed', downloadError);
        });

        it('should throw an AppError if AI response is not valid JSON', async () => {
            // Arrange
            const supabaseFilePath = 'user-id/12345-cv.pdf';
            const fileType = 'application/pdf';
            mockedStorageService.downloadFile.mockResolvedValue(Buffer.from('CV content'));
            
            (mockedGemini as any).generateObject = jest.fn().mockResolvedValue({
                object: {}, // Return an empty object that will fail schema validation
            });

            // Act & Assert
            await expect(parsingService.parseCV(supabaseFilePath, fileType)).rejects.toThrow(
                new AppError('AI parsing failed: Invalid JSON response from AI', 500)
            );
            expect(mockedLogger.error).toHaveBeenCalledWith('AI response was not valid JSON:', expect.any(Error));
        });

        it('should throw an AppError if parsed data fails Zod validation', async () => {
            // Arrange
            const supabaseFilePath = 'user-id/12345-cv.pdf';
            const fileType = 'application/pdf';
            const invalidAiResponse = { personal_info: { name: 123 } }; // Name should be a string
            mockedStorageService.downloadFile.mockResolvedValue(Buffer.from('CV content'));
            
            (mockedGemini as any).generateObject = jest.fn().mockResolvedValue({
                object: invalidAiResponse,
            });

            // Act & Assert
            await expect(parsingService.parseCV(supabaseFilePath, fileType)).rejects.toThrow(
                expect.objectContaining({ message: expect.stringContaining('AI parsed data failed schema validation') })
            );
        });

        it('should throw an AppError if the AI model fails', async () => {
            // Arrange
            const supabaseFilePath = 'user-id/12345-cv.pdf';
            const fileType = 'application/pdf';
            const aiError = new Error('AI model is down');
            mockedStorageService.downloadFile.mockResolvedValue(Buffer.from('CV content'));
            
            (mockedGemini as any).generateObject = jest.fn().mockRejectedValue(aiError);

            // Act & Assert
            await expect(parsingService.parseCV(supabaseFilePath, fileType)).rejects.toThrow(
                new AppError('AI parsing failed: AI model is down', 500)
            );
            expect(mockedLogger.error).toHaveBeenCalledWith('Error parsing CV with AI: AI model is down', aiError);
        });
    });
});
