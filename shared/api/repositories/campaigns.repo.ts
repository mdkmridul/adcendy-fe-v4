import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '@/shared/types/campaign';
import type { ID } from '@/shared/types/common';
import { campaignsMockAdapter } from '../mock/campaigns.mock';
import { campaignsRealAdapter } from '../real/campaigns.real';
import ENV, { createRuntimeRepositoryAdapter } from '@/lib/env';

// Route to mock or real adapter based on DATA_SOURCE environment variable
const adapter = createRuntimeRepositoryAdapter(campaignsMockAdapter, campaignsRealAdapter);

// Log adapter selection in development
if (ENV.features.apiLogging && typeof window !== 'undefined') {
  console.log('[Campaign Repository] Using adapter:', ENV.API.dataSource);
}

export const campaignsRepository = {
  listCampaigns: async (): Promise<Campaign[]> => adapter.listCampaigns(),
  getCampaign: async (id: ID): Promise<Campaign> => adapter.getCampaign(id),
  createDraftCampaign: async (): Promise<Campaign> => adapter.createDraftCampaign(),
  createCampaign: async (payload: CreateCampaignPayload): Promise<Campaign> =>
    adapter.createCampaign(payload),
  updateCampaign: async (id: ID, payload: UpdateCampaignPayload): Promise<Campaign> =>
    adapter.updateCampaign(id, payload),
  deleteCampaign: async (id: ID): Promise<void> => adapter.deleteCampaign(id),
};
