import type { IntelligenceSnapshot, RefreshSnapshotResponse } from '@/shared/types/intelligence';
import type { ID } from '@/shared/types/common';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const mockSnapshots = new Map<ID, IntelligenceSnapshot & { __pollCount?: number }>();
mockSnapshots.set('snapshot-001', {
  id: 'snapshot-001',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-02-10T08:00:00Z',
  updatedAt: '2024-02-10T08:45:00Z',
  summary: {
    bullets: [
      'MarketWatch reports 23% YoY growth in B2B SaaS segment',
      'New competitor entered market with AI-powered alternative',
      'Enterprise buyers prioritizing ROI transparency in budget cuts',
      'Consolidation trend: 5 major acquisitions last quarter',
    ],
    sources: [
      {
        source: 'TechCrunch',
        fetchedAt: '2024-02-10T08:15:00Z',
      },
      {
        source: 'Industry Report',
        fetchedAt: '2024-02-10T08:20:00Z',
      },
      {
        source: 'LinkedIn News',
        fetchedAt: '2024-02-10T08:25:00Z',
      },
    ],
    freshnessNote: 'Last updated 2 days ago. Refresh for latest market signals.',
  },
  ttlHours: 48,
});

mockSnapshots.set('snapshot-002', {
  id: 'snapshot-002',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-02-05T14:30:00Z',
  updatedAt: '2024-02-05T15:15:00Z',
  summary: {
    bullets: [
      'Q1 budget cycles driving 32% increase in enterprise software evaluation',
      'Competitor pricing analysis: 2 major players reduced entry-level pricing',
      'Search trends show rising interest in "automation" and "AI workflow"',
      'Industry conferences scheduled for March may impact buying decisions',
    ],
    sources: [
      {
        source: 'SERP',
        fetchedAt: '2024-02-05T14:45:00Z',
      },
      {
        source: 'Meta Ads Library',
        fetchedAt: '2024-02-05T14:50:00Z',
      },
      {
        source: 'Industry Reports',
        fetchedAt: '2024-02-05T15:00:00Z',
      },
    ],
    freshnessNote: 'Historical snapshot from last week',
  },
  ttlHours: 48,
});

mockSnapshots.set('snapshot-003', {
  id: 'snapshot-003',
  campaignId: 'campaign-001',
  status: 'SUCCEEDED',
  createdAt: '2024-01-28T09:00:00Z',
  updatedAt: '2024-01-28T09:42:00Z',
  summary: {
    bullets: [
      'Post-holiday slowdown: 18% decrease in enterprise engagement',
      'New regulations in EU affecting data processing tools',
      'Competitor launched free tier attracting 10k signups in first week',
      'LinkedIn engagement with B2B SaaS content up 25% vs December',
    ],
    sources: [
      {
        source: 'SERP',
        fetchedAt: '2024-01-28T09:15:00Z',
      },
      {
        source: 'Amazon Product Ads',
        fetchedAt: '2024-01-28T09:20:00Z',
      },
    ],
    freshnessNote: 'Older snapshot - consider refreshing',
  },
  ttlHours: 48,
});

export const intelligenceMockAdapter = {
  async getLatestSnapshot(campaignId: ID): Promise<IntelligenceSnapshot | null> {
    await delay(150);
    const snapshots = Array.from(mockSnapshots.values())
      .filter(s => s.campaignId === campaignId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (snapshots.length === 0) return null;

    const latest = snapshots[0];

    // Simulate RUNNING -> SUCCEEDED transition for polling
    const pollCount = (latest as any).__pollCount || 0;
    (latest as any).__pollCount = pollCount + 1;

    if (pollCount >= 2 && latest.status === 'RUNNING') {
      const updated: IntelligenceSnapshot = {
        ...latest,
        status: 'SUCCEEDED',
        updatedAt: new Date().toISOString(),
        summary: {
          bullets: [
            'Market showing 18% growth in B2B SaaS automation tools',
            'Competitor analysis: 3 new AI-powered alternatives launched this quarter',
            'Industry trend: Enterprise buyers prioritizing integration capabilities',
            'Price sensitivity decreased 12% vs last quarter among target segment',
          ],
          sources: [
            { source: 'SERP', fetchedAt: new Date().toISOString() },
            { source: 'Meta Ads Library', fetchedAt: new Date().toISOString() },
            { source: 'Industry Reports', fetchedAt: new Date().toISOString() },
          ],
          freshnessNote: 'Data refreshed successfully',
        },
        ttlHours: 48,
      };
      mockSnapshots.set(latest.id, updated);
      return updated;
    }

    return latest;
  },

  async listSnapshots(campaignId: ID): Promise<IntelligenceSnapshot[]> {
    await delay(150);
    return Array.from(mockSnapshots.values())
      .filter(s => s.campaignId === campaignId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getSnapshot(snapshotId: ID): Promise<IntelligenceSnapshot> {
    await delay(150);
    const snapshot = mockSnapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    // Simulate RUNNING -> SUCCEEDED transition for polling
    const pollCount = (snapshot as any).__pollCount || 0;
    (snapshot as any).__pollCount = pollCount + 1;

    if (pollCount >= 2 && snapshot.status === 'RUNNING') {
      const updated: IntelligenceSnapshot = {
        ...snapshot,
        status: 'SUCCEEDED',
        updatedAt: new Date().toISOString(),
        summary: {
          bullets: [
            'Market showing 18% growth in B2B SaaS automation tools',
            'Competitor analysis: 3 new AI-powered alternatives launched this quarter',
            'Industry trend: Enterprise buyers prioritizing integration capabilities',
            'Price sensitivity decreased 12% vs last quarter among target segment',
          ],
          sources: [
            { source: 'SERP', fetchedAt: new Date().toISOString() },
            { source: 'Meta Ads Library', fetchedAt: new Date().toISOString() },
            { source: 'Industry Reports', fetchedAt: new Date().toISOString() },
          ],
          freshnessNote: 'Data refreshed successfully',
        },
        ttlHours: 48,
      };
      mockSnapshots.set(snapshotId, updated);
      return updated;
    }

    return snapshot;
  },

  async refreshSnapshot(campaignId: ID): Promise<RefreshSnapshotResponse> {
    await delay(300);
    const runId = `run-${Date.now()}`;
    const snapshotId = `snapshot-${Date.now()}`;

    // Create new snapshot for this campaign in RUNNING state initially
    const newSnapshot: IntelligenceSnapshot & { __pollCount?: number } = {
      id: snapshotId,
      campaignId,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: {
        bullets: [
          'Scanning market trends...',
          'Analyzing competitor activity...',
          'Gathering industry signals...',
        ],
        sources: [
          {
            source: 'Market Data API',
            fetchedAt: new Date().toISOString(),
          },
        ],
        freshnessNote: 'Refreshing...',
      },
      __pollCount: 0,
    };

    mockSnapshots.set(snapshotId, newSnapshot);

    return {
      runId,
      snapshotId,
    };
  },
};
