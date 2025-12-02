// src/tests/cv.repository.test.ts
import { cvRepository } from '@/repositories/cv.repository';
import { prisma } from '@/config/database';
import { CV, CVVersion, Prisma } from '@prisma/client';
import { CvData } from '@/types/cv.types';

jest.mock('@/config/database', () => ({
  prisma: {
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
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('CV Repository', () => {
  const mockUserId = 'user-123';
  const mockCvData: CvData = {
    personal_info: { firstName: 'John', lastName: 'Doe', name: 'John Doe' },
    experience: [{ title: 'Developer', company: 'Tech Inc', startDate: '2022-01-01' }],
    education: [],
    skills: [],
    languages: [],
    summary: 'A summary',
  };

  const mockCV: CV = {
    id: 1,
    user_id: mockUserId,
    title: 'My CV',
    file_path: null,
    created_at: new Date(),
    updated_at: new Date(),
    personal_info: mockCvData.personal_info ? mockCvData.personal_info as unknown as Prisma.JsonValue : null,
    experience: mockCvData.experience ? mockCvData.experience as unknown as Prisma.JsonValue : [],
    education: mockCvData.education ? mockCvData.education as unknown as Prisma.JsonValue : [],
    skills: mockCvData.skills ? mockCvData.skills as unknown as Prisma.JsonValue : [],
    languages: mockCvData.languages ? mockCvData.languages as unknown as Prisma.JsonValue : [],
    summary: mockCvData.summary || null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new CV with the provided data', async () => {
      (prisma.cV.create as jest.Mock).mockResolvedValue(mockCV);
      const result = await cvRepository.create(mockUserId, { title: 'My CV', ...mockCvData });
      expect(prisma.cV.create).toHaveBeenCalledWith({
        data: {
          user_id: mockUserId,
          title: 'My CV',
          file_path: undefined,
          personal_info: mockCvData.personal_info,
          experience: mockCvData.experience,
          education: mockCvData.education,
          skills: mockCvData.skills,
          languages: mockCvData.languages,
          summary: mockCvData.summary,
        },
      });
      expect(result).toEqual(mockCV);
    });
  });

  describe('findById', () => {
    it('should return a CV if found', async () => {
      (prisma.cV.findUnique as jest.Mock).mockResolvedValue(mockCV);
      const result = await cvRepository.findById(1);
      expect(prisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockCV);
    });
  });

  describe('updateCV', () => {
    it('should update a CV with new data', async () => {
      const updates: Partial<CvData> = { summary: 'An updated summary' };
      const updatedCV = { ...mockCV, ...updates };
      (prisma.cV.update as jest.Mock).mockResolvedValue(updatedCV);

      const result = await cvRepository.updateCV(1, updates);

      expect(prisma.cV.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
            summary: 'An updated summary',
            updated_at: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedCV);
    });
  });
  
  describe('createVersion', () => {
    it('should create a new CV version', async () => {
        const mockVersion: CVVersion = { id: 1, cv_id: 1, version_number: 1, snapshot: mockCvData as any, created_at: new Date() };
        (prisma.cVVersion.create as jest.Mock).mockResolvedValue(mockVersion);

        const result = await cvRepository.createVersion(1, 1, mockCvData);

        expect(prisma.cVVersion.create).toHaveBeenCalledWith({
            data: {
                cv_id: 1,
                version_number: 1,
                snapshot: mockCvData,
            },
        });
        expect(result).toEqual(mockVersion);
    });
  });

});
