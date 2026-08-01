import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRuntimeRepositoryAdapter,
  getRuntimeDataSource,
} from '../../lib/env.ts';
import type { RuntimePublicConfig } from '../../shared/runtime-config/types.ts';

type TestAdapter = {
  source(): 'mock' | 'real';
};

const mockAdapter: TestAdapter = {
  source: () => 'mock',
};

const realAdapter: TestAdapter = {
  source: () => 'real',
};

function runtimeConfig(useMockData: boolean): RuntimePublicConfig {
  return {
    APP_ENV: 'local',
    RELEASE_ID: 'runtime-adapter-test',
    PUBLIC_ERROR_DSN: null,
    RAZORPAY_KEY_ID: null,
    PUBLIC_ANALYTICS_ID: null,
    FEATURE_FLAGS: {
      apiLogging: false,
      debugPanel: false,
      legacyPerformanceWorkspaces: false,
      useMockData,
    },
    SUPPORT_URL: null,
  };
}

test('repository adapter resolves the browser data source when each method is called', (context) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalDataSource = process.env.DATA_SOURCE;

  context.after(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }

    if (originalDataSource === undefined) {
      delete process.env.DATA_SOURCE;
    } else {
      process.env.DATA_SOURCE = originalDataSource;
    }
  });

  delete process.env.DATA_SOURCE;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {},
  });

  const adapter = createRuntimeRepositoryAdapter(mockAdapter, realAdapter);
  assert.equal(getRuntimeDataSource(), 'real');
  assert.equal(adapter.source(), 'real');

  window.__ADCENDY_RUNTIME_CONFIG__ = runtimeConfig(true);
  assert.equal(getRuntimeDataSource(), 'mock');
  assert.equal(adapter.source(), 'mock');

  window.__ADCENDY_RUNTIME_CONFIG__ = runtimeConfig(false);
  assert.equal(getRuntimeDataSource(), 'real');
  assert.equal(adapter.source(), 'real');
});
