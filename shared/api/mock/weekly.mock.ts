import type { WeeklySubmission, WeeklyProcessingRun, DerivedMetricsSummary, Anomaly, TweakRun, TweakItem, UpsertWeeklySubmissionPayload, UpdateTweakStatusPayload } from '@/shared/types/weekly';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mockSubmissions: WeeklySubmission[] = [
  {
    id: 'weekly-001',
    campaignId: 'campaign-001',
    weekStart: '2024-02-12',
    metrics: {
      spend: 2500,
      impressions: 45000,
      clicks: 2100,
      leads: 125,
      purchases: 12,
      revenue: 3600,
    },
    createdAt: '2024-02-13T10:00:00Z',
    updatedAt: '2024-02-13T10:00:00Z',
  },
  {
    id: 'weekly-002',
    campaignId: 'campaign-001',
    weekStart: '2024-02-19',
    metrics: {
      spend: 2800,
      impressions: 48000,
      clicks: 1950,
      leads: 110,
      purchases: 14,
      revenue: 4200,
    },
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
];

const mockProcessingRuns = new Map<ID, WeeklyProcessingRun & { __pollCount?: number }>();

const mockAnomalies: Anomaly[] = [
  {
    id: 'anomaly-001',
    campaignId: 'campaign-001',
    weekStart: '2024-02-12',
    severity: 'HIGH',
    metricKey: 'cpl',
    message: 'Cost per lead increased by 35% compared to previous week',
    createdAt: '2024-02-13T11:00:00Z',
  },
  {
    id: 'anomaly-002',
    campaignId: 'campaign-001',
    weekStart: '2024-02-12',
    severity: 'MEDIUM',
    metricKey: 'ctr',
    message: 'Click-through rate dropped 15% vs. previous week',
    createdAt: '2024-02-13T11:00:00Z',
  },
  {
    id: 'anomaly-003',
    campaignId: 'campaign-001',
    weekStart: '2024-02-12',
    severity: 'LOW',
    metricKey: 'impressions',
    message: 'Impressions slightly below target (45k vs 50k expected)',
    createdAt: '2024-02-13T11:00:00Z',
  },
  {
    id: 'anomaly-004',
    campaignId: 'campaign-001',
    weekStart: '2024-02-19',
    severity: 'MEDIUM',
    metricKey: 'cvr',
    message: 'Conversion rate declined by 12% from last week',
    createdAt: '2024-02-20T11:00:00Z',
  },
  {
    id: 'anomaly-005',
    campaignId: 'campaign-001',
    weekStart: '2024-02-19',
    severity: 'LOW',
    metricKey: 'clicks',
    message: 'Clicks lower than expected despite increased spend',
    createdAt: '2024-02-20T11:00:00Z',
  },
];

const mockTweakRuns = new Map<string, TweakRun & { __pollCount?: number }>();
mockTweakRuns.set('tweak-run-001', {
  id: 'tweak-run-001',
  campaignId: 'campaign-001',
  weekStart: '2024-02-12',
  status: 'SUCCEEDED',
  createdAt: '2024-02-13T12:00:00Z',
  updatedAt: '2024-02-13T12:30:00Z',
});

const mockTweaks: TweakItem[] = [
  {
    id: 'tweak-001',
    tweakRunId: 'tweak-run-001',
    category: 'Ad Copy',
    title: 'Refresh headline messaging',
    recommendation: 'Test new headline: "Enterprise-Grade Market Intelligence" to improve CTR and appeal to decision-makers.',
    impact: 'HIGH',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-002',
    tweakRunId: 'tweak-run-001',
    category: 'Audience',
    title: 'Expand audience targeting',
    recommendation: 'Add lookalike audiences based on best converting segments to reach similar high-value prospects.',
    impact: 'MEDIUM',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-003',
    tweakRunId: 'tweak-run-001',
    category: 'Bidding',
    title: 'Optimize bid strategy',
    recommendation: 'Switch to target ROAS bidding with 400% target to improve efficiency while maintaining lead volume.',
    impact: 'HIGH',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-004',
    tweakRunId: 'tweak-run-001',
    category: 'Ad Creative',
    title: 'Test video ad formats',
    recommendation: 'Create 15-second video ads highlighting key benefits and social proof to increase engagement.',
    impact: 'MEDIUM',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-005',
    tweakRunId: 'tweak-run-001',
    category: 'Landing Page',
    title: 'A/B test CTA placement',
    recommendation: 'Test moving primary CTA above the fold and adding urgency messaging to improve conversion rate.',
    impact: 'LOW',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-006',
    tweakRunId: 'tweak-run-001',
    category: 'Schedule',
    title: 'Adjust ad scheduling',
    recommendation: 'Increase bids during 9am-5pm weekdays when CPL is 25% lower and leads convert better.',
    impact: 'MEDIUM',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-007',
    tweakRunId: 'tweak-run-001',
    category: 'Keywords',
    title: 'Negative keyword expansion',
    recommendation: 'Add 15 new negative keywords identified from search term report to reduce wasted spend.',
    impact: 'LOW',
    status: 'PROPOSED',
  },
  {
    id: 'tweak-008',
    tweakRunId: 'tweak-run-001',
    category: 'Budget',
    title: 'Reallocate budget to top performers',
    recommendation: 'Shift 20% of budget from underperforming ad groups to top 3 performing segments.',
    impact: 'HIGH',
    status: 'PROPOSED',
  },
];

function computeDerivedMetrics(submission: WeeklySubmission): DerivedMetricsSummary {
  const { spend, impressions, clicks, leads, purchases, revenue } = submission.metrics;

  const derived: DerivedMetricsSummary['derived'] = {};

  if (impressions > 0) {
    derived.ctr = clicks / impressions;
  }

  if (leads > 0) {
    derived.cpl = spend / leads;
  }

  if (clicks > 0) {
    derived.cvr = leads / clicks;
  }

  if (spend > 0 && revenue !== undefined) {
    derived.roas = revenue / spend;
  }

  if (spend > 0 && purchases !== undefined && purchases > 0) {
    derived.cpa = spend / purchases;
  }

  return {
    campaignId: submission.campaignId,
    weekStart: submission.weekStart,
    inputs: {
      spend,
      impressions,
      clicks,
      leads,
      purchases,
      revenue,
    },
    derived,
    notes: ['Derived metrics computed from submission data'],
  };
}

export const weeklyMockAdapter = {
  async upsertSubmission(
    campaignId: ID,
    weekStart: string,
    payload: UpsertWeeklySubmissionPayload
  ): Promise<{ weeklySubmission: WeeklySubmission; processingRunId: ID }> {
    await delay(250);

    // Find or create submission
    let existing = mockSubmissions.find(s => s.campaignId === campaignId && s.weekStart === weekStart);
    if (existing) {
      existing.metrics = payload.metrics;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newSubmission: WeeklySubmission = {
        id: `weekly-${Date.now()}`,
        campaignId,
        weekStart,
        metrics: payload.metrics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockSubmissions.push(newSubmission);
      existing = newSubmission;
    }

    // Create processing run
    const processingRunId = `processing-run-${Date.now()}`;
    const processingRun: WeeklyProcessingRun & { __pollCount?: number } = {
      id: processingRunId,
      campaignId,
      weekStart,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __pollCount: 0,
    };
    mockProcessingRuns.set(processingRunId, processingRun);

    return {
      weeklySubmission: existing,
      processingRunId,
    };
  },

  async listSubmissions(campaignId: ID): Promise<WeeklySubmission[]> {
    await delay(200);
    return mockSubmissions.filter(s => s.campaignId === campaignId).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  },

  async getWeeklySubmission(campaignId: ID, weekStart: string): Promise<WeeklySubmission | null> {
    await delay(150);
    const submission = mockSubmissions.find(s => s.campaignId === campaignId && s.weekStart === weekStart);
    return submission || null;
  },

  async getProcessingRun(processingRunId: ID): Promise<WeeklyProcessingRun> {
    await delay(150);
    const run = mockProcessingRuns.get(processingRunId);
    if (!run) {
      throw new Error(`Processing run ${processingRunId} not found`);
    }

    // Simulate transition: RUNNING (1-2 polls) -> SUCCEEDED (3+ polls)
    const pollCount = (run as any).__pollCount || 0;
    (run as any).__pollCount = pollCount + 1;

    if (pollCount >= 2 && run.status === 'RUNNING') {
      run.status = 'SUCCEEDED';
      run.updatedAt = new Date().toISOString();
    }

    return run;
  },

  async getDerivedSummary(campaignId: ID, weekStart: string): Promise<DerivedMetricsSummary> {
    await delay(150);
    const submission = mockSubmissions.find(s => s.campaignId === campaignId && s.weekStart === weekStart);
    if (!submission) {
      throw new Error(`No submission found for ${campaignId} week ${weekStart}`);
    }
    return computeDerivedMetrics(submission);
  },

  async listAnomalies(campaignId: ID, weekStart?: string): Promise<Anomaly[]> {
    await delay(150);
    return mockAnomalies.filter(a => a.campaignId === campaignId && (!weekStart || a.weekStart === weekStart));
  },

  async startTweakRun(campaignId: ID, weekStart: string): Promise<{ tweakRunId: ID }> {
    await delay(250);

    const tweakRunId = `tweak-run-${Date.now()}`;
    const tweakRun: TweakRun & { __pollCount?: number } = {
      id: tweakRunId,
      campaignId,
      weekStart,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __pollCount: 0,
    };
    mockTweakRuns.set(tweakRunId, tweakRun);

    // Create mock tweak items for this run
    const categories = ['Ad Copy', 'Audience', 'Bidding', 'Ad Creative', 'Landing Page', 'Schedule', 'Keywords', 'Budget'];
    const impacts: Array<'LOW' | 'MEDIUM' | 'HIGH'> = ['LOW', 'MEDIUM', 'HIGH'];

    for (let i = 0; i < 8; i++) {
      const newTweak: TweakItem = {
        id: `tweak-${tweakRunId}-${i + 1}`,
        tweakRunId,
        category: categories[i % categories.length],
        title: `${categories[i % categories.length]} optimization ${i + 1}`,
        recommendation: `Recommendation for ${categories[i % categories.length].toLowerCase()} improvement based on week ${weekStart} performance.`,
        impact: impacts[i % 3],
        status: 'PROPOSED',
      };
      mockTweaks.push(newTweak);
    }

    return { tweakRunId };
  },

  async getTweakRun(campaignId: ID, weekStart: string): Promise<TweakRun | null> {
    await delay(150);
    const run = Array.from(mockTweakRuns.values()).find(r => r.campaignId === campaignId && r.weekStart === weekStart);
    return run || null;
  },

  async getTweakRunById(tweakRunId: ID): Promise<TweakRun> {
    await delay(150);
    const run = mockTweakRuns.get(tweakRunId);
    if (!run) {
      throw new Error(`Tweak run ${tweakRunId} not found`);
    }

    // Simulate transition: RUNNING (1-2 polls) -> SUCCEEDED (3+ polls)
    const pollCount = run.__pollCount || 0;
    run.__pollCount = pollCount + 1;

    if (pollCount >= 2 && run.status === 'RUNNING') {
      run.status = 'SUCCEEDED';
      run.updatedAt = new Date().toISOString();
    }

    return run;
  },

  async listTweaks(tweakRunId: ID, visibility?: 'ALL' | 'APPROVED_ONLY'): Promise<TweakItem[]> {
    await delay(150);
    let tweaks = mockTweaks.filter(t => t.tweakRunId === tweakRunId);

    if (visibility === 'APPROVED_ONLY') {
      tweaks = tweaks.filter(t => t.status === 'APPROVED');
    }

    return tweaks;
  },

  async updateTweakStatus(tweakItemId: ID, payload: UpdateTweakStatusPayload): Promise<TweakItem> {
    await delay(150);
    const tweak = mockTweaks.find(t => t.id === tweakItemId);
    if (!tweak) {
      throw new Error(`Tweak ${tweakItemId} not found`);
    }
    tweak.status = payload.status;
    if (payload.reviewerNote !== undefined) {
      tweak.reviewerNote = payload.reviewerNote;
    }
    return { ...tweak };
  },
};
