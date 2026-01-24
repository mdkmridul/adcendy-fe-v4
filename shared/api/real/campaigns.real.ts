import { http } from '../index';
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '@/shared/types/campaign';
import type { ID } from '@/shared/types/common';

export const campaignsRealAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    return http<Campaign[]>('/campaigns');
  },

  async getCampaign(id: ID): Promise<Campaign> {
    return http<Campaign>(`/campaigns/${id}`);
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    return http<Campaign>('/campaigns', { method: 'POST', body: payload });
  },

  async updateCampaign(id: ID, payload: UpdateCampaignPayload): Promise<Campaign> {
    return http<Campaign>(`/campaigns/${id}`, { method: 'PATCH', body: payload });
  },

  async deleteCampaign(id: ID): Promise<void> {
    await http(`/campaigns/${id}`, { method: 'DELETE' });
  },
};
