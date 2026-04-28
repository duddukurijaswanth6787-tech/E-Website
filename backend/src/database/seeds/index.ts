import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { connectMongoDB, disconnectMongoDB } from '../../config/database';
import { Admin } from '../../modules/admins/admin.model';
import { User } from '../../modules/users/user.model';
import { Category } from '../../modules/categories/category.model';
import { Product } from '../../modules/products/product.model';
import { Setting } from '../../modules/settings/setting.model';
import { hashPassword } from '../../common/utils/hash';
import { ROLE_PERMISSIONS, ADMIN_ROLES } from '../../common/constants';
import { env } from '../../config/env';
import { CustomBlouseOption } from '../../modules/customBlouse/customBlouseOption.model';

const seed = async () => {
  console.log('🌱 Starting database seed...');
  await connectMongoDB();

  // ===== 1. Seed Super Admin =====
  const existing = await Admin.findOne({ email: env.seed.adminEmail });
  if (!existing) {
    const adminPassword = await hashPassword(env.seed.adminPassword);
    await User.create({
      name: env.seed.adminName,
      email: env.seed.adminEmail.toLowerCase(),
      passwordHash: adminPassword,
      role: 'super_admin',
      isEmailVerified: true,
    });

    // Create QA Customer
    const customerPassword = await hashPassword('Customer@123');
    await User.create({
      name: 'QA Customer',
      email: 'customer@test.com',
      passwordHash: customerPassword,
      role: 'customer',
      isEmailVerified: true,
    });

    console.log('✅ Base users created');

    await Admin.create({
      name: env.seed.adminName,
      email: env.seed.adminEmail,
      passwordHash: adminPassword,
      role: ADMIN_ROLES.SUPER_ADMIN,
      permissions: ROLE_PERMISSIONS[ADMIN_ROLES.SUPER_ADMIN],
      isActive: true,
    });
    console.log(`✅ Super Admin created: ${env.seed.adminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin already exists: ${env.seed.adminEmail}`);
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
    const exists = await Category.findOne({ slug: cat.slug });
    if (!exists) {
      await Category.create({ ...cat, isActive: true });
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  // Sub-categories for Sarees
  const sareeCategory = await Category.findOne({ slug: 'sarees' });
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
      const exists = await Category.findOne({ slug: sub.slug });
      if (!exists) {
        await Category.create({ ...sub, isActive: true });
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
    const exists = await Setting.findOne({ key: setting.key });
    if (!exists) {
      await Setting.create(setting);
      console.log(`✅ Setting created: ${setting.key}`);
    }
  }

  // ===== 4. Seed Mock Products =====
  const silkSareeSub = await Category.findOne({ slug: 'silk-sarees' });
  const blouseCategory = await Category.findOne({ slug: 'blouses' });
  
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
    const exists = await Product.findOne({ slug: prod.slug });
    if (!exists && prod.category) {
      await Product.create(prod);
      console.log(`✅ Product created: ${prod.name}`);
    }
  }

  // ===== 5. Seed Custom Blouse Options =====
  const blouseOptions = [
    // Fabric Types
    { category: 'fabricType', value: 'Silk', order: 1 },
    { category: 'fabricType', value: 'Cotton', order: 2 },
    { category: 'fabricType', value: 'Georgette', order: 3 },
    { category: 'fabricType', value: 'Velvet', order: 4 },
    { category: 'fabricType', value: 'Net', order: 5 },
    { category: 'fabricType', value: 'Organza', order: 6 },
    
    // Front Neck Types
    { category: 'frontNeckType', value: 'Boat', order: 1 },
    { category: 'frontNeckType', value: 'V-Neck', order: 2 },
    { category: 'frontNeckType', value: 'Round', order: 3 },
    { category: 'frontNeckType', value: 'Square', order: 4 },
    { category: 'frontNeckType', value: 'Sweetheart', order: 5 },
    
    // Back Neck Types
    { category: 'backNeckType', value: 'U-Back', order: 1 },
    { category: 'backNeckType', value: 'V-Back', order: 2 },
    { category: 'backNeckType', value: 'Round Back', order: 3 },
    { category: 'backNeckType', value: 'Deep Square', order: 4 },
    { category: 'backNeckType', value: 'Keyhole', order: 5 },
    
    // Sleeve Types
    { category: 'sleeveType', value: 'Short', order: 1 },
    { category: 'sleeveType', value: 'Elbow', order: 2 },
    { category: 'sleeveType', value: 'Three-Fourth', order: 3 },
    { category: 'sleeveType', value: 'Full', order: 4 },
    { category: 'sleeveType', value: 'Cap', order: 5 },
    
    // Sleeve Lengths
    { category: 'sleeveLength', value: '3-5 inches', order: 1 },
    { category: 'sleeveLength', value: '10-12 inches', order: 2 },
    { category: 'sleeveLength', value: 'Full Length', order: 3 },
  ];

  for (const option of blouseOptions) {
    const exists = await CustomBlouseOption.findOne({ category: option.category, value: option.value });
    if (!exists) {
      await CustomBlouseOption.create(option);
    }
  }
  console.log('✅ Custom blouse options seeded');

  console.log('\n🎉 Database seed completed successfully!');
  console.log(`\n📧 Admin Login: ${env.seed.adminEmail}`);
  console.log(`🔑 Admin Password: ${env.seed.adminPassword}`);
  console.log('\n⚠️  IMPORTANT: Change the admin password after first login!\n');

  await disconnectMongoDB();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
