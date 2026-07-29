import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyRefreshFailure,
  shouldRetryRefresh,
} from '../../features/auth/refresh-policy.ts';

test('classifies terminal refresh failures as anonymous', () => {
  for (const code of [
    'INVALID_REFRESH_TOKEN',
    'REFRESH_TOKEN_EXPIRED',
    'REFRESH_TOKEN_REUSED',
    'SESSION_REVOKED',
    'SESSION_FAMILY_REVOKED',
    'ACCOUNT_DISABLED',
  ]) {
    assert.equal(classifyRefreshFailure(401, code), 'anonymous');
  }
});

test('keeps temporary refresh failures recoverable', () => {
  assert.equal(
    classifyRefreshFailure(409, 'REFRESH_IN_PROGRESS'),
    'retryable',
  );
  assert.equal(classifyRefreshFailure(429, 'RATE_LIMITED'), 'retryable');
  assert.equal(classifyRefreshFailure(500, 'INTERNAL_ERROR'), 'retryable');
  assert.equal(classifyRefreshFailure(undefined, 'NETWORK_ERROR'), 'retryable');
});

test('retries only bounded concurrent-refresh conflicts', () => {
  assert.equal(shouldRetryRefresh(0, 409, 'REFRESH_IN_PROGRESS'), true);
  assert.equal(shouldRetryRefresh(1, 409, 'REFRESH_IN_PROGRESS'), true);
  assert.equal(shouldRetryRefresh(2, 409, 'REFRESH_IN_PROGRESS'), false);
  assert.equal(shouldRetryRefresh(0, 401, 'REFRESH_TOKEN_REUSED'), false);
});

test('separates origin-policy failures from anonymous sessions', () => {
  assert.equal(classifyRefreshFailure(403, 'ORIGIN_NOT_ALLOWED'), 'forbidden');
});
