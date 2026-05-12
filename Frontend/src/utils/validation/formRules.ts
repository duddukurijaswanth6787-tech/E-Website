import { validators } from './validators';
import { VALIDATION_MESSAGES } from './validationMessages';

export interface ValidationRule {
  validate: (val: any) => boolean;
  message: string;
}

export const FORM_RULES = {
  name: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Name') },
    { validate: validators.name, message: VALIDATION_MESSAGES.NAME }
  ],
  email: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Email') },
    { validate: validators.email, message: VALIDATION_MESSAGES.EMAIL_GMAIL }
  ],
  password: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Password') },
    { validate: validators.password, message: VALIDATION_MESSAGES.PASSWORD }
  ],
  mobile: [
    { validate: (v: string) => !v || validators.phone(v), message: VALIDATION_MESSAGES.PHONE }
  ],
  pincode: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Pincode') },
    { validate: validators.pincode, message: VALIDATION_MESSAGES.PINCODE }
  ],
  otp: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('OTP') },
    { validate: validators.otp, message: VALIDATION_MESSAGES.OTP }
  ],
  amount: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Amount') },
    { validate: validators.amount, message: VALIDATION_MESSAGES.PRICE }
  ],
  quantity: [
    { validate: (v: string) => v.length > 0, message: VALIDATION_MESSAGES.REQUIRED('Quantity') },
    { validate: validators.quantity, message: VALIDATION_MESSAGES.QUANTITY }
  ]
};
