"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_TTL_DAYS = exports.MAX_OTP_ATTEMPTS = exports.OTP_TTL_SECONDS = exports.BLOUSE_TYPE = exports.COLLECTION_TYPE = exports.HTTP_STATUS = exports.UPLOAD_FOLDER = exports.ADDRESS_TYPE = exports.NOTIFICATION_TYPE = exports.NOTIFICATION_CHANNEL = exports.SUPPORT_TICKET_STATUS = exports.BANNER_SECTION = exports.CONTENT_TYPE = exports.REVIEW_STATUS = exports.COUPON_TYPE = exports.PRODUCT_STATUS = exports.CUSTOM_BLOUSE_STATUS = exports.PAYMENT_METHOD = exports.PAYMENT_STATUS = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PACKED: 'packed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
};
exports.PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};
exports.PAYMENT_METHOD = {
    RAZORPAY: 'razorpay',
    COD: 'cod',
};
exports.CUSTOM_BLOUSE_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    PRICE_ASSIGNED: 'price_assigned',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    DELIVERED: 'delivered',
};
exports.PRODUCT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
};
exports.COUPON_TYPE = {
    PERCENTAGE: 'percentage',
    FLAT: 'flat',
};
exports.REVIEW_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.CONTENT_TYPE = {
    ABOUT: 'about',
    FAQ: 'faq',
    BLOG: 'blog',
    POLICY: 'policy',
    HOMEPAGE: 'homepage',
    FOOTER: 'footer',
    CONTACT: 'contact',
};
exports.BANNER_SECTION = {
    HERO: 'hero',
    PROMOTIONAL: 'promotional',
    CATEGORY: 'category',
    CAMPAIGN: 'campaign',
    ANNOUNCEMENT: 'announcement',
};
exports.SUPPORT_TICKET_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
};
exports.NOTIFICATION_CHANNEL = {
    EMAIL: 'email',
    IN_APP: 'in_app',
};
exports.NOTIFICATION_TYPE = {
    ORDER_PLACED: 'order_placed',
    ORDER_CONFIRMED: 'order_confirmed',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered',
    ORDER_CANCELLED: 'order_cancelled',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',
    CUSTOM_BLOUSE_UPDATE: 'custom_blouse_update',
    ACCOUNT_CREATED: 'account_created',
    PASSWORD_RESET: 'password_reset',
    OTP_SENT: 'otp_sent',
    COUPON_APPLIED: 'coupon_applied',
};
exports.ADDRESS_TYPE = {
    HOME: 'home',
    WORK: 'work',
    OTHER: 'other',
};
exports.UPLOAD_FOLDER = {
    PRODUCTS: 'products',
    BANNERS: 'banners',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
    BLOGS: 'blogs',
    PROFILES: 'profiles',
    CUSTOM_BLOUSE: 'custom-blouse',
    MISC: 'misc',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
exports.COLLECTION_TYPE = {
    BRIDAL: 'bridal',
    SILK: 'silk',
    FESTIVE: 'festive',
    DESIGNER_BLOUSE: 'designer_blouse',
    CAMPAIGN: 'campaign',
    CURATED: 'curated',
};
exports.BLOUSE_TYPE = {
    READY_MADE: 'ready_made',
    CUSTOM_STITCHED: 'custom_stitched',
    DESIGNER: 'designer',
    BRIDAL: 'bridal',
};
exports.OTP_TTL_SECONDS = 600; // 10 minutes
exports.MAX_OTP_ATTEMPTS = 3;
exports.REFRESH_TOKEN_TTL_DAYS = 7;
//# sourceMappingURL=enums.js.map