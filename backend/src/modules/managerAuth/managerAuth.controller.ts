import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Manager } from '../managers/manager.model';
import { UnauthorizedError } from '../../common/errors';
import crypto from 'crypto';
import { generateManagerAccessToken } from '../../common/utils/jwt';

const generateTokens = (
  managerId: string,
  permissions: string[],
  branchId?: string | null,
) => {
  // Use the standardized access secret + envelope ({type:'manager_access'})
  // so HTTP and Socket.IO auth share the same verification path.
  const accessToken = generateManagerAccessToken({
    managerId,
    role: 'manager',
    permissions,
    branchId: branchId ?? null,
  });

  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

export const managerLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const manager = await Manager.findOne({ email });
  if (!manager) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!manager.isActive) {
    throw new UnauthorizedError('Account is disabled');
  }

  if (manager.accountLockedUntil && manager.accountLockedUntil > new Date()) {
    throw new UnauthorizedError('Account is locked due to multiple failed attempts. Please try again later.');
  }

  const isMatch = await bcrypt.compare(password, manager.passwordHash);
  if (!isMatch) {
    manager.loginAttempts += 1;
    if (manager.loginAttempts >= 5) {
      manager.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
    }
    await manager.save();
    throw new UnauthorizedError('Invalid credentials');
  }

  // Reset attempts on successful login
  manager.loginAttempts = 0;
  manager.accountLockedUntil = undefined;
  manager.lastLoginAt = new Date();

  const { accessToken, refreshToken } = generateTokens(
    manager._id.toString(),
    Array.isArray(manager.permissions) ? manager.permissions : [],
    manager.branchId ?? null,
  );

  manager.refreshTokens.push(refreshToken);
  
  // Keep only the latest 5 refresh tokens to prevent array bloat
  if (manager.refreshTokens.length > 5) {
    manager.refreshTokens = manager.refreshTokens.slice(-5);
  }
  
  await manager.save();

  res.status(200).json({
    status: 'success',
    data: {
      accessToken,
      refreshToken,
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        managerCode: manager.managerCode,
        managerType: manager.managerType,
        department: manager.department,
        permissions: manager.permissions,
        profileImage: manager.profileImage,
        mustChangePassword: manager.mustChangePassword
      }
    }
  });
};

export const refreshManagerToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const manager = await Manager.findOne({ refreshTokens: refreshToken });
  if (!manager) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (!manager.isActive) {
    throw new UnauthorizedError('Account is disabled');
  }

  // Remove old refresh token
  manager.refreshTokens = manager.refreshTokens.filter(t => t !== refreshToken);

  const newTokens = generateTokens(
    manager._id.toString(),
    Array.isArray(manager.permissions) ? manager.permissions : [],
    manager.branchId ?? null,
  );
  manager.refreshTokens.push(newTokens.refreshToken);
  
  await manager.save();

  res.status(200).json({
    status: 'success',
    data: {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    }
  });
};

export const managerLogout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await Manager.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

export const changeManagerPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const managerId = (req as any).user.managerId;

  const manager = await Manager.findById(managerId);
  if (!manager) {
    throw new UnauthorizedError('Manager not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, manager.passwordHash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid current password');
  }

  const salt = await bcrypt.genSalt(10);
  manager.passwordHash = await bcrypt.hash(newPassword, salt);
  manager.mustChangePassword = false;
  manager.refreshTokens = []; // Force re-login on all devices
  await manager.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
};
