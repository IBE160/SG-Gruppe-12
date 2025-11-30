import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { encryptionService } from '../utils/encryption.util';

dotenv.config(); // Load environment variables from .env file

// Define which fields should be encrypted for each model
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  CVComponent: ['content'],
  JobPosting: ['description'],
  ApplicationAnalysis: ['generated_application_content', 'generated_cv_content'],
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Only apply encryption middleware if ENCRYPTION_KEY is set
if (process.env.ENCRYPTION_KEY) {
  // Middleware for encrypting data before write operations
  prisma.$use(async (params, next) => {
    const modelFields = ENCRYPTED_FIELDS[params.model ?? ''];

    // Encrypt on create/update operations
    if (modelFields && params.args?.data) {
      if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
        const data = params.args.data;
        for (const field of modelFields) {
          if (data[field] !== undefined && data[field] !== null) {
            // For JSON fields, stringify first
            const value = typeof data[field] === 'object'
              ? JSON.stringify(data[field])
              : String(data[field]);

            // Only encrypt if not already encrypted
            if (!encryptionService.isEncrypted(value)) {
              data[field] = encryptionService.encrypt(value);
            }
          }
        }
      }
    }

    // Execute the query
    const result = await next(params);

    // Decrypt on read operations
    if (modelFields && result) {
      const decryptRecord = (record: Record<string, unknown>) => {
        for (const field of modelFields) {
          if (record[field] !== undefined && record[field] !== null) {
            const value = String(record[field]);
            if (encryptionService.isEncrypted(value)) {
              try {
                const decrypted = encryptionService.decrypt(value);
                // Try to parse as JSON if the original was JSON
                try {
                  record[field] = JSON.parse(decrypted);
                } catch {
                  record[field] = decrypted;
                }
              } catch (error) {
                // If decryption fails, leave as-is (might be legacy unencrypted data)
                console.warn(`Failed to decrypt field ${field}:`, error);
              }
            }
          }
        }
        return record;
      };

      if (Array.isArray(result)) {
        return result.map((r) => (r && typeof r === 'object' ? decryptRecord(r as Record<string, unknown>) : r));
      } else if (typeof result === 'object' && result !== null) {
        return decryptRecord(result as Record<string, unknown>);
      }
    }

    return result;
  });
}

export { prisma };