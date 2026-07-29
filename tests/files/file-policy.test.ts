import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_CONCURRENT_UPLOADS,
  MAX_UPLOAD_BYTES,
  canUploadCampaignDocuments,
  getFreshDownloadAuthorization,
  validateAuthorizedDownloadUrl,
  validateUploadCandidate,
} from '../../shared/files/file-policy.ts';

test('only Backend-authorized staff roles see the upload control', () => {
  assert.equal(canUploadCampaignDocuments('ADMIN'), true);
  assert.equal(canUploadCampaignDocuments('REVIEWER'), true);
  assert.equal(canUploadCampaignDocuments('CLIENT'), false);
  assert.equal(canUploadCampaignDocuments(null), false);
  assert.equal(MAX_CONCURRENT_UPLOADS, 1);
});

test('validates the 25 MiB upload boundary and allowlisted file formats', () => {
  assert.deepEqual(
    validateUploadCandidate({
      name: 'brief.pdf',
      size: MAX_UPLOAD_BYTES,
      type: 'application/pdf',
    }),
    { valid: true },
  );
  assert.equal(
    validateUploadCandidate({
      name: 'brief.pdf',
      size: MAX_UPLOAD_BYTES + 1,
      type: 'application/pdf',
    }).code,
    'FILE_TOO_LARGE',
  );
  assert.equal(
    validateUploadCandidate({
      name: 'script.exe',
      size: 100,
      type: 'application/octet-stream',
    }).code,
    'UNSUPPORTED_FILE_TYPE',
  );
  assert.deepEqual(
    validateUploadCandidate({ name: 'notes.md', size: 20, type: '' }),
    { valid: true },
  );
});

test('deployed signed downloads require HTTPS and contain no URL credentials', () => {
  assert.equal(
    validateAuthorizedDownloadUrl(
      'https://storage.example/object?signature=temporary',
      'production',
    ).protocol,
    'https:',
  );
  assert.throws(
    () =>
      validateAuthorizedDownloadUrl(
        'http://storage.example/object',
        'production',
      ),
    /must use HTTPS/,
  );
  assert.throws(
    () =>
      validateAuthorizedDownloadUrl(
        'https://user:pass@storage.example/object',
        'uat',
      ),
    /cannot contain credentials/,
  );
});

test('re-authorizes once when a signed URL is expired or about to expire', async () => {
  let calls = 0;
  const now = Date.parse('2026-07-29T00:00:00.000Z');
  const result = await getFreshDownloadAuthorization(
    async () => {
      calls += 1;
      return {
        downloadUrl: `https://storage.example/object?attempt=${calls}`,
        expiresAt:
          calls === 1
            ? '2026-07-29T00:00:03.000Z'
            : '2026-07-29T00:05:00.000Z',
      };
    },
    { appEnvironment: 'uat', now: () => now },
  );

  assert.equal(calls, 2);
  assert.equal(result.url.searchParams.get('attempt'), '2');
});
