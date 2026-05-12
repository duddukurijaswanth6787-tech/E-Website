import { REGEX } from './regex';

export const sanitizers = {
  // Auto-trim spaces
  trim: (val: string) => val.trim(),
  
  // Lowercase normalization for emails
  email: (val: string) => val.trim().toLowerCase(),
  
  // Numeric only (strip non-digits)
  numeric: (val: string) => val.replace(/\D/g, ''),
  
  // Prevent XSS/HTML Injection
  stripDangerous: (val: string) => val.replace(REGEX.DANGEROUS_CHARS, ''),
  
  // Professional Name: Trim, remove multiple spaces, capitalize first letters
  name: (val: string) => {
    return val
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  },
  
  // Address: Clean but preserve common punctuation
  address: (val: string) => {
    return val.replace(/[<>\"\'%;\(\)\+]/g, '').trim();
  }
};
