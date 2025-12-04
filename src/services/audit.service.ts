// src/services/audit.service.ts
// Audit logging service for security events and GDPR compliance

import { prisma } from '../config/database';
import { logger } from '../utils/logger.util';
import { Prisma } from '@prisma/client';

// Audit action types
export type AuditAction =
  // Authentication events
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'EMAIL_VERIFY'
  | 'TOKEN_REFRESH'
  // Data access events
  | 'DATA_EXPORT'
  | 'DATA_EXPORT_DOWNLOAD'
  | 'ACCOUNT_DELETE'
  // GDPR consent events
  | 'CONSENT_UPDATE'
  // CV operations
  | 'CV_CREATE'
  | 'CV_UPDATE'
  | 'CV_DELETE'
  | 'CV_VIEW'
  // Application operations
  | 'APPLICATION_CREATE'
  | 'APPLICATION_VIEW'
  | 'AI_GENERATE_CV'
  | 'AI_GENERATE_COVER_LETTER'
  // Admin operations
  | 'ADMIN_USER_VIEW'
  | 'ADMIN_USER_UPDATE'
  | 'ADMIN_USER_DELETE'
  // Security events
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'BLOCKED_REQUEST';

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'BLOCKED';

export type ConsentType = 'essential' | 'ai_training' | 'marketing';

export interface AuditLogData {
  userId?: string | null;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  status: AuditStatus;
}

export interface ConsentLogData {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  ipAddress?: string;
}

// PII fields that should be redacted in logs
const PII_FIELDS = [
  'password',
  'passwordHash',
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'address',
  'ssn',
  'creditCard',
  'token',
  'accessToken',
  'refreshToken',
];

/**
 * Redact PII from metadata before storing
 */
function redactPII(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    // Check if key contains PII field names
    const isPII = PII_FIELDS.some(
      field => lowerKey.includes(field.toLowerCase())
    );

    if (isPII) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively redact nested objects
      redacted[key] = redactPII(value as Record<string, unknown>);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Hash email for logging (preserves domain for analysis)
 */
function hashEmailForLog(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return '[INVALID_EMAIL]';

  // Show first char and domain for debugging while protecting privacy
  const maskedLocal = localPart.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}

export const auditService = {
  /**
   * Log a security/audit event
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      // Redact any PII in metadata
      const safeMetadata = data.metadata
        ? (redactPII(data.metadata) as Prisma.InputJsonValue)
        : undefined;

      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent ? data.userAgent.substring(0, 500) : undefined, // Truncate long user agents
          metadata: safeMetadata,
          status: data.status,
        },
      });

      // Also log to standard logger for real-time monitoring
      const logLevel = data.status === 'FAILURE' || data.status === 'BLOCKED' ? 'warn' : 'info';
      logger[logLevel](`Audit: ${data.action}`, {
        userId: data.userId ? hashEmailForLog(data.userId) : 'anonymous',
        resource: data.resource,
        status: data.status,
      });
    } catch (error) {
      // Don't let audit logging failures break the application
      logger.error('Failed to write audit log', {
        action: data.action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Log authentication events
   */
  async logAuth(
    action: 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'REGISTER' | 'TOKEN_REFRESH',
    userId: string | undefined,
    status: AuditStatus,
    context: { ipAddress?: string; userAgent?: string; email?: string; reason?: string }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'auth',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        email: context.email ? hashEmailForLog(context.email) : undefined,
        reason: context.reason,
      },
      status,
    });
  },

  /**
   * Log consent changes for GDPR compliance
   */
  async logConsent(data: ConsentLogData): Promise<void> {
    try {
      // Create consent log entry
      await prisma.consentLog.create({
        data: {
          userId: data.userId,
          consentType: data.consentType,
          granted: data.granted,
          ipAddress: data.ipAddress,
        },
      });

      // Also create audit log entry for cross-reference
      await this.log({
        userId: data.userId,
        action: 'CONSENT_UPDATE',
        resource: 'consent',
        resourceId: data.consentType,
        ipAddress: data.ipAddress,
        metadata: {
          consentType: data.consentType,
          granted: data.granted,
        },
        status: 'SUCCESS',
      });

      logger.info(`Consent updated: ${data.consentType} = ${data.granted}`, {
        userId: data.userId,
      });
    } catch (error) {
      logger.error('Failed to log consent change', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Consent logging failures should be propagated (GDPR requirement)
    }
  },

  /**
   * Log data access events (GDPR compliance)
   */
  async logDataAccess(
    action: 'DATA_EXPORT' | 'DATA_EXPORT_DOWNLOAD' | 'ACCOUNT_DELETE',
    userId: string,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'user_data',
      resourceId: userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      status: 'SUCCESS',
    });
  },

  /**
   * Log CV operations
   */
  async logCVOperation(
    action: 'CV_CREATE' | 'CV_UPDATE' | 'CV_DELETE' | 'CV_VIEW',
    userId: string,
    cvId: number | string,
    context: { ipAddress?: string }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'cv',
      resourceId: String(cvId),
      ipAddress: context.ipAddress,
      status: 'SUCCESS',
    });
  },

  /**
   * Log AI generation events
   */
  async logAIGeneration(
    action: 'AI_GENERATE_CV' | 'AI_GENERATE_COVER_LETTER',
    userId: string,
    context: {
      cvId?: number;
      jobPostingId?: number;
      ipAddress?: string;
      duration?: number;
    }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'ai_generation',
      metadata: {
        cvId: context.cvId,
        jobPostingId: context.jobPostingId,
        durationMs: context.duration,
      },
      ipAddress: context.ipAddress,
      status: 'SUCCESS',
    });
  },

  /**
   * Log security events (rate limiting, suspicious activity)
   */
  async logSecurityEvent(
    action: 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'BLOCKED_REQUEST',
    context: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
      endpoint?: string;
    }
  ): Promise<void> {
    await this.log({
      userId: context.userId,
      action,
      resource: 'security',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: {
        reason: context.reason,
        endpoint: context.endpoint,
      },
      status: 'BLOCKED',
    });
  },

  /**
   * Get audit logs for a user (for data export)
   */
  async getUserAuditLogs(userId: string, limit = 100): Promise<unknown[]> {
    return prisma.auditLog.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        action: true,
        resource: true,
        status: true,
        createdAt: true,
        // Exclude IP and user agent from user exports for privacy
      },
    });
  },

  /**
   * Get consent history for a user (GDPR requirement)
   */
  async getUserConsentHistory(userId: string): Promise<unknown[]> {
    return prisma.consentLog.findMany({
      where: { userId: userId },
      orderBy: { timestamp: 'desc' },
      select: {
        consentType: true,
        granted: true,
        timestamp: true,
      },
    });
  },

  /**
   * Get recent security events (for admin monitoring)
   */
  async getSecurityEvents(
    filters: {
      action?: AuditAction;
      status?: AuditStatus;
      startDate?: Date;
      endDate?: Date;
    },
    limit = 100
  ): Promise<unknown[]> {
    const where: Record<string, unknown> = {};

    if (filters.action) where.action = filters.action;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Count failed login attempts for an IP (for rate limiting decisions)
   */
  async countFailedLogins(ipAddress: string, windowMinutes = 15): Promise<number> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const count = await prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        ipAddress: ipAddress,
        createdAt: { gte: windowStart },
      },
    });

    return count;
  },

  /**
   * Delete old audit logs (for data retention compliance)
   */
  async cleanupOldLogs(retentionDays = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    logger.info(`Cleaned up ${result.count} old audit logs`);
    return result.count;
  },
};
