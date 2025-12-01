// src/services/cv.service.ts
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { Prisma } from '@prisma/client';
import { CvData, PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '../types/cv.types';
import {
  experienceEntrySchema,
  educationEntrySchema,
  skillEntrySchema,
  languageEntrySchema
} from '../validators/cv.validator';

// Helper to create a new version after a CV update
async function createNewVersion(cvId: number, currentCvData: CvData) {
  const latestVersionNumber = await cvRepository.getLatestVersionNumber(cvId);
  const newVersionNumber = latestVersionNumber + 1;

  await cvRepository.createVersion(cvId, newVersionNumber, currentCvData);
}

export const cvService = {
  /**
   * Creates a new CV record and its initial version.
   * @param userId The ID of the user.
   * @param data Initial CV data including title, file_path, and content.
   * @returns The newly created CV.
   */
  async createCV(userId: string, data: { title?: string; file_path?: string; } & Partial<CvData>): Promise<CvData & { id: number }> {
    const newCV = await cvRepository.create(userId, data);
    const initialCvData: CvData = {
      personal_info: newCV.personal_info as PersonalInfo,
      education: newCV.education as EducationEntry[],
      experience: newCV.experience as ExperienceEntry[],
      skills: newCV.skills as SkillEntry[],
      languages: newCV.languages as LanguageEntry[],
      summary: newCV.summary || undefined,
    };
    await createNewVersion(newCV.id, initialCvData);
    return { id: newCV.id, ...initialCvData };
  },

  /**
   * Retrieves a CV by ID for a specific user.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @returns The CV data.
   */
  async getCVById(userId: string, cvId: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await cvRepository.findById(cvId);
    if (!cv) {
      throw new NotFoundError('CV not found');
    }
    if (cv.user_id !== userId) {
      throw new UnauthorizedError('Not authorized to access this CV');
    }
    return {
      id: cv.id,
      title: cv.title || undefined,
      file_path: cv.file_path || undefined,
      personal_info: cv.personal_info as PersonalInfo,
      education: cv.education as EducationEntry[],
      experience: cv.experience as ExperienceEntry[],
      skills: cv.skills as SkillEntry[],
      languages: cv.languages as LanguageEntry[],
      summary: cv.summary || undefined,
    };
  },

  /**
   * Updates a CV record and creates a new version.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV to update.
   * @param updates Partial CV data to apply.
   * @returns The updated CV data.
   */
  async updateCV(userId: string, cvId: number, updates: Partial<CvData>): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const existingCV = await this.getCVById(userId, cvId); // Performs auth check
    const updatedCV = await cvRepository.updateCV(cvId, {
      ...existingCV, // Merge existing data to ensure full snapshot
      ...updates,
      personal_info: updates.personal_info,
      education: updates.education,
      experience: updates.experience,
      skills: updates.skills,
      languages: updates.languages,
    });

    const newCvData: CvData & { id: number; title?: string; file_path?: string; } = {
      id: updatedCV.id,
      title: updatedCV.title || undefined,
      file_path: updatedCV.file_path || undefined,
      personal_info: updatedCV.personal_info as PersonalInfo,
      education: updatedCV.education as EducationEntry[],
      experience: updatedCV.experience as ExperienceEntry[],
      skills: updatedCV.skills as SkillEntry[],
      languages: updatedCV.languages as LanguageEntry[],
      summary: updatedCV.summary || undefined,
    };

    await createNewVersion(cvId, newCvData);
    return newCvData;
  },

  /**
   * Adds a work experience entry to a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param data The experience entry to add.
   * @returns The updated CV data.
   */
  async addWorkExperience(userId: string, cvId: number, data: ExperienceEntry): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const validatedData = experienceEntrySchema.parse(data);
    const experiences = (cv.experience as ExperienceEntry[] | undefined) ?? [];
    const updatedExperience = [...experiences, validatedData];
    return this.updateCV(userId, cvId, { experience: updatedExperience });
  },

  /**
   * Updates a specific work experience entry in a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to update.
   * @param updates Partial data for the update.
   * @returns The updated CV data.
   */
  async updateWorkExperience(userId: string, cvId: number, index: number, updates: Partial<ExperienceEntry>): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const experiences = (cv.experience as ExperienceEntry[] | undefined) ?? [];
    if (index < 0 || index >= experiences.length) {
      throw new NotFoundError('Work experience entry not found');
    }
    const updatedExperiences = experiences.map((exp, i) =>
      i === index ? { ...exp, ...updates } : exp
    );
    return this.updateCV(userId, cvId, { experience: updatedExperiences });
  },

  /**
   * Deletes a specific work experience entry from a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to delete.
   * @returns The updated CV data.
   */
  async deleteWorkExperience(userId: string, cvId: number, index: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const experiences = (cv.experience as ExperienceEntry[] | undefined) ?? [];
    if (index < 0 || index >= experiences.length) {
      throw new NotFoundError('Work experience entry not found');
    }
    const updatedExperiences = experiences.filter((_, i) => i !== index);
    return this.updateCV(userId, cvId, { experience: updatedExperiences });
  },

  /**
   * Adds an education entry to a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param data The education entry to add.
   * @returns The updated CV data.
   */
  async addEducation(userId: string, cvId: number, data: EducationEntry): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const validatedData = educationEntrySchema.parse(data);
    const education = (cv.education as EducationEntry[] | undefined) ?? [];
    const updatedEducation = [...education, validatedData];
    return this.updateCV(userId, cvId, { education: updatedEducation });
  },

  /**
   * Updates a specific education entry in a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to update.
   * @param updates Partial data for the update.
   * @returns The updated CV data.
   */
  async updateEducation(userId: string, cvId: number, index: number, updates: Partial<EducationEntry>): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const education = (cv.education as EducationEntry[] | undefined) ?? [];
    if (index < 0 || index >= education.length) {
      throw new NotFoundError('Education entry not found');
    }
    const updatedEducation = education.map((edu, i) =>
      i === index ? { ...edu, ...updates } : edu
    );
    return this.updateCV(userId, cvId, { education: updatedEducation });
  },

  /**
   * Deletes a specific education entry from a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to delete.
   * @returns The updated CV data.
   */
  async deleteEducation(userId: string, cvId: number, index: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const education = (cv.education as EducationEntry[] | undefined) ?? [];
    if (index < 0 || index >= education.length) {
      throw new NotFoundError('Education entry not found');
    }
    const updatedEducation = education.filter((_, i) => i !== index);
    return this.updateCV(userId, cvId, { education: updatedEducation });
  },

  /**
   * Adds a skill entry to a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param data The skill entry to add.
   * @returns The updated CV data.
   */
  async addSkill(userId: string, cvId: number, data: SkillEntry): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const validatedData = skillEntrySchema.parse(data);
    const skills = (cv.skills as SkillEntry[] | undefined) ?? [];
    const updatedSkills = [...skills, validatedData];
    return this.updateCV(userId, cvId, { skills: updatedSkills });
  },

  /**
   * Updates a specific skill entry in a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to update.
   * @param updates Partial data for the update.
   * @returns The updated CV data.
   */
  async updateSkill(userId: string, cvId: number, index: number, updates: Partial<SkillEntry>): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const skills = (cv.skills as SkillEntry[] | undefined) ?? [];
    if (index < 0 || index >= skills.length) {
      throw new NotFoundError('Skill entry not found');
    }
    const updatedSkills = skills.map((skill, i) =>
      i === index ? { ...skill, ...updates } : skill
    );
    return this.updateCV(userId, cvId, { skills: updatedSkills });
  },

  /**
   * Deletes a specific skill entry from a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to delete.
   * @returns The updated CV data.
   */
  async deleteSkill(userId: string, cvId: number, index: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const skills = (cv.skills as SkillEntry[] | undefined) ?? [];
    if (index < 0 || index >= skills.length) {
      throw new NotFoundError('Skill entry not found');
    }
    const updatedSkills = skills.filter((_, i) => i !== index);
    return this.updateCV(userId, cvId, { skills: updatedSkills });
  },

  /**
   * Adds a language entry to a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param data The language entry to add.
   * @returns The updated CV data.
   */
  async addLanguage(userId: string, cvId: number, data: LanguageEntry): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const validatedData = languageEntrySchema.parse(data);
    const languages = (cv.languages as LanguageEntry[] | undefined) ?? [];
    const updatedLanguages = [...languages, validatedData];
    return this.updateCV(userId, cvId, { languages: updatedLanguages });
  },

  /**
   * Updates a specific language entry in a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to update.
   * @param updates Partial data for the update.
   * @returns The updated CV data.
   */
  async updateLanguage(userId: string, cvId: number, index: number, updates: Partial<LanguageEntry>): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const languages = (cv.languages as LanguageEntry[] | undefined) ?? [];
    if (index < 0 || index >= languages.length) {
      throw new NotFoundError('Language entry not found');
    }
    const updatedLanguages = languages.map((lang, i) =>
      i === index ? { ...lang, ...updates } : lang
    );
    return this.updateCV(userId, cvId, { languages: updatedLanguages });
  },

  /**
   * Deletes a specific language entry from a CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param index The index of the entry to delete.
   * @returns The updated CV data.
   */
  async deleteLanguage(userId: string, cvId: number, index: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const cv = await this.getCVById(userId, cvId); // Performs auth check
    const languages = (cv.languages as LanguageEntry[] | undefined) ?? [];
    if (index < 0 || index >= languages.length) {
      throw new NotFoundError('Language entry not found');
    }
    const updatedLanguages = languages.filter((_, i) => i !== index);
    return this.updateCV(userId, cvId, { languages: updatedLanguages });
  },

  /**
   * Retrieves all versions for a given CV.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @returns An array of CV version summaries.s
   */
  async listVersions(userId: string, cvId: number): Promise<{ versionNumber: number; createdAt: Date }[]> {
    await this.getCVById(userId, cvId); // Performs auth check
    const versions = await cvRepository.getVersions(cvId);
    return versions.map(v => ({ versionNumber: v.version_number, createdAt: v.created_at }));
  },

  /**
   * Retrieves a specific CV version's data by its number.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param versionNumber The version number to retrieve.
   * @returns The full CV data for the specified version.
   */
  async getVersionDetails(userId: string, cvId: number, versionNumber: number): Promise<CvData> {
    await this.getCVById(userId, cvId); // Performs auth check
    const cvVersion = await cvRepository.getVersionByNumber(cvId, versionNumber);
    if (!cvVersion) {
      throw new NotFoundError(`CV Version ${versionNumber} not found`);
    }
    return cvVersion.snapshot as any;
  },

  /**
   * Restores a specific CV version, overwriting the current CV and creating a new version.
   * @param userId The ID of the user.
   * @param cvId The ID of the CV.
   * @param versionNumber The version number to restore.
   * @returns The restored CV data.
   */
  async restoreVersion(userId: string, cvId: number, versionNumber: number): Promise<CvData & { id: number; title?: string; file_path?: string; }> {
    const versionToRestore = await this.getVersionDetails(userId, cvId, versionNumber); // Performs auth check internally
    return this.updateCV(userId, cvId, versionToRestore);
  },
};