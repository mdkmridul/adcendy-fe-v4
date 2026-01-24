export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  lastUpdated: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-001',
    name: 'SaaS Market Expansion Q1',
    description: 'Competitive analysis for cloud software market entry',
    status: 'active',
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'campaign-002',
    name: 'AI Infrastructure Intelligence',
    description: 'Market signals and trend analysis for AI infrastructure',
    status: 'draft',
    createdAt: '2024-01-18',
    lastUpdated: '2024-01-18',
  },
];
