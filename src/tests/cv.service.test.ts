// src/tests/cv.service.test.ts
import { cvService } from '../services/cv.service';
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { experienceEntrySchema, educationEntrySchema, skillEntrySchema, languageEntrySchema } from '../validators/cv.validator';
import { CV, CVComponent } from '@prisma/client';
import * as jsonpatch from 'fast-json-patch';

// Mock the repository
jest.mock('../repositories/cv.repository');

// Mock the validator
jest.mock('../validators/cv.validator', () => ({
  experienceEntrySchema: { parse: jest.fn(data => data) },
  educationEntrySchema: { parse: jest.fn(data => data) },
  skillEntrySchema: { parse: jest.fn(data => data) },
  languageEntrySchema: { parse: jest.fn(data => data) },
}));

describe('CV Service (Normalized)', () => {
  const mockUserId = 1;
  const mockCvId = 101;

  const mockExperienceComponent: CVComponent = { id: 201, user_id: mockUserId, component_type: 'work_experience', content: { title: 'Software Engineer', company: 'Tech Corp' }, created_at: new Date(), updated_at: new Date() };
  const mockEducationComponent: CVComponent = { id: 202, user_id: mockUserId, component_type: 'education', content: { degree: 'B.S. CS' }, created_at: new Date(), updated_at: new Date() };
  const mockSkillComponent: CVComponent = { id: 203, user_id: mockUserId, component_type: 'skill', content: 'TypeScript', created_at: new Date(), updated_at: new Date() };
  const mockLanguageComponent: CVComponent = { id: 204, user_id: mockUserId, component_type: 'language', content: { name: 'English', level: 'Native' }, created_at: new Date(), updated_at: new Date() };
  
  const mockCvShell: CV = { id: mockCvId, user_id: mockUserId, title: 'My CV', component_ids: [mockExperienceComponent.id], created_at: new Date(), updated_at: new Date() };
  const mockCvShellWithAll: CV = { ...mockCvShell, component_ids: [mockExperienceComponent.id, mockEducationComponent.id, mockSkillComponent.id, mockLanguageComponent.id]};

  // Base CV Data for versioning tests
  const baseCvData = {
    personal_info: { firstName: 'John', lastName: 'Doe' },
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the versioning repository methods
    (cvRepository.getLatestVersionNumber as jest.Mock).mockResolvedValue(0);
    (cvRepository.createVersion as jest.Mock).mockResolvedValue({});
    (cvRepository.getVersions as jest.Mock).mockResolvedValue([]);
    (cvRepository.getVersionByNumber as jest.Mock).mockResolvedValue(null);
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
    const newExperience = { title: 'New Role', company: 'NewCo' };
    const updatedExperience = { ...newExperience, company: 'UpdatedCo' };
    const mockUpdatedCvShell: CV = { ...mockCvShell, component_ids: [...mockCvShell.component_ids, 205] };
    const mockComponentAfterAdd: CVComponent = { id: 205, user_id: mockUserId, component_type: 'work_experience', content: newExperience, created_at: new Date(), updated_at: new Date() };

    it('should add a work experience component and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
      (cvRepository.addComponent as jest.Mock).mockResolvedValue(mockUpdatedCvShell);
      (cvRepository.findComponentsByIds as jest.Mock)
        .mockResolvedValueOnce([mockExperienceComponent]) // For initial assembleCvData
        .mockResolvedValueOnce([mockExperienceComponent, mockComponentAfterAdd]); // For current assembleCvData

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
            content: { ...mockExperienceComponent.content, ...updates }
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

  describe('Education CRUD', () => {
    const newEducation = { degree: 'M.S. CS', institution: 'Grad School' };
    const mockUpdatedCvShell: CV = { ...mockCvShell, component_ids: [...mockCvShell.component_ids, 206] };
    const mockComponentAfterAdd: CVComponent = { id: 206, user_id: mockUserId, component_type: 'education', content: newEducation, created_at: new Date(), updated_at: new Date() };
    
    it('should add an education component and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
      (cvRepository.addComponent as jest.Mock).mockResolvedValue(mockUpdatedCvShell);
      (cvRepository.findComponentsByIds as jest.Mock)
        .mockResolvedValueOnce([mockExperienceComponent]) // initial
        .mockResolvedValueOnce([mockExperienceComponent, mockComponentAfterAdd]); // current

      const result = await cvService.addEducation(mockUserId, mockCvId, newEducation);

      expect(cvRepository.addComponent).toHaveBeenCalledWith(mockCvId, mockUserId, 'education', newEducation);
      expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
      expect(result.education).toHaveLength(1);
    });
  });

  describe('Skills CRUD', () => {
    const newSkill = 'TypeScript';
    const mockUpdatedCvShell: CV = { ...mockCvShell, component_ids: [...mockCvShell.component_ids, 207] };
    const mockComponentAfterAdd: CVComponent = { id: 207, user_id: mockUserId, component_type: 'skill', content: newSkill, created_at: new Date(), updated_at: new Date() };

    it('should add a skill component and create a new version', async () => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
      (cvRepository.addComponent as jest.Mock).mockResolvedValue(mockUpdatedCvShell);
      (cvRepository.findComponentsByIds as jest.Mock)
        .mockResolvedValueOnce([mockExperienceComponent])
        .mockResolvedValueOnce([mockExperienceComponent, mockComponentAfterAdd]);

      const result = await cvService.addSkill(mockUserId, mockCvId, newSkill);
      
      expect(cvRepository.addComponent).toHaveBeenCalledWith(mockCvId, mockUserId, 'skill', newSkill);
      expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
      expect(result.skills).toHaveLength(1);
    });
  });

  describe('Languages CRUD', () => {
    const newLanguage = { name: 'Spanish', level: 'Fluent' };
    const mockUpdatedCvShell: CV = { ...mockCvShell, component_ids: [...mockCvShell.component_ids, 208] };
    const mockComponentAfterAdd: CVComponent = { id: 208, user_id: mockUserId, component_type: 'language', content: newLanguage, created_at: new Date(), updated_at: new Date() };

    it('should add a language component and create a new version', async () => {
        (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvShell);
        (cvRepository.addComponent as jest.Mock).mockResolvedValue(mockUpdatedCvShell);
        (cvRepository.findComponentsByIds as jest.Mock)
            .mockResolvedValueOnce([mockExperienceComponent])
            .mockResolvedValueOnce([mockExperienceComponent, mockComponentAfterAdd]);

        const result = await cvService.addLanguage(mockUserId, mockCvId, newLanguage);

        expect(cvRepository.addComponent).toHaveBeenCalledWith(mockCvId, mockUserId, 'language', newLanguage);
        expect(cvRepository.createVersion).toHaveBeenCalledTimes(1);
        expect(result.languages).toHaveLength(1);
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
        // Note: As per implementation, this test only checks reconstruction, not database write.
    });
  });
});
