// src/tests/cv.repository.test.ts
import { cvRepository } from '../repositories/cv.repository';
import { prisma } from '../config/database';
import { CV, CVComponent, CVVersion } from '@prisma/client';

jest.mock('../config/database', () => ({
  prisma: {
    cV: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cVComponent: {
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
  const mockCV: CV = {
    id: 1,
    user_id: 1,
    title: 'Test CV',
    component_ids: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCVComponent: CVComponent = {
    id: 1,
    user_id: 1,
    component_type: 'work_experience',
    content: { title: 'Software Engineer' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCVVersion: CVVersion = {
    id: 1,
    cv_id: 1,
    version_number: 1,
    delta: { op: 'add', path: '/experience/0', value: { title: 'Software Engineer' } },
    created_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new CV shell', async () => {
      (prisma.cV.create as jest.Mock).mockResolvedValue(mockCV);

      const newCV = await cvRepository.create(1, 'Test CV');

      expect(prisma.cV.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          title: 'Test CV',
          component_ids: [],
        },
      });
      expect(newCV).toEqual(mockCV);
    });
  });

  describe('findById', () => {
    it('should find a CV by its ID', async () => {
      (prisma.cV.findUnique as jest.Mock).mockResolvedValue(mockCV);

      const foundCV = await cvRepository.findById(1);

      expect(prisma.cV.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(foundCV).toEqual(mockCV);
    });
  });

  describe('findByUserId', () => {
    it('should find all CVs for a user', async () => {
      (prisma.cV.findMany as jest.Mock).mockResolvedValue([mockCV]);

      const foundCVs = await cvRepository.findByUserId(1);

      expect(prisma.cV.findMany).toHaveBeenCalledWith({
        where: { user_id: 1 },
        orderBy: { created_at: 'desc' },
      });
      expect(foundCVs).toEqual([mockCV]);
    });
  });

  describe('addComponent', () => {
    it('should add a component to a CV', async () => {
      (prisma.cVComponent.create as jest.Mock).mockResolvedValue(mockCVComponent);
      (prisma.cV.update as jest.Mock).mockResolvedValue({ ...mockCV, component_ids: [1] });

      const updatedCV = await cvRepository.addComponent(1, 1, 'work_experience', { title: 'Software Engineer' });

      expect(prisma.cVComponent.create).toHaveBeenCalledWith({
        data: {
          user_id: 1,
          component_type: 'work_experience',
          content: { title: 'Software Engineer' },
        },
      });
      expect(prisma.cV.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          component_ids: {
            push: 1,
          },
        },
      });
      expect(updatedCV.component_ids).toEqual([1]);
    });
  });

  describe('updateComponent', () => {
    it('should update a component', async () => {
        const updatedComponent = { ...mockCVComponent, content: { title: 'Senior Software Engineer' } };
        (prisma.cVComponent.findUnique as jest.Mock).mockResolvedValue(mockCVComponent);
        (prisma.cVComponent.update as jest.Mock).mockResolvedValue(updatedComponent);
  
        const result = await cvRepository.updateComponent(1, { title: 'Senior Software Engineer' });
  
        expect(prisma.cVComponent.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                content: { title: 'Senior Software Engineer' },
            },
        });
        expect(result).toEqual(updatedComponent);
    });
  });

  describe('deleteComponent', () => {
    it('should delete a component from a CV', async () => {
      (prisma.cVComponent.delete as jest.Mock).mockResolvedValue(mockCVComponent);
      (prisma.cV.findUnique as jest.Mock).mockResolvedValue({ ...mockCV, component_ids: [1, 2] });
      (prisma.cV.update as jest.Mock).mockResolvedValue({ ...mockCV, component_ids: [2] });

      const updatedCV = await cvRepository.deleteComponent(1, 1);

      expect(prisma.cVComponent.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.cV.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          component_ids: [2],
        },
      });
      expect(updatedCV.component_ids).toEqual([2]);
    });
  });

  describe('createVersion', () => {
    it('should create a new CV version', async () => {
      (prisma.cVVersion.create as jest.Mock).mockResolvedValue(mockCVVersion);

      const newCVVersion = await cvRepository.createVersion(1, 1, { op: 'add', path: '/experience/0', value: { title: 'Software Engineer' } });

      expect(prisma.cVVersion.create).toHaveBeenCalledWith({
        data: {
          cv_id: 1,
          version_number: 1,
          delta: { op: 'add', path: '/experience/0', value: { title: 'Software Engineer' } },
        },
      });
      expect(newCVVersion).toEqual(mockCVVersion);
    });
  });
});
