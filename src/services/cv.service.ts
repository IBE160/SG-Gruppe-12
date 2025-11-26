// src/services/cv.service.ts
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { CV } from '@prisma/client'; // Import generated Prisma CV type
import { CreateCVInput, UpdateCVInput, createCVSchema, updateCVSchema, experienceEntrySchema, ExperienceEntry, educationEntrySchema, EducationEntry, skillEntrySchema, SkillEntry, languageEntrySchema, LanguageEntry } from '../validators/cv.validator'; // Import all entry schemas and types

export const cvService = {
  async createCV(userId: string, cvData: CreateCVInput): Promise<CV> {
    // Validate incoming CV data using Zod
    const validatedData = createCVSchema.parse(cvData);

    // Business logic: Create CV with initial version
    const cv = await cvRepository.create({
      userId,
      personal_info: validatedData.personal_info,
      education: validatedData.education,
      experience: validatedData.experience,
      skills: validatedData.skills,
      languages: validatedData.languages,
    });

    // Create initial version snapshot
    await cvRepository.createVersion(cv.id, validatedData, 1);

    return cv;
  },

  async getCVById(userId: string, cvId: string): Promise<CV> {
    const cv = await cvRepository.findById(cvId);

    if (!cv) {
      throw new NotFoundError('CV not found');
    }

    if (cv.userId !== userId) {
      throw new UnauthorizedError('Not authorized to access this CV');
    }

    return cv;
  },

  async updateCV(userId: string, cvId: string, updates: UpdateCVInput): Promise<CV> {
    const cv = await this.getCVById(userId, cvId); // Authorization check

    // Validate incoming update data using Zod
    const validatedUpdates = updateCVSchema.parse(updates);

    // Business logic: Increment version number on update
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    // Update CV
    const updatedCV = await cvRepository.update(cvId, validatedUpdates);

    // Create version snapshot (need to fetch the full updated CV for snapshot)
    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) {
      throw new NotFoundError('Updated CV not found for snapshotting');
    }
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);

    return updatedCV;
  },

  async addWorkExperience(userId: string, cvId: string, experienceData: ExperienceEntry): Promise<CV> {
    const cv = await this.getCVById(userId, cvId); // Auth and existence check
    const validatedExperience = experienceEntrySchema.parse(experienceData);

    const updatedCv = await cvRepository.addWorkExperience(cvId, validatedExperience);
    
    // Create new version after modification
    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after adding experience for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);

    return updatedCv;
  },

  async updateWorkExperience(userId: string, cvId: string, experienceIndex: number, updates: Partial<ExperienceEntry>): Promise<CV> {
    const cv = await this.getCVById(userId, cvId); // Auth and existence check
    // Validate updates against partial schema if necessary, or rely on full entry validation
    
    const updatedCv = await cvRepository.updateWorkExperience(cvId, experienceIndex, updates);

    // Create new version after modification
    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after updating experience for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);

    return updatedCv;
  },

  async deleteWorkExperience(userId: string, cvId: string, experienceIndex: number): Promise<CV> {
    const cv = await this.getCVById(userId, cvId); // Auth and existence check

    const updatedCv = await cvRepository.deleteWorkExperience(cvId, experienceIndex);

    // Create new version after modification
    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after deleting experience for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);

    return updatedCv;
  },

  // --- Education specific methods ---
  async addEducation(userId: string, cvId: string, educationData: EducationEntry): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const validatedEducation = educationEntrySchema.parse(educationData);

    const updatedCv = await cvRepository.addEducation(cvId, validatedEducation);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after adding education for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async updateEducation(userId: string, cvId: string, educationIndex: number, updates: Partial<EducationEntry>): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    // Add validation for updates if needed
    const updatedCv = await cvRepository.updateEducation(cvId, educationIndex, updates);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after updating education for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async deleteEducation(userId: string, cvId: string, educationIndex: number): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const updatedCv = await cvRepository.deleteEducation(cvId, educationIndex);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after deleting education for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  // --- Skills specific methods ---
  async addSkill(userId: string, cvId: string, skillData: SkillEntry): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const validatedSkill = skillEntrySchema.parse(skillData); // Skills are simple strings, so direct parse

    const updatedCv = await cvRepository.addSkill(cvId, validatedSkill);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after adding skill for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async updateSkill(userId: string, cvId: string, skillIndex: number, skillData: SkillEntry): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const validatedSkill = skillEntrySchema.parse(skillData);

    const updatedCv = await cvRepository.updateSkill(cvId, skillIndex, validatedSkill);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after updating skill for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async deleteSkill(userId: string, cvId: string, skillIndex: number): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const updatedCv = await cvRepository.deleteSkill(cvId, skillIndex);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after deleting skill for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  // --- Languages specific methods ---
  async addLanguage(userId: string, cvId: string, languageData: LanguageEntry): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const validatedLanguage = languageEntrySchema.parse(languageData);

    const updatedCv = await cvRepository.addLanguage(cvId, validatedLanguage);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after adding language for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async updateLanguage(userId: string, cvId: string, languageIndex: number, updates: Partial<LanguageEntry>): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    // Add validation for updates if needed
    const updatedCv = await cvRepository.updateLanguage(cvId, languageIndex, updates);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after updating language for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },

  async deleteLanguage(userId: string, cvId: string, languageIndex: number): Promise<CV> {
    const cv = await this.getCVById(userId, cvId);
    const updatedCv = await cvRepository.deleteLanguage(cvId, languageIndex);

    const fullUpdatedCV = await cvRepository.findById(cvId);
    if (!fullUpdatedCV) throw new NotFoundError('CV not found after deleting language for versioning');
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;
    await cvRepository.createVersion(cvId, fullUpdatedCV, newVersionNumber);
    return updatedCv;
  },
};
