import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildProductNounAnswer,
  describeProductNounVolume,
  isProductNounTask,
  normalizeProductNoun,
  readProductNounModel,
} from '../../shared/components/ops/productNounConfirmation.ts';

// The product-word confirmation (backend R-3b). The task detail sends its
// values in camelCase; the question context it was asked with is the fallback,
// in either case. Ultrahuman's held run is the shape used here.

const detail = {
  currentValuesToFix: {
    clientName: 'Ultrahuman',
    marketLabel: 'IN',
    diagnosis: 'No candidate cleared the search-volume floor with agreement.',
    candidates: [
      {
        phrase: 'smart ring',
        searchVolume: 27100,
        sources: ['discovery', 'offerings'],
        confidence: 'high',
      },
      {
        phrase: 'health tracking ring',
        search_volume: null,
        sources: ['description'],
        confidence: 'low',
      },
      { phrase: 'smart ring', searchVolume: 27100, sources: [], confidence: 'high' },
    ],
  },
};

test('recognizes the product-word task by its failure mode', () => {
  assert.equal(isProductNounTask('product_noun_low_confidence'), true);
  assert.equal(isProductNounTask('Product-Noun-Low-Confidence'), true);
  assert.equal(isProductNounTask('competitive_empty_tier_selection_required'), false);
  assert.equal(isProductNounTask(null), false);
});

test('reads the candidates, in either casing, without repeating one', () => {
  const model = readProductNounModel(detail);

  assert.ok(model);
  assert.equal(model.clientName, 'Ultrahuman');
  assert.equal(model.candidates.length, 2);
  assert.equal(model.candidates[0].searchVolume, 27100);
  assert.equal(model.candidates[1].searchVolume, null);
  assert.deepEqual(model.candidates[1].sources, ['description']);
});

test('falls back to the question context the task was asked with', () => {
  const model = readProductNounModel({
    questionPayload: {
      question_context: {
        client_name: 'Chakr Innovation',
        market_label: 'IN',
        candidates: [{ phrase: 'recd', search_volume: 720, sources: ['discovery'] }],
      },
    },
  });

  assert.ok(model);
  assert.equal(model.clientName, 'Chakr Innovation');
  assert.equal(model.candidates[0].phrase, 'recd');
});

test('builds the answer the schema accepts, and says why when it cannot', () => {
  const built = buildProductNounAnswer({
    phrases: ['smart ring', ' smart  ring ', 'continuous glucose monitor'],
    notes: 'Both are what buyers type.',
  });

  assert.ok('answer' in built);
  assert.deepEqual(built.answer.product_nouns, ['smart ring', 'continuous glucose monitor']);
  assert.equal(built.answer.reviewer_notes, 'Both are what buyers type.');

  const empty = buildProductNounAnswer({ phrases: ['x'] });
  assert.ok('error' in empty);

  const tooMany = buildProductNounAnswer({
    phrases: ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9'],
  });
  assert.ok('error' in tooMany);
});

test('keeps a phrase inside the length the schema allows', () => {
  assert.equal(normalizeProductNoun('  smart   ring '), 'smart ring');
  assert.equal(normalizeProductNoun('a'), null);
  assert.equal(normalizeProductNoun('x'.repeat(81)), null);
});

test('says what a candidate is searched, or that nothing measured it', () => {
  assert.match(describeProductNounVolume(27100), /27,100 a month/);
  assert.equal(describeProductNounVolume(null), 'no measured searches');
});
