// src/repositories/cv.repository.ts
import { prisma } from '../config/database';
import { CV, CVVersion } from '@prisma/client'; // Import generated types from Prisma Client
import { PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '../types/cv.types'; // Import all entry types

export const cvRepository = {
  async create(data: {
    userId: string;
    personal_info: PersonalInfo;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    skills: SkillEntry[];
    languages: LanguageEntry[];
  }): Promise<CV> {
    return prisma.cV.create({
      data: {
        userId: data.userId,
        personal_info: data.personal_info,
        education: data.education,
        experience: data.experience,
        skills: data.skills,
        languages: data.languages,
      },
    });
  },

  async findById(id: string): Promise<CV | null> {
    return prisma.cV.findUnique({
      where: { id },
    });
  },

  async findByUserId(userId: string): Promise<CV[]> {
    return prisma.cV.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' },
    });
  },

  async update(id: string, data: Partial<{
    personal_info: PersonalInfo;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    skills: SkillEntry[];
    languages: LanguageEntry[];
  }>): Promise<CV> {
    return prisma.cV.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<CV> {
    return prisma.cV.delete({
      where: { id },
    });
  },

  async createVersion(
    cvId: string,
    snapshot: any,
    versionNumber: number
  ): Promise<CVVersion> {
    return prisma.cVVersion.create({
      data: {
        cvId: cvId,
        version_number: versionNumber,
        snapshot: snapshot,
      },
    });
  },

  async getLatestVersion(cvId: string): Promise<CVVersion | null> {
    return prisma.cVVersion.findFirst({
      where: { cvId },
      orderBy: { version_number: 'desc' },
    });
  },

  async getVersionById(id: string): Promise<CVVersion | null> {
    return prisma.cVVersion.findUnique({
      where: { id },
    });
  },

  async getVersionsByCvId(cvId: string): Promise<CVVersion[]> {
    return prisma.cVVersion.findMany({
      where: { cvId },
      orderBy: { version_number: 'asc' },
    });
  },

  // --- Work Experience specific methods ---
  async addWorkExperience(cvId: string, experience: ExperienceEntry): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) {
      throw new Error('CV not found');
    }
    const updatedExperience = [...(currentCV.experience as ExperienceEntry[]), experience];
    return this.update(cvId, { experience: updatedExperience });
  },

  async updateWorkExperience(cvId: string, index: number, experience: Partial<ExperienceEntry>): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) {
      throw new Error('CV not found');
    }
    const currentExperience = currentCV.experience as ExperienceEntry[];
    if (index < 0 || index >= currentExperience.length) {
      throw new Error('Work experience entry not found');
    }
    currentExperience[index] = { ...currentExperience[index], ...experience };
    return this.update(cvId, { experience: currentExperience });
  },

  async deleteWorkExperience(cvId: string, index: number): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) {
      throw new Error('CV not found');
    }
    const currentExperience = currentCV.experience as ExperienceEntry[];
    if (index < 0 || index >= currentExperience.length) {
      throw new Error('Work experience entry not found');
    }
    const updatedExperience = currentExperience.filter((_, i) => i !== index);
    return this.update(cvId, { experience: updatedExperience });
  },

  // --- Education specific methods ---
  async addEducation(cvId: string, education: EducationEntry): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const updatedEducation = [...(currentCV.education as EducationEntry[]), education];
    return this.update(cvId, { education: updatedEducation });
  },

  async updateEducation(cvId: string, index: number, education: Partial<EducationEntry>): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentEducation = currentCV.education as EducationEntry[];
    if (index < 0 || index >= currentEducation.length) throw new Error('Education entry not found');
    currentEducation[index] = { ...currentEducation[index], ...education };
    return this.update(cvId, { education: currentEducation });
  },

  async deleteEducation(cvId: string, index: number): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentEducation = currentCV.education as EducationEntry[];
    if (index < 0 || index >= currentEducation.length) throw new Error('Education entry not found');
    const updatedEducation = currentEducation.filter((_, i) => i !== index);
    return this.update(cvId, { education: updatedEducation });
  },

  // --- Skills specific methods ---
  async addSkill(cvId: string, skill: SkillEntry): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const updatedSkills = [...(currentCV.skills as SkillEntry[]), skill];
    return this.update(cvId, { skills: updatedSkills });
  },

  async updateSkill(cvId: string, index: number, skill: SkillEntry): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentSkills = currentCV.skills as SkillEntry[];
    if (index < 0 || index >= currentSkills.length) throw new Error('Skill entry not found');
    currentSkills[index] = skill; // Assuming skill is a simple string, direct replacement
    return this.update(cvId, { skills: currentSkills });
  },

  async deleteSkill(cvId: string, index: number): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentSkills = currentCV.skills as SkillEntry[];
    if (index < 0 || index >= currentSkills.length) throw new Error('Skill entry not found');
    const updatedSkills = currentSkills.filter((_, i) => i !== index);
    return this.update(cvId, { skills: updatedSkills });
  },

  // --- Languages specific methods ---
  async addLanguage(cvId: string, language: LanguageEntry): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const updatedLanguages = [...(currentCV.languages as LanguageEntry[]), language];
    return this.update(cvId, { languages: updatedLanguages });
  },

  async updateLanguage(cvId: string, index: number, language: Partial<LanguageEntry>): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentLanguages = currentCV.languages as LanguageEntry[];
    if (index < 0 || index >= currentLanguages.length) throw new Error('Language entry not found');
    currentLanguages[index] = { ...currentLanguages[index], ...language };
    return this.update(cvId, { languages: currentLanguages });
  },

  async deleteLanguage(cvId: string, index: number): Promise<CV> {
    const currentCV = await this.findById(cvId);
    if (!currentCV) throw new Error('CV not found');
    const currentLanguages = currentCV.languages as LanguageEntry[];
    if (index < 0 || index >= currentLanguages.length) throw new Error('Language entry not found');
    const updatedLanguages = currentLanguages.filter((_, i) => i !== index);
    return this.update(cvId, { languages: updatedLanguages });
  },
};
