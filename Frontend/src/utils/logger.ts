/**
 * Boutique ERP - Centralized Production Logger
 * Provides structured logging for production debugging without cluttering console.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    // Warnings are always logged in production to catch potential degradation
    console.warn(`[WARN] ${message}`, data || '');
  },

  error: (message: string, error?: any) => {
    // Errors are always logged with high visibility
    console.error(`[ERROR] ${message}`, error || '');
    
    // Phase 5: Integration point for external monitoring (Sentry/LogRocket)
    if (!isDev) {
      // TODO: sendToMonitoring(message, error);
    }
  },

  api: (method: string, url: string, status?: number, data?: any) => {
    if (isDev) {
      const statusColor = status && status < 400 ? 'color: #10b981' : 'color: #ef4444';
      console.log(
        `%c[API] ${method.toUpperCase()} ${url} %c${status || ''}`,
        'font-weight: bold',
        statusColor,
        data || ''
      );
    } else if (status && status >= 400) {
      // Log failed production API calls
      console.warn(`[API FAILURE] ${method.toUpperCase()} ${url} (Status: ${status})`);
    }
  }
};
