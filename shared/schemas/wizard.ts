import { z } from 'zod';
import {
  BUSINESS_MODEL_VALUES,
  BUSINESS_TYPE_VALUES,
  MARKET_SCOPE_VALUES,
} from '@/shared/types/campaign';
import {
  AVG_CUSTOMER_RETENTION_VALUES,
  DIGITAL_PRESENCE_LINK_TYPE_VALUES,
  EMAIL_LIST_SIZE_VALUES,
  MARKETING_HANDLER_VALUES,
  MARKETING_TARGET_TYPE_VALUES,
  MONTHLY_MARKETING_SPEND_VALUES,
  MONTHLY_REVENUE_VALUES,
  MONTHLY_WEBSITE_TRAFFIC_VALUES,
  PRIMARY_GOAL_VALUES,
  REPEAT_PURCHASE_FREQUENCY_VALUES,
  SALES_CHANNEL_VALUES,
  SOCIAL_PLATFORM_VALUES,
  SOURCE_TYPE_VALUES,
} from '@/shared/types/wizard';

const optionalPositiveIntegerSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    return typeof value === 'number' ? value : Number(value);
  },
  z.number().int('Please enter a whole number').positive('Please enter a positive number').optional(),
);

const optionalPositiveNumberSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    return typeof value === 'number' ? value : Number(value);
  },
  z.number().positive('Please enter a positive number').optional(),
);

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

const monthlyRevenueSchema = z
  .union([
    z.enum(MONTHLY_REVENUE_VALUES),
    z.string().trim().max(120, 'Keep monthly revenue under 120 characters'),
  ])
  .optional()
  .or(z.literal(''));

export const step1Schema = z.object({
  title: z.string().trim().min(1, 'Campaign title is required').max(120, 'Keep the title under 120 characters'),
  marketingTargetType: z.enum(MARKETING_TARGET_TYPE_VALUES, {
    required_error: 'Select what is being marketed',
  }),
  focusName: z.string().trim().min(1, 'Focus name is required').max(240, 'Keep the focus name under 240 characters'),
  sourceType: z.enum(SOURCE_TYPE_VALUES, {
    required_error: 'Select a source type',
  }),
  primaryUrl: z.string().trim().max(500, 'Keep the URL under 500 characters').optional().or(z.literal('')),
  marketLocation: z.string().trim().min(1, 'Market location is required').max(300, 'Keep the location under 300 characters'),
});

export const step2Schema = z.object({
  businessType: z.enum(BUSINESS_TYPE_VALUES, {
    required_error: 'Business type is required',
  }),
  businessModel: z.enum(BUSINESS_MODEL_VALUES, {
    required_error: 'Business model is required',
  }),
  marketScope: z.enum(MARKET_SCOPE_VALUES, {
    required_error: 'Market scope is required',
  }),
  businessDescription: z.string().trim().min(1, 'Business description is required').max(1000, 'Keep the description under 1000 characters'),
  productCategory: z.string().trim().min(1, 'Product category is required').max(160, 'Keep the category under 160 characters'),
  productOrService: z.string().trim().min(1, 'Product or service is required').max(240, 'Keep this under 240 characters'),
  offerSummary: z.string().trim().max(500, 'Keep the offer summary under 500 characters').optional().or(z.literal('')),
  priceRange: z.string().trim().min(1, 'Price range is required').max(120, 'Keep the price range under 120 characters'),
  differentiators: z.array(tagItemSchema).max(10, 'Add up to 10 differentiators').default([]),
  salesChannels: z.array(rankedSalesChannelSchema).min(1, 'Add at least one sales channel'),
  socialHandles: z.array(socialHandleSchema).default([]),
  digitalPresenceLinks: z.array(digitalPresenceLinkSchema).default([]),
}).superRefine((value, ctx) => {
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
  targetPersona: z.string().trim().min(1, 'Target persona is required').max(700, 'Keep the target persona under 700 characters'),
  targetAudience: z.string().trim().max(700, 'Keep the target audience under 700 characters').optional().or(z.literal('')),
  language: z.string().trim().min(1, 'Language is required').max(60, 'Keep the language under 60 characters'),
  painPoints: z.array(tagItemSchema).min(1, 'Add at least one pain point').default([]),
  desiredOutcome: z.string().trim().min(1, 'Desired outcome is required').max(350, 'Keep the desired outcome under 350 characters'),
  constraints: z.array(tagItemSchema).default([]),
  monthlyMarketingSpend: z.enum(MONTHLY_MARKETING_SPEND_VALUES, {
    required_error: 'Monthly marketing spend is required',
  }),
  primaryGoal: z.enum(PRIMARY_GOAL_VALUES, {
    required_error: 'Primary goal is required',
  }),
  marketingHandler: z.enum(MARKETING_HANDLER_VALUES, {
    required_error: 'Marketing handler is required',
  }),
  whatsWorking: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
  biggestFrustration: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
  dataConsentOptIn: z.boolean().default(true),
  monthlyRevenue: monthlyRevenueSchema,
  monthlyOrderVolume: optionalPositiveIntegerSchema,
  productCost: optionalPositiveNumberSchema,
  avgCustomerRetention: z.enum(AVG_CUSTOMER_RETENTION_VALUES).optional().or(z.literal('')),
  repeatPurchaseFrequency: z.enum(REPEAT_PURCHASE_FREQUENCY_VALUES).optional().or(z.literal('')),
  googleAnalyticsConnected: z.boolean().default(false),
  monthlyWebsiteTraffic: z.enum(MONTHLY_WEBSITE_TRAFFIC_VALUES).optional().or(z.literal('')),
  emailListSize: z.enum(EMAIL_LIST_SIZE_VALUES).optional().or(z.literal('')),
  knownCompetitors: z.array(tagItemSchema).default([]),
  additionalContext: z.string().trim().max(1200, 'Keep this under 1200 characters').optional().or(z.literal('')),
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
