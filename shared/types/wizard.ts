import type { ID, ISODateTime } from './common';

export type WizardStepKey = 'STEP_1' | 'STEP_2' | 'STEP_3';

export interface WizardStepState {
  campaignId: ID;
  stepKey: WizardStepKey;
  data: Record<string, any>;
  updatedAt: ISODateTime;
}

export interface WizardPreview {
  campaignId: ID;
  summary: {
    city: string;
    niche: string;
    offer?: string;
    audience?: string;
    budget?: number;
  };
  signals?: {
    searchVolume?: number;
    competitionLevel?: string;
    trends?: string[];
  };
}

export interface SaveWizardStepPayload {
  data: Record<string, any>;
}

export interface Step1Data {
  city: string;
  niche: string;
  website?: string;
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
