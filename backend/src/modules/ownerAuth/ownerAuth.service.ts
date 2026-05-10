import { BoutiqueOwner, IBoutiqueOwner } from './ownerAuth.model';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { generateTokenId } from '../../common/utils/helpers';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../../common/errors';
import { logger } from '../../common/logger';

export class OwnerAuthService {
  async register(data: { ownerName: string; email: string; mobile: string; password: string }): Promise<{ message: string; owner: Record<string, unknown> }> {
    const existing = await BoutiqueOwner.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new ConflictError('An account with this email already exists');

    const passwordHash = await hashPassword(data.password);
    const owner = await BoutiqueOwner.create({
      ownerName: data.ownerName.trim(),
      email: data.email.toLowerCase().trim(),
      mobile: data.mobile.trim(),
      passwordHash,
    });

    logger.info(`New boutique owner registered: ${owner.email}`);

    return {
      message: 'Registration successful. Your account is pending admin approval.',
      owner: { id: owner.id as string, ownerName: owner.ownerName, email: owner.email, isApproved: owner.isApproved },
    };
  }

  async login(email: string, password: string): Promise<{
    owner: Record<string, unknown>;
    accessToken: string;
    refreshToken: string;
  }> {
    const owner = await BoutiqueOwner.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash +refreshTokens');
    if (!owner) throw new UnauthorizedError('Invalid email or password');
    if (!owner.isActive) throw new ForbiddenError('Your account has been suspended. Please contact support.');
    if (!owner.isApproved) throw new ForbiddenError('Your boutique account is pending admin approval. Please wait.');

    const isValid = await comparePassword(password, owner.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: owner.id, role: 'boutique_owner' });
    const refreshToken = generateRefreshToken({ userId: owner.id, tokenId });

    owner.refreshTokens = [...(owner.refreshTokens || []), refreshToken].slice(-5);
    owner.lastLoginAt = new Date();
    await owner.save();

    logger.info(`Boutique owner login: ${owner.email}`);

    return {
      owner: { id: owner.id as string, ownerName: owner.ownerName, email: owner.email, mobile: owner.mobile, isApproved: owner.isApproved },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(token);
    const owner = await BoutiqueOwner.findById(payload.userId).select('+refreshTokens');
    if (!owner) throw new UnauthorizedError('Owner not found');
    if (!owner.refreshTokens?.includes(token)) throw new UnauthorizedError('Refresh token is invalid or revoked');

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: owner.id, role: 'boutique_owner' });
    const newRefreshToken = generateRefreshToken({ userId: owner.id, tokenId });

    const updatedTokens = owner.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-5);
    await BoutiqueOwner.updateOne({ _id: owner.id }, { $set: { refreshTokens: updatedTokens } });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(ownerId: string, token: string): Promise<void> {
    const owner = await BoutiqueOwner.findById(ownerId).select('+refreshTokens');
    if (owner) {
      const updatedTokens = (owner.refreshTokens || []).filter((t) => t !== token);
      await BoutiqueOwner.updateOne({ _id: owner.id }, { $set: { refreshTokens: updatedTokens } });
    }
  }

  async getMe(ownerId: string): Promise<IBoutiqueOwner> {
    const owner = await BoutiqueOwner.findById(ownerId);
    if (!owner) throw new NotFoundError('Boutique owner');
    return owner;
  }

  // Admin: approve / reject owner
  async approveOwner(ownerId: string, adminId: string): Promise<IBoutiqueOwner> {
    const owner = await BoutiqueOwner.findById(ownerId);
    if (!owner) throw new NotFoundError('Boutique owner');
    owner.isApproved = true;
    await owner.save();
    logger.info(`Boutique owner approved: ${owner.email} by admin ${adminId}`);
    return owner;
  }

  async rejectOwner(ownerId: string, adminId: string): Promise<IBoutiqueOwner> {
    const owner = await BoutiqueOwner.findById(ownerId);
    if (!owner) throw new NotFoundError('Boutique owner');
    owner.isApproved = false;
    owner.isActive = false;
    await owner.save();
    logger.warn(`Boutique owner rejected: ${owner.email} by admin ${adminId}`);
    return owner;
  }
}

export const ownerAuthService = new OwnerAuthService();
