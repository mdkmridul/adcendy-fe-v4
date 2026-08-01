import assert from 'node:assert/strict';
import test from 'node:test';
import { campaignFixtureSchema } from '../../e2e/campaign-wizard/campaign-fixture-schema.mjs';

const minimalFixture = {
  fixtureVersion: '1.0',
  fixtureStatus: 'ready',
  slug: 'schema-test',
  displayName: 'Schema Test',
  wizard: {
    step1: {
      marketingTargetType: 'whole_business',
      focusName: 'Schema Test',
      sourceType: 'manual_only',
      targetMarkets: ['IN'],
      primaryMarket: 'IN',
      marketScope: 'national',
    },
    step2: {
      businessName: 'Schema Test',
      industryCategory: 'SaaS',
      businessModel: 'B2B',
      audienceModel: 'single_sided',
      lifecycleStage: 'growth',
      businessDescription: 'A test business description.',
      productCategory: 'Software',
      productsServices: ['Test service'],
      priceRange: 'not_sure',
      sensitiveCategoryFlags: ['none'],
    },
    step3: {
      primaryTargetSegment: 'Test buyers',
      targetPersona: 'A test buyer',
      language: 'english',
      painPoints: ['One', 'Two', 'Three'],
      desiredOutcome: 'A tested outcome',
      decisionProcess: 'A buyer reviews and approves.',
      buyerRoles: ['Buyer'],
    },
    step4: {
      salesChannels: [{ channel: 'direct_sales', rank: 1 }],
      primaryConversionPath: 'book_call',
      trustSignals: ['Verified test signal'],
    },
    step5: {
      primaryGoal: 'lead_generation',
      monthlyMarketingSpend: 'nothing',
      paidMediaBudgetRange: 'not_sure',
      marketingHandler: 'not_sure',
      contentCapacity: 'not_sure',
      salesCapacity: 'not_sure',
      knownCompetitorStatus: 'not_sure',
    },
    step6: {
      averageContractValue: 'not_sure',
    },
    step7: {
      confirmFocus: true,
      confirmBusiness: true,
      confirmAudience: true,
      confirmGoals: true,
      confirmEconomics: true,
      readyToGenerate: true,
      dataConsentOptIn: false,
      privacyProcessingConsent: true,
      aiProcessingConsent: true,
    },
  },
};

test('accepts a complete canonical campaign fixture', () => {
  assert.equal(campaignFixtureSchema.safeParse(minimalFixture).success, true);
});

test('reports unsupported wizard fields before browser execution', () => {
  const invalid = structuredClone(minimalFixture);
  invalid.wizard.step2.unsupportedField = 'must fail';
  const result = campaignFixtureSchema.safeParse(invalid);
  assert.equal(result.success, false);
  assert.ok(
    result.error.issues.some(
      (issue) =>
        issue.code === 'unrecognized_keys' &&
        issue.path.join('.') === 'wizard.step2',
    ),
  );
});

test('reports conditional fixture failures with the field path', () => {
  const invalid = structuredClone(minimalFixture);
  invalid.wizard.step5.salesCapacity = '';
  const result = campaignFixtureSchema.safeParse(invalid);
  assert.equal(result.success, false);
  assert.ok(
    result.error.issues.some(
      (issue) => issue.path.join('.') === 'wizard.step5.salesCapacity',
    ),
  );
});

test('rejects normalized-contract length violations before browser execution', () => {
  const invalid = structuredClone(minimalFixture);
  invalid.wizard.step3.primaryTargetSegment = 'x'.repeat(161);
  const result = campaignFixtureSchema.safeParse(invalid);
  assert.equal(result.success, false);
  assert.ok(
    result.error.issues.some(
      (issue) =>
        issue.code === 'too_big' &&
        issue.path.join('.') === 'wizard.step3.primaryTargetSegment',
    ),
  );
});
