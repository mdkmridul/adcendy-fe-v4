import type { ISODateTime } from './common';

export interface AiUsageSummaryGroup {
  calls: number;
  tokens: number;
  cost: number;
}

export interface AiUsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  grouped?: Record<string, AiUsageSummaryGroup>;
}

export interface AiDailyUsage {
  id: string;
  date: ISODateTime;
  calls: number;
  totalTokens: number;
  cost: number;
  byOperationJson?: Record<string, unknown>;
  byModelJson?: Record<string, unknown>;
  byCampaignJson?: Record<string, unknown>;
  byEntityTypeJson?: Record<string, unknown>;
  createdAt?: ISODateTime;
  updatedAt?: ISODateTime;
}

export interface GetAiUsageSummaryParams {
  days?: number;
  userId?: string;
}

export interface GetAiDailyUsageParams extends GetAiUsageSummaryParams {
  limit?: number;
}
