// src/jobs/cv-parsing.job.ts
import { Job } from 'bull';
import { cvParsingQueue, CVParsingJobData } from './index';
import { parsingService } from '../services/parsing.service';
import { cvService } from '../services/cv.service'; // Use cvService for creating/updating CVs
import { logger } from '../utils/logger.util';

// This is the job processor function
cvParsingQueue.process(async (job: Job<CVParsingJobData>) => {
  const { userId, fileContent, fileType, cvId } = job.data;
  logger.info(`Processing CV parsing job for user ${userId}, CV ID: ${cvId}`);

  try {
    // Update job progress (optional)
    job.progress(10);

    // 1. Parse CV content using AI service
    const parsedCVData = await parsingService.parseCV(fileContent, fileType);
    job.progress(60);

    // 2. Update the existing (placeholder) CV entry with the parsed data
    // Assuming the initial CV was created with minimal data in the controller
    // and now we're populating it.
    await cvService.updateCV(userId, cvId, parsedCVData); // userId for authorization check in service
    job.progress(90);

    logger.info(`CV parsing job completed successfully for CV ID: ${cvId}`);
    job.progress(100);

    return { success: true, cvId, message: 'CV parsed and updated successfully' };
  } catch (error: any) {
    logger.error(`CV parsing job failed for CV ID: ${cvId}: ${error.message}`, error);
    // BullMQ handles retries based on 'attempts' and 'backoff' settings in job options
    throw error; // Re-throw to indicate job failure to BullMQ
  }
});

// Start the job processor when this file is imported (e.g., in server.ts or a dedicated worker)
// In a production setup, you would typically run workers in separate processes.
// For development, it might be started alongside the main app.
logger.info('CV Parsing Job Processor started.');
