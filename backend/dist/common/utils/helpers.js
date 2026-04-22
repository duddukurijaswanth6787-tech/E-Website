"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rupees = exports.paise = exports.formatCurrency = exports.maskEmail = exports.generateTokenId = exports.generateOrderNumber = exports.generateSKU = exports.generateUniqueSlug = exports.slugify = void 0;
const crypto_1 = __importDefault(require("crypto"));
const slugify = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
const generateUniqueSlug = async (text, existsCheck) => {
    let slug = (0, exports.slugify)(text);
    let exists = await existsCheck(slug);
    let suffix = 1;
    while (exists) {
        slug = `${(0, exports.slugify)(text)}-${suffix++}`;
        exists = await existsCheck(slug);
    }
    return slug;
};
exports.generateUniqueSlug = generateUniqueSlug;
const generateSKU = (prefix = 'VC') => {
    const random = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
};
exports.generateSKU = generateSKU;
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VC-${timestamp}-${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
const generateTokenId = () => {
    return crypto_1.default.randomUUID();
};
exports.generateTokenId = generateTokenId;
const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    const masked = local.length > 2
        ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
        : local;
    return `${masked}@${domain}`;
};
exports.maskEmail = maskEmail;
const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const paise = (rupees) => Math.round(rupees * 100);
exports.paise = paise;
const rupees = (paise) => paise / 100;
exports.rupees = rupees;
//# sourceMappingURL=helpers.js.map