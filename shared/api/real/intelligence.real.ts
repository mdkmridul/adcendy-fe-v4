import { http } from '../index';
import type { ApiResponse } from '../types';
import type {
  IntelligenceSnapshot,
  RefreshSnapshotResponse,
} from '@/shared/types/intelligence';

interface SnapshotListResponse {
  snapshots: IntelligenceSnapshot[];
}

export const intelligenceRealAdapter = {
  async getLatestSnapshot(campaignId: string): Promise<IntelligenceSnapshot | null> {
    try {
      const response = await http<ApiResponse<IntelligenceSnapshot>>(`/v1/campaigns/${campaignId}/snapshots/latest`);
      return response.data;
    } catch {
      return null;
    }
  },

  async listSnapshots(campaignId: string): Promise<IntelligenceSnapshot[]> {
    const response = await http<ApiResponse<SnapshotListResponse>>(`/v1/campaigns/${campaignId}/snapshots`);
    return response.data.snapshots;
  },

  async getSnapshot(snapshotId: string): Promise<IntelligenceSnapshot> {
    const response = await http<ApiResponse<IntelligenceSnapshot>>(`/v1/intelligence/snapshots/${snapshotId}`);
    return response.data;
  },

  async refreshSnapshot(campaignId: string): Promise<RefreshSnapshotResponse> {
    const response = await http<ApiResponse<RefreshSnapshotResponse>>(`/v1/campaigns/${campaignId}/intelligence/serp/refresh`, {
      method: 'POST',
    });
    return response.data;
  },
};
