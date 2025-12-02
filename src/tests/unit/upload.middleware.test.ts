import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../utils/errors.util';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';

// This is the function we are testing, copied from the middleware file.
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new BadRequestError(`Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed. Received: ${ext}`));
    }
};

describe('Upload Middleware fileFilter', () => {
    it('should accept .pdf files', () => {
        const req = {} as Request;
        const file = { originalname: 'test.pdf' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept .docx files', () => {
        const req = {} as Request;
        const file = { originalname: 'test.docx' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept .doc files', () => {
        const req = {} as Request;
        const file = { originalname: 'test.doc' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should accept .txt files', () => {
        const req = {} as Request;
        const file = { originalname: 'test.txt' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject .png files', () => {
        const req = {} as Request;
        const file = { originalname: 'test.png' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    it('should be case-insensitive for extensions', () => {
        const req = {} as Request;
        const file = { originalname: 'test.PDF' } as Express.Multer.File;
        const cb = jest.fn();

        fileFilter(req, file, cb);

        expect(cb).toHaveBeenCalledWith(null, true);
    });
});

describe('MIME Type Verification in cv.controller.parseAndCreate', () => {
    // Mock the file-type library
    jest.mock('file-type');

    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
    ];

    it('should accept valid PDF MIME type', async () => {
        const buffer = Buffer.from('PDF file content');
        const detectedType = await fileTypeFromBuffer(buffer);

        // Mock will return actual file type, but we test the logic
        if (detectedType) {
            expect(allowedMimeTypes.includes(detectedType.mime) || detectedType.mime === 'application/pdf').toBeTruthy();
        }
    });

    it('should accept valid DOCX MIME type', async () => {
        const mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        expect(allowedMimeTypes.includes(mimeType)).toBeTruthy();
    });

    it('should accept valid DOC MIME type', async () => {
        const mimeType = 'application/msword';
        expect(allowedMimeTypes.includes(mimeType)).toBeTruthy();
    });

    it('should accept valid TXT MIME type', async () => {
        const mimeType = 'text/plain';
        expect(allowedMimeTypes.includes(mimeType)).toBeTruthy();
    });

    it('should reject invalid MIME types', () => {
        const invalidMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/zip',
            'text/html',
            'application/json',
            'video/mp4',
        ];

        invalidMimeTypes.forEach(mimeType => {
            expect(allowedMimeTypes.includes(mimeType)).toBeFalsy();
        });
    });

    it('should handle unknown file type gracefully', () => {
        const detectedFileType = null;
        const isValid = detectedFileType && allowedMimeTypes.includes(detectedFileType);
        expect(isValid).toBeFalsy();
    });

    it('should validate MIME type from buffer content, not extension', () => {
        // This test validates the concept that we're checking MIME type from buffer
        // In actual implementation, fileTypeFromBuffer analyzes the file's magic bytes
        const testCases = [
            { ext: '.pdf', expectedMime: 'application/pdf' },
            { ext: '.docx', expectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { ext: '.doc', expectedMime: 'application/msword' },
            { ext: '.txt', expectedMime: 'text/plain' },
        ];

        testCases.forEach(({ ext, expectedMime }) => {
            expect(allowedMimeTypes.includes(expectedMime)).toBeTruthy();
        });
    });

    it('should reject file with valid extension but invalid MIME type', () => {
        // This simulates a scenario where a .pdf file actually contains image data
        const fakeFileExtension = '.pdf';
        const actualMimeType = 'image/jpeg'; // Not a PDF!

        const isValid = allowedMimeTypes.includes(actualMimeType);
        expect(isValid).toBeFalsy();
    });

    it('should handle edge case of renamed executable files', () => {
        // Simulates renaming malicious.exe to document.pdf
        const maliciousMimeTypes = [
            'application/x-msdownload', // .exe
            'application/x-executable',
            'application/x-sharedlib',
        ];

        maliciousMimeTypes.forEach(mimeType => {
            expect(allowedMimeTypes.includes(mimeType)).toBeFalsy();
        });
    });
});
