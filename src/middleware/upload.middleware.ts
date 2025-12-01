// src/middleware/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors.util'; // Assuming you have an errors.util.ts
import path from 'path';
import fs from 'fs'; // Import fs to delete temporary files

// Configure storage - using disk storage to avoid memory issues
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads'); // Temporary upload directory
    fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only PDF, DOCX, and TXT (MIME type validation will be done later in the service)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed. Received: ${ext}`));
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
