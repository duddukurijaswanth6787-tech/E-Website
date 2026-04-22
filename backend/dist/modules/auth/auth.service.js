"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_model_1 = require("../users/user.model");
const hash_1 = require("../../common/utils/hash");
const jwt_1 = require("../../common/utils/jwt");
const otp_1 = require("../../common/utils/otp");
const helpers_1 = require("../../common/utils/helpers");
const email_1 = require("../../common/utils/email");
const errors_1 = require("../../common/errors");
class AuthService {
    async register(data) {
        const existing = await user_model_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing) {
            if (!existing.isEmailVerified) {
                // Resend OTP
                const otp = (0, otp_1.generateOTP)();
                await (0, otp_1.storeOTP)(data.email, otp);
                await (0, email_1.sendOTPEmail)(data.email, existing.name, otp);
                return { message: 'OTP resent. Please verify your email.', email: data.email };
            }
            throw new errors_1.ConflictError('An account with this email already exists');
        }
        const passwordHash = await (0, hash_1.hashPassword)(data.password);
        const user = await user_model_1.User.create({
            name: data.name.trim(),
            email: data.email.toLowerCase().trim(),
            mobile: data.mobile,
            passwordHash,
            isEmailVerified: false,
            role: 'customer',
        });
        const otp = (0, otp_1.generateOTP)();
        await (0, otp_1.storeOTP)(data.email, otp);
        await (0, email_1.sendOTPEmail)(data.email, user.name, otp);
        return { message: 'Registration successful. Please verify your email.', email: data.email };
    }
    async verifyEmail(email, otp) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new errors_1.NotFoundError('User');
        const isValid = await (0, otp_1.verifyOTP)(email, otp);
        if (!isValid)
            throw new errors_1.BadRequestError('Invalid or expired OTP. Please request a new one.');
        user.isEmailVerified = true;
        const tokenId = (0, helpers_1.generateTokenId)();
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, tokenId });
        user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
        await user.save();
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken,
            refreshToken,
        };
    }
    async login(email, password) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash +refreshTokens');
        if (!user)
            throw new errors_1.UnauthorizedError('Invalid email or password');
        if (user.isBlocked)
            throw new errors_1.UnauthorizedError('Your account has been suspended. Please contact support.');
        if (!user.isEmailVerified)
            throw new errors_1.UnauthorizedError('Please verify your email before logging in.');
        const isValid = await (0, hash_1.comparePassword)(password, user.passwordHash);
        if (!isValid)
            throw new errors_1.UnauthorizedError('Invalid email or password');
        const tokenId = (0, helpers_1.generateTokenId)();
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, tokenId });
        user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
        user.lastLoginAt = new Date();
        await user.save();
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(token) {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const user = await user_model_1.User.findById(payload.userId).select('+refreshTokens');
        if (!user)
            throw new errors_1.UnauthorizedError('User not found');
        if (!user.refreshTokens?.includes(token))
            throw new errors_1.UnauthorizedError('Refresh token is invalid or revoked');
        const tokenId = (0, helpers_1.generateTokenId)();
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, role: user.role });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, tokenId });
        user.refreshTokens = user.refreshTokens
            .filter((t) => t !== token)
            .concat(newRefreshToken)
            .slice(-5);
        await user.save();
        return { accessToken, refreshToken: newRefreshToken };
    }
    async logout(userId, refreshToken) {
        const user = await user_model_1.User.findById(userId).select('+refreshTokens');
        if (user && user.refreshTokens) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
            await user.save();
        }
    }
    async forgotPassword(email) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Security: don't reveal if email exists
            return { message: 'If an account exists, a password reset code has been sent.' };
        }
        const otp = (0, otp_1.generateOTP)();
        await (0, otp_1.storeOTP)(`reset:${email}`, otp);
        await (0, email_1.sendPasswordResetEmail)(email, user.name, otp);
        return { message: 'Password reset code sent to your email.' };
    }
    async resetPassword(email, otp, newPassword) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new errors_1.NotFoundError('User');
        const isValid = await (0, otp_1.verifyOTP)(`reset:${email}`, otp);
        if (!isValid)
            throw new errors_1.BadRequestError('Invalid or expired OTP');
        user.passwordHash = await (0, hash_1.hashPassword)(newPassword);
        user.refreshTokens = []; // invalidate all sessions
        await user.save();
        return { message: 'Password reset successfully. Please log in.' };
    }
    async resendOTP(email) {
        const user = await user_model_1.User.findOne({ email: email.toLowerCase() });
        if (!user)
            throw new errors_1.NotFoundError('User');
        if (user.isEmailVerified)
            throw new errors_1.BadRequestError('Email is already verified');
        const otp = (0, otp_1.generateOTP)();
        await (0, otp_1.storeOTP)(email, otp);
        await (0, email_1.sendOTPEmail)(email, user.name, otp);
        return { message: 'OTP resent successfully.' };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map