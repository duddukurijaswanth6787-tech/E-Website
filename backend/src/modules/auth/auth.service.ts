import { User } from '../users/user.model';
import { hashPassword, comparePassword } from '../../common/utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { generateOTP, storeOTP, verifyOTP } from '../../common/utils/otp';
import { generateTokenId } from '../../common/utils/helpers';
import { sendOTPEmail, sendPasswordResetEmail } from '../../common/utils/email';
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from '../../common/errors';
import { env } from '../../config/env';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../common/logger';
import { getSettingValue } from '../../common/utils/settings';

export class AuthService {
  async register(data: { name: string; email: string; password: string; mobile?: string }) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      if (!existing.isEmailVerified) {
        // Resend OTP
        const otp = generateOTP();
        await storeOTP(data.email, otp);
        await sendOTPEmail(data.email, existing.name, otp);
        return { message: 'OTP resent. Please verify your email.', email: data.email, requiresOtp: true };
      }
      throw new ConflictError('An account with this email already exists');
    }

    const isOtpEnabled = await getSettingValue('otp_signup_enabled', true);

    const passwordHash = await hashPassword(data.password);
    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      mobile: data.mobile,
      passwordHash,
      isEmailVerified: !isOtpEnabled,
      role: 'customer',
    });

    if (isOtpEnabled) {
      const otp = generateOTP();
      await storeOTP(data.email, otp);
      await sendOTPEmail(data.email, user.name, otp);
      return { message: 'Registration successful. Please verify your email.', email: data.email, requiresOtp: true };
    }

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    await user.save();

    return { 
      message: 'Registration successful.', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
      requiresOtp: false
    };
  }

  async verifyEmail(email: string, otp: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User');

    const isValid = await verifyOTP(email, otp);
    if (!isValid) throw new BadRequestError('Invalid or expired OTP. Please request a new one.');

    user.isEmailVerified = true;
    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    await user.save();

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash +refreshTokens');
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.isBlocked) throw new UnauthorizedError('Your account has been suspended. Please contact support.');
    
    // If signup OTP is enabled, we still want to block login if not verified
    const isSignupOtpEnabled = await getSettingValue('otp_signup_enabled', true);
    if (isSignupOtpEnabled && !user.isEmailVerified) throw new UnauthorizedError('Please verify your email before logging in.');

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    const isLoginOtpEnabled = await getSettingValue('otp_login_enabled', true);
    if (isLoginOtpEnabled) {
      const otp = generateOTP();
      await storeOTP(`login:${email}`, otp);
      await sendOTPEmail(email, user.name, otp);
      return { message: 'OTP sent to your email. Please verify to login.', email, requiresOtp: true };
    }

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken,
      requiresOtp: false
    };
  }

  async verifyLoginOTP(email: string, otp: string) {
    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+refreshTokens');
    if (!user) throw new NotFoundError('User');
    if (user.isBlocked) throw new UnauthorizedError('Your account has been suspended.');

    const isValid = await verifyOTP(`login:${email}`, otp);
    if (!isValid) throw new BadRequestError('Invalid or expired OTP');

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, tokenId });

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    user.lastLoginAt = new Date();
    user.isEmailVerified = true; 
    await user.save();

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user) throw new UnauthorizedError('User not found');
    if (!user.refreshTokens?.includes(token)) throw new UnauthorizedError('Refresh token is invalid or revoked');

    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, tokenId });

    const updatedTokens = user.refreshTokens
      .filter((t) => t !== token)
      .concat(newRefreshToken)
      .slice(-5);

    await User.updateOne(
      { _id: user.id },
      { $set: { refreshTokens: updatedTokens } }
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string, refreshToken: string) {
    const user = await User.findById(userId).select('+refreshTokens');
    if (user && user.refreshTokens) {
      const updatedTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await User.updateOne(
        { _id: user.id },
        { $set: { refreshTokens: updatedTokens } }
      );
    }
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'If an account exists, a password reset code has been sent.' };
    }

    const isOtpEnabled = await getSettingValue('otp_forgot_password_enabled', true);
    if (isOtpEnabled) {
      const otp = generateOTP();
      await storeOTP(`reset:${email}`, otp);
      await sendPasswordResetEmail(email, user.name, otp);
      return { message: 'Password reset code sent to your email.', requiresOtp: true };
    }

    return { message: 'OTP is disabled. You can proceed to reset your password.', requiresOtp: false };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User');

    const isOtpEnabled = await getSettingValue('otp_forgot_password_enabled', true);
    if (isOtpEnabled) {
      const isValid = await verifyOTP(`reset:${email}`, otp);
      if (!isValid) throw new BadRequestError('Invalid or expired OTP');
    }

    user.passwordHash = await hashPassword(newPassword);
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    return { message: 'Password reset successfully. Please log in.' };
  }

  async resendOTP(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError('User');
    if (user.isEmailVerified) throw new BadRequestError('Email is already verified');

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendOTPEmail(email, user.name, otp);

    return { message: 'OTP resent successfully.' };
  }
}

export const authService = new AuthService();
