import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '@/shared/types/campaign';
import type { ID } from '@/shared/types/common';

const mockState = {
  campaigns: [
    {
      id: 'campaign-001',
      name: 'SaaS Product Launch',
      city: 'San Francisco',
      niche: 'B2B SaaS',
      website: 'https://example-saas.com',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: 'campaign-002',
      name: 'Local Fitness Studio',
      city: 'Austin',
      niche: 'Fitness',
      website: 'https://fitness-studio.local',
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-10T16:45:00Z',
    },
  ] as Campaign[],
};

async function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const campaignsMockAdapter = {
  async listCampaigns(): Promise<Campaign[]> {
    await delay(250);
    return mockState.campaigns;
  },

  async getCampaign(id: ID): Promise<Campaign> {
    await delay(150);
    const campaign = mockState.campaigns.find(c => c.id === id);
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`);
    }
    return campaign;
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    await delay(300);
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockState.campaigns.push(campaign);
    return campaign;
  },

  async updateCampaign(id: ID, payload: UpdateCampaignPayload): Promise<Campaign> {
    await delay(250);
    const idx = mockState.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    const updated = {
      ...mockState.campaigns[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    mockState.campaigns[idx] = updated;
    return updated;
  },

  async deleteCampaign(id: ID): Promise<void> {
    await delay(200);
    const idx = mockState.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    mockState.campaigns.splice(idx, 1);
  },
};
