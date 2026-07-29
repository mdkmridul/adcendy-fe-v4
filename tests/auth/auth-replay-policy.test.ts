import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldReplayAfterAuthRefresh } from '../../shared/api/auth-replay-policy.ts';

test('safe GET requests may replay once after access-token refresh', () => {
  assert.equal(shouldReplayAfterAuthRefresh('GET', {}), true);
});

test('mutations do not replay by default', () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
    assert.equal(shouldReplayAfterAuthRefresh(method, {}), false);
  }
});

test('mutations replay only with an explicit safety contract', () => {
  assert.equal(
    shouldReplayAfterAuthRefresh('POST', {
      'Idempotency-Key': 'start:campaign-1:stable-key',
    }),
    true,
  );
  assert.equal(
    shouldReplayAfterAuthRefresh('PATCH', {}, true),
    true,
  );
  assert.equal(
    shouldReplayAfterAuthRefresh('POST', { 'idempotency-key': '   ' }),
    false,
  );
});
