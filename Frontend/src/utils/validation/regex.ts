export const REGEX = {
  // Exactly 10 digits
  PHONE: /^[0-9]{10}$/,
  
  // Valid email format ending with @gmail.com
  EMAIL_GMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  
  // Basic valid email (for cases where we don't strictly need gmail)
  EMAIL_BASIC: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Password: min 8 chars, 1 upper, 1 lower, 1 number, 1 special
  PASSWORD_STRICT: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Name: letters and spaces only, min 2 chars
  NAME: /^[a-zA-Z\s]{2,}$/,
  
  // Pincode: exactly 6 digits
  PINCODE: /^[0-9]{6}$/,
  
  // OTP: 4 or 6 digits
  OTP: /^[0-9]{4,6}$/,
  
  // Price/Amount: numeric, decimal support, no negative
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  
  // Quantity: positive integers
  QUANTITY: /^[1-9]\d*$/,
  
  // Sanitization: script tags, etc.
  DANGEROUS_CHARS: /[<>\"\'%;\(\)\+]/g,
  SQL_INJECTION: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE|OR|AND)\b/i,
};
