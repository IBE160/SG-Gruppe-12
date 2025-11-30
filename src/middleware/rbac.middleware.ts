// src/middleware/rbac.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors.util';
import { UserRole } from '../utils/jwt.util';

/**
 * Middleware to require a specific role or set of roles.
 * Must be used after the authenticate middleware.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      // Default to USER role if not specified (backward compatibility)
      const userRole = user.role || 'USER';

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to require admin role.
 * Convenience wrapper for requireRole('ADMIN').
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Middleware to require user role (any authenticated user).
 * Convenience wrapper for requireRole('USER', 'ADMIN').
 */
export const requireUser = requireRole('USER', 'ADMIN');

/**
 * Middleware to check if user owns the resource or is admin.
 * The resource owner ID must be available in req.params or req.body.
 */
export const requireOwnerOrAdmin = (ownerIdParam: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ForbiddenError('Authentication required');
      }

      const userRole = user.role || 'USER';

      // Admins can access any resource
      if (userRole === 'ADMIN') {
        return next();
      }

      // Get the owner ID from params or body
      const ownerId = req.params[ownerIdParam] || req.body[ownerIdParam];

      // If no owner ID specified, check if it's the user's own resource
      if (!ownerId || ownerId === user.userId) {
        return next();
      }

      throw new ForbiddenError('Access denied. You can only access your own resources.');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper to check if a user has a specific role.
 */
export const hasRole = (userRole: UserRole | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  if (requiredRole === 'USER') return true; // Any authenticated user
  return userRole === requiredRole;
};

/**
 * Helper to check if a user is an admin.
 */
export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'ADMIN';
};
