import type { ID, ISODateTime } from './common';
import type { BusinessModel, BusinessType, CampaignStatus, MarketScope } from './campaign';

export type WizardStepKey = 'STEP_1' | 'STEP_2' | 'STEP_3' | 'STEP_4';

export interface WizardStepState {
  campaignId: ID;
  stepKey: WizardStepKey;
  data: Record<string, unknown>;
  updatedAt: ISODateTime;
  version?: number;
}

export const MARKETING_TARGET_TYPE_VALUES = [
  'single_product',
  'brand_store',
  'category_collection',
] as const;

export type MarketingTargetType = (typeof MARKETING_TARGET_TYPE_VALUES)[number];

export const SOURCE_TYPE_VALUES = [
  'website',
  'marketplace',
  'social',
  'gmb',
  'manual_only',
] as const;

export type SourceType = (typeof SOURCE_TYPE_VALUES)[number];

export const SALES_CHANNEL_VALUES = [
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
] as const;

export type SalesChannel = (typeof SALES_CHANNEL_VALUES)[number];

export const MONTHLY_MARKETING_SPEND_VALUES = [
  'nothing',
  'under_5k',
  '5k_15k',
  '15k_50k',
  '50k_plus',
] as const;

export type MonthlyMarketingSpend = (typeof MONTHLY_MARKETING_SPEND_VALUES)[number];

export const PRIMARY_GOAL_VALUES = [
  'more_sales',
  'more_customers',
  'new_market',
  'launch_product',
  'reduce_channel_dependence',
  'brand_awareness',
  'beat_competitor',
] as const;

export type PrimaryGoal = (typeof PRIMARY_GOAL_VALUES)[number];

export const MARKETING_HANDLER_VALUES = [
  'self',
  'team_member',
  'freelancer_agency',
  'nobody',
] as const;

export type MarketingHandler = (typeof MARKETING_HANDLER_VALUES)[number];

export const MONTHLY_REVENUE_VALUES = [
  'under_25k',
  '25k_1l',
  '1l_5l',
  '5l_25l',
  '25l_plus',
] as const;

export type MonthlyRevenue = (typeof MONTHLY_REVENUE_VALUES)[number];

export const AVG_CUSTOMER_RETENTION_VALUES = [
  'one_time_buyers',
  'some_repeat',
  'mostly_repeat',
  'subscription',
] as const;

export type AvgCustomerRetention = (typeof AVG_CUSTOMER_RETENTION_VALUES)[number];

export const REPEAT_PURCHASE_FREQUENCY_VALUES = [
  'never',
  'every_few_months',
  'monthly',
  'weekly',
] as const;

export type RepeatPurchaseFrequency = (typeof REPEAT_PURCHASE_FREQUENCY_VALUES)[number];

export const MONTHLY_WEBSITE_TRAFFIC_VALUES = [
  'under_500',
  '500_2000',
  '2000_10000',
  '10000_50000',
  '50000_plus',
] as const;

export type MonthlyWebsiteTraffic = (typeof MONTHLY_WEBSITE_TRAFFIC_VALUES)[number];

export const SOCIAL_PLATFORM_VALUES = [
  'instagram',
  'facebook',
  'youtube',
  'twitter',
  'linkedin',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORM_VALUES)[number];

export const DIGITAL_PRESENCE_LINK_TYPE_VALUES = [
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
] as const;

export type DigitalPresenceLinkType = (typeof DIGITAL_PRESENCE_LINK_TYPE_VALUES)[number];

export const EMAIL_LIST_SIZE_VALUES = [
  'none',
  'under_500',
  '500_2000',
  '2000_10000',
  '10000_plus',
] as const;

export type EmailListSize = (typeof EMAIL_LIST_SIZE_VALUES)[number];

export const MARKETING_TARGET_TYPE_LABELS: Record<MarketingTargetType, string> = {
  single_product: 'Single product / service',
  brand_store: 'Brand / store',
  category_collection: 'Category / collection',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  website: 'Website',
  marketplace: 'Marketplace',
  social: 'Social profile',
  gmb: 'Google Business',
  manual_only: 'Manual only',
};

