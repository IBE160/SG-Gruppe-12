// src/tests/cv.service.test.ts
import { cvService } from '@/services/cv.service';
import { cvRepository } from '@/repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '@/utils/errors.util';
import { Cv, CvVersion, Prisma } from '@prisma/client';
import { CvData } from '@/types/cv.types';

jest.mock('@/repositories/cv.repository');

describe('CV Service', () => {
  const mockUserId = 'user-123';
  const mockCvId = 1;
  const mockCvData: CvData = {
    personalInfo: { firstName: 'John', lastName: 'Doe', name: 'John Doe' },
    experience: [{ title: 'Developer', company: 'Tech Inc', start_date: '2022-01-01' }],
    education: [],
    skills: [],
    languages: [],
    summary: 'A summary',
  };

  const mockCV: Cv = {
    id: mockCvId,
    userId: mockUserId,
    title: 'My CV',
    filePath: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    personalInfo: mockCvData.personal_info as unknown as Prisma.JsonValue,
    experience: mockCvData.experience as unknown as Prisma.JsonValue,
    education: mockCvData.education as unknown as Prisma.JsonValue,
    skills: mockCvData.skills as unknown as Prisma.JsonValue,
    languages: mockCvData.languages as unknown as Prisma.JsonValue,
    summary: mockCvData.summary || null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCV', () => {
    it('should create a new CV and a first version', async () => {
      (cvRepository.create as jest.Mock).mockResolvedValue(mockCV);
      (cvRepository.getLatestVersionNumber as jest.Mock).mockResolvedValue(0);
      (cvRepository.createVersion as jest.Mock).mockResolvedValue({});


      const result = await cvService.createCV(mockUserId, { title: 'My CV', ...mockCvData });

      expect(cvRepository.create).toHaveBeenCalledWith(mockUserId, { title: 'My CV', ...mockCvData });
      expect(cvRepository.createVersion).toHaveBeenCalledWith(mockCvId, 1, expect.any(Object));
      expect(result).toEqual({ id: mockCV.id, ...mockCvData });
    });
  });

  describe('getCVById', () => {
    it('should return a CV if found and user is owner', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);
      const result = await cvService.getCVById(mockUserId, mockCvId);
      expect(result).toEqual({
        id: mockCV.id,
        title: mockCV.title || undefined,
        filePath: mockCV.filePath || undefined,
        ...mockCvData
      });
    });

    it('should throw UnauthorizedError if user is not owner', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue({ ...mockCV, userId: 'another-user' });
      await expect(cvService.getCVById(mockUserId, mockCvId)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('addWorkExperience', () => {
    it('should add a work experience entry and create a new version', async () => {
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);
        (cvRepository.updateCV as jest.Mock).mockResolvedValue({ ...mockCV, experience: [...(mockCV.experience as any[]), { title: 'New Job' }] as any });
        (cvRepository.getLatestVersionNumber as jest.Mock).mockResolvedValue(1);
        (cvRepository.createVersion as jest.Mock).mockResolvedValue({});


        const newExperience = { title: 'New Job', company: 'NewCo', start_date: '2023-01-01' };
        await cvService.addWorkExperience(mockUserId, mockCvId, newExperience);

        expect(cvRepository.updateCV).toHaveBeenCalled();
        expect(cvRepository.createVersion).toHaveBeenCalledWith(mockCvId, 2, expect.any(Object));
    });
  });
  
});
