/**
 * Environment Configuration
 * 
 * This module provides centralized access to environment variables
 * and environment detection utilities.
 */

export const ENV = {
  // Current Node environment (set by Next.js automatically)
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Check if we're in development mode
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Check if we're in production mode
  isProduction: process.env.NODE_ENV === 'production',
  
  // Check if we're in test mode
  isTest: process.env.NODE_ENV === 'test',
  
  // API Configuration
  API: {
    // Base URL for API requests
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    
    // Data source: 'mock' or 'real'
    dataSource: (process.env.NEXT_PUBLIC_DATA_SOURCE || process.env.NEXT_PUBLIC_API_MODE || 'mock') as 'mock' | 'real',
    
    // Check if using mock data
    isMock: (process.env.NEXT_PUBLIC_DATA_SOURCE || process.env.NEXT_PUBLIC_API_MODE) === 'mock',
    
    // Check if using real API
    isReal: (process.env.NEXT_PUBLIC_DATA_SOURCE || process.env.NEXT_PUBLIC_API_MODE) === 'real',
  },

  // Feature Flags
  features: {
    // Enable debug panel in dev/staging
    debugPanel: process.env.NEXT_PUBLIC_ENABLE_DEBUG_PANEL === 'true',
    
    // Enable API request/response logging
    apiLogging: process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true',
  },
} as const;

/**
 * Log current environment configuration (useful for debugging)
 * Only logs in development mode to avoid exposing config in production
 */
export function logEnvironment() {
  if (ENV.isDevelopment && typeof window !== 'undefined') {
    console.group('🔧 Environment Configuration');
    console.log('NODE_ENV:', ENV.NODE_ENV);
    console.log('API Base URL:', ENV.API.baseURL);
    console.log('Data Source:', ENV.API.dataSource);
    console.log('Debug Panel:', ENV.features.debugPanel);
    console.log('API Logging:', ENV.features.apiLogging);
    console.groupEnd();
  }
}

/**
 * Validate required environment variables
 * Throws error if required variables are missing
 */
export function validateEnvironment() {
  const required = [
    { name: 'NEXT_PUBLIC_API_BASE_URL', value: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL },
    { name: 'NEXT_PUBLIC_DATA_SOURCE', value: process.env.NEXT_PUBLIC_DATA_SOURCE || process.env.NEXT_PUBLIC_API_MODE },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0 && ENV.isProduction) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map(({ name }) => `  - ${name}`)
        .join('\n')}`
    );
  }
}

export default ENV;
