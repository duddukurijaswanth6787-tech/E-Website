const IS_PROD = import.meta.env.PROD;

export const logger = {
  debug: (...args: any[]) => {
    if (!IS_PROD) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
