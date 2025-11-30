// src/middleware/audit.middleware.ts
// Middleware for automatic audit logging of HTTP requests

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { auditService, AuditAction, AuditStatus } from '../services/audit.service';

/**
 * Extract client IP address from request
 */
export function getClientIP(req: Request): string {
  // Check for forwarded IP (when behind proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ips.trim();
  }

  // Check for real IP header (nginx)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return Array.isArray(realIP) ? realIP[0] : realIP;
  }

  // Fall back to socket remote address
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}

/**
 * Map HTTP method and path to audit action
 */
function mapRouteToAction(method: string, path: string): AuditAction | null {
  const normalizedPath = path.toLowerCase();

  // Auth routes
  if (normalizedPath.includes('/auth/login')) {
    return method === 'POST' ? 'LOGIN' : null;
  }
  if (normalizedPath.includes('/auth/logout')) {
    return method === 'POST' ? 'LOGOUT' : null;
  }
  if (normalizedPath.includes('/auth/register')) {
    return method === 'POST' ? 'REGISTER' : null;
  }
  if (normalizedPath.includes('/auth/refresh')) {
    return method === 'POST' ? 'TOKEN_REFRESH' : null;
  }
  if (normalizedPath.includes('/auth/verify-email')) {
    return 'EMAIL_VERIFY';
  }
  if (normalizedPath.includes('/auth/reset-password')) {
    return method === 'POST' ? 'PASSWORD_RESET_REQUEST' : 'PASSWORD_RESET_COMPLETE';
  }

  // GDPR routes
  if (normalizedPath.includes('/user/data-export')) {
    return method === 'POST' ? 'DATA_EXPORT' : 'DATA_EXPORT_DOWNLOAD';
  }
  if (normalizedPath.includes('/user/account') && method === 'DELETE') {
    return 'ACCOUNT_DELETE';
  }
  if (normalizedPath.includes('/user/consent')) {
    return 'CONSENT_UPDATE';
  }

  // CV routes
  if (normalizedPath.match(/\/cvs?\/?$/)) {
    if (method === 'POST') return 'CV_CREATE';
    if (method === 'GET') return 'CV_VIEW';
  }
  if (normalizedPath.match(/\/cvs?\/\d+/)) {
    if (method === 'PUT' || method === 'PATCH') return 'CV_UPDATE';
    if (method === 'DELETE') return 'CV_DELETE';
    if (method === 'GET') return 'CV_VIEW';
  }

  // Application/AI routes
  if (normalizedPath.includes('/applications') && normalizedPath.includes('/generate')) {
    if (normalizedPath.includes('cv')) return 'AI_GENERATE_CV';
    if (normalizedPath.includes('cover-letter')) return 'AI_GENERATE_COVER_LETTER';
  }
  if (normalizedPath.includes('/applications')) {
    if (method === 'POST') return 'APPLICATION_CREATE';
    if (method === 'GET') return 'APPLICATION_VIEW';
  }

  return null;
}

/**
 * Determine audit status from response status code
 */
function getAuditStatus(statusCode: number): AuditStatus {
  if (statusCode >= 200 && statusCode < 300) return 'SUCCESS';
  if (statusCode === 429) return 'BLOCKED'; // Rate limited
  return 'FAILURE';
}

/**
 * Extract resource ID from request path
 */
function extractResourceId(path: string): string | undefined {
  // Match patterns like /cvs/123 or /applications/456
  const match = path.match(/\/(\d+)(?:\/|$)/);
  return match ? match[1] : undefined;
}

/**
 * Middleware that automatically logs auditable requests after response is sent
 */
export function auditMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to log after response
  res.end = function (this: Response, ...args: unknown[]): Response {
    // Calculate duration
    const duration = Date.now() - startTime;

    // Determine if this route should be audited
    const action = mapRouteToAction(req.method, req.path);

    if (action) {
      const status = getAuditStatus(res.statusCode);
      const resourceId = extractResourceId(req.path);

      // Log asynchronously (don't block response)
      setImmediate(() => {
        auditService.log({
          userId: req.user?.userId,
          action,
          resource: req.path.split('/')[3] || 'unknown', // e.g., 'cvs', 'applications'
          resourceId,
          ipAddress: getClientIP(req),
          userAgent: getUserAgent(req),
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: duration,
          },
          status,
        }).catch(() => {
          // Silently fail - audit logging shouldn't break the app
        });
      });
    }

    // Call original end function with proper context
    return originalEnd.apply(this, args as Parameters<typeof originalEnd>);
  } as typeof res.end;

  next();
}

/**
 * Middleware specifically for auth routes with additional context
 */
export function authAuditMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const originalJson = res.json;

  res.json = function (this: Response, body: unknown): Response {
    const duration = Date.now() - startTime;
    const status = getAuditStatus(res.statusCode);

    // Determine auth action
    let action: AuditAction | undefined;
    if (req.path.includes('/login')) {
      action = status === 'SUCCESS' ? 'LOGIN' : 'LOGIN_FAILED';
    } else if (req.path.includes('/register')) {
      action = 'REGISTER';
    } else if (req.path.includes('/logout')) {
      action = 'LOGOUT';
    }

    if (action) {
      // Extract email from request body (for failed login tracking)
      const email = req.body?.email;

      setImmediate(() => {
        auditService.logAuth(
          action as 'LOGIN' | 'LOGIN_FAILED' | 'LOGOUT' | 'REGISTER' | 'TOKEN_REFRESH',
          req.user?.userId || (body as { user?: { id?: string } })?.user?.id,
          status,
          {
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
            email,
            reason: status === 'FAILURE' ? 'Authentication failed' : undefined,
          }
        ).catch(() => {
          // Silently fail
        });
      });
    }

    return originalJson.call(this, body);
  };

  next();
}

/**
 * Create a custom audit logger for specific actions
 */
export function createAuditLogger(action: AuditAction) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Log before processing
    const logPromise = auditService.log({
      userId: req.user?.userId,
      action,
      resource: req.path.split('/')[3],
      resourceId: extractResourceId(req.path),
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      status: 'SUCCESS',
    });

    // Don't wait for logging to complete
    logPromise.catch(() => {});

    next();
  };
}

/**
 * Middleware to log security events (rate limiting, blocked requests)
 */
export function securityAuditMiddleware(
  action: 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'BLOCKED_REQUEST',
  reason: string
) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    auditService.logSecurityEvent(action, {
      userId: req.user?.userId,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      reason,
      endpoint: req.path,
    }).catch(() => {
      // Silently fail
    });

    next();
  };
}
