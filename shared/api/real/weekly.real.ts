import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type WeeklySubmissionDto = components['schemas']['WeeklySubmissionDto'];
type WeeklySubmissionResponseDto = components['schemas']['WeeklySubmissionResponseDto'];
type WeeklyListResponseDto = components['schemas']['WeeklyListResponseDto'];
type AnomalyDto = components['schemas']['AnomalyDto'];
type AnomalyListResponseDto = components['schemas']['AnomalyListResponseDto'];
type TweakRunDto = components['schemas']['TweakRunDto'];
type TweakRunResponseDto = components['schemas']['TweakRunResponseDto'];
type UpsertWeeklySubmissionDto = components['schemas']['UpsertWeeklySubmissionDto'];

export const weeklyRealAdapter = {
  async upsertSubmission(
    campaignId: string,
    weekStart: string,
    payload: UpsertWeeklySubmissionDto
  ): Promise<WeeklySubmissionResponseDto> {
    const response = await http<ApiResponse<WeeklySubmissionResponseDto>>(`/v1/campaigns/${campaignId}/weekly/${weekStart}`, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  },

  async listSubmissions(campaignId: string): Promise<WeeklySubmissionDto[]> {
    const response = await http<ApiResponse<WeeklyListResponseDto>>(`/v1/campaigns/${campaignId}/weekly`);
    return response.data.submissions;
  },

  async getWeeklySubmission(campaignId: string, weekStart: string): Promise<WeeklySubmissionDto | null> {
    try {
      const response = await http<ApiResponse<WeeklySubmissionDto>>(`/v1/campaigns/${campaignId}/weekly/${weekStart}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async finalizeWeek(campaignId: string, weekStart: string): Promise<void> {
    await http(`/v1/campaigns/${campaignId}/weekly/${weekStart}/finalize`, {
      method: 'POST',
    });
  },

  async listAnomalies(campaignId: string): Promise<AnomalyDto[]> {
    const response = await http<ApiResponse<AnomalyListResponseDto>>(`/v1/campaigns/${campaignId}/anomalies`);
    return response.data.anomalies;
  },

  async getAnomaly(campaignId: string, anomalyId: string): Promise<AnomalyDto> {
    const response = await http<ApiResponse<AnomalyDto>>(`/v1/campaigns/${campaignId}/anomalies/${anomalyId}`);
    return response.data;
  },

  async refreshAnomalies(campaignId: string): Promise<void> {
    await http(`/v1/campaigns/${campaignId}/anomalies/refresh`, {
      method: 'POST',
    });
  },

  async acknowledgeAnomaly(campaignId: string, anomalyId: string): Promise<AnomalyDto> {
    const response = await http<ApiResponse<AnomalyDto>>(`/v1/campaigns/${campaignId}/anomalies/${anomalyId}/ack`, {
      method: 'POST',
    });
    return response.data;
  },

  async resolveAnomaly(campaignId: string, anomalyId: string): Promise<AnomalyDto> {
    const response = await http<ApiResponse<AnomalyDto>>(`/v1/campaigns/${campaignId}/anomalies/${anomalyId}/resolve`, {
      method: 'POST',
    });
    return response.data;
  },

  async generateTweaks(campaignId: string, weekStart: string): Promise<TweakRunResponseDto> {
    const response = await http<ApiResponse<TweakRunResponseDto>>(`/v1/campaigns/${campaignId}/weekly/${weekStart}/tweaks/generate`, {
      method: 'POST',
    });
    return response.data;
  },

  async getTweakRun(campaignId: string, weekStart: string): Promise<TweakRunDto | null> {
    try {
      const response = await http<ApiResponse<TweakRunDto>>(`/v1/campaigns/${campaignId}/weekly/${weekStart}/tweaks/latest`);
      return response.data;
    } catch {
      return null;
    }
  },

  async listTweaks(campaignId: string, weekStart: string): Promise<TweakRunDto> {
    const response = await http<ApiResponse<TweakRunDto>>(`/v1/campaigns/${campaignId}/weekly/${weekStart}/tweaks`);
    return response.data;
  },
};
