import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EMPTY_VALUE_V2,
  buildChannelChoicesV2,
  buildChannelResultPayloadV2,
  buildMarketOptionsV2,
  campaignMarketCodesV2,
  channelLabelV2,
  convertPeriodStartV2,
  currentPeriodStartV2,
  defaultCurrencyForMarketV2,
  deriveChannelResultMetricsV2,
  describeChannelResultErrorV2,
  emptyChannelResultFormValuesV2,
  findReportedPeriodV2,
  formatCountV2,
  formatMoneyV2,
  formatPeriodLabelV2,
  formatReturnOnSpendV2,
  isFuturePeriodStartV2,
  isValidPeriodStartV2,
  monthPeriodStartFromPartsV2,
  monthPeriodStartV2,
  monthPickerYearsV2,
  normalizeMarketCodeV2,
  parseFigureV2,
  resultToFormValuesV2,
  summarizeChannelResultsV2,
  weekPeriodStartV2,
  type ChannelResultFormValuesV2,
} from '../../shared/components/results/channelResultsV2.ts';
import type { ChannelResultViewV2 } from '../../shared/types/channelResultsV2.ts';

// The results page (backend STEP-4): a client records what each channel cost
// and brought back, per month or week. The API wants a month's 1st or a
// week's Monday, never a future period, and at least one figure.

// Sunday 13 September 2026, mid-morning UTC.
const now = new Date('2026-09-13T10:00:00.000Z');

function formValues(overrides: Partial<ChannelResultFormValuesV2> = {}): ChannelResultFormValuesV2 {
  return {
    market: 'IN',
    channelId: 'google_search_ads',
    period: 'month',
    periodStart: '2026-08-01',
    currency: 'INR',
    spend: '',
    impressions: '',
    clicks: '',
    leads: '',
    orders: '',
    revenue: '',
    entrySource: 'self',
    notes: '',
    ...overrides,
  };
}

function view(overrides: Partial<ChannelResultViewV2> = {}): ChannelResultViewV2 {
  const figures = {
    spend: 10000,
    impressions: null,
    clicks: 400,
    leads: 20,
    orders: 4,
    revenue: 30000,
    ...overrides,
  };
  return {
    id: 'result-1',
    market: 'IN',
    channel_id: 'google_search_ads',
    period: 'month',
    period_start: '2026-08-01',
    currency: 'INR',
    source: 'client_reported',
    notes: null,
    plan_run_id: null,
    updated_at: '2026-09-01T00:00:00.000Z',
    ...overrides,
    spend: figures.spend,
    impressions: figures.impressions,
    clicks: figures.clicks,
    leads: figures.leads,
    orders: figures.orders,
    revenue: figures.revenue,
    metrics: deriveChannelResultMetricsV2(figures),
  };
}

test('a month is recorded from its 1st, from a month or any day in it', () => {
  assert.equal(monthPeriodStartV2('2026-03'), '2026-03-01');
  assert.equal(monthPeriodStartV2('2026-03-17'), '2026-03-01');
  assert.equal(monthPeriodStartFromPartsV2(2026, 3), '2026-03-01');
  assert.equal(monthPeriodStartFromPartsV2('2025', '12'), '2025-12-01');
  assert.equal(monthPeriodStartV2('2026-13'), null);
  assert.equal(monthPeriodStartV2('2026-02-30'), null);
  assert.equal(monthPeriodStartV2('March'), null);
});

test('a week is recorded from its Monday, across month and year ends', () => {
  assert.equal(weekPeriodStartV2('2026-09-13'), '2026-09-07'); // Sunday
  assert.equal(weekPeriodStartV2('2026-09-09'), '2026-09-07'); // Wednesday
  assert.equal(weekPeriodStartV2('2026-09-07'), '2026-09-07'); // Monday
  assert.equal(weekPeriodStartV2('2026-03-01'), '2026-02-23');
  assert.equal(weekPeriodStartV2('2026-01-01'), '2025-12-29');
  assert.equal(weekPeriodStartV2('2026-02-30'), null);
  assert.equal(weekPeriodStartV2(''), null);
});

