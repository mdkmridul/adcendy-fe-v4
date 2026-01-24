import { http } from '../index';
import type { components } from '@/src/generated/openapi';
import type { ApiResponse } from '../types';

type SnapshotDto = components['schemas']['SnapshotDto'];
type SnapshotListResponseDto = components['schemas']['SnapshotListResponseDto'];

export const intelligenceRealAdapter = {
  async getLatestSnapshot(campaignId: string): Promise<SnapshotDto | null> {
    try {
      const response = await http<ApiResponse<SnapshotDto>>(`/v1/campaigns/${campaignId}/snapshots/latest`);
      return response.data;
    } catch {
      return null;
    }
  },

  async listSnapshots(campaignId: string): Promise<SnapshotDto[]> {
    const response = await http<ApiResponse<SnapshotListResponseDto>>(`/v1/campaigns/${campaignId}/snapshots`);
    return response.data.snapshots;
  },

  async getSnapshot(snapshotId: string): Promise<SnapshotDto> {
    const response = await http<ApiResponse<SnapshotDto>>(`/v1/intelligence/snapshots/${snapshotId}`);
    return response.data;
  },

  async refreshSnapshot(campaignId: string): Promise<{ message: string }> {
    const response = await http<ApiResponse<{ message: string }>>(`/v1/campaigns/${campaignId}/intelligence/serp/refresh`, {
      method: 'POST',
    });
    return response.data;
  },
};
