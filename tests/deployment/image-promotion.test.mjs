import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyImagePromotion } from '../../scripts/verify-image-promotion.mjs';

const digest = `sha256:${'a'.repeat(64)}`;

test('accepts the exact UAT-approved digest for Production', () => {
  assert.equal(
    verifyImagePromotion(
      `registry.example/adcendy-fe@${digest}`,
      `registry.example/adcendy-fe@${digest}`,
    ),
    digest,
  );
});

test('rejects a rebuild or mutable tag as Production promotion', () => {
  assert.throws(
    () =>
      verifyImagePromotion(
        `registry.example/adcendy-fe@${digest}`,
        `registry.example/adcendy-fe@sha256:${'b'.repeat(64)}`,
      ),
    /does not match/,
  );
  assert.throws(
    () =>
      verifyImagePromotion(
        `registry.example/adcendy-fe@${digest}`,
        'registry.example/adcendy-fe:latest',
      ),
    /immutable sha256 digest/,
  );
});
