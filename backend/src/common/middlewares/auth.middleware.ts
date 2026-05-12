import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyAdminAccessToken, verifyTailorAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { logger } from '../logger';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        role: string;
      };
      admin?: {
        adminId: string;
        role: string;
        permissions: string[];
        tenantId?: string;
      };
      tailor?: {
        tailorId: string;
        role: string;
      };
      manager?: {
        managerId: string;
        permissions: string[];
        branchId?: string | null;
      };
    }
  }
}

export const authenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    req.user = { id: payload.userId, userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateOwner = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access' || payload.role !== 'boutique_owner') {
      throw new UnauthorizedError('Boutique owner access required');
    }
    req.user = { id: payload.userId, userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateTailor = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No tailor token provided');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyTailorAccessToken(token);
    if (payload.type !== 'tailor_access') {
      throw new UnauthorizedError('Invalid tailor token type');
    }
    req.tailor = { tailorId: payload.tailorId, role: payload.role };
    req.user = { id: payload.tailorId, userId: payload.tailorId, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No admin token provided');
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyAdminAccessToken(token);
    if (payload.type !== 'admin_access') {
      throw new UnauthorizedError('Invalid admin token type');
    }
    req.admin = {
      adminId: payload.adminId,
      role: payload.role,
      permissions: payload.permissions,
      tenantId: payload.tenantId,
    };
    req.user = { id: payload.adminId, userId: payload.adminId, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.user = { id: payload.userId, userId: payload.userId, role: payload.role };
    }
  } catch {
    // ignore — optional auth
  }
  next();
};

export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError('Admin authentication required'));
      return;
    }
    if (!req.admin.permissions.includes(permission)) {
      next(new ForbiddenError(`Missing permission: ${permission}`));
      return;
    }
    next();
  };
};

export const requireAnyPermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError('Admin authentication required'));
      return;
    }
    const hasPermission = permissions.some((p) => req.admin!.permissions.includes(p));
    if (!hasPermission) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
};

const decodeToken = (token: string): Record<string, any> | null => {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as Record<string, any>;
  } catch {
    const legacy = process.env.JWT_SECRET;
    if (legacy && legacy !== env.jwt.accessSecret) {
      try {
        return jwt.verify(token, legacy) as Record<string, any>;
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Enterprise-grade authentication for both Admins and Managers.
 */
export const authenticateAdminOrManager = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) throw new UnauthorizedError('Invalid or expired token');

    if (decoded.type === 'admin_access') {
      req.admin = {
        adminId: decoded.adminId,
        role: decoded.role,
        permissions: Array.isArray(decoded.permissions) ? decoded.permissions : [],
        tenantId: decoded.tenantId,
      };
      req.user = { id: decoded.adminId, userId: decoded.adminId, role: decoded.role };
      return next();
    }

    if (decoded.type === 'manager_access' || decoded.role === 'manager') {
      const managerId = decoded.managerId || decoded.userId;
      if (!managerId) throw new UnauthorizedError('Manager token missing managerId');
      const { Manager } = await import('../../modules/managers/manager.model');
      const manager = await Manager.findById(managerId).select('isActive isVerified permissions branchId');
      if (!manager || !manager.isActive) {
        throw new UnauthorizedError('Manager account disabled or not found');
      }
      req.manager = {
        managerId,
        permissions: manager.permissions ?? [],
        branchId: manager.branchId ?? decoded.branchId ?? null,
      };
      req.user = { id: managerId, userId: managerId, role: 'manager' };
      return next();
    }

    throw new UnauthorizedError('Invalid admin or manager token');
  } catch (error) {
    next(error);
  }
};


/**
 * Universal protection middleware that accepts any valid ERP access token.
 */
export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    const decoded = decodeToken(token);
    if (!decoded) throw new UnauthorizedError('Invalid or expired token');

    const userId = decoded.userId || decoded.adminId || decoded.managerId || decoded.tailorId;
    if (!userId) throw new UnauthorizedError('Invalid token: missing ID');

    req.user = {
      id: userId,
      userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Enforce specific role requirements for enterprise routes.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError(`Access denied. Roles required: ${roles.join(', ')}`));
      return;
    }
    next();
  };
};
