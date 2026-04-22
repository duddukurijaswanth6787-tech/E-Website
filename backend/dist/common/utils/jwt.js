"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeTokenWithoutVerify = exports.verifyAdminAccessToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateAdminAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const errors_1 = require("../errors");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, env_1.env.jwt.accessSecret, {
        expiresIn: env_1.env.jwt.accessExpiresIn,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, env_1.env.jwt.refreshSecret, {
        expiresIn: env_1.env.jwt.refreshExpiresIn,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const generateAdminAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign({ ...payload, type: 'admin_access' }, env_1.env.jwt.accessSecret, {
        expiresIn: '8h',
    });
};
exports.generateAdminAccessToken = generateAdminAccessToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
    }
    catch {
        throw new errors_1.UnauthorizedError('Invalid or expired access token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwt.refreshSecret);
    }
    catch {
        throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyAdminAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.jwt.accessSecret);
    }
    catch {
        throw new errors_1.UnauthorizedError('Invalid or expired admin token');
    }
};
exports.verifyAdminAccessToken = verifyAdminAccessToken;
const decodeTokenWithoutVerify = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeTokenWithoutVerify = decodeTokenWithoutVerify;
//# sourceMappingURL=jwt.js.map