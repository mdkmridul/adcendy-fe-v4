import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type AiUsageSummaryDto = components['schemas']['AiUsageSummaryDto'];
type AiDailyUsageResponseDto = components['schemas']['AiDailyUsageResponseDto'];

export const aiUsageRealAdapter = {
  async getAiUsageSummary(params?: { startDate?: string; endDate?: string }): Promise<AiUsageSummaryDto> {
    const response = await http<ApiResponse<AiUsageSummaryDto>>('/v1/v1/admin/ai/usage/summary', { query: params });
    return response.data;
  },

  async getDailyUsage(params?: { startDate?: string; endDate?: string }): Promise<AiDailyUsageResponseDto> {
    const response = await http<ApiResponse<AiDailyUsageResponseDto>>('/v1/v1/admin/ai/usage/daily', { query: params });
    return response.data;
  },
};
