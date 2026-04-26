"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const database_1 = require("../../config/database");
const setting_model_1 = require("../../modules/settings/setting.model");
const seedOTPSettings = async () => {
    console.log('🌱 Seeding OTP settings...');
    await (0, database_1.connectMongoDB)();
    const otpSettings = [
        { key: 'otp_signup_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Signup OTP', isPublic: true },
        { key: 'otp_login_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Login OTP', isPublic: true },
        { key: 'otp_forgot_password_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Forgot Password OTP', isPublic: true },
        { key: 'otp_admin_login_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Admin OTP (MFA)', isPublic: true },
    ];
    for (const setting of otpSettings) {
        const exists = await setting_model_1.Setting.findOne({ key: setting.key });
        if (!exists) {
            await setting_model_1.Setting.create(setting);
            console.log(`✅ Setting created: ${setting.key}`);
        }
        else {
            console.log(`ℹ️ Setting already exists: ${setting.key}`);
        }
    }
    console.log('✅ OTP settings seeded successfully!');
    await (0, database_1.disconnectMongoDB)();
    process.exit(0);
};
seedOTPSettings().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=otp-settings.js.map