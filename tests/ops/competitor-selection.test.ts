import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCompetitorSelectionAnswer,
  formatCandidateKind,
  isAnswerableTaskStatus,
  isCompetitorSelectionTask,
  readCompetitorSelectionModel,
} from '../../shared/components/ops/competitorSelection.ts';

// The empty-tier competitor pick (backend block R3b). The task detail sends
// its values in camelCase; the question context it was asked with is the
// fallback, in either case.

const detail = {
  currentValuesToFix: {
    namedCompetitors: [{ id: 'domain:named.example', name: 'Named Rival', domain: 'named.example' }],
    unconfirmedNamedCompetitors: [{ id: 'domain:wired.example', name: 'Oura', domain: 'wired.example' }],
    options: [
      {
        id: 'domain:aabo.example',
        name: 'Aabo',
        domain: 'aabo.example',
        score: 50,
        kind: 'adjacent_competitor',
        whyNotPlaced: 'Found in the research, but not judged a competitor.',
      },
      { id: 'domain:lumen.example', name: 'Lumen', domain: 'lumen.example', score: 22, kind: 'needs_review' },
      { id: 'domain:aabo.example', name: 'Aabo again' },
      { name: 'No id' },
    ],
  },
};

test('recognises the task by its failure mode, whatever its spelling', () => {
  assert.equal(isCompetitorSelectionTask('competitive_empty_tier_selection_required'), true);
  assert.equal(isCompetitorSelectionTask('Competitive-Empty-Tier-Selection-Required'), true);
  assert.equal(isCompetitorSelectionTask('competitive_tier_1_review_required'), false);
  assert.equal(isCompetitorSelectionTask(null), false);
});

test('reads the pick list from the current values, dropping repeats and entries without an id', () => {
  const model = readCompetitorSelectionModel(detail);

  assert.ok(model);
  assert.deepEqual(
    model.options.map((option) => option.id),
    ['domain:aabo.example', 'domain:lumen.example'],
  );
  assert.equal(model.options[0].whyNotPlaced, 'Found in the research, but not judged a competitor.');
  assert.equal(model.options[1].whyNotPlaced, null);
  assert.deepEqual(model.named, [{ id: 'domain:named.example', name: 'Named Rival', domain: 'named.example' }]);
  assert.deepEqual(model.unconfirmed, [{ id: 'domain:wired.example', name: 'Oura', domain: 'wired.example' }]);
});

test('falls back to the question context, in snake_case', () => {
  const model = readCompetitorSelectionModel({
    questionPayload: {
      question_context: {
        named_competitors: [{ id: 'domain:named.example', name: 'Named Rival' }],
        options: [{ id: 'domain:aabo.example', name: 'Aabo', why_not_placed: 'Held for review.' }],
      },
    },
  });

  assert.ok(model);
  assert.equal(model.named[0].name, 'Named Rival');
  assert.equal(model.options[0].whyNotPlaced, 'Held for review.');
  assert.deepEqual(model.unconfirmed, []);
  assert.equal(readCompetitorSelectionModel({}), null);
});

test('sends the picks among the offered candidates, in the order offered', () => {
  const model = readCompetitorSelectionModel(detail);
  assert.ok(model);

  const answer = buildCompetitorSelectionAnswer({
    decision: 'use_selected_competitors',
    selectedIds: ['domain:lumen.example', 'domain:not-offered.example', 'domain:aabo.example'],
    notes: '  Both sell rings.  ',
    model,
  });

  assert.deepEqual(answer, {
    decision: 'use_selected_competitors',
    selected_competitor_ids: ['domain:aabo.example', 'domain:lumen.example'],
    reviewer_notes: 'Both sell rings.',
  });
});

test('sends no picks when going ahead with the named competitors, and no empty notes', () => {
  const model = readCompetitorSelectionModel(detail);
  assert.ok(model);

  assert.deepEqual(
    buildCompetitorSelectionAnswer({
      decision: 'proceed_with_named_competitors_only',
      selectedIds: ['domain:aabo.example'],
      notes: '   ',
      model,
    }),
    { decision: 'proceed_with_named_competitors_only' },
  );
});

test('refuses a pick list with nothing picked', () => {
  const model = readCompetitorSelectionModel(detail);
  assert.ok(model);

  assert.throws(
    () => buildCompetitorSelectionAnswer({ decision: 'use_selected_competitors', selectedIds: [], notes: '', model }),
    /Pick at least one candidate/,
  );
});

test('takes an answer only while the task is pending, and reads kinds as words', () => {
  assert.equal(isAnswerableTaskStatus('pending_review'), true);
  assert.equal(isAnswerableTaskStatus('PENDING'), true);
  assert.equal(isAnswerableTaskStatus('closed'), false);
  assert.equal(formatCandidateKind('direct_competitor'), 'Direct competitor');
  assert.equal(formatCandidateKind(null), null);
});
