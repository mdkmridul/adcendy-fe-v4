import type { ID, ISODateTime } from './common';
import type { BusinessModel, BusinessType, CampaignStatus, MarketScope } from './campaign';

export type WizardStepKey = 'STEP_1' | 'STEP_2' | 'STEP_3';

export interface WizardStepState {
  campaignId: ID;
  stepKey: WizardStepKey;
  data: Record<string, any>;
  updatedAt: ISODateTime;
  version?: number;
}

export interface WizardPreviewCampaign {
  id: ID;
  title: string;
  status: CampaignStatus;
  websiteUrl?: unknown | null;
}

export interface WizardPreviewStep1 {
  title: string;
  marketLocation: string;
  businessType: BusinessType;
  businessModel: BusinessModel;
  marketScope: MarketScope;
  websiteUrl?: unknown | null;
}

export interface WizardPreviewStep2 {
  offerSummary: string;
  priceRange: string;
  differentiators: string[];
  constraints: string[];
}

export interface WizardPreviewStep3 {
  targetPersona: string;
  language: string;
  painPoints: string[];
  desiredOutcome: string;
}

export interface WizardPreview {
  campaign: WizardPreviewCampaign;
  steps: {
    step1?: WizardPreviewStep1;
    step2?: WizardPreviewStep2;
    step3?: WizardPreviewStep3;
  };
  derived?: Record<string, unknown> | null;
}

export interface SaveWizardStepPayload {
  data: Record<string, any>;
  version?: number;
}

export interface Step1Data {
  title: string;
  marketLocation: string;
  businessType: BusinessType;
  businessModel: BusinessModel;
  marketScope: MarketScope;
  websiteUrl?: string;
  budgetMonthly?: number;
}

export interface Step2Data {
  offerType: 'SERVICE' | 'PRODUCT' | 'SUBSCRIPTION';
  offerSummary: string;
  pricePoint?: number;
  usp?: string;
}

export interface Step3Data {
  audienceType: 'LOCAL' | 'NICHE_ONLINE' | 'MASS';
  customerPersona: string;
  objective: 'LEADS' | 'SALES' | 'AWARENESS';
}
