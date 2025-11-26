// src/tests/cv.service.test.ts
import { cvService } from '../services/cv.service';
import { cvRepository } from '../repositories/cv.repository';
import { createCVSchema, updateCVSchema } from '../validators/cv.validator';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util'; // Assuming these exist

// Mock the cvRepository
jest.mock('../repositories/cv.repository', () => ({
  cvRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createVersion: jest.fn(),
    getLatestVersion: jest.fn(),
    addWorkExperience: jest.fn(), // New mock
    updateWorkExperience: jest.fn(), // New mock
    deleteWorkExperience: jest.fn(), // New mock
  },
}));

// Mock the cv.validator.ts module
jest.mock('../validators/cv.validator', () => ({
  createCVSchema: {
    parse: jest.fn(),
  },
  updateCVSchema: {
    parse: jest.fn(),
  },
}));

describe('CV Service', () => {
  const mockUserId = 'user123';
  const mockCVId = 'cv123';

  const mockCVData = {
    personal_info: { firstName: 'John', lastName: 'Doe' },
    education: [],
    experience: [],
    skills: [],
    languages: [],
  };

  const mockCV = {
    id: mockCVId,
    userId: mockUserId,
    ...mockCVData,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCVVersion = {
    id: 'cvVer123',
    cvId: mockCVId,
    version_number: 1,
    snapshot: mockCV,
    created_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure parse methods return the data they receive for simplicity in tests
    (createCVSchema.parse as jest.Mock).mockImplementation((data) => data);
    (updateCVSchema.parse as jest.Mock).mockImplementation((data) => data);
  });

  describe('createCV', () => {
    it('should create a CV and an initial version', async () => {
      (cvRepository.create as jest.Mock).mockResolvedValue(mockCV);
      (cvRepository.createVersion as jest.Mock).mockResolvedValue(mockCVVersion);

      const result = await cvService.createCV(mockUserId, mockCVData);

      expect(createCVSchema.parse).toHaveBeenCalledWith(mockCVData);
      expect(cvRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        ...mockCVData,
      });
      expect(cvRepository.createVersion).toHaveBeenCalledWith(mockCVId, mockCVData, 1);
      expect(result).toEqual(mockCV);
    });
  });

  describe('getCVById', () => {
    it('should return a CV if found and authorized', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);

      const result = await cvService.getCVById(mockUserId, mockCVId);

      expect(cvRepository.findById).toHaveBeenCalledWith(mockCVId);
      expect(result).toEqual(mockCV);
    });

    it('should throw NotFoundError if CV is not found', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(cvService.getCVById(mockUserId, mockCVId)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
      const unauthorizedCV = { ...mockCV, userId: 'otherUser' };
      (cvRepository.findById as jest.Mock).mockResolvedValue(unauthorizedCV);

      await expect(cvService.getCVById(mockUserId, mockCVId)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateCV', () => {
    const updates = { personal_info: { firstName: 'Jane' } };
    const updatedCV = { ...mockCV, personal_info: { ...mockCV.personal_info, firstName: 'Jane' } };

    it('should update a CV and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValue(mockCVVersion);
      (cvRepository.update as jest.Mock).mockResolvedValue(updatedCV);
      // Need to mock findById again for the snapshot retrieval in service
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCV).mockResolvedValueOnce(updatedCV);


      const result = await cvService.updateCV(mockUserId, mockCVId, updates);

      expect(updateCVSchema.parse).toHaveBeenCalledWith(updates);
      expect(cvRepository.findById).toHaveBeenCalledWith(mockCVId); // For auth check
      expect(cvRepository.getLatestVersion).toHaveBeenCalledWith(mockCVId);
      expect(cvRepository.update).toHaveBeenCalledWith(mockCVId, updates);
      expect(cvRepository.createVersion).toHaveBeenCalledWith(mockCVId, updatedCV, mockCVVersion.version_number + 1);
      expect(result).toEqual(updatedCV);
    });

    it('should throw NotFoundError if CV is not found during update (initial check)', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(cvService.updateCV(mockUserId, mockCVId, updates)).rejects.toThrow(NotFoundError);
    });

    it('should throw UnauthorizedError if user is not authorized during update', async () => {
      const unauthorizedCV = { ...mockCV, userId: 'otherUser' };
      (cvRepository.findById as jest.Mock).mockResolvedValue(unauthorizedCV);

      await expect(cvService.updateCV(mockUserId, mockCVId, updates)).rejects.toThrow(UnauthorizedError);
    });

    it('should handle no previous version by starting from version 1', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCV);
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValue(null); // No previous version
      (cvRepository.update as jest.Mock).mockResolvedValue(updatedCV);
      // Need to mock findById again for the snapshot retrieval in service
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCV).mockResolvedValueOnce(updatedCV);


      const result = await cvService.updateCV(mockUserId, mockCVId, updates);

      expect(cvRepository.createVersion).toHaveBeenCalledWith(mockCVId, updatedCV, 1);
      expect(result).toEqual(updatedCV);
    });

    it('should throw NotFoundError if updated CV not found for snapshotting', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCV).mockResolvedValueOnce(null); // Initial check passes, but updated CV not found for snapshot
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValue(mockCVVersion);
      (cvRepository.update as jest.Mock).mockResolvedValue(updatedCV);

      await expect(cvService.updateCV(mockUserId, mockCVId, updates)).rejects.toThrow(NotFoundError);
    });
  });

  describe('addWorkExperience', () => {
    const newExperience = {
      title: 'Software Engineer', company: 'Tech Corp', startDate: '2020-01-01', endDate: '2022-12-31'
    };
    const updatedCVAfterAdd = { ...mockCV, experience: [newExperience] };

    it('should add a new work experience and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCV); // For auth check
      (cvRepository.addWorkExperience as jest.Mock).mockResolvedValueOnce(updatedCVAfterAdd);
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(updatedCVAfterAdd); // For snapshot
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValueOnce(mockCVVersion);

      const result = await cvService.addWorkExperience(mockUserId, mockCVId, newExperience);

      expect(cvRepository.findById).toHaveBeenCalledWith(mockCVId);
      expect(cvRepository.addWorkExperience).toHaveBeenCalledWith(mockCVId, newExperience);
      expect(cvRepository.createVersion).toHaveBeenCalledWith(
        mockCVId, updatedCVAfterAdd, mockCVVersion.version_number + 1
      );
      expect(result).toEqual(updatedCVAfterAdd);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
      const unauthorizedCV = { ...mockCV, userId: 'otherUser' };
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(unauthorizedCV);

      await expect(cvService.addWorkExperience(mockUserId, mockCVId, newExperience)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('updateWorkExperience', () => {
    const existingExperience = {
      title: 'Junior Dev', company: 'StartUp', startDate: '2019-01-01', endDate: '2019-12-31'
    };
    const mockCVWithExperience = { ...mockCV, experience: [existingExperience] };
    const updates = { title: 'Senior Developer' };
    const updatedExperience = { ...existingExperience, ...updates };
    const updatedCVAfterUpdate = { ...mockCV, experience: [updatedExperience] };

    it('should update an existing work experience and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCVWithExperience); // For auth check
      (cvRepository.updateWorkExperience as jest.Mock).mockResolvedValueOnce(updatedCVAfterUpdate);
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(updatedCVAfterUpdate); // For snapshot
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValueOnce(mockCVVersion);

      const result = await cvService.updateWorkExperience(mockUserId, mockCVId, 0, updates);

      expect(cvRepository.findById).toHaveBeenCalledWith(mockCVId);
      expect(cvRepository.updateWorkExperience).toHaveBeenCalledWith(mockCVId, 0, updates);
      expect(cvRepository.createVersion).toHaveBeenCalledWith(
        mockCVId, updatedCVAfterUpdate, mockCVVersion.version_number + 1
      );
      expect(result).toEqual(updatedCVAfterUpdate);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
      const unauthorizedCV = { ...mockCV, userId: 'otherUser' };
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(unauthorizedCV);

      await expect(cvService.updateWorkExperience(mockUserId, mockCVId, 0, updates)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('deleteWorkExperience', () => {
    const existingExperience = {
      title: 'Junior Dev', company: 'StartUp', startDate: '2019-01-01', endDate: '2019-12-31'
    };
    const mockCVWithExperience = { ...mockCV, experience: [existingExperience] };
    const updatedCVAfterDelete = { ...mockCV, experience: [] };

    it('should delete a work experience and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(mockCVWithExperience); // For auth check
      (cvRepository.deleteWorkExperience as jest.Mock).mockResolvedValueOnce(updatedCVAfterDelete);
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(updatedCVAfterDelete); // For snapshot
      (cvRepository.getLatestVersion as jest.Mock).mockResolvedValueOnce(mockCVVersion);

      const result = await cvService.deleteWorkExperience(mockUserId, mockCVId, 0);

      expect(cvRepository.findById).toHaveBeenCalledWith(mockCVId);
      expect(cvRepository.deleteWorkExperience).toHaveBeenCalledWith(mockCVId, 0);
      expect(cvRepository.createVersion).toHaveBeenCalledWith(
        mockCVId, updatedCVAfterDelete, mockCVVersion.version_number + 1
      );
      expect(result).toEqual(updatedCVAfterDelete);
    });

    it('should throw UnauthorizedError if user is not authorized', async () => {
      const unauthorizedCV = { ...mockCV, userId: 'otherUser' };
      (cvRepository.findById as jest.Mock).mockResolvedValueOnce(unauthorizedCV);

      await expect(cvService.deleteWorkExperience(mockUserId, mockCVId, 0)).rejects.toThrow(UnauthorizedError);
    });
  });
});
