// src/tests/integration/cv.versions.test.ts

// Mock dependencies BEFORE imports

// Mock Prisma
jest.mock('../../config/database', () => ({
  prisma: {
    cV: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cVVersion: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));

// Mock Redis
jest.mock('../../config/redis', () => ({
  redis: {
    call: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    sadd: jest.fn(),
    expire: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    options: {
      host: 'localhost',
      port: 6379,
      password: undefined,
    },
  },
}));

// Mock bull queue
jest.mock('../../jobs', () => ({
  cvParsingQueue: {
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
  },
}));

// Mock rate-limit-redis
jest.mock('rate-limit-redis', () => {
  return {
    __esModule: true,
    default: class RedisStore {
      constructor() {}
      increment() { return Promise.resolve({ totalHits: 1, resetTime: new Date() }); }
      decrement() { return Promise.resolve(); }
      resetKey() { return Promise.resolve(); }
    },
  };
});

// Mock audit service
jest.mock('../../services/audit.service', () => ({
  auditService: {
    logSecurityEvent: jest.fn().mockResolvedValue(undefined),
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: '1' };
    next();
  }),
}));

// Mock cvService
jest.mock('../../services/cv.service');

import request from 'supertest';
import express from 'express';
import { cvController } from '../../controllers/cv.controller';
import { cvService } from '../../services/cv.service';
import { authenticate } from '../../middleware/auth.middleware';

// App setup
const app = express();
app.use(express.json());
const cvRouter = express.Router();

cvRouter.get('/:cvId/versions', authenticate, cvController.listCvVersions);
cvRouter.get('/:cvId/versions/:versionNumber', authenticate, cvController.getCvVersionDetails);
cvRouter.post('/:cvId/restore-version/:versionNumber', authenticate, cvController.restoreCvVersion);

app.use('/api/v1/cvs', cvRouter);

describe('CV Versioning API Endpoints', () => {
    const mockCvId = 101;
    const mockUserId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/cvs/:cvId/versions', () => {
        it('should call listVersions service and return 200 with versions', async () => {
            const mockVersions = [{ versionNumber: 1, createdAt: '2023-01-01' }];
            (cvService.listVersions as jest.Mock).mockResolvedValue(mockVersions);

            const response = await request(app)
                .get(`/api/v1/cvs/${mockCvId}/versions`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockVersions);
            expect(cvService.listVersions).toHaveBeenCalledWith(mockUserId, mockCvId);
        });
    });

    describe('GET /api/v1/cvs/:cvId/versions/:versionNumber', () => {
        it('should call getVersionDetails service and return 200 with CV data', async () => {
            const mockCvData = { personal_info: { firstName: 'John' } };
            (cvService.getVersionDetails as jest.Mock).mockResolvedValue(mockCvData);

            const response = await request(app)
                .get(`/api/v1/cvs/${mockCvId}/versions/1`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockCvData);
            expect(cvService.getVersionDetails).toHaveBeenCalledWith(mockUserId, mockCvId, 1);
        });
    });

    describe('POST /api/v1/cvs/:cvId/restore-version/:versionNumber', () => {
        it('should call restoreVersion service and return 200 with restored CV data', async () => {
            const mockCvData = { personal_info: { firstName: 'Jane' } };
            (cvService.restoreVersion as jest.Mock).mockResolvedValue(mockCvData);

            const response = await request(app)
                .post(`/api/v1/cvs/${mockCvId}/restore-version/1`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockCvData);
            expect(cvService.restoreVersion).toHaveBeenCalledWith(mockUserId, mockCvId, 1);
        });
    });
});
