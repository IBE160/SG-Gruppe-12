// src/repositories/cv.repository.ts
import { prisma } from '../config/database';
import { CV, CVComponent, CVVersion } from '@prisma/client';
import { ExperienceEntry } from '../types/cv.types'; // Using types for content

export const cvRepository = {
  // Creates a CV shell. Components are added separately.
  async create(userId: string, title: string): Promise<CV> {
    return prisma.cV.create({
      data: {
        user_id: userId,
        title: title,
        component_ids: [],
      },
    });
  },

  // Finds a CV shell by its ID.
  async findById(id: number): Promise<CV | null> {
    return prisma.cV.findUnique({
      where: { id },
    });
  },

  // Finds all CV shells for a user.
  async findByUserId(userId: string): Promise<CV[]> {
    return prisma.cV.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  },
  
  // --- Component-based Methods ---

  async findComponentById(id: number): Promise<CVComponent | null> {
    return prisma.cVComponent.findUnique({
      where: { id },
    });
  },

  async findComponentsByIds(ids: number[]): Promise<CVComponent[]> {
    return prisma.cVComponent.findMany({
      where: {
        id: { in: ids }
      }
    });
  },

  // Adds a new component (e.g., work experience) and links it to a CV
  async addComponent(cvId: number, userId: string, type: string, content: any): Promise<CV> {
    const newComponent = await prisma.cVComponent.create({
      data: {
        user_id: userId,
        component_type: type,
        content: content,
      },
    });

    return prisma.cV.update({
      where: { id: cvId },
      data: {
        component_ids: {
          push: newComponent.id,
        },
      },
    });
  },

  async update(cvId: number, data: { component_ids?: number[] }): Promise<CV> {
    return prisma.cV.update({
      where: { id: cvId },
      data: data,
    });
  },


  // Updates the content of a specific component
  async updateComponent(componentId: number, content: any): Promise<CVComponent> {
    // First, fetch the existing component to merge the content
    const existingComponent = await this.findComponentById(componentId);
    if (!existingComponent) {
      throw new Error('Component not found');
    }
    const newContent = { ...existingComponent.content as object, ...content };

    return prisma.cVComponent.update({
      where: { id: componentId },
      data: {
        content: newContent,
      },
    });
  },

  // Deletes a component and removes its ID from the parent CV
  async deleteComponent(cvId: number, componentId: number): Promise<CV> {
    await prisma.cVComponent.delete({
      where: { id: componentId },
    });

    const cv = await this.findById(cvId);
    if (!cv) {
      throw new Error('CV not found');
    }

    const newComponentIds = cv.component_ids.filter(id => id !== componentId);

    return prisma.cV.update({
      where: { id: cvId },
      data: {
        component_ids: newComponentIds,
      },
    });
  },

  // --- CV Versioning Methods ---
  async createVersion(cvId: number, versionNumber: number, delta: any): Promise<CVVersion> {
    return prisma.cVVersion.create({
      data: {
        cv_id: cvId,
        version_number: versionNumber,
        delta: delta,
      },
    });
  },

  async getVersions(cvId: number): Promise<CVVersion[]> {
    return prisma.cVVersion.findMany({
      where: { cv_id: cvId },
      orderBy: { version_number: 'asc' },
    });
  },

  async getLatestVersionNumber(cvId: number): Promise<number> {
    const latestVersion = await prisma.cVVersion.findFirst({
      where: { cv_id: cvId },
      orderBy: { version_number: 'desc' },
    });
    return latestVersion ? latestVersion.version_number : 0;
  },

  async getVersionByNumber(cvId: number, versionNumber: number): Promise<CVVersion | null> {
    return prisma.cVVersion.findUnique({
      where: { cv_id_version_number: { cv_id: cvId, version_number: versionNumber } },
    });
  },

  async addComponentOnly(userId: string, type: string, content: any): Promise<CVComponent> {
    return prisma.cVComponent.create({
      data: {
        user_id: userId,
        component_type: type,
        content: content,
      },
    });
  },

  async deleteComponentOnly(componentId: number): Promise<void> {
    await prisma.cVComponent.delete({
      where: { id: componentId },
    });
  },
};