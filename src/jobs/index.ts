import Queue from 'bull';
import type { QueueOptions } from 'bull';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

const defaultJobOptions = {
  attempts: 3, // Retry a job up to 3 times
  backoff: {
    type: 'fixed',
    delay: 5000,
  },
};

const queueOptions: QueueOptions = {
  redis: process.env.NODE_ENV === 'test'
    ? { host: 'localhost', port: 6379 } // Use simple config for tests
    : redisConfig,
  defaultJobOptions,
};

// Define the Bull queue for CV parsing jobs
export const cvParsingQueue = new Queue('cv-parsing', queueOptions);

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
export const documentGenerationQueue = new Queue('document-generation', queueOptions);

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