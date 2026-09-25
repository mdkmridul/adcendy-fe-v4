import type { Breadcrumb, ErrorEvent } from '@sentry/browser';
import { redactSensitiveText, sanitizeAnalyticsPath } from '../analytics/privacy.ts';

/**
 * What leaves the browser in an error report. The same rules as analytics:
 * no user identity, no headers or cookies, no query strings or fragments (they
 * carry tracking ids, redirect targets and signed-URL credentials), and no
 * bearer tokens in free text.
 */
export function scrubErrorEvent(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    event.request = event.request.url ? { url: sanitizeAnalyticsPath(event.request.url) } : {};
  }
  if (event.message) event.message = redactSensitiveText(event.message);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) exception.value = redactSensitiveText(exception.value);
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map((breadcrumb) => scrubBreadcrumb(breadcrumb))
      .filter((breadcrumb): breadcrumb is Breadcrumb => breadcrumb !== null);
  }
  return event;
}

const URL_DATA_KEYS = ['url', 'from', 'to'] as const;

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  // Console output can hold anything the app logged; it is not sent.
  if (breadcrumb.category === 'console') return null;
  if (breadcrumb.message) breadcrumb.message = redactSensitiveText(breadcrumb.message);
  if (breadcrumb.data) {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(breadcrumb.data)) {
      if ((URL_DATA_KEYS as readonly string[]).includes(key) && typeof value === 'string') {
        data[key] = sanitizeAnalyticsPath(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        data[key] = value;
      } else if (key === 'method' && typeof value === 'string') {
        data[key] = value;
      }
    }
    breadcrumb.data = data;
  }
  return breadcrumb;
}
