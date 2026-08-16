import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCampaignCostRollup } from '../../shared/types/opsV2.ts';

// The backend serialises this payload in snake_case. These tests pin the two
// things the panel depends on being right: that measured and estimated cost
// stay separate, and that units survive as a unit/quantity pair.

test('keeps measured and estimated cost apart', () => {
  const rollup = normalizeCampaignCostRollup({
    campaign: { id: 'camp_1', title: 'Chakr Innovation' },
    run_count: 1,
    totals: {
      calls: 395,
      actual_cost_usd: 5.53,
      estimated_cost_usd: 3.2,
      total_cost_usd: 8.73,
    },
    by_provider: [
      {
        provider: 'dataforseo',
        calls: 137,
        actual_cost_usd: 1.8768,
        estimated_cost_usd: 3.2,
        total_cost_usd: 5.0768,
      },
    ],
  });

  assert.equal(rollup.campaignTitle, 'Chakr Innovation');
  assert.equal(rollup.totals.actualCostUsd, 5.53);
  assert.equal(rollup.totals.estimatedCostUsd, 3.2);
  assert.equal(rollup.byProvider[0].provider, 'dataforseo');
  assert.equal(rollup.byProvider[0].estimatedCostUsd, 3.2);
});

test('carries units through as a unit and quantity pair', () => {
  const rollup = normalizeCampaignCostRollup({
    campaign: { id: 'camp_1' },
    by_operation: [
      {
        provider: 'firecrawl',
        operation: 'competitive_homepage_scrape',
        calls: 28,
        total_cost_usd: 0.448,
        units_consumed: { unit: 'credit', quantity: 140 },
      },
    ],
  });

  assert.deepEqual(rollup.byOperation[0].unitsConsumed, {
    unit: 'credit',
    quantity: 140,
  });
});

test('treats a half-populated unit as no measurement', () => {
  // A unit with no quantity is not a measurement, and rendering it as one
  // would imply a count nobody reported.
  const rollup = normalizeCampaignCostRollup({
    by_operation: [
      { provider: 'serpapi', operation: 'search', units_consumed: { unit: 'search' } },
      { provider: 'meta', operation: 'meta_page_resolution', units_consumed: null },
    ],
  });

  assert.equal(rollup.byOperation[0].unitsConsumed, null);
  assert.equal(rollup.byOperation[1].unitsConsumed, null);
});

test('survives a payload with nothing in it', () => {
  // A campaign that has never run returns empty collections rather than an
  // error, and the panel has to render that without throwing.
  const rollup = normalizeCampaignCostRollup({});

  assert.deepEqual(rollup.byProvider, []);
  assert.deepEqual(rollup.byOperation, []);
  assert.deepEqual(rollup.byRun, []);
  assert.equal(rollup.totals.totalCostUsd, null);
});

test('reads reuse counts from the collected-data block', () => {
  const rollup = normalizeCampaignCostRollup({
    collected_data_reuse: {
      observations_collected: 270,
      times_served_to_later_runs: 99,
      note: 'Counts reuse of data this campaign collected.',
    },
  });

  assert.equal(rollup.collectedDataReuse.observationsCollected, 270);
  assert.equal(rollup.collectedDataReuse.timesServedToLaterRuns, 99);
});
