import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRuntimePublicConfig,
  serializeRuntimeConfigScript,
} from '../../shared/runtime-config/schema.ts';
import { assertBrowserOrigin } from '../../shared/runtime-config/types.ts';

const production = {
  NODE_ENV: 'production',
  APP_ENV: 'production',
  RELEASE_ID: 'git-65a37c3',
};

test('builds an allowlisted Production configuration without an API origin', () => {
  const config = buildRuntimePublicConfig({
    ...production,
    PUBLIC_ANALYTICS_ID: 'adcendy-production',
    SUPPORT_URL: 'https://support.adcendy.com/help',
  });

  assert.deepEqual(Object.keys(config).sort(), [
    'APP_ENV',
    'FEATURE_FLAGS',
    'PUBLIC_ANALYTICS_ID',
    'PUBLIC_ERROR_DSN',
    'RAZORPAY_KEY_ID',
    'RELEASE_ID',
    'SUPPORT_URL',
  ]);
  assert.equal('API_BASE_URL' in config, false);
  assert.equal(config.FEATURE_FLAGS.useMockData, false);
  assert.equal(
    config.FEATURE_FLAGS.legacyPerformanceWorkspaces,
    false,
  );
});

test('rejects legacy NEXT_PUBLIC and unknown public variables', () => {
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        NEXT_PUBLIC_API_BASE_URL: 'https://api.adcendy.com',
      }),
    /Unsupported browser-public environment keys/,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        PUBLIC_DATABASE_URL: 'postgres://private',
      }),
    /Unsupported browser-public environment keys/,
  );
});

test('ignores blank retired public variables', () => {
  assert.doesNotThrow(() =>
    buildRuntimePublicConfig({
      ...production,
      NEXT_PUBLIC_API_URL: '',
      NEXT_PUBLIC_API_MODE: '   ',
    }),
  );
});

test('rejects Production, UAT, and localhost mismatches', () => {
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        NODE_ENV: 'production',
        APP_ENV: 'uat',
        RELEASE_ID: 'release-1',
        SUPPORT_URL: 'https://app.adcendy.com/help',
      }),
    /Production hostname in UAT/,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        SUPPORT_URL: 'https://uat.adcendy.com/help',
      }),
    /non-Production hostname/,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        SUPPORT_URL: 'http://localhost:3000/help',
      }),
    /HTTPS|local hostname/,
  );
});

test('rejects deployed debug, logging, and mock flags', () => {
  for (const flag of ['debugPanel', 'apiLogging', 'useMockData']) {
    assert.throws(
      () =>
        buildRuntimePublicConfig({
          ...production,
          FEATURE_FLAGS: JSON.stringify({ [flag]: true }),
        }),
      /Deployed environments cannot enable/,
    );
  }
});

test('allowlists the explicit legacy workspace flag without enabling it by default', () => {
  const enabled = buildRuntimePublicConfig({
    ...production,
    APP_ENV: 'uat',
    RELEASE_ID: 'release-uat',
    FEATURE_FLAGS: JSON.stringify({
      legacyPerformanceWorkspaces: true,
    }),
  });

  assert.equal(
    enabled.FEATURE_FLAGS.legacyPerformanceWorkspaces,
    true,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        FEATURE_FLAGS: JSON.stringify({ unreviewedFeature: true }),
      }),
    /Unsupported public feature flags/,
  );
});

test('enforces payment environment separation', () => {
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        RAZORPAY_KEY_ID: 'rzp_test_example',
      }),
    /Production cannot use a Razorpay test key/,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        NODE_ENV: 'production',
        APP_ENV: 'uat',
        RELEASE_ID: 'release-1',
        RAZORPAY_KEY_ID: 'rzp_live_example',
      }),
    /UAT cannot use a Razorpay live key/,
  );
});

test('enforces analytics destination separation', () => {
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        APP_ENV: 'uat',
        RELEASE_ID: 'release-uat',
        PUBLIC_ANALYTICS_ID: 'adcendy-production',
      }),
    /Production analytics destination/,
  );
  assert.throws(
    () =>
      buildRuntimePublicConfig({
        ...production,
        PUBLIC_ANALYTICS_ID: 'adcendy-uat',
      }),
    /non-Production analytics destination/,
  );
});

test('runtime script and browser guard enforce the authoritative host', () => {
  const config = buildRuntimePublicConfig(production);
  const script = serializeRuntimeConfigScript(config);
  assert.match(script, /app\.adcendy\.com/);
  assert.match(script, /adcendy-runtime-config-ready/);
  assert.doesNotMatch(script, /api\.adcendy\.com/);
  assert.doesNotThrow(() =>
    assertBrowserOrigin(config, 'https://app.adcendy.com'),
  );
  assert.throws(
    () => assertBrowserOrigin(config, 'https://uat.adcendy.com'),
    /cannot run/,
  );
});

test('local runtime accepts only the integrated HTTPS origin', () => {
  const config = buildRuntimePublicConfig({
    NODE_ENV: 'production',
    APP_ENV: 'local',
    RELEASE_ID: 'local-integration',
  });

  assert.doesNotThrow(() =>
    assertBrowserOrigin(config, 'https://adcendy.localhost'),
  );
  for (const rejectedOrigin of [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:34100',
    'https://adcendy.localhost.evil.example',
  ]) {
    assert.throws(
      () => assertBrowserOrigin(config, rejectedOrigin),
      /cannot run/,
    );
  }
});
