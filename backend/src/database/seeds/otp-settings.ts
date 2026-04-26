import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { connectMongoDB, disconnectMongoDB } from '../../config/database';
import { Setting } from '../../modules/settings/setting.model';

const seedOTPSettings = async () => {
    console.log('🌱 Seeding OTP settings...');
    await connectMongoDB();

    const otpSettings = [
        { key: 'otp_signup_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Signup OTP', isPublic: true },
        { key: 'otp_login_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Login OTP', isPublic: true },
        { key: 'otp_forgot_password_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Forgot Password OTP', isPublic: true },
        { key: 'otp_admin_login_enabled', value: true, group: 'security', type: 'boolean', label: 'Enable Admin OTP (MFA)', isPublic: true },
    ];

    for (const setting of otpSettings) {
        const exists = await Setting.findOne({ key: setting.key });
        if (!exists) {
            await Setting.create(setting);
            console.log(`✅ Setting created: ${setting.key}`);
        } else {
            console.log(`ℹ️ Setting already exists: ${setting.key}`);
        }
    }

    console.log('✅ OTP settings seeded successfully!');
    await disconnectMongoDB();
    process.exit(0);
};

seedOTPSettings().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
