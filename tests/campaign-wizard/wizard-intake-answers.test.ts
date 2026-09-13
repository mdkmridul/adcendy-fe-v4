import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CREATIVE_CAPABILITY_VALUES,
  DELIVERY_DEADLINE_VALUES,
  MARKETING_HOURS_PER_WEEK_VALUES,
  MONTHLY_MARKETING_SPEND_LABELS,
  MONTHLY_MARKETING_SPEND_VALUES,
  PAID_MEDIA_BUDGET_RANGE_LABELS,
  PAID_MEDIA_BUDGET_RANGE_VALUES,
  PAYBACK_WINDOW_VALUES,
  formatCreativeCapabilities,
  formatDeliveryDeadline,
  formatMarketingHoursPerWeek,
  formatPaidMediaBudgetRange,
  formatPaybackWindow,
  normalizeCreativeCapabilities,
  toggleCreativeCapability,
} from '../../shared/types/wizard.ts';

// Wizard v2.1 intake answers. The backend step schemas are strict and these
// are the option values GET /api/v2/wizard/options lists, verbatim.

test('option values match the backend wizard contract exactly', () => {
  assert.deepEqual([...MARKETING_HOURS_PER_WEEK_VALUES], [
    'underFive',
    'fiveToTen',
    'tenToTwenty',
    'twentyToForty',
    'fortyPlus',
    'notSure',
  ]);
  assert.deepEqual([...CREATIVE_CAPABILITY_VALUES], [
    'video',
    'photography',
    'copywriting',
    'design',
    'none',
  ]);
  assert.deepEqual([...DELIVERY_DEADLINE_VALUES], [
    'withinOneMonth',
    'withinThreeMonths',
    'withinSixMonths',
    'noFixedDeadline',
    'notSure',
  ]);
  assert.deepEqual([...PAYBACK_WINDOW_VALUES], [
    'firstOrder',
    'withinThreeMonths',
    'withinSixMonths',
    'withinTwelveMonths',
    'longerThanTwelveMonths',
    'notSure',
  ]);
  assert.deepEqual([...PAID_MEDIA_BUDGET_RANGE_VALUES], [...MONTHLY_MARKETING_SPEND_VALUES, 'not_sure']);
});

test('the paid media budget reads with the monthly spend labels, plus not sure', () => {
  for (const value of MONTHLY_MARKETING_SPEND_VALUES) {
    assert.equal(PAID_MEDIA_BUDGET_RANGE_LABELS[value], MONTHLY_MARKETING_SPEND_LABELS[value]);
  }
  assert.equal(formatPaidMediaBudgetRange('5k_15k'), 'INR 5,000 to INR 15,000');
  assert.equal(formatPaidMediaBudgetRange('not_sure'), 'Not sure');
});

test('a paid media budget typed as free text before the dropdown is shown as typed', () => {
  assert.equal(formatPaidMediaBudgetRange('around INR 8k a month'), 'around INR 8k a month');
});

test('selecting "None of these" clears the others, and any other choice clears it', () => {
  assert.deepEqual(toggleCreativeCapability(['video', 'design'], 'none'), ['none']);
  assert.deepEqual(toggleCreativeCapability(['none'], 'video'), ['video']);
  assert.deepEqual(toggleCreativeCapability(['video'], 'design'), ['video', 'design']);
  assert.deepEqual(toggleCreativeCapability(['video', 'design'], 'video'), ['design']);
  assert.deepEqual(toggleCreativeCapability(['none'], 'none'), []);
});

test('creative capabilities are normalized the way the backend reads them', () => {
  assert.deepEqual(normalizeCreativeCapabilities(['video', 'video', ' design ']), ['video', 'design']);
  assert.deepEqual(normalizeCreativeCapabilities(['none', 'video']), ['video']);
  assert.deepEqual(normalizeCreativeCapabilities(['none']), ['none']);
  assert.deepEqual(normalizeCreativeCapabilities(['Video', 'drone_footage', 42]), []);
  assert.deepEqual(normalizeCreativeCapabilities('video'), []);
});

test('review labels are plain language', () => {
  assert.equal(formatMarketingHoursPerWeek('fortyPlus'), '40+ hours (full-time or more)');
  assert.equal(formatDeliveryDeadline('withinThreeMonths'), 'Within 3 months');
  assert.equal(formatPaybackWindow('firstOrder'), 'On the first order');
  assert.equal(formatCreativeCapabilities(['video', 'copywriting']), 'Video, Copywriting');
  assert.equal(formatCreativeCapabilities(['none']), 'None of these');
  assert.equal(formatCreativeCapabilities([]), null);
  assert.equal(formatPaybackWindow(undefined), null);
});
