import { z } from 'zod';
import {
  BUSINESS_MODEL_VALUES,
} from '@/shared/types/campaign';
import {
  AVG_CUSTOMER_RETENTION_VALUES,
  CLOSE_RATE_BAND_VALUES,
  DEAL_VALUE_BAND_VALUES,
  DIGITAL_PRESENCE_LINK_TYPE_VALUES,
  EMAIL_LIST_SIZE_VALUES,
  GROSS_MARGIN_BAND_VALUES,
  MONTHLY_MARKETING_SPEND_VALUES,
  MONTHLY_REVENUE_VALUES,
  MONTHLY_WEBSITE_TRAFFIC_VALUES,
  REPEAT_PURCHASE_FREQUENCY_VALUES,
  SALES_CHANNEL_VALUES,
  SOCIAL_PLATFORM_VALUES,
} from '@/shared/types/wizard';

const tagItemSchema = z.string().trim().min(1, 'Value cannot be empty').max(200, 'Keep each item under 200 characters');

const rankedSalesChannelSchema = z.object({
  channel: z.enum(SALES_CHANNEL_VALUES, {
    required_error: 'Select a sales channel',
  }),
  rank: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : typeof value === 'number' ? value : Number(value)),
    z.number().int('Rank must be a whole number').positive('Rank must be positive'),
  ),
  customName: z.string().trim().max(120, 'Keep custom names under 120 characters').optional().or(z.literal('')),
});

const socialHandleSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORM_VALUES, {
    required_error: 'Select a platform',
  }),
  handle: z.string().trim().min(1, 'Handle is required').max(120, 'Keep handles under 120 characters'),
});

const digitalPresenceLinkSchema = z.object({
  type: z.enum(DIGITAL_PRESENCE_LINK_TYPE_VALUES, {
    required_error: 'Select a type',
  }),
  url: z.string().trim().min(1, 'URL is required').max(500, 'Keep URLs under 500 characters').url('Please enter a valid URL'),
  label: z.string().trim().max(120, 'Keep labels under 120 characters').optional().or(z.literal('')),
});

const currentMarketingActivitySchema = z.object({
  channel: z.string().trim().min(1, 'Channel is required').max(120, 'Keep channel under 120 characters'),
  status: z.string().trim().min(1, 'Status is required').max(80, 'Keep status under 80 characters'),
  workingAssessment: z.string().trim().max(80, 'Keep assessment under 80 characters').optional().or(z.literal('')),
  evidence: z.string().trim().max(500, 'Keep evidence under 500 characters').optional().or(z.literal('')),
  monthlySpend: z.string().trim().max(120, 'Keep monthly spend under 120 characters').optional().or(z.literal('')),
  timeRunning: z.string().trim().max(120, 'Keep time running under 120 characters').optional().or(z.literal('')),
  reasonStopped: z.string().trim().max(500, 'Keep reason under 500 characters').optional().or(z.literal('')),
});

const googleAnalyticsConnectedSchema = z.union([
  z.boolean(),
  z.literal('unknown'),
  z.literal(''),
]);

const monthlyRevenueSchema = z
  .union([
    z.enum(MONTHLY_REVENUE_VALUES),
    z.string().trim().max(120, 'Keep monthly revenue under 120 characters'),
  ])
  .optional()
  .or(z.literal(''));

export const step1Schema = z.object({
  title: z.string().trim().max(120, 'Keep the title under 120 characters').optional().or(z.literal('')),
  marketingTargetType: z.string().trim().min(1, 'Select what is being marketed'),
  focusName: z.string().trim().min(1, 'Focus name is required').max(240, 'Keep the focus name under 240 characters'),
  sourceType: z.string().trim().min(1, 'Select a source type'),
  primaryUrl: z.string().trim().max(500, 'Keep the URL under 500 characters').optional().or(z.literal('')),
  targetMarkets: z.array(tagItemSchema).min(1, 'Add at least one target market').max(4, 'Add up to 4 target markets').default([]),
  primaryMarket: z.string().trim().max(120, 'Keep the primary market under 120 characters').optional().or(z.literal('')),
  marketScope: z.string().trim().min(1, 'Market scope is required'),
  operationalLocations: z.array(tagItemSchema).default([]),
  regionalLanguageExpansionEnabled: z.boolean().default(false),
  regionalLanguages: z.array(tagItemSchema).default([]),
  marketLocation: z.string().trim().max(300, 'Keep the location under 300 characters').optional().or(z.literal('')),
}).superRefine((value, ctx) => {
  const sourceType = value.sourceType;
  const primaryUrl = value.primaryUrl?.trim() ?? '';

  if (sourceType === 'manual_only' && primaryUrl.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['primaryUrl'],
      message: 'Primary URL must be empty for manual-only source.',
    });
  }

  if (sourceType !== 'manual_only' && primaryUrl.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['primaryUrl'],
      message: 'Primary URL is required unless source type is manual-only.',
    });
  }

  if (value.targetMarkets.length > 1) {
    const primaryMarket = value.primaryMarket?.trim() ?? '';
    if (!primaryMarket) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryMarket'],
        message: 'Primary market is required when multiple target markets are set.',
      });
    } else if (!value.targetMarkets.includes(primaryMarket)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['primaryMarket'],
        message: 'Primary market must be one of the target markets.',
      });
    }
  }

  const normalizedScope = value.marketScope.trim().toLowerCase();

  if ((normalizedScope === 'local' || normalizedScope === 'regional') && value.operationalLocations.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['operationalLocations'],
      message: 'Operational locations are required for local or regional scope.',
    });
  }

  if (value.regionalLanguageExpansionEnabled && value.regionalLanguages.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['regionalLanguages'],
      message: 'Add at least one regional language when expansion is enabled.',
    });
  }
});

