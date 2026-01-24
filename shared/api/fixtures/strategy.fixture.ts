import type { StrategyVersion, StrategyRun } from '@/shared/types/strategy';

export const mockStrategyLatest: StrategyVersion = {
  id: 'strategy-version-001',
  campaignId: 'campaign-001',
  version: 1,
  createdAt: '2024-01-20T14:30:00Z',
  sections: [
    {
      key: 'executive_summary',
      title: 'Executive Summary',
      content: {
        overview: 'Market analysis shows strong demand in premium fitness segment',
        keyFindings: [
          'Market growing at 12% YoY',
          'Competition moderate in target area',
          'Premium positioning recommended',
        ],
      },
    },
    {
      key: 'target_audience',
      title: 'Target Audience Analysis',
      content: {
        demographics: 'Ages 25-45, household income $75k+',
        psychographics: 'Health-conscious, tech-savvy professionals',
        behaviors: 'Active on social media, value convenience',
      },
    },
    {
      key: 'competitive_landscape',
      title: 'Competitive Landscape',
      content: {
        directCompetitors: 3,
        marketShare: 'Room for differentiation with niche offerings',
        opportunities: [
          'Corporate wellness partnerships',
          'Boutique class offerings',
          'Digital fitness integration',
        ],
      },
    },
  ],
};

export const mockStrategyRun: StrategyRun = {
  id: 'strategy-run-001',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-01-20T14:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
};
