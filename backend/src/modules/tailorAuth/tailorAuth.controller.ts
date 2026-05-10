import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Tailor } from '../tailors/tailor.model';
import { generateTailorAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { UnauthorizedError, BadRequestError } from '../../common/errors';
import { logger } from '../../common/logger';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const tailor = await Tailor.findOne({ email }).select('+passwordHash +refreshTokens +loginAttempts +accountLockedUntil');
  if (!tailor) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check if account is locked
  if (tailor.accountLockedUntil && tailor.accountLockedUntil > new Date()) {
    throw new UnauthorizedError(`Account locked. Try again after ${Math.ceil((tailor.accountLockedUntil.getTime() - Date.now()) / 60000)} minutes`);
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, tailor.passwordHash);
  if (!isMatch) {
    tailor.loginAttempts += 1;
    if (tailor.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      tailor.accountLockedUntil = new Date(Date.now() + LOCK_TIME_MS);
      logger.warn(`Tailor account ${email} locked due to too many failed attempts`);
    }
    await tailor.save();
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!tailor.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Contact Admin.');
  }

  // Reset login attempts on success
  tailor.loginAttempts = 0;
  tailor.accountLockedUntil = undefined;
  tailor.lastLoginAt = new Date();

  // Generate tokens
  const accessToken = generateTailorAccessToken({ tailorId: tailor.id, role: tailor.role });
  const tokenId = crypto.randomBytes(16).toString('hex');
  const refreshToken = generateRefreshToken({ userId: tailor.id, tokenId });

  // Store refresh token
  tailor.refreshTokens.push(refreshToken);
  
  // Cleanup old refresh tokens if needed (keep max 5 sessions)
  if (tailor.refreshTokens.length > 5) {
    tailor.refreshTokens = tailor.refreshTokens.slice(-5);
  }
  
  await tailor.save();

  // Remove sensitive fields for response
  const tailorObj = tailor.toObject();

  res.status(200).json({
    status: 'success',
    data: {
      tailor: tailorObj,
      accessToken,
      refreshToken,
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  const payload = verifyRefreshToken(token);
  
  const tailor = await Tailor.findById(payload.userId).select('+refreshTokens');
  if (!tailor || !tailor.refreshTokens.includes(token)) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (!tailor.isActive) {
    throw new UnauthorizedError('Account deactivated');
  }

  // Generate new tokens
  const newAccessToken = generateTailorAccessToken({ tailorId: tailor.id, role: tailor.role });
  const newTokenId = crypto.randomBytes(16).toString('hex');
  const newRefreshToken = generateRefreshToken({ userId: tailor.id, tokenId: newTokenId });

  // Replace old token with new one
  tailor.refreshTokens = tailor.refreshTokens.filter(t => t !== token);
  tailor.refreshTokens.push(newRefreshToken);
  await tailor.save();

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const tailorId = req.tailor?.tailorId;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Wait, logout usually receives refreshToken in body to revoke

  const { refreshToken } = req.body;
  if (tailorId && refreshToken) {
    const tailor = await Tailor.findById(tailorId).select('+refreshTokens');
    if (tailor) {
      tailor.refreshTokens = tailor.refreshTokens.filter(t => t !== refreshToken);
      await tailor.save();
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};