export const SALES_CHANNEL_LABELS: Record<SalesChannel, string> = {
  own_website: 'Own website',
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  retail_store: 'Retail store',
  justdial: 'Justdial',
  google_business: 'Google Business',
  facebook: 'Facebook',
  other_marketplace: 'Other marketplace',
  direct_sales: 'Direct sales',
  other: 'Other',
};

export const MONTHLY_MARKETING_SPEND_LABELS: Record<MonthlyMarketingSpend, string> = {
  nothing: "I don't spend anything",
  under_5k: 'Under INR 5,000',
  '5k_15k': 'INR 5,000 to INR 15,000',
  '15k_50k': 'INR 15,000 to INR 50,000',
  '50k_plus': 'Above INR 50,000',
};

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  more_sales: 'Get more sales',
  more_customers: 'Get more customers',
  new_market: 'Enter a new market',
  launch_product: 'Launch a product',
  reduce_channel_dependence: 'Reduce channel dependence',
  brand_awareness: 'Build brand awareness',
  beat_competitor: 'Beat a competitor',
};

export const MARKETING_HANDLER_LABELS: Record<MarketingHandler, string> = {
  self: 'I handle it myself',
  team_member: 'A team member handles it',
  freelancer_agency: 'A freelancer or agency handles it',
  nobody: 'Nobody handles it right now',
};

export const MONTHLY_REVENUE_LABELS: Record<MonthlyRevenue, string> = {
  under_25k: 'Under INR 25,000',
  '25k_1l': 'INR 25,000 to INR 1 lakh',
  '1l_5l': 'INR 1 lakh to INR 5 lakh',
  '5l_25l': 'INR 5 lakh to INR 25 lakh',
  '25l_plus': 'Above INR 25 lakh',
};

export const AVG_CUSTOMER_RETENTION_LABELS: Record<AvgCustomerRetention, string> = {
  one_time_buyers: 'Mostly one-time buyers',
  some_repeat: 'Some customers come back',
  mostly_repeat: 'Many customers come back',
  subscription: 'Subscription-based',
};

export const REPEAT_PURCHASE_FREQUENCY_LABELS: Record<RepeatPurchaseFrequency, string> = {
  never: 'Rarely or never',
  every_few_months: 'Every few months',
  monthly: 'Monthly',
  weekly: 'Weekly',
};

export const MONTHLY_WEBSITE_TRAFFIC_LABELS: Record<MonthlyWebsiteTraffic, string> = {
  under_500: 'Under 500 visits',
  '500_2000': '500 to 2,000 visits',
  '2000_10000': '2,000 to 10,000 visits',
  '10000_50000': '10,000 to 50,000 visits',
  '50000_plus': 'Above 50,000 visits',
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
};

export const DIGITAL_PRESENCE_LINK_TYPE_LABELS: Record<DigitalPresenceLinkType, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  google_business: 'Google Business',
  whatsapp: 'WhatsApp',
  other_marketplace: 'Other marketplace',
  other: 'Other',
};

export const EMAIL_LIST_SIZE_LABELS: Record<EmailListSize, string> = {
  none: 'No email list',
  under_500: 'Under 500 contacts',
  '500_2000': '500 to 2,000 contacts',
  '2000_10000': '2,000 to 10,000 contacts',
  '10000_plus': 'Above 10,000 contacts',
};

export const MARKETING_TARGET_TYPE_OPTIONS = MARKETING_TARGET_TYPE_VALUES.map((value) => ({
  value,
  label: MARKETING_TARGET_TYPE_LABELS[value],
}));

export const SOURCE_TYPE_OPTIONS = SOURCE_TYPE_VALUES.map((value) => ({
  value,
  label: SOURCE_TYPE_LABELS[value],
}));

export const SALES_CHANNEL_OPTIONS = SALES_CHANNEL_VALUES.map((value) => ({
  value,
  label: SALES_CHANNEL_LABELS[value],
}));

export const MONTHLY_MARKETING_SPEND_OPTIONS = MONTHLY_MARKETING_SPEND_VALUES.map((value) => ({
  value,
  label: MONTHLY_MARKETING_SPEND_LABELS[value],
}));

