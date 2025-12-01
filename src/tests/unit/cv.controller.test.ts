// src/tests/unit/cv.controller.test.ts
import { AuthRequest } from '../../middleware/auth.middleware';
import { cvController } from '../../controllers/cv.controller';
import { cvService } from '../../services/cv.service';
import { cvParsingQueue } from '../../jobs';
import { storageService } from '../../services/storage.service';
import { Response, NextFunction } from 'express';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';

// Mocks
jest.mock('../../services/cv.service');
jest.mock('../../jobs');
jest.mock('../../services/storage.service');
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    createReadStream: jest.fn(),
    promises: {
        ...jest.requireActual('fs').promises,
        unlink: jest.fn().mockResolvedValue(undefined),
    },
}));


const mockedCvService = cvService as jest.Mocked<typeof cvService>;
const mockedCvParsingQueue = cvParsingQueue as jest.Mocked<typeof cvParsingQueue>;
const mockedStorageService = storageService as jest.Mocked<typeof storageService>;
const mockedFs = fs as jest.Mocked<typeof fs>;


describe('CV Controller', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            user: { userId: 'user-123' },
            file: {
                path: '/tmp/test-file.pdf',
                originalname: 'test-file.pdf',
                buffer: Buffer.from('test'),
            } as Express.Multer.File,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('parseAndCreate', () => {
        it('should return 400 if no file is uploaded', async () => {
            req.file = undefined;
            await cvController.parseAndCreate(req as AuthRequest, res as Response, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No file uploaded' });
        });

        it('should reject a file with an invalid MIME type', async () => {
            // Arrange
            jest.mock('file-type', () => ({
                fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'image/png' }),
            }));
            const { fileTypeFromBuffer: mockedFileTypeFromBuffer } = require('file-type');

            // Act
            await cvController.parseAndCreate(req as AuthRequest, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Invalid file type.'),
                })
            );
            expect(mockedCvParsingQueue.add).not.toHaveBeenCalled();
        });

        it('should accept a valid PDF file and queue it for parsing', async () => {
            // Arrange
            jest.mock('file-type', () => ({
                fileTypeFromBuffer: jest.fn().mockResolvedValue({ mime: 'application/pdf' }),
            }));
            const { fileTypeFromBuffer: mockedFileTypeFromBuffer } = require('file-type');
            
            mockedStorageService.uploadFileStream.mockResolvedValue('user-123/resume.pdf');
            mockedCvService.createCV.mockResolvedValue({ id: 1 } as any);
            mockedCvParsingQueue.add.mockResolvedValue({} as any);

            // Act
            await cvController.parseAndCreate(req as AuthRequest, res as Response, next);

            // Assert
            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { cvId: 1, supabaseFilePath: 'user-123/resume.pdf' },
                message: 'CV parsing initiated. You will be notified when complete.',
            });
            expect(mockedStorageService.uploadFileStream).toHaveBeenCalled();
            expect(mockedCvParsingQueue.add).toHaveBeenCalled();
        });
    });
});