test('the current period, validity and "not yet begun" follow the backend (UTC)', () => {
  assert.equal(currentPeriodStartV2('month', now), '2026-09-01');
  assert.equal(currentPeriodStartV2('week', now), '2026-09-07');

  assert.equal(isValidPeriodStartV2('month', '2026-09-01'), true);
  assert.equal(isValidPeriodStartV2('month', '2026-09-02'), false);
  assert.equal(isValidPeriodStartV2('week', '2026-09-07'), true);
  assert.equal(isValidPeriodStartV2('week', '2026-09-08'), false);
  assert.equal(isValidPeriodStartV2('week', '7 Sep 2026'), false);

  assert.equal(isFuturePeriodStartV2('2026-09-13', now), false);
  assert.equal(isFuturePeriodStartV2('2026-09-01', now), false);
  assert.equal(isFuturePeriodStartV2('2026-09-14', now), true);
});

test('switching between month and week stays on the same stretch of time', () => {
  assert.equal(convertPeriodStartV2('week', '2026-03-01', now), '2026-02-23');
  assert.equal(convertPeriodStartV2('month', '2026-02-23', now), '2026-02-01');
  assert.equal(convertPeriodStartV2('week', '', now), '2026-09-07');
  assert.equal(convertPeriodStartV2('week', '2026-10-01', now), '2026-09-07');
});

test('period labels are plain words', () => {
  assert.equal(formatPeriodLabelV2('month', '2026-03-01'), 'March 2026');
  assert.equal(formatPeriodLabelV2('week', '2026-03-02'), 'Week of 2 Mar 2026');
  assert.deepEqual(monthPickerYearsV2('2026-09-13'), ['2026', '2025', '2024', '2023', '2022', '2021']);
  assert.deepEqual(monthPickerYearsV2('2026-09-13', '2019').at(-1), '2019');
});

test('figures accept commas and currency signs, and refuse the wrong kind of number', () => {
  assert.deepEqual(parseFigureV2('12,500', 'money'), { value: 12500, error: null });
  assert.deepEqual(parseFigureV2('₹ 1,23,456.5', 'money'), { value: 123456.5, error: null });
  assert.deepEqual(parseFigureV2('', 'count'), { value: null, error: null });
  assert.deepEqual(parseFigureV2('0', 'count'), { value: 0, error: null });
  assert.match(parseFigureV2('12.5', 'count').error ?? '', /whole number/);
  assert.match(parseFigureV2('-5', 'money').error ?? '', /amount/);
  assert.match(parseFigureV2('12.345', 'money').error ?? '', /amount/);
  assert.match(parseFigureV2('2000000000', 'count').error ?? '', /too large/);
});

test('builds the strict body: known keys only, blank figures as null, notes trimmed', () => {
  const built = buildChannelResultPayloadV2(
    formValues({
      currency: 'inr',
      spend: '12,500',
      clicks: '840',
      leads: '32',
      revenue: '₹56,000.50',
      notes: '  Festive push  ',
    }),
    { now },
  );

  assert.equal(built.ok, true);
  assert.ok(built.ok);
  assert.deepEqual(built.payload, {
    market: 'IN',
    channelId: 'google_search_ads',
    period: 'month',
    periodStart: '2026-08-01',
    currency: 'INR',
    spend: 12500,
    impressions: null,
    clicks: 840,
    leads: 32,
    orders: null,
    revenue: 56000.5,
    source: 'client_reported',
    notes: 'Festive push',
  });
  const allowed = new Set([
    'market', 'channelId', 'period', 'periodStart', 'currency', 'spend', 'impressions',
    'clicks', 'leads', 'orders', 'revenue', 'source', 'notes',
  ]);
  for (const key of Object.keys(built.payload)) assert.ok(allowed.has(key), key);
});

test('says where the numbers came from, and who keyed them in', () => {
  const values = formValues({ leads: '3' });
  const sourceOf = (overrides: Partial<ChannelResultFormValuesV2>, enteredBy?: 'client' | 'operator') => {
    const built = buildChannelResultPayloadV2({ ...values, ...overrides }, { now, enteredBy });
    assert.ok(built.ok);
    return built.payload.source;
  };
  assert.equal(sourceOf({}), 'client_reported');
  assert.equal(sourceOf({ entrySource: 'platform' }), 'platform_export');
  assert.equal(sourceOf({}, 'operator'), 'operator_entered');
  assert.equal(sourceOf({ entrySource: 'platform' }, 'operator'), 'platform_export');

  const blankNotes = buildChannelResultPayloadV2({ ...values, notes: '   ' }, { now });
  assert.ok(blankNotes.ok);
  assert.equal(blankNotes.payload.notes, null);
});

