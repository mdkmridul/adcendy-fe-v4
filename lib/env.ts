import { getBrowserRuntimeConfig } from '@/shared/runtime-config/types';

const runtimeConfig = getBrowserRuntimeConfig();
const serverLocalDataSource =
  typeof window === 'undefined' ? process.env.DATA_SOURCE : undefined;
const useMockData =
  runtimeConfig?.FEATURE_FLAGS.useMockData === true ||
  serverLocalDataSource === 'mock';
const dataSource = useMockData ? 'mock' : 'real';

/**
 * Browser API traffic is always same-origin. Environment-specific Backend
 * upstreams belong to the external reverse proxy, never to this bundle.
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  APP_ENV: runtimeConfig?.APP_ENV ?? 'local',
  RELEASE_ID: runtimeConfig?.RELEASE_ID ?? 'server-or-build',
  API: {
    dataSource,
    isMock: dataSource === 'mock',
    isReal: dataSource === 'real',
  },
  features: {
    debugPanel: runtimeConfig?.FEATURE_FLAGS.debugPanel === true,
    apiLogging: runtimeConfig?.FEATURE_FLAGS.apiLogging === true,
    legacyPerformanceWorkspaces:
      runtimeConfig?.FEATURE_FLAGS.legacyPerformanceWorkspaces === true,
  },
  public: {
    errorDsn: runtimeConfig?.PUBLIC_ERROR_DSN ?? null,
    razorpayKeyId: runtimeConfig?.RAZORPAY_KEY_ID ?? null,
    analyticsId: runtimeConfig?.PUBLIC_ANALYTICS_ID ?? null,
    supportUrl: runtimeConfig?.SUPPORT_URL ?? null,
  },
} as const;

export default ENV;
