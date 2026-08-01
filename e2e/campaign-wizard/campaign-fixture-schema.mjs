import { z } from 'zod';

const nonEmpty = z.string().trim().min(1);
const boundedText = (maximum) => nonEmpty.max(maximum);
const optionalTextMax = (maximum) => z.string().trim().max(maximum).default('');
const boundedStringList = (maximum) => z.array(boundedText(maximum));

const step1Schema = z
  .object({
    title: optionalTextMax(120),
    marketingTargetType: z.enum([
      'whole_business',
      'product_or_service',
      'launch',
      'market_expansion',
      'specific_audience',
      'other',
    ]),
    focusName: boundedText(240),
    sourceType: z.enum(['website', 'digital_presence_only', 'manual_only']),
    primaryUrl: optionalTextMax(500),
    targetMarkets: boundedStringList(12).min(1).max(4),
    primaryMarket: optionalTextMax(12),
    marketScope: z.enum(['local', 'regional', 'national', 'international', 'global']),
    operationalLocations: boundedStringList(160).default([]),
    regionalLanguageExpansionEnabled: z.boolean().default(false),
    regionalLanguages: boundedStringList(40).default([]),
    marketLocation: optionalTextMax(300),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.sourceType === 'manual_only' && value.primaryUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryUrl'],
        message: 'primaryUrl must be empty when sourceType is manual_only',
      });
    }
    if (value.sourceType !== 'manual_only' && !value.primaryUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryUrl'],
        message: 'primaryUrl is required unless sourceType is manual_only',
      });
    }
    if (value.primaryUrl) {
      const parsed = z.string().url().safeParse(value.primaryUrl);
      if (!parsed.success) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['primaryUrl'],
          message: 'primaryUrl must be a valid URL',
        });
      }
    }
    if (value.targetMarkets.length > 1 && !value.primaryMarket) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryMarket'],
        message: 'primaryMarket is required for multiple target markets',
      });
    }
    if (value.primaryMarket && !value.targetMarkets.includes(value.primaryMarket)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryMarket'],
        message: 'primaryMarket must be included in targetMarkets',
      });
    }
    if (['local', 'regional'].includes(value.marketScope) && value.operationalLocations.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['operationalLocations'],
        message: 'operationalLocations is required for local/regional scope',
      });
    }
    if (value.regionalLanguageExpansionEnabled && value.regionalLanguages.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['regionalLanguages'],
        message: 'regionalLanguages is required when regional expansion is enabled',
      });
    }
  });

const step2Schema = z
  .object({
    businessName: optionalTextMax(240),
    industryCategory: boundedText(200),
    businessModel: z.enum(['B2B', 'B2C', 'D2C', 'MARKETPLACE', 'HYBRID']),
    audienceModel: z.enum(['single_sided', 'b2b2c', 'marketplace_platform', 'multi_sided', 'not_sure']),
    lifecycleStage: z.enum(['pre_launch', 'launch', 'growth', 'scaling', 'mature']),
    businessDescription: boundedText(1000),
    productCategory: boundedText(160),
    productsServices: boundedStringList(200).min(1).max(10),
    offerSummary: optionalTextMax(500),
    priceRange: boundedText(120),
    differentiators: boundedStringList(200).max(10).default([]),
    sensitiveCategoryFlags: boundedStringList(120).min(1).max(20),
    complianceSensitiveClaims: boundedStringList(200).max(20).default([]),
  })
  .strict();

const step3Schema = z
  .object({
    primaryTargetSegment: boundedText(160),
    targetPersona: boundedText(500),
    targetAudience: optionalTextMax(700),
    audienceSegments: boundedStringList(200).max(10).default([]),
    language: z.enum(['english', 'hindi', 'regional_other', 'mixed', 'not_sure']),
    reportLanguage: z.enum(['', 'english', 'hindi', 'regional_other']).default(''),
    painPoints: boundedStringList(200).min(1),
    desiredOutcome: boundedText(300),
    decisionProcess: boundedText(500),
    buyerRoles: boundedStringList(120).max(10).default([]),
  })
  .strict();