test('refuses what the backend would refuse, in plain words', () => {
  const errorsOf = (overrides: Partial<ChannelResultFormValuesV2>) => {
    const built = buildChannelResultPayloadV2(formValues(overrides), { now });
    assert.equal(built.ok, false);
    return built.ok ? {} : built.errors;
  };

  assert.match(errorsOf({}).figures ?? '', /at least one figure/);
  assert.match(errorsOf({ market: '', leads: '1' }).market ?? '', /market/);
  assert.match(errorsOf({ channelId: '', leads: '1' }).channelId ?? '', /Choose a channel/);
  assert.match(errorsOf({ channelId: 'Google Ads', leads: '1' }).channelId ?? '', /from the list/);
  assert.match(errorsOf({ periodStart: '2026-08-05', leads: '1' }).periodStart ?? '', /1st/);
  assert.match(
    errorsOf({ period: 'week', periodStart: '2026-09-08', leads: '1' }).periodStart ?? '',
    /Monday/,
  );
  assert.match(
    errorsOf({ period: 'week', periodStart: '2026-09-14', leads: '1' }).periodStart ?? '',
    /already started/,
  );
  assert.match(errorsOf({ currency: 'RUPEES', leads: '1' }).currency ?? '', /three-letter/);
  assert.match(errorsOf({ notes: 'x'.repeat(2001), leads: '1' }).notes ?? '', /2,000/);

  // A figure typed wrongly is reported on that figure, not as "no figures".
  const wrongFigure = errorsOf({ leads: '3.5' });
  assert.match(wrongFigure.leads ?? '', /whole number/);
  assert.equal(wrongFigure.figures, undefined);
});

test('markets come from the campaign as codes, whether typed as codes or names', () => {
  assert.equal(normalizeMarketCodeV2('India'), 'IN');
  assert.equal(normalizeMarketCodeV2(' in '), 'IN');
  assert.equal(normalizeMarketCodeV2('UK'), 'GB');
  assert.equal(normalizeMarketCodeV2('United States of America'), 'US');
  assert.equal(normalizeMarketCodeV2('Atlantis'), null);
  assert.equal(normalizeMarketCodeV2(null), null);

  assert.deepEqual(
    campaignMarketCodesV2({ v2PrimaryMarket: 'India', v2TargetMarkets: ['India', 'UAE', 'Mars Colony'] }),
    ['IN', 'AE'],
  );
  assert.deepEqual(campaignMarketCodesV2({ v2PrimaryMarket: null }), []);
  assert.deepEqual(
    buildMarketOptionsV2(['AE', 'IN']).slice(0, 3).map((option) => option.code),
    ['AE', 'IN', 'US'],
  );

  assert.equal(defaultCurrencyForMarketV2('IN'), 'INR');
  assert.equal(defaultCurrencyForMarketV2('US'), 'USD');
  assert.equal(defaultCurrencyForMarketV2(null), 'USD');
  assert.equal(emptyChannelResultFormValuesV2({ market: 'IN' }, now).currency, 'INR');
  assert.equal(emptyChannelResultFormValuesV2({}, now).periodStart, '2026-09-01');
});

