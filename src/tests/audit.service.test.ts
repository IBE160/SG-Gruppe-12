// src/tests/audit.service.test.ts
import { auditService } from '../services/audit.service';
import { prisma } from '../config/database';

// Mock Prisma
jest.mock('../config/database', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    consentLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

// Mock logger
jest.mock('../utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Audit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.log({
        userId: 'user-123',
        action: 'LOGIN',
        resource: 'auth',
        status: 'SUCCESS',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-123',
          action: 'LOGIN',
          resource: 'auth',
          status: 'SUCCESS',
        }),
      });
    });

    it('should redact PII from metadata', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.log({
        userId: 'user-123',
        action: 'REGISTER',
        status: 'SUCCESS',
        metadata: {
          email: 'test@example.com',
          password: 'secret123',
          firstName: 'John',
          safeField: 'visible',
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            email: '[REDACTED]',
            password: '[REDACTED]',
            firstName: '[REDACTED]',
            safeField: 'visible',
          }),
        }),
      });
    });

    it('should handle nested objects in metadata', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.log({
        userId: 'user-123',
        action: 'LOGIN',
        status: 'SUCCESS',
        metadata: {
          user: {
            email: 'test@example.com',
            name: 'John',
          },
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            user: expect.objectContaining({
              email: '[REDACTED]',
              name: 'John',
            }),
          }),
        }),
      });
    });

    it('should not fail if database write fails', async () => {
      (prisma.auditLog.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(
        auditService.log({
          userId: 'user-123',
          action: 'LOGIN',
          status: 'SUCCESS',
        })
      ).resolves.toBeUndefined();
    });

    it('should truncate long user agents', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      const longUserAgent = 'A'.repeat(1000);

      await auditService.log({
        userId: 'user-123',
        action: 'LOGIN',
        status: 'SUCCESS',
        userAgent: longUserAgent,
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_agent: expect.any(String),
        }),
      });

      const callArg = (prisma.auditLog.create as jest.Mock).mock.calls[0][0];
      expect(callArg.data.user_agent.length).toBeLessThanOrEqual(500);
    });
  });

  describe('logAuth', () => {
    it('should log successful login', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logAuth('LOGIN', 'user-123', 'SUCCESS', {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-123',
          action: 'LOGIN',
          resource: 'auth',
          status: 'SUCCESS',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
        }),
      });
    });

    it('should log failed login with redacted email', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logAuth('LOGIN_FAILED', undefined, 'FAILURE', {
        ipAddress: '192.168.1.1',
        email: 'john.doe@example.com',
        reason: 'Invalid credentials',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'LOGIN_FAILED',
          status: 'FAILURE',
          metadata: expect.objectContaining({
            email: '[REDACTED]', // Email is PII and gets redacted
            reason: 'Invalid credentials',
          }),
        }),
      });
    });
  });

  describe('logConsent', () => {
    it('should create both consent log and audit log entries', async () => {
      (prisma.consentLog.create as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logConsent({
        userId: 'user-123',
        consentType: 'ai_training',
        granted: true,
        ipAddress: '192.168.1.1',
      });

      expect(prisma.consentLog.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-123',
          consent_type: 'ai_training',
          granted: true,
          ip_address: '192.168.1.1',
        },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CONSENT_UPDATE',
          resource: 'consent',
          resource_id: 'ai_training',
          metadata: expect.objectContaining({
            consentType: 'ai_training',
            granted: true,
          }),
        }),
      });
    });

    it('should propagate errors for consent logging (GDPR requirement)', async () => {
      (prisma.consentLog.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(
        auditService.logConsent({
          userId: 'user-123',
          consentType: 'marketing',
          granted: false,
        })
      ).rejects.toThrow('DB error');
    });
  });

  describe('logDataAccess', () => {
    it('should log data export request', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logDataAccess('DATA_EXPORT', 'user-123', {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'DATA_EXPORT',
          resource: 'user_data',
          resource_id: 'user-123',
          status: 'SUCCESS',
        }),
      });
    });

    it('should log account deletion', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logDataAccess('ACCOUNT_DELETE', 'user-123', {
        ipAddress: '192.168.1.1',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'ACCOUNT_DELETE',
          resource: 'user_data',
        }),
      });
    });
  });

  describe('logCVOperation', () => {
    it('should log CV creation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logCVOperation('CV_CREATE', 'user-123', 456, {
        ipAddress: '192.168.1.1',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CV_CREATE',
          resource: 'cv',
          resource_id: '456',
        }),
      });
    });
  });

  describe('logAIGeneration', () => {
    it('should log AI CV generation', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logAIGeneration('AI_GENERATE_CV', 'user-123', {
        cvId: 1,
        jobPostingId: 2,
        duration: 5000,
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'AI_GENERATE_CV',
          resource: 'ai_generation',
          metadata: expect.objectContaining({
            cvId: 1,
            jobPostingId: 2,
            durationMs: 5000,
          }),
        }),
      });
    });
  });

  describe('logSecurityEvent', () => {
    it('should log rate limit exceeded', async () => {
      (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 1 });

      await auditService.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ipAddress: '192.168.1.1',
        reason: 'Too many requests',
        endpoint: '/api/v1/auth/login',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'RATE_LIMIT_EXCEEDED',
          resource: 'security',
          status: 'BLOCKED',
          metadata: expect.objectContaining({
            reason: 'Too many requests',
            endpoint: '/api/v1/auth/login',
          }),
        }),
      });
    });
  });

  describe('getUserAuditLogs', () => {
    it('should return user audit logs without sensitive fields', async () => {
      const mockLogs = [
        { action: 'LOGIN', resource: 'auth', status: 'SUCCESS', created_at: new Date() },
      ];
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

      const logs = await auditService.getUserAuditLogs('user-123', 50);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        orderBy: { created_at: 'desc' },
        take: 50,
        select: {
          action: true,
          resource: true,
          status: true,
          created_at: true,
        },
      });
      expect(logs).toEqual(mockLogs);
    });
  });

  describe('getUserConsentHistory', () => {
    it('should return user consent history', async () => {
      const mockHistory = [
        { consent_type: 'ai_training', granted: true, timestamp: new Date() },
      ];
      (prisma.consentLog.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const history = await auditService.getUserConsentHistory('user-123');

      expect(prisma.consentLog.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        orderBy: { timestamp: 'desc' },
        select: {
          consent_type: true,
          granted: true,
          timestamp: true,
        },
      });
      expect(history).toEqual(mockHistory);
    });
  });

  describe('getSecurityEvents', () => {
    it('should filter by action and status', async () => {
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);

      await auditService.getSecurityEvents({
        action: 'LOGIN_FAILED',
        status: 'FAILURE',
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          action: 'LOGIN_FAILED',
          status: 'FAILURE',
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);

      await auditService.getSecurityEvents({ startDate, endDate });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { created_at: 'desc' },
        take: 100,
      });
    });
  });

  describe('countFailedLogins', () => {
    it('should count failed logins within time window', async () => {
      (prisma.auditLog.count as jest.Mock).mockResolvedValue(5);

      const count = await auditService.countFailedLogins('192.168.1.1', 15);

      expect(prisma.auditLog.count).toHaveBeenCalledWith({
        where: {
          action: 'LOGIN_FAILED',
          ip_address: '192.168.1.1',
          created_at: { gte: expect.any(Date) },
        },
      });
      expect(count).toBe(5);
    });
  });

  describe('cleanupOldLogs', () => {
    it('should delete logs older than retention period', async () => {
      (prisma.auditLog.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });

      const deletedCount = await auditService.cleanupOldLogs(90);

      expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          created_at: { lt: expect.any(Date) },
        },
      });
      expect(deletedCount).toBe(100);
    });
  });
});
