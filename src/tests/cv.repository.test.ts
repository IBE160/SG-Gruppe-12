// src/tests/cv.repository.test.ts
import { cvRepository } from '../repositories/cv.repository';
import { PrismaClient, CV, CVVersion } from '@prisma/client';

// Mock the '../config/database' module.
// The factory function should define the mock object directly.
jest.mock('../config/database', () => {
  const mockPrismaClient = {
    cV: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cVVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    prisma: mockPrismaClient, // Export the mock instance
  };
});

// Cast the imported 'prisma' object to its mocked type for Jest's functions
// We need to import 'prisma' from the mocked module after the mock is defined.
// Since imports are hoisted, we use a trick to get the mocked version.
const { prisma } = jest.requireMock('../config/database');


describe('CV Repository', () => {
  const mockCV: CV = {
    id: 'cv123',
    userId: 'user123',
    personal_info: { firstName: 'John', lastName: 'Doe' },
    education: [] as any, // Cast to any because Prisma's Json type is flexible
    experience: [] as any,
    skills: [] as any,
    languages: [] as any,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCVVersion: CVVersion = {
    id: 'cvVer123',
    cvId: 'cv123',
    version_number: 1,
    snapshot: mockCV as any, // Snapshot is Json type, so needs to be asserted
    created_at: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new CV', async () => {
      (prisma.cV.create as jest.Mock).mockResolvedValue(mockCV);

      const newCV = await cvRepository.create({
        userId: mockCV.userId,
        personal_info: mockCV.personal_info,
        education: mockCV.education,
        experience: mockCV.experience,
        skills: mockCV.skills,
        languages: mockCV.languages,
      });

      expect(prisma.cV.create).toHaveBeenCalledWith({
        data: {
          userId: mockCV.userId,
          personal_info: mockCV.personal_info,
          education: mockCV.education,
          experience: mockCV.experience,
          skills: mockCV.skills,
          languages: mockCV.languages,
        },
      });
      expect(newCV).toEqual(mockCV);
    });
  });

  describe('findById', () => {
    it('should find a CV by its ID', async () => {
      (prisma.cV.findUnique as jest.Mock).mockResolvedValue(mockCV);

      const foundCV = await cvRepository.findById(mockCV.id);

      expect(prisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: mockCV.id } });
      expect(foundCV).toEqual(mockCV);
    });

    it('should return null if CV is not found', async () => {
      (prisma.cV.findUnique as jest.Mock).mockResolvedValue(null);

      const foundCV = await cvRepository.findById('nonExistentId');

      expect(foundCV).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all CVs for a user', async () => {
      (prisma.cV.findMany as jest.Mock).mockResolvedValue([mockCV]);

      const foundCVs = await cvRepository.findByUserId(mockCV.userId);

      expect(prisma.cV.findMany).toHaveBeenCalledWith({
        where: { userId: mockCV.userId },
        orderBy: { created_at: 'desc' },
      });
      expect(foundCVs).toEqual([mockCV]);
    });
  });

  describe('update', () => {
    it('should update a CV', async () => {
      const updatedPersonalInfo = { ...(mockCV.personal_info as object), firstName: 'Jane' };
      const updatedCV = { ...mockCV, personal_info: updatedPersonalInfo };
      (prisma.cV.update as jest.Mock).mockResolvedValue(updatedCV);

      const result = await cvRepository.update(mockCV.id, { personal_info: updatedPersonalInfo });

      expect(prisma.cV.update).toHaveBeenCalledWith({
        where: { id: mockCV.id },
        data: { personal_info: updatedPersonalInfo },
      });
      expect(result).toEqual(updatedCV);
    });
  });

  describe('delete', () => {
    it('should delete a CV', async () => {
      (prisma.cV.delete as jest.Mock).mockResolvedValue(mockCV);

      const deletedCV = await cvRepository.delete(mockCV.id);

      expect(prisma.cV.delete).toHaveBeenCalledWith({ where: { id: mockCV.id } });
      expect(deletedCV).toEqual(mockCV);
    });
  });

  describe('createVersion', () => {
    it('should create a new CV version', async () => {
      (prisma.cVVersion.create as jest.Mock).mockResolvedValue(mockCVVersion);

      const newCVVersion = await cvRepository.createVersion(
        mockCVVersion.cvId,
        mockCVVersion.snapshot,
        mockCVVersion.version_number
      );

      expect(prisma.cVVersion.create).toHaveBeenCalledWith({
        data: {
          cvId: mockCVVersion.cvId,
          version_number: mockCVVersion.version_number,
          snapshot: mockCVVersion.snapshot,
        },
      });
      expect(newCVVersion).toEqual(mockCVVersion);
    });
  });

  describe('getLatestVersion', () => {
    it('should get the latest version of a CV', async () => {
      (prisma.cVVersion.findFirst as jest.Mock).mockResolvedValue(mockCVVersion);

      const latestVersion = await cvRepository.getLatestVersion(mockCV.id);

      expect(prisma.cVVersion.findFirst).toHaveBeenCalledWith({
        where: { cvId: mockCV.id },
        orderBy: { version_number: 'desc' },
      });
      expect(latestVersion).toEqual(mockCVVersion);
    });

    it('should return null if no versions exist', async () => {
      (prisma.cVVersion.findFirst as jest.Mock).mockResolvedValue(null);

      const latestVersion = await cvRepository.getLatestVersion('nonExistentCVId');

      expect(latestVersion).toBeNull();
    });
  });
});
