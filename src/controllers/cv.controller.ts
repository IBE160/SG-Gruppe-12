// src/controllers/cv.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware'; // Assuming AuthRequest type is defined here or similar
import { parsingService } from '../services/parsing.service';
import { cvParsingQueue, documentGenerationQueue } from '../jobs'; // Import both Bull queues
import { cvService } from '../services/cv.service'; // Import cvService

export const cvController = {
  // New method to request a document generation
  async requestDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { cvId, format } = req.params as { cvId: string; format: 'pdf' | 'docx' };

      // Optional: Add a check to ensure the user owns the CV
      const cv = await cvService.getCVById(userId, cvId);
      if (!cv) {
        return res.status(404).json({ success: false, message: 'CV not found or access denied.' });
      }

      // Add the document generation job to the queue
      const job = await documentGenerationQueue.add({
        userId,
        cvId,
        format,
      });

      // Respond with 202 Accepted and the job ID for status polling
      res.status(202).json({
        success: true,
        data: { jobId: job.id },
        message: `Document generation for CV ${cvId} in ${format} format has been queued.`
      });
    } catch (error) {
      next(error);
    }
  },

  // New method to get the status of a generation job
  async getJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const job = await documentGenerationQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }

      // Optional: Check if the user requesting the status is the one who created the job
      if (job.data.userId !== req.user!.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const state = await job.getState();
      const progress = await job.progress();
      const result = job.returnvalue;
      const reason = job.failedReason;

      res.status(200).json({
        success: true,
        data: {
          jobId: job.id,
          state,
          progress,
          result,
          reason,
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // New method to download the generated file
  async downloadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const job = await documentGenerationQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }

      // Check if the user is authorized to download this file
      if (job.data.userId !== req.user!.userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const isCompleted = await job.isCompleted();

      if (!isCompleted) {
        return res.status(400).json({ success: false, message: 'Job is not yet complete.' });
      }

      const { filePath, fileName, contentType } = job.returnvalue;

      if (!filePath || !fileName) {
        return res.status(500).json({ success: false, message: 'File information is missing from the completed job.' });
      }

      // Set headers and send the file for download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.download(filePath, fileName, (err) => {
        if (err) {
          // Handle errors that occur during file download
          next(err);
        }
        // After download, you might want to clean up the temporary file.
        // For simplicity, this is omitted here, but in production you'd use something like:
        // fs.unlink(filePath).catch(console.error);
      });
    } catch (error) {
      next(error);
    }
  },

  // Placeholder for parsing and creating CV from file upload
  // TODO: Implement in future epic - requires Multer file upload middleware
  async parseAndCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - TODO: Add Multer types when implementing file upload
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user!.userId; // User ID from authenticated request
      // @ts-ignore - req.file from Multer (not yet implemented)
      const fileBuffer = req.file.buffer;
      // @ts-ignore - req.file from Multer (not yet implemented)
      const fileType = req.file.mimetype; // Multer provides this

      // 1. Create a placeholder CV entry immediately
      // @ts-ignore - TODO: Implement createCV method in cvService
      const placeholderCV = await cvService.createCV(userId, {
        personal_info: {
          firstName: '',
          lastName: '',
        }, // Minimal placeholder, will be filled by parsing job
        education: [],
        experience: [],
        skills: [],
        languages: [],
      });

      // 2. Add the parsing job to the BullMQ queue
      await cvParsingQueue.add({
        userId,
        fileContent: fileBuffer.toString('utf-8'), // File content as string
        fileType,
        cvId: placeholderCV.id,
      });

      res.status(202).json({
        success: true,
        data: { cvId: placeholderCV.id },
        message: 'CV parsing initiated. You will be notified when complete.'
      });

    } catch (error) {
      next(error);
    }
  },

  // Existing methods from architecture documentation (if they were to exist)
  // TODO: Implement in future epic - requires createCV method in cvService
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId; // Extracted by auth middleware
      const cvData = req.body; // Validated by Zod middleware

      // @ts-ignore - TODO: Implement createCV method in cvService
      const newCV = await cvService.createCV(userId, cvData);

      res.status(201).json({
        success: true,
        data: newCV,
        message: 'CV created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.id, 10);

      const cv = await cvService.getCVById(userId, cvId);

      res.status(200).json({
        success: true,
        data: cv
      });
    } catch (error) {
      next(error);
    }
  },

  async addExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const experienceData = req.body;

      const updatedCV = await cvService.addWorkExperience(userId, cvId, experienceData);

      res.status(201).json({
        success: true,
        data: updatedCV,
        message: 'Work experience added successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const experienceIndex = parseInt(req.params.experienceIndex, 10);
      const updates = req.body;

      const updatedCV = await cvService.updateWorkExperience(userId, cvId, experienceIndex, updates);

      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Work experience updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteExperience(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const experienceIndex = parseInt(req.params.experienceIndex, 10);

      const updatedCV = await cvService.deleteWorkExperience(userId, cvId, experienceIndex);

      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Work experience deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async addEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const educationData = req.body;
      const updatedCV = await cvService.addEducation(userId, cvId, educationData);
      res.status(201).json({
        success: true,
        data: updatedCV,
        message: 'Education entry added successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const educationIndex = parseInt(req.params.educationIndex, 10);
      const updates = req.body;
      const updatedCV = await cvService.updateEducation(userId, cvId, educationIndex, updates);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Education entry updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteEducation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const educationIndex = parseInt(req.params.educationIndex, 10);
      const updatedCV = await cvService.deleteEducation(userId, cvId, educationIndex);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Education entry deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async addSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const skillData = req.body.skill; // Assuming skill is sent as { skill: "..." }
      const updatedCV = await cvService.addSkill(userId, cvId, skillData);
      res.status(201).json({
        success: true,
        data: updatedCV,
        message: 'Skill added successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const skillIndex = parseInt(req.params.skillIndex, 10);
      const skillData = req.body.skill; // Assuming skill is sent as { skill: "..." }
      const updatedCV = await cvService.updateSkill(userId, cvId, skillIndex, skillData);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Skill updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const skillIndex = parseInt(req.params.skillIndex, 10);
      const updatedCV = await cvService.deleteSkill(userId, cvId, skillIndex);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Skill deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async addLanguage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const languageData = req.body;
      const updatedCV = await cvService.addLanguage(userId, cvId, languageData);
      res.status(201).json({
        success: true,
        data: updatedCV,
        message: 'Language entry added successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateLanguage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const languageIndex = parseInt(req.params.languageIndex, 10);
      const updates = req.body;
      const updatedCV = await cvService.updateLanguage(userId, cvId, languageIndex, updates);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Language entry updated successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteLanguage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const languageIndex = parseInt(req.params.languageIndex, 10);
      const updatedCV = await cvService.deleteLanguage(userId, cvId, languageIndex);
      res.status(200).json({
        success: true,
        data: updatedCV,
        message: 'Language entry deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  // --- CV Versioning Methods ---
  async listCvVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const versions = await cvService.listVersions(userId, cvId);
      res.status(200).json({
        success: true,
        data: versions,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCvVersionDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const versionNumber = parseInt(req.params.versionNumber, 10);
      const cvData = await cvService.getVersionDetails(userId, cvId, versionNumber);
      res.status(200).json({
        success: true,
        data: cvData,
      });
    } catch (error) {
      next(error);
    }
  },

  async restoreCvVersion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.userId.toString(), 10);
      const cvId = parseInt(req.params.cvId, 10);
      const versionNumber = parseInt(req.params.versionNumber, 10);
      const restoredCvData = await cvService.restoreVersion(userId, cvId, versionNumber);
      res.status(200).json({
        success: true,
        data: restoredCvData,
        message: 'CV restored successfully (preview only). Full database restore is a future feature.',
      });
    } catch (error) {
      next(error);
    }
  },
};

