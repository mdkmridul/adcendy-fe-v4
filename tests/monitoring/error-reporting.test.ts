import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { ErrorEvent } from '@sentry/browser';
import { buildRuntimePublicConfig } from '../../shared/runtime-config/schema.ts';
import { scrubBreadcrumb, scrubErrorEvent } from '../../shared/monitoring/scrub-error-event.ts';

const production = {
  APP_ENV: 'production',
  APP_ORIGIN: 'https://app.adcendy.com',
  RELEASE_ID: 'r1',
  SUPPORT_URL: 'https://app.adcendy.com/contact',
};
const DSN = 'https://0123456789abcdef0123456789abcdef@o1.ingest.sentry.io/4500';

test('PUBLIC_ERROR_DSN accepts a Sentry DSN and rejects secrets and malformed values', () => {
  assert.equal(buildRuntimePublicConfig({ ...production, PUBLIC_ERROR_DSN: DSN }).PUBLIC_ERROR_DSN, DSN);
  for (const PUBLIC_ERROR_DSN of [
    'https://0123456789abcdef0123456789abcdef:secret@o1.ingest.sentry.io/4500',
    'https://o1.ingest.sentry.io/4500',
    'https://0123456789abcdef0123456789abcdef@o1.ingest.sentry.io/api/4500/envelope',
    'http://0123456789abcdef0123456789abcdef@o1.ingest.sentry.io/4500',
  ]) {
    assert.throws(() => buildRuntimePublicConfig({ ...production, PUBLIC_ERROR_DSN }), /PUBLIC_ERROR_DSN/, PUBLIC_ERROR_DSN);
  }
});

test('error events leave without identity, headers, queries or tokens', () => {
  const event = scrubErrorEvent({
    type: undefined,
    user: { id: 'u1', email: 'a@b.com' },
    request: {
      url: 'https://app.adcendy.com/app/campaigns/1?token=abc#x',
      headers: { Authorization: 'Bearer abc' },
      cookies: { refresh: 'x' },
      query_string: 'token=abc',
    },
    message: 'failed with Bearer eyJhbGciOi.secret.sig',
    exception: { values: [{ type: 'Error', value: 'GET https://store.example/file?X-Amz-Signature=abc failed' }] },
    breadcrumbs: [
      { category: 'console', message: 'user email a@b.com' },
      { category: 'fetch', data: { url: '/v1/files?signature=1', method: 'GET', status_code: 500, body: 'x' } },
      { category: 'navigation', data: { from: '/auth/login?next=/app', to: '/app#top' } },
    ],
  } as ErrorEvent);

  assert.equal(event.user, undefined);
  assert.deepEqual(event.request, { url: '/app/campaigns/1' });
  assert.doesNotMatch(event.message ?? '', /eyJ/);
  assert.doesNotMatch(event.exception?.values?.[0]?.value ?? '', /Signature=abc/);
  assert.equal(event.breadcrumbs?.length, 2);
  assert.deepEqual(event.breadcrumbs?.[0]?.data, { url: '/v1/files', method: 'GET', status_code: 500 });
  assert.deepEqual(event.breadcrumbs?.[1]?.data, { from: '/auth/login', to: '/app' });
});

test('console breadcrumbs are dropped', () => {
  assert.equal(scrubBreadcrumb({ category: 'console', message: 'anything' }), null);
});

test('reports go through the same-origin tunnel, so the CSP stays self-only', () => {
  const reporting = readFileSync('shared/monitoring/error-reporting.ts', 'utf8');
  assert.match(reporting, /tunnel: ERROR_REPORTING_TUNNEL_PATH/);
  assert.match(reporting, /ERROR_REPORTING_TUNNEL_PATH = '\/monitoring\/errors'/);
  assert.match(readFileSync('next.config.mjs', 'utf8'), /connect-src 'self' https:\/\/\*\.razorpay\.com;/);
  for (const boundary of ['app/error.tsx', 'app/global-error.tsx']) {
    assert.match(readFileSync(boundary, 'utf8'), /ErrorFallback/, boundary);
  }
});
