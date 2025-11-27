// src/controllers/cv.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { parsingService } from '../services/parsing.service';
import { cvParsingQueue, documentGenerationQueue } from '../jobs';
import { cvService } from '../services/cv.service';

export const cvController = {
  async requestDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { cvId, format } = req.params as { cvId: string; format: 'pdf' | 'docx' };

      const cv = await cvService.getCVById(userId, parseInt(cvId, 10));
      if (!cv) {
        return res.status(404).json({ success: false, message: 'CV not found or access denied.' });
      }

      const job = await documentGenerationQueue.add({
        userId,
        cvId,
        format,
      });

      res.status(202).json({
        success: true,
        data: { jobId: job.id },
        message: `Document generation for CV ${cvId} in ${format} format has been queued.`
      });
    } catch (error) {
      next(error);
    }
  },

  async getJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const job = await documentGenerationQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }

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

  async downloadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const job = await documentGenerationQueue.getJob(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found.' });
      }

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

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.download(filePath, fileName, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async parseAndCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user!.userId;
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype;

      const placeholderCV = await cvService.createCV(userId, {
        title: 'New CV',
        component_ids: [],
      });

      await cvParsingQueue.add({
        userId,
        fileContent: fileBuffer.toString('utf-8'),
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

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const cvData = req.body;

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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
      const cvId = parseInt(req.params.cvId, 10);
      const skillData = req.body.skill;
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
      const userId = req.user!.userId;
      const cvId = parseInt(req.params.cvId, 10);
      const skillIndex = parseInt(req.params.skillIndex, 10);
      const skillData = req.body.skill;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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

  async listCvVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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
      const userId = req.user!.userId;
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

