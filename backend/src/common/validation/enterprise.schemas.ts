import { z } from 'zod';

/**
 * Enterprise Validation Schemas
 * Shared patterns and module-specific Zod schemas to ensure platform-wide data integrity.
 */

export const VALIDATION_PATTERNS = {
  PHONE: /^\d{10}$/,
  PINCODE: /^\d{6}$/,
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
  SKU: /^[A-Z0-9-]{3,20}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
};

// --- Product Validation ---
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'Product name must be at least 3 characters').max(200),
    description: z.string().trim().min(20, 'Description should be detailed (min 20 chars)'),
    category: z.string().regex(VALIDATION_PATTERNS.MONGO_ID, 'Invalid category ID'),
    price: z.number().positive('Price must be greater than zero'),
    comparePrice: z.number().min(0).optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    sku: z.string().trim().min(3).regex(VALIDATION_PATTERNS.SKU, 'Invalid SKU format').transform(v => v.toUpperCase()),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    lowStockThreshold: z.number().optional().default(5),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
  })
});

export const updateProductSchema = createProductSchema.deepPartial();

// --- Order Validation ---
export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      product: z.string().regex(VALIDATION_PATTERNS.MONGO_ID),
      variant: z.string().optional(),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      price: z.number().positive(),
    })).min(1, 'Order must contain at least one item'),
    shippingAddress: z.object({
      fullName: z.string().trim().min(2),
      addressLine1: z.string().trim().min(5),
      addressLine2: z.string().trim().optional(),
      city: z.string().trim().min(2),
      state: z.string().trim().min(2),
      pincode: z.string().regex(VALIDATION_PATTERNS.PINCODE, 'Invalid 6-digit pincode'),
      phone: z.string().regex(VALIDATION_PATTERNS.PHONE, 'Invalid 10-digit phone number'),
    }),
    paymentMethod: z.enum(['cod', 'razorpay']),
    couponCode: z.string().trim().optional(),
  })
});

// --- Category Validation ---
export const categorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(50),
    slug: z.string().trim().min(2).transform(v => v.toLowerCase()),
    description: z.string().trim().optional(),
    image: z.string().url().optional(),
    parentCategory: z.string().regex(VALIDATION_PATTERNS.MONGO_ID).optional(),
    isActive: z.boolean().optional(),
  })
});

// --- Coupon Validation ---
export const couponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(3).transform(v => v.toUpperCase()),
    discountType: z.enum(['percentage', 'flat']),
    discountValue: z.number().positive(),
    minOrderValue: z.number().min(0).optional(),
    maxDiscount: z.number().positive().optional(),
    expiryDate: z.string().datetime(),
    usageLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  })
});

// --- Workforce Validation ---
export const staffSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().email().transform(v => v.toLowerCase()),
    phone: z.string().regex(VALIDATION_PATTERNS.PHONE, 'Invalid 10-digit phone number'),
    role: z.enum(['admin', 'manager', 'tailor', 'sales_executive', 'delivery_partner']),
    department: z.string().optional(),
    salary: z.number().positive().optional(),
    dateOfJoining: z.string().datetime().optional(),
    status: z.enum(['active', 'on_leave', 'terminated']).default('active'),
  })
});

// --- Attendance Validation ---
export const attendanceSchema = z.object({
  body: z.object({
    staffId: z.string().regex(VALIDATION_PATTERNS.MONGO_ID),
    date: z.string().datetime().optional(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    status: z.enum(['present', 'absent', 'half_day', 'on_leave']),
    note: z.string().trim().optional(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  })
});

// --- Legal Validation ---
export const legalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100),
    slug: z.string().trim().min(3).transform(v => v.toLowerCase()),
    content: z.string().trim().min(10),
    metaTitle: z.string().trim().optional(),
    metaDescription: z.string().trim().optional(),
    isPublished: z.boolean().optional(),
  })
});
