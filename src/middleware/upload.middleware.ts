// src/middleware/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors.util';

// Configure storage - using memory storage for now, will be updated for streaming
const storage = multer.memoryStorage();

// Allowed MIME types
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// File filter to allow only PDF, DOCX, and TXT
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check declared MIME type first (file-type detection happens after upload)
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Only PDF, DOCX, and TXT are allowed. Detected: ${file.mimetype}`));
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export const cvUploadMiddleware = upload.single('cv_file'); // 'cv_file' is the field name for the uploaded file