export const step2Schema = z.object({
  businessName: z.string().trim().max(240, 'Keep the business name under 240 characters').optional().or(z.literal('')),
  industryCategory: z.string().trim().min(1, 'Industry category is required'),
  businessType: z.string().trim().max(160, 'Keep the business type under 160 characters').optional().or(z.literal('')),
  businessModel: z.enum(BUSINESS_MODEL_VALUES, {
    required_error: 'Business model is required',
  }),
  audienceModel: z.string().trim().min(1, 'Audience model is required'),
  lifecycleStage: z.string().trim().min(1, 'Lifecycle stage is required'),
  businessDescription: z.string().trim().min(1, 'Business description is required').max(1000, 'Keep the description under 1000 characters'),
  productCategory: z.string().trim().min(1, 'Product category is required').max(160, 'Keep the category under 160 characters'),
  productOrService: z.array(tagItemSchema).min(1, 'Add at least one product or service').max(10, 'Add up to 10 items').default([]),
  offerSummary: z.string().trim().max(500, 'Keep the offer summary under 500 characters').optional().or(z.literal('')),
  priceRange: z.string().trim().min(1, 'Price range is required').max(120, 'Keep the price range under 120 characters'),
  differentiators: z.array(tagItemSchema).max(10, 'Add up to 10 differentiators').default([]),
  trustSignals: z.array(tagItemSchema).max(20, 'Add up to 20 trust signals').default([]),
  sensitiveCategoryFlags: z.array(tagItemSchema).min(1, 'Add at least one sensitive category flag').max(20, 'Add up to 20 flags').default([]),
  complianceSensitiveClaims: z.array(tagItemSchema).max(20, 'Add up to 20 compliance claims').default([]),
  salesChannels: z.array(rankedSalesChannelSchema).default([]),
  primaryConversionPath: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  socialHandles: z.array(socialHandleSchema).default([]),
  digitalPresenceLinks: z.array(digitalPresenceLinkSchema).default([]),
}).superRefine((value, ctx) => {
  const regulatedFlags = [
    'health',
    'wellness',
    'supplement',
    'finance',
    'financial',
    'legal',
    'education',
    'security',
    'compliance',
    'alcohol',
    'tobacco',
    'restricted',
  ];
  const requiresComplianceClaims = value.sensitiveCategoryFlags.some((flag) => {
    const normalized = flag.trim().toLowerCase();
    return regulatedFlags.some((keyword) => normalized.includes(keyword));
  });

  if (requiresComplianceClaims && value.complianceSensitiveClaims.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['complianceSensitiveClaims'],
      message: 'Add compliance-sensitive claims for the selected regulated flag(s).',
    });
  }

  if (value.salesChannels.length === 0) {
    return;
  }

  const ranks = value.salesChannels.map((item) => item.rank);
  const uniqueRanks = new Set(ranks).size === ranks.length;
  const expectedRanks = Array.from({ length: value.salesChannels.length }, (_, index) => index + 1);
  const sequential = expectedRanks.every((rank) => ranks.includes(rank));
  const uniqueChannels = new Set(value.salesChannels.map((item) => `${item.channel}:${item.customName?.trim() || ''}`)).size === value.salesChannels.length;

  if (!uniqueRanks || !sequential) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['salesChannels'],
      message: 'Ranks must be unique and sequential starting at 1.',
    });
  }

  if (!uniqueChannels) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['salesChannels'],
      message: 'Duplicate sales channels are not allowed.',
    });
  }
});

