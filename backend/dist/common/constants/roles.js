"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.PERMISSIONS = exports.ADMIN_ROLES = exports.USER_ROLES = void 0;
exports.USER_ROLES = {
    CUSTOMER: 'customer',
};
exports.ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    CATALOG_MANAGER: 'catalog_manager',
    ORDER_MANAGER: 'order_manager',
    SUPPORT_MANAGER: 'support_manager',
    MARKETING_MANAGER: 'marketing_manager',
    FINANCE_VIEWER: 'finance_viewer',
};
exports.PERMISSIONS = {
    // Admin management
    MANAGE_ADMINS: 'manage_admins',
    MANAGE_ROLES: 'manage_roles',
    // Catalog
    MANAGE_PRODUCTS: 'manage_products',
    MANAGE_CATEGORIES: 'manage_categories',
    MANAGE_COLLECTIONS: 'manage_collections',
    MANAGE_BANNERS: 'manage_banners',
    // Commerce
    MANAGE_ORDERS: 'manage_orders',
    MANAGE_COUPONS: 'manage_coupons',
    MANAGE_PAYMENTS: 'manage_payments',
    MANAGE_SHIPPING: 'manage_shipping',
    // Content
    MANAGE_CONTENT: 'manage_content',
    // Users
    MANAGE_USERS: 'manage_users',
    // Custom blouse
    MANAGE_CUSTOM_BLOUSE: 'manage_custom_blouse',
    // Reviews
    MANAGE_REVIEWS: 'manage_reviews',
    // Analytics
    VIEW_ANALYTICS: 'view_analytics',
    // Settings
    MANAGE_SETTINGS: 'manage_settings',
    // Support
    MANAGE_SUPPORT: 'manage_support',
    // Audit
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    // Media
    MANAGE_MEDIA: 'manage_media',
    // Notifications
    MANAGE_NOTIFICATIONS: 'manage_notifications',
};
exports.ROLE_PERMISSIONS = {
    [exports.ADMIN_ROLES.SUPER_ADMIN]: Object.values(exports.PERMISSIONS),
    [exports.ADMIN_ROLES.ADMIN]: [
        exports.PERMISSIONS.MANAGE_PRODUCTS, exports.PERMISSIONS.MANAGE_CATEGORIES,
        exports.PERMISSIONS.MANAGE_COLLECTIONS, exports.PERMISSIONS.MANAGE_BANNERS,
        exports.PERMISSIONS.MANAGE_ORDERS, exports.PERMISSIONS.MANAGE_COUPONS,
        exports.PERMISSIONS.MANAGE_PAYMENTS, exports.PERMISSIONS.MANAGE_CONTENT,
        exports.PERMISSIONS.MANAGE_USERS, exports.PERMISSIONS.MANAGE_CUSTOM_BLOUSE,
        exports.PERMISSIONS.MANAGE_REVIEWS, exports.PERMISSIONS.VIEW_ANALYTICS,
        exports.PERMISSIONS.MANAGE_SUPPORT, exports.PERMISSIONS.VIEW_AUDIT_LOGS,
        exports.PERMISSIONS.MANAGE_MEDIA, exports.PERMISSIONS.MANAGE_NOTIFICATIONS,
        exports.PERMISSIONS.MANAGE_SHIPPING,
    ],
    [exports.ADMIN_ROLES.CATALOG_MANAGER]: [
        exports.PERMISSIONS.MANAGE_PRODUCTS, exports.PERMISSIONS.MANAGE_CATEGORIES,
        exports.PERMISSIONS.MANAGE_COLLECTIONS, exports.PERMISSIONS.MANAGE_BANNERS,
        exports.PERMISSIONS.MANAGE_MEDIA,
    ],
    [exports.ADMIN_ROLES.ORDER_MANAGER]: [
        exports.PERMISSIONS.MANAGE_ORDERS, exports.PERMISSIONS.MANAGE_CUSTOM_BLOUSE,
        exports.PERMISSIONS.MANAGE_SHIPPING,
    ],
    [exports.ADMIN_ROLES.SUPPORT_MANAGER]: [
        exports.PERMISSIONS.MANAGE_USERS, exports.PERMISSIONS.MANAGE_SUPPORT,
        exports.PERMISSIONS.MANAGE_CUSTOM_BLOUSE,
    ],
    [exports.ADMIN_ROLES.MARKETING_MANAGER]: [
        exports.PERMISSIONS.MANAGE_PRODUCTS, exports.PERMISSIONS.MANAGE_BANNERS,
        exports.PERMISSIONS.MANAGE_COUPONS, exports.PERMISSIONS.MANAGE_CONTENT,
        exports.PERMISSIONS.VIEW_ANALYTICS, exports.PERMISSIONS.MANAGE_MEDIA,
        exports.PERMISSIONS.MANAGE_NOTIFICATIONS,
    ],
    [exports.ADMIN_ROLES.FINANCE_VIEWER]: [
        exports.PERMISSIONS.MANAGE_PAYMENTS, exports.PERMISSIONS.VIEW_ANALYTICS,
    ],
};
//# sourceMappingURL=roles.js.map