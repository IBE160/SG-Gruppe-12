// src/tests/cv.service.test.ts
import { cvService } from '../services/cv.service';
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { CV, CVComponent, CVVersion } from '@prisma/client';
import * as jsonpatch from 'fast-json-patch';

// Mock the repository
jest.mock('../repositories/cv.repository');

describe('CV Service (Normalized)', () => {
  const mockUserId = '1';
  const mockCvId = 101;

  const mockExperienceComponent: CVComponent = { id: 201, user_id: mockUserId, component_type: 'work_experience', content: { title: 'Software Engineer', company: 'Tech Corp' }, created_at: new Date(), updated_at: new Date() };

  const mockCvShell: CV = { id: mockCvId, user_id: mockUserId, title: 'My CV', component_ids: [mockExperienceComponent.id], created_at: new Date(), updated_at: new Date() };

  beforeEach(() => {
    jest.clearAllMocks();
    (cvRepository.getLatestVersionNumber as jest.Mock).mockResolvedValue(0);
    (cvRepository.createVersion as jest.Mock).mockResolvedValue({});
    (cvRepository.getVersions as jest.Mock).mockResolvedValue([]);
  });

  describe('getCVById', () => {
    it('should fetch a CV and its components and assemble them', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
      (cvRepository.findComponentsByIds as jest.Mock).mockResolvedValue([mockExperienceComponent]);

      const result = await cvService.getCVById(mockUserId, mockCvId);

      expect(cvRepository.findById).toHaveBeenCalledWith(mockCvId);
      expect(cvRepository.findComponentsByIds).toHaveBeenCalledWith([mockExperienceComponent.id]);
      expect(result.experience).toHaveLength(1);
      expect(result.experience[0].title).toBe('Software Engineer');
    });

    it('should throw UnauthorizedError if user is not the owner', async () => {
        const otherUserCvShell = { ...mockCvShell, user_id: 999 };
        (cvRepository.findById as jest.Mock).mockResolvedValue(otherUserCvShell);

        await expect(cvService.getCVById(mockUserId, mockCvId)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Work Experience CRUD', () => {
    const newExperience = { title: 'New Role', company: 'NewCo', startDate: '2020-01-01' };
    const mockComponentAfterAdd: CVComponent = { id: 205, user_id: mockUserId, component_type: 'work_experience', content: newExperience, created_at: new Date(), updated_at: new Date() };

    it('should add a work experience component and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
      (cvRepository.addComponent as jest.Mock).mockResolvedValue({ ...mockCvShell, component_ids: [...mockCvShell.component_ids, mockComponentAfterAdd.id] });
      (cvRepository.findComponentsByIds as jest.Mock).mockResolvedValue([mockExperienceComponent, mockComponentAfterAdd]);

      const result = await cvService.addWorkExperience(mockUserId, mockCvId, newExperience);

      expect(cvRepository.addComponent).toHaveBeenCalledWith(mockCvId, mockUserId, 'work_experience', newExperience);
      expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
      expect(result.experience).toHaveLength(2);
    });

    it('should update a specific work experience component and create a new version', async () => {
        const updates = { company: 'Mega Corp' };
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
        (cvRepository.findComponentsByIds as jest.Mock).mockResolvedValue([mockExperienceComponent]);
        (cvRepository.updateComponent as jest.Mock).mockResolvedValue({
            ...mockExperienceComponent,
            content: { ...(mockExperienceComponent.content as object), ...updates }
        });
        
        await cvService.updateWorkExperience(mockUserId, mockCvId, 0, updates);
        
        expect(cvRepository.updateComponent).toHaveBeenCalledWith(mockExperienceComponent.id, updates);
        expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
    });

    it('should delete a specific work experience component and create a new version', async () => {
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
        (cvRepository.findComponentsByIds as jest.Mock).mockResolvedValue([mockExperienceComponent]);
        (cvRepository.deleteComponent as jest.Mock).mockResolvedValue({ ...mockCvShell, component_ids: [] });

        const result = await cvService.deleteWorkExperience(mockUserId, mockCvId, 0);

        expect(cvRepository.deleteComponent).toHaveBeenCalledWith(mockCvId, mockExperienceComponent.id);
        expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
        expect(result.experience).toHaveLength(0);
    });
  });
  
  describe('Versioning', () => {
    const mockVersions = [
        { cv_id: mockCvId, version_number: 1, delta: [{ op: 'add', path: '/experience/0', value: { title: 'Exp 1' } }], created_at: new Date('2023-01-01') },
        { cv_id: mockCvId, version_number: 2, delta: [{ op: 'replace', path: '/experience/0/title', value: 'Exp 1 Updated' }], created_at: new Date('2023-01-02') },
      ];

    it('should list CV versions', async () => {
        (cvRepository.getVersions as jest.Mock).mockResolvedValue(mockVersions);
  
        const result = await cvService.listVersions(mockUserId, mockCvId);
  
        expect(cvRepository.getVersions).toHaveBeenCalledWith(mockCvId);
        expect(result).toHaveLength(2);
        expect(result[0].versionNumber).toBe(1);
      });

    it('should reconstruct CV data for a specific version', async () => {
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell); // For auth check
        (cvRepository.getVersions as jest.Mock).mockResolvedValue(mockVersions);
  
        const result = await cvService.getVersionDetails(mockUserId, mockCvId, 2);
  
        expect(result.experience).toHaveLength(1);
        expect(result.experience[0].title).toBe('Exp 1 Updated');
      });

    it('should reconstruct and return CV data for restoreVersion', async () => {
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell); // For auth check
        (cvRepository.getVersions as jest.Mock).mockResolvedValue(mockVersions);

        const result = await cvService.restoreVersion(mockUserId, mockCvId, 1);

        expect(result.experience).toHaveLength(1);
        expect(result.experience[0].title).toBe('Exp 1');
    });
  });
});
