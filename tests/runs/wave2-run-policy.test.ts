import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError } from '../../shared/api/errors.ts';
import { createIdempotencyKey } from '../../shared/run/idempotency.ts';
import {
  getRunPollingDelay,
  getRunStateDescriptor,
} from '../../shared/run/run-state-v2.ts';
import { parseRetryAfterMs } from '../../shared/run/retry-after.ts';
import type { PipelineRunStatusResponseV2 } from '../../shared/types/runsV2.ts';

function run(
  status: PipelineRunStatusResponseV2['status'],
  shouldPoll: boolean,
  pollAfterMs: number,
): PipelineRunStatusResponseV2 {
  const timestamp = '2026-07-29T00:00:00.000Z';
  return {
    runId: 'run-1',
    campaignId: 'campaign-1',
    status,
    referenceStatus: 'ACTIVE',
    currentPhase: null,
    attemptNumber: 1,
    createdAt: timestamp,
    queuedAt: timestamp,
    startedAt: null,
    updatedAt: timestamp,
    blockedAt: null,
    completedAt: null,
    failedAt: null,
    error: null,
    retryable: false,
    requiredAction: shouldPoll ? 'WAIT' : 'NONE',
    capabilities: {
      canRetry: false,
      canResume: false,
      canCancel: false,
    },
    progress: {
      completedUnits: 0,
      totalUnits: null,
      percent: null,
    },
    shouldPoll,
    pollAfterMs,
  };
}

test('models every canonical Wave 2 state', () => {
  const states = [
    'QUEUED',
    'RUNNING',
    'BLOCKED_AWAITING_REVIEW',
    'COMPLETED',
    'FAILED',
  ] as const;

  assert.deepEqual(
    states.map((status) => getRunStateDescriptor(status).terminal),
    [false, false, false, true, true],
  );
});

test('uses Backend polling guidance and stops when Backend says to stop', () => {
  assert.equal(getRunPollingDelay(run('RUNNING', true, 5_000), null, 0), 5_000);
  assert.equal(getRunPollingDelay(run('COMPLETED', false, 2_000), null, 0), false);
});

test('uses Retry-After and bounded transient-error backoff', () => {
  const rateLimit = new ApiError({
    kind: 'RateLimit',
    status: 429,
    retryAfterMs: 12_000,
    message: 'Slow down',
  });
  assert.equal(getRunPollingDelay(undefined, rateLimit, 1), 12_000);
  assert.equal(getRunPollingDelay(undefined, new Error('offline'), 1), 2_000);
  assert.equal(getRunPollingDelay(undefined, new Error('offline'), 4), 10_000);
  assert.equal(getRunPollingDelay(undefined, new Error('offline'), 20), 10_000);
});

test('does not continue polling permanent authorization or lookup failures', () => {
  for (const status of [400, 401, 403, 404]) {
    const error = new ApiError({
      kind: 'Unknown',
      status,
      message: 'Permanent failure',
    });
    assert.equal(getRunPollingDelay(undefined, error, 1), false);
  }
});

test('parses Retry-After seconds and HTTP dates', () => {
  assert.equal(parseRetryAfterMs('3'), 3_000);
  assert.equal(
    parseRetryAfterMs('Wed, 29 Jul 2026 00:00:05 GMT', Date.parse('2026-07-29T00:00:00Z')),
    5_000,
  );
  assert.equal(parseRetryAfterMs('not-a-date'), undefined);
});

test('generates contract-valid and distinct mutation keys', () => {
  const first = createIdempotencyKey('retry-run');
  const second = createIdempotencyKey('retry-run');
  assert.ok(first.length >= 16 && first.length <= 128);
  assert.ok(second.length >= 16 && second.length <= 128);
  assert.notEqual(first, second);
});
