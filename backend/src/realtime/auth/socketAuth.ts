import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { logger } from '../../common/logger';
import { Manager } from '../../modules/managers/manager.model';
import { Tailor } from '../../modules/tailors/tailor.model';
import { Admin } from '../../modules/admins/admin.model';

export type SocketPrincipalType = 'admin' | 'manager' | 'tailor';

export interface SocketPrincipal {
  type: SocketPrincipalType;
  id: string;
  /** Stable display name for activity feeds. */
  name?: string;
  /** Granular role string (e.g. 'super_admin', 'manager', 'tailor'). */
  role: string;
  permissions: string[];
  /** Branch the principal belongs to. Required for branch-scoped rooms. */
  branchId: string | null;
  /** For tailors only — they can only join their own personal room. */
  assignedTailorIds?: string[];
}

/** Token shape may differ across roles; we accept all and discriminate. */
type AnyTokenPayload = Record<string, unknown> & {
  type?: string;
  role?: string;
};

/** Pull token from `auth.token` or `Authorization: Bearer ...`. */
const extractToken = (socket: Socket): string | null => {
  const authToken = (socket.handshake.auth as { token?: unknown } | undefined)?.token;
  if (typeof authToken === 'string' && authToken.length > 0) return authToken;

  const header = socket.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }
  return null;
};

const decode = (token: string): AnyTokenPayload | null => {
  // Verify with the same access secret used by HTTP auth.
  // We try secondary "JWT_SECRET" only if explicitly set, to cover
  // legacy manager tokens minted before standardization.
  try {
    return jwt.verify(token, env.jwt.accessSecret) as AnyTokenPayload;
  } catch {
    const legacy = process.env.JWT_SECRET;
    if (legacy && legacy !== env.jwt.accessSecret) {
      try {
        return jwt.verify(token, legacy) as AnyTokenPayload;
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Resolve full principal from token + DB. We never trust token claims alone —
 * for permissions/branchId/active-state we always cross-check the DB, so that
 * a manager getting deactivated immediately loses realtime access.
 */
export const resolvePrincipal = async (
  socket: Socket,
): Promise<SocketPrincipal> => {
  const token = extractToken(socket);
  if (!token) throw new Error('Missing socket auth token');

  const payload = decode(token);
  if (!payload) throw new Error('Invalid or expired socket token');

  // Admin
  if (payload.type === 'admin_access' && typeof payload.adminId === 'string') {
    const admin = await Admin.findById(payload.adminId)
      .select('name role permissions isActive branchId')
      .lean();
    if (!admin || admin.isActive === false) {
      throw new Error('Admin not active');
    }
    return {
      type: 'admin',
      id: String(admin._id),
      name: admin.name,
      role: String(admin.role || payload.role || 'admin'),
      permissions: Array.isArray(admin.permissions) ? admin.permissions : [],
      branchId:
        (admin as { branchId?: string | null }).branchId ?? null,
    };
  }

  // Manager (standardized)
  const isManager =
    payload.type === 'manager_access' || payload.role === 'manager';
  if (isManager) {
    const managerId =
      (payload.managerId as string | undefined) ||
      (payload.userId as string | undefined);
    if (!managerId) throw new Error('Manager token missing managerId');

    const manager = await Manager.findById(managerId)
      .select(
        'name permissions isActive isVerified branchId branchName managerType',
      )
      .lean();
    if (!manager || !manager.isActive) {
      throw new Error('Manager account disabled or not found');
    }

    return {
      type: 'manager',
      id: String(manager._id),
      name: manager.name,
      role: 'manager',
      permissions: Array.isArray(manager.permissions) ? manager.permissions : [],
      branchId: manager.branchId ?? null,
    };
  }

  // Tailor
  if (payload.type === 'tailor_access' && typeof payload.tailorId === 'string') {
    const tailor = await Tailor.findById(payload.tailorId)
      .select('name role isActive branchId')
      .lean();
    if (!tailor || !tailor.isActive) {
      throw new Error('Tailor inactive');
    }
    return {
      type: 'tailor',
      id: String(tailor._id),
      name: tailor.name,
      role: String(tailor.role || 'tailor'),
      permissions: [],
      branchId:
        (tailor as { branchId?: string | null }).branchId ?? null,
      assignedTailorIds: [String(tailor._id)],
    };
  }

  throw new Error('Unsupported token role');
};

/**
 * Socket.IO middleware factory. Attaches a typed `principal` on
 * `socket.data.principal` and rejects unauthenticated handshakes.
 */
export const socketAuthMiddleware = (
  allowed: SocketPrincipalType[] | 'any' = 'any',
) => {
  return async (
    socket: Socket,
    next: (err?: Error) => void,
  ): Promise<void> => {
    try {
      const principal = await resolvePrincipal(socket);
      if (allowed !== 'any' && !allowed.includes(principal.type)) {
        return next(new Error('Forbidden: namespace not allowed for this role'));
      }
      socket.data.principal = principal;
      next();
    } catch (err) {
      logger.warn(
        `Socket auth rejected: ${(err as Error).message} ` +
          `(ns=${socket.nsp.name}, ip=${socket.handshake.address})`,
      );
      next(new Error('Unauthorized'));
    }
  };
};
