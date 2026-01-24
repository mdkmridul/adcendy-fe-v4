import type { ID, ISODateTime, RunStatus } from './common';

export interface StrategyRun {
  id: ID;
  campaignId: ID;
  status: RunStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  errorMessage?: string | null;
}

export interface StrategyVersion {
  id: ID;
  campaignId: ID;
  version: number;
  createdAt: ISODateTime;
  sections: Array<{
    key: string;
    title: string;
    content: any;
  }>;
}

export interface StrategyFeedback {
  strategyVersionId: ID;
  rating: 'UP' | 'DOWN';
  note?: string;
  createdAt: ISODateTime;
}

export interface SubmitStrategyFeedbackPayload {
  rating: 'UP' | 'DOWN';
  note?: string;
}
