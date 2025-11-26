// src/middleware/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors.util'; // Assuming you have an errors.util.ts
import * as FileType from 'file-type'; // Import file-type library

// Configure storage - using memory storage for now, will be updated for streaming
const storage = multer.memoryStorage();

// File filter to allow only PDF, DOCX, and TXT
const fileFilter = async (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  // Use file-type to verify MIME type from file content
  const detectedFileType = await FileType.fromBuffer(file.buffer);

  if (detectedFileType && allowedMimeTypes.includes(detectedFileType.mime)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Only PDF, DOCX, and TXT are allowed. Detected: ${detectedFileType ? detectedFileType.mime : 'unknown'}`));
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
