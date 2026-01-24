import type { ID } from './common';

export interface AiDailyUsage {
  date: string; // YYYY-MM-DD
  totalRequests: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface AiTopSpender {
  entityType: 'CAMPAIGN' | 'USER';
  entityId: ID;
  label: string;
  totalCostUsd: number;
  totalTokens: number;
  totalRequests: number;
}

export interface AiUsageSummary {
  windowDays: number;
  daily: AiDailyUsage[];
  topSpenders: AiTopSpender[];
}

export interface GetAiUsageSummaryParams {
  windowDays?: number;
}
