import {
  RUNTIME_CONFIG_READY_EVENT,
  type AppEnvironment,
  type PublicFeatureFlags,
  type RuntimePublicConfig,
} from './types.ts';

type EnvironmentSource = Record<string, string | undefined>;

const ALLOWED_PUBLIC_ENV_KEYS = new Set([
  'APP_ENV',
  'RELEASE_ID',
  'PUBLIC_ERROR_DSN',
  'RAZORPAY_KEY_ID',
  'PUBLIC_ANALYTICS_ID',
  'FEATURE_FLAGS',
  'SUPPORT_URL',
]);

const ALLOWED_FEATURE_FLAGS = new Set([
  'apiLogging',
  'debugPanel',
  'legacyPerformanceWorkspaces',
  'useMockData',
]);

function optional(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function assertPublicEnvironmentKeyAllowlist(source: EnvironmentSource): void {
  const prohibited = Object.keys(source).filter(
    (key) =>
      optional(source[key]) !== null &&
      (key.startsWith('NEXT_PUBLIC_') ||
        (key.startsWith('PUBLIC_') && !ALLOWED_PUBLIC_ENV_KEYS.has(key))),
  );
  if (prohibited.length > 0) {
    throw new Error(
      `Unsupported browser-public environment keys: ${prohibited.sort().join(', ')}`,
    );
  }
}

// APP_ENV has no default: a missing value must never quietly select local
// behavior (mock data, debug flags, relaxed URL rules) in a deployed image.
function parseAppEnvironment(value: string | undefined): AppEnvironment {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === 'local' ||
    normalized === 'uat' ||
    normalized === 'production'
  ) {
    return normalized;
  }
  throw new Error(
    normalized
      ? 'APP_ENV must be local, uat, or production.'
      : 'APP_ENV is required and must be local, uat, or production.',
  );
}

function parseFeatureFlags(
  raw: string | undefined,
  appEnvironment: AppEnvironment,
  localDataSource: string | undefined,
): PublicFeatureFlags {
  let record: Record<string, unknown> = {};
  if (raw?.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('FEATURE_FLAGS must be a JSON object.');
      }
      record = parsed as Record<string, unknown>;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('FEATURE_FLAGS must contain valid JSON.');
      }
      throw error;
    }
  }

  const unknown = Object.keys(record).filter(
    (key) => !ALLOWED_FEATURE_FLAGS.has(key),
  );
  if (unknown.length > 0) {
    throw new Error(`Unsupported public feature flags: ${unknown.join(', ')}`);
  }

  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== 'boolean') {
      throw new Error(`Feature flag ${key} must be boolean.`);
    }
  }

  const flags: PublicFeatureFlags = {
    apiLogging: record.apiLogging === true,
    debugPanel: record.debugPanel === true,
    legacyPerformanceWorkspaces:
      record.legacyPerformanceWorkspaces === true,
    useMockData:
      record.useMockData === true ||
      (appEnvironment === 'local' && localDataSource === 'mock'),
  };

  if (
    appEnvironment !== 'local' &&
    (flags.apiLogging || flags.debugPanel || flags.useMockData)
  ) {
    throw new Error(
      'Deployed environments cannot enable API logging, the debug panel, or mock data.',
    );
  }

  return flags;
}

function validateHttpsPublicUrl(
  name: string,
  value: string | null,
  appEnvironment: AppEnvironment,
): string | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }

  if (url.username || url.password) {
    throw new Error(`${name} cannot contain URL credentials.`);
  }
  if (appEnvironment !== 'local' && url.protocol !== 'https:') {
    throw new Error(`${name} must use HTTPS in deployed environments.`);
  }

  const hostname = url.hostname.toLowerCase();
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local');
  if (appEnvironment !== 'local' && isLocal) {
    throw new Error(`${name} cannot use a local hostname when deployed.`);
  }
  if (
    appEnvironment === 'uat' &&
    (hostname === 'app.adcendy.com' || hostname === 'api.adcendy.com')
  ) {
    throw new Error(`${name} contains a Production hostname in UAT.`);
  }
  if (
    appEnvironment === 'production' &&
    (hostname.includes('uat') ||
      hostname.includes('staging') ||
      hostname === 'api-staging.adcendy.com')
  ) {
    throw new Error(`${name} contains a non-Production hostname.`);
  }

  return url.toString();
}

const SUPPORT_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Where users are sent for help: an HTTPS page, or a mailto: address. Deployed
 * environments must set one, so no page falls back to a hardcoded contact.
 */
function validateSupportUrl(
  value: string | null,
  appEnvironment: AppEnvironment,
): string | null {
  if (!value) {
    if (appEnvironment !== 'local') {
      throw new Error('SUPPORT_URL is required in deployed environments.');
    }
    return null;
  }
  if (value.toLowerCase().startsWith('mailto:')) {
    const address = value.slice('mailto:'.length);
    if (!SUPPORT_EMAIL_PATTERN.test(address)) {
      throw new Error('SUPPORT_URL mailto: must name a single email address with no parameters.');
    }
    return `mailto:${address}`;
  }
  return validateHttpsPublicUrl('SUPPORT_URL', value, appEnvironment);
}

/**
 * A Sentry DSN: https://<public key>@<ingest host>/<project id>. The key is
 * public by design (it only permits sending events); a secret key segment,
 * any path beyond the project id, or plain HTTP when deployed is rejected.
 */
