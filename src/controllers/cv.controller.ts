// src/controllers/cv.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware'; // Assuming AuthRequest type is defined here or similar
import { parsingService } from '../services/parsing.service';
import { cvParsingQueue } from '../jobs'; // Import the BullMQ queue
import { cvService } from '../services/cv.service'; // Import cvService

export const cvController = {
  // Placeholder for parsing and creating CV from file upload
  async parseAndCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = req.user!.id; // User ID from authenticated request
      const fileBuffer = req.file.buffer;
      const fileType = req.file.mimetype; // Multer provides this

      // 1. Create a placeholder CV entry immediately
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
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // Extracted by auth middleware
      const cvData = req.body; // Validated by Zod middleware

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
      const userId = req.user!.id;
      const cvId = req.params.id;

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
      const userId = req.user!.id;
      const cvId = req.params.cvId; // Renamed from :id to :cvId to avoid conflict
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
      const userId = req.user!.id;
      const cvId = req.params.cvId;
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
};

