import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors';

export interface JwtAccessPayload {
  userId: string;
  role: string;
  type: 'access';
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

export interface JwtAdminAccessPayload {
  adminId: string;
  role: string;
  permissions: string[];
  type: 'admin_access';
}

export const generateAccessToken = (payload: Omit<JwtAccessPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'access' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: Omit<JwtRefreshPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const generateAdminAccessToken = (payload: Omit<JwtAdminAccessPayload, 'type'>): string => {
  return jwt.sign({ ...payload, type: 'admin_access' }, env.jwt.accessSecret, {
    expiresIn: '8h',
  });
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as JwtAccessPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret) as JwtRefreshPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

export const verifyAdminAccessToken = (token: string): JwtAdminAccessPayload => {
  try {
    return jwt.verify(token, env.jwt.accessSecret) as JwtAdminAccessPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired admin token');
  }
};

export const decodeTokenWithoutVerify = (token: string): Record<string, unknown> | null => {
  return jwt.decode(token) as Record<string, unknown> | null;
};
