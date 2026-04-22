export declare const slugify: (text: string) => string;
export declare const generateUniqueSlug: (text: string, existsCheck: (slug: string) => Promise<boolean>) => Promise<string>;
export declare const generateSKU: (prefix?: string) => string;
export declare const generateOrderNumber: () => string;
export declare const generateTokenId: () => string;
export declare const maskEmail: (email: string) => string;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const paise: (rupees: number) => number;
export declare const rupees: (paise: number) => number;
