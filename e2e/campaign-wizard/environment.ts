const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'adcendy.localhost']);
const KNOWN_PRODUCTION_HOSTS = new Set([
  'adcendy.com',
  'www.adcendy.com',
  'app.adcendy.com',
  'api.adcendy.com',
]);

export type CampaignTargetEnvironment = 'local' | 'uat';

export function resolveCampaignTarget() {
  const baseURL = process.env.ADCENDY_BASE_URL?.trim() || 'https://adcendy.localhost';
  let url: URL;
  try {
    url = new URL(baseURL);
  } catch {
    throw new Error(`ADCENDY_BASE_URL must be an absolute URL; received "${baseURL}"`);
  }

  const requestedEnvironment = process.env.ADCENDY_TARGET_ENV?.trim().toLowerCase();
  const environment: CampaignTargetEnvironment =
    requestedEnvironment === 'uat'
      ? 'uat'
      : requestedEnvironment === 'local' || !requestedEnvironment
        ? 'local'
        : (() => {
            throw new Error('ADCENDY_TARGET_ENV must be "local" or "uat"');
          })();

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('ADCENDY_BASE_URL must use http or https');
  }

  const hostname = url.hostname.toLowerCase();
  if (KNOWN_PRODUCTION_HOSTS.has(hostname) || /(^|[.-])prod(uction)?([.-]|$)/i.test(hostname)) {
    throw new Error(`Campaign automation refuses production target "${hostname}"`);
  }

  if (environment === 'local' && !LOCAL_HOSTS.has(hostname) && !hostname.endsWith('.localhost')) {
    throw new Error(
      `ADCENDY_TARGET_ENV=local only permits localhost targets; received "${hostname}"`,
    );
  }

  if (environment === 'uat') {
    if (url.protocol !== 'https:') {
      throw new Error('ADCENDY_TARGET_ENV=uat requires an https ADCENDY_BASE_URL');
    }
    const explicitAllowlist = new Set(
      (process.env.ADCENDY_UAT_HOST_ALLOWLIST ?? '')
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean),
    );
    const visiblyNonProduction = /(^|[.-])(uat|staging|test)([.-]|$)/i.test(hostname);
    if (!visiblyNonProduction && !explicitAllowlist.has(hostname)) {
      throw new Error(
        `UAT host "${hostname}" must contain uat/staging/test or be listed in ADCENDY_UAT_HOST_ALLOWLIST`,
      );
    }
  }

  return {
    baseURL: url.origin,
    environment,
  };
}

export function shouldSubmitCampaign() {
  return process.env.SUBMIT_CAMPAIGN?.trim().toLowerCase() === 'true';
}
