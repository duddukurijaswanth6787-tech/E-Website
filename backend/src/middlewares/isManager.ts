import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../common/errors';
import { Manager } from '../modules/managers/manager.model';
import { verifyManagerAccessToken } from '../common/utils/jwt';

/**
 * Manager authentication middleware.
 *
 * Accepts the standardized `manager_access` token (signed with
 * `env.jwt.accessSecret`) AND the legacy token shape
 * (`{ managerId, role }` signed with `process.env.JWT_SECRET`) for a
 * grace period so existing sessions don't get logged out on deploy.
 */
export const isManager = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Manager authentication token required');
  }

  const token = authHeader.split(' ')[1];

  let managerId: string | null = null;
  let permissionsFromToken: string[] = [];
  let branchIdFromToken: string | null = null;

  // 1) Try standardized verifier first.
  try {
    const payload = verifyManagerAccessToken(token);
    if (payload.role !== 'manager') {
      throw new UnauthorizedError('Invalid role. Manager access required');
    }
    managerId = payload.managerId;
    permissionsFromToken = Array.isArray(payload.permissions) ? payload.permissions : [];
    branchIdFromToken = payload.branchId ?? null;
  } catch {
    // 2) Fallback to legacy `JWT_SECRET` token shape, if available.
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { managerId?: string; role?: string };
      if (decoded.role !== 'manager' || !decoded.managerId) {
        throw new UnauthorizedError('Invalid manager token');
      }
      managerId = decoded.managerId;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }
  }

  if (!managerId) throw new UnauthorizedError('Invalid manager token');

  const manager = await Manager.findById(managerId).select(
    'isActive isVerified permissions branchId',
  );
  if (!manager) {
    throw new UnauthorizedError('Manager account not found');
  }
  if (!manager.isActive) {
    throw new UnauthorizedError('Manager account is disabled');
  }

  req.manager = {
    managerId,
    permissions: manager.permissions ?? permissionsFromToken,
    branchId: manager.branchId ?? branchIdFromToken ?? null,
  };

  next();
};
