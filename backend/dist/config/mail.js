"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMailConnection = exports.getMailTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
const logger_1 = require("../common/logger");
let transporter = null;
const getMailTransporter = () => {
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: env_1.env.mail.host,
            port: env_1.env.mail.port,
            secure: env_1.env.mail.port === 465,
            auth: {
                user: env_1.env.mail.user,
                pass: env_1.env.mail.pass,
            },
        });
    }
    return transporter;
};
exports.getMailTransporter = getMailTransporter;
const verifyMailConnection = async () => {
    if (!env_1.env.mail.enabled) {
        logger_1.logger.warn('⚠️  Mail is disabled by configuration (MAIL_ENABLED=false)');
        return;
    }
    if (!env_1.env.mail.user || !env_1.env.mail.pass) {
        logger_1.logger.warn('⚠️  Mail credentials not set — email sending will be disabled');
        return;
    }
    try {
        const t = (0, exports.getMailTransporter)();
        await t.verify();
        logger_1.logger.info('✅ Mail transporter ready');
    }
    catch (error) {
        logger_1.logger.warn(`⚠️  Mail connection failed: ${error.message.split('\\n')[0]} - Email sending disabled`);
    }
};
exports.verifyMailConnection = verifyMailConnection;
//# sourceMappingURL=mail.js.map