// src/tests/unit/cv.repository.test.ts
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { cvRepository } from '../../repositories/cv.repository';
import { prisma } from '../../config/database'; // Import the actual prisma instance
import { CvData } from '../../types/cv.types';
import { PrismaClient } from '@prisma/client';


jest.mock('../../config/database', () => ({
  prisma: require('jest-mock-extended').mockDeep(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;


describe('CV Repository Unit Tests', () => {
  const userId = 'test-user-id';
  const cvId = 1;
  const mockCvData: CvData = {
    personal_info: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
    experience: [{ title: 'Developer', company: 'Tech Corp', start_date: '2020-01-01' }],
  };

  const mockCreatedCV = {
    id: cvId,
    user_id: userId,
    title: 'My CV',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
    personal_info: mockCvData.personal_info as any,
    education: [], experience: [], skills: [], languages: [], summary: null
  };

  const mockFoundCV = {
    id: cvId,
    user_id: userId,
    title: 'My CV',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
    personal_info: mockCvData.personal_info as any,
    education: [], experience: [], skills: [], languages: [], summary: null
  };

  const mockUpdatedCV = {
    id: cvId,
    user_id: userId,
    title: 'Updated CV Title',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
    personal_info: mockCvData.personal_info as any,
    education: [], experience: [], skills: [], languages: [], summary: null
  };

  const mockCreatedVersion = {
    id: 1,
    cv_id: cvId,
    version_number: 1,
    snapshot: mockCvData as any,
    created_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new CV', async () => {
      prismaMock.cv.create.mockResolvedValue(mockCreatedCV);

      const result = await cvRepository.create(userId, { title: 'My CV', ...mockCvData });

      expect(prismaMock.cv.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: userId,
          title: 'My CV',
          personal_info: mockCvData.personal_info,
        }),
      });
      expect(result).toEqual(mockCreatedCV);
    });
  });

  describe('findById', () => {
    it('should find a CV by ID', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(mockFoundCV);

      const result = await cvRepository.findById(cvId);

      expect(prismaMock.cv.findUnique).toHaveBeenCalledWith({
        where: { id: cvId },
      });
      expect(result).toEqual(mockFoundCV);
    });

    it('should return null if CV not found', async () => {
      prismaMock.cv.findUnique.mockResolvedValue(null);
      const result = await cvRepository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all CVs for a user', async () => {
      const mockUserCVs = [mockFoundCV];
      prismaMock.cv.findMany.mockResolvedValue(mockUserCVs);

      const result = await cvRepository.findByUserId(userId);

      expect(prismaMock.cv.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockUserCVs);
    });
  });

  describe('updateCV', () => {
    it('should update a CV', async () => {
      const updatedTitle = 'Updated CV Title';
      prismaMock.cv.update.mockResolvedValue(mockUpdatedCV);

      const result = await cvRepository.updateCV(cvId, { title: updatedTitle });

      expect(prismaMock.cv.update).toHaveBeenCalledWith({
        where: { id: cvId },
        data: expect.objectContaining({ title: updatedTitle }),
      });
      expect(result).toEqual(mockUpdatedCV);
    });
  });

  describe('delete', () => {
    it('should delete a CV', async () => {
      prismaMock.cv.delete.mockResolvedValue(mockFoundCV);

      await cvRepository.delete(cvId);

      expect(prismaMock.cv.delete).toHaveBeenCalledWith({
        where: { id: cvId },
      });
    });
  });

  describe('createVersion', () => {
    it('should create a new CV version', async () => {
      const versionNumber = 1;
      prismaMock.cvVersion.create.mockResolvedValue(mockCreatedVersion);

      const result = await cvRepository.createVersion(cvId, versionNumber, mockCvData);

      expect(prismaMock.cvVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cv_id: cvId,
          version_number: versionNumber,
          snapshot: mockCvData,
        }),
      });
      expect(result).toEqual(mockCreatedVersion);
    });
  });

  describe('getVersions', () => {
    it('should retrieve all versions for a CV', async () => {
      const mockVersions = [mockCreatedVersion];
      prismaMock.cvVersion.findMany.mockResolvedValue(mockVersions);

      const result = await cvRepository.getVersions(cvId);

      expect(prismaMock.cvVersion.findMany).toHaveBeenCalledWith({
        where: { cv_id: cvId },
        orderBy: { version_number: 'asc' },
      });
      expect(result).toEqual(mockVersions);
    });
  });

  describe('getLatestVersionNumber', () => {
    it('should return the latest version number', async () => {
      prismaMock.cvVersion.findFirst.mockResolvedValue({ version_number: 5 } as any);
      const result = await cvRepository.getLatestVersionNumber(cvId);
      expect(result).toBe(5);
    });

    it('should return 0 if no versions exist', async () => {
      prismaMock.cvVersion.findFirst.mockResolvedValue(null);
      const result = await cvRepository.getLatestVersionNumber(cvId);
      expect(result).toBe(0);
    });
  });

  describe('getVersionByNumber', () => {
    it('should retrieve a specific CV version by number', async () => {
      const versionNumber = 1;
      const mockVersion = mockCreatedVersion;
      prismaMock.cvVersion.findUnique.mockResolvedValue(mockVersion);

      const result = await cvRepository.getVersionByNumber(cvId, versionNumber);

      expect(prismaMock.cvVersion.findUnique).toHaveBeenCalledWith({
        where: { cv_id_version_number: { cv_id: cvId, version_number: versionNumber } },
      });
      expect(result).toEqual(mockVersion);
    });

    it('should return null if version not found', async () => {
      prismaMock.cvVersion.findUnique.mockResolvedValue(null);
      const result = await cvRepository.getVersionByNumber(cvId, 999);
      expect(result).toBeNull();
    });
  });
});
