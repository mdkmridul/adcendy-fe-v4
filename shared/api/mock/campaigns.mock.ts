import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload } from '@/shared/types/campaign';
import type { ID } from '@/shared/types/common';

export const mockCampaignState = {
  campaigns: [
    {
      id: 'campaign-001',
      name: 'SaaS Product Launch',
      city: 'San Francisco',
      niche: 'B2B SaaS',
      businessType: 'SAAS',
      businessModel: 'B2B',
      marketScope: 'GLOBAL',
      website: 'https://example-saas.com',
      status: 'DRAFT',
      currentStep: 2,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: 'campaign-002',
      name: 'Local Fitness Studio',
      city: 'Austin',
      niche: 'Fitness',
      businessType: 'SERVICE',
      businessModel: 'B2C',
      marketScope: 'LOCAL',
      website: 'https://fitness-studio.local',
      status: 'ACTIVE',
      currentStep: 4,
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
    return mockCampaignState.campaigns;
  },

  async getCampaign(id: ID): Promise<Campaign> {
    await delay(150);
    const campaign = mockCampaignState.campaigns.find(c => c.id === id);
    if (!campaign) {
      throw new Error(`Campaign ${id} not found`);
    }
    return campaign;
  },

  async createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
    await delay(300);
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: payload.title,
      city: payload.marketLocation,
      niche: '',
      businessType: payload.businessType,
      businessModel: payload.businessModel,
      marketScope: payload.marketScope,
      website: payload.websiteUrl ?? null,
      status: 'DRAFT',
      currentStep: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCampaignState.campaigns.push(campaign);
    return campaign;
  },

  async updateCampaign(id: ID, payload: UpdateCampaignPayload): Promise<Campaign> {
    await delay(250);
    const idx = mockCampaignState.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    const updated = {
      ...mockCampaignState.campaigns[idx],
      ...(payload.title !== undefined ? { name: payload.title } : {}),
      ...(payload.marketLocation !== undefined ? { city: payload.marketLocation } : {}),
      ...(payload.businessType !== undefined ? { businessType: payload.businessType } : {}),
      ...(payload.businessModel !== undefined ? { businessModel: payload.businessModel } : {}),
      ...(payload.marketScope !== undefined ? { marketScope: payload.marketScope } : {}),
      ...(payload.websiteUrl !== undefined ? { website: payload.websiteUrl ?? null } : {}),
      updatedAt: new Date().toISOString(),
    };
    mockCampaignState.campaigns[idx] = updated;
    return updated;
  },

  async deleteCampaign(id: ID): Promise<void> {
    await delay(200);
    const idx = mockCampaignState.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Campaign ${id} not found`);
    }
    mockCampaignState.campaigns.splice(idx, 1);
  },
};

export function setMockCampaignCurrentStep(id: ID, currentStep: number) {
  const idx = mockCampaignState.campaigns.findIndex((campaign) => campaign.id === id);
  if (idx === -1) {
    return;
  }

  mockCampaignState.campaigns[idx] = {
    ...mockCampaignState.campaigns[idx],
    currentStep,
    updatedAt: new Date().toISOString(),
  };
}

export function updateMockCampaignClassification(
  id: ID,
  payload: {
    title?: string;
    marketLocation?: string;
    businessType?: Campaign['businessType'];
    businessModel?: Campaign['businessModel'];
    marketScope?: Campaign['marketScope'];
    websiteUrl?: string | null;
  },
) {
  const idx = mockCampaignState.campaigns.findIndex((campaign) => campaign.id === id);
  if (idx === -1) {
    return;
  }

  mockCampaignState.campaigns[idx] = {
    ...mockCampaignState.campaigns[idx],
    ...(payload.title !== undefined ? { name: payload.title } : {}),
    ...(payload.marketLocation !== undefined ? { city: payload.marketLocation } : {}),
    ...(payload.businessType !== undefined ? { businessType: payload.businessType } : {}),
    ...(payload.businessModel !== undefined ? { businessModel: payload.businessModel } : {}),
    ...(payload.marketScope !== undefined ? { marketScope: payload.marketScope } : {}),
    ...(payload.websiteUrl !== undefined ? { website: payload.websiteUrl ?? null } : {}),
    updatedAt: new Date().toISOString(),
  };
}