function validateErrorDsn(value: string | null, appEnvironment: AppEnvironment): string | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('PUBLIC_ERROR_DSN must be a Sentry DSN URL.');
  }
  if (!/^[a-f0-9]{32}$/i.test(url.username) || url.password) {
    throw new Error('PUBLIC_ERROR_DSN must carry only a Sentry public key, never a secret.');
  }
  if (!/^\/\d+$/.test(url.pathname) || url.search || url.hash) {
    throw new Error('PUBLIC_ERROR_DSN must end in a numeric Sentry project id.');
  }
  if (appEnvironment !== 'local' && url.protocol !== 'https:') {
    throw new Error('PUBLIC_ERROR_DSN must use HTTPS in deployed environments.');
  }
  return url.toString();
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  );
}

/**
 * The origin this deployment serves the app from. It is deployment
 * configuration, never compiled in: the same image runs anywhere, and the
 * browser refuses to boot on any other origin.
 */
function parseAppOrigin(value: string | null, appEnvironment: AppEnvironment): string {
  if (!value) {
    throw new Error('APP_ORIGIN is required: the https origin this deployment is served from.');
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('APP_ORIGIN must be a valid origin such as https://app.example.com.');
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('APP_ORIGIN must be a bare origin: scheme, host and optional port only.');
  }
  const hostname = url.hostname.toLowerCase();
  if (appEnvironment === 'local') {
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopbackHostname(hostname))) {
      throw new Error('A local APP_ORIGIN must use HTTPS, or HTTP on a loopback host.');
    }
    return url.origin;
  }
  if (url.protocol !== 'https:') {
    throw new Error('APP_ORIGIN must use HTTPS in deployed environments.');
  }
  if (isLoopbackHostname(hostname) || hostname.endsWith('.local')) {
    throw new Error('APP_ORIGIN cannot be a local hostname when deployed.');
  }
  if (appEnvironment === 'production' && /(^|[.-])(uat|staging|stage|test|dev)([.-]|$)/.test(hostname)) {
    throw new Error('APP_ORIGIN names a non-Production host in Production.');
  }
  return url.origin;
}

function validateOpaquePublicValue(
  name: string,
  value: string | null,
): string | null {
  if (!value) return null;
  if (value.length > 256 || /[\r\n\0]/.test(value)) {
    throw new Error(`${name} is malformed.`);
  }
  if (
    /(?:secret|private[_-]?key|password|token)\s*[:=]/i.test(value) ||
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(value)
  ) {
    throw new Error(`${name} appears to contain a private value.`);
  }
  return value;
}

function validateAnalyticsDestination(
  value: string | null,
  appEnvironment: AppEnvironment,
): string | null {
  const id = validateOpaquePublicValue('PUBLIC_ANALYTICS_ID', value);
  if (!id || appEnvironment === 'local') return id;

  const normalized = id.toLowerCase();
  if (
    appEnvironment === 'uat' &&
    /(?:^|[-_.])(prod|production|live)(?:$|[-_.])/.test(normalized)
  ) {
    throw new Error('UAT cannot use a Production analytics destination.');
  }
  if (
    appEnvironment === 'production' &&
    /(?:^|[-_.])(uat|staging|stage|test|development|dev)(?:$|[-_.])/.test(
      normalized,
    )
  ) {
    throw new Error('Production cannot use a non-Production analytics destination.');
  }

  return id;
}

export function buildRuntimePublicConfig(
  source: EnvironmentSource,
): RuntimePublicConfig {
  assertPublicEnvironmentKeyAllowlist(source);
  const appEnvironment = parseAppEnvironment(source.APP_ENV);
  const releaseId =
    optional(source.RELEASE_ID) ??
    (appEnvironment === 'local' ? 'local-development' : null);

  if (!releaseId || !/^[A-Za-z0-9._/@-]{1,128}$/.test(releaseId)) {
    throw new Error(
      'RELEASE_ID is required and must be an immutable, URL-safe identifier.',
    );
  }

  const razorpayKeyId = validateOpaquePublicValue(
    'RAZORPAY_KEY_ID',
    optional(source.RAZORPAY_KEY_ID),
  );
  if (
    appEnvironment === 'production' &&
    razorpayKeyId?.startsWith('rzp_test_')
  ) {
    throw new Error('Production cannot use a Razorpay test key.');
  }
  if (appEnvironment === 'uat' && razorpayKeyId?.startsWith('rzp_live_')) {
    throw new Error('UAT cannot use a Razorpay live key.');
  }

  return {
    APP_ENV: appEnvironment,
    APP_ORIGIN: parseAppOrigin(optional(source.APP_ORIGIN), appEnvironment),
    RELEASE_ID: releaseId,
    PUBLIC_ERROR_DSN: validateErrorDsn(optional(source.PUBLIC_ERROR_DSN), appEnvironment),
    RAZORPAY_KEY_ID: razorpayKeyId,
    PUBLIC_ANALYTICS_ID: validateAnalyticsDestination(
      optional(source.PUBLIC_ANALYTICS_ID),
      appEnvironment,
    ),
    FEATURE_FLAGS: parseFeatureFlags(
      source.FEATURE_FLAGS,
      appEnvironment,
      source.DATA_SOURCE,
    ),
    SUPPORT_URL: validateSupportUrl(optional(source.SUPPORT_URL), appEnvironment),
  };
}

export function serializeRuntimeConfigScript(
  config: RuntimePublicConfig,
): string {
  const serialized = JSON.stringify(config).replaceAll('<', '\\u003c');
  return [
    `const config=${serialized};`,
    `if(globalThis.location.origin!==config.APP_ORIGIN){throw new Error("Runtime environment and browser origin do not match.");}`,
    'globalThis.__ADCENDY_RUNTIME_CONFIG__=Object.freeze(config);',
    `globalThis.dispatchEvent(new Event(${JSON.stringify(RUNTIME_CONFIG_READY_EVENT)}));`,
  ].join('');
}
