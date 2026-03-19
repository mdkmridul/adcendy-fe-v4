import type { Campaign } from '@/shared/types/campaign';

export const mockCampaignsList: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'Urban Fitness Center',
    city: 'San Francisco',
    niche: 'Health & Fitness',
    website: 'https://urbanfitness-demo.com',
    businessType: 'SERVICE',
    businessModel: 'B2C',
    marketScope: 'LOCAL',
    status: 'DRAFT',
    currentStep: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'campaign-002',
    name: 'Tech Startup Consulting',
    city: 'New York',
    niche: 'B2B Services',
    website: null,
    businessType: 'SAAS',
    businessModel: 'B2B',
    marketScope: 'NATIONAL',
    status: 'ACTIVE',
    currentStep: 4,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-05T11:15:00Z',
  },
];
