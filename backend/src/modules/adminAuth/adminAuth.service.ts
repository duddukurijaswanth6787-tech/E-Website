import { Admin } from '../admins/admin.model';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import { generateAdminAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { generateTokenId } from '../../common/utils/helpers';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../../common/errors';
import { ROLE_PERMISSIONS } from '../../common/constants/roles';
import { logger } from '../../common/logger';

export class AdminAuthService {
  async login(email: string, password: string, ip?: string) {
    const admin = await Admin.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash +refreshTokens');
    if (!admin) throw new UnauthorizedError('Invalid credentials');
    if (!admin.isActive) throw new ForbiddenError('Your admin account is inactive. Contact super admin.');

    const isValid = await comparePassword(password, admin.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid credentials');

    const permissions = ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
    const tokenId = generateTokenId();

    const accessToken = generateAdminAccessToken({
      adminId: admin.id,
      role: admin.role,
      permissions,
    });
    const refreshToken = generateRefreshToken({ userId: admin.id, tokenId });

    admin.refreshTokens = [...(admin.refreshTokens || []), refreshToken].slice(-3);
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip;
    await admin.save();

    logger.info(`Admin login: ${admin.email} (${admin.role}) from ${ip}`);

    return {
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const admin = await Admin.findById(payload.userId).select('+refreshTokens');
    if (!admin) throw new UnauthorizedError('Admin not found');
    if (!admin.refreshTokens?.includes(token)) throw new UnauthorizedError('Token revoked');

    const permissions = ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
    const tokenId = generateTokenId();
    const accessToken = generateAdminAccessToken({ adminId: admin.id, role: admin.role, permissions });
    const newRefreshToken = generateRefreshToken({ userId: admin.id, tokenId });

    admin.refreshTokens = admin.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-3);
    await admin.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(adminId: string, refreshToken: string) {
    const admin = await Admin.findById(adminId).select('+refreshTokens');
    if (admin) {
      admin.refreshTokens = (admin.refreshTokens || []).filter((t) => t !== refreshToken);
      await admin.save();
    }
  }

  async forceLogout(adminId: string) {
    const admin = await Admin.findById(adminId).select('+refreshTokens');
    if (!admin) throw new NotFoundError('Admin');
    admin.refreshTokens = [];
    await admin.save();
    logger.warn(`Force logout executed for admin: ${admin.email}`);
  }

  async getMe(adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) throw new NotFoundError('Admin');
    const permissions = ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
    return { ...admin.toJSON(), permissions };
  }
}

export const adminAuthService = new AdminAuthService();
