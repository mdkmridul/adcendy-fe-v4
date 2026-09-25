export type AppEnvironment = 'local' | 'uat' | 'production';

export interface PublicFeatureFlags {
  apiLogging: boolean;
  debugPanel: boolean;
  legacyPerformanceWorkspaces: boolean;
  useMockData: boolean;
}

export interface RuntimePublicConfig {
  APP_ENV: AppEnvironment;
  /** The one origin this deployment is served from, supplied by the deployment. */
  APP_ORIGIN: string;
  RELEASE_ID: string;
  PUBLIC_ERROR_DSN: string | null;
  RAZORPAY_KEY_ID: string | null;
  PUBLIC_ANALYTICS_ID: string | null;
  FEATURE_FLAGS: PublicFeatureFlags;
  SUPPORT_URL: string | null;
}

export const RUNTIME_CONFIG_READY_EVENT = 'adcendy-runtime-config-ready';

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
  if (actualOrigin !== config.APP_ORIGIN) {
    throw new Error(
      `Runtime configuration for ${config.APP_ENV} cannot run on ${actualOrigin}.`,
    );
  }
}
