import { http } from '../index';
import type { IntelligenceSnapshot, RefreshSnapshotResponse } from '@/shared/types/intelligence';
import type { ID } from '@/shared/types/common';

export const intelligenceRealAdapter = {
  async getLatestSnapshot(campaignId: ID): Promise<IntelligenceSnapshot | null> {
    try {
      return await http<IntelligenceSnapshot>(`/campaigns/${campaignId}/intelligence/latest`);
    } catch {
      return null;
    }
  },

  async listSnapshots(campaignId: ID): Promise<IntelligenceSnapshot[]> {
    return http<IntelligenceSnapshot[]>(`/campaigns/${campaignId}/intelligence`);
  },

  async getSnapshot(snapshotId: ID): Promise<IntelligenceSnapshot> {
    return http<IntelligenceSnapshot>(`/intelligence/snapshots/${snapshotId}`);
  },

  async refreshSnapshot(campaignId: ID): Promise<RefreshSnapshotResponse> {
    return http<RefreshSnapshotResponse>(`/campaigns/${campaignId}/intelligence/refresh`, {
      method: 'POST',
    });
  },
};
