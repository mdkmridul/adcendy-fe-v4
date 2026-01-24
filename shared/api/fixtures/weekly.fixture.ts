import type { WeeklySubmission, Anomaly, TweakRun, TweakItem } from '@/shared/types/weekly';

export const mockWeeklySubmission: WeeklySubmission = {
  id: 'weekly-001',
  campaignId: 'campaign-001',
  weekStart: '2024-02-05',
  metrics: {
    impressions: 45000,
    clicks: 2300,
    conversions: 180,
    spend: 1200,
    revenue: 4500,
  },
  createdAt: '2024-02-05T09:00:00Z',
  updatedAt: '2024-02-05T09:00:00Z',
};

export const mockAnomalies: Anomaly[] = [
  {
    id: 'anomaly-001',
    campaignId: 'campaign-001',
    weekStart: '2024-02-05',
    severity: 'MEDIUM',
    metricKey: 'ctr',
    message: 'Click-through rate down 15% from baseline',
    createdAt: '2024-02-05T10:15:00Z',
  },
];

export const mockTweakRun: TweakRun = {
  id: 'tweak-run-001',
  campaignId: 'campaign-001',
  weekStart: '2024-02-05',
  status: 'SUCCEEDED',
  createdAt: '2024-02-05T10:30:00Z',
  updatedAt: '2024-02-05T10:45:00Z',
};

export const mockTweakItems: TweakItem[] = [
  {
    id: 'tweak-001',
    tweakRunId: 'tweak-run-001',
    category: 'ad_copy',
    title: 'Refresh Ad Headlines',
    recommendation: 'Test new value propositions focusing on premium positioning',
    impact: 'MEDIUM',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-002',
    tweakRunId: 'tweak-run-001',
    category: 'targeting',
    title: 'Expand Audience Definition',
    recommendation: 'Include professionals aged 40-50 in lookalike audience',
    impact: 'HIGH',
    status: 'PROPOSED',
  },
];
