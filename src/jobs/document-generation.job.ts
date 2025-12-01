// src/jobs/document-generation.job.ts
import { documentGenerationQueue, DocumentGenerationJobData } from './index';
import { documentGenerationService } from '../services/document-generation.service';
import { cvService } from '../services/cv.service';
import { storageService } from '../services/storage.service';
import path from 'path';

documentGenerationQueue.process(async (job) => {
  const { userId, cvId, format } = job.data as DocumentGenerationJobData;
  job.log(`Starting document generation for CV ${cvId}, format ${format}`);

  try {
    await job.progress(10);

    const cvData = await cvService.getCVById(userId, cvId);
    job.log(`Fetched CV data for CV ${cvId}`);

    let documentBuffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'pdf') {
      documentBuffer = await documentGenerationService.generateCVPDF(cvData);
      contentType = 'application/pdf';
      fileName = `${cvData.title || 'cv'}_${cvId}.pdf`;
    } else if (format === 'docx') {
      documentBuffer = await documentGenerationService.generateCVDOCX(cvData);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = `${cvData.title || 'cv'}_${cvId}.docx`;
    } else {
      throw new Error(`Unsupported document format: ${format}`);
    }

    await job.progress(70);

    // Upload the generated document to Supabase Storage
    const storagePath = await storageService.uploadFileBuffer(
      userId,
      documentBuffer,
      fileName,
      contentType
    );

    await job.progress(100);
    job.log(`Document generated and uploaded to ${storagePath}`);

    return { filePath: storagePath, fileName, contentType };
  } catch (error: any) {
    job.log(`Document generation failed: ${error.message}`);
    console.error(`Document generation for CV ${cvId} failed:`, error);
    throw error;
  }
});

documentGenerationQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  // Implement notification logic for user or retry mechanism
});
