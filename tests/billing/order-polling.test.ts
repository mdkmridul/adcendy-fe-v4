import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ORDER_POLL_MAX_ATTEMPTS,
  ORDER_POLL_MAX_DELAY_MS,
  isOrderAwaitingCapture,
  nextOrderPollDelay,
} from '../../shared/payments/order-polling.ts';

test('order polling backs off exponentially up to the ceiling', () => {
  assert.equal(nextOrderPollDelay(0), 2_000);
  assert.equal(nextOrderPollDelay(1), 4_000);
  assert.equal(nextOrderPollDelay(2), 8_000);
  assert.equal(nextOrderPollDelay(3), ORDER_POLL_MAX_DELAY_MS);
  assert.equal(nextOrderPollDelay(ORDER_POLL_MAX_ATTEMPTS - 1), ORDER_POLL_MAX_DELAY_MS);
});

test('order polling stops at the attempt cap and on invalid counts', () => {
  assert.equal(nextOrderPollDelay(ORDER_POLL_MAX_ATTEMPTS), false);
  assert.equal(nextOrderPollDelay(ORDER_POLL_MAX_ATTEMPTS + 5), false);
  assert.equal(nextOrderPollDelay(-1), false);
  assert.equal(nextOrderPollDelay(1.5), false);
});

test('the whole wait stays bounded to a few minutes', () => {
  let total = 0;
  for (let attempt = 0; nextOrderPollDelay(attempt) !== false; attempt += 1) {
    total += nextOrderPollDelay(attempt) as number;
  }
  assert.ok(total <= 5 * 60_000, `total wait ${total}ms`);
});

test('only unconfirmed orders are awaited', () => {
  assert.equal(isOrderAwaitingCapture(undefined), true);
  assert.equal(isOrderAwaitingCapture('CREATED'), true);
  assert.equal(isOrderAwaitingCapture('PENDING'), true);
  for (const status of ['PAID', 'FAILED', 'CANCELLED', 'REFUNDED']) {
    assert.equal(isOrderAwaitingCapture(status), false, status);
  }
});
