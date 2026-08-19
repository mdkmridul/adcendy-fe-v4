import type { ID, ISODateTime } from './common';
import type { BusinessModel, BusinessType, CampaignStatus, MarketScope } from './campaign';

export type WizardStepKey = 'STEP_1' | 'STEP_2' | 'STEP_3' | 'STEP_4' | 'STEP_5' | 'STEP_6' | 'STEP_7';

export interface WizardStepState {
  campaignId: ID;
  stepKey: WizardStepKey;
  data: Record<string, unknown>;
  updatedAt: ISODateTime;
  version?: number;
}

export const MARKETING_TARGET_TYPE_VALUES = [
  'whole_business',
  'product_or_service',
  'launch',
  'market_expansion',
  'specific_audience',
  'other',
] as const;

export type MarketingTargetType = (typeof MARKETING_TARGET_TYPE_VALUES)[number];

export const SOURCE_TYPE_VALUES = [
  'website',
  'digital_presence_only',
  'manual_only',
] as const;

export type SourceType = (typeof SOURCE_TYPE_VALUES)[number];

export const AUDIENCE_MODEL_VALUES = [
  'single_sided',
  'b2b2c',
  'marketplace_platform',
  'multi_sided',
  'not_sure',
] as const;

export type AudienceModel = (typeof AUDIENCE_MODEL_VALUES)[number];

export const LIFECYCLE_STAGE_VALUES = [
  'pre_launch',
  'launch',
  'growth',
  'scaling',
  'mature',
] as const;

export type LifecycleStage = (typeof LIFECYCLE_STAGE_VALUES)[number];

export const LANGUAGE_VALUES = [
  'english',
  'hindi',
  'regional_other',
  'mixed',
  'not_sure',
] as const;

export type Language = (typeof LANGUAGE_VALUES)[number];

export const REPORT_LANGUAGE_VALUES = [
  'english',
  'hindi',
  'regional_other',
] as const;

export type ReportLanguage = (typeof REPORT_LANGUAGE_VALUES)[number];

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

export const PRIMARY_CONVERSION_PATH_VALUES = [
  'buy_online',
  'book_demo',
  'book_call',
  'whatsapp',
  'retail_visit',
  'app_signup',
  'other',
] as const;

export type PrimaryConversionPath = (typeof PRIMARY_CONVERSION_PATH_VALUES)[number];

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

/**
 * Deal value, gross margin and close rate, asked as bands.
 *
 * The free-text economics fields shipped `not_sure` on the last run and the
 * backend validator invited it by name. An owner knows their band without
 * going to look it up, and a band is all the unit economics model needs.
 *
 * Deal value and margin have no opt-out. Close rate keeps `not_tracked`,
 * because a pre-CRM client has no honest answer and the model sweeps it as a
 * sensitivity axis instead of assuming one.
 */
export const DEAL_VALUE_BAND_VALUES = [
  'under_10k',
  'from_10k_to_50k',
  'from_50k_to_2l',
  'from_2l_to_10l',
  'from_10l_to_50l',
  'above_50l',
] as const;

export type DealValueBand = (typeof DEAL_VALUE_BAND_VALUES)[number];

export const GROSS_MARGIN_BAND_VALUES = [
  'under_20_percent',
  'from_20_to_40_percent',
  'from_40_to_60_percent',
  'from_60_to_80_percent',
  'above_80_percent',
] as const;

export type GrossMarginBand = (typeof GROSS_MARGIN_BAND_VALUES)[number];

export const CLOSE_RATE_BAND_VALUES = [
  'under_5_percent',
  'from_5_to_15_percent',
  'from_15_to_30_percent',
  'from_30_to_50_percent',
  'above_50_percent',
  'not_tracked',
] as const;

export type CloseRateBand = (typeof CLOSE_RATE_BAND_VALUES)[number];

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
  whole_business: 'Whole business',
  product_or_service: 'Product or service',
  launch: 'Launch',
  market_expansion: 'Market expansion',
  specific_audience: 'Specific audience',
  other: 'Other',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  website: 'Website',
  digital_presence_only: 'Digital presence only',
  manual_only: 'Manual only',
};

