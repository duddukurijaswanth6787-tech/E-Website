import { z } from 'zod';

export const REGEX = {
  PHONE: /^[0-9]{10}$/,
  EMAIL_GMAIL: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  PASSWORD_STRICT: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,}$/,
  PINCODE: /^[0-9]{6}$/,
  OTP: /^[0-9]{4,6}$/,
};

export const commonSchemas = {
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .regex(REGEX.NAME, 'Name must contain only letters and spaces'),
    
  email: z.string()
    .email('Invalid email format')
    .regex(REGEX.EMAIL_GMAIL, 'Email must be a @gmail.com address'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(REGEX.PASSWORD_STRICT, 'Password must include uppercase, lowercase, number, and special character'),
    
  mobile: z.string()
    .regex(REGEX.PHONE, 'Phone number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
    
  pincode: z.string()
    .regex(REGEX.PINCODE, 'Pincode must be exactly 6 digits'),
    
  otp: z.string()
    .regex(REGEX.OTP, 'OTP must be 4-6 digits'),
};
