"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
const database_1 = require("../../config/database");
const admin_model_1 = require("../../modules/admins/admin.model");
const user_model_1 = require("../../modules/users/user.model");
const category_model_1 = require("../../modules/categories/category.model");
const product_model_1 = require("../../modules/products/product.model");
const setting_model_1 = require("../../modules/settings/setting.model");
const hash_1 = require("../../common/utils/hash");
const constants_1 = require("../../common/constants");
const env_1 = require("../../config/env");
const seed = async () => {
    console.log('🌱 Starting database seed...');
    await (0, database_1.connectMongoDB)();
    // ===== 1. Seed Super Admin =====
    const existing = await admin_model_1.Admin.findOne({ email: env_1.env.seed.adminEmail });
    if (!existing) {
        const adminPassword = await (0, hash_1.hashPassword)(env_1.env.seed.adminPassword);
        await user_model_1.User.create({
            name: env_1.env.seed.adminName,
            email: env_1.env.seed.adminEmail.toLowerCase(),
            passwordHash: adminPassword,
            role: 'super_admin',
            isEmailVerified: true,
        });
        // Create QA Customer
        const customerPassword = await (0, hash_1.hashPassword)('Customer@123');
        await user_model_1.User.create({
            name: 'QA Customer',
            email: 'customer@test.com',
            passwordHash: customerPassword,
            role: 'customer',
            isEmailVerified: true,
        });
        console.log('✅ Base users created');
        await admin_model_1.Admin.create({
            name: env_1.env.seed.adminName,
            email: env_1.env.seed.adminEmail,
            passwordHash: adminPassword,
            role: constants_1.ADMIN_ROLES.SUPER_ADMIN,
            permissions: constants_1.ROLE_PERMISSIONS[constants_1.ADMIN_ROLES.SUPER_ADMIN],
            isActive: true,
        });
        console.log(`✅ Super Admin created: ${env_1.env.seed.adminEmail}`);
    }
    else {
        console.log(`ℹ️  Super Admin already exists: ${env_1.env.seed.adminEmail}`);
    }
    // ===== 2. Seed Categories =====
    const categories = [
        { name: 'Sarees', slug: 'sarees', order: 1 },
        { name: 'Blouses', slug: 'blouses', order: 2 },
        { name: 'Lehengas', slug: 'lehengas', order: 3 },
        { name: 'Salwar Suits', slug: 'salwar-suits', order: 4 },
        { name: 'Dupattas', slug: 'dupattas', order: 5 },
        { name: 'Accessories', slug: 'accessories', order: 6 },
    ];
    for (const cat of categories) {
        const exists = await category_model_1.Category.findOne({ slug: cat.slug });
        if (!exists) {
            await category_model_1.Category.create({ ...cat, isActive: true });
            console.log(`✅ Category created: ${cat.name}`);
        }
    }
    // Sub-categories for Sarees
    const sareeCategory = await category_model_1.Category.findOne({ slug: 'sarees' });
    if (sareeCategory) {
        const subcategories = [
            { name: 'Silk Sarees', slug: 'silk-sarees', parent: sareeCategory._id, order: 1 },
            { name: 'Cotton Sarees', slug: 'cotton-sarees', parent: sareeCategory._id, order: 2 },
            { name: 'Georgette Sarees', slug: 'georgette-sarees', parent: sareeCategory._id, order: 3 },
            { name: 'Designer Sarees', slug: 'designer-sarees', parent: sareeCategory._id, order: 4 },
            { name: 'Bridal Sarees', slug: 'bridal-sarees', parent: sareeCategory._id, order: 5 },
            { name: 'Banarasi Sarees', slug: 'banarasi-sarees', parent: sareeCategory._id, order: 6 },
            { name: 'Kanchipuram Sarees', slug: 'kanchipuram-sarees', parent: sareeCategory._id, order: 7 },
        ];
        for (const sub of subcategories) {
            const exists = await category_model_1.Category.findOne({ slug: sub.slug });
            if (!exists) {
                await category_model_1.Category.create({ ...sub, isActive: true });
                console.log(`✅ Sub-category created: ${sub.name}`);
            }
        }
    }
    // ===== 3. Seed Settings =====
    const defaultSettings = [
        { key: 'site_name', value: 'Vasanthi Creations', group: 'general', type: 'string', label: 'Site Name', isPublic: true },
        { key: 'site_tagline', value: 'Premium Ethnic Fashion', group: 'general', type: 'string', label: 'Site Tagline', isPublic: true },
        { key: 'contact_email', value: 'hello@vasanthicreations.com', group: 'contact', type: 'string', label: 'Contact Email', isPublic: true },
        { key: 'contact_phone', value: '+91 98765 43210', group: 'contact', type: 'string', label: 'Contact Phone', isPublic: true },
        { key: 'contact_address', value: 'Chennai, Tamil Nadu, India', group: 'contact', type: 'string', label: 'Address', isPublic: true },
        { key: 'whatsapp_number', value: '919876543210', group: 'contact', type: 'string', label: 'WhatsApp Number', isPublic: true },
        { key: 'instagram_url', value: 'https://instagram.com/vasanthicreations', group: 'social', type: 'string', label: 'Instagram URL', isPublic: true },
        { key: 'facebook_url', value: 'https://facebook.com/vasanthicreations', group: 'social', type: 'string', label: 'Facebook URL', isPublic: true },
        { key: 'free_shipping_threshold', value: 999, group: 'shipping', type: 'number', label: 'Free Shipping Above (₹)', isPublic: true },
        { key: 'standard_shipping_charge', value: 99, group: 'shipping', type: 'number', label: 'Standard Shipping Charge (₹)', isPublic: true },
        { key: 'razorpay_enabled', value: true, group: 'payment', type: 'boolean', label: 'Razorpay Enabled', isPublic: false },
        { key: 'cod_enabled', value: true, group: 'payment', type: 'boolean', label: 'COD Enabled', isPublic: true },
        { key: 'seo_title', value: 'Vasanthi Creations — Premium Ethnic Sarees & Blouses', group: 'seo', type: 'string', label: 'SEO Title', isPublic: true },
        { key: 'seo_description', value: 'Discover premium ethnic sarees, designer blouses, and festive wear at Vasanthi Creations. Shop the finest silk, cotton, and bridal collections.', group: 'seo', type: 'string', label: 'SEO Description', isPublic: true },
    ];
    for (const setting of defaultSettings) {
        const exists = await setting_model_1.Setting.findOne({ key: setting.key });
        if (!exists) {
            await setting_model_1.Setting.create(setting);
            console.log(`✅ Setting created: ${setting.key}`);
        }
    }
    // ===== 4. Seed Mock Products =====
    const silkSareeSub = await category_model_1.Category.findOne({ slug: 'silk-sarees' });
    const blouseCategory = await category_model_1.Category.findOne({ slug: 'blouses' });
    const products = [
        {
            name: 'Vanya Kanchipuram Silk Saree',
            slug: 'vanya-kanchipuram-silk-saree',
            description: 'A traditional masterpiece with gold zari work and premium silk fabric.',
            category: silkSareeSub?._id,
            price: 24500,
            comparePrice: 28000,
            stock: 10,
            sku: 'VK-SAREE-001',
            images: ['https://placehold.co/600x800/f3f4f6/A51648?text=Silk+Saree+1'],
            isFeatured: true,
            status: 'published'
        },
        {
            name: 'Royal Blue Wedding Saree',
            slug: 'royal-blue-wedding-saree',
            description: 'Elegant royal blue saree perfect for weddings and festive occasions.',
            category: silkSareeSub?._id,
            price: 18900,
            comparePrice: 22000,
            stock: 5,
            sku: 'VK-SAREE-002',
            images: ['https://placehold.co/600x800/f3f4f6/A51648?text=Blue+Saree'],
            isTrending: true,
            status: 'published'
        },
        {
            name: 'Designer Embroidered Blouse',
            slug: 'designer-embroidered-blouse',
            description: 'Hand-embroidered designer blouse with intricate thread work.',
            category: blouseCategory?._id,
            price: 4500,
            comparePrice: 5500,
            stock: 20,
            sku: 'VK-BLOUSE-001',
            images: ['https://placehold.co/600x800/f3f4f6/A51648?text=Designer+Blouse'],
            isNewArrival: true,
            status: 'published'
        }
    ];
    for (const prod of products) {
        const exists = await product_model_1.Product.findOne({ slug: prod.slug });
        if (!exists && prod.category) {
            await product_model_1.Product.create(prod);
            console.log(`✅ Product created: ${prod.name}`);
        }
    }
    console.log('\n🎉 Database seed completed successfully!');
    console.log(`\n📧 Admin Login: ${env_1.env.seed.adminEmail}`);
    console.log(`🔑 Admin Password: ${env_1.env.seed.adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');
    await (0, database_1.disconnectMongoDB)();
    process.exit(0);
};
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map