import * as Sentry from '@sentry/browser';
import type { RuntimePublicConfig } from '@/shared/runtime-config/types';
import { scrubBreadcrumb, scrubErrorEvent } from './scrub-error-event';

/**
 * Same-origin path the reverse proxy forwards to the configured Sentry
 * project. The browser never contacts Sentry directly, so the CSP stays
 * `connect-src 'self'` and the destination is the deployment's to choose.
 * Keep in step with the proxy contract (config/deployment).
 */
export const ERROR_REPORTING_TUNNEL_PATH = '/monitoring/errors';

let enabled = false;

/** Starts reporting when the runtime config names a DSN; otherwise reporting stays off. */
export function initErrorReporting(config: RuntimePublicConfig): void {
  if (enabled || !config.PUBLIC_ERROR_DSN) return;
  Sentry.init({
    dsn: config.PUBLIC_ERROR_DSN,
    tunnel: ERROR_REPORTING_TUNNEL_PATH,
    environment: config.APP_ENV,
    release: config.RELEASE_ID,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubErrorEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  });
  enabled = true;
}

/** Reports an error caught by an error boundary. A no-op while reporting is off. */
export function reportError(error: unknown, context: { boundary: string; digest?: string }): void {
  if (!enabled) return;
  Sentry.captureException(error, {
    tags: { boundary: context.boundary },
    extra: context.digest ? { digest: context.digest } : undefined,
  });
}
