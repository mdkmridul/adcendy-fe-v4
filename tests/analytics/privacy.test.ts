import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sanitizeAnalyticsPath,
  sanitizeAnalyticsProperties,
} from '../../shared/analytics/privacy.ts';

test('analytics paths never contain query strings or fragments', () => {
  assert.equal(
    sanitizeAnalyticsPath('/app/files?downloadUrl=signed-secret#section'),
    '/app/files',
  );
});

test('analytics properties discard tokens, cookies, signed URLs, and objects', () => {
  assert.deepEqual(
    sanitizeAnalyticsProperties({
      action: 'download_requested',
      campaignId: 'campaign-1',
      path: '/app/files?token=secret',
      Authorization: 'Bearer secret',
      downloadUrl: 'https://storage.example/object?signature=secret',
      nested: { cookie: 'secret' },
      message: 'Bearer abc.def.ghi',
    }),
    {
      action: 'download_requested',
      campaignId: 'campaign-1',
      path: '/app/files',
    },
  );
});