test('channels show their names and send registry ids, with "Other" always last', () => {
  assert.equal(channelLabelV2('google_search_ads'), 'Google Search Ads');
  assert.equal(channelLabelV2('other'), 'Other');
  assert.equal(channelLabelV2('tiktok_ads'), 'Tiktok ads');

  const choices = buildChannelChoicesV2(['seo', 'tiktok_ads', 'seo', 'other']);
  assert.deepEqual(choices.reported.map((option) => option.id), ['seo', 'tiktok_ads']);
  assert.equal(choices.all.at(-1)?.id, 'other');
  assert.equal(choices.all.some((option) => option.id === 'seo'), false);
  const ids = [...choices.reported, ...choices.all].map((option) => option.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('an empty value shows as a dash, never as 0; a real 0 still shows', () => {
  assert.equal(formatMoneyV2(null, 'INR'), EMPTY_VALUE_V2);
  assert.equal(formatMoneyV2(undefined, 'INR'), EMPTY_VALUE_V2);
  assert.equal(formatMoneyV2(0, 'INR'), '₹0');
  assert.equal(formatMoneyV2(123456, 'INR'), '₹1,23,456');
  assert.equal(formatMoneyV2(250.5, 'USD'), '$250.50');
  assert.equal(formatMoneyV2(10, 'AB1'), 'AB1 10');
  assert.equal(formatCountV2(null), EMPTY_VALUE_V2);
  assert.equal(formatCountV2(0), '0');
  assert.equal(formatCountV2(1234567), '1,234,567');
  assert.equal(formatReturnOnSpendV2(null), EMPTY_VALUE_V2);
  assert.equal(formatReturnOnSpendV2(3.254), '3.25x');
});

test('a saved result goes back into the form and re-submits the same period', () => {
  const saved = view({ source: 'platform_export', notes: 'Sale week' });
  const values = resultToFormValuesV2(saved);

  assert.equal(values.entrySource, 'platform');
  assert.equal(values.impressions, '');
  assert.equal(values.spend, '10000');

  const built = buildChannelResultPayloadV2(values, { now });
  assert.ok(built.ok);
  assert.equal(built.payload.periodStart, '2026-08-01');
  assert.equal(built.payload.impressions, null);
  assert.equal(built.payload.revenue, 30000);
  assert.equal(built.payload.source, 'platform_export');

  assert.equal(findReportedPeriodV2([saved], values)?.id, 'result-1');
  assert.equal(findReportedPeriodV2([saved], { ...values, periodStart: '2026-07-01' }), null);
});

test('server errors read as sentences, never as codes', () => {
  assert.match(
    describeChannelResultErrorV2({ status: 400, message: 'INVALID_CHANNEL_RESULT_V2' }),
    /could not be saved/,
  );
  assert.match(
    describeChannelResultErrorV2({ status: 400, message: 'channel result v2 validation failed: spend x' }),
    /could not be saved/,
  );
  assert.equal(
    describeChannelResultErrorV2({ status: 400, message: 'Results can only be reported for a period that has begun' }),
    'Results can only be reported for a period that has begun',
  );
  assert.match(describeChannelResultErrorV2({ status: 403 }), /access/);
  assert.match(describeChannelResultErrorV2({ status: 404 }), /couldn't find/);
  assert.match(describeChannelResultErrorV2({ status: 503 }), /our side/);
  assert.match(describeChannelResultErrorV2({ kind: 'Network', message: 'Failed to fetch' }), /connection/);
});

test('totals keep unreported figures empty and never add currencies together', () => {
  const summaries = summarizeChannelResultsV2([
    view({ id: 'a', period_start: '2026-08-01', spend: 10000, leads: 20, orders: 4, revenue: 30000 }),
    view({ id: 'b', period_start: '2026-07-01', spend: 5000, leads: null, orders: 1, revenue: null }),
    view({ id: 'c', market: 'US', currency: 'USD', spend: 200, leads: null, orders: null, revenue: null, clicks: null }),
  ]);

  assert.equal(summaries.length, 2);
  const india = summaries.find((summary) => summary.currency === 'INR');
  const us = summaries.find((summary) => summary.currency === 'USD');
  assert.ok(india && us);

  assert.equal(india.periods_reported, 2);
  assert.equal(india.first_period_start, '2026-07-01');
  assert.equal(india.last_period_start, '2026-08-01');
  assert.equal(india.totals.spend, 15000);
  assert.equal(india.totals.leads, 20);
  assert.equal(india.totals.revenue, 30000);
  assert.equal(india.metrics.cost_per_order, 3000);
  assert.equal(india.metrics.return_on_spend, 2);

  assert.equal(us.totals.spend, 200);
  assert.equal(us.totals.leads, null);
  assert.equal(us.metrics.cost_per_lead, null);
  assert.equal(formatMoneyV2(us.metrics.cost_per_lead, us.currency), EMPTY_VALUE_V2);
});
