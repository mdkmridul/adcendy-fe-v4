export type AppEnvironment = 'local' | 'uat' | 'production';

export interface PublicFeatureFlags {
  apiLogging: boolean;
  debugPanel: boolean;
  legacyPerformanceWorkspaces: boolean;
  useMockData: boolean;
}

export interface RuntimePublicConfig {
  APP_ENV: AppEnvironment;
  RELEASE_ID: string;
  PUBLIC_ERROR_DSN: string | null;
  RAZORPAY_KEY_ID: string | null;
  PUBLIC_ANALYTICS_ID: string | null;
  FEATURE_FLAGS: PublicFeatureFlags;
  SUPPORT_URL: string | null;
}

export const APP_ORIGINS: Record<AppEnvironment, readonly string[]> = {
  local: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:34100',
  ],
  uat: ['https://uat.adcendy.com'],
  production: ['https://app.adcendy.com'],
};

declare global {
  interface Window {
    __ADCENDY_RUNTIME_CONFIG__?: RuntimePublicConfig;
  }
}

export function getBrowserRuntimeConfig(): RuntimePublicConfig | null {
  if (typeof window === 'undefined') return null;
  return window.__ADCENDY_RUNTIME_CONFIG__ ?? null;
}

export function assertBrowserOrigin(
  config: RuntimePublicConfig,
  actualOrigin: string,
): void {
  const allowedOrigins = APP_ORIGINS[config.APP_ENV];
  if (!allowedOrigins.includes(actualOrigin)) {
    throw new Error(
      `Runtime configuration for ${config.APP_ENV} cannot run on ${actualOrigin}.`,
    );
  }
}
