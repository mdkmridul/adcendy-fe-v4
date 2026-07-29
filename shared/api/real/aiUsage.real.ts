import { endOfDay, startOfDay, subDays } from 'date-fns';
import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  AiDailyUsage,
  AiUsageSummary,
  GetAiDailyUsageParams,
  GetAiUsageSummaryParams,
} from '@/shared/types/aiUsage';

interface AiUsageSummaryDto {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  grouped?: Record<string, unknown>;
}

interface AiDailyUsageResponseDto {
  usage: AiDailyUsage[];
}

function resolveWindow(days?: number) {
  const now = new Date();
  return {
    from: startOfDay(subDays(now, (days ?? 14) - 1)).toISOString(),
    to: endOfDay(now).toISOString(),
  };
}

function mapSummary(dto: AiUsageSummaryDto): AiUsageSummary {
  return {
    totalCalls: dto.totalCalls,
    totalTokens: dto.totalTokens,
    totalCost: dto.totalCost,
    grouped: dto.grouped as AiUsageSummary['grouped'],
  };
}

function mapDailyUsage(dto: AiDailyUsageResponseDto): AiDailyUsage[] {
  return dto.usage.map((entry) => ({
    id: entry.id,
    date: entry.date,
    calls: entry.calls,
    totalTokens: entry.totalTokens,
    cost: entry.cost,
    byOperationJson: entry.byOperationJson as Record<string, unknown> | undefined,
    byModelJson: entry.byModelJson as Record<string, unknown> | undefined,
    byCampaignJson: entry.byCampaignJson as Record<string, unknown> | undefined,
    byEntityTypeJson: entry.byEntityTypeJson as Record<string, unknown> | undefined,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));
}

export const aiUsageRealAdapter = {
  async getAiUsageSummary(params?: GetAiUsageSummaryParams): Promise<AiUsageSummary> {
    const window = resolveWindow(params?.days);
    const response = await http<ApiResponse<AiUsageSummaryDto>>('/v1/admin/ai/usage/summary', {
      query: {
        userId: params?.userId,
        from: window.from,
        to: window.to,
      },
    });

    return mapSummary(response.data);
  },

  async getDailyUsage(params?: GetAiDailyUsageParams): Promise<AiDailyUsage[]> {
    const window = resolveWindow(params?.days);
    const response = await http<ApiResponse<AiDailyUsageResponseDto>>('/v1/admin/ai/usage/daily', {
      query: {
        userId: params?.userId,
        from: window.from,
        to: window.to,
        limit: String(params?.limit ?? Math.max(params?.days ?? 14, 7)),
      },
    });

    return mapDailyUsage(response.data);
  },
};
