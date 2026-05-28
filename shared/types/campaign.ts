import type { ID, ISODateTime } from './common';

export const CAMPAIGN_STATUS_VALUES = [
  'DRAFT',
  'SUBMITTED_FOR_REVIEW',
  'IN_REVIEW',
  'ACTIVE',
  'FAILED',
  'ARCHIVED',
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUS_VALUES)[number];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'In Setup',
  SUBMITTED_FOR_REVIEW: 'Generating',
  IN_REVIEW: 'Under Review',
  ACTIVE: 'Active',
  FAILED: 'Needs Attention',
  ARCHIVED: 'Archived',
};

export const BUSINESS_TYPE_VALUES = [
  'SERVICE',
  'PRODUCT',
  'ECOMMERCE',
  'SAAS',
  'LOCAL',
  'COACH',
] as const;

export const BUSINESS_MODEL_VALUES = ['B2B', 'B2C', 'D2C', 'MARKETPLACE', 'HYBRID'] as const;

export const MARKET_SCOPE_VALUES = ['LOCAL', 'REGIONAL', 'NATIONAL', 'GLOBAL'] as const;

export type BusinessType = (typeof BUSINESS_TYPE_VALUES)[number];
export type BusinessModel = (typeof BUSINESS_MODEL_VALUES)[number];
export type MarketScope = (typeof MARKET_SCOPE_VALUES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  SERVICE: 'Service',
  PRODUCT: 'Product',
  ECOMMERCE: 'E-Commerce',
  SAAS: 'SaaS',
  LOCAL: 'Local',
  COACH: 'Coach',
};

export const BUSINESS_MODEL_LABELS: Record<BusinessModel, string> = {
  B2B: 'B2B',
  B2C: 'B2C',
  D2C: 'D2C',
  MARKETPLACE: 'Marketplace',
  HYBRID: 'Hybrid',
};

export const MARKET_SCOPE_LABELS: Record<MarketScope, string> = {
  LOCAL: 'Local',
  REGIONAL: 'Regional',
  NATIONAL: 'National',
  GLOBAL: 'Global',
};

export const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPE_VALUES.map((value) => ({
  value,
  label: BUSINESS_TYPE_LABELS[value],
}));

export const BUSINESS_MODEL_OPTIONS = BUSINESS_MODEL_VALUES.map((value) => ({
  value,
  label: BUSINESS_MODEL_LABELS[value],
}));

export const MARKET_SCOPE_OPTIONS = MARKET_SCOPE_VALUES.map((value) => ({
  value,
  label: MARKET_SCOPE_LABELS[value],
}));

function formatCampaignEnumValue<T extends string>(
  value: T | null | undefined,
  labels: Record<string, string>,
) {
  if (!value) {
    return null;
  }

  return labels[value] ?? value;
}

export function formatBusinessType(value: BusinessType | string | null | undefined) {
  return formatCampaignEnumValue(value, BUSINESS_TYPE_LABELS);
}

export function formatBusinessModel(value: BusinessModel | string | null | undefined) {
  return formatCampaignEnumValue(value, BUSINESS_MODEL_LABELS);
}

export function formatMarketScope(value: MarketScope | string | null | undefined) {
  return formatCampaignEnumValue(value, MARKET_SCOPE_LABELS);
}

export function formatCampaignStatus(value: CampaignStatus | string | null | undefined) {
  return formatCampaignEnumValue(value, CAMPAIGN_STATUS_LABELS);
}

export interface Campaign {
  id: ID;
  title: string;
  // Legacy alias retained for existing UI and wizard flows.
  name: string;
  city: string;
  niche: string;
  businessType?: BusinessType | null;
  businessModel?: BusinessModel | null;
  marketScope?: MarketScope | null;
  website?: string | null;
  status: CampaignStatus;
  currentStep: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  v2SourceType?: string | null;
  v2PrimaryMarket?: string | null;
  v2TargetMarkets?: string[];
  v2BusinessName?: string | null;
  v2IndustryCategory?: string | null;
  v2PrimaryOfferings?: string[];
  v2PrimaryGoal?: string | null;
}

export interface CreateCampaignPayload {
  title: string;
  marketLocation: string;
  businessType: BusinessType;
  businessModel: BusinessModel;
  marketScope: MarketScope;
  websiteUrl?: string | null;
}

export interface UpdateCampaignPayload {
  title?: string;
  marketLocation?: string;
  businessType?: BusinessType;
  businessModel?: BusinessModel;
  marketScope?: MarketScope;
  websiteUrl?: string | null;
}
