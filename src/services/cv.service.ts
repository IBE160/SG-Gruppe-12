// src/services/cv.service.ts
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { CV, CVComponent } from '@prisma/client';
import { CvData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '../types/cv.types';
import { experienceEntrySchema, educationEntrySchema, skillEntrySchema, languageEntrySchema } from '../validators/cv.validator';
import * as jsonpatch from 'fast-json-patch'; // Import fast-json-patch

// --- Transformation Layer ---
async function assembleCvData(cvShell: CV): Promise<CvData> {
  const components = await cvRepository.findComponentsByIds(cvShell.component_ids);
  
  const assembledData: CvData = {
    personal_info: { firstName: '', lastName: '' },
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };

  components.forEach(component => {
    switch (component.component_type) {
      case 'personal_info': // Assuming personal_info will eventually be a component
        assembledData.personal_info = component.content as any;
        break;
      case 'work_experience':
        assembledData.experience.push(component.content as ExperienceEntry);
        break;
      case 'education':
        assembledData.education.push(component.content as EducationEntry);
        break;
      case 'skill':
        assembledData.skills.push(component.content as SkillEntry);
        break;
      case 'language':
        assembledData.languages.push(component.content as LanguageEntry);
        break;
    }
  });

  return assembledData;
}

// Helper to find the Nth component of a specific type
async function findNthComponent(cvShell: CV, type: string, index: number): Promise<CVComponent> {
    const allComponents = await cvRepository.findComponentsByIds(cvShell.component_ids);
    const filteredComponents = allComponents.filter(c => c.component_type === type);
    
    if (index < 0 || index >= filteredComponents.length) {
      throw new NotFoundError(`Component of type ${type} not found at index ${index}.`);
    }
    
    return filteredComponents[index];
}

// Helper to create a new version after a CV update
async function createNewVersion(cvId: number, previousCvData: CvData, currentCvData: CvData) {
    const latestVersionNumber = await cvRepository.getLatestVersionNumber(cvId);
    const newVersionNumber = latestVersionNumber + 1;

    // Calculate JSON patch delta
    const delta = jsonpatch.compare(previousCvData, currentCvData);

    // Only create a version if there are actual changes
    if (delta.length > 0) {
        await cvRepository.createVersion(cvId, newVersionNumber, delta);
    }
}

export const cvService = {
  async getCVById(userId: number, cvId: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) {
      throw new UnauthorizedError('CV not found or access denied');
    }
    return assembleCvData(cvShell);
  },

  // --- Work Experience ---
  async addWorkExperience(userId: number, cvId: number, data: ExperienceEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell); // Get previous state for delta
    
    const validatedData = experienceEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'work_experience', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell); // Get current state for delta

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateWorkExperience(userId: number, cvId: number, index: number, updates: Partial<ExperienceEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell); // Get previous state for delta

    const componentToUpdate = await findNthComponent(cvShell, 'work_experience', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!); // Get current state for delta

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteWorkExperience(userId: number, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell); // Get previous state for delta

    const componentToDelete = await findNthComponent(cvShell, 'work_experience', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell); // Get current state for delta

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Education ---
  async addEducation(userId: number, cvId: number, data: EducationEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);
    
    const validatedData = educationEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'education', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateEducation(userId: number, cvId: number, index: number, updates: Partial<EducationEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToUpdate = await findNthComponent(cvShell, 'education', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteEducation(userId: number, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToDelete = await findNthComponent(cvShell, 'education', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Skills ---
  async addSkill(userId: number, cvId: number, data: SkillEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const validatedData = skillEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'skill', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateSkill(userId: number, cvId: number, index: number, updates: SkillEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToUpdate = await findNthComponent(cvShell, 'skill', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteSkill(userId: number, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToDelete = await findNthComponent(cvShell, 'skill', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Languages ---
  async addLanguage(userId: number, cvId: number, data: LanguageEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const validatedData = languageEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'language', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateLanguage(userId: number, cvId: number, index: number, updates: Partial<LanguageEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToUpdate = await findNthComponent(cvShell, 'language', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteLanguage(userId: number, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell);

    const componentToDelete = await findNthComponent(cvShell, 'language', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell);

    await createNewVersion(cvId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- CV Versioning API Methods ---
  async listVersions(userId: number, cvId: number): Promise<{ versionNumber: number; createdAt: Date }[]> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');

    const versions = await cvRepository.getVersions(cvId);
    return versions.map(v => ({ versionNumber: v.version_number, createdAt: v.created_at }));
  },

  async getVersionDetails(userId: number, cvId: number, versionNumber: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');

    // Start with a blank CV (or a base version if one exists)
    let historicalCvData: CvData = {
        personal_info: { firstName: '', lastName: '' },
        experience: [],
        education: [],
        skills: [],
        languages: [],
    };
    
    // Apply all patches up to the requested version
    const versions = await cvRepository.getVersions(cvId);
    for (const version of versions) {
        if (version.version_number <= versionNumber) {
            // Apply the patch to the historical data
            jsonpatch.applyPatch(historicalCvData, version.delta);
        } else {
            break; // Stop if we've passed the target version
        }
    }

    return historicalCvData;
  },

  async restoreVersion(userId: number, cvId: number, versionNumber: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');

    const versionToRestore = await this.getVersionDetails(userId, cvId, versionNumber);
    
    // This is the tricky part with normalized data.
    // To "restore" a version means to replace the current CV's components with those of the restored version.
    // This would involve:
    // 1. Deleting all existing components for the CV.
    // 2. Creating new components for each item in versionToRestore.experience, .education, etc.
    // 3. Updating the cvShell.component_ids to reflect the new component IDs.
    // This is beyond the scope of a simple service method modification here.

    // For now, as an MVP, we will only return the reconstructed version.
    // A true restore would involve updating the database.
    return versionToRestore;
  },
};