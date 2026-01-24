import type { IntelligenceSnapshot, RefreshSnapshotResponse } from '@/shared/types/intelligence';
import type { ID } from '@/shared/types/common';
import { intelligenceMockAdapter } from '../mock/intelligence.mock';
import { intelligenceRealAdapter } from '../real/intelligence.real';

import ENV from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = ENV.API.isMock ? intelligenceMockAdapter : intelligenceRealAdapter;

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Intelligence Repository] Using adapter:', ENV.API.dataSource);
}

export const intelligenceRepository = {
  async getLatestSnapshot(campaignId: ID): Promise<IntelligenceSnapshot | null> {
    return adapter.getLatestSnapshot(campaignId);
  },

  async listSnapshots(campaignId: ID): Promise<IntelligenceSnapshot[]> {
    return adapter.listSnapshots(campaignId);
  },

  async getSnapshot(snapshotId: ID): Promise<IntelligenceSnapshot> {
    return adapter.getSnapshot(snapshotId);
  },

  async refreshSnapshot(campaignId: ID): Promise<RefreshSnapshotResponse> {
    return adapter.refreshSnapshot(campaignId);
  },
};
