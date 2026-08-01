import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const generatedContract = readFileSync(
  new URL('../../src/generated/openapi.ts', import.meta.url),
  'utf8',
);

test('generated client publishes all canonical Wave 2 operations', () => {
  for (const operation of [
    'operations["commitV2"]',
    'operations["startRunV2"]',
    'operations["getRunStatusV2"]',
    'operations["retryRunV2"]',
    'operations["getCampaignRecoveryV2"]',
    'operations["generateDeliverableKitForRunV2"]',
  ]) {
    assert.match(generatedContract, new RegExp(operation.replaceAll('[', '\\[').replaceAll(']', '\\]')));
  }
});

test('admin complete-kit contract is approval-gated orchestration with typed notification control', () => {
  for (const contractFragment of [
    'GenerateDeliverableKitV2Request',
    'notifyOwner: boolean',
    'QueuedDeliverableKitV2',
    'jobName: "admin-deliverable-kit-assembly-v2"',
    'status: "queued"',
    'kitGenerationId: string',
  ]) {
    assert.ok(
      generatedContract.includes(contractFragment),
      `Missing ${contractFragment}`,
    );
  }
});

test('generated run state includes all five statuses and no public cancel state', () => {
  assert.match(
    generatedContract,
    /"QUEUED" \| "RUNNING" \| "COMPLETED" \| "FAILED" \| "BLOCKED_AWAITING_REVIEW"/,
  );
  assert.doesNotMatch(generatedContract, /PipelineRunStatusV2:.*CANCEL/);
});

test('start, retry, and wizard commit require Idempotency-Key', () => {
  const occurrences = generatedContract.match(/"Idempotency-Key": string;/g) ?? [];
  assert.ok(occurrences.length >= 3);
});

test('status contract publishes polling, capabilities, progress, and errors', () => {
  for (const field of [
    'pollAfterMs: number',
    'shouldPoll: boolean',
    'capabilities: components["schemas"]["PipelineRunCapabilitiesV2"]',
    'progress: components["schemas"]["PipelineRunProgressV2"]',
    'error: components["schemas"]["PipelineRunErrorV2"]',
  ]) {
    assert.ok(generatedContract.includes(field), `Missing ${field}`);
  }
});
