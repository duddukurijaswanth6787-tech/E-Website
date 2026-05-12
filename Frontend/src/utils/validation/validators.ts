import { REGEX } from './regex';

export const validators = {
  phone: (val: string) => REGEX.PHONE.test(val),
  email: (val: string) => REGEX.EMAIL_GMAIL.test(val),
  password: (val: string) => REGEX.PASSWORD_STRICT.test(val),
  name: (val: string) => REGEX.NAME.test(val),
  pincode: (val: string) => REGEX.PINCODE.test(val),
  otp: (val: string) => REGEX.OTP.test(val),
  amount: (val: string) => REGEX.AMOUNT.test(val) && parseFloat(val) >= 0,
  quantity: (val: string) => REGEX.QUANTITY.test(val) && parseInt(val, 10) >= 1,
  
  // File Validation
  file: (file: File, options: { maxSizeMB: number, allowedTypes: string[] }) => {
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > options.maxSizeMB) return 'size_error';
    
    const fileType = file.type.split('/')[1]?.toLowerCase();
    if (!options.allowedTypes.includes(fileType)) return 'type_error';
    
    return true;
  }
};