export const PRIMARY_GOAL_OPTIONS = PRIMARY_GOAL_VALUES.map((value) => ({
  value,
  label: PRIMARY_GOAL_LABELS[value],
}));

export const MARKETING_HANDLER_OPTIONS = MARKETING_HANDLER_VALUES.map((value) => ({
  value,
  label: MARKETING_HANDLER_LABELS[value],
}));

export const MONTHLY_REVENUE_OPTIONS = MONTHLY_REVENUE_VALUES.map((value) => ({
  value,
  label: MONTHLY_REVENUE_LABELS[value],
}));

export const AVG_CUSTOMER_RETENTION_OPTIONS = AVG_CUSTOMER_RETENTION_VALUES.map((value) => ({
  value,
  label: AVG_CUSTOMER_RETENTION_LABELS[value],
}));

export const REPEAT_PURCHASE_FREQUENCY_OPTIONS = REPEAT_PURCHASE_FREQUENCY_VALUES.map((value) => ({
  value,
  label: REPEAT_PURCHASE_FREQUENCY_LABELS[value],
}));

export const MONTHLY_WEBSITE_TRAFFIC_OPTIONS = MONTHLY_WEBSITE_TRAFFIC_VALUES.map((value) => ({
  value,
  label: MONTHLY_WEBSITE_TRAFFIC_LABELS[value],
}));

export const SOCIAL_PLATFORM_OPTIONS = SOCIAL_PLATFORM_VALUES.map((value) => ({
  value,
  label: SOCIAL_PLATFORM_LABELS[value],
}));

export const DIGITAL_PRESENCE_LINK_TYPE_OPTIONS = DIGITAL_PRESENCE_LINK_TYPE_VALUES.map((value) => ({
  value,
  label: DIGITAL_PRESENCE_LINK_TYPE_LABELS[value],
}));

export const EMAIL_LIST_SIZE_OPTIONS = EMAIL_LIST_SIZE_VALUES.map((value) => ({
  value,
  label: EMAIL_LIST_SIZE_LABELS[value],
}));

function formatWizardEnumValue<T extends string>(
  value: T | null | undefined,
  labels: Record<string, string>,
) {
  if (!value) {
    return null;
  }

  return labels[value] ?? value;
}

export function formatMarketingTargetType(value: MarketingTargetType | string | null | undefined) {
  return formatWizardEnumValue(value, MARKETING_TARGET_TYPE_LABELS);
}

export function formatSourceType(value: SourceType | string | null | undefined) {
  return formatWizardEnumValue(value, SOURCE_TYPE_LABELS);
}

export function formatSalesChannel(value: SalesChannel | string | null | undefined) {
  return formatWizardEnumValue(value, SALES_CHANNEL_LABELS);
}

export function formatMonthlyMarketingSpend(value: MonthlyMarketingSpend | string | null | undefined) {
  return formatWizardEnumValue(value, MONTHLY_MARKETING_SPEND_LABELS);
}

export function formatPrimaryGoal(value: PrimaryGoal | string | null | undefined) {
  return formatWizardEnumValue(value, PRIMARY_GOAL_LABELS);
}

export function formatMarketingHandler(value: MarketingHandler | string | null | undefined) {
  return formatWizardEnumValue(value, MARKETING_HANDLER_LABELS);
}

export function formatMonthlyRevenue(value: MonthlyRevenue | string | null | undefined) {
  return formatWizardEnumValue(value, MONTHLY_REVENUE_LABELS);
}

export function formatAvgCustomerRetention(value: AvgCustomerRetention | string | null | undefined) {
  return formatWizardEnumValue(value, AVG_CUSTOMER_RETENTION_LABELS);
}

export function formatRepeatPurchaseFrequency(value: RepeatPurchaseFrequency | string | null | undefined) {
  return formatWizardEnumValue(value, REPEAT_PURCHASE_FREQUENCY_LABELS);
}