export const AUDIENCE_MODEL_LABELS: Record<AudienceModel, string> = {
  single_sided: 'One audience',
  b2b2c: 'Business + end customer (B2B2C)',
  marketplace_platform: 'Marketplace / two-sided platform',
  multi_sided: 'Multi-sided',
  not_sure: 'Not sure',
};

export const LIFECYCLE_STAGE_LABELS: Record<LifecycleStage, string> = {
  pre_launch: 'Pre-launch',
  launch: 'Launch',
  growth: 'Growth',
  scaling: 'Scaling',
  mature: 'Mature',
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  english: 'English',
  hindi: 'Hindi',
  regional_other: 'Regional language (other)',
  mixed: 'Mixed',
  not_sure: 'Not sure',
};

export const REPORT_LANGUAGE_LABELS: Record<ReportLanguage, string> = {
  english: 'English',
  hindi: 'Hindi',
  regional_other: 'Regional language (other)',
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

export const PRIMARY_CONVERSION_PATH_LABELS: Record<PrimaryConversionPath, string> = {
  buy_online: 'Buy online',
  book_demo: 'Book a demo',
  book_call: 'Book a call',
  whatsapp: 'WhatsApp',
  retail_visit: 'Retail visit',
  app_signup: 'App signup',
  other: 'Other',
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

export const DEAL_VALUE_BAND_LABELS: Record<DealValueBand, string> = {
  under_10k: 'Under INR 10,000',
  from_10k_to_50k: 'INR 10,000 to INR 50,000',
  from_50k_to_2l: 'INR 50,000 to INR 2 lakh',
  from_2l_to_10l: 'INR 2 lakh to INR 10 lakh',
  from_10l_to_50l: 'INR 10 lakh to INR 50 lakh',
  above_50l: 'Above INR 50 lakh',
};

export const GROSS_MARGIN_BAND_LABELS: Record<GrossMarginBand, string> = {
  under_20_percent: 'Under 20%',
  from_20_to_40_percent: '20% to 40%',
  from_40_to_60_percent: '40% to 60%',
  from_60_to_80_percent: '60% to 80%',
  above_80_percent: 'Above 80%',
};

export const CLOSE_RATE_BAND_LABELS: Record<CloseRateBand, string> = {
  under_5_percent: 'Under 5%',
  from_5_to_15_percent: '5% to 15%',
  from_15_to_30_percent: '15% to 30%',
  from_30_to_50_percent: '30% to 50%',
  above_50_percent: 'Above 50%',
  not_tracked: 'We do not track this yet',
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

export const AUDIENCE_MODEL_OPTIONS = AUDIENCE_MODEL_VALUES.map((value) => ({
  value,
  label: AUDIENCE_MODEL_LABELS[value],
}));

export const LIFECYCLE_STAGE_OPTIONS = LIFECYCLE_STAGE_VALUES.map((value) => ({
  value,
  label: LIFECYCLE_STAGE_LABELS[value],
}));

export const LANGUAGE_OPTIONS = LANGUAGE_VALUES.map((value) => ({
  value,
  label: LANGUAGE_LABELS[value],
}));

export const REPORT_LANGUAGE_OPTIONS = REPORT_LANGUAGE_VALUES.map((value) => ({
  value,
  label: REPORT_LANGUAGE_LABELS[value],
}));

export const SALES_CHANNEL_OPTIONS = SALES_CHANNEL_VALUES.map((value) => ({
  value,
  label: SALES_CHANNEL_LABELS[value],
}));

export const MONTHLY_MARKETING_SPEND_OPTIONS = MONTHLY_MARKETING_SPEND_VALUES.map((value) => ({
  value,
  label: MONTHLY_MARKETING_SPEND_LABELS[value],
}));

export const PRIMARY_CONVERSION_PATH_OPTIONS = PRIMARY_CONVERSION_PATH_VALUES.map((value) => ({
  value,
  label: PRIMARY_CONVERSION_PATH_LABELS[value],
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

export const DEAL_VALUE_BAND_OPTIONS = DEAL_VALUE_BAND_VALUES.map((value) => ({
  value,
  label: DEAL_VALUE_BAND_LABELS[value],
}));

export const GROSS_MARGIN_BAND_OPTIONS = GROSS_MARGIN_BAND_VALUES.map((value) => ({
  value,
  label: GROSS_MARGIN_BAND_LABELS[value],
}));

export const CLOSE_RATE_BAND_OPTIONS = CLOSE_RATE_BAND_VALUES.map((value) => ({
  value,
  label: CLOSE_RATE_BAND_LABELS[value],
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

export function formatAudienceModel(value: AudienceModel | string | null | undefined) {
  return formatWizardEnumValue(value, AUDIENCE_MODEL_LABELS);
}

export function formatLifecycleStage(value: LifecycleStage | string | null | undefined) {
  return formatWizardEnumValue(value, LIFECYCLE_STAGE_LABELS);
}

export function formatLanguage(value: Language | string | null | undefined) {
  return formatWizardEnumValue(value, LANGUAGE_LABELS);
}

export function formatReportLanguage(value: ReportLanguage | string | null | undefined) {
  return formatWizardEnumValue(value, REPORT_LANGUAGE_LABELS);
}

export function formatSalesChannel(value: SalesChannel | string | null | undefined) {
  return formatWizardEnumValue(value, SALES_CHANNEL_LABELS);
}

export function formatMonthlyMarketingSpend(value: MonthlyMarketingSpend | string | null | undefined) {
  return formatWizardEnumValue(value, MONTHLY_MARKETING_SPEND_LABELS);
}

export function formatPrimaryConversionPath(value: PrimaryConversionPath | string | null | undefined) {
  return formatWizardEnumValue(value, PRIMARY_CONVERSION_PATH_LABELS);
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
  targetMarkets?: string[];
  primaryMarket?: string | null;
  marketScope?: MarketScope | string | null;
  operationalLocations?: string[];
  regionalLanguageExpansionEnabled?: boolean;
  regionalLanguages?: string[];
  marketLocation?: string;
}

export interface WizardPreviewStep2 {
  businessName?: string | null;
  industryCategory?: string | null;
  businessType?: BusinessType | null;
  businessModel?: BusinessModel | null;
  audienceModel?: AudienceModel | string | null;
  lifecycleStage?: LifecycleStage | string | null;
  marketScope?: MarketScope | null;
  businessDescription?: string;
  productCategory?: string;
  productOrService?: string | string[];
  productsServices?: string[];
  offerSummary?: string;
  priceRange?: string;
  differentiators?: string[];
  sensitiveCategoryFlags?: string[];
  complianceSensitiveClaims?: string[];
  salesChannels?: RankedSalesChannel[];
  primaryConversionPath?: PrimaryConversionPath | string | null;
  socialHandles?: SocialHandle[];
  digitalPresenceLinks?: DigitalPresenceLink[];
}

export interface WizardPreviewStep3 {
  primaryTargetSegment?: string;
  targetPersona?: string;
  targetAudience?: string | null;
  audienceSegments?: string[];
  language?: Language | string;
  reportLanguage?: ReportLanguage | string | null;
  painPoints?: string[];
  desiredOutcome?: string;
  decisionProcess?: string;
  buyerRoles?: string[];
}

export interface WizardPreviewStep4 {
  constraints?: string[];
  trustSignals?: string[];
  monthlyMarketingSpend?: MonthlyMarketingSpend;
  paidMediaBudgetRange?: string | null;
  pastMarketing?: string | null;
  primaryGoal?: PrimaryGoal;
  marketingHandler?: MarketingHandler;
  contentCapacity?: string | null;
  salesCapacity?: string | null;
  currentMarketingActivity?: Array<{
    channel: string;
    status: string;
    workingAssessment?: string | null;
    evidence?: string | null;
    monthlySpend?: string | null;
    timeRunning?: string | null;
    reasonStopped?: string | null;
  }>;
  averageOrderValue?: string | null;
  averageContractValue?: string | null;
  grossMarginPercentage?: string | null;
  whatsWorking?: string | null;
  biggestFrustration?: string | null;
  monthlyRevenue?: MonthlyRevenue | string | null;
  monthlyOrderVolume?: string | null;
  productCost?: string | null;
  monthlyOrdersPerSubscriber?: string | null;
  monthlyChurnRate?: string | null;
  avgCustomerRetention?: AvgCustomerRetention | null;
  repeatPurchaseFrequency?: RepeatPurchaseFrequency | null;
  salesCycleLength?: string | null;
  googleAnalyticsConnected?: boolean | 'unknown';
  monthlyWebsiteTraffic?: MonthlyWebsiteTraffic | null;
  emailListSize?: EmailListSize | null;
  knownCompetitorStatus?: string | null;
  knownCompetitors?: string[] | null;
  channelsToAvoid?: string[] | null;
  channelsStronglyPreferred?: string[] | null;
  executionConstraints?: string[] | null;
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

export type PipelineRunStatusV2 =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED_AWAITING_REVIEW';

export type WizardStateStatusV2 =
  | 'in_progress'
  | 'pending_review'
  | 'committed'
  | 'committed_blocked_data_consent';

export interface ValidationIssueV2 {
  code: string;
  message: string;
  path: string[];
  severity: 'error' | 'warn';
}

export interface WizardFieldOptionV2 {
  value: string | boolean;
  label: string;
  canonicalToken?: string;
}

export interface WizardStepDefinitionV2 {
  stepNumber: number;
  stepKey: string;
  label: string;
  helperText: string;
  examples: string[];
}

export interface WizardOptionsResponseV2 {
  wizardVersion: string;
  stepDefinitions: WizardStepDefinitionV2[];
  fieldOptions: Record<string, WizardFieldOptionV2[]>;
}

export interface WizardStateResponseV2 {
  campaignId: string;
  status: WizardStateStatusV2;
  version: number;
  lastCompletedStep: number;
  committedSnapshotId: string | null;
  updatedAt: string | null;
  run?: {
    runId: string;
    status: PipelineRunStatusV2;
    statusUrl: string;
    attemptNumber: number;
    updatedAt: string;
  } | null;
  steps: {
    step1: Record<string, unknown> | null;
    step2: Record<string, unknown> | null;
    step3: Record<string, unknown> | null;
    step4: Record<string, unknown> | null;
    step5: Record<string, unknown> | null;
    step6: Record<string, unknown> | null;
    step7: Record<string, unknown> | null;
  };
}

export interface WizardCommitResponseV2 {
  pipelineRunId: string | null;
  pipelineStatus: PipelineRunStatusV2 | null;
  run?: {
    campaignId: string;
    runId: string;
    status: PipelineRunStatusV2;
    statusUrl: string;
  } | null;
  normalizationRecordId: string;
  wizardSnapshotId: string;
  reviewerTasks: Array<{
    id: string;
    failureMode: string;
  }>;
  wizardState: WizardStateResponseV2;
  commitAccepted: true;
  dataConsentOptIn: boolean;
  readyToGenerate: boolean;
  blockedByDataConsent: boolean;
  generationTriggered: boolean;
  normalizedContracts: Record<string, unknown>;
  taxonomy: {
    values: {
      sales_motion: string;
      customer_type: string;
      demand_capture_mode: string;
      purchase_consideration: string;
      market_geography: string;
      product_type: string;
      distribution_model: string;
      lifecycle_stage: string;
      industry_category: string;
    };
    confidence_score: number;
    low_confidence_dimensions: string[];
    evidence: Record<string, string[]>;
  };
  contextSufficiency: {
    missing_fields: string[];
    sufficient: boolean;
  };
  validationWarnings: ValidationIssueV2[];
}
