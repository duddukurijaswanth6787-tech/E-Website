export declare const slugify: (text: string) => string;
export declare const generateUniqueSlug: (text: string, existsCheck: (slug: string) => Promise<boolean>) => Promise<string>;
export declare const generateSKU: (prefix?: string) => string;
/** e.g. "Silk" + "light green" → "si-lg", then unique "si-lg-001" */
export declare const abbrevCategoryForSku: (name: string) => string;
export declare const abbrevColorForSku: (color: string) => string;
/** Build prefix like "si-lg" (main category + color only; subcategory is not part of the code). */
export declare const buildSemanticSkuPrefix: (categoryName: string, color: string) => string;
export declare const generateOrderNumber: () => string;
export declare const generateTokenId: () => string;
export declare const maskEmail: (email: string) => string;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const paise: (rupees: number) => number;
export declare const rupees: (paise: number) => number;
