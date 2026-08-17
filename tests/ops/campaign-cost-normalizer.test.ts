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

test('reads the per-run provider and phase breakdown', () => {
  // A campaign is re-run after reviewer changes and after failures, so its
  // total is a sum over attempts. Provider answers who was paid and phase
  // answers what for; a rerun that re-bought SERP but reused domain metrics
  // is indistinguishable from a cheap first run on provider alone.
  const rollup = normalizeCampaignCostRollup({
    by_run: [
      {
        pipeline_run_id: 'run_b',
        status: 'BLOCKED_AWAITING_REVIEW',
        created_at: '2026-08-17T10:50:32.974Z',
        calls: 50,
        total_cost_usd: 1.25,
        by_provider: [{ provider: 'serpapi', calls: 50, total_cost_usd: 1.25 }],
        by_phase: [
          {
            phase: 'serp_competitor_identification_v2',
            calls: 50,
            total_cost_usd: 1.25,
          },
        ],
      },
    ],
  });

  assert.equal(rollup.byRun.length, 1);
  assert.equal(rollup.byRun[0].byProvider[0].provider, 'serpapi');
  assert.equal(rollup.byRun[0].byProvider[0].totalCostUsd, 1.25);
  assert.equal(
    rollup.byRun[0].byPhase[0].phase,
    'serp_competitor_identification_v2',
  );
});

test('defaults a run with no nested breakdown to empty lists', () => {
  // A payload predating the breakdown must not make the panel throw on a
  // missing array, so these default to empty rather than undefined.
  const rollup = normalizeCampaignCostRollup({
    by_run: [{ pipeline_run_id: 'run_a', calls: 3, total_cost_usd: 0.5 }],
  });

  assert.deepEqual(rollup.byRun[0].byProvider, []);
  assert.deepEqual(rollup.byRun[0].byPhase, []);
});
