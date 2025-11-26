import { documentGenerationQueue, DocumentGenerationJobData } from './index';
import { documentGenerationService } from '../services/document-generation.service';
import { cvRepository } from '../repositories/cv.repository'; // Assuming this exists for fetching CV data
import fs from 'fs/promises';
import path from 'path';

// Define a directory for temporary storage of generated documents
const TMP_DIR = path.join(process.cwd(), 'tmp', 'generated_documents');

// Ensure the temporary directory exists
fs.mkdir(TMP_DIR, { recursive: true }).catch(console.error);

documentGenerationQueue.process(async (job) => {
  const { userId, cvId, format } = job.data as DocumentGenerationJobData;

  try {
    // Update job progress
    await job.progress(10);

    // 1. Fetch CV data
    const cv = await cvRepository.findById(cvId);
    if (!cv) {
      throw new Error(`CV with ID ${cvId} not found.`);
    }

    // This is a simplified CvData structure. In a real app, you'd map the Prisma CV object
    // to the CvData interface expected by the document generation service.
    const cvData = {
      personal_info: cv.personal_info || { name: 'Unknown', email: '', phone: '' },
      experience: cv.experience || [],
      education: cv.education || [],
      skills: cv.skills || [],
      languages: cv.languages || []
    };

    let documentBuffer: Buffer;
    let fileName: string;
    let contentType: string;

    await job.progress(40);

    // 2. Generate document based on format
    if (format === 'pdf') {
      documentBuffer = await documentGenerationService.generateCVPDF(cvData);
      fileName = `${cvId}.pdf`;
      contentType = 'application/pdf';
    } else if (format === 'docx') {
      documentBuffer = await documentGenerationService.generateCVDOCX(cvData);
      fileName = `${cvId}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      throw new Error(`Unsupported document format: ${format}`);
    }

    await job.progress(80);

    // 3. Save the generated document to a temporary location
    // In a production scenario, this would likely be uploaded to cloud storage (e.g., Supabase Storage)
    // and a URL returned, or directly streamed back to the client if the job is short-lived.
    const filePath = path.join(TMP_DIR, fileName);
    await fs.writeFile(filePath, documentBuffer);

    await job.progress(100);

    // Return information about the generated file (e.g., its path)
    return { filePath, fileName, contentType };
  } catch (error: any) {
    console.error(`Document generation job for CV ${cvId} failed:`, error);
    // You might want to update the CV status or notify the user of the failure
    throw new Error(`Failed to generate document for CV ${cvId}: ${error.message}`);
  }
});

// Optional: Add event listeners for logging/monitoring specific to this processor
documentGenerationQueue.on('failed', (job, err) => {
  console.error(`Document generation job ${job.id} failed: ${err.message}`);
});

documentGenerationQueue.on('completed', (job, result) => {
  console.log(`Document generation job ${job.id} completed. Result:`, result);
});
