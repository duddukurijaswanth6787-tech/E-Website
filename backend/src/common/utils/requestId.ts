import { randomBytes } from 'crypto';

/**
 * Generates a short unique request ID
 * @returns 8-character hex string
 */
export const generateRequestId = (): string => {
  return randomBytes(4).toString('hex');
};