const salesChannelSchema = z
  .object({
    channel: z.enum([
      'own_website',
      'amazon',
      'flipkart',
      'instagram',
      'whatsapp',
      'retail_store',
      'justdial',
      'google_business',
      'facebook',
      'other_marketplace',
      'direct_sales',
      'other',
    ]),
    rank: z.number().int().positive(),
    customName: optionalTextMax(120),
  })
  .strict();

const socialHandleSchema = z
  .object({
    platform: z.enum(['instagram', 'facebook', 'youtube', 'twitter', 'linkedin']),
    handle: boundedText(120),
  })
  .strict();

const digitalPresenceSchema = z
  .object({
    type: z.enum([
      'instagram',
      'facebook',
      'youtube',
      'twitter',
      'linkedin',
      'amazon',
      'flipkart',
      'google_business',
      'whatsapp',
      'other_marketplace',
      'other',
    ]),
    url: z.string().trim().url().max(500),
    label: optionalTextMax(120),
  })
  .strict();

const step4Schema = z
  .object({
    salesChannels: z.array(salesChannelSchema).min(1),
    primaryConversionPath: z.enum([
      'buy_online',
      'book_demo',
      'book_call',
      'whatsapp',
      'retail_visit',
      'app_signup',
      'other',
    ]),
    trustSignals: boundedStringList(200).max(20).default([]),
    socialHandles: z.array(socialHandleSchema).default([]),
    digitalPresenceLinks: z.array(digitalPresenceSchema).default([]),
    googleAnalyticsConnected: z.union([z.boolean(), z.literal('unknown'), z.literal('')]).default(''),
    monthlyWebsiteTraffic: z
      .enum(['', 'under_500', '500_2000', '2000_10000', '10000_50000', '50000_plus'])
      .default(''),
    emailListSize: z.enum(['', 'none', 'under_500', '500_2000', '2000_10000', '10000_plus']).default(''),
  })
  .strict();

const activitySchema = z
  .object({
    channel: boundedText(120),
    status: z.enum(['active', 'paused', 'discontinued']),
    workingAssessment: z.enum(['', 'clearly_working', 'unclear', 'not_working', 'not_sure']).default(''),
    evidence: optionalTextMax(500),
    monthlySpend: optionalTextMax(120),
    timeRunning: optionalTextMax(120),
    reasonStopped: optionalTextMax(500),
  })
  .strict();

const step5Schema = z
  .object({
    primaryGoal: z.enum([
      'revenue_growth',
      'lead_generation',
      'awareness',
      'launch_readiness',
      'retention',
      'market_expansion',
      'other',
    ]),
    monthlyMarketingSpend: z.enum(['nothing', 'under_5k', '5k_15k', '15k_50k', '50k_plus']),
    paidMediaBudgetRange: boundedText(120),
    marketingHandler: z.enum(['founder_led', 'internal_marketer', 'agency', 'in_house_team', 'not_sure']),
    contentCapacity: z.enum(['none', 'low', 'medium', 'high', 'not_sure']),
    salesCapacity: optionalTextMax(120),
    currentMarketingActivity: z.array(activitySchema).default([]),
    pastMarketing: optionalTextMax(1200),
    whatsWorking: optionalTextMax(1200),
    biggestFrustration: optionalTextMax(1200),
    knownCompetitorStatus: z.enum(['provided', 'none_known', 'not_sure']),
    knownCompetitors: boundedStringList(200).default([]),
    constraints: boundedStringList(200).default([]),
    channelsToAvoid: boundedStringList(100).default([]),
    channelsStronglyPreferred: boundedStringList(100).default([]),
    executionConstraints: boundedStringList(200).default([]),
    additionalContext: optionalTextMax(1200),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.knownCompetitorStatus === 'provided' && value.knownCompetitors.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['knownCompetitors'],
        message: 'knownCompetitors is required when knownCompetitorStatus is provided',
      });
    }
  });

