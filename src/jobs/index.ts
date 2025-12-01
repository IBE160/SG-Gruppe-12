// src/jobs/index.ts
import Queue from 'bull';
import { redis } from '../config/redis'; // Import the Redis client

// Define the Bull queue for CV parsing jobs
export const cvParsingQueue = new Queue('cv-parsing', {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
  },
  // Optional: Add default job options
  defaultJobOptions: {
    attempts: 3, // Retry a job up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // First retry after 1 second, then 2s, 4s, etc.
    },
  },
});

// Define job data interface for better type safety
export interface CVParsingJobData {
  userId: string;
  supabaseFilePath: string; // Changed from fileContent
  fileType: string;
  cvId: number; // Changed from string to number
}

// Event listeners for the queue (optional, for logging/monitoring)
cvParsingQueue.on('global:completed', (jobId, result) => {
  console.log(`Job ${jobId} completed with result ${result}`);
});

cvParsingQueue.on('global:failed', (jobId, err) => {
  console.error(`Job ${jobId} failed with error ${err}`);
});

cvParsingQueue.on('error', (error) => {
  console.error('Bull queue error:', error);
});

// Define the Bull queue for document generation jobs
export const documentGenerationQueue = new Queue('document-generation', {
  redis: {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export interface DocumentGenerationJobData {
  userId: string;
  cvId: number;
  format: 'pdf' | 'docx';
}

documentGenerationQueue.on('global:completed', (jobId, result) => {
  console.log(`Document Generation Job ${jobId} completed with result ${result}`);
});

documentGenerationQueue.on('global:failed', (jobId, err) => {
  console.error(`Document Generation Job ${jobId} failed with error ${err}`);
});