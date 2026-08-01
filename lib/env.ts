import { getBrowserRuntimeConfig } from '../shared/runtime-config/types.ts';

export type RuntimeDataSource = 'mock' | 'real';

export function getRuntimeDataSource(): RuntimeDataSource {
  const runtimeConfig = getBrowserRuntimeConfig();
  const serverLocalDataSource =
    typeof window === 'undefined' ? process.env.DATA_SOURCE : undefined;

  return runtimeConfig?.FEATURE_FLAGS.useMockData === true ||
    serverLocalDataSource === 'mock'
    ? 'mock'
    : 'real';
}

export function createRuntimeRepositoryAdapter<T extends object>(
  mockAdapter: T,
  realAdapter: T,
): T {
  return new Proxy({} as T, {
    get(_target, property) {
      const activeAdapter =
        getRuntimeDataSource() === 'mock' ? mockAdapter : realAdapter;
      const value = Reflect.get(activeAdapter, property, activeAdapter);

      return typeof value === 'function' ? value.bind(activeAdapter) : value;
    },
  });
}

/**
 * Browser API traffic is always same-origin. Environment-specific Backend
 * upstreams belong to the external reverse proxy, never to this bundle.
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  get APP_ENV() {
    return getBrowserRuntimeConfig()?.APP_ENV ?? 'local';
  },
  get RELEASE_ID() {
    return getBrowserRuntimeConfig()?.RELEASE_ID ?? 'server-or-build';
  },
  API: {
    get dataSource() {
      return getRuntimeDataSource();
    },
    get isMock() {
      return getRuntimeDataSource() === 'mock';
    },
    get isReal() {
      return getRuntimeDataSource() === 'real';
    },
  },
  features: {
    get debugPanel() {
      return getBrowserRuntimeConfig()?.FEATURE_FLAGS.debugPanel === true;
    },
    get apiLogging() {
      return getBrowserRuntimeConfig()?.FEATURE_FLAGS.apiLogging === true;
    },
    get legacyPerformanceWorkspaces() {
      return getBrowserRuntimeConfig()?.FEATURE_FLAGS.legacyPerformanceWorkspaces === true;
    },
  },
  public: {
    get errorDsn() {
      return getBrowserRuntimeConfig()?.PUBLIC_ERROR_DSN ?? null;
    },
    get razorpayKeyId() {
      return getBrowserRuntimeConfig()?.RAZORPAY_KEY_ID ?? null;
    },
    get analyticsId() {
      return getBrowserRuntimeConfig()?.PUBLIC_ANALYTICS_ID ?? null;
    },
    get supportUrl() {
      return getBrowserRuntimeConfig()?.SUPPORT_URL ?? null;
    },
  },
} as const;

export default ENV;
