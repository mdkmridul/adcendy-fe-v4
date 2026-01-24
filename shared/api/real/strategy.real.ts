import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type StrategyRunDto = components['schemas']['StrategyRunDto'];
type StrategyRunResponseDto = components['schemas']['StrategyRunResponseDto'];
type StrategyRunListResponseDto = components['schemas']['StrategyRunListResponseDto'];
type SubmitFeedbackDto = components['schemas']['SubmitFeedbackDto'];

export const strategyRealAdapter = {
  async startRun(campaignId: string): Promise<StrategyRunResponseDto> {
    const response = await http<ApiResponse<StrategyRunResponseDto>>(`/v1/campaigns/${campaignId}/strategy/generate`, {
      method: 'POST',
    });
    return response.data;
  },

  async getRun(campaignId: string, runId: string): Promise<StrategyRunDto> {
    const response = await http<ApiResponse<StrategyRunDto>>(`/v1/campaigns/${campaignId}/strategy/runs/${runId}`);
    return response.data;
  },

  async listRuns(campaignId: string): Promise<StrategyRunDto[]> {
    const response = await http<ApiResponse<StrategyRunListResponseDto>>(`/v1/campaigns/${campaignId}/strategy/runs`);
    return response.data.runs;
  },

  async getLatest(campaignId: string): Promise<StrategyRunDto> {
    const response = await http<ApiResponse<StrategyRunDto>>(`/v1/campaigns/${campaignId}/strategy/latest`);
    return response.data;
  },

  async submitFeedback(campaignId: string, runId: string, payload: SubmitFeedbackDto): Promise<void> {
    await http(`/v1/campaigns/${campaignId}/strategy/runs/${runId}/feedback`, {
      method: 'POST',
      body: payload,
    });
  },
};
