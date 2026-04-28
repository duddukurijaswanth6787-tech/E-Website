export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const PAYMENT_METHOD = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
} as const;

export const CUSTOM_BLOUSE_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  PRICE_ASSIGNED: 'price_assigned',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
} as const;

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export const COUPON_TYPE = {
  PERCENTAGE: 'percentage',
  FLAT: 'flat',
} as const;

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const CONTENT_TYPE = {
  ABOUT: 'about',
  FAQ: 'faq',
  BLOG: 'blog',
  POLICY: 'policy',
  HOMEPAGE: 'homepage',
  FOOTER: 'footer',
  CONTACT: 'contact',
} as const;

export const BANNER_SECTION = {
  HERO: 'hero',
  PROMOTIONAL: 'promotional',
  CATEGORY: 'category',
  CAMPAIGN: 'campaign',
  ANNOUNCEMENT: 'announcement',
} as const;

export const SUPPORT_TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const NOTIFICATION_CHANNEL = {
  EMAIL: 'email',
  IN_APP: 'in_app',
} as const;

export const NOTIFICATION_TYPE = {
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
} as const;

export const ADDRESS_TYPE = {
  HOME: 'home',
  WORK: 'work',
  OTHER: 'other',
} as const;

export const UPLOAD_FOLDER = {
  PRODUCTS: 'products',
  BANNERS: 'banners',
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
  BLOGS: 'blogs',
  PROFILES: 'profiles',
  CUSTOM_BLOUSE: 'custom-blouse',
  CUSTOM_BLOUSE_OPTIONS: 'custom-blouse-options',
  MISC: 'misc',
} as const;

export const HTTP_STATUS = {
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
} as const;

export const COLLECTION_TYPE = {
  BRIDAL: 'bridal',
  SILK: 'silk',
  FESTIVE: 'festive',
  DESIGNER_BLOUSE: 'designer_blouse',
  CAMPAIGN: 'campaign',
  CURATED: 'curated',
} as const;

export const BLOUSE_TYPE = {
  READY_MADE: 'ready_made',
  CUSTOM_STITCHED: 'custom_stitched',
  DESIGNER: 'designer',
  BRIDAL: 'bridal',
} as const;

export const OTP_TTL_SECONDS = 600; // 10 minutes
export const MAX_OTP_ATTEMPTS = 3;
export const REFRESH_TOKEN_TTL_DAYS = 7;
