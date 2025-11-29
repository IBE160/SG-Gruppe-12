// src/services/cv.service.ts
import { cvRepository } from '../repositories/cv.repository';
import { UnauthorizedError, NotFoundError } from '../utils/errors.util';
import { userRepository } from '../repositories/user.repository';
import { CV, CVComponent } from '@prisma/client';
import { CvData, PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '../types/cv.types';
import { experienceEntrySchema, educationEntrySchema, skillEntrySchema, languageEntrySchema } from '../validators/cv.validator';
import * as jsonpatch from 'fast-json-patch'; // Import fast-json-patch

// --- Transformation Layer ---
async function assembleCvData(cvShell: CV, userId: string): Promise<CvData> {
  const components = await cvRepository.findComponentsByIds(cvShell.component_ids);
  const user = await userRepository.findById(userId);

  if (!user) {
      throw new NotFoundError('User not found for assembling CV data');
  }
  
  const assembledData: CvData = {
    personal_info: { 
        firstName: user.firstName || '', 
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phoneNumber || '',
        linkedin: '', // These fields are not directly on User model
        website: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };

  components.forEach(component => {
    switch (component.component_type) {
      case 'personal_info':
        assembledData.personal_info = component.content as unknown as PersonalInfo;
        break;
      case 'work_experience':
        assembledData.experience.push(component.content as unknown as ExperienceEntry);
        break;
      case 'education':
        assembledData.education.push(component.content as unknown as EducationEntry);
        break;
      case 'skill':
        assembledData.skills.push(component.content as unknown as SkillEntry);
        break;
      case 'language':
        assembledData.languages.push(component.content as unknown as LanguageEntry);
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
async function createNewVersion(cvId: number, userId: string, previousCvData: CvData, currentCvData: CvData) {
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
  async createCV(userId: string, data: { title: string; component_ids: number[] }): Promise<CV> {
    return cvRepository.create(userId, data.title);
  },

  async updateCV(userId: string, cvId: string, data: CvData): Promise<CV> {
    const cvIdNum = parseInt(cvId, 10);
    const cvShell = await cvRepository.findById(cvIdNum);
    if (!cvShell || cvShell.user_id !== userId) {
      throw new UnauthorizedError('CV not found or access denied');
    }

    // Clear existing components and add new ones based on parsed data
    const existingComponents = await cvRepository.findComponentsByIds(cvShell.component_ids);
    await Promise.all(existingComponents.map(c => cvRepository.deleteComponentOnly(c.id)));

    const newComponentIds: number[] = [];

    // Add personal info as a component
    if (data.personal_info) {
      const comp = await cvRepository.addComponentOnly(userId, 'personal_info', data.personal_info);
      newComponentIds.push(comp.id);
    }

    // Add experience entries
    for (const exp of data.experience || []) {
      const comp = await cvRepository.addComponentOnly(userId, 'work_experience', exp);
      newComponentIds.push(comp.id);
    }

    // Add education entries
    for (const edu of data.education || []) {
      const comp = await cvRepository.addComponentOnly(userId, 'education', edu);
      newComponentIds.push(comp.id);
    }

    // Add skills
    for (const skill of data.skills || []) {
      const comp = await cvRepository.addComponentOnly(userId, 'skill', { name: skill });
      newComponentIds.push(comp.id);
    }

    // Add languages
    for (const lang of data.languages || []) {
      const comp = await cvRepository.addComponentOnly(userId, 'language', lang);
      newComponentIds.push(comp.id);
    }

    // Update CV with new component IDs
    return cvRepository.update(cvIdNum, { component_ids: newComponentIds });
  },

  async getCVById(userId: string, cvId: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) {
      throw new UnauthorizedError('CV not found or access denied');
    }
    return assembleCvData(cvShell, userId);
  },

  // --- Work Experience ---
  async addWorkExperience(userId: string, cvId: number, data: ExperienceEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId); // Get previous state for delta
    
    const validatedData = experienceEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'work_experience', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell, userId); // Get current state for delta

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateWorkExperience(userId: string, cvId: number, index: number, updates: Partial<ExperienceEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId); // Get previous state for delta

    const componentToUpdate = await findNthComponent(cvShell, 'work_experience', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!, userId); // Get current state for delta

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteWorkExperience(userId: string, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId); // Get previous state for delta

    const componentToDelete = await findNthComponent(cvShell, 'work_experience', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell, userId); // Get current state for delta

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Education ---
  async addEducation(userId: string, cvId: number, data: EducationEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);
    
    const validatedData = educationEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'education', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateEducation(userId: string, cvId: number, index: number, updates: Partial<EducationEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToUpdate = await findNthComponent(cvShell, 'education', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteEducation(userId: string, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToDelete = await findNthComponent(cvShell, 'education', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Skills ---
  async addSkill(userId: string, cvId: number, data: SkillEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const validatedData = skillEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'skill', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateSkill(userId: string, cvId: number, index: number, updates: SkillEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToUpdate = await findNthComponent(cvShell, 'skill', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteSkill(userId: string, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToDelete = await findNthComponent(cvShell, 'skill', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- Languages ---
  async addLanguage(userId: string, cvId: number, data: LanguageEntry): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const validatedData = languageEntrySchema.parse(data);
    const updatedCvShell = await cvRepository.addComponent(cvId, userId, 'language', validatedData);
    const currentCvData = await assembleCvData(updatedCvShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async updateLanguage(userId: string, cvId: number, index: number, updates: Partial<LanguageEntry>): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToUpdate = await findNthComponent(cvShell, 'language', index);
    await cvRepository.updateComponent(componentToUpdate.id, updates);
    
    const updatedShell = await cvRepository.findById(cvId);
    const currentCvData = await assembleCvData(updatedShell!, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },
  async deleteLanguage(userId: string, cvId: number, index: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');
    const previousCvData = await assembleCvData(cvShell, userId);

    const componentToDelete = await findNthComponent(cvShell, 'language', index);
    const updatedShell = await cvRepository.deleteComponent(cvId, componentToDelete.id);
    const currentCvData = await assembleCvData(updatedShell, userId);

    await createNewVersion(cvId, userId, previousCvData, currentCvData);

    return currentCvData;
  },

  // --- CV Versioning API Methods ---
  async listVersions(userId: string, cvId: number): Promise<{ versionNumber: number; createdAt: Date }[]> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');

    const versions = await cvRepository.getVersions(cvId);
    return versions.map(v => ({ versionNumber: v.version_number, createdAt: v.created_at }));
  },

  async getVersionDetails(userId: string, cvId: number, versionNumber: number): Promise<CvData> {
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
            jsonpatch.applyPatch(historicalCvData, version.delta as unknown as jsonpatch.Operation[]);
        } else {
            break; // Stop if we've passed the target version
        }
    }

    return historicalCvData;
  },

  async restoreVersion(userId: string, cvId: number, versionNumber: number): Promise<CvData> {
    const cvShell = await cvRepository.findById(cvId);
    if (!cvShell || cvShell.user_id !== userId) throw new UnauthorizedError('CV not found or access denied');

    const versionToRestore = await this.getVersionDetails(userId, cvId, versionNumber);
    
    // 1. Delete all existing components for the CV.
    const currentComponents = await cvRepository.findComponentsByIds(cvShell.component_ids);
    await Promise.all(currentComponents.map(c => cvRepository.deleteComponentOnly(c.id)));

    const newComponentIds: number[] = [];

    // 2. Create new components for each item in versionToRestore.experience, .education, etc.
    // Re-add personal_info if it's handled as a component
    if (versionToRestore.personal_info) {
        const newPersonalInfoComponent = await cvRepository.addComponentOnly(userId, 'personal_info', versionToRestore.personal_info);
        newComponentIds.push(newPersonalInfoComponent.id);
    }

    for (const exp of versionToRestore.experience) {
        const newComponent = await cvRepository.addComponentOnly(userId, 'work_experience', exp);
        newComponentIds.push(newComponent.id);
    }
    for (const edu of versionToRestore.education) {
        const newComponent = await cvRepository.addComponentOnly(userId, 'education', edu);
        newComponentIds.push(newComponent.id);
    }
    for (const skill of versionToRestore.skills) {
        const newComponent = await cvRepository.addComponentOnly(userId, 'skill', skill);
        newComponentIds.push(newComponent.id);
    }
    for (const lang of versionToRestore.languages) {
        const newComponent = await cvRepository.addComponentOnly(userId, 'language', lang);
        newComponentIds.push(newComponent.id);
    }

    // 3. Update the cvShell.component_ids to reflect the new component IDs.
    await cvRepository.update(cvId, { component_ids: newComponentIds });

    // 4. Create a new version representing this restore operation
    const previousCvData = await assembleCvData(cvShell, cvShell.user_id);
    await createNewVersion(cvId, cvShell.user_id, previousCvData, versionToRestore);

    return versionToRestore;
  },
};