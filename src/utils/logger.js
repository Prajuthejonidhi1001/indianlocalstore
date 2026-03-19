/**
 * Simple logger utility for debugging
 */

const logger = {
  log: (message, data) => {
    console.log(`[LOG] ${message}`, data || '');
  },

  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error || '');
  },

  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '');
  },

  info: (message, data) => {
    console.info(`[INFO] ${message}`, data || '');
  },

  debug: (message, data) => {
    console.debug(`[DEBUG] ${message}`, data || '');
  },
};

export { logger };
