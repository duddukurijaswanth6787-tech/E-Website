import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyAdminAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { logger } from '../logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
      admin?: {
        adminId: string;
        role: string;
        permissions: string[];
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
    req.user = { userId: payload.userId, role: payload.role };
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
    };
    logger.debug(`Admin request: ${payload.adminId} (${payload.role})`);
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
      req.user = { userId: payload.userId, role: payload.role };
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