export const step3Schema = z.object({
  primaryTargetSegment: z.string().trim().min(1, 'Primary target segment is required').max(160, 'Keep this under 160 characters'),
  targetPersona: z.string().trim().min(1, 'Target persona is required').max(500, 'Keep the target persona under 500 characters'),
  targetAudience: z.string().trim().max(700, 'Keep the target audience under 700 characters').optional().or(z.literal('')),
  audienceSegments: z.array(tagItemSchema).max(10, 'Add up to 10 audience segments').default([]),
  language: z.string().trim().min(1, 'Language is required'),
  reportLanguage: z.string().trim().max(80, 'Keep report language under 80 characters').optional().or(z.literal('')),
  painPoints: z.array(tagItemSchema).min(1, 'Add at least one pain point').default([]),
  desiredOutcome: z.string().trim().min(1, 'Desired outcome is required').max(300, 'Keep the desired outcome under 300 characters'),
  decisionProcess: z.string().trim().min(1, 'Decision process is required').max(500, 'Keep this under 500 characters'),
  buyerRoles: z.array(tagItemSchema).max(10, 'Add up to 10 buyer roles').default([]),
  constraints: z.array(tagItemSchema).default([]),
  monthlyMarketingSpend: z.enum(MONTHLY_MARKETING_SPEND_VALUES, {
    required_error: 'Monthly marketing spend is required',
  }),
  paidMediaBudgetRange: z.string().trim().min(1, 'Paid media budget range is required').max(120, 'Keep this under 120 characters'),
  primaryGoal: z.string().trim().min(1, 'Primary goal is required'),
  marketingHandler: z.string().trim().min(1, 'Marketing handler is required'),
  contentCapacity: z.string().trim().min(1, 'Content capacity is required'),
  salesCapacity: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  currentMarketingActivity: z.array(currentMarketingActivitySchema).default([]),
  pastMarketing: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
  whatsWorking: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
  biggestFrustration: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
  knownCompetitorStatus: z.string().trim().min(1, 'Known competitor status is required'),
  knownCompetitors: z.array(tagItemSchema).default([]),
  channelsToAvoid: z.array(tagItemSchema).default([]),
  channelsStronglyPreferred: z.array(tagItemSchema).default([]),
  executionConstraints: z.array(tagItemSchema).default([]),
  dataConsentOptIn: z.boolean().default(true),
  monthlyRevenue: monthlyRevenueSchema,
  averageOrderValue: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  averageContractValue: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  grossMarginPercentage: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  // Bands, asked at the end of intake. Deal value and margin carry no opt-out:
  // the free-text fields above shipped `not_sure` on the last run, and the
  // unit economics model is built on exactly these two numbers.
  // Optional in the schema, required when step 6 is submitted. This form backs
  // both step 5 and step 6, so a schema-level requirement on a step 6 field
  // blocks step 5 from saving at all - handleSubmit runs the whole resolver.
  // The check lives in the step 6 handler, beside the rule it replaces.
  dealValueBand: z.enum(DEAL_VALUE_BAND_VALUES).optional(),
  grossMarginBand: z.enum(GROSS_MARGIN_BAND_VALUES).optional(),
  // Optional by design: a pre-CRM client has no honest answer, and the model
  // sweeps this as a sensitivity axis rather than assuming a figure.
  closeRateBand: z.enum(CLOSE_RATE_BAND_VALUES).default('not_tracked'),
  monthlyOrderVolume: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  productCost: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  monthlyOrdersPerSubscriber: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  monthlyChurnRate: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  avgCustomerRetention: z.enum(AVG_CUSTOMER_RETENTION_VALUES).optional().or(z.literal('')),
  repeatPurchaseFrequency: z.enum(REPEAT_PURCHASE_FREQUENCY_VALUES).optional().or(z.literal('')),
  salesCycleLength: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  googleAnalyticsConnected: googleAnalyticsConnectedSchema.default(''),
  monthlyWebsiteTraffic: z.enum(MONTHLY_WEBSITE_TRAFFIC_VALUES).optional().or(z.literal('')),
  emailListSize: z.enum(EMAIL_LIST_SIZE_VALUES).optional().or(z.literal('')),
  additionalContext: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
}).superRefine((value, ctx) => {
  const knownStatus = value.knownCompetitorStatus.trim().toLowerCase();
  if (knownStatus === 'provided' && value.knownCompetitors.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['knownCompetitors'],
      message: 'Add at least one known competitor when status is provided.',
    });
  }
});

export const step4Schema = z.object({
  confirmFocus: z.boolean().optional(),
  confirmBusiness: z.boolean().optional(),
  confirmAudience: z.boolean().optional(),
  confirmGoals: z.boolean().optional(),
  readyToGenerate: z.boolean().optional(),
  dataConsentOptIn: z.boolean().optional(),
});

export type Step1FormData = z.infer<typeof step1Schema>;
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step3FormData = z.infer<typeof step3Schema>;
