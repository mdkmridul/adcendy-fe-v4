import type { IntelligenceSnapshot } from '@/shared/types/intelligence';

export const mockIntelligenceSnapshot: IntelligenceSnapshot = {
  id: 'intelligence-001',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-02-05T08:00:00Z',
  updatedAt: '2024-02-05T08:15:00Z',
  summary: {
    bullets: [
      'Google Ads market for fitness services growing 18% YoY in San Francisco Bay Area',
      'Competitor average CPC increased from $1.20 to $1.45 in past 60 days',
      'Seasonal demand peaks February-March, then again August-September',
      'Instagram Reels engagement 3x higher than static posts for fitness content',
      'Premium facility messaging outperforms discount messaging by 45%',
    ],
    sources: [
      {
        source: 'Google Trends',
        fetchedAt: '2024-02-05T07:30:00Z',
      },
      {
        source: 'Semrush Competitor Analysis',
        fetchedAt: '2024-02-05T07:45:00Z',
      },
      {
        source: 'Social Listening',
        fetchedAt: '2024-02-05T08:00:00Z',
      },
    ],
    freshnessNote: 'Data refreshed today',
  },
};