const step6Schema = z
  .object({
    averageOrderValue: optionalTextMax(120),
    averageContractValue: optionalTextMax(120),
    grossMarginPercentage: optionalTextMax(120),
    monthlyRevenue: optionalTextMax(120),
    monthlyOrderVolume: optionalTextMax(120),
    productCost: optionalTextMax(120),
    monthlyOrdersPerSubscriber: optionalTextMax(120),
    monthlyChurnRate: optionalTextMax(120),
    avgCustomerRetention: z.enum(['', 'one_time_buyers', 'some_repeat', 'mostly_repeat', 'subscription']).default(''),
    repeatPurchaseFrequency: z.enum(['', 'never', 'every_few_months', 'monthly', 'weekly']).default(''),
    salesCycleLength: optionalTextMax(120),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.averageOrderValue && !value.averageContractValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['averageOrderValue'],
        message: 'Provide averageOrderValue or averageContractValue (use not_sure when unknown)',
      });
    }
  });

const step7Schema = z
  .object({
    confirmFocus: z.literal(true),
    confirmBusiness: z.literal(true),
    confirmAudience: z.literal(true),
    confirmGoals: z.literal(true),
    confirmEconomics: z.literal(true),
    readyToGenerate: z.literal(true),
    dataConsentOptIn: z.boolean(),
    privacyProcessingConsent: z.literal(true),
    aiProcessingConsent: z.literal(true),
  })
  .strict();

export const campaignFixtureSchema = z
  .object({
    fixtureVersion: z.literal('1.0'),
    fixtureStatus: z.enum(['placeholder', 'ready']),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    displayName: nonEmpty,
    wizard: z
      .object({
        step1: step1Schema,
        step2: step2Schema,
        step3: step3Schema,
        step4: step4Schema,
        step5: step5Schema,
        step6: step6Schema,
        step7: step7Schema,
      })
      .strict(),
  })
  .strict()
  .superRefine((fixture, context) => {
    const { step1, step2, step3, step4, step5 } = fixture.wizard;
    if (step1.marketingTargetType !== 'whole_business' && !step2.businessName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step2', 'businessName'],
        message: 'businessName is required when the focus is not whole_business',
      });
    }
    if (
      ['b2b2c', 'marketplace_platform', 'multi_sided'].includes(step2.audienceModel) &&
      step3.audienceSegments.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step3', 'audienceSegments'],
        message: 'audienceSegments is required for multi-sided audience models',
      });
    }
    const committeeLike = /\b(committee|procurement|finance|approver|stakeholder)\b/i.test(step3.decisionProcess);
    if (
      (step2.businessModel === 'B2B' || committeeLike) &&
      step3.buyerRoles.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step3', 'buyerRoles'],
        message: 'buyerRoles is required for B2B or committee-like decisions',
      });
    }
    if (
      (step2.businessModel === 'B2B' ||
        ['book_demo', 'book_call'].includes(step4.primaryConversionPath)) &&
      !step5.salesCapacity
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step5', 'salesCapacity'],
        message: 'salesCapacity is required for sales-led contexts',
      });
    }
    if (step1.sourceType === 'manual_only' && step4.trustSignals.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step4', 'trustSignals'],
        message: 'trustSignals is required for manual_only source',
      });
    }
    const ranks = step4.salesChannels.map((channel) => channel.rank);
    const expected = step4.salesChannels.map((_, index) => index + 1);
    if (
      new Set(ranks).size !== ranks.length ||
      expected.some((rank) => !ranks.includes(rank))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['wizard', 'step4', 'salesChannels'],
        message: 'sales channel ranks must be unique and sequential from 1',
      });
    }
  });

export function formatFixtureIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    code: issue.code,
    message: issue.message,
  }));
}
