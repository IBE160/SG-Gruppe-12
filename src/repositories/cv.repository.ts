// src/repositories/cv.repository.ts
import { prisma } from '../config/database';
import { Cv, CvVersion, Prisma } from '@prisma/client';
import { CvData } from '../types/cv.types'; // Using types for content

export const cvRepository = {
  /**
   * Creates a new CV record.
   * @param userId The ID of the user owning the CV.
   * @param data Initial CV data (title, file_path, and JSONB content).
   * @returns The created CV object.
   */
  async create(userId: string, data: { title?: string; file_path?: string; } & Partial<CvData>): Promise<Cv> {
    const { title, file_path, personal_info, education, experience, skills, languages, summary } = data;
    return prisma.cv.create({
      data: {
        user_id: userId,
        title: title,
        file_path: file_path,
        personal_info: personal_info ? (personal_info as unknown as Prisma.InputJsonValue) : undefined,
        education: education ? (education as unknown as Prisma.InputJsonValue) : undefined,
        experience: experience ? (experience as unknown as Prisma.InputJsonValue) : undefined,
        skills: skills ? (skills as unknown as Prisma.InputJsonValue) : undefined,
        languages: languages ? (languages as unknown as Prisma.InputJsonValue) : undefined,
        summary: summary,
      },
    });
  },

  /**
   * Finds a CV by its ID.
   * @param id The ID of the CV.
   * @returns The CV object or null if not found.
   */
  async findById(id: number): Promise<Cv | null> {
    return prisma.cv.findUnique({
      where: { id },
    });
  },

  /**
   * Finds all CVs for a user.
   * @param userId The ID of the user.
   * @returns An array of CV objects.
   */
  async findByUserId(userId: string): Promise<Cv[]> {
    return prisma.cv.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  },

  /**
   * Updates a CV record.
   * @param cvId The ID of the CV to update.
   * @param data The partial CV data to update (title, file_path, and JSONB content).
   * @returns The updated CV object.
   */
  async updateCV(cvId: number, data: { title?: string; file_path?: string; } & Partial<CvData>): Promise<Cv> {
    const { title, file_path, personal_info, education, experience, skills, languages, summary } = data;
    return prisma.cv.update({
      where: { id: cvId },
      data: {
        title: title,
        file_path: file_path,
        personal_info: personal_info ? (personal_info as unknown as Prisma.InputJsonValue) : undefined,
        education: education ? (education as unknown as Prisma.InputJsonValue) : undefined,
        experience: experience ? (experience as unknown as Prisma.InputJsonValue) : undefined,
        skills: skills ? (skills as unknown as Prisma.InputJsonValue) : undefined,
        languages: languages ? (languages as unknown as Prisma.InputJsonValue) : undefined,
        summary: summary,
        updated_at: new Date(),
      },
    });
  },

  /**
   * Deletes a CV record.
   * @param cvId The ID of the CV to delete.
   */
  async delete(cvId: number): Promise<void> {
    await prisma.cv.delete({
      where: { id: cvId },
    });
  },

  // --- CV Versioning Methods ---
  /**
   * Creates a new version snapshot of a CV.
   * @param cvId The ID of the CV.
   * @param versionNumber The version number.
   * @param snapshot The full CV data snapshot for this version.
   * @returns The created CVVersion object.
   */
  async createVersion(cvId: number, versionNumber: number, snapshot: CvData): Promise<CvVersion> {
    return prisma.cvVersion.create({
      data: {
        cv_id: cvId,
        version_number: versionNumber,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  },

  /**
   * Retrieves all versions for a given CV.
   * @param cvId The ID of the CV.
   * @returns An array of CvVersion objects.
   */
  async getVersions(cvId: number): Promise<CvVersion[]> {
    return prisma.cvVersion.findMany({
      where: { cv_id: cvId },
      orderBy: { version_number: 'asc' },
    });
  },

  /**
   * Retrieves the latest version number for a CV.
   * @param cvId The ID of the CV.
   * @returns The latest version number or 0 if no versions exist.
   */
  async getLatestVersionNumber(cvId: number): Promise<number> {
    const latestVersion = await prisma.cvVersion.findFirst({
      where: { cv_id: cvId },
      orderBy: { version_number: 'desc' },
    });
    return latestVersion ? latestVersion.version_number : 0;
  },

  /**
   * Retrieves a specific CV version by its number.
   * @param cvId The ID of the CV.
   * @param versionNumber The version number to retrieve.
   * @returns The CvVersion object or null if not found.
   */
  async getVersionByNumber(cvId: number, versionNumber: number): Promise<CvVersion | null> {
    return prisma.cvVersion.findUnique({
      where: { cv_id_version_number: { cv_id: cvId, version_number: versionNumber } },
    });
  },
};