import Queue from 'bull';
import IORedis, { RedisOptions } from 'ioredis'; // Import IORedis as a value and RedisOptions type
import IORedisMock from 'ioredis-mock';

let redisConnectionOptions: Queue.QueueOptions['redis'];
let createRedisClient: Queue.QueueOptions['createClient'];

if (process.env.NODE_ENV === 'test') {
  createRedisClient = function (type: string, opts?: RedisOptions) {
    // Create an ioredis-mock instance for testing
    return new IORedisMock(opts as RedisOptions); // Type assertion here
  };
} else {
  redisConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

const defaultJobOptions = {
  attempts: 3, // Retry a job up to 3 times
  backoff: {
    type: 'fixed',
    delay: 5000,
  },
};

// Define the Bull queue for CV parsing jobs
export const cvParsingQueue = new Queue('cv-parsing', {
  redis: redisConnectionOptions,
  createClient: createRedisClient,
  defaultJobOptions,
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
  redis: redisConnectionOptions,
  createClient: createRedisClient,
  defaultJobOptions,
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