export function formatMonthlyWebsiteTraffic(value: MonthlyWebsiteTraffic | string | null | undefined) {
  return formatWizardEnumValue(value, MONTHLY_WEBSITE_TRAFFIC_LABELS);
}

export function formatSocialPlatform(value: SocialPlatform | string | null | undefined) {
  return formatWizardEnumValue(value, SOCIAL_PLATFORM_LABELS);
}

export function formatDigitalPresenceLinkType(value: DigitalPresenceLinkType | string | null | undefined) {
  return formatWizardEnumValue(value, DIGITAL_PRESENCE_LINK_TYPE_LABELS);
}

export function formatEmailListSize(value: EmailListSize | string | null | undefined) {
  return formatWizardEnumValue(value, EMAIL_LIST_SIZE_LABELS);
}

export interface RankedSalesChannel {
  channel: SalesChannel;
  rank: number;
  customName?: string | null;
}

export interface SocialHandle {
  platform: SocialPlatform;
  handle: string;
}

export interface DigitalPresenceLink {
  type: DigitalPresenceLinkType;
  url: string;
  label?: string | null;
}

export interface WizardPreviewCampaign {
  id: ID;
  title: string;
  status: CampaignStatus;
  websiteUrl?: unknown | null;
}

export interface WizardPreviewStep1 {
  title?: string;
  marketingTargetType?: MarketingTargetType | null;
  focusName?: string;
  sourceType?: SourceType | null;
  primaryUrl?: string | null;
  marketLocation?: string;
}

export interface WizardPreviewStep2 {
  businessType?: BusinessType | null;
  businessModel?: BusinessModel | null;
  marketScope?: MarketScope | null;
  businessDescription?: string;
  productCategory?: string;
  productOrService?: string;
  offerSummary?: string;
  priceRange?: string;
  differentiators?: string[];
  salesChannels?: RankedSalesChannel[];
  socialHandles?: SocialHandle[];
  digitalPresenceLinks?: DigitalPresenceLink[];
}

export interface WizardPreviewStep3 {
  targetPersona?: string;
  targetAudience?: string | null;
  language?: string;
  painPoints?: string[];
  desiredOutcome?: string;
}

export interface WizardPreviewStep4 {
  constraints?: string[];
  monthlyMarketingSpend?: MonthlyMarketingSpend;
  pastMarketing?: string | null;
  primaryGoal?: PrimaryGoal;
  marketingHandler?: MarketingHandler;
  whatsWorking?: string | null;
  biggestFrustration?: string | null;
  monthlyRevenue?: MonthlyRevenue | string | null;
  monthlyOrderVolume?: number | null;
  productCost?: number | null;
  avgCustomerRetention?: AvgCustomerRetention | null;
  repeatPurchaseFrequency?: RepeatPurchaseFrequency | null;
  googleAnalyticsConnected?: boolean;
  monthlyWebsiteTraffic?: MonthlyWebsiteTraffic | null;
  emailListSize?: EmailListSize | null;
  knownCompetitors?: string[] | null;
  additionalContext?: string | null;
}

export interface WizardDerivedMetrics {
  estimatedCAC?: string | number | null;
  estimatedCac?: string | number | null;
  estimatedMarginPerUnit?: string | number | null;
  estimated_margin_per_unit?: string | number | null;
  estimatedCLTV?: string | number | null;
  estimatedCltv?: string | number | null;
  cacCltvRatio?: string | number | null;
  cac_cltv_ratio?: string | number | null;
  budgetCategory?: string | null;
  budget_category?: string | null;
  executionCapacity?: string | null;
  execution_capacity?: string | null;
  primaryChannelDependency?: string | null;
  primary_channel_dependency?: string | null;
  [key: string]: unknown;
}

export interface WizardPreview {
  campaign: WizardPreviewCampaign;
  steps: {
    step1?: WizardPreviewStep1;
    step2?: WizardPreviewStep2;
    step3?: WizardPreviewStep3;
    step4?: WizardPreviewStep4;
  };
  derived?: WizardDerivedMetrics | null;
}

export interface SaveWizardStepPayload {
  data: Record<string, unknown>;
  version?: number;
}
