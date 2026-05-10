/**
 * Sensitive fields that should be masked in logs
 */
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'otp',
  'token',
  'authorization',
  'aadhaar',
  'bankAccountNumber',
  'cvv',
  'cardNumber',
  'accessToken',
  'refreshToken',
];

/**
 * Recursively masks sensitive fields in an object
 * @param data Object or array to mask
 * @returns Masked copy of the data
 */
export const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  const maskedObj: any = { ...data };

  for (const key in maskedObj) {
    if (SENSITIVE_FIELDS.includes(key.toLowerCase()) || key.toLowerCase().includes('password')) {
      maskedObj[key] = '***hidden***';
    } else if (typeof maskedObj[key] === 'object') {
      maskedObj[key] = maskSensitiveData(maskedObj[key]);
    }
  }

  return maskedObj;
};
