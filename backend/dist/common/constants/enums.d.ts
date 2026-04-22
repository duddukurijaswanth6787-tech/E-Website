export declare const ORDER_STATUS: {
    readonly PENDING: "pending";
    readonly CONFIRMED: "confirmed";
    readonly PACKED: "packed";
    readonly SHIPPED: "shipped";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
    readonly REFUNDED: "refunded";
};
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly PAID: "paid";
    readonly FAILED: "failed";
    readonly REFUNDED: "refunded";
    readonly PARTIALLY_REFUNDED: "partially_refunded";
};
export declare const PAYMENT_METHOD: {
    readonly RAZORPAY: "razorpay";
    readonly COD: "cod";
};
export declare const CUSTOM_BLOUSE_STATUS: {
    readonly SUBMITTED: "submitted";
    readonly UNDER_REVIEW: "under_review";
    readonly PRICE_ASSIGNED: "price_assigned";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly DELIVERED: "delivered";
};
export declare const PRODUCT_STATUS: {
    readonly DRAFT: "draft";
    readonly PUBLISHED: "published";
    readonly ARCHIVED: "archived";
};
export declare const COUPON_TYPE: {
    readonly PERCENTAGE: "percentage";
    readonly FLAT: "flat";
};
export declare const REVIEW_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export declare const CONTENT_TYPE: {
    readonly ABOUT: "about";
    readonly FAQ: "faq";
    readonly BLOG: "blog";
    readonly POLICY: "policy";
    readonly HOMEPAGE: "homepage";
    readonly FOOTER: "footer";
    readonly CONTACT: "contact";
};
export declare const BANNER_SECTION: {
    readonly HERO: "hero";
    readonly PROMOTIONAL: "promotional";
    readonly CATEGORY: "category";
    readonly CAMPAIGN: "campaign";
    readonly ANNOUNCEMENT: "announcement";
};
export declare const SUPPORT_TICKET_STATUS: {
    readonly OPEN: "open";
    readonly IN_PROGRESS: "in_progress";
    readonly RESOLVED: "resolved";
    readonly CLOSED: "closed";
};
export declare const NOTIFICATION_CHANNEL: {
    readonly EMAIL: "email";
    readonly IN_APP: "in_app";
};
export declare const NOTIFICATION_TYPE: {
    readonly ORDER_PLACED: "order_placed";
    readonly ORDER_CONFIRMED: "order_confirmed";
    readonly ORDER_SHIPPED: "order_shipped";
    readonly ORDER_DELIVERED: "order_delivered";
    readonly ORDER_CANCELLED: "order_cancelled";
    readonly PAYMENT_SUCCESS: "payment_success";
    readonly PAYMENT_FAILED: "payment_failed";
    readonly CUSTOM_BLOUSE_UPDATE: "custom_blouse_update";
    readonly ACCOUNT_CREATED: "account_created";
    readonly PASSWORD_RESET: "password_reset";
    readonly OTP_SENT: "otp_sent";
    readonly COUPON_APPLIED: "coupon_applied";
};
export declare const ADDRESS_TYPE: {
    readonly HOME: "home";
    readonly WORK: "work";
    readonly OTHER: "other";
};
export declare const UPLOAD_FOLDER: {
    readonly PRODUCTS: "products";
    readonly BANNERS: "banners";
    readonly CATEGORIES: "categories";
    readonly COLLECTIONS: "collections";
    readonly BLOGS: "blogs";
    readonly PROFILES: "profiles";
    readonly CUSTOM_BLOUSE: "custom-blouse";
    readonly MISC: "misc";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const COLLECTION_TYPE: {
    readonly BRIDAL: "bridal";
    readonly SILK: "silk";
    readonly FESTIVE: "festive";
    readonly DESIGNER_BLOUSE: "designer_blouse";
    readonly CAMPAIGN: "campaign";
    readonly CURATED: "curated";
};
export declare const BLOUSE_TYPE: {
    readonly READY_MADE: "ready_made";
    readonly CUSTOM_STITCHED: "custom_stitched";
    readonly DESIGNER: "designer";
    readonly BRIDAL: "bridal";
};
export declare const OTP_TTL_SECONDS = 600;
export declare const MAX_OTP_ATTEMPTS = 3;
export declare const REFRESH_TOKEN_TTL_DAYS = 7;
