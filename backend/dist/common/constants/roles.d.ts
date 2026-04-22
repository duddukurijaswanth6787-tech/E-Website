export declare const USER_ROLES: {
    readonly CUSTOMER: "customer";
};
export declare const ADMIN_ROLES: {
    readonly SUPER_ADMIN: "super_admin";
    readonly ADMIN: "admin";
    readonly CATALOG_MANAGER: "catalog_manager";
    readonly ORDER_MANAGER: "order_manager";
    readonly SUPPORT_MANAGER: "support_manager";
    readonly MARKETING_MANAGER: "marketing_manager";
    readonly FINANCE_VIEWER: "finance_viewer";
};
export declare const PERMISSIONS: {
    readonly MANAGE_ADMINS: "manage_admins";
    readonly MANAGE_ROLES: "manage_roles";
    readonly MANAGE_PRODUCTS: "manage_products";
    readonly MANAGE_CATEGORIES: "manage_categories";
    readonly MANAGE_COLLECTIONS: "manage_collections";
    readonly MANAGE_BANNERS: "manage_banners";
    readonly MANAGE_ORDERS: "manage_orders";
    readonly MANAGE_COUPONS: "manage_coupons";
    readonly MANAGE_PAYMENTS: "manage_payments";
    readonly MANAGE_SHIPPING: "manage_shipping";
    readonly MANAGE_CONTENT: "manage_content";
    readonly MANAGE_USERS: "manage_users";
    readonly MANAGE_CUSTOM_BLOUSE: "manage_custom_blouse";
    readonly MANAGE_REVIEWS: "manage_reviews";
    readonly VIEW_ANALYTICS: "view_analytics";
    readonly MANAGE_SETTINGS: "manage_settings";
    readonly MANAGE_SUPPORT: "manage_support";
    readonly VIEW_AUDIT_LOGS: "view_audit_logs";
    readonly MANAGE_MEDIA: "manage_media";
    readonly MANAGE_NOTIFICATIONS: "manage_notifications";
};
export declare const ROLE_PERMISSIONS: Record<string, string[]>;
