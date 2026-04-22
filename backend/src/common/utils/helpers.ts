import crypto from 'crypto';

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (
  text: string,
  existsCheck: (slug: string) => Promise<boolean>,
): Promise<string> => {
  let slug = slugify(text);
  let exists = await existsCheck(slug);
  let suffix = 1;
  while (exists) {
    slug = `${slugify(text)}-${suffix++}`;
    exists = await existsCheck(slug);
  }
  return slug;
};

export const generateSKU = (prefix = 'VC'): string => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

/** e.g. "Silk" + "light green" → "si-lg", then unique "si-lg-001" */
export const abbrevCategoryForSku = (name: string): string => {
  const slug = slugify(name).replace(/-/g, '');
  if (slug.length >= 2) return slug.slice(0, 2);
  return `${slug}xx`.slice(0, 2);
};

export const abbrevColorForSku = (color: string): string => {
  const parts = color
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
  const w = parts[0] || 'xx';
  return w.length >= 2 ? w.slice(0, 2) : `${w}x`.slice(0, 2);
};

/** Build prefix like "si-lg" (main category + color only; subcategory is not part of the code). */
export const buildSemanticSkuPrefix = (categoryName: string, color: string): string => {
  const c = abbrevCategoryForSku(categoryName);
  const col = abbrevColorForSku(color);
  return `${c}-${col}`;
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VC-${timestamp}-${random}`;
};

export const generateTokenId = (): string => {
  return crypto.randomUUID();
};

export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  const masked = local.length > 2
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : local;
  return `${masked}@${domain}`;
};

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const paise = (rupees: number): number => Math.round(rupees * 100);
export const rupees = (paise: number): number => paise / 100;
