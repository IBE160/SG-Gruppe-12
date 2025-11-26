// src/tests/integration/cv.versions.test.ts
import request from 'supertest';
import express from 'express';
import { cvController } from '../../controllers/cv.controller';
import { cvService } from '../../services/cv.service';
import { authenticate } from '../../middleware/auth.middleware';

// Mocks
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '1' }; // Mock authenticated user
    next();
  }),
}));
jest.mock('../../services/cv.service');

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
