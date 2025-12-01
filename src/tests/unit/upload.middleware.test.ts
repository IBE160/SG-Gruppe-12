import { Request } from 'express';
import { BadRequestError } from '../../utils/errors.util';
import path from 'path';

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
