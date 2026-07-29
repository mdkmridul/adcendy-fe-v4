import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildAdminReviewerAssignmentBody,
  buildReviewerTaskRespondBody,
  buildSectionApprovalBody,
  buildSectionImpactAnalysisBody,
  buildSectionImpactConfirmationBody,
  buildSectionRevisionBody,
} from '../../shared/api/wave1-contract.ts';

test('reviewer mutation builders discard browser-supplied authority fields', () => {
  const injected = {
    reviewerId: 'attacker-selected-reviewer',
    requestedByUserId: 'attacker-selected-actor',
    role: 'ADMIN',
    ownerId: 'attacker-selected-owner',
    organizationId: 'attacker-selected-organization',
    tenantId: 'attacker-selected-tenant',
  };

  assert.deepEqual(
    buildReviewerTaskRespondBody({
      ...injected,
      answer: { approved: true },
    }),
    { answer: { approved: true } },
  );
  assert.deepEqual(
    buildSectionApprovalBody({ ...injected, reviewerNotes: 'looks good' }),
    { reviewerNotes: 'looks good' },
  );
  assert.deepEqual(
    buildSectionRevisionBody({
      ...injected,
      instruction: 'Update the evidence.',
      reviewerNotes: 'Use current data.',
    }),
    {
      instruction: 'Update the evidence.',
      reviewerNotes: 'Use current data.',
    },
  );
  assert.deepEqual(
    buildSectionImpactAnalysisBody({
      ...injected,
      instruction: 'Update the evidence.',
    }),
    { instruction: 'Update the evidence.' },
  );
});

test('impact confirmation uses selectedScopeKeys from the contract', () => {
  assert.deepEqual(
    buildSectionImpactConfirmationBody({
      decision: 'confirm_apply',
      selectedScopeKeys: ['market:in', 'section:summary'],
      selectedSectionReviewTaskIds: ['legacy-field'],
    } as Parameters<typeof buildSectionImpactConfirmationBody>[0]),
    {
      decision: 'confirm_apply',
      selectedScopeKeys: ['market:in', 'section:summary'],
    },
  );
});

test('admin assignment sends only assigneeUserId', () => {
  assert.deepEqual(
    buildAdminReviewerAssignmentBody({
      assigneeUserId: 'active-reviewer-id',
      actorId: 'browser-selected-admin',
      role: 'ADMIN',
    } as Parameters<typeof buildAdminReviewerAssignmentBody>[0]),
    { assigneeUserId: 'active-reviewer-id' },
  );
  assert.deepEqual(
    buildAdminReviewerAssignmentBody({ assigneeUserId: null }),
    { assigneeUserId: null },
  );
